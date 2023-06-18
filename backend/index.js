const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = 3001;
require("dotenv").config();

const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER, //이메일 주소
      pass: process.env.GMAIL_PASS,
    },
  });

  const mailOptions = {
    from: "CNU_RentalCar@CNUrental.com", // sender address
    to: email, // receiver address
    subject: subject, // Subject line
    text: text, // plain text body
  };

  return transporter.sendMail(mailOptions);
};

app.use(bodyParser.json());
app.use(cors());

const getConnection = require("./dbConfig");

app.post("/login", async (req, res) => {
  const { cno, passwd } = req.body; // 받은 요청의 바디에서 cno와 password를 추출

  if (!cno || !passwd) {
    // cno와 password가 제공되지 않았다면 오류 응답
    return res.status(400).json({ error: "cno and password must be provided" });
  }

  let connection;

  try {
    connection = await getConnection();

    // 사용자 정보를 조회하는 쿼리를 실행
    const result = await connection.execute(
      `SELECT * FROM CUSTOMER WHERE CNO = :cno AND passwd = :passwd`,
      { cno, passwd }
    );

    if (result.rows.length === 0) {
      // 조회 결과가 없다면 cno 또는 password가 잘못되었음
      return res.status(401).json({ error: "Invalid cno or password" });
    }

    // 인증 성공
    const user = result.rows[0];
    const name = user[1];
    const email = user[3];
    res
      .status(200)
      .json({ message: "Logged in successfully", name: name, email: email });
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
});

app.post("/search", async (req, res) => {
  const { userVehicleType, userStartTime, userEndTime } = req.body; // 받은 요청의 바디에서 cno와 password를 추출

  if (!userVehicleType || !userStartTime || !userEndTime) {
    return res.status(400).json({
      error:
        "userVehicleType and userStartTime and userEndTime must be provided",
    });
  }

  let connection;

  try {
    connection = await getConnection();

    const vehicleTypeConditions = userVehicleType
      .map((type) => `c.VEHICLETYPE = '${type}'`)
      .join(" OR ");

    // 사용자 정보를 조회하는 쿼리를 실행
    const result = await connection.execute(
      `
    SELECT c.MODELNAME, c.VEHICLETYPE, c.FUEL, c.NUMBEROFSEATS, LISTAGG(o.OPTIONNAME, ', ') WITHIN GROUP (ORDER BY o.OPTIONNAME) AS OPTIONS, r.LICENSEPLATENO, c.RENTRATEPERDAY
    FROM CarModel c
    JOIN RentCar r ON c.MODELNAME = r.MODELNAME
    JOIN Options o ON r.LICENSEPLATENO = o.LICENSEPLATENO
    WHERE (${vehicleTypeConditions})
    AND NOT EXISTS (
      SELECT 1 
      FROM RentCar rc
      WHERE rc.LICENSEPLATENO = r.LICENSEPLATENO 
        AND (
          (rc.DATERENTED <= TO_DATE('${userStartTime}', 'YYYY-MM-DD') AND rc.DATEDUE > TO_DATE('${userStartTime}', 'YYYY-MM-DD')) 
          OR (rc.DATERENTED < TO_DATE('${userEndTime}', 'YYYY-MM-DD') AND rc.DATEDUE >= TO_DATE('${userEndTime}', 'YYYY-MM-DD'))
          OR (rc.DATERENTED >= TO_DATE('${userStartTime}', 'YYYY-MM-DD') AND rc.DATEDUE <= TO_DATE('${userEndTime}', 'YYYY-MM-DD'))
        )
    )
    AND NOT EXISTS (
      SELECT 1 
      FROM Reserve re
      WHERE re.LICENSEPLATENO = r.LICENSEPLATENO
        AND (
          (re.STARTDATE <= TO_DATE('${userStartTime}', 'YYYY-MM-DD') AND re.ENDDATE > TO_DATE('${userStartTime}', 'YYYY-MM-DD')) 
          OR (re.STARTDATE < TO_DATE('${userEndTime}', 'YYYY-MM-DD') AND re.ENDDATE >= TO_DATE('${userEndTime}', 'YYYY-MM-DD'))
          OR (re.STARTDATE >= TO_DATE('${userStartTime}', 'YYYY-MM-DD') AND re.ENDDATE <= TO_DATE('${userEndTime}', 'YYYY-MM-DD'))
        )
    )
    GROUP BY c.MODELNAME, c.VEHICLETYPE, c.FUEL, c.NUMBEROFSEATS, r.LICENSEPLATENO, c.RENTRATEPERDAY`
    );

    const ret = result.rows.map((v) => {
      return {
        licenseplateno: v[5],
        modelname: v[0],
        vehicletype: v[1],
        fuel: v[2],
        numberofseats: v[3],
        options: v[4],
        rentrateperday: v[6],
      };
    });
    res.status(200).json({ result: ret });
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
});

app.post("/rent", async (req, res) => {
  const { cno, licenseplateno, start, end } = req.body;
  if (!cno || !licenseplateno || !start || !end) {
    return res.status(400).json({ error: "Required fields must be provided" });
  }

  let connection;

  try {
    connection = await getConnection();

    const existingReservations = await connection.execute(
      `SELECT * FROM reserve WHERE 
      cno = '${cno}' AND
      ((TO_DATE('${start}', 'YYYY-MM-DD') >= startdate AND TO_DATE('${start}', 'YYYY-MM-DD') <= enddate) OR
      (TO_DATE('${end}', 'YYYY-MM-DD') >= startdate AND TO_DATE('${end}', 'YYYY-MM-DD') <= enddate))`
    );

    if (existingReservations.rows && existingReservations.rows.length > 0) {
      return res.status(400).json({
        error:
          "There is already a reservation for this user within the selected date range.",
      });
    }

    await connection.execute(
      `INSERT INTO reserve
      (licenseplateno, startdate, reservedate, enddate, cno)
      VALUES
      ('${licenseplateno}', TO_DATE('${start}', 'YYYY-MM-DD'), SYSDATE + 1, TO_DATE('${end}', 'YYYY-MM-DD'), '${cno}')`
    );

    await connection.execute("commit");

    res.status(200).json({ message: "Reservation has been made successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
});

app.post("/reservelist", async (req, res) => {
  const { cno } = req.body;
  if (!cno) {
    return res.status(400).json({ error: "Required field must be provided" });
  }

  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT 
      cm.MODELNAME, 
      rc.LICENSEPLATENO, 
      cm.VEHICLETYPE, 
      cm.FUEL, 
      cm.NUMBEROFSEATS, 
      res.STARTDATE, 
      res.ENDDATE
    FROM 
      reserve res
    JOIN 
      rentcar rc ON res.LICENSEPLATENO = rc.LICENSEPLATENO
    JOIN 
      carmodel cm ON rc.MODELNAME = cm.MODELNAME
    WHERE 
      res.CNO = '${cno}'`
    );

    const ret = result.rows.map((v) => {
      return {
        modelname: v[0],
        licenseplateno: v[1],
        vehicletype: v[2],
        fuel: v[3],
        numberofseats: v[4],
        startDate: v[5],
        endDate: v[6],
      };
    });

    res.status(200).json({ result: ret });
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
});

app.post("/cancel", async (req, res) => {
  const { cno, licenseplateno, startDate, endDate } = req.body;
  if (!cno || !licenseplateno || !startDate || !endDate) {
    return res.status(400).json({ error: "Required field must be provided" });
  }

  let connection;

  try {
    connection = await getConnection();

    await connection.execute(
      `DELETE FROM reserve
    WHERE 
      CNO = '${cno}'
      AND LICENSEPLATENO = '${licenseplateno}'
      AND STARTDATE = TO_DATE('${startDate}', 'YYYY-MM-DD')
      AND ENDDATE = TO_DATE('${endDate}', 'YYYY-MM-DD')
    `
    );

    await connection.execute("commit");

    res.status(200).json({
      message: "Reservation has been successfully canceled",
    });
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
});

const cron = require("node-cron");
cron.schedule("* * * * *", async function () {
  let connection;

  try {
    connection = await getConnection();

    // 오늘의 예약된 차량 정보를 가져옴
    const result = await connection.execute(`
    SELECT LICENSEPLATENO, STARTDATE, ENDDATE, CNO
    FROM reserve
    WHERE TO_DATE(STARTDATE, 'yy/mm/dd') = TRUNC(SYSDATE)
    `);

    const reservations = result.rows;

    for (let res of reservations) {
      // 해당 차량의 대여 정보를 업데이트
      await connection.execute(
        `
        UPDATE rentcar 
        SET DATERENTED = '${res.STARTDATE}', DATEDUE = '${res.ENDDATE}', CNO = '${res.CNO}'
        WHERE LICENSEPLATENO = '${res.LICENSEPLATENO}'
      `
      );
    }

    // 처리된 예약은 삭제
    await connection.execute(`
      DELETE FROM reserve WHERE STARTDATE = CURRENT_DATE
    `);

    // 종료된 대여에 대해
    const resultRentEnded = await connection.execute(`
    SELECT r.LICENSEPLATENO, r.DATERENTED, r.DATEDUE, r.CNO, c.RENTRATEPERDAY
    FROM rentcar r JOIN carmodel c ON r.MODELNAME = c.MODELNAME
    WHERE r.DATEDUE < SYSDATE
    `);

    const rentEnded = resultRentEnded.rows;
    for (let rent of rentEnded) {
      // Calculate the payment
      const payment =
        Math.floor(
          (new Date(rent[2]) - new Date(rent[1])) / (1000 * 60 * 60 * 24) + 1
        ) * rent[4];
      // Move the rent to the previousrental table
      await connection.execute(
        `
        INSERT INTO previousrental (LICENSEPLATENO, DATERENTED, DATERETURNED, PAYMENT, CNO)
VALUES ('${rent[0]}', TO_DATE('${
          rent[1].toISOString().split("T")[0]
        }', 'YYYY-MM-DD HH24:MI:SS'), TO_DATE('${
          rent[2].toISOString().split("T")[0]
        }', 'YYYY-MM-DD HH24:MI:SS'), ${payment}, '${rent[3]}')

        `
      );

      // Set the datedue, daterented, and cno to NULL in the rentcar table
      await connection.execute(
        `
        UPDATE rentcar
        SET DATERENTED = NULL, DATEDUE = NULL, CNO = NULL
        WHERE LICENSEPLATENO = '${rent[0]}'
        `
      );
    }

    // 모든 쿼리의 작업이 완료되면 커밋
    await connection.execute("commit");

    console.log("Auto-rent process completed!");
  } catch (err) {
    console.error(err);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
});

app.post("/rentallist", async (req, res) => {
  const { cno } = req.body;
  if (!cno) {
    return res.status(400).json({ error: "Required field must be provided" });
  }

  let connection;

  try {
    connection = await getConnection();

    const result1 = await connection.execute(
      `SELECT 
      rc.LICENSEPLATENO, 
      cm.MODELNAME, 
      cm.VEHICLETYPE, 
      cm.RENTRATEPERDAY, 
      cm.FUEL, 
      cm.NUMBEROFSEATS, 
      rc.DATERENTED, 
      rc.DATEDUE
      FROM 
      Rentcar rc
      JOIN 
      CarModel cm ON rc.MODELNAME = cm.MODELNAME
      WHERE 
      rc.CNO = '${cno}'`
    );
    const curRent = result1.rows.map((v) => {
      return {
        licenseplateno: v[0],
        modelname: v[1],
        vehicletype: v[2],
        rentrateperday: v[3],
        fuel: v[4],
        numberofseats: v[5],
        startDate: v[6],
        endDate: v[7],
      };
    });

    const result2 = await connection.execute(
      `SELECT 
      pr.LICENSEPLATENO, 
      pr.DATERENTED, 
      pr.DATERETURNED, 
      pr.PAYMENT, 
      cm.MODELNAME, 
      cm.VEHICLETYPE, 
      cm.FUEL, 
      cm.NUMBEROFSEATS
      FROM 
      previousrental pr
      JOIN 
      Rentcar rc ON pr.LICENSEPLATENO = rc.LICENSEPLATENO
      JOIN 
      CarModel cm ON rc.MODELNAME = cm.MODELNAME
      WHERE 
      pr.CNO = '${cno}'`
    );

    const preRent = result2.rows.map((v) => {
      return {
        licenseplateno: v[0],
        startDate: v[1],
        endDate: v[2],
        payment: v[3],
        modelname: v[4],
        vehicletype: v[5],
        fuel: v[6],
        numberofseats: v[7],
      };
    });

    res.status(200).json({ curRent, preRent });
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
});

app.post("/return", async (req, res) => {
  const { cno, licenseplateno, startDate, endDate } = req.body;
  if (!cno || !licenseplateno || !startDate || !endDate) {
    return res.status(400).json({ error: "Required field must be provided" });
  }

  let connection;

  try {
    connection = await getConnection();

    // Getting MODELNAME from RENTCAR and RENTRATEPERDAY from CARMODEL
    const result = await connection.execute(
      `SELECT cm.RENTRATEPERDAY
       FROM RENTCAR rc
       JOIN CARMODEL cm ON rc.MODELNAME = cm.MODELNAME
       WHERE rc.LICENSEPLATENO = '${licenseplateno}'`
    );

    const rentrate = result.rows[0];
    const rentrateperday = rentrate[0];
    // Calculate payment
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    const diffTime = Math.abs(endDateObj - startDateObj);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const payment = (diffDays + 1) * rentrateperday;

    // Update RENTCAR
    await connection.execute(
      `UPDATE RENTCAR
       SET DATERENTED = NULL, DATEDUE = NULL, CNO = NULL
       WHERE 
       LICENSEPLATENO = '${licenseplateno}'
       AND DATERENTED = TO_DATE('${startDate}', 'YYYY-MM-DD')`
    );
    // Insert into PREVIOUSRENTAL
    await connection.execute(
      `INSERT INTO PREVIOUSRENTAL (LICENSEPLATENO, DATERENTED, DATERETURNED, PAYMENT, CNO) 
       VALUES ('${licenseplateno}', TO_DATE('${startDate}', 'YYYY-MM-DD'), TO_DATE('${endDate}', 'YYYY-MM-DD'), ${payment}, '${cno}')`
    );

    await connection.execute("commit");

    const result2 = await connection.execute(
      `SELECT EMAIL
       FROM CUSTOMER
       WHERE CNO = '${cno}'`
    );

    const email = result2.rows[0][0];

    await sendEmail(
      email,
      "CNU Rental Car - Car Rental",
      `${cno} 고객님. ${licenseplateno} 차량 ${startDate} ~ ${endDate} 대여 반납 완료되었습니다.\n 가격은 ${payment}원 입니다.`
    );

    res.status(200).json({
      message: "Reservation has been successfully canceled",
    });
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
});

app.post("/statistics", async (req, res) => {
  let connection;

  try {
    connection = await getConnection();

    const result1 = await connection.execute(
      `
      SELECT Customer.cno, Customer.name, CarModel.modelName, CarModel.vehicleType
      From RentCar
      JOIN Customer on RentCar.cno = Customer.cno
      JOIN CarModel on RentCar.modelName = CarModel.modelName
      `
    );
    const rentalVehicleByCustomer = result1.rows.map((v) => {
      return {
        cno: v[0],
        name: v[1],
        modelname: v[2],
        vehicletype: v[3],
      };
    });

    const result2 = await connection.execute(
      `
      SELECT Customer.cno, Customer.name, SUM(PreviousRental.payment) AS totalRentPayment
      FROM Customer
      JOIN PreviousRental ON Customer.cno = PreviousRental.cno
      GROUP BY Customer.cno, Customer.name
      ORDER BY TOTALRENTPAYMENT DESC
      `
    );

    const totalRentPaymentByCustomer = result2.rows.map((v) => {
      return {
        cno: v[0],
        name: v[1],
        totalpayment: v[2],
      };
    });

    const result3 = await connection.execute(
      `
      SELECT cno, name, totalRentals, RANK() OVER (ORDER BY totalRentals DESC) as rentalRank
      FROM (
        SELECT Customer.cno, Customer.name, COUNT(PreviousRental.licensePlateNo) AS totalRentals
        FROM Customer
        JOIN PreviousRental ON Customer.cno = PreviousRental.cno
        GROUP BY Customer.cno, Customer.name
      )
      `
    );

    const rentalRank = result3.rows.map((v) => {
      return {
        cno: v[0],
        name: v[1],
        totalrentals: v[2],
        rentalrank: v[3],
      };
    });

    res.status(200).json({
      rentalVehicleByCustomer,
      totalRentPaymentByCustomer,
      rentalRank,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
});

app.listen(port, () =>
  console.log(`App listening at http://localhost:${port}`)
);

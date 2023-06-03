const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = 3001;

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

app.listen(port, () =>
  console.log(`App listening at http://localhost:${port}`)
);

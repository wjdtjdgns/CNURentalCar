import React, { useState } from "react";
import styled from "@emotion/styled";
import axios from "axios";
import GlobalConstant from "../GlobalConstant";
import CarInfo from "./CarInfo";
import DateRangePicker from "./DateRangePicker";

const modelToImageMap = {
  팰리세이드: "palisade.jpg",
  "올 뉴 K3": "k3.png",
  "올 뉴 아반떼": "avante.png",
  쏘나타: "sonata.png",
  K5: "k5.png",
  "더 뉴 그랜저": "grandeur.jpg",
  G90: "g90.png",
  "더 뉴 카니발": "carnival.png",
  "GV70 (EV)": "gv70.png",
  "TESLA MODEL 3 (EV)": "tesla.jpg",
};

const ItemContainer = styled.div`
  width: 92vw;
  height: 30vh;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: white;
  margin: 3vh 4vw;
  padding: 5px 10px;
  border-radius: 15px;
`;

const Divider = styled.div`
  width: 30%;
  display: flex;
  flex-direction: column;
  align-items: ${(props) => (props.cancel ? "center" : "none")};
  justify-content: space-between;
`;

const CarImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  border: 1px solid rgba(0, 0, 0, 0.5);
  border-radius: 10px;
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Button = styled.button`
  width: 20vw;
  height: 5vh;
  border-radius: 15px;
  background-color: white;
  border: 1px solid black;
  transition: all 0.2s ease-in-out;

  &:disabled {
    cursor: not-allowed;
  }

  &:not(:disabled) {
    cursor: pointer;

    &:hover {
      background-color: black;
      color: white;
    }
  }
`;

const CarItem = ({
  modelname,
  licenseplateno,
  startDate,
  endDate,
  fuel,
  vehicletype,
  numberofseats,
  cno,
  removeItem,
  type = "reserve",
  isPre = false,
}) => {
  const imgName = modelToImageMap[modelname];
  const imgPath = require(`../assets/images/cars/${imgName}`);
  const [rented, setRented] = useState(!isPre);

  const dateTranslate = (input) => {
    const date = new Date(input);
    date.setDate(date.getDate() + 1);
    const utcString = date.toISOString();
    return utcString.slice(0, 10);
  };

  const handleCancel = async () => {
    if (
      !window.confirm(
        `${modelname} / ${licenseplateno}  예약범위: ${dateTranslate(
          startDate
        )} ~ ${dateTranslate(endDate)}\n예약을 취소하시겠습니까?`
      )
    ) {
      return;
    }

    try {
      const response = await axios.post(GlobalConstant.url + "/cancel", {
        cno: cno,
        licenseplateno: licenseplateno,
        startDate: dateTranslate(startDate),
        endDate: dateTranslate(endDate),
      });

      if (response.status === 200) {
        alert("성공적으로 취소되었습니다.");
        removeItem(licenseplateno, startDate);
      } else {
        alert("Error");
      }
    } catch (error) {
      if (error.response.status === 400 || error.response.status === 401) {
        alert("Invalid value");
      }
    }
  };

  const handleReturn = async () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are 0-based, so we add 1. Also pad with '0' to make it 2 digits
    const day = String(today.getDate()).padStart(2, "0"); // pad with '0' to make it 2 digits

    const todayDate = `${year}-${month}-${day}`;
    if (
      !window.confirm(
        `${modelname} / ${licenseplateno}  예약범위: ${dateTranslate(
          startDate
        )} ~ ${dateTranslate(
          endDate
        )}\n즉시 반납하시겠습니까? (결제금액은 줄어들지 않습니다.)`
      )
    ) {
      return;
    }
    try {
      const response = await axios.post(GlobalConstant.url + "/return", {
        cno: cno,
        licenseplateno: licenseplateno,
        startDate: dateTranslate(startDate),
        endDate: todayDate,
      });

      if (response.status === 200) {
        alert("성공적으로 반납되었습니다.");
        setRented(false);
      } else {
        alert("Error");
      }
    } catch (error) {
      if (
        error.response &&
        (error.response.status === 400 || error.response.status === 401)
      ) {
        alert("Invalid value");
      }
    }
  };

  return (
    <ItemContainer>
      <Divider>
        <CarImage src={imgPath} alt={modelname} />
      </Divider>
      <Divider>
        <ContentContainer>
          {type === "rent" ? (
            <>
              <h3>{`${modelname} / ${licenseplateno} / ${
                rented ? "대여중" : "이전 대여"
              }`}</h3>
            </>
          ) : (
            <>
              <h3>{`${modelname} / ${licenseplateno}`}</h3>
            </>
          )}
          <CarInfo
            vehicletype={vehicletype}
            numberofseats={numberofseats}
            fuel={fuel}
          />
          <DateRangePicker
            type="read"
            startDate={dateTranslate(startDate)}
            endDate={dateTranslate(endDate)}
          />
        </ContentContainer>
      </Divider>
      <Divider cancel>
        {type === "rent" ? (
          <>
            <Button disabled={!rented} onClick={handleReturn}>
              {rented ? "즉시반납" : "반납완료"}
            </Button>
          </>
        ) : (
          <>
            <Button onClick={handleCancel}>예약 취소</Button>
          </>
        )}
      </Divider>
    </ItemContainer>
  );
};

export default CarItem;

import React from "react";
import styled from "@emotion/styled";
import { useRecoilValue } from "recoil";
import { LoginState, UserIdState } from "../states/LoginState";
import GlobalConstant from "../GlobalConstant";
import axios from "axios";
import CarInfo from "./CarInfo";

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

const CarCardWrapper = styled.div`
  width: 25vw;
  height: 50vh;
  display: flex;
  align-items: start;
  justify-content: space-evenly;
  flex-direction: column;
  background-color: white;
  padding: 5px 10px;
  border-radius: 15px;
`;

const CarImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  border: 1px solid rgba(0, 0, 0, 0.5);
  border-radius: 10px;
`;

const RentRate = styled.span`
  font-weight: 500;
  font-style: italic;
  font-size: 1.5rem;
`;
const Won = styled.span`
  color: rgba(0, 0, 0, 0.5);
  font-weight: 400;
  font-size: 0.8rem;
`;

const RentButton = styled.button`
  width: 100%;
  height: 8%;
  border-radius: 15px;
  background-color: white;
  border: 1px solid black;
  transition: all 0.2s ease-in-out;
  cursor: pointer;

  &:hover {
    background-color: black;
    color: white;
  }
`;

const CarCard = ({
  fuel,
  licenseplateno,
  modelname,
  numberofseats,
  options,
  rentrateperday,
  vehicletype,
  start,
  end,
  removeCard,
}) => {
  const imgName = modelToImageMap[modelname];
  const imgPath = require(`../assets/images/cars/${imgName}`);

  const isLoggedIn = useRecoilValue(LoginState);
  const userId = useRecoilValue(UserIdState);

  const handleRentButtonClick = async () => {
    if (!isLoggedIn) {
      alert("로그인 후 이용 가능합니다.");
      return;
    }
    if (
      !window.confirm(
        `차량번호: ${licenseplateno}, 예약범위: ${start} ~ ${end} \n예약 하시겠습니까?`
      )
    ) {
      return;
    }
    try {
      const response = await axios.post(GlobalConstant.url + "/rent", {
        cno: userId,
        licenseplateno: licenseplateno,
        start: start,
        end: end,
      });

      if (response.status === 200) {
        alert(
          `차량번호: ${licenseplateno}, 예약범위: ${start} ~ ${end} \n예약 완료되었습니다.`
        );
        removeCard(licenseplateno);
      } else {
        alert("Error");
      }
    } catch (error) {
      if (error.response.status === 400) {
        alert("예약하고자 하시는 범위에 이미 다른 차량이 예약되어있습니다.");
      }
    }
  };
  return (
    <CarCardWrapper>
      <CarImage src={imgPath} alt={modelname} />
      <div>{`${modelname} | ${licenseplateno}`}</div>
      <RentRate>
        {rentrateperday}
        <Won>/day (₩)</Won>
      </RentRate>
      <CarInfo
        vehicletype={vehicletype}
        numberofseats={numberofseats}
        fuel={fuel}
      />
      <p>Options: {options}</p>
      <RentButton onClick={() => handleRentButtonClick()}>
        Reserve Now
      </RentButton>
    </CarCardWrapper>
  );
};

export default CarCard;

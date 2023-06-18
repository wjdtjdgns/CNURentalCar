import styled from "@emotion/styled";

import car from "../assets/svg/car.svg";
import gear from "../assets/svg/gear.svg";
import people from "../assets/svg/people.svg";
import fuelIcon from "../assets/svg/fuel.svg";

export const InfoWrapper = styled.div`
  width: 100%;
  display: flex;
  background-color: #f6f6f6;
  align-items: center;
  justify-content: space-around;
  border-radius: 15px;
  padding: 5px 0;
`;

export const Info = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export const InfoImage = styled.img`
  width: 20px;
  height: 20px;
  opacity; 0;
`;

export const InfoP = styled.p`
  padding: 0;
  margin: 0;
  font-size: 12px;
`;

const CarInfo = ({ vehicletype, numberofseats, fuel }) => {
  return (
    <InfoWrapper>
      <Info>
        <InfoImage src={car} alt="car icon" />
        <InfoP>{vehicletype}</InfoP>
      </Info>
      <Info>
        <InfoImage src={gear} alt="gear icon" />
        <InfoP>Auto</InfoP>
      </Info>
      <Info>
        <InfoImage src={people} alt="people icon" />
        <InfoP>{`${numberofseats} Person`}</InfoP>
      </Info>
      <Info>
        <InfoImage src={fuelIcon} alt="fuel icon" />
        <InfoP>{fuel}</InfoP>
      </Info>
    </InfoWrapper>
  );
};

export default CarInfo;

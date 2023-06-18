import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import PageContainer from "../components/PageContainer";
import FloatingSearchBox from "../components/FloatingSearchBox";
import NoResult from "../components/NoResult";
import CarCard from "../components/CarCard";
import styled from "@emotion/styled";

const CarCardList = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 30px;
  margin-bottom: 15vh;
`;

const VehicleSearch = () => {
  const location = useLocation();
  const [data, setData] = useState(location.state ? location.state.data : []);
  useEffect(() => {
    setData(location.state ? location.state.data : []);
  }, [location]);
  const { start, end } =
    location.state && location.state.date ? location.state.date : {};

  const removeCard = (licenseplateno) => {
    const newData = data.filter((v) => v.licenseplateno !== licenseplateno);
    setData(newData);
  };

  if (data.length === 0) {
    return (
      <PageContainer>
        <NoResult />
        <FloatingSearchBox />
      </PageContainer>
    );
  }
  return (
    <PageContainer>
      <CarCardList>
        {data.map((v, i) => (
          <CarCard
            key={i}
            {...v}
            start={start}
            end={end}
            removeCard={removeCard}
          />
        ))}
      </CarCardList>
      <FloatingSearchBox />
    </PageContainer>
  );
};

export default VehicleSearch;

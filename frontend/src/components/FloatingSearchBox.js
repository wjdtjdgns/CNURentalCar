import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styled from "@emotion/styled";
import DateRangePicker from "./DateRangePicker";
import CarModelSelector from "./CarModelSelector";
import GlobalConstant from "../GlobalConstant";

const FloatingSearchBoxContainer = styled.div`
  position: fixed;
  top: 85%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
  border: 1px solid rgba(0, 0, 0, 0.3);
  border-radius: 10px;
`;

const SearchButton = styled.button`
  margin-top: 1vh;
  width: 8vw;
  height: 7vh;
  background-color: none;
  padding: 10px;
  font-size: 14px;
  font-weight: bold;
  border: 1px solid black;
  border-radius: 10px;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: #0f0f0f;
    color: white;
  }
  ${({ disabled }) =>
    disabled &&
    `
    opacity: 0.5;
    cursor: not-allowed;
  `}
`;

const FloatingSearchBox = () => {
  const today = new Date(); // 현재 날짜와 시간을 가져옴
  today.setDate(today.getDate() + 1);
  const nextDay = today.toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(nextDay);
  const [endDate, setEndDate] = useState(nextDay);
  const [selectedOption, setSelectedOption] = useState(null);
  const navigate = useNavigate();

  const handleStartDateChange = (date) => {
    setStartDate(date);
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
  };

  const handleSearch = async () => {
    const vehicleTypeList =
      selectedOption[0].value === "전체"
        ? ["전기", "대형", "승합", "SUV", "소형"]
        : selectedOption.map((v) => v.value);

    try {
      const response = await axios.post(GlobalConstant.url + "/search", {
        userVehicleType: vehicleTypeList,
        userStartTime: startDate,
        userEndTime: endDate,
      });

      if (response.status === 200) {
        navigate("/vehiclesearch", {
          state: { data: response.data.result },
        });
      } else {
        alert("Error");
      }
    } catch (error) {
      if (error.response.status === 400 || error.response.status === 401) {
        alert("Invalid value");
      }
    }
  };

  return (
    <FloatingSearchBoxContainer>
      <DateRangePicker
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={handleStartDateChange}
        onEndDateChange={handleEndDateChange}
      />
      <CarModelSelector
        selectedOption={selectedOption}
        setSelectedOption={setSelectedOption}
      />
      <SearchButton onClick={handleSearch} disabled={!selectedOption}>
        Find a Vehicle
      </SearchButton>
    </FloatingSearchBoxContainer>
  );
};

export default FloatingSearchBox;

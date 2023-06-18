import React from "react";
import styled from "@emotion/styled";

const DatePickerContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const InputLabel = styled.label`
  font-weight: ${(props) => (props.readOnly ? "400" : "bold")};
`;

const InputStyled = styled.input`
  width: 15vw;
  height: 5vh;
  padding: 8px;
  font-size: 16px;
  border: 1px solid gray;
  border-radius: 10px;
  cursor: pointer;
`;

const TildeSpan = styled.span`
  display: flex;
  align-items: center;
  line-height: 5vh;
  margin: 0 2vw;
`;

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate() + 1).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const DateRangePicker = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  type = "none",
}) => {
  const handleStartDateChange = (event) => {
    const selectedDate = event.target.value;
    onStartDateChange(selectedDate);
    if (selectedDate > endDate) {
      onEndDateChange(selectedDate);
    }
  };

  const handleEndDateChange = (event) => {
    const selectedDate = event.target.value;
    if (selectedDate < startDate) {
      alert("잘못된 시간범위 입니다.");
      onEndDateChange(startDate);
    } else {
      onEndDateChange(selectedDate);
    }
  };

  if (type === "read") {
    return (
      <DatePickerContainer>
        <InputContainer>
          <InputLabel readOnly>Pick-up date:</InputLabel>
          <InputStyled type="date" value={startDate} readOnly />
        </InputContainer>
        <TildeSpan>~</TildeSpan>
        <InputContainer>
          <InputLabel readOnly>Drop-off date:</InputLabel>
          <InputStyled type="date" value={endDate} readOnly />
        </InputContainer>
      </DatePickerContainer>
    );
  }

  return (
    <DatePickerContainer>
      <InputContainer>
        <InputLabel>Pick-up date:</InputLabel>
        <InputStyled
          type="date"
          min={getTodayDate()}
          value={startDate}
          onChange={handleStartDateChange}
        />
      </InputContainer>
      <TildeSpan>~</TildeSpan>
      <InputContainer>
        <InputLabel>Drop-off date:</InputLabel>
        <InputStyled
          type="date"
          min={getTodayDate()}
          value={endDate}
          onChange={handleEndDateChange}
        />
      </InputContainer>
    </DatePickerContainer>
  );
};

export default DateRangePicker;

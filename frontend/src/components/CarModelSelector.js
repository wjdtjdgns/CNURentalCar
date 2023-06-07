import React from "react";
import Select from "react-select";
import styled from "@emotion/styled";
import car from "../assets/svg/car.svg";

const customStyles = {
  dropdownIndicator: (base) => ({
    ...base,
    transform: "rotate(180deg)",
  }),
  control: (base) => ({
    ...base,
    minHeight: "50px", // 원하는 높이로 조정
  }),
};

const SelectContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 3vh;
`;

const SelectStyled = styled(Select)`
  width: 25vw;
  height: 5vh;
  padding: 8px;
  font-size: 16px;
  cursor: pointer;
  margin-top: -10px;
`;

const options = [
  { value: "전체", label: "전체" },
  { value: "소형", label: "소형" },
  { value: "대형", label: "대형" },
  { value: "SUV", label: "SUV" },
  { value: "전기", label: "전기" },
  { value: "승합", label: "승합" },
];

const CarModelSelector = ({ selectedOption, setSelectedOption }) => {
  const handleSelectedOptionChange = (selectedOptions) => {
    if (selectedOptions.length === 0) {
      setSelectedOption(null); // 선택된 옵션이 없으면 상태를 null로 설정
    } else if (selectedOptions.some((option) => option.value !== "전체")) {
      setSelectedOption(
        selectedOptions.filter((option) => option.value !== "전체") // "전체" 옵션을 제외한 옵션들로 상태 업데이트
      );
    } else {
      setSelectedOption(selectedOptions); // 선택된 옵션들로 상태 업데이트
    }
  };

  const isOptionDisabled = (option) => {
    return (
      selectedOption &&
      selectedOption.length > 0 &&
      option.value === "전체" &&
      selectedOption.some((option) => option.value !== "전체")
    );
  };

  return (
    <SelectContainer>
      <SelectStyled
        isMulti
        className="basic-multi-select"
        value={selectedOption}
        onChange={handleSelectedOptionChange}
        options={options}
        menuPlacement="top"
        placeholder={<img src={car} alt="car" />}
        styles={customStyles}
        isOptionDisabled={isOptionDisabled}
      />
    </SelectContainer>
  );
};

export default CarModelSelector;

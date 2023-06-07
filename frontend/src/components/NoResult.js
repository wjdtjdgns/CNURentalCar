import styled from "@emotion/styled";
import NOTHING from "../assets/images/NOTHING.jpg";

const Wrapper = styled.div`
  margin-top: 3%;
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: flex-start;
  flex-direction: column;
  color: white;
`;

const Image = styled.img`
  width: 50%;
  border-radius: 30px;
  opacity: 0.6;
`;

const Result = styled.h2`
  font-weight: 800;
  font-size: 2rem;
`;
const Info = styled.h3`
  margin-top: -1%;
  font-weight: 400;
`;

const NoResult = () => {
  return (
    <Wrapper>
      <Image src={NOTHING} alt="nothing" />
      <Result>검색 결과가 존재하지 않습니다!</Result>
      <Info>하단의 검색바를 통해 검색해주세요!</Info>
    </Wrapper>
  );
};

export default NoResult;

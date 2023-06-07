import React from "react";
import styled from "@emotion/styled";

import FloatingSearchBox from "../components/FloatingSearchBox";

const HomeContainer = styled.div`
  height: 100vh;
  background-image: url(${require("../assets/images/HomeImage.jpg")});
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center top;
`;

const Home = () => {
  return (
    <HomeContainer>
      <FloatingSearchBox />
    </HomeContainer>
  );
};

export default Home;

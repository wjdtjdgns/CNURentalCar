import React, { useEffect, useState } from "react";
import styled from "@emotion/styled";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import GlobalConstant from "../GlobalConstant";
import PageContainer from "../components/PageContainer";

const Container = styled.div`
  color: white;
  margin-top: 30px;
  padding: 0 8vh;
`;
const Title = styled.h2`
  color: white;
`;
const Table = styled.table`
  border-collapse: collapse;
  width: 100%;
  border: 1px solid white;
`;

const Td = styled.td`
  border: 1px solid white;
  background-color: gray;
  text-align: center;
`;

const MyPage = () => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const navigate = useNavigate();
  const [rentalVehicleByCustomer, setRentalVehicleByCustomer] = useState([]);
  const [totalRentPaymentByCustomer, setTotalRentPaymentByCustomer] = useState(
    []
  );
  const [rentalRank, setRentalRank] = useState([]);

  const getStatistics = async () => {
    try {
      const response = await axios.post(GlobalConstant.url + "/statistics", {});

      if (response.status === 200) {
        setRentalVehicleByCustomer(response.data.rentalVehicleByCustomer);
        setTotalRentPaymentByCustomer(response.data.totalRentPaymentByCustomer);
        setRentalRank(response.data.rentalRank);
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

  useEffect(() => {
    if (!isLoggedIn) {
      alert("로그인 후 이용 가능합니다!");
      navigate("/");
    } else {
      getStatistics();
    }
  }, [isLoggedIn, navigate]);
  console.log(rentalVehicleByCustomer, totalRentPaymentByCustomer, rentalRank);
  return (
    <PageContainer>
      <Container>
        <Title>고객별 대여 중인 차량</Title>
        <Table>
          <thead>
            <th>CNO</th>
            <th>Name</th>
            <th>Model Name</th>
            <th>Vehicle Type</th>
          </thead>
          <tbody>
            {rentalVehicleByCustomer.map((v, i) => (
              <tr key={i}>
                <Td>{v.cno}</Td>
                <Td>{v.modelname}</Td>
                <Td>{v.name}</Td>
                <Td>{v.vehicletype}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>
      <Container>
        <Title>고객별 총 대여료</Title>
        <Table>
          <thead>
            <th>CNO</th>
            <th>Name</th>
            <th>Total Rent Payment</th>
          </thead>
          <tbody>
            {totalRentPaymentByCustomer.map((v, i) => (
              <tr key={i}>
                <Td>{v.cno}</Td>
                <Td>{v.name}</Td>
                <Td>{v.totalpayment}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>
      <Container>
        <Title>가장 많은 대여 기록을 가진 고객 순위</Title>
        <Table>
          <thead>
            <th>CNO</th>
            <th>Name</th>
            <th>Total Rentals</th>
            <th>Rental Rank</th>
          </thead>
          <tbody>
            {rentalRank.map((v, i) => (
              <tr key={i}>
                <Td>{v.cno}</Td>
                <Td>{v.name}</Td>
                <Td>{v.totalrentals}</Td>
                <Td>{v.rentalrank}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>
    </PageContainer>
  );
};
export default MyPage;

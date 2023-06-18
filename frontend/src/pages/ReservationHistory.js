import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import GlobalConstant from "../GlobalConstant";
import PageContainer from "../components/PageContainer";
import CarItem from "../components/CarItem";
import NoResult from "../components/NoResult";

const ReservationHistory = () => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();
  const [reservationList, setReservationList] = useState([]);

  const removeItem = (licenseplateno, startDate) => {
    const newData = reservationList.filter(
      (v) => v.licenseplateno !== licenseplateno && v.startDate !== startDate
    );
    setReservationList(newData);
  };

  const getReservationList = useCallback(async () => {
    try {
      const response = await axios.post(GlobalConstant.url + "/reservelist", {
        cno: userId,
      });

      if (response.status === 200) {
        setReservationList(response.data.result);
      } else {
        alert("Error");
      }
    } catch (error) {
      if (error.response.status === 400 || error.response.status === 401) {
        alert("Invalid value");
      }
    }
  }, [userId]);

  useEffect(() => {
    if (!isLoggedIn) {
      alert("로그인 후 이용 가능합니다!");
      navigate("/");
    } else {
      getReservationList();
    }
  }, [isLoggedIn, navigate, getReservationList]);

  if (reservationList.length === 0) {
    return (
      <PageContainer>
        <NoResult type="rental" />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {reservationList.map((reservation, i) => (
        <CarItem
          key={i}
          cno={userId}
          {...reservation}
          removeItem={removeItem}
        />
      ))}
    </PageContainer>
  );
};

export default ReservationHistory;

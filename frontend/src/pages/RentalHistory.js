import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PageContainer from "../components/PageContainer";
import GlobalConstant from "../GlobalConstant";
import NoResult from "../components/NoResult";
import CarItem from "../components/CarItem";

const RentalHistory = () => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();
  const [rentList, setRentList] = useState([]);
  const [preRentList, setPreRentList] = useState([]);

  const getRentList = useCallback(async () => {
    try {
      const response = await axios.post(GlobalConstant.url + "/rentallist", {
        cno: userId,
      });

      if (response.status === 200) {
        setRentList(response.data.curRent);
        setPreRentList(response.data.preRent);
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
  }, [userId]);

  useEffect(() => {
    if (!isLoggedIn) {
      alert("로그인 후 이용 가능합니다!");
      navigate("/");
    } else {
      getRentList();
    }
  }, [isLoggedIn, navigate, getRentList]);

  if (rentList.length === 0 && preRentList.length === 0) {
    return (
      <PageContainer>
        <NoResult type="rental" />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {rentList.map((v, i) => (
        <CarItem type="rent" key={i} cno={userId} {...v} />
      ))}
      {preRentList.map((v, i) => (
        <CarItem type="rent" isPre key={i} cno={userId} {...v} />
      ))}
    </PageContainer>
  );
};

export default RentalHistory;

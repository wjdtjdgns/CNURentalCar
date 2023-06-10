import React, { useState } from "react";
import axios from "axios";
import styled from "@emotion/styled";
import { useSetRecoilState } from "recoil";
import {
  LoginState,
  UserNameState,
  UserEmailState,
  UserIdState,
} from "../states/LoginState";
import GlobalConstant from "../GlobalConstant";

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 5px 30px 25px 30px;
  border-radius: 10px;
  width: 25vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
`;

const ModalInput = styled.input`
  display: inline-block;
  width: 100%;
  border: none;
  padding: 15px 0px;
  font-size: 18px;
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.2);
  transition: border-color 0.3s ease-in-out;

  &:focus {
    border-color: #0f0f0f;
    outline: none;
  }
`;

const ModalButton = styled.button`
  width: 100%;
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
`;

const GoToSignUpButton = styled.button`
  border: none;
  background-color: white;
  color: rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    color: rgba(0, 0, 0, 1);
  }
`;

const AuthForm = ({ onClose, type = "login" }) => {
  const [isLoginForm, setIsLoginForm] = useState("login" === type);
  const setLoggedIn = useSetRecoilState(LoginState);
  const setUserName = useSetRecoilState(UserNameState); // 이름 저장을 위한 Recoil setter
  const setUserEmail = useSetRecoilState(UserEmailState); // 이메일 저장을 위한 Recoil setter
  const setUserId = useSetRecoilState(UserIdState); // 이메일 저장을 위한 Recoil setter

  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const toggleForm = () => {
    setId("");
    setPassword("");
    setName("");
    setEmail("");
    setIsLoginForm(!isLoginForm);
  };

  const handleClose = () => {
    onClose();
    setId("");
    setPassword("");
    setName("");
    setEmail("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isLoginForm) {
      try {
        const response = await axios.post(GlobalConstant.url + "/login", {
          cno: id,
          passwd: password,
        });

        if (response.status === 200) {
          // 로그인 성공, 서버에서 받은 데이터로 이름과 이메일 저장
          console.log(response.data);
          const { name, email } = response.data;
          // 로그인 상태를 true로 설정
          setLoggedIn(true);
          setUserName(name); // Recoil로 이름 저장
          setUserEmail(email); // Recoil로 이메일 저장
          setUserId(id);
          handleClose();
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("userName", name);
          localStorage.setItem("userEmail", email);
          localStorage.setItem("userId", id);
        } else {
          alert("Error");
        }
      } catch (error) {
        if (error.response.status === 400 || error.response.status === 401) {
          // 로그인 실패, 에러 메시지를 alert로 띄움
          alert("Invalid id or password");
        }
      }
    } else {
      //todo 회원가입 로직
    }

    // 폼 초기화
    setId("");
    setPassword("");
    setName("");
    setEmail("");
  };

  return (
    <ModalOverlay>
      <ModalContent>
        <h2>{isLoginForm ? "Login" : "Sign Up"}</h2>
        <form onSubmit={handleSubmit}>
          <ModalInput
            type="text"
            name="id"
            placeholder="ID"
            value={id}
            onChange={(e) => setId(e.target.value)}
            required
          />
          <ModalInput
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {!isLoginForm && (
            <>
              <ModalInput
                type="text"
                name="name"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <ModalInput
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </>
          )}

          <ModalButton type="submit">
            {isLoginForm ? "Login" : "Sign Up"}
          </ModalButton>
        </form>
        <p>
          {isLoginForm
            ? "Don't have an account? "
            : "Already have an account? "}
          <GoToSignUpButton onClick={toggleForm}>
            {isLoginForm ? "Sign Up" : "Login"}
          </GoToSignUpButton>
        </p>
        <ModalButton onClick={handleClose}>Close</ModalButton>
      </ModalContent>
    </ModalOverlay>
  );
};

export default AuthForm;

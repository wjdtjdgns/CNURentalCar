import React, { useState, useCallback, useEffect } from "react";
import styled from "@emotion/styled";
import { Link, useLocation } from "react-router-dom";
import { useRecoilState } from "recoil";
import { LoginState } from "../states/LoginState";
import GlobalConstant from "../GlobalConstant";

const HeaderContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 9999;
`;

const HeaderWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 7vh;
  min-height: 50px;
  background-color: ${GlobalConstant.backgroundColor};
  border-top: ${(props) =>
    props.menubar ? "1px solid rgba(255, 255, 255, 0.3)" : "none"};
`;

const HeaderContent = styled.div`
  display: flex;
  width: 33%;
  align-items: center;
  justify-content: center;
  color: white;
`;

const MenuContent = styled.nav`
  display: flex;
  width: 10%;
  height: 7vh;
  min-height: 50px;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-top: ${(props) => (props.isActive ? "1px solid white" : "none")};

  a {
    text-decoration: none;
    color: ${(props) =>
      props.isActive ? "white" : "rgba(255, 255, 255, 0.3)"};
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }
`;

const SignUp = styled.button`
  background: inherit;
  border: none;
  box-shadow: none;
  border-radius: 0;
  padding: 0;
  overflow: visible;
  cursor: pointer;
  color: white;
  min-width: 50px;
`;

const LogInOut = styled.button`
  margin-left: 30%;
  background: inherit;
  border: 1px solid white;
  box-shadow: none;
  border-radius: 20px;
  color: white;
  padding: 7px 10px;
  cursor: pointer;
  min-width: 70px;
`;

const UserName = styled.span`
  background: inherit;
  min-width: 60px;
  color: white;
  text-decoration: underline;
`;

export const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useRecoilState(LoginState);
  const logInHandler = () => {
    //todo: LoginForm 연결
    setIsLoggedIn(true);
  };
  const logOutHandler = () => {
    setIsLoggedIn(false);
  };
  const signUpHandler = () => {
    //todo: SignUpForm 연결
  };

  const { pathname } = useLocation();
  const [click, setClick] = useState(pathname);

  useEffect(() => {
    setClick(pathname);
  }, [pathname]);

  const handleClick = useCallback((path) => {
    setClick(path);
  }, []);

  return (
    <HeaderContainer>
      <HeaderWrapper>
        <HeaderContent />
        <HeaderContent>
          <h1>CNU Rental Car</h1>
        </HeaderContent>
        <HeaderContent>
          {isLoggedIn ? (
            <HeaderContent>
              <UserName>User 님</UserName> {/** todo User name */}
              <LogInOut onClick={() => logOutHandler()}>LogOut</LogInOut>
            </HeaderContent>
          ) : (
            <HeaderContent>
              <SignUp onClick={() => signUpHandler()}>Sign Up</SignUp>
              <LogInOut onClick={() => logInHandler()}>Log In</LogInOut>
            </HeaderContent>
          )}
        </HeaderContent>
      </HeaderWrapper>
      <HeaderWrapper menubar>
        <MenuContent isActive={click === "/"} onClick={() => handleClick("/")}>
          <Link to="/">Home</Link>
        </MenuContent>
        <MenuContent
          isActive={click === "/vehiclesearch"}
          onClick={() => handleClick("/vehiclesearch")}
        >
          <Link to="/vehiclesearch">차량조회</Link>
        </MenuContent>
        <MenuContent></MenuContent>
        <MenuContent
          isActive={click === "/return"}
          onClick={() => handleClick("/return")}
        >
          <Link to="/return">반납</Link>
        </MenuContent>
        <MenuContent
          isActive={click === "/rentalhistory"}
          onClick={() => handleClick("/rentalhistory")}
        >
          <Link to="/rentalhistory">대여기록</Link>
        </MenuContent>
        <MenuContent
          isActive={click === "/mypage"}
          onClick={() => handleClick("/mypage")}
        >
          <Link to="/mypage">My Page</Link>
        </MenuContent>
      </HeaderWrapper>
    </HeaderContainer>
  );
};

export default Header;

import React from "react";
import styled from "@emotion/styled";
import GlobalConstant from "../GlobalConstant";
import instagram from "../assets/svg/instagram.svg";
import twitter from "../assets/svg/twitter.svg";
import youtube from "../assets/svg/youtube.svg";

const FooterContainer = styled.footer`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 10vh;
  min-height: 50px;
  background-color: ${GlobalConstant.backgroundColor};
`;

const FooterContent = styled.div`
  display: flex;
  width: 33%;
  align-items: center;
  justify-content: center;
  color: white;
`;

const FooterLink = styled.span`
  margin: 0 10px;
  color: #333;
  text-decoration: none;
  cursor: pointer;
`;

const FooterIcon = styled.img`
  width: 20px;
  height: 20px;
  padding: 5px;
  margin: 0 10px;
  border-radius: 50%;
  background-color: #333;
  cursor: pointer;
`;

const Footer = () => {
  return (
    <FooterContainer>
      <FooterContent>
        <h2>CNU Rental Car</h2>
      </FooterContent>
      <FooterContent>
        <FooterLink>Rent</FooterLink>
        <FooterLink>Share</FooterLink>
        <FooterLink>About us</FooterLink>
        <FooterLink>Contact</FooterLink>
      </FooterContent>
      <FooterContent>
        <FooterIcon src={instagram} alt="instagram Icon" />
        <FooterIcon src={twitter} alt="twitter Icon" />
        <FooterIcon src={youtube} alt="youtube Icon" />
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer;

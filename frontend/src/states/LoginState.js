import { atom } from "recoil";

export const LoginState = atom({
  key: "LoginState",
  default: false,
});

export const UserIdState = atom({
  key: "UserIdState",
  default: "",
});

export const UserNameState = atom({
  key: "UserNameState",
  default: "",
});

export const UserEmailState = atom({
  key: "UserEmailState",
  default: "",
});

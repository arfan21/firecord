import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export const useLogoutUrl = (): [
  string,
  React.Dispatch<React.SetStateAction<string>>
] => {
  const [, { logoutUrl, setLogoutUrl }] = useContext(AuthContext);
  return [logoutUrl, setLogoutUrl];
};

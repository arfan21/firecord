import Cookies from "js-cookie";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export const useIsLoggedIn = () => {
  const { user } = useContext(AuthContext);
  return (
    user !== null &&
    Cookies.get("token") !== undefined &&
    Cookies.get("user") !== undefined
  );
};

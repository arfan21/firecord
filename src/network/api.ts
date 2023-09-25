import axios from "axios";
import React from "react";
import { apiConfig } from "../configs/api";

export const getMessages = (
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  onSuccess: Function
) => {
  setIsLoading(true);
  axios.get(apiConfig.apiURL + "/chat/all").then((response) => {
    const data = response.data;
    onSuccess(data);
  });
};

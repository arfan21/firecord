import { onValue, push, ref, set } from "@firebase/database";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import Cookies from "js-cookie";
import { auth, database, provider } from "../configs/firebase";

export const fbLogin = (
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  setIsLoading(true);
  signInWithPopup(auth, provider)
    .then((result) => {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      const user = result.user;
      Cookies.set("token", token!);
      Cookies.set("user", JSON.stringify(user!));
    })
    .catch((error) => {
      const credential = GoogleAuthProvider.credentialFromError(error);
      console.log({ ...error });
    })
    .finally(() => setIsLoading(false));
};

export const fbLogout = (
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  setIsLoading(true);
  signOut(auth)
    .then(() => {
      Cookies.remove("token");
      Cookies.remove("user");
    })
    .finally(() => setIsLoading(false));
};

export const postMessage = (
  data: any,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  setIsLoading(true);
  const messageListRef = ref(database, "messages");
  const newMessageRef = push(messageListRef);
  set(newMessageRef, data).finally(() => setIsLoading(false));
};

export const getMessages = (
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  onSuccess: Function
) => {
  setIsLoading(true);
  const messageListRef = ref(database, "messages");
  onValue(messageListRef, (snapshot) => {
    const data = snapshot.val();
    onSuccess(data);
  });
};

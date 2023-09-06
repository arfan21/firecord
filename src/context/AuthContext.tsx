import { onAuthStateChanged, User } from "firebase/auth";
import { createContext, useEffect, useState } from "react";
import { auth } from "../configs/firebase";
import { Session } from "@ory/client";

type ContextState = [
  {
    session: Session | null;
    setSession: React.Dispatch<React.SetStateAction<Session | null>>;
  },
  {
    logoutUrl: string;
    setLogoutUrl: React.Dispatch<React.SetStateAction<string>>;
  }
];
type Props = { children: React.ReactNode };

export const AuthContext = createContext<ContextState>([
  {
    session: null,
    setSession: () => {},
  },
  {
    logoutUrl: "",
    setLogoutUrl: () => {},
  },
]);

const AuthProvider: React.FC<Props> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [logoutUrl, setLogoutUrl] = useState<string>("");

  return (
    <AuthContext.Provider
      value={[
        { session, setSession },
        { logoutUrl, setLogoutUrl },
      ]}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider };

import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Session } from "@ory/client";

export const useSession = (): [
  boolean,
  Session | null,
  React.Dispatch<React.SetStateAction<Session | null>>
] => {
  const [{ session, setSession }] = useContext(AuthContext);
  return [
    session !== null && (session?.active as boolean),
    session,
    setSession,
  ];
};

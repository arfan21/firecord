import { onAuthStateChanged, User } from "firebase/auth";
import { createContext, useEffect, useState } from "react";
import { auth } from "../configs/firebase";

type ContextState = { user: User | null };
type Props = { children: React.ReactNode };

export const AuthContext = createContext<ContextState>({ user: null });

const AuthProvider: React.FC<Props> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

  return (
    <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
  );
};

export { AuthProvider };

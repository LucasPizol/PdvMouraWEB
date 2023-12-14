import { createContext, useContext } from "react";

export const AuthContext = createContext(null as any);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("Não autenticado");
  }

  return context;
};

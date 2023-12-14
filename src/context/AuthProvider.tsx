import { AuthContext } from "./AuthContext";
import { supabase } from "../supabase";
import { useQuery } from "react-query";

type AuthProviderProps = {
  children: any;
};

const getUser = async () => {
  const auth = await supabase.auth.getUser();

  if (auth.error) return;

  const data = await supabase
    .from("users")
    .select("cod,email,role,equipe:id_equipe (id, empresas: id_empresa)")
    .eq("email", auth.data.user.email);

  return { userData: data.data, auth: auth };
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { data, isLoading } = useQuery("getUserFromAuth", getUser);

  return (
    <AuthContext.Provider
      value={{ user: data?.userData, auth: data?.auth, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

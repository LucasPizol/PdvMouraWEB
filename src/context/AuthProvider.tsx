import { AuthContext } from "./AuthContext";
import { supabase } from "../supabase";
import { useEffect, useState } from "react";
import { Loading } from "../components/loading/Loading";

type AuthProviderProps = {
  children: any;
};

const getUser = async () => {
  const auth = await supabase.auth.getUser();

  if (auth.error) return null;

  const data = await supabase.from("users").select("cod,email,role,equipe:id_equipe (id, empresas: id_empresa)").eq("email", auth.data.user.email);

  return data.data;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<any>();
  const [isLoading, setIsLoading] = useState<boolean>();

  const signIn = async () => {
    setIsLoading(true);
    const response = await getUser();
    setUser(response);
    setIsLoading(false);
  };

  const signOut = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setIsLoading(false);
  };

  useEffect(() => {
    setIsLoading(true);
    getUser().then((response: any) => {
      setUser(response);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) return <Loading />;

  return <AuthContext.Provider value={{ user: user, isLoading, signIn, signOut }}>{children}</AuthContext.Provider>;
};

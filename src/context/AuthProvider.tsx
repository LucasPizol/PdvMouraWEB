import { AuthContext } from "./AuthContext";
import { supabase } from "../supabase";
import { useEffect, useState } from "react";
import { Loading } from "../components/loading/Loading";

type AuthProviderProps = {
  children: any;
};

const getUser = async (user?: any) => {
  const auth = user || (await supabase.auth.getUser());

  if (auth.error) return { data: auth.data, error: auth.error };

  const { data, error } = await supabase
    .from("users")
    .select("cod,email,role,equipe:id_equipe (id, empresas: id_empresa)")
    .eq("email", auth.data.user.email);

  if (error) return { data, error };

  if (data[0]?.role !== "master") return { data: null, error: { message: "Não autorizado." } };

  return { data, error };
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<any>();
  const [isLoading, setIsLoading] = useState<boolean>();

  const signIn = async ({ email, password }: { email: string; password: string }) => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return { data, error };

    const response = await getUser({ data: { user: data.user }, session: data.session });

    setUser(response.data);
    setIsLoading(false);

    return { data: response.data, error: response.error };
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

      if (response?.data[0]) {
        setUser(response?.data);
        setIsLoading(false);
        return;
      }

      setUser(null);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) return <Loading />;

  return <AuthContext.Provider value={{ user: user, isLoading, signIn, signOut }}>{children}</AuthContext.Provider>;
};

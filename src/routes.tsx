import { Routes, Route, BrowserRouter } from "react-router-dom";
import { Stock } from "./Pages/Stock/Stock";
import { NewItem } from "./Pages/NewItem/NewItem";
import { createContext, useEffect, useState } from "react";
import { supabase } from "./supabase";
import { useQuery } from "react-query";
import { Login } from "./Pages/Auth/Login";
import DefaultPage from "./components/defaultPage/DefaultPage";
import { Favorecidos } from "./Pages/Favorecidos/Favorecidos";

interface User {
  cod: string;
  email: string;
  role: string;
  equipe: { id: number; empresas: number }[];
}
[];

export type UserType = User[] | null | undefined;

const getUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) return { error };
  console.log(data.user?.email);
  const userData = await supabase.from("users").select("cod,email,role,equipe:id_equipe (id, empresas: id_empresa)").eq("email", data.user?.email);
  return { data, userData: userData.data };
};

export const UserContext = createContext<UserType>(null);

export const RoutesApp = () => {
  const { data } = useQuery("getUser", getUser);
  const [userData, setUserData] = useState<UserType>();

  useEffect(() => {
    if (data?.data) {
      setUserData(data?.userData);
    }
  }, [data]);

  return (
    <UserContext.Provider value={userData}>
      <BrowserRouter>
        <Routes>
          <Route path="/auth/login" element={<Login />} />
          <Route path="/" element={<DefaultPage Component={Stock} />} />
          <Route path="/novoItem" element={<DefaultPage Component={NewItem} />} />
          <Route path="/favorecidos" element={<DefaultPage Component={Favorecidos} />} />
        </Routes>
      </BrowserRouter>
    </UserContext.Provider>
  );
};

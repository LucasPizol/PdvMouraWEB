import { Routes, Route, BrowserRouter } from "react-router-dom";
import { Stock } from "./Pages/Stock/Stock";
import { NewItem } from "./Pages/NewItem/NewItem";
import { createContext, useEffect, useState } from "react";
import { supabase } from "./supabase";
import { useQuery } from "react-query";
import { Login } from "./Pages/Auth/Login";
import DefaultPage from "./components/defaultPage/DefaultPage";
import { Favorecidos } from "./Pages/Favorecidos/Favorecidos";
import { NewFavorecido } from "./Pages/NewFavorecido/NewFavorecido";
import { Historic } from "./Pages/Historic/Historic";
import { NewPedido } from "./Pages/NewPedido/NewPedido";
import { PdvDeSucesso } from "./Pages/PdvDeSucesso/PdvDeSucesso";
import { Customers } from "./Pages/Customers/Customers";
import PdvPage from "./Pages/PdvPage/PdvPage";

interface User {
  cod: string;
  email: string;
  role: string;
  equipe: { id: number; empresas: number }[];
}
[];

export type UserType = User[] | null | undefined;

const getAuth = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) return { error };
  return { data, error };
};

const getUser = async (email: string) => {
  const userData = await supabase.from("users").select("cod,email,role,equipe:id_equipe (id, empresas: id_empresa)").eq("email", email);

  return { userData: userData.data };
};

export const UserContext = createContext<UserType>(null);

export const RoutesApp = () => {
  const { data } = useQuery("getUser", getAuth);
  const [userData, setUserData] = useState<UserType>();

  useEffect(() => {
    if (data?.data?.user.email) {
      getUser(data.data.user.email).then((user) => {
        setUserData(user.userData);
      });
    }
  }, [data]);

  return (
    <UserContext.Provider value={userData}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DefaultPage Component={Stock} />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/novo/item" element={<DefaultPage Component={NewItem} />} />
          <Route path="/update/item/:id" element={<DefaultPage Component={NewItem} />} />
          <Route path="/favorecidos" element={<DefaultPage Component={Favorecidos} />} />
          <Route path="/novo/favorecido" element={<DefaultPage Component={NewFavorecido} />} />
          <Route path="/historico" element={<DefaultPage Component={Historic} />} />
          <Route path="/novo/pedido" element={<DefaultPage Component={NewPedido} />} />
          <Route path="/pdvDeSucesso" element={<DefaultPage Component={PdvDeSucesso} />} />
          <Route path="/customers" element={<DefaultPage Component={Customers} />} />
          <Route path="/pdvPage" element={<DefaultPage Component={PdvPage} />} />
        </Routes>
      </BrowserRouter>
    </UserContext.Provider>
  );
};

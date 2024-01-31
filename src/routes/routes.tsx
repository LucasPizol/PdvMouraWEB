import { Routes, Route, BrowserRouter } from "react-router-dom";
import { Login } from "../page/Auth/Login";
import { DefaultPage } from "../components/default_page/DefaultPage";
import { PdvPage } from "../page/PdvPage/PdvPage";
import { useAuthContext } from "../context/AuthContext";
import { Stock } from "../page/ListViews/Stock/Stock";
import { Item } from "../page/Register/Item/Item";
import { ListFavorecidos } from "../page/ListViews/Favorecidos/ListFavorecidos";
import { Historic } from "../page/ListViews/Historic/Historic";
import { Pedido } from "../page/Register/Pedido/Pedido";
import { Customers } from "../page/ListViews/Customers/Customers";
import { Favorecido } from "../page/Register/Favorecido/Favorecido";
import { RedirectPage } from "./RedirectPage";
import { ListPdvs } from "../page/ListViews/PdvDeSucesso/ListViewModel";

interface User {
  cod: string;
  email: string;
  role: string;
  equipe: { id: number; empresas: number }[];
}
[];

export type UserType = User[] | null | undefined;

export const RoutesApp = () => {
  const { user } = useAuthContext();

  return (
    <BrowserRouter>
      <Routes>
        {!user && (
          <>
            <Route path="/auth/login" element={<Login />} />
            <Route
              path="*"
              element={<RedirectPage routeString="/auth/login" />}
            />
          </>
        )}

        {user && (
          <>
            <Route path="/" element={<DefaultPage Component={Stock} />} />
            <Route
              path="/novo/item"
              element={<DefaultPage Component={Item} />}
            />
            <Route
              path="/favorecidos"
              element={<DefaultPage Component={ListFavorecidos} />}
            />
            <Route
              path="/novo/favorecido"
              element={<DefaultPage Component={Favorecido} />}
            />
            <Route
              path="/historico"
              element={<DefaultPage Component={Historic} />}
            />
            <Route
              path="/novo/pedido"
              element={<DefaultPage Component={Pedido} />}
            />
            <Route
              path="/pdvDeSucesso"
              element={<DefaultPage Component={ListPdvs} />}
            />
            <Route
              path="/customers"
              element={<DefaultPage Component={Customers} />}
            />
            <Route
              path="/pdvPage"
              element={<DefaultPage Component={PdvPage} />}
            />
            <Route path="*" element={<RedirectPage routeString="/" />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
};

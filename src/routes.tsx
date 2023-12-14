import { Routes, Route, BrowserRouter, useNavigate } from "react-router-dom";
import { Stock } from "./Pages/Stock/Stock";
import { NewItem } from "./Pages/NewItem/NewItem";
import { useEffect } from "react";
import { Login } from "./Pages/Auth/Login";
import DefaultPage from "./components/defaultPage/DefaultPage";
import { Favorecidos } from "./Pages/Favorecidos/Favorecidos";
import { NewFavorecido } from "./Pages/NewFavorecido/NewFavorecido";
import { Historic } from "./Pages/Historic/Historic";
import { NewPedido } from "./Pages/NewPedido/NewPedido";
import { PdvDeSucesso } from "./Pages/PdvDeSucesso/PdvDeSucesso";
import { Customers } from "./Pages/Customers/Customers";
import PdvPage from "./Pages/PdvPage/PdvPage";
import { useAuthContext } from "./context/AuthContext";

interface User {
  cod: string;
  email: string;
  role: string;
  equipe: { id: number; empresas: number }[];
}
[];

export type UserType = User[] | null | undefined;

const RedirectPage = ({ routeString }: { routeString: string }) => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate(routeString);
  }, []);

  return <h1>404 Not Found</h1>;
};
export const RoutesApp = () => {
  const { user, isLoading } = useAuthContext();

  if (isLoading) return;

  return (
    <BrowserRouter>
      <Routes>
        {!user ? (
          <>
            <Route path="/auth/login" element={<Login />} />
            <Route
              path="*"
              element={<RedirectPage routeString="/auth/login" />}
            />
          </>
        ) : (
          <>
            <Route path="/" element={<DefaultPage Component={Stock} />} />
            <Route
              path="/novo/item"
              element={<DefaultPage Component={NewItem} />}
            />
            <Route
              path="/update/item/:id"
              element={<DefaultPage Component={NewItem} />}
            />
            <Route
              path="/favorecidos"
              element={<DefaultPage Component={Favorecidos} />}
            />
            <Route
              path="/novo/favorecido"
              element={<DefaultPage Component={NewFavorecido} />}
            />
            <Route
              path="/historico"
              element={<DefaultPage Component={Historic} />}
            />
            <Route
              path="/novo/pedido"
              element={<DefaultPage Component={NewPedido} />}
            />
            <Route
              path="/pdvDeSucesso"
              element={<DefaultPage Component={PdvDeSucesso} />}
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

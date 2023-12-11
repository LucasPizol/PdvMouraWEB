import { Routes, Route, BrowserRouter } from "react-router-dom";
import { Stock } from "./Pages/Stock/Stock";
import { NewItem } from "./Pages/NewItem/NewItem";

export const RoutesApp = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Stock />} />
        <Route path="/novoItem" element={<NewItem />} />
      </Routes>
    </BrowserRouter>
  );
};

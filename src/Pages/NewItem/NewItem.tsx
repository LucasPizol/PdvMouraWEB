import { supabase } from "../../supabase";
import { useQuery } from "react-query";
import { Menu } from "../../components/menu/Menu";
import "./NewItem.css";

const getCategories = async () => {
  const { data, error } = await supabase.from("categoria").select();

  return { data, error };
};

export const NewItem = () => {
  const { data } = useQuery("getCategories", getCategories);

  return (
    <main className="stockContainer">
      <Menu />
      <main className="newItemContent">
        <div className="panel">
          <header className="stockPanelHeader">
            <h1>Estoque</h1>
            <div>
              <input
                placeholder="Procure um item"
                type="search"
                name=""
                id=""
              />
            </div>
          </header>
          <form>
            <div className="inputGroup">
              <label htmlFor="itemName">Nome do item</label>
              <input type="text" name="itemName" id="itemName" />
            </div>
            <div className="inputGroup">
              <label htmlFor="itemName">Categoria</label>
              <select>
                {data?.data?.map((item) => (
                  <option value={item.id}>{item.categoria}</option>
                ))}
              </select>
            </div>
          </form>
        </div>
      </main>
    </main>
  );
};

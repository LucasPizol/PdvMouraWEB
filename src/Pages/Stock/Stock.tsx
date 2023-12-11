import { useState, ChangeEvent, useEffect } from "react";
import { Menu } from "../../components/menu/Menu";
import "./Stock.css";
import { MdSearch, MdCheckCircleOutline, MdBlock } from "react-icons/md";
import { IoAlertCircleOutline } from "react-icons/io5";
import { supabase, userData } from "../../supabase";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";

interface Material {
  id: number;
  item: string;
  estoque_minimo: number;
  qtd_disponivel: number;
  categoria: { categoria: string }[];
}

const getItemsFromStock = async () => {
  //@ts-ignore
  const equipe: { id: number; empresas: number } = userData.data![0].equipe;
  const { data, error } = await supabase
    .from("estoque")
    .select(
      `id,
      item,
      estoque_minimo,
      qtd_disponivel,
      categoria:id_categoria(categoria)
    `
    )
    .eq("id_empresa", equipe.empresas);
  return { data, error };
};

export const Stock = () => {
  const [checked, setChecked] = useState<number[]>([]);
  const { data } = useQuery("getMaterials", getItemsFromStock);

  const [materials, setMaterials] = useState<Material[] | null | undefined>();

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const filtered = data?.data?.filter((material: Material) =>
      material.item.toLowerCase().includes(e.currentTarget.value.toLowerCase())
    );

    setMaterials(filtered);
  };

  const checkAll = () => {
    if (!materials) return;

    const mappedArray = materials.map((item: Material) => item.id);
    if (mappedArray.length === checked.length) {
      setChecked([]);
      return;
    }

    setChecked(mappedArray);
  };

  const checkFromId = (id: number) => {
    const findInChecked = checked.findIndex((number: number) => number === id);

    if (findInChecked !== -1) {
      const filtered = checked.filter((number: number) => number !== id);
      setChecked(filtered);
      return;
    }

    setChecked([...checked, id]);
  };

  const isChecked = (id: number) => {
    return checked.findIndex((number: number) => number === id) !== -1;
  };

  useEffect(() => {
    console.log(data?.data);
    setMaterials(data?.data);
  }, [data]);

  return (
    <main className="stockContainer">
      <Menu />
      <div className="stockContent">
        <div className="stockPanel">
          <header className="stockPanelHeader">
            <h1>Estoque</h1>
            <div>
              <input
                placeholder="Procure um item"
                type="search"
                onChange={handleSearch}
                name=""
                id=""
              />
              <MdSearch className="searchIcon" />
            </div>
          </header>
          <div className="stockTable">
            <div className="stockTableHeader stockTableRow">
              <input
                type="checkbox"
                name=""
                id=""
                onChange={checkAll}
                checked={checked.length === materials?.length}
              />
              <p>Nome do produto</p>
              <p>Categoria</p>
              <p>Estoque mín.</p>
              <p>Qtd disponível</p>
              <p>Situação</p>
            </div>
            <div className="stockTableContent">
              {materials?.map(
                ({ id, item, estoque_minimo, qtd_disponivel, categoria }) => (
                  <div key={id} className="stockTableRow">
                    <input
                      type="checkbox"
                      name=""
                      id=""
                      checked={isChecked(id)}
                      onChange={() => checkFromId(id)}
                    />
                    <p>{item}</p>
                    <p>
                      {
                        //@ts-ignore
                        categoria.categoria
                      }
                    </p>
                    <p>{estoque_minimo}</p>
                    <p>{qtd_disponivel}</p>
                    <p>
                      {qtd_disponivel >= estoque_minimo ? (
                        <MdCheckCircleOutline size={25} color="#1646E6" />
                      ) : qtd_disponivel !== 0 ? (
                        <IoAlertCircleOutline size={25} color="#FF9900" />
                      ) : (
                        <MdBlock size={25} color="#f00" />
                      )}
                    </p>
                  </div>
                )
              )}
            </div>
            <Link to="/novoItem">Novo item</Link>
          </div>
        </div>
      </div>
    </main>
  );
};

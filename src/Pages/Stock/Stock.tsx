import { useState, ChangeEvent, useEffect, useContext } from "react";
import styles from "./styles.module.scss";
import {
  MdSearch,
  MdCheckCircleOutline,
  MdBlock,
  MdEditSquare,
} from "react-icons/md";
import { IoAlertCircleOutline } from "react-icons/io5";
import { supabase } from "../../supabase";
import { useQuery } from "react-query";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../../routes";
import { useCheck } from "../../hooks/useCheck";

interface Material {
  id: number;
  item: string;
  estoque_minimo: number;
  qtd_disponivel: number;
  categoria: { categoria: string }[];
}

export const Stock = () => {
  const userData = useContext(UserContext);

  const getItemsFromStock = async () => {
    if (!userData) return;
    //@ts-ignore
    const equipe: { id: number; empresas: number } = userData[0].equipe;

    const { data, error } = await supabase
      .from("estoque")
      .select(
        `id,
        item,
        estoque_minimo,
        qtd_disponivel,
        categoria:id_categoria(id, categoria)
      `
      )
      .eq("id_empresa", equipe.empresas)
      .order("item");
    return { data, error };
  };

  const { data } = useQuery("getMaterials", getItemsFromStock);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userData) navigate("/auth/login");
  }, [userData]);

  const [materials, setMaterials] = useState<Material[] | null | undefined>();
  const { checked, checkAll, checkFromId, isChecked } = useCheck(materials);

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const filtered = data?.data?.filter((material: Material) =>
      material.item.toLowerCase().includes(e.currentTarget.value.toLowerCase())
    );
    setMaterials(filtered);
  };

  useEffect(() => {
    setMaterials(data?.data);
  }, [data]);

  return (
    <div className={styles.stockPanel}>
      <header className={styles.stockPanelHeader}>
        <h1>Estoque</h1>
        <nav>
          <Link to="/novo/item">Novo item</Link>
          <div>
            <input
              placeholder="Procure um item"
              type="search"
              onChange={handleSearch}
              name=""
              id=""
            />
            <MdSearch className={styles.searchIcon} />
          </div>
        </nav>
      </header>
      <div className={styles.stockTable}>
        <div className={styles.stockTableHeader}>
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
          <p>Editar</p>
        </div>
        <div className={styles.stockTableContent}>
          {materials?.map(
            ({ id, item, estoque_minimo, qtd_disponivel, categoria }) => (
              <div key={id} className={styles.stockTableRow}>
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
                <button
                  className={styles.button}
                  onClick={() =>
                    navigate(`/novo/item`, {
                      state: {
                        id,
                        item,
                        estoque_minimo,
                        qtd_disponivel,
                        //@ts-ignore
                        id_categoria: categoria.id,
                      },
                    })
                  }
                >
                  <MdEditSquare size={25} color="#1646E6" />
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

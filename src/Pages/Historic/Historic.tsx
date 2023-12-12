import { ChangeEvent, useContext, useEffect, useState } from "react";
import styles from "./styles.module.scss";
import { Link, useNavigate } from "react-router-dom";
import { MdSearch } from "react-icons/md";
import { useQuery } from "react-query";
import { UserContext } from "../../routes";
import { supabase } from "../../supabase";
import { useCheck } from "../../hooks/useCheck";

interface Historico {
  id: number;
  favorecido: string;
  item: string;
  created_at: Date;
  quantidade: number;
}

export const Historic = () => {
  const userData = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userData) navigate("/auth/login");
  }, [userData]);

  const getHistorico = async () => {
    if (!userData) return;
    //@ts-ignore
    const equipe: { id: number; empresas: number } = userData[0].equipe;

    const { data, error } = await supabase
      .from("historico")
      .select(
        `id,
        favorecido:id_favorecido(favorecido),
        item:id_item(item),
        quantidade,
        tipo,
        created_at
        `
      )
      .eq("id_empresa", equipe.empresas)
      .order("created_at", { ascending: false });
    //@ts-ignore
    const formattedData: Historico[] = data?.map((order) => {
      return {
        //@ts-ignore
        favorecido: order?.favorecido?.favorecido,
        //@ts-ignore
        item: order.item.item,
        quantidade: order.quantidade,
        created_at: order.created_at,
        id: order.id,
      };
    });

    return { data: formattedData, error };
  };

  const { data } = useQuery("getHistorico", getHistorico);
  const [favorecidos, setFavorecidos] = useState<
    Historico[] | null | undefined
  >();

  const { checked, checkAll, checkFromId, isChecked } = useCheck(favorecidos);

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const filtered = data?.data?.filter((historico: Historico) =>
      //@ts-ignore
      historico.favorecido
        .toLowerCase()
        .includes(e.currentTarget.value.toLowerCase())
    );

    setFavorecidos(filtered);
  };

  useEffect(() => {
    setFavorecidos(data?.data);
  }, [data]);

  return (
    <div className={styles.stockPanel}>
      <header className={styles.stockPanelHeader}>
        <h1>Histórico</h1>
        <nav>
          <Link to="/novo/pedido">Novo pedido</Link>
          <div>
            <input
              placeholder="Procure um nome / item"
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
            checked={checked.length === favorecidos?.length}
          />
          <p>Item</p>
          <p>Favorecido</p>
          <p>Quantidade</p>
          <p>Data</p>
        </div>
        <div className={styles.stockTableContent}>
          {favorecidos?.map(
            ({ id, favorecido, item, created_at, quantidade }) => (
              <div key={id} className={styles.stockTableRow}>
                <input
                  type="checkbox"
                  name=""
                  id=""
                  checked={isChecked(id)}
                  onChange={() => checkFromId(id)}
                />
                <p>{item}</p>
                <p>{favorecido || "Entrada"}</p>
                <p>{quantidade}</p>
                <p>
                  {new Date(created_at).toLocaleDateString("pt-br", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

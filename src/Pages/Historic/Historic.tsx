import { ChangeEvent, useEffect, useState } from "react";
import styles from "./styles.module.scss";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import { UserType } from "../../routes";
import { supabase } from "../../supabase";
import { useCheck } from "../../hooks/useCheck";
import { IoTrashSharp } from "react-icons/io5";
import Swal from "sweetalert2";
import { useAuthContext } from "../../context/AuthContext";

interface Historico {
  id: any;
  favorecido: {
    favorecido: any;
  }[];
  item: {
    id: any;
    item: any;
    qtd_disponivel: any;
    estoque_minimo: any;
    id_categoria: any;
    id_empresa: any;
    created_at: any;
  }[];
  quantidade: any;
  tipo: any;
  created_at: any;
}
const getHistorico = async (user: UserType) => {
  if (!user) return;
  //@ts-ignore
  const equipe: { id: number; empresas: number } = user[0].equipe;

  const { data, error } = await supabase
    .from("historico")
    .select(
      `id,
      favorecido:id_favorecido(favorecido),
      item:id_item(id, item, qtd_disponivel, estoque_minimo, id_categoria, id_empresa, created_at),
      quantidade,
      tipo,
      created_at
      `
    )
    .eq("id_empresa", equipe.empresas)
    .order("created_at", { ascending: false });

  return { data, error };
};

const today = new Date();

export const Historic = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const { data, refetch } = useQuery("getHistorico", () => getHistorico(user));
  const [favorecidos, setFavorecidos] = useState<
    Historico[] | null | undefined
  >();
  const [fields, setFields] = useState<{
    favorecido: string;
    item: string;
    firstDate: string;
    lastDate: string;
  }>({
    favorecido: "",
    item: "",
    firstDate: new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .split("T")[0],
    lastDate: today.toISOString().split("T")[0],
  });

  const { checked, checkAll, checkFromId, isChecked, uncheckAll } =
    useCheck(favorecidos);

  const handleSearch = (
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>
  ) => {
    const field = { ...fields, [e.currentTarget.name]: e.currentTarget.value };

    const formattedLastDate = field.lastDate
      ? `${field.lastDate.split("-")[0]}-${field.lastDate.split("-")[1]}-${
          Number(field.lastDate.split("-")[2]) + 1
        }`
      : new Date(today.getFullYear(), today.getMonth() + 1, today.getDay() + 1)
          .toISOString()
          .split("T")[0];

    setFields(field);

    const filteredMaterials = data?.data?.filter((item: Historico) => {
      //@ts-ignore
      const checkItem = item?.item.item
        ?.toLowerCase()
        .includes(field.item.toLowerCase());
      const checkFavorecido =
        item.favorecido ||
        "Entrada".toLowerCase().includes(field.favorecido.toLowerCase());

      const checkData =
        //@ts-ignore
        item.created_at >= field.firstDate &&
        //@ts-ignore
        item.created_at < formattedLastDate;

      return checkItem && checkFavorecido && checkData;
    });

    setFavorecidos(filteredMaterials);
  };

  const handleRemoveItems = async () => {
    const confirm = await Swal.fire({
      title: "Atenção!",
      icon: "warning",
      text: `Deseja realmente exluir ${checked.length} item(ns)? Todo o estoque será adicionado ao produto novamente.`,
      confirmButtonText: "Sim",
      denyButtonText: "Não",
      showDenyButton: true,
    });

    const formatted = checked.map((id) => {
      const item = data?.data?.find(
        (historico: Historico) => historico.id === id
      );

      if (!item) return;

      return {
        //@ts-ignore
        id: item.item.id,
        //@ts-ignore
        item: item.item.item,
        //@ts-ignore
        estoque_minimo: item.item.estoque_minimo,
        //@ts-ignore
        id_categoria: item.item.id_categoria,
        //@ts-ignore
        created_at: item.item.created_at,
        //@ts-ignore

        id_empresa: item.item.id_empresa,
        qtd_disponivel:
          //@ts-ignore
          item?.favorecido?.favorecido === null
            ? //@ts-ignore
              Number(item.item.qtd_disponivel) + item.quantidade
            : //@ts-ignore

              Number(item.item.qtd_disponivel) - item.quantidade,
      };
    });
    if (confirm.isConfirmed) {
      const favorecidoResponse = await supabase
        .from("historico")
        .delete()
        .in("id", checked);
      const estoqueResponse = await supabase.from("estoque").upsert(formatted);

      console.log(favorecidoResponse.data);
      console.log(estoqueResponse.error);

      if (favorecidoResponse.error || estoqueResponse.error) {
        return Swal.fire({
          icon: "error",
          title: "Ocorreu um erro",
        });
      }
      uncheckAll();
      refetch();
    }
  };

  useEffect(() => {
    if (!user) navigate("/auth/login");
    setFavorecidos(data?.data);
  }, [data]);

  return (
    <div className={styles.stockPanel}>
      <header className={styles.stockPanelHeader}>
        <div className={styles.titleDiv}>
          <h1>Histórico</h1>
          <Link to="/novo/pedido">Novo pedido</Link>
        </div>

        <div className={styles.periodo}>
          <div>
            <label htmlFor="firstDate">Inicio</label>
            <input
              type="date"
              name="firstDate"
              id="firstDate"
              onChange={handleSearch}
              value={fields.firstDate}
            />
          </div>
          <div>
            <label htmlFor="lastDate">Fim</label>
            <input
              type="date"
              name="lastDate"
              id="lastDate"
              onChange={handleSearch}
              value={fields.lastDate}
            />
          </div>
        </div>
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
          {checked.length === 0 ? (
            <>
              <p>Item</p>
              <p>Favorecido</p>
              <p>Quantidade</p>
              <p>Data</p>
            </>
          ) : (
            <p
              style={{ width: "200px" }}
              className={styles.remove}
              onClick={handleRemoveItems}
            >
              <IoTrashSharp size={20} />
              {`Remover ${checked.length} item(ns)`}
            </p>
          )}
        </div>
        <div className={styles.stockTableHeaderFilter}>
          <p></p>
          <input
            className={styles.filterHandler}
            style={{ justifySelf: "start" }}
            type="text"
            name="item"
            onChange={handleSearch}
          />
          <input
            className={styles.filterHandler}
            type="text"
            name="favorecido"
            onChange={handleSearch}
          />
        </div>
        <div className={styles.stockTableContent}>
          {favorecidos?.map(
            ({ id, favorecido, item, created_at, quantidade }: Historico) => (
              <div key={id} className={styles.stockTableRow}>
                <input
                  type="checkbox"
                  name=""
                  id=""
                  checked={isChecked(id)}
                  onChange={() => checkFromId(id)}
                />
                <p>
                  {
                    //@ts-ignore
                    item?.item
                  }
                </p>
                <p>
                  {
                    //@ts-ignore
                    favorecido?.favorecido || "Entrada"
                  }
                </p>
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

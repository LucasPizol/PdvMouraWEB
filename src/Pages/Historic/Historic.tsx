import { ChangeEvent, useContext, useEffect, useState } from "react";
import styles from "./styles.module.scss";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import { UserContext, UserType } from "../../routes";
import { supabase } from "../../supabase";
import { useCheck } from "../../hooks/useCheck";

interface Historico {
  id: number;
  favorecido: string;
  item: string;
  created_at: Date;
  quantidade: number;
}
const getHistorico = async (userData: UserType) => {
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
      favorecido: order?.favorecido?.favorecido || "Entrada",
      //@ts-ignore
      item: order.item.item,
      quantidade: order.quantidade,
      created_at: order.created_at,
      id: order.id,
    };
  });

  return { data: formattedData, error };
};

const today = new Date();
today.setDate(today.getDate() + 1);

export const Historic = () => {
  const userData = useContext(UserContext);
  const navigate = useNavigate();

  const { data } = useQuery("getHistorico", () => getHistorico(userData));
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
    firstDate: new Date(2000, 1, 1).toISOString().split("T")[0],
    lastDate: today.toISOString().split("T")[0],
  });

  const { checked, checkAll, checkFromId, isChecked } = useCheck(favorecidos);

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
      const checkItem = item.item
        .toLowerCase()
        .includes(field.item.toLowerCase());
      const checkFavorecido = item.favorecido
        .toLowerCase()
        .includes(field.favorecido.toLowerCase());

      const checkData =
        //@ts-ignore
        item.created_at >= field.firstDate &&
        //@ts-ignore
        item.created_at < formattedLastDate;

      return checkItem && checkFavorecido && checkData;
    });

    setFavorecidos(filteredMaterials);
  };

  // const handleRemoveItems = async () => {
  //   const confirm = await Swal.fire({
  //     title: "Atenção!",
  //     icon: "warning",
  //     text: `Deseja realmente exluir ${checked.length} item(ns)? Todo o estoque será adicionado ao produto novamente.`,
  //     confirmButtonText: "Sim",
  //     denyButtonText: "Não",
  //     showDenyButton: true,
  //   });

  //   if (confirm.isConfirmed) {
  //     const { error } = await supabase
  //       .from("favorecido")
  //       .delete()
  //       .in("id", checked);
  //     if (error) {
  //       return Swal.fire({
  //         icon: "error",
  //         title: "Ocorreu um erro",
  //         text: "Verifique se já foi realizada algum pedido para este favorecido.",
  //       });
  //     }
  //     uncheckAll();
  //     refetch();
  //   }
  // };

  useEffect(() => {
    if (!userData) navigate("/auth/login");
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
            />
          </div>
          <div>
            <label htmlFor="lastDate">Fim</label>
            <input
              type="date"
              name="lastDate"
              id="lastDate"
              onChange={handleSearch}
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
          <p>Item</p>
          <p>Favorecido</p>
          <p>Quantidade</p>
          <p>Data</p>
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
                <p>{favorecido}</p>
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

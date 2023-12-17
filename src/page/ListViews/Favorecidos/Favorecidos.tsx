import { ChangeEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MdEditSquare } from "react-icons/md";
import { useQuery } from "react-query";
import Swal from "sweetalert2";
import FlatList from "flatlist-react/lib";
import styles from "../styles.module.scss";
import { UserType } from "../../../routes/routes";
import { supabase } from "../../../supabase";
import { useAuthContext } from "../../../context/AuthContext";
import { FilterInput } from "../../../components/ui/filter_input/FilterInput";
import { HeaderShown } from "../../../components/ui/header_shown/HeaderShown";
import { useCheck } from "../../../hooks/useCheck";

const gridTemplateColumns = "0.4fr 2fr 1fr";

const getFavorecidos = async (user: UserType) => {
  if (!user) return;
  //@ts-ignore
  const equipe: { id: number; empresas: number } = user[0].equipe;

  const { data, error } = await supabase
    .from("favorecido")
    .select(
      `id,
      favorecido
      `
    )
    .eq("id_empresa", equipe.empresas);
  return { data, error };
};

export const Favorecidos = () => {
  const { user } = useAuthContext();
  const { data, refetch } = useQuery("getFavorecidos", () => getFavorecidos(user));
  const [favorecidos, setFavorecidos] = useState<any>();
  const [fields, setFields] = useState({ favorecido: "" });
  const { checked, checkAll, checkFromId, isChecked, uncheckAll } = useCheck(favorecidos);
  const navigate = useNavigate();

  const handleSearch = (e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>) => {
    const field = { ...fields, [e.currentTarget.name]: e.currentTarget.value };
    setFields(field);
    const filteredFavorecidos = data?.data?.filter(({ favorecido }) => {
      return favorecido.toLowerCase().includes(field.favorecido.toLowerCase());
    });
    setFavorecidos(filteredFavorecidos);
  };

  const handleRemoveItems = async () => {
    const confirm = await Swal.fire({
      title: "Atenção!",
      icon: "warning",
      text: `Deseja realmente exluir ${checked.length} item(ns)? Essa ação não poderá ser desfeita, e todo o histórico deste favorecido será excluido.`,
      confirmButtonText: "Sim",
      denyButtonText: "Não",
      showDenyButton: true,
    });

    if (confirm.isConfirmed) {
      const { error } = await supabase.from("favorecido").delete().in("id", checked);
      if (error) {
        return Swal.fire({
          icon: "error",
          title: "Ocorreu um erro",
          text: "Verifique se já foi realizada algum pedido para este favorecido.",
        });
      }
      uncheckAll();
      refetch();
    }
  };

  const TableRow = ({ id, favorecido }: any) => {
    return (
      <div key={id} className={styles.tableRow} style={{ gridTemplateColumns }}>
        <input type="checkbox" name="" id="" checked={isChecked(id)} onChange={() => checkFromId(id)} />
        <p>{favorecido}</p>
        <button
          className={styles.button}
          onClick={() =>
            navigate(`/novo/favorecido`, {
              state: {
                id,
                favorecido,
              },
            })
          }
        >
          <MdEditSquare size={25} color="#1646E6" />
        </button>
      </div>
    );
  };

  useEffect(() => {
    setFavorecidos(data?.data);
  }, [data]);

  return (
    <div className={styles.mainGrid}>
      <header className={styles.gridHeader}>
        <h1>Favorecidos</h1>
        <Link to="/novo/favorecido">Novo favorecido</Link>
      </header>
      <div className={styles.table}>
        <div className={styles.tableHeader} style={{ gridTemplateColumns }}>
          <input type="checkbox" name="" id="" onChange={checkAll} checked={checked.length === favorecidos?.length} />
          <HeaderShown checked={checked} onClick={handleRemoveItems}>
            <p>Favorecido</p>
            <p>Editar</p>
          </HeaderShown>
        </div>

        <div className={styles.tableFilter} style={{ gridTemplateColumns }}>
          <p></p>
          <FilterInput name="favorecido" onChange={handleSearch} justifyStart />
        </div>
        <div className={styles.tableContent}>
          <FlatList list={favorecidos} renderItem={TableRow} renderWhenEmpty={() => <p>Nada para mostrar</p>} />
        </div>
      </div>
    </div>
  );
};

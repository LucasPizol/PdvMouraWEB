import { ChangeEvent, useEffect, useState } from "react";
import styles from "./styles.module.scss";
import { Link, useNavigate } from "react-router-dom";
import { MdEditSquare } from "react-icons/md";
import { useQuery } from "react-query";
import { UserType } from "../../routes";
import { supabase } from "../../supabase";
import { useCheck } from "../../hooks/useCheck";
import Swal from "sweetalert2";
import { IoTrashSharp } from "react-icons/io5";
import { useAuthContext } from "../../context/AuthContext";

interface Favorecido {
  id: number;
  favorecido: string;
}

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

  const { data, refetch } = useQuery("getFavorecidos", () =>
    getFavorecidos(user)
  );
  const [favorecidos, setFavorecidos] = useState<
    Favorecido[] | null | undefined
  >();
  const [fields, setFields] = useState({ favorecido: "" });
  const { checked, checkAll, checkFromId, isChecked, uncheckAll } =
    useCheck(favorecidos);
  const navigate = useNavigate();

  const handleSearch = (
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>
  ) => {
    const field = { ...fields, [e.currentTarget.name]: e.currentTarget.value };

    setFields(field);

    const filteredFavorecidos = data?.data?.filter(
      ({ favorecido }: Favorecido) => {
        return favorecido
          .toLowerCase()
          .includes(field.favorecido.toLowerCase());
      }
    );

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
      const { error } = await supabase
        .from("favorecido")
        .delete()
        .in("id", checked);
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

  useEffect(() => {
    setFavorecidos(data?.data);
  }, [data]);

  return (
    <div className={styles.stockPanel}>
      <header className={styles.stockPanelHeader}>
        <h1>Favorecidos</h1>
        <Link to="/novo/favorecido">Novo favorecido</Link>
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
              <p>Favorecido</p>
              <p>Editar</p>
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
            name="favorecido"
            onChange={handleSearch}
          />
        </div>
        <div className={styles.stockTableContent}>
          {favorecidos?.map(({ id, favorecido }) => (
            <div key={id} className={styles.stockTableRow}>
              <input
                type="checkbox"
                name=""
                id=""
                checked={isChecked(id)}
                onChange={() => checkFromId(id)}
              />
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
          ))}
        </div>
      </div>
    </div>
  );
};

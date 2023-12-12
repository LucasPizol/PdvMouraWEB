import { ChangeEvent, useContext, useEffect, useState } from "react";
import styles from "./styles.module.scss";
import { Link, useNavigate } from "react-router-dom";
import { MdSearch } from "react-icons/md";
import { useQuery } from "react-query";
import { UserContext } from "../../routes";
import { supabase } from "../../supabase";

interface Favorecido {
  id: number;
  favorecido: string;
}

export const Favorecidos = () => {
  const userData = useContext(UserContext);
  const navigate = useNavigate();

  const getFavorecidos = async () => {
    if (!userData) return;
    //@ts-ignore
    const equipe: { id: number; empresas: number } = userData[0].equipe;

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

  useEffect(() => {
    if (!userData) navigate("/auth/login");
  }, [userData]);

  const { data } = useQuery("getFavorecidos", getFavorecidos);
  const [favorecidos, setFavorecidos] = useState<Favorecido[] | null | undefined>();
  const [checked, setChecked] = useState<number[]>([]);

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const filtered = data?.data?.filter((favorecido: Favorecido) =>
      favorecido.favorecido.toLowerCase().includes(e.currentTarget.value.toLowerCase())
    );
    setFavorecidos(filtered);
  };

  const checkAll = () => {
    if (!favorecidos) return;
    const mappedArray = favorecidos.map((item: Favorecido) => item.id);
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

  useEffect(() => {
    setFavorecidos(data?.data);
  }, [data]);

  const isChecked = (id: number) => {
    return checked.findIndex((number: number) => number === id) !== -1;
  };
  return (
    <div className={styles.stockPanel}>
      <header className={styles.stockPanelHeader}>
        <h1>Estoque</h1>
        <nav>
          <Link to="/novoItem">Novo item</Link>
          <div>
            <input placeholder="Procure um item" type="search" onChange={handleSearch} name="" id="" />
            <MdSearch className={styles.searchIcon} />
          </div>
        </nav>
      </header>
      <div className={styles.stockTable}>
        <div className={styles.stockTableHeader}>
          <input type="checkbox" name="" id="" onChange={checkAll} checked={checked.length === favorecidos?.length} />
          <p>#</p>
          <p>Favorecido</p>
        </div>
        <div className={styles.stockTableContent}>
          {favorecidos?.map(({ id, favorecido }) => (
            <div key={id} className={styles.stockTableRow}>
              <input type="checkbox" name="" id="" checked={isChecked(id)} onChange={() => checkFromId(id)} />
              <p>{id}</p>
              <p>{favorecido}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

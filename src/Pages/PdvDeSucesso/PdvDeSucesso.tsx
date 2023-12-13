import { useContext, useEffect, useState } from "react";
import styles from "./styles.module.scss";
import { Link, useNavigate } from "react-router-dom";
import { MdMoreVert, MdSearch, MdRemoveRedEye } from "react-icons/md";
import { UserContext, UserType } from "../../routes";
import { supabase } from "../../supabase";
import { useQuery } from "react-query";

export interface PDVdeSucesso {
  customers: { razao_social: string; cod: number; cidade: string; user_cod: string; logradouro: string };
  img_url1: string;
  img_url2: string;
  approved: boolean | null;
  id: number;
}

const getDescription = (situation: boolean) => {
  return situation ? "APROVADO" : "REPROVADO";
};

const getUsers = async (userData: UserType) => {
  if (!userData) return;
  //@ts-ignore
  const equipe: { id: number; empresas: number } = userData[0].equipe;

  const { data, error } = await supabase
    .from("users")
    .select("cod,equipe: id_equipe(id_empresa)")
    .eq("role", "salesperson")
    .eq("equipe.id_empresa", equipe.empresas)
    .order("cod");
  return { data, error };
};

export const PdvDeSucesso = () => {
  const userData = useContext(UserContext);
  const navigate = useNavigate();

  const users = useQuery("getSellers", () => getUsers(userData));
  const [customers, setCustomers] = useState<any>();

  const handleSearchForItems = async (e: any) => {
    const value = e.currentTarget.value;
    if (!userData) return;
    const usersData = await getUsers(userData);

    const { data } =
      value === "Todos"
        ? await supabase
            .from("pdvs")
            .select("customers!inner (razao_social, cidade, cod, user_cod, logradouro),img_url1,img_url2,approved,id")
            .in(
              "customers.user_cod",
              usersData!.data!.map((seller: { cod: number }) => seller.cod)
            )
            .order("razao_social", { referencedTable: "customers" })
        : await supabase
            .from("pdvs")
            .select("customers!inner (razao_social, cidade, cod, user_cod, logradouro),img_url1,img_url2,approved,id")
            .eq("customers.user_cod", value)
            .order("razao_social", { referencedTable: "customers" });

    setCustomers(data);
  };

  useEffect(() => {
    handleSearchForItems({ currentTarget: { value: "Todos" } }).then(() => {});
  }, [userData]);

  return (
    <div className={styles.stockPanel}>
      <header className={styles.stockPanelHeader}>
        <h1>PDVs de Sucesso</h1>
        <select style={{ cursor: "pointer" }} onChange={handleSearchForItems} defaultValue="Todos">
          <option value="Todos">Todos</option>
          {users?.data?.data?.map((seller: any) => (
            <option value={seller.cod}> {seller.cod}</option>
          ))}
        </select>

        <nav>
          <Link to="/novo/pedido">Novo pedido</Link>
          <div>
            <input
              placeholder="Procure um nome / item"
              type="search"
              //onChange={handleSearch}
              name=""
              id=""
            />
            <MdSearch className={styles.searchIcon} />
          </div>
        </nav>
      </header>
      <div className={styles.stockTable}>
        <div className={styles.stockTableHeader}>
          <p>Codigo</p>
          <p>Razão Social</p>
          <p>Cidade</p>
          <p>Vendedor</p>
          <p>Ações</p>
        </div>
        <div className={styles.stockTableContent}>
          {customers?.map(({ id, customers, img_url1, img_url2, approved }: PDVdeSucesso) => (
            <div key={customers?.cod} className={styles.stockTableRow}>
              <p>{customers?.cod}</p>
              <p>{customers?.razao_social}</p>
              <p>{customers?.cidade}</p>
              <p>{customers?.user_cod}</p>
              <p>{approved === null ? "Aguardando" : getDescription(approved)}</p>
              <button onClick={() => navigate("/pdvPage", { state: { id, customers, img_url1, img_url2, approved } })} className={styles.button}>
                <MdRemoveRedEye size={25} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

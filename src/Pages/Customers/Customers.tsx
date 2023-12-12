import { useContext, useEffect, useState } from "react";
import styles from "./styles.module.scss";
import { Link, useNavigate } from "react-router-dom";
import { MdSearch } from "react-icons/md";
import { useQuery } from "react-query";
import { UserContext, UserType } from "../../routes";
import { supabase } from "../../supabase";
import { useCheck } from "../../hooks/useCheck";

const getUsers = async (userData: UserType) => {
  if (!userData) return;
  //@ts-ignore
  const equipe: { id: number; empresas: number } = userData[0].equipe;

  const { data, error } = await supabase
    .from("users")
    .select("cod, equipe: id_equipe(id_empresa)")
    .eq("role", "salesperson")
    .eq("equipe.id_empresa", equipe.empresas)
    .order("cod");

  return { data, error };
};

export const Customers = () => {
  const [customers, setCustomers] = useState<any | null | undefined>();
  const { checked, checkAll, checkFromId, isChecked } = useCheck(customers);

  const userData = useContext(UserContext);
  const navigate = useNavigate();

  const users = useQuery("getSellers", () => getUsers(userData));

  //   const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
  //     const filtered = data?.data?.filter((historico: Historico) =>
  //       //@ts-ignore
  //       historico.favorecido
  //         .toLowerCase()
  //         .includes(e.currentTarget.value.toLowerCase())
  //     );

  //     setFavorecidos(filtered);
  //   };

  const handleSearchForItems = async (e: any) => {
    if (!userData) return;
    //@ts-ignore
    const equipe: { id: number; empresas: number } = userData[0].equipe;
    if (!users?.data?.data) return;
    const { data } =
      e.currentTarget.value === "Todos"
        ? await supabase
            .from("customers")
            .select("cod,razao_social,cidade,user_cod,pdvs (id)")
            .in(
              "user_cod",
              users!.data!.data!.map((seller: { cod: number }) => seller.cod)
            )
        : await supabase
            .from("customers")
            .select("cod,razao_social,cidade,user_cod,pdvs (id)")
            .eq("user_cod", e.currentTarget.value)
            .order("razao_social");

    setCustomers(data);
  };

  useEffect(() => {
    if (!userData) navigate("/auth/login");
    handleSearchForItems({ currentTarget: { value: "Todos" } });
  }, [userData, users]);

  useEffect(() => {}, [users]);

  return (
    <div className={styles.stockPanel}>
      <header className={styles.stockPanelHeader}>
        <h1>Clientes</h1>
        <select
          style={{ cursor: "pointer" }}
          onChange={handleSearchForItems}
          defaultValue=""
        >
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
          <input
            type="checkbox"
            name=""
            id=""
            onChange={checkAll}
            checked={checked.length === customers?.length}
          />
          <p>Codigo</p>
          <p>Razão Social</p>
          <p>Cidade</p>
          <p>Vendedor</p>
          <p>PDV de Sucesso</p>
        </div>
        <div className={styles.stockTableContent}>
          {customers?.map(
            ({ cod, razao_social, cidade, user_cod, pdvs }: any) => (
              <div key={cod} className={styles.stockTableRow}>
                <input
                  type="checkbox"
                  name=""
                  id=""
                  checked={isChecked(cod)}
                  onChange={() => checkFromId(cod)}
                />
                <p>{cod}</p>
                <p>{razao_social}</p>
                <p>{cidade}</p>
                <p>{user_cod}</p>
                <p>{pdvs.length === 0 ? "Não" : "Sim"}</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

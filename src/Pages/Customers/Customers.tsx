import { ChangeEvent, useContext, useEffect, useState } from "react";
import styles from "./styles.module.scss";
import { useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import { UserContext, UserType } from "../../routes";
import { supabase } from "../../supabase";
import FlatList from "flatlist-react";

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

const getData = async (userData: UserType) => {
  if (!userData) return;
  //@ts-ignore
  const equipe: { id: number; empresas: number } = userData[0].equipe;

  const { data, error } = await supabase
    .from("customers")
    .select(
      "cod,razao_social,cidade,users!inner(cod, equipe: id_equipe(id_empresa)),pdvs (id)"
    )
    .order("razao_social")
    .eq("users.equipe.id_empresa", equipe.empresas);

  return { data, error };
};

const TableRow = ({ cod, razao_social, cidade, users, pdvs }: any) => {
  return (
    <div key={cod} className={styles.stockTableRow}>
      <p>{cod}</p>
      <p>{razao_social}</p>
      <p>{cidade}</p>
      <p>{users.cod}</p>
      <p>{pdvs.length === 0 ? "Não" : "Sim"}</p>
    </div>
  );
};

export const Customers = () => {
  const [customers, setCustomers] = useState<any | null | undefined>();
  const [fields, setFields] = useState({
    cod: "",
    razao_social: "",
    cidade: "",
    user_cod: "",
    pdv: "Todos",
  });

  const userData = useContext(UserContext);
  const navigate = useNavigate();
  const users = useQuery("getSellers", () => getUsers(userData));
  const customersList = useQuery("getCustomersPage", () => getData(userData));

  const handleSearch = (
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>
  ) => {
    const field = { ...fields, [e.currentTarget.name]: e.currentTarget.value };

    setFields(field);
    console.log(field.pdv);
    const filteredCustomers = customersList?.data?.data?.filter(
      (customer: any) => {
        const checkRazao = customer.razao_social
          .toLowerCase()
          .includes(field.razao_social.toLowerCase());
        const checkCod = String(customer.cod).includes(field.cod);
        const checkCity = customer.cidade
          .toLowerCase()
          .includes(field.cidade.toLowerCase());

        const checkUserCod =
          field.user_cod === "Todos"
            ? true
            : String(customer.users.cod).includes(field.user_cod);

        const checkPdv =
          field.pdv === "Todos"
            ? true
            : field.pdv === "Sim"
            ? customer.pdvs.length >= 1
            : customer.pdvs.length === 0;

        return checkRazao && checkCod && checkCity && checkUserCod && checkPdv;
      }
    );

    setCustomers(filteredCustomers);
  };

  useEffect(() => {
    if (!userData) navigate("/auth/login");
    setCustomers(customersList?.data?.data);
  }, [customersList.data]);

  return (
    <div className={styles.stockPanel}>
      <header className={styles.stockPanelHeader}>
        <h1>Clientes</h1>
      </header>
      <div className={styles.stockTable}>
        <div className={styles.stockTableHeader}>
          <p>Codigo</p>
          <p>Razão Social</p>
          <p>Cidade</p>
          <p>Vendedor</p>
          <p>PDV de Sucesso</p>
        </div>
        <div className={styles.stockTableHeaderFilter}>
          <input
            className={styles.filterHandler}
            onChange={handleSearch}
            type="search"
            name="cod"
            style={{ justifySelf: "start" }}
          />
          <input
            className={styles.filterHandler}
            onChange={handleSearch}
            type="search"
            name="razao_social"
            style={{ justifySelf: "start" }}
          />
          <input
            onChange={handleSearch}
            type="search"
            name="cidade"
            className={styles.filterHandler}
          />
          <select
            style={{ cursor: "pointer" }}
            onChange={handleSearch}
            defaultValue=""
            className={styles.filterHandler}
            name="user_cod"
          >
            <option value="Todos">Todos</option>
            {users?.data?.data?.map((seller: any) => (
              <option value={seller.cod}> {seller.cod}</option>
            ))}
          </select>
          <select
            style={{ cursor: "pointer" }}
            onChange={handleSearch}
            defaultValue=""
            className={styles.filterHandler}
            name="pdv"
          >
            <option value="Todos">Todos</option>
            <option value="Sim">Sim</option>
            <option value="Não">Não</option>
          </select>
        </div>
        <div className={styles.stockTableContent}>
          <FlatList
            list={customers}
            renderItem={TableRow}
            renderWhenEmpty={() => <p>Nada para mostrar</p>}
          />
        </div>
      </div>
    </div>
  );
};

import { ChangeEvent, useEffect, useState } from "react";
import { useQuery } from "react-query";
import FlatList from "flatlist-react";
import styles from "../styles.module.scss";
import { UserType } from "../../../routes/routes";
import { supabase } from "../../../supabase";
import { useAuthContext } from "../../../context/AuthContext";
import { FilterInput } from "../../../components/ui/filter_input/FilterInput";
import Select from "../../../components/ui/select/Select";

const gridTemplateColumns = "0.6fr 3fr 2fr 0.6fr 2fr";
const pdvsStatus = [{ value: "Todos" }, { value: "Sim" }, { value: "Não" }];

type Customers =
  | {
      cod: string;
      equipe: {
        id_empresa: number;
      }[];
    }[]
  | null;

const getUsers = async (user: UserType) => {
  if (!user) return;
  //@ts-ignore
  const equipe: { id: number; empresas: number } = user[0].equipe;
  const { data, error }: { data: Customers; error: any } = await supabase
    .from("users")
    .select("cod, equipe: id_equipe(id_empresa)")
    .ilike("cod", `%${String(equipe.id).slice(0, 3)}%`)
    .eq("role", "salesperson")
    .order("cod");

  console.log(data);
  return { data, error };
};

const getData = async (user: UserType) => {
  if (!user) return;
  //@ts-ignore
  const equipe: { id: number; empresas: number } = user[0].equipe;

  const { data, error } = await supabase
    .from("customers")
    .select(
      "cod,razao_social,cidade,users!inner(cod, equipe!users_id_equipe_fkey(id_empresa)),pdvs (id)"
    )
    .order("razao_social")
    .ilike("users.cod", `%${String(equipe.id).slice(0, 3)}%`);

  return { data, error };
};

const TableRow = ({ cod, razao_social, cidade, users, pdvs }: any) => {
  return (
    <div key={cod} className={styles.tableRow} style={{ gridTemplateColumns }}>
      <p>{cod}</p>
      <p>{razao_social}</p>
      <p>{cidade}</p>
      <p>{users.cod}</p>
      <p>{pdvs.length === 0 ? "Não" : "Sim"}</p>
    </div>
  );
};

export const Customers = () => {
  const { user } = useAuthContext();
  const [customers, setCustomers] = useState<any>();
  const [fields, setFields] = useState({
    cod: "",
    razao_social: "",
    cidade: "",
    user_cod: "",
    pdv: "Todos",
  });

  const users = useQuery("getSellers", () => getUsers(user));
  const customersList = useQuery("getCustomersPage", () => getData(user));

  const handleSearch = (
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>
  ) => {
    const field = { ...fields, [e.currentTarget.name]: e.currentTarget.value };

    setFields(field);
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

        console.log(field.pdv);
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
    setCustomers(customersList?.data?.data);
  }, [customersList.data]);

  return (
    <div className={styles.mainGrid}>
      <header className={styles.gridHeader}>
        <h1>Clientes</h1>
      </header>
      <div className={styles.table}>
        <div className={styles.tableHeader} style={{ gridTemplateColumns }}>
          <p>Codigo</p>
          <p>Razão Social</p>
          <p>Cidade</p>
          <p>Vendedor</p>
          <p>PDV de Sucesso</p>
        </div>
        <div className={styles.tableFilter} style={{ gridTemplateColumns }}>
          <FilterInput name="cod" onChange={handleSearch} />
          <FilterInput
            name="razao_social"
            onChange={handleSearch}
            justifyStart
          />
          <FilterInput name="cidade" onChange={handleSearch} />
          <Select
            name="user_cod"
            onChange={handleSearch}
            text_key="cod"
            value_key="cod"
            array={[{ cod: "Todos" }, ...(users?.data?.data || [])]}
          />
          <Select
            name="pdv"
            onChange={handleSearch}
            text_key="value"
            value_key="value"
            array={pdvsStatus}
          />
        </div>
        <div className={styles.tableContent}>
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

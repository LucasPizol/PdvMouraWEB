import { ChangeEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdRemoveRedEye } from "react-icons/md";
import { useQuery } from "react-query";
import styles from "../styles.module.scss";

import FlatList from "flatlist-react/lib";
import { UserType } from "../../../routes/routes";
import { supabase } from "../../../supabase";
import { useAuthContext } from "../../../context/AuthContext";
import { FilterInput } from "../../../components/ui/filter_input/FilterInput";

import Select from "../../../components/ui/select/Select";
const gridTemplateColumns = "0.6fr 1.5fr 1fr 0.6fr 0.6fr 0.6fr";

export interface PDVdeSucesso {
  customers: {
    razao_social: string;
    cod: number;
    cidade: string;
    user_cod: string;
    logradouro: string;
  };
  img_url1: string;
  img_url2: string;
  approved: boolean | null;
  id: number;
}

const situations = [{ value: "Todos" }, { value: "Aguardando" }, { value: "APROVADO" }, { value: "REPROVADO" }];

const getDescription = (situation: boolean) => {
  return situation ? "APROVADO" : "REPROVADO";
};

const getUsers = async (user: UserType) => {
  if (!user) return;
  //@ts-ignore
  const equipe: { id: number; empresas: number } = user[0].equipe;

  const { data, error } = await supabase
    .from("users")
    .select("cod,equipe: id_equipe(id_empresa)")
    .eq("role", "salesperson")
    .eq("equipe.id_empresa", equipe.empresas)
    .order("cod");
  return { data, error };
};

const getCustomers = async (user: UserType) => {
  if (!user) return;
  const usersData = await getUsers(user);

  const { data } = await supabase
    .from("pdvs")
    .select("customers!inner (razao_social, cidade, cod, user_cod, logradouro),img_url1,img_url2,approved,id")
    .in(
      "customers.user_cod",
      usersData!.data!.map((seller: { cod: number }) => seller.cod)
    )
    .order("razao_social", { referencedTable: "customers" });

  return data;
};

export const PdvDeSucesso = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [fields, setFields] = useState({
    cod: "",
    razao_social: "",
    cidade: "",
    user_cod: "Todos",
    situacao: "Todos",
  });

  const users = useQuery("getSellers", () => getUsers(user));
  const customersData = useQuery("getCustomersDataPdv", () => getCustomers(user));
  const [customers, setCustomers] = useState<any>();

  const handleSearch = (e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>) => {
    const field = { ...fields, [e.currentTarget.name]: e.currentTarget.value };

    setFields(field);

    const filteredCustomers = customersData?.data?.filter((pdvDeSucesso: any) => {
      const checkRazao = pdvDeSucesso.customers.razao_social.toLowerCase().includes(field.razao_social.toLowerCase());
      const checkCod = String(pdvDeSucesso.customers.cod).includes(field.cod);
      const checkCity = pdvDeSucesso.customers.cidade.toLowerCase().includes(field.cidade.toLowerCase());

      const checkUserCod = field.user_cod === "Todos" ? true : String(pdvDeSucesso.customers.user_cod).includes(field.user_cod);

      const checkSituacao =
        field.situacao === "Todos"
          ? true
          : pdvDeSucesso.approved === null
          ? field.situacao === "Aguardando"
          : pdvDeSucesso.approved
          ? field.situacao === "APROVADO"
          : field.situacao === "REPROVADO";

      return checkRazao && checkCod && checkCity && checkUserCod && checkSituacao;
    });

    setCustomers(filteredCustomers);
  };

  useEffect(() => {
    setCustomers(customersData?.data);
  }, [customersData.data]);

  const TableRow = ({ id, customers, img_url1, img_url2, approved }: any) => {
    return (
      <div key={customers?.cod} className={styles.tableRow} style={{ gridTemplateColumns }}>
        <p>{customers?.cod}</p>
        <p>{customers?.razao_social}</p>
        <p>{customers?.cidade}</p>
        <p>{customers?.user_cod}</p>
        <p>{approved === null ? "Aguardando" : getDescription(approved)}</p>
        <button
          onClick={() =>
            navigate("/pdvPage", {
              state: { id, customers, img_url1, img_url2, approved },
            })
          }
          className={styles.button}
        >
          <MdRemoveRedEye size={25} />
        </button>
      </div>
    );
  };

  return (
    <div className={styles.mainGrid}>
      <header className={styles.gridHeader}>
        <h1>PDVs de Sucesso</h1>
      </header>
      <div className={styles.table}>
        <div className={styles.tableHeader} style={{ gridTemplateColumns }}>
          <p>Codigo</p>
          <p>Razão Social</p>
          <p>Cidade</p>
          <p>Vendedor</p>
          <p>Situação</p>
          <p>Visualizar</p>
        </div>
        <div className={styles.tableFilter} style={{ gridTemplateColumns }}>
          <FilterInput name="cod" onChange={handleSearch} />
          <FilterInput name="razao_social" onChange={handleSearch} justifyStart />
          <FilterInput name="cidade" onChange={handleSearch} />
          <Select name="user_cod" onChange={handleSearch} text_key="cod" value_key="cod" array={[{ cod: "Todos" }, ...(users?.data?.data || [])]} />
          <Select name="situacao" onChange={handleSearch} text_key="value" value_key="value" array={situations} />
        </div>
        <div className={styles.tableContent}>
          <FlatList list={customers} renderItem={TableRow} renderWhenEmpty={<p>Nada para mostrar</p>} />
        </div>
      </div>
    </div>
  );
};
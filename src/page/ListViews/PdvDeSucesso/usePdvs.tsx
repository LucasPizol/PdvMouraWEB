import { useAuthContext } from "../../../context/AuthContext";
import { UserType } from "../../../routes/routes";
import { supabase } from "../../../supabase";
import { ChangeEvent, useEffect, useState } from "react";

const situacao = (situacao: string | boolean) => {
  switch (situacao) {
    case "Todos":
      return true;
    case null:
      return "Aguardando";
    case true:
      return "APROVADO";
    case false:
      return "REPROVADO";
  }
};

export const usePdvs = () => {
  const { user } = useAuthContext();
  const [customers, setCustomers] = useState<any>();
  const [users, setUsers] = useState<any>();
  const [customersData, setCustomersData] = useState<any>();

  const [fields, setFields] = useState({
    cod: "",
    razao_social: "",
    cidade: "",
    user_cod: "Todos",
    situacao: "Todos",
  });

  const getUsers = async (user: UserType) => {
    if (!user) return;
    //@ts-ignore
    const equipe: { id: number; empresas: number } = user[0].equipe;
    const { data, error }: { data: any; error: any } = await supabase
      .from("users")
      .select("cod, equipe: id_equipe(id_empresa)")
      .ilike("cod", `%${String(equipe.id).slice(0, 3)}%`)
      .eq("role", "salesperson")
      .order("cod");
    return { data, error };
  };

  const getCustomers = async (user: UserType) => {
    if (!user) return { data: null, error: "Usuários não encontrados" };
    const usersData = await getUsers(user);
    const { data } = await supabase
      .from("pdvs")
      .select("customers!inner (razao_social, cidade, cod, user_cod, logradouro),img_url1,img_url2,approved,id")
      .in(
        "customers.user_cod",
        usersData!.data!.map((seller: { cod: number }) => seller.cod)
      )
      .order("razao_social", { referencedTable: "customers" });

    const sorttedData = data?.sort((a, b) => {
      //@ts-ignore
      if (a.customers.razao_social > b.customers.razao_social) return 1;
      //@ts-ignore
      if (a.customers.razao_social < b.customers.razao_social) return -1;
      return 0;
    });

    return { data: sorttedData, error: null };
  };

  const handleSearch = (e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>) => {
    const field = { ...fields, [e.currentTarget.name]: e.currentTarget.value };
    setFields(field);

    const filteredCustomers = customersData?.filter((pdvDeSucesso: any) => {
      const checkRazao = pdvDeSucesso.customers.razao_social.toLowerCase().includes(field.razao_social.toLowerCase());
      const checkCod = String(pdvDeSucesso.customers.cod).includes(field.cod);
      const checkCity = pdvDeSucesso.customers.cidade.toLowerCase().includes(field.cidade.toLowerCase());
      const checkUserCod = field.user_cod === "Todos" ? true : String(pdvDeSucesso.customers.user_cod).includes(field.user_cod);
      const checkSituacao = field.situacao === "Todos" ? true : field.situacao === situacao(pdvDeSucesso.approved);
      return checkRazao && checkCod && checkCity && checkUserCod && checkSituacao;
    });

    setCustomers(filteredCustomers);
  };

  useEffect(() => {
    if (!users && !customersData && !customers) {
      const data = Promise.all([getUsers(user), getCustomers(user)]);

      data.then((response) => {
        setUsers(response[0]?.data);
        setCustomersData(response[1]?.data);
        setCustomers(response[1]?.data);
      });
    }
  }, []);

  return {
    users,
    customers,
    handleSearch,
  };
};

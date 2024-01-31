import { useAuthContext } from "../../../context/AuthContext";
import { useCheck } from "../../../hooks/useCheck";
import { UserType } from "../../../routes/routes";
import { supabase } from "../../../supabase";
import { ChangeEvent, useEffect, useState } from "react";
import { saveAs } from "file-saver";
import JSZip from "jszip";

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

const today = new Date();

export const usePdvs = () => {
  const { user } = useAuthContext();
  const [customers, setCustomers] = useState<any>();
  const [users, setUsers] = useState<any>();
  const [customersData, setCustomersData] = useState<any>();
  const { checked, checkAll, checkFromId, isChecked } = useCheck(customers);

  const [fields, setFields] = useState({
    cod: "",
    razao_social: "",
    cidade: "",
    user_cod: "Todos",
    situacao: "Todos",
    firstDate: new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .split("T")[0],
    lastDate: today.toISOString().split("T")[0],
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
      .select(
        "customers!inner (razao_social, cidade, cod, user_cod, logradouro),img_url1,img_url2,approved,id, created_at, updated_at"
      )
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

  const handleSearch = (
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>
  ) => {
    const field = { ...fields, [e.currentTarget.name]: e.currentTarget.value };
    setFields(field);
    const formattedLastDate = field.lastDate
      ? `${field.lastDate.split("-")[0]}-${field.lastDate.split("-")[1]}-${
          Number(field.lastDate.split("-")[2]) + 1
        }`
      : new Date(today.getFullYear(), today.getMonth() + 1, today.getDay() + 1)
          .toISOString()
          .split("T")[0];
    const filteredCustomers = customersData?.filter((pdvDeSucesso: any) => {
      const checkRazao = pdvDeSucesso.customers.razao_social
        .toLowerCase()
        .includes(field.razao_social.toLowerCase());

      const checkData =
        //@ts-ignore
        pdvDeSucesso.created_at >= field.firstDate &&
        //@ts-ignore
        pdvDeSucesso.created_at < formattedLastDate;

      const checkCod = String(pdvDeSucesso.customers.cod).includes(field.cod);
      const checkCity = pdvDeSucesso.customers.cidade
        .toLowerCase()
        .includes(field.cidade.toLowerCase());
      const checkUserCod =
        field.user_cod === "Todos"
          ? true
          : String(pdvDeSucesso.customers.user_cod).includes(field.user_cod);
      const checkSituacao =
        field.situacao === "Todos"
          ? true
          : field.situacao === situacao(pdvDeSucesso.approved);
      return (
        checkRazao &&
        checkCod &&
        checkCity &&
        checkUserCod &&
        checkSituacao &&
        checkData
      );
    });

    setCustomers(filteredCustomers);
  };

  const handleDownload = async (checked: any, customers: any) => {
    const zip = new JSZip();
    let count = 0;

    customers.sort((a: any, b: any) => {
      if (a.customers.razao_social > b.customers.razao_social) {
        return -1;
      }
      if (a.customers.razao_social < b.customers.razao_social) {
        return 1;
      }
      return 0;
    });

    console.log(customers);

    const createItem = async ({
      img_url1,
      img_url2,
      razao_social,
      cod,
    }: any) => {
      return new Promise(async (resolve) => {
        const res = await fetch(img_url1);
        const blob = await res.blob();
        const newFolder = zip.folder(`${razao_social} (${String(count)})`);
        newFolder?.file(`${String(cod)} - ${razao_social}-IMG1.jpeg`, blob, {
          base64: true,
        });
        if (!img_url2) {
          newFolder?.file(`${String(cod)} - ${razao_social}-IMG2.jpeg`, blob, {
            base64: true,
          });
        }

        resolve(true);
      });
    };

    checked.forEach(async (id: number) => {
      const findBlob = customers.find((item: { id: number }) => item.id === id);
      if (!findBlob.approved) {
        count++;
        return;
      }
      const eachPromises = [];
      eachPromises.push(
        createItem({
          img_url1: findBlob.img_url1,
          img_url2: findBlob.img_url2,
          razao_social: findBlob.customers.razao_social,
          cod: findBlob.customers.cod,
        })
      );

      console.log(findBlob);

      Promise.all(eachPromises)
        .then(() => {
          count += 1;
          check();
        })
        .catch((err) => console.log(err));
    });

    const check = () => {
      if (count === checked.length) {
        zip.generateAsync({ type: "blob" }).then(function (content: any) {
          // see FileSaver.js
          saveAs(content, "PDVs de Sucesso.zip");
        });
      }
    };
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
    checked,
    checkAll,
    checkFromId,
    isChecked,
    handleDownload,
    fields,
  };
};

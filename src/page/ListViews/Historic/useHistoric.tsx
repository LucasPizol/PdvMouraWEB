import { ChangeEvent, useEffect, useState } from "react";
import { supabase } from "../../../supabase";
import Swal from "sweetalert2";
import { useAuthContext } from "../../../context/AuthContext";
import { useCheck } from "../../../hooks/useCheck";
import { UserType } from "../../../routes/routes";

const today = new Date();

type Fields = {
  favorecido: string;
  item: string;
  firstDate: string;
  lastDate: string;
};

export const useHistoric = () => {
  const { user } = useAuthContext();
  const [historic, setHistoric] = useState<any>();
  const [search, setSearch] = useState<any>();
  const { checked, checkAll, checkFromId, isChecked, uncheckAll } = useCheck(historic);

  const [fields, setFields] = useState<Fields>({
    favorecido: "",
    item: "",
    firstDate: new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0],
    lastDate: today.toISOString().split("T")[0],
  });

  const getHistorico = async (user: UserType) => {
    if (!user) return { data: null, error: "Usuário não encontrado" };
    //@ts-ignore
    const equipe: { id: number; empresas: number } = user[0].equipe;

    const { data, error } = await supabase
      .from("historico")
      .select(
        `id,
        favorecido:id_favorecido(favorecido),
        item:id_item(id, item, qtd_disponivel, estoque_minimo, id_categoria, id_empresa, created_at),
        quantidade,
        tipo,
        created_at
        `
      )
      .eq("id_empresa", equipe.empresas)
      .order("created_at", { ascending: false });

    return { data, error };
  };

  const handleSearch = (e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>) => {
    const field = { ...fields, [e.currentTarget.name]: e.currentTarget.value };

    const formattedLastDate = field.lastDate
      ? `${field.lastDate.split("-")[0]}-${field.lastDate.split("-")[1]}-${Number(field.lastDate.split("-")[2]) + 1}`
      : new Date(today.getFullYear(), today.getMonth() + 1, today.getDay() + 1).toISOString().split("T")[0];

    setFields(field);

    const filteredMaterials = search?.filter((item: any) => {
      //@ts-ignore
      const checkItem = item?.item.item?.toLowerCase().includes(field.item.toLowerCase());
      const checkFavorecido = item?.favorecido?.favorecido
        ? item?.favorecido.favorecido?.toLowerCase().includes(field.favorecido.toLowerCase())
        : "entrada".includes(field.favorecido.toLowerCase());

      const checkData =
        //@ts-ignore
        item.created_at >= field.firstDate &&
        //@ts-ignore
        item.created_at < formattedLastDate;

      return checkItem && checkFavorecido && checkData;
    });

    setHistoric(filteredMaterials);
  };

  const handleRemoveItems = async () => {
    const confirm = await Swal.fire({
      title: "Atenção!",
      icon: "warning",
      text: `Deseja realmente exluir ${checked.length} item(ns)? Todo o estoque será adicionado ao produto novamente.`,
      confirmButtonText: "Sim",
      denyButtonText: "Não",
      showDenyButton: true,
    });

    const formatted = checked.map((id: any) => {
      const item = historic?.find((historico: any) => historico.id === id);

      if (!item) return;

      console.log(item.favorecido);

      return {
        //@ts-ignore
        id: item.item.id,
        //@ts-ignore
        item: item.item.item,
        //@ts-ignore
        estoque_minimo: item.item.estoque_minimo,
        //@ts-ignore
        id_categoria: item.item.id_categoria,
        //@ts-ignore
        created_at: item.item.created_at,
        //@ts-ignore

        id_empresa: item.item.id_empresa,
        qtd_disponivel:
          //@ts-ignore
          item?.favorecido === null
            ? //@ts-ignore
              Number(item.item.qtd_disponivel) - item.quantidade
            : //@ts-ignore

              Number(item.item.qtd_disponivel) + item.quantidade,
      };
    });
    if (confirm.isConfirmed) {
      const favorecidoResponse = await supabase.from("historico").delete().in("id", checked);
      const estoqueResponse = await supabase.from("estoque").upsert(formatted);

      if (favorecidoResponse.error || estoqueResponse.error) {
        return Swal.fire({
          icon: "error",
          title: "Ocorreu um erro",
        });
      }
      uncheckAll();
    }
  };

  useEffect(() => {
    getHistorico(user).then(({ data }) => {
      setHistoric(data);
      setSearch(data);
    });
  }, []);

  return {
    handleRemoveItems,
    handleSearch,
    checkAll,
    checkFromId,
    isChecked,
    checked,
    historic,
    fields,
  };
};

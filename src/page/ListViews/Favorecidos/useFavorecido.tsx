import { useState, useEffect, ChangeEvent } from "react";
import { supabase } from "../../../supabase";
import { UserType } from "../../../routes/routes";
import Swal from "sweetalert2";
import { useAuthContext } from "../../../context/AuthContext";
import { useCheck } from "../../../hooks/useCheck";

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
export const useFavorecido = () => {
  const { user } = useAuthContext();
  const [favorecidos, setFavorecidos] = useState<any>();
  const [search, setSearch] = useState<any>();
  const [fields, setFields] = useState({ favorecido: "" });
  const { checked, checkAll, checkFromId, isChecked, uncheckAll } =
    useCheck(favorecidos);

  const handleSearch = (
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>
  ) => {
    const field = { ...fields, [e.currentTarget.name]: e.currentTarget.value };
    setFields(field);
    const filteredFavorecidos = favorecidos?.filter(({ favorecido }: any) => {
      return favorecido.toLowerCase().includes(field.favorecido.toLowerCase());
    });
    setSearch(filteredFavorecidos);
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
    }
  };

  useEffect(() => {
    if (!favorecidos) {
      getFavorecidos(user).then((data) => {
        setFavorecidos(data?.data);
        setSearch(data?.data);
      });
    }
  }, []);

  return {
    search,
    fields,
    setFields,
    handleSearch,
    handleRemoveItems,
    checked,
    checkAll,
    checkFromId,
    isChecked,
    uncheckAll,
  };
};

import { useState, ChangeEvent, useEffect } from "react";
import styles from "../styles.module.scss";
import { MdCheckCircleOutline, MdBlock, MdEditSquare } from "react-icons/md";
import { IoAlertCircleOutline } from "react-icons/io5";
import { useQuery } from "react-query";
import { Link, useNavigate } from "react-router-dom";
import { IoTrashSharp } from "react-icons/io5";
import Swal from "sweetalert2";
import { supabase } from "../../../supabase";
import { useAuthContext } from "../../../context/AuthContext";
import { FilterInput } from "../../../components/ui/filter_input/FilterInput";
import { useCheck } from "../../../hooks/useCheck";
import Select from "../../../components/ui/select/Select";

const gridTemplateColumns = "1fr 3fr 2fr 2fr 2fr 2fr 1fr";

export interface Material {
  id: number;
  item: string;
  estoque_minimo: number;
  qtd_disponivel: number;
  categoria: { id: number; categoria: string }[];
}

const getCategories = async () => {
  const { data, error } = await supabase.from("categoria").select();
  return { data, error };
};

export const Stock = () => {
  const { user } = useAuthContext();

  const getItemsFromStock = async () => {
    if (!user) return;
    //@ts-ignore
    const equipe: { id: number; empresas: number } = user[0].equipe;

    const { data, error } = await supabase
      .from("estoque")
      .select(
        `id,
        item,
        estoque_minimo,
        qtd_disponivel,
        categoria:id_categoria(id, categoria)
      `
      )
      .eq("id_empresa", equipe.empresas)
      .order("item");
    return { data, error };
  };

  const { data } = useQuery("getMaterials", getItemsFromStock);
  const categories = useQuery("getStockCategoies", getCategories);
  const [fields, setFields] = useState({
    item: "",
    categoria: 0,
  });
  const navigate = useNavigate();

  const [materials, setMaterials] = useState<Material[] | null | undefined>();
  const { checked, checkAll, checkFromId, isChecked } = useCheck(materials);

  const handleSearch = (e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>) => {
    const field = { ...fields, [e.currentTarget.name]: e.currentTarget.value };

    setFields(field);

    const filteredMaterials = data?.data?.filter((material: Material) => {
      const checkCategoria =
        Number(field.categoria) === 0
          ? true
          : //@ts-ignore
            Number(field.categoria) === material.categoria.id;

      const checkItem = material.item.toLowerCase().includes(field.item.toLowerCase());

      return checkItem && checkCategoria;
    });

    setMaterials(filteredMaterials);
  };

  const handleRemoveItems = async () => {
    const confirm = await Swal.fire({
      title: "Atenção!",
      icon: "warning",
      text: `Deseja realmente exluir ${checked.length} item(ns)? Essa ação não poderá ser desfeita, e todo o histórico deste produto será excluido.`,
      confirmButtonText: "Sim",
      denyButtonText: "Não",
      showDenyButton: true,
    });

    if (confirm.isConfirmed) {
      await supabase.from("estoque").delete().in("id", checked);
      window.location.reload();
    }
  };

  useEffect(() => {
    setMaterials(data?.data);
  }, [data]);

  return (
    <div className={styles.mainGrid}>
      <header className={styles.gridHeader}>
        <h1>Estoque</h1>
        <Link to="/novo/item">Novo item</Link>
      </header>
      <div className={styles.table}>
        <div className={styles.tableHeader} style={{ gridTemplateColumns }}>
          <input type="checkbox" name="" id="" onChange={checkAll} checked={checked.length === materials?.length} />
          {checked.length === 0 ? (
            <>
              <p>Nome do produto</p>
              <p>Categoria</p>
              <p>Estoque mín.</p>
              <p>Qtd disponível</p>
              <p>Situação</p>
              <p>Editar</p>
            </>
          ) : (
            <p style={{ width: "200px" }} className={styles.remove} onClick={handleRemoveItems}>
              <IoTrashSharp size={20} />
              {`Remover ${checked.length} item(ns)`}
            </p>
          )}
        </div>

        <div className={styles.tableFilter} style={{ gridTemplateColumns }}>
          <p></p>
          <FilterInput name="item" onChange={handleSearch} justifyStart />
          <Select
            array={[...(categories.data?.data || []), { id: 0, categoria: "Todos" }]}
            name="categoria"
            onChange={handleSearch}
            text_key="categoria"
            value_key="id"
          />
        </div>

        <div className={styles.tableContent}>
          {materials?.map(({ id, item, estoque_minimo, qtd_disponivel, categoria }) => (
            <div key={id} className={styles.tableRow} style={{ gridTemplateColumns }}>
              <input type="checkbox" name="" id="" checked={isChecked(id)} onChange={() => checkFromId(id)} />
              <p>{item}</p>
              <p>
                {
                  //@ts-ignore
                  categoria.categoria
                }
              </p>
              <p>{estoque_minimo}</p>
              <p>{qtd_disponivel}</p>
              <p>
                {qtd_disponivel == 0 ? (
                  <MdBlock size={25} color="#f00" />
                ) : qtd_disponivel >= estoque_minimo ? (
                  <MdCheckCircleOutline size={25} color="#1646E6" />
                ) : (
                  <IoAlertCircleOutline size={25} color="#FF9900" />
                )}
              </p>
              <button
                className={styles.button}
                onClick={() =>
                  navigate(`/novo/item`, {
                    state: {
                      id,
                      item,
                      estoque_minimo,
                      qtd_disponivel,
                      //@ts-ignore
                      id_categoria: categoria.id,
                    },
                  })
                }
              >
                <MdEditSquare size={25} color="#1646E6" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

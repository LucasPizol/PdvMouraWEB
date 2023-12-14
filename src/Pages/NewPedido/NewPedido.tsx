import { supabase } from "../../supabase";
import { useQuery } from "react-query";
import styles from "./styles.module.scss";
import { useContext, useEffect } from "react";
import { UserContext } from "../../routes";
import { useNavigate } from "react-router-dom";
import web_developer from "../../assets/web_developer.svg";
import { useForm } from "../../hooks/useForm";
import { MdArrowBack } from "react-icons/md";
import Swal from "sweetalert2";

const initialFields = {
  id_item: 0,
  quantidade: 0,
  id_favorecido: 1,
  tipo: "Saida",
};

export const NewPedido = () => {
  const user = useContext(UserContext);

  const navigate = useNavigate();

  const getData = async () => {
    if (!user) return;
    //@ts-ignore
    const equipe: { id: number; empresas: number } = user[0].equipe;
    const estoqueItems = await supabase
      .from("estoque")
      .select()
      .eq("id_empresa", equipe.empresas)
      .order("item");

    const favorecidos = await supabase
      .from("favorecido")
      .select()
      .eq("id_empresa", equipe.empresas)
      .order("favorecido");

    return {
      favorecidos: favorecidos.data,
      estoqueItems: estoqueItems.data,
      error: estoqueItems.error || favorecidos.error,
    };
  };

  const { data } = useQuery("getData", getData);

  const [fields, changeField] = useForm(initialFields);

  useEffect(() => {
    //if (!user) navigate("/auth/login");
  }, [user]);

  const handleRegister = async (e: any) => {
    e.preventDefault();

    const swalAlert = await Swal.fire({
      title: "Atenção!",
      icon: "warning",
      text: "Deseja realmente cadastrar/atualizar este produto?",
      confirmButtonText: "Sim",
      showDenyButton: true,
      denyButtonText: "Não",
    });

    if (swalAlert.isConfirmed) {
      const addToHistoric = await supabase.from("historico").insert({
        ...fields,
        id_favorecido: fields.tipo === "Entrada" ? null : fields.id_favorecido,
        //@ts-ignore
        id_empresa: user![0].equipe.empresas,
      });

      const findItem = data?.estoqueItems?.find(
        (item) => Number(item.id) === Number(fields.id_item)
      );

      const updateStock = await supabase
        .from("estoque")
        .update({
          qtd_disponivel:
            fields.tipo === "Entrada"
              ? Number(findItem.qtd_disponivel) + Number(fields.quantidade)
              : Number(findItem.qtd_disponivel) - Number(fields.quantidade),
        })
        .eq("id", fields.id_item);

      if (addToHistoric.error || updateStock.error) {
        Swal.fire({
          title: "Erro!",
          icon: "error",
          text: "Ocorreu um erro ao cadastrar seu produto.",
          confirmButtonText: "Ok",
        });
        return;
      }

      const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
        },
      });

      Toast.fire({
        icon: "success",
        title: "Cadastrado com sucesso!",
      });

      navigate("/historico");
    }
  };

  return (
    <div className={styles.panel}>
      <header className={styles.stockPanelHeader}>
        <h1>
          <MdArrowBack
            className={styles.arrowBack}
            onClick={() => navigate("/historico")}
          />
          Adicionando um novo item
        </h1>
      </header>
      <div className={styles.content}>
        <form className={styles.form} onSubmit={handleRegister}>
          <div className={styles.inputGroup}>
            <label htmlFor="id_item">Item</label>
            <select
              name="id_item"
              id="id_item"
              onChange={changeField}
              defaultValue=""
            >
              <option value="" disabled></option>
              {data?.estoqueItems?.map((item) => (
                <option value={item.id}>{item.item}</option>
              ))}
            </select>
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="tipo">Tipo</label>
            <select
              name="tipo"
              id="tipo"
              onChange={changeField}
              value={fields.tipo}
            >
              <option value="Entrada">ENTRADA</option>
              <option value="Saida">SAÍDA</option>
            </select>
          </div>
          {fields.tipo === "Entrada" ? null : (
            <div className={styles.inputGroup}>
              <label htmlFor="id_favorecido">Favorecido</label>
              <select
                name="id_favorecido"
                id="id_favorecido"
                onChange={changeField}
                defaultValue=""
              >
                <option value="" disabled></option>

                {data?.favorecidos?.map((favorecido) => (
                  <option value={favorecido.id}>{favorecido.favorecido}</option>
                ))}
              </select>
            </div>
          )}

          <div className={styles.inputGroup}>
            <label htmlFor="quantidade">Quantidade</label>
            <input
              type="text"
              name="quantidade"
              id="quantidade"
              onChange={changeField}
              value={fields.quantidade}
            />
          </div>
          <button type="submit" className={styles.button}>
            Cadastrar
          </button>
        </form>
        <img src={web_developer} alt="Imagem pessoa cadastrando" />
      </div>
    </div>
  );
};

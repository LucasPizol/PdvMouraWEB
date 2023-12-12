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

const getCategories = async () => {
  const { data, error } = await supabase.from("categoria").select();
  return { data, error };
};

const initialFields = {
  item: "",
  estoque_minimo: 0,
  id_categoria: 1,
};

export const NewItem = () => {
  const { data } = useQuery("getCategories", getCategories);
  const user = useContext(UserContext);
  const navigate = useNavigate();

  const [fields, changeField] = useForm(initialFields);

  useEffect(() => {
    //if (!user) navigate("/auth/login");
  }, [user]);

  const handleRegister = async (e: any) => {
    e.preventDefault();

    const swalAlert = await Swal.fire({
      title: "Atenção!",
      icon: "warning",
      text: "Deseja realmente cadastrar este produto?",
      confirmButtonText: "Sim",
      showDenyButton: true,
      denyButtonText: "Não",
    });

    if (swalAlert) {
      //@ts-ignore
      const { error } = await supabase.from("estoque").insert({ ...fields, qtd_disponivel: 0, id_empresa: user![0].equipe.empresas });

      if (error) {
        console.log(error.message);
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

      navigate("/");
    }
  };

  return (
    <div className={styles.panel}>
      <header className={styles.stockPanelHeader}>
        <h1>
          <MdArrowBack className={styles.arrowBack} onClick={() => navigate("/")} />
          Adicionando um novo item
        </h1>
      </header>
      <div className={styles.content}>
        <form className={styles.form} onSubmit={handleRegister}>
          <div className={styles.inputGroup}>
            <label htmlFor="item">Nome do item</label>
            <input type="text" name="item" id="item" onChange={changeField} />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="categoria">Categoria</label>
            <select name="id_categoria" id="id_categoria" onChange={changeField}>
              {data?.data?.map((item) => (
                <option value={item.id}>{item.categoria}</option>
              ))}
            </select>
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="estoque_minimo">Quantidade Mínima</label>
            <input type="text" name="estoque_minimo" id="estoque_minimo" onChange={changeField} />
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

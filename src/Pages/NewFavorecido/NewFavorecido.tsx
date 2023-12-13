import { supabase } from "../../supabase";
import styles from "./styles.module.scss";
import { useContext, useEffect } from "react";
import { UserContext } from "../../routes";
import { useLocation, useNavigate } from "react-router-dom";
import web_developer from "../../assets/web_developer.svg";
import { useForm } from "../../hooks/useForm";
import { MdArrowBack } from "react-icons/md";
import Swal from "sweetalert2";

const initialFields = {
  favorecido: "",
};

export const NewFavorecido = () => {
  const user = useContext(UserContext);
  const navigate = useNavigate();
  const favorecidoData = useLocation();

  const favorecidoDataFields = favorecidoData.state
    ? {
        favorecido: favorecidoData.state.favorecido,
      }
    : null;

  const [fields, changeField] = useForm(favorecidoDataFields || initialFields);

  useEffect(() => {
    //if (!user) navigate("/auth/login");
  }, [user]);

  const handleRegister = async (e: any) => {
    e.preventDefault();

    const swalAlert = await Swal.fire({
      title: "Atenção!",
      icon: "warning",
      text: "Deseja realmente cadastrar este favorecido?",
      confirmButtonText: "Sim",
      showDenyButton: true,
      denyButtonText: "Não",
    });

    if (swalAlert.isConfirmed) {
      const { error } = favorecidoData.state
        ? await supabase
            .from("favorecido")
            .update(fields)
            .eq("id", favorecidoData.state.id)
        : await supabase.from("favorecido").insert({
            ...fields,
            //@ts-ignore
            id_empresa: user![0].equipe.empresas,
          });

      if (error) {
        Swal.fire({
          title: "Erro!",
          icon: "error",
          text: "Ocorreu um erro ao cadastrar/atualizar seu produto.",
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
        title: "Cadastrado/atualizado com sucesso!",
      });

      navigate("/favorecidos");
    }
  };

  return (
    <div className={styles.panel}>
      <header className={styles.stockPanelHeader}>
        <h1>
          <MdArrowBack
            className={styles.arrowBack}
            onClick={() => navigate("/favorecidos")}
          />
          {favorecidoData.state
            ? "Atualizando favorecido"
            : "Adicionando um novo favorecido"}
        </h1>
      </header>
      <div className={styles.content}>
        <form className={styles.form} onSubmit={handleRegister}>
          <div className={styles.inputGroup}>
            <label htmlFor="favorecido">Nome do favorecido</label>
            <input
              type="text"
              name="favorecido"
              id="favorecido"
              onChange={changeField}
              value={fields.favorecido}
            />
          </div>
          <button type="submit" className={styles.button}>
            {favorecidoData.state ? "Atualizar" : "Cadastrar"}
          </button>
        </form>
        <img src={web_developer} alt="Imagem pessoa cadastrando" />
      </div>
    </div>
  );
};

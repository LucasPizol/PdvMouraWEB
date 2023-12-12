import { useForm } from "../../../hooks/useForm";
import { supabase } from "../../../supabase";
import { ErrorHandling } from "./ErrorHandling";
import styles from "./styles.module.scss";
import { MdPerson, MdLock } from "react-icons/md";
import Swal from "sweetalert2";

const initialFields = {
  email: "",
  password: "",
};

export const Form = () => {
  const [fields, changeField] = useForm(initialFields);

  const handleLogin = async (e: any) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword(fields);

    if (error) {
      return Swal.fire({
        title: "Erro!",
        text: ErrorHandling(error.message),
        icon: "error",
        confirmButtonText: "Cool",
      });
    }

    window.location.href = "/"

    return { data, error };
  };

  return (
    <form className={styles.form}>
      <div className={styles.inputGroup}>
        <label htmlFor="email">Login</label>
        <div className={styles.inputDiv}>
          <MdPerson size={20} color="#555" />
          <input type="email" name="email" id="email" placeholder="Usuário" onChange={changeField} value={fields.email} />
        </div>
      </div>
      <div className={styles.inputGroup}>
        <label htmlFor="password">Senha</label>
        <div className={styles.inputDiv}>
          <MdLock size={20} color="#555" />
          <input type="password" name="password" id="password" placeholder="****" onChange={changeField} value={fields.password} />
        </div>
      </div>
      <button className={styles.button} onClick={handleLogin}>
        Login
      </button>
    </form>
  );
};

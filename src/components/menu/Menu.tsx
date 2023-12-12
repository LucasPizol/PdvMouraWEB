import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./styles.module.scss";
import { GiCardboardBoxClosed } from "react-icons/gi";
import { supabase } from "../../supabase";
import Swal from "sweetalert2";
import { MdAccountCircle, MdStore } from "react-icons/md";
import { VscSignOut } from "react-icons/vsc";
import { UserContext } from "../../routes";

const emailToName = (email: string) => {
  return `${email.split("@")[0].split(".")[0].toUpperCase()} ${email
    .split("@")[0]
    .split(".")[1]
    .toUpperCase()}`;
};

export const Menu = () => {
  const [active, setActive] = useState<number>(0);
  const userData = useContext(UserContext);

  const signOut = async () => {
    const swalAlert = await Swal.fire({
      title: "Atenção!",
      icon: "warning",
      text: "Deseja sair do aplicativo?",
      confirmButtonText: "Sim",
      denyButtonText: "Não",
      showDenyButton: true,
    });

    if (swalAlert.isConfirmed) {
      await supabase.auth.signOut();
      window.location.href = "/auth/login";
    }
  };

  return (
    <aside className={styles.menuContainer}>
      <header className={styles.header}>
        <h2>{userData ? emailToName(userData![0].email) : ""}</h2>
      </header>
      <nav>
        <div className={styles.navDivContent}>
          <span></span>
          <p className={styles.navDiv}>Estoque</p>
          <span></span>
        </div>
        <Link
          style={
            active === 0 ? { backgroundColor: "#006ec7", color: "#fff" } : {}
          }
          to="/"
          onClick={() => setActive(0)}
        >
          <GiCardboardBoxClosed size={20} /> Estoque
        </Link>
        <Link
          style={
            active === 1 ? { backgroundColor: "#006ec7", color: "#fff" } : {}
          }
          to="/favorecidos"
          onClick={() => setActive(1)}
        >
          <MdAccountCircle size={20} /> Favorecidos
        </Link>
        <Link
          style={
            active === 2 ? { backgroundColor: "#006ec7", color: "#fff" } : {}
          }
          to="/historico"
          onClick={() => setActive(2)}
        >
          <MdStore size={20} /> Histórico
        </Link>
        <div className={styles.navDivContent}>
          <span></span>
          <p className={styles.navDiv}>Trade</p>
          <span></span>
        </div>
        <Link
          style={
            active === 3 ? { backgroundColor: "#006ec7", color: "#fff" } : {}
          }
          to="/pdvDeSucesso"
          onClick={() => setActive(3)}
        >
          <MdStore size={20} /> PDV de Sucesso
        </Link>
      </nav>
      <button className={styles.signOut} onClick={signOut}>
        <VscSignOut />
        Sair
      </button>
    </aside>
  );
};

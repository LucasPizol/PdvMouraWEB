import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./styles.module.scss";
import { GiCardboardBoxClosed } from "react-icons/gi";
import { supabase } from "../../supabase";
import Swal from "sweetalert2";
import { MdAccountCircle, MdStore } from "react-icons/md";
import { VscSignOut } from "react-icons/vsc";

export const Menu = () => {
  const [active, setActive] = useState<number>(0);

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
      <nav>
        <div className={styles.navDivContent}>
          <span></span>
          <p className={styles.navDiv}>Estoque</p>
          <span></span>
        </div>
        <Link style={active === 0 ? { backgroundColor: "#006ec7", color: "#fff" } : {}} to="/" onClick={() => setActive(0)}>
          <GiCardboardBoxClosed size={20} /> Estoque
        </Link>
        <Link style={active === 1 ? { backgroundColor: "#006ec7", color: "#fff" } : {}} to="/favorecidos" onClick={() => setActive(1)}>
          <MdAccountCircle size={20} /> Favorecidos
        </Link>
        <div className={styles.navDivContent}>
          <span></span>
          <p className={styles.navDiv}>Trade</p>
          <span></span>
        </div>
        <Link style={active === 2 ? { backgroundColor: "#006ec7", color: "#fff" } : {}} to="/favorecidos" onClick={() => setActive(2)}>
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

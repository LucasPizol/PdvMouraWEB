import { useState } from "react";
import { NavLink } from "react-router-dom";
import styles from "./styles.module.scss";
import { GiCardboardBoxClosed } from "react-icons/gi";
import Swal from "sweetalert2";
import { MdAccountCircle, MdStore, MdPerson4, MdListAlt } from "react-icons/md";
import { VscSignOut } from "react-icons/vsc";
import { useAuthContext } from "../../context/AuthContext";
import { MdMenu } from "react-icons/md";

const emailToName = (email: string) => {
  return `${email.split("@")[0].split(".")[0].toUpperCase()} ${email.split("@")[0].split(".")[1].toUpperCase()}`;
};

export const Menu = () => {
  const { user, signOut } = useAuthContext();
  const [isActive, setIsActive] = useState<boolean>(false);

  const leave = async () => {
    const swalAlert = await Swal.fire({
      title: "Atenção!",
      icon: "warning",
      text: "Deseja sair do aplicativo?",
      confirmButtonText: "Sim",
      denyButtonText: "Não",
      showDenyButton: true,
    });

    if (swalAlert.isConfirmed) {
      await signOut();
    }
  };

  return (
    <aside className={styles.menuContainer}>
      <header className={styles.header}>
        <h2>{user ? emailToName(user![0].email) : ""}</h2>
        <MdMenu
          size={35}
          className={styles.menu}
          onClick={() => {
            setIsActive(!isActive);
          }}
        />
      </header>
      <nav style={{ transition: "0.5s" }} className={isActive ? styles.menuNavActive : styles.menuNav}>
        <div className={styles.navDivContent}>
          <span></span>
          <p className={styles.navDiv}>Estoque</p>
          <span></span>
        </div>
        <NavLink to="/" className={({ isActive }) => (isActive ? styles.navActive : styles.navRef)}>
          <GiCardboardBoxClosed size={20} /> Estoque
        </NavLink>
        <NavLink className={({ isActive }) => (isActive ? styles.navActive : styles.navRef)} to="/favorecidos">
          <MdAccountCircle size={20} /> Favorecidos
        </NavLink>
        <NavLink className={({ isActive }) => (isActive ? styles.navActive : styles.navRef)} to="/historico">
          <MdListAlt size={20} /> Histórico
        </NavLink>
        <div className={styles.navDivContent}>
          <span></span>
          <p className={styles.navDiv}>Trade</p>
          <span></span>
        </div>
        <NavLink className={({ isActive }) => (isActive ? styles.navActive : styles.navRef)} to="/customers">
          <MdPerson4 size={20} /> Clientes
        </NavLink>
        <NavLink className={({ isActive }) => (isActive ? styles.navActive : styles.navRef)} to="/pdvDeSucesso">
          <MdStore size={20} /> PDVs de Sucesso
        </NavLink>
        <button className={styles.signOut} onClick={leave}>
          <VscSignOut />
          Sair
        </button>
      </nav>
    </aside>
  );
};

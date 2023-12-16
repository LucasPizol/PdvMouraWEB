import { IoTrashSharp } from "react-icons/io5";
import styles from "./styles.module.scss";

type Props = {
  children: any;
  checked: any[];
  onClick: any;
};

export const HeaderShown = ({ children, checked, onClick }: Props) => {
  return (
    <>
      {checked.length === 0 ? (
        <>{children}</>
      ) : (
        <p style={{ width: "200px" }} className={styles.remove} onClick={onClick}>
          <IoTrashSharp size={20} />
          {`Remover ${checked.length} item(ns)`}
        </p>
      )}
    </>
  );
};

import { MdDownload } from "react-icons/md";
import styles from "./styles.module.scss";

type Props = {
  children: any;
  checked: any[];
  onClick: any;
};

export const HeaderDownload = ({ children, checked, onClick }: Props) => {
  return (
    <>
      {checked.length === 0 ? (
        <>{children}</>
      ) : (
        <p
          style={{ width: "200px" }}
          className={styles.remove}
          onClick={onClick}
        >
          <MdDownload size={20} />
          {`Baixar fotos de ${checked.length} item(ns)`}
        </p>
      )}
    </>
  );
};

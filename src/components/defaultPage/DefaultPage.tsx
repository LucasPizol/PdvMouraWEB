import { Menu } from "../menu/Menu";
import styles from "./styles.module.scss";
import imgHeader from "../../assets/imgHeader.webp";

const DefaultPage = ({ Component }: any) => {
  return (
    <main className={styles.grid}>
      <Menu />
      <div className={styles.container}>
        <img className={styles.headerImage} src={imgHeader} />
        <Component />
      </div>
    </main>
  );
};

export default DefaultPage;

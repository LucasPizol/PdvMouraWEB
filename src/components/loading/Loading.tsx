import loading from "../../assets/loading_img.webp";
import mouraLogo from "../../assets/moura_logo.webp";

import styles from "./styles.module.scss";

export const Loading = () => {
  return (
    <div className={styles.loading}>
      <img className={styles.logo} src={mouraLogo} alt="Moura Logo" />
      <img className={styles.loading_img} src={loading} alt="Loading image" />
    </div>
  );
};

import { Form } from "./Form/Form";
import styles from "./styles.module.scss";

export const Login = () => {
  return (
    <main className={styles.authContainer}>
      <div className={styles.container}>
        <div className={styles.formDiv}>
          <div className={styles.title}>
            <h2>Trade Fácil</h2>
            <p>Gestão do Trade Marketing rede Moura</p>
          </div>
          <Form />
          <img
            src="https://logodownload.org/wp-content/uploads/2017/08/moura-logo.png"
            alt="logo baterias moura"
          />
        </div>
        <img
          className={styles.asideImage}
          src="https://www.diariodepernambuco.com.br/static/app/noticia_127983242361/2022/11/09/912510/20221110112441410074u.jpg"
          alt="imagem bateria moura"
        />
      </div>
    </main>
  );
};

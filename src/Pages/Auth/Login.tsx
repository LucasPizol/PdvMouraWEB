import { Form } from "./Form/Form";
import styles from "./styles.module.scss";

export const Login = () => {
  return (
    <main className={styles.authContainer}>
      <div className={styles.container}>
        <div className={styles.formDiv}>
          <div className={styles.title}>
            <h2>Bem vindo de volta!</h2>
            <p>O aplicativo para facilitar o dia a dia do staff de vendas</p>
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

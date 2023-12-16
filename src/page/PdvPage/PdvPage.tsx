import { useLocation, useNavigate } from "react-router-dom";
import styles from "./styles.module.scss";
import Switch from "react-switch";
import { ChangeEvent, useState } from "react";
import { supabase } from "../../supabase";
import Swal from "sweetalert2";
import { PDVdeSucesso } from "../ListViews/PdvDeSucesso/PdvDeSucesso";

const getDescription = (situation: boolean) => {
  return situation ? "APROVADO" : "REPROVADO";
};

export const PdvPage = () => {
  const [isApproved, setIsApproved] = useState<boolean>(true);
  const [text, setText] = useState<string>("");
  const navigate = useNavigate();

  const pdv: PDVdeSucesso = useLocation().state;

  const handleChangeSwitch = () => {
    setIsApproved(!isApproved);
  };

  const handleChangeText = (e: ChangeEvent<HTMLInputElement>) => {
    setText(e.currentTarget.value);
  };

  const handleSubmit = async () => {
    const confirmAlert = await Swal.fire({
      title: "Atenção!",
      text: "Deseja enviar o feedback?",
      icon: "warning",
    });

    if (confirmAlert.isDenied) return;

    const { error } = await supabase
      .from("pdvs")
      .update({
        return_desc: isApproved ? null : text,
        approved: isApproved,
      })
      .eq("id", pdv.id);

    if (error) {
      Swal.fire({
        icon: "error",
        title: "Atenção",
        text: `Ocorreu um erro ao realizar o envio das informações: ${error.message}`,
      });

      return;
    }

    navigate("/pdvDeSucesso");
  };

  return (
    <div className={styles.stockPanel}>
      <div className={styles.info}>
        <div>
          <h1 className={styles.title}>{pdv.customers.razao_social}</h1>
          <div>
            <h5>Logradouro</h5>
            <p>{pdv.customers.logradouro}</p>
          </div>
          <div>
            <h5>Cidade</h5>
            <p>{pdv.customers.cidade}</p>
          </div>
        </div>
        {pdv.approved === null ? (
          <div className={styles.formApprove}>
            <div className={styles.aprovar}>
              <Switch onChange={handleChangeSwitch} checked={isApproved} />
              <h4>{isApproved ? "APROVAR" : "REPROVAR"}</h4>
            </div>
            <input
              disabled={isApproved}
              type="text"
              name=""
              id=""
              className={styles.return}
              onChange={handleChangeText}
              placeholder="Digite aqui um retorno"
              value={isApproved ? "OK" : text}
              style={!isApproved ? { boxShadow: "0px 0px 4px 1px #006ec7" } : {}}
            />
            <button
              onClick={handleSubmit}
              className={styles.button}
              disabled={!isApproved && !text}
              style={!isApproved && !text ? { backgroundColor: "#888" } : {}}
            >
              Submeter
            </button>
          </div>
        ) : (
          getDescription(pdv.approved)
        )}
      </div>

      <div className={styles.images}>
        <img className={styles.image} src={pdv.img_url1} />
        <img className={styles.image} src={pdv.img_url2} />
      </div>
    </div>
  );
};

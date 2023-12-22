import { useNavigate } from "react-router-dom";
import { usePdvs } from "./usePdvs";
import { MdRemoveRedEye } from "react-icons/md";
import { FilterInput } from "../../../components/ui/filter_input/FilterInput";
import styles from "../styles.module.scss";
import Select from "../../../components/ui/select/Select";
import FlatList from "flatlist-react/lib";

const gridTemplateColumns = "0.6fr 1.5fr 1fr 0.6fr 0.6fr 0.6fr";
const situations = [{ value: "Todos" }, { value: "Aguardando" }, { value: "APROVADO" }, { value: "REPROVADO" }];

type PdvsMethods = ReturnType<typeof usePdvs>;
export const ListPdvsView = ({ customers, users, handleSearch }: PdvsMethods) => {
  console.log(users);
  const navigate = useNavigate();

  const TableRow = ({ id, customers, img_url1, img_url2, approved }: any) => {
    const getDescription = (situation: boolean) => {
      return situation ? "APROVADO" : "REPROVADO";
    };

    const pdv = { id, customers, img_url1, img_url2, approved };

    return (
      <div key={customers?.cod} className={styles.tableRow} style={{ gridTemplateColumns }}>
        <p>{customers?.cod}</p>
        <p>{customers?.razao_social}</p>
        <p>{customers?.cidade}</p>
        <p>{customers?.user_cod}</p>
        <p>{approved === null ? "Aguardando" : getDescription(approved)}</p>
        <button onClick={() => navigate("/pdvPage", { state: pdv })} className={styles.button}>
          <MdRemoveRedEye size={25} />
        </button>
      </div>
    );
  };
  return (
    <div className={styles.mainGrid}>
      <header className={styles.gridHeader}>
        <h1>PDVs de Sucesso</h1>
      </header>
      <div className={styles.table}>
        <div className={styles.tableHeader} style={{ gridTemplateColumns }}>
          <p>Codigo</p>
          <p>Razão Social</p>
          <p>Cidade</p>
          <p>Vendedor</p>
          <p>Situação</p>
          <p>Visualizar</p>
        </div>
        <div className={styles.tableFilter} style={{ gridTemplateColumns }}>
          <FilterInput name="cod" onChange={handleSearch} />
          <FilterInput name="razao_social" onChange={handleSearch} justifyStart />
          <FilterInput name="cidade" onChange={handleSearch} />
          <Select name="user_cod" onChange={handleSearch} text_key="cod" value_key="cod" array={[{ cod: "Todos" }, ...(users || [])]} />
          <Select name="situacao" onChange={handleSearch} text_key="value" value_key="value" array={situations} />
        </div>
        <div className={styles.tableContent}>
          <FlatList list={customers} renderItem={TableRow} renderWhenEmpty={<p>Nada para mostrar</p>} />
        </div>
      </div>
    </div>
  );
};

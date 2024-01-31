import { useNavigate } from "react-router-dom";
import { usePdvs } from "./usePdvs";
import {
  MdRemoveRedEye,
  MdOutlineCheck,
  MdOutlineClose,
  MdMoreHoriz,
} from "react-icons/md";
import { FilterInput } from "../../../components/ui/filter_input/FilterInput";
import styles from "../styles.module.scss";
import Select from "../../../components/ui/select/Select";
import FlatList from "flatlist-react/lib";
import { HeaderDownload } from "../../../components/ui/header_download/HeaderDownload";

const gridTemplateColumns = "0.6fr 0.6fr 1.5fr 1fr 0.6fr 0.6fr 0.6fr 0.6fr";
const situations = [
  { value: "Todos" },
  { value: "Aguardando" },
  { value: "APROVADO" },
  { value: "REPROVADO" },
];

type PdvsMethods = ReturnType<typeof usePdvs>;
export const ListPdvsView = ({
  customers,
  users,
  handleSearch,
  checked,
  checkAll,
  checkFromId,
  isChecked,
  handleDownload,
  fields,
}: PdvsMethods) => {
  const navigate = useNavigate();

  const TableRow = ({
    id,
    customers,
    img_url1,
    img_url2,
    approved,
    created_at,
  }: any) => {
    const getDescription = (situation: boolean) => {
      return situation ? (
        <MdOutlineCheck color={"#00f"} />
      ) : (
        <MdOutlineClose color={"#f00"} />
      );
    };

    const pdv = { id, customers, img_url1, img_url2, approved, created_at };

    return (
      <div
        key={customers?.cod}
        className={styles.tableRow}
        style={{ gridTemplateColumns }}
      >
        <input
          type="checkbox"
          name=""
          id=""
          checked={isChecked(id)}
          onChange={() => checkFromId(id)}
        />
        <p>{customers?.cod}</p>
        <p>{customers?.razao_social}</p>
        <p>{customers?.cidade}</p>
        <p>{customers?.user_cod}</p>
        <p>{approved === null ? <MdMoreHoriz /> : getDescription(approved)}</p>
        <p>{new Date(created_at).toLocaleDateString("pt-br")}</p>

        <button
          onClick={() => navigate("/pdvPage", { state: pdv })}
          className={styles.button}
        >
          <MdRemoveRedEye size={25} />
        </button>
      </div>
    );
  };
  return (
    <div className={styles.mainGrid}>
      <header className={styles.gridHeader}>
        <h1>PDVs de Sucesso</h1>
        <div className={styles.periodo}>
          <div>
            <label htmlFor="firstDate">Inicio</label>
            <input
              type="date"
              name="firstDate"
              id="firstDate"
              onChange={handleSearch}
              value={fields.firstDate}
            />
          </div>
          <div>
            <label htmlFor="lastDate">Fim</label>
            <input
              type="date"
              name="lastDate"
              id="lastDate"
              onChange={handleSearch}
              value={fields.lastDate}
            />
          </div>
        </div>
      </header>
      <div className={styles.table}>
        <div className={styles.tableHeader} style={{ gridTemplateColumns }}>
          <input
            type="checkbox"
            name=""
            id=""
            onChange={checkAll}
            checked={checked.length === customers?.length}
          />
          <HeaderDownload
            checked={checked}
            onClick={() => handleDownload(checked, customers)}
          >
            <p>Codigo</p>
            <p>Razão Social</p>
            <p>Cidade</p>
            <p>Vendedor</p>
            <p>Situação</p>
            <p>Data envio</p>
            <p>Visualizar</p>
          </HeaderDownload>
        </div>
        <div className={styles.tableFilter} style={{ gridTemplateColumns }}>
          <p></p>
          <FilterInput name="cod" onChange={handleSearch} justifyStart />
          <FilterInput name="razao_social" onChange={handleSearch} />
          <FilterInput name="cidade" onChange={handleSearch} />
          <Select
            name="user_cod"
            onChange={handleSearch}
            text_key="cod"
            value_key="cod"
            array={[{ cod: "Todos" }, ...(users || [])]}
          />
          <Select
            name="situacao"
            onChange={handleSearch}
            text_key="value"
            value_key="value"
            array={situations}
          />
        </div>
        <div className={styles.tableContent}>
          <FlatList
            list={customers}
            renderItem={TableRow}
            renderWhenEmpty={<p>Nada para mostrar</p>}
          />
        </div>
      </div>
    </div>
  );
};

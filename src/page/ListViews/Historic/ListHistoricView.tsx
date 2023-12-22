import { Link } from "react-router-dom";
import styles from "../styles.module.scss";
import { useHistoric } from "./useHistoric";
import { HeaderShown } from "../../../components/ui/header_shown/HeaderShown";
import { FilterInput } from "../../../components/ui/filter_input/FilterInput";
import FlatList from "flatlist-react/lib";
const gridTemplateColumns = "1fr 3fr 2fr 2fr 2fr";

type HistoricMethods = ReturnType<typeof useHistoric>;
const ListHistoricView = ({ isChecked, checkFromId, handleSearch, fields, checkAll, handleRemoveItems, checked, historic }: HistoricMethods) => {
  const TableRow = ({ id, favorecido, item, created_at, quantidade }: any) => {
    return (
      <div key={id} className={styles.tableRow} style={{ gridTemplateColumns }}>
        <input type="checkbox" name="" id="" checked={isChecked(id)} onChange={() => checkFromId(id)} />
        <p>{item?.item}</p>
        <p>{favorecido?.favorecido || "Entrada"}</p>
        <p>{quantidade}</p>
        <p>
          {new Date(created_at).toLocaleDateString("pt-br", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    );
  };

  return (
    <div className={styles.mainGrid}>
      <header className={styles.gridHeader}>
        <div className={styles.titleDiv}>
          <h1>Histórico</h1>
          <Link to="/novo/pedido">Novo pedido</Link>
        </div>

        <div className={styles.periodo}>
          <div>
            <label htmlFor="firstDate">Inicio</label>
            <input type="date" name="firstDate" id="firstDate" onChange={handleSearch} value={fields.firstDate} />
          </div>
          <div>
            <label htmlFor="lastDate">Fim</label>
            <input type="date" name="lastDate" id="lastDate" onChange={handleSearch} value={fields.lastDate} />
          </div>
        </div>
      </header>
      <div className={styles.table}>
        <div className={styles.tableHeader} style={{ gridTemplateColumns }}>
          <input type="checkbox" name="" id="" onChange={checkAll} checked={checked.length === historic?.length} />
          <HeaderShown checked={checked} onClick={handleRemoveItems}>
            <p>Item</p>
            <p>Favorecido</p>
            <p>Quantidade</p>
            <p>Data</p>
          </HeaderShown>
        </div>
        <div className={styles.tableFilter} style={{ gridTemplateColumns }}>
          <p></p>
          <FilterInput name="item" onChange={handleSearch} justifyStart />
          <FilterInput name="favorecido" onChange={handleSearch} />
        </div>
        <div className={styles.tableContent}>
          <FlatList list={historic} renderItem={TableRow} renderWhenEmpty={() => <p>Nada para mostrar</p>} />
        </div>
      </div>
    </div>
  );
};

export default ListHistoricView;

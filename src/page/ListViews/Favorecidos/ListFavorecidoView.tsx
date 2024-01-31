import { Link, useNavigate } from "react-router-dom";
import { useFavorecido } from "./useFavorecido";
import { MdEditSquare } from "react-icons/md";
import { FilterInput } from "../../../components/ui/filter_input/FilterInput";
import styles from "../styles.module.scss";
import FlatList from "flatlist-react/lib";
import { HeaderShown } from "../../../components/ui/header_shown/HeaderShown";

const gridTemplateColumns = "0.6fr 1.5fr 1fr 0.6fr 0.6fr 0.6fr";

type FavorecidoMethods = ReturnType<typeof useFavorecido>;
export const ListFavorecidoView = ({
  search,
  handleSearch,
  handleRemoveItems,
  checked,
  checkAll,
  checkFromId,
  isChecked,
}: FavorecidoMethods) => {
  const navigate = useNavigate();

  const TableRow = ({ id, favorecido }: any) => {
    return (
      <div key={id} className={styles.tableRow} style={{ gridTemplateColumns }}>
        <input
          type="checkbox"
          name=""
          id=""
          checked={isChecked(id)}
          onChange={() => checkFromId(id)}
        />
        <p>{favorecido}</p>
        <button
          className={styles.button}
          onClick={() =>
            navigate(`/novo/favorecido`, {
              state: {
                id,
                favorecido,
              },
            })
          }
        >
          <MdEditSquare size={25} color="#1646E6" />
        </button>
      </div>
    );
  };

  return (
    <div className={styles.mainGrid}>
      <header className={styles.gridHeader}>
        <h1>Favorecidos</h1>
        <Link to="/novo/favorecido">Novo favorecido</Link>
      </header>
      <div className={styles.table}>
        <div className={styles.tableHeader} style={{ gridTemplateColumns }}>
          <input
            type="checkbox"
            name=""
            id=""
            onChange={checkAll}
            checked={checked.length === search?.length}
          />
          <HeaderShown checked={checked} onClick={handleRemoveItems}>
            <p>Favorecido</p>
            <p>Editar</p>
          </HeaderShown>
        </div>

        <div className={styles.tableFilter} style={{ gridTemplateColumns }}>
          <p></p>
          <FilterInput name="favorecido" onChange={handleSearch} justifyStart />
        </div>
        <div className={styles.tableContent}>
          <FlatList
            list={search}
            renderItem={TableRow}
            renderWhenEmpty={() => <p>Nada para mostrar</p>}
          />
        </div>
      </div>
    </div>
  );
};

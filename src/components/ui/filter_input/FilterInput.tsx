import styles from "./styles.module.scss";

type Props = {
  name: string;
  onChange: any;
  justifyStart?: true;
};

export const FilterInput = ({ name, onChange, justifyStart }: Props) => {
  return (
    <input
      type="search"
      name={name}
      onChange={onChange}
      className={styles.filterHandler}
      style={{ justifySelf: justifyStart ? "start" : "center" }}
    />
  );
};

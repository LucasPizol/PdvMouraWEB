import styles from "../filter_input/styles.module.scss";

type props = {
  array?: any[] | null;
  value_key: string;
  text_key: string;
  onChange: any;
  name: string;
};

const Select = ({ text_key, value_key, array, onChange, name }: props) => {
  return (
    <select className={styles.filterHandler} onChange={onChange} name={name}>
      {array?.map((item) => (
        <option value={item[value_key]}>{item[text_key]}</option>
      ))}
    </select>
  );
};

export default Select;

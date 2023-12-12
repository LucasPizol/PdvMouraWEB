import { ChangeEvent, useState } from "react";

export const useForm = (initialField: any) => {
  const [fields, setFields] = useState(initialField);

  const changeField = (e: ChangeEvent<HTMLInputElement>) => {
    setFields({ ...fields, [e.currentTarget.name]: e.currentTarget.value });
  };

  return [fields, changeField];
};

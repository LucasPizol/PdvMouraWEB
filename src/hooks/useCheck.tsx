import { useState } from "react";

export const useCheck = (array: any | null | undefined) => {
  const [checked, setChecked] = useState<number[]>([]);

  const checkAll = () => {
    if (!array) return;
    const mappedArray = array.map((array: any) => array.id);
    if (mappedArray.length === checked.length) {
      setChecked([]);
      return;
    }
    setChecked(mappedArray);
  };

  const checkFromId = (id: number) => {
    const findInChecked = checked.findIndex((number: number) => number === id);

    if (findInChecked !== -1) {
      const filtered = checked.filter((number: number) => number !== id);
      setChecked(filtered);
      return;
    }

    setChecked([...checked, id]);
  };

  const isChecked = (id: number) => {
    return checked.findIndex((number: number) => number === id) !== -1;
  };

  return { checked, checkAll, checkFromId, isChecked };
};

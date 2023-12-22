import { ListPdvsView } from "./ListPdvsView";
import { usePdvs } from "./usePdvs";

export const ListPdvs = () => {
  const pdvsMethods = usePdvs();

  return <ListPdvsView {...pdvsMethods} />;
};

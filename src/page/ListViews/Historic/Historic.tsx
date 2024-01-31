import ListHistoricView from "./ListHistoricView";
import { useHistoric } from "./useHistoric";

export const Historic = () => {
  const historicMethods = useHistoric();

  return <ListHistoricView {...historicMethods} />;
};

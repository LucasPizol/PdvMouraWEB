import { useFavorecido } from "./useFavorecido";
import { ListFavorecidoView } from "./ListFavorecidoView";

export const ListFavorecidos = () => {
  const FavorecidoProps = useFavorecido();

  return <ListFavorecidoView {...FavorecidoProps} />;
};

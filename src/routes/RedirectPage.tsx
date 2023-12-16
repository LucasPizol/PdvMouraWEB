import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const RedirectPage = ({ routeString }: { routeString: string }) => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate(routeString);
  }, []);

  return <h1>404 Not Found</h1>;
};

import { useContext, useEffect, useState } from "react";
import styles from "./styles.module.scss";
import { Link, useNavigate } from "react-router-dom";
import { MdSearch } from "react-icons/md";
import { useQuery } from "react-query";
import { UserContext, UserType } from "../../routes";
import { supabase } from "../../supabase";
import { useCheck } from "../../hooks/useCheck";

const getUsers = async (userData: UserType) => {
  if (!userData) return;
  //@ts-ignore
  const equipe: { id: number; empresas: number } = userData[0].equipe;

  const { data, error } = await supabase
    .from("users")
    .select(
      `
      cod,
      equipe: id_equipe(id_empresa)
      `
    )
    .eq("role", "salesperson")
    .eq("equipe.id_empresa", equipe.empresas)
    .order("cod");

  return { data, error };
};

export const PdvDeSucesso = () => {
  const userData = useContext(UserContext);
  const navigate = useNavigate();

  const users = useQuery("getSellers", () => getUsers(userData));

  const [customers, setCustomers] = useState<any | null | undefined>();

  const { checked, checkAll, checkFromId, isChecked } = useCheck(customers);

  //   const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
  //     const filtered = data?.data?.filter((historico: Historico) =>
  //       //@ts-ignore
  //       historico.favorecido
  //         .toLowerCase()
  //         .includes(e.currentTarget.value.toLowerCase())
  //     );

  //     setFavorecidos(filtered);
  //   };

  const handleSearchForItems = async (e: any) => {
    if (!userData) return;

    //@ts-ignore
    const equipe: { id: number; empresas: number } = userData[0].equipe;
    if (!users?.data?.data) return;

    const { data } =
      e.currentTarget.value === "Todos"
        ? await supabase
            .from("pdvs")
            .select(
              "customers!inner (razao_social, cidade, cod, user_cod),img_url1,img_url2"
            )
            .in(
              "customers.user_cod",
              users?.data?.data?.map((seller: { cod: number }) => seller.cod)
            )
        : await supabase
            .from("pdvs")
            .select(
              "customers!inner (razao_social, cidade, cod, user_cod),img_url1,img_url2"
            )
            .eq("customers.user_cod", e.currentTarget.value);
    setCustomers(data);
  };

  useEffect(() => {
    if (!userData) navigate("/auth/login");
    handleSearchForItems({ currentTarget: { value: "Todos" } });
  }, [userData, users]);

  return (
    <div className={styles.stockPanel}>
      <header className={styles.stockPanelHeader}>
        <h1>PDVs de Sucesso</h1>
        <select
          style={{ cursor: "pointer" }}
          onChange={handleSearchForItems}
          defaultValue="Todos"
        >
          <option value="Todos">Todos</option>
          {users?.data?.data?.map((seller: any) => (
            <option value={seller.cod}> {seller.cod}</option>
          ))}
        </select>

        <nav>
          <Link to="/novo/pedido">Novo pedido</Link>
          <div>
            <input
              placeholder="Procure um nome / item"
              type="search"
              //onChange={handleSearch}
              name=""
              id=""
            />
            <MdSearch className={styles.searchIcon} />
          </div>
        </nav>
      </header>
      <div className={styles.stockTable}>
        <div className={styles.stockTableHeader}>
          <input
            type="checkbox"
            name=""
            id=""
            onChange={checkAll}
            checked={checked.length === customers?.length}
          />
          <p>Codigo</p>
          <p>Razão Social</p>
          <p>Cidade</p>
          <p>Vendedor</p>
          <p>Imagem 1</p>
          <p>Imagem 2</p>
        </div>
        <div className={styles.stockTableContent}>
          {customers?.map(({ customers, img_url1, img_url2 }: any) => (
            <div key={customers?.cod} className={styles.stockTableRow}>
              <input
                type="checkbox"
                name=""
                id=""
                checked={isChecked(customers?.cod)}
                onChange={() => checkFromId(customers?.cod)}
              />
              <p>{customers?.cod}</p>
              <p>{customers?.razao_social}</p>
              <p>{customers?.cidade}</p>
              <p>{customers?.user_cod}</p>

              <a href={img_url1} target="_blank">
                Imagem 1
              </a>

              {img_url2 === "" ? null : (
                <a href={img_url2} target="_blank">
                  Imagem 2
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

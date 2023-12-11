import { useState } from "react";
import { Link } from "react-router-dom";
import "./Menu.css";
import { GiCardboardBoxClosed } from "react-icons/gi";

export const Menu = () => {
  const [active, setActive] = useState<number>(0);

  return (
    <aside className="menuContainer">
      <nav>
        <Link
          style={active === 0 ? { backgroundColor: "#006ec7" } : {}}
          to="/"
          onClick={() => setActive(0)}
        >
          <GiCardboardBoxClosed size={20} /> Estoque
        </Link>
      </nav>
    </aside>
  );
};

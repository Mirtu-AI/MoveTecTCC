import { useNavigate, useLocation } from "react-router-dom";
import "./NavegacaoProfessor.css";

const ITENS = [
  { path: "/dashboard", label: "Salas", icone: "🏫" },
  { path: "/professor/comunidades", label: "Comunidades", icone: "💬" },
  { path: "/professor/treinos", label: "Treinos", icone: "🏋️" },
];

export default function NavegacaoProfessor() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="nav-professor">
      {ITENS.map((item) => (
        <button
          key={item.path}
          className={`nav-professor-item ${
            location.pathname === item.path ? "ativo" : ""
          }`}
          onClick={() => navigate(item.path)}
          aria-label={item.label}
        >
          <span className="nav-professor-icone">{item.icone}</span>
        </button>
      ))}
    </nav>
  );
}
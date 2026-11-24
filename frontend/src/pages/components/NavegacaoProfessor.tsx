import { useNavigate, useLocation } from "react-router-dom";
import "./NavegacaoProfessor.css";
import { FaChalkboardTeacher, FaComments, FaDumbbell } from "react-icons/fa";

const ITENS = [
  { path: "/dashboard", label: "Salas", icone: <FaChalkboardTeacher /> },
  { path: "/professor/comunidades", label: "Comunidades", icone: <FaComments /> },
  { path: "/professor/treinos", label: "Treinos", icone: <FaDumbbell /> },
];

export default function NavegacaoProfessor() {
  const navigate = useNavigate();
  const location = useLocation();

  const isAtivo = (itemPath: string) => {
    if (itemPath === "/professor/comunidades") {
      return (
        location.pathname === "/professor/comunidades" ||
        location.pathname === "/professor/comunidade" ||
        location.pathname.startsWith("/professor/comunidades/")
      );
    }
    if (itemPath === "/dashboard") {
      return (
        location.pathname === "/dashboard" ||
        location.pathname.startsWith("/professor/sala")
      );
    }
    if (itemPath === "/professor/treinos") {
      return (
        location.pathname.startsWith("/professor/treinos") ||
        location.pathname.startsWith("/professor/rotinas") ||
        location.pathname.startsWith("/professor/exercicios")
      );
    }
    return location.pathname === itemPath;
  };

  return (
    <nav className="nav-professor">
      {ITENS.map((item) => (
        <button
          key={item.path}
          className={`nav-professor-item ${
            isAtivo(item.path) ? "ativo" : ""
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
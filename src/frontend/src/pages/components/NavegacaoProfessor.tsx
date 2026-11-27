import { useNavigate, useLocation } from "react-router-dom";
import "./NavegacaoProfessor.css";
import Logotipo from "../../assets/logo/Logo_MoveTec.png";
import {
  FaChalkboardTeacher,
  FaBullhorn,
  FaComments,
  FaRunning,
  FaDumbbell,
  FaClipboardList,
  FaUser,
} from "react-icons/fa";

const menuItens = [
  { rota: "/dashboard", icone: <FaChalkboardTeacher />, rotulo: "Grupos" },
  { rota: "/profissional/avisos", icone: <FaBullhorn />, rotulo: "Avisos" },
  { rota: "/profissional/comunidades", icone: <FaComments />, rotulo: "Comunidades" },
  { rota: "/profissional/rotinas", icone: <FaRunning />, rotulo: "Rotinas" },
  { rota: "/profissional/treinos", icone: <FaDumbbell />, rotulo: "Treinos" },
  { rota: "/profissional/exercicios", icone: <FaClipboardList />, rotulo: "Exercicios" },
  { rota: "/profissional/perfil", icone: <FaUser />, rotulo: "Perfil" },
];

export default function NavegacaoProfessor() {
  const navigate = useNavigate();
  const location = useLocation();
  const caminho = location.pathname;

  function estaAtivo(rota: string) {
    if (caminho === rota) return true;
    if (rota === "/dashboard") {
      return caminho === "/professor/salas" || caminho.startsWith("/professor/sala/");
    }
    if (rota === "/professor/comunidades") {
      return caminho === "/professor/comunidade" || caminho.startsWith("/professor/comunidades");
    }
    return false;
  }

  return (
    <nav className="navprof" aria-label="Menu do professor">
      <div className="navprof-logo">
        <img src={Logotipo} alt="" />
      </div>
      <ul className="navprof-lista">
        {menuItens.map((item) => {
          const ativo = estaAtivo(item.rota);
          return (
            <li key={item.rota}>
              <button
                type="button"
                className={`navprof-btn ${ativo ? "ativo" : ""}`}
                onClick={() => navigate(item.rota)}
                aria-current={ativo ? "page" : undefined}
              >
                <span className="navprof-icone" aria-hidden="true">{item.icone}</span>
                <span className="navprof-rotulo">{item.rotulo}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
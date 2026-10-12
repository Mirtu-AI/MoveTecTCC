import { useNavigate, useLocation } from "react-router-dom";
import "./NavegacaoAluno.css";
import Logotipo from "../../assets/logo/Logo_MoveTec.png";

const ITENS = [
  { rota: "/aluno", icone: "🏠", rotulo: "Início" },
  { rota: "/aluno/comunidades", icone: "💬", rotulo: "Comunidades" },
  { rota: "/aluno/perfil", icone: "👤", rotulo: "Perfil" },
];

export default function NavegacaoAluno() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="navegacao-aluno">
      {/* ÁREA DA LOGOTIPO */}
      <div className="navegacao-aluno-logo" onClick={() => navigate("/aluno")}>
        {/* Substitua o src da img pelo caminho real da sua imagem SVG/PNG */}
        <img src={Logotipo} alt="MoveTec Logo" className="navegacao-aluno-logo-img" />
        {/* Ou se não tiver imagem ainda, você pode exibir o nome em texto:
        <span className="navegacao-aluno-logo-texto">Move<span>Tec</span></span> */}
      </div>

      <ul className="navegacao-aluno-lista">
        {ITENS.map((item) => {
          const ativo = location.pathname === item.rota;
          return (
            <li key={item.rota}>
              <button
                type="button"
                className={`navegacao-aluno-btn ${ativo ? "ativo" : ""}`}
                onClick={() => navigate(item.rota)}
              >
                <span className="navegacao-aluno-icone">{item.icone}</span>
                <span className="navegacao-aluno-rotulo">{item.rotulo}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
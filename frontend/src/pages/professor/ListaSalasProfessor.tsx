import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./ListaSalasProfessor.css";
import Logotipo from "../../assets/logo/Logo_MoveTec.png"

interface Sala {
  _id: string;
  nome: string;
}

export default function ListaSalasProfessor() {
  const [salas, setSalas] = useState<Sala[]>([]);
  const [carregando, setCarregando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function buscarSalas() {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:3000/api/professor/salas",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSalas(response.data.salas);
      } catch (err) {
        console.error(err);
      } finally {
        setCarregando(false);
      }
    }

    buscarSalas();
  }, []);

  return (
    <div className="salas-professor-page">
      <NavegacaoProfessor />

      <div className="salas-professor-main">
        <header className="salas-professor-header">
          <h1>Salas</h1>
          <button
            className="perfil-btn"
            onClick={() => navigate("/professor/perfil")}
            aria-label="Meu perfil"
          >
            👤
          </button>
        </header>

        <main className="salas-professor-conteudo">
          {carregando && <p className="salas-professor-mensagem">Carregando...</p>}

          {!carregando && salas.length === 0 && (
            <p className="salas-professor-mensagem">Nenhuma sala vinculada ainda.</p>
          )}

          <div className="salas-professor-lista">
            {salas.map((sala) => (
              <div
                key={sala._id}
                className="sala-professor-card"
                onClick={() => navigate(`/professor/sala/${sala._id}`)}
              >
                <div className="sala-professor-icone">🖼️</div>
                <span className="sala-professor-nome">{sala.nome}</span>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

// Componente de Navegação Integrado
function NavegacaoProfessor() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItens = [
    { rota: "/dashboard", icone: "📊", rotulo: "Salas" },
    { rota: "/professor/comunidades", icone: "👥", rotulo: "Comunidades" },
    { rota: "/professor/rotinas", icone: "🏃", rotulo: "Rotinas" },
    { rota: "/professor/treinos", icone: "🏋️‍♂️", rotulo: "Treinos" },
    { rota: "/professor/exercicios", icone: "🏋️‍♂️", rotulo: "Exercicios" },
    { rota: "/professor/perfil", icone: "👤", rotulo: "Perfil" },
  ];
  return (
    <nav className="navegacao-professor">
      <div className="navegacao-logo">
        <img src={Logotipo} alt="" />
      </div>
      <ul className="navegacao-lista">
        {menuItens.map((item) => {
          // Marca ativo se a rota for idêntica ou se estiver nas variações de salas
          const ativo =
            location.pathname === item.rota ||
            (item.rota === "/professor/dashboard" && location.pathname === "/professor/salas");

          return (
            <li key={item.rota}>
              <button
                type="button"
                className={`navegacao-btn ${ativo ? "ativo" : ""}`}
                onClick={() => navigate(item.rota)}
              >
                <span className="navegacao-icone">{item.icone}</span>
                <span className="navegacao-rotulo">{item.rotulo}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
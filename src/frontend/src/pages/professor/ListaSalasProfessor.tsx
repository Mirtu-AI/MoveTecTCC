import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./ListaSalasProfessor.css";
import Logotipo from "../../assets/logo/Logo_MoveTec.png";
import { FaUser, FaChalkboardTeacher, FaBullhorn, FaComments, FaRunning, FaDumbbell, FaClipboardList } from "react-icons/fa";
import NavegacaoProfessor from "../components/NavegacaoProfessor";

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
            <FaUser />
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
                <div className="sala-professor-icone"><FaChalkboardTeacher /></div>
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
<NavegacaoProfessor />
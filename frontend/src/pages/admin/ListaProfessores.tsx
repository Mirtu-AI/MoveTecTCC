import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ModalConfirmacao from "../components/ModalConfirmacao";
import "./ListaProfessores.css";

interface Professor {
  _id: string;
  nome: string;
  email: string;
}

export default function ListaProfessores() {
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalLogoutAberto, setModalLogoutAberto] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function buscarProfessores() {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:3000/api/professores", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfessores(response.data.professores);
      } catch (err) {
        console.error(err);
      } finally {
        setCarregando(false);
      }
    }

    buscarProfessores();
  }, []);

  function getIniciais(nome: string) {
    return nome
      .split(" ")
      .map((parte) => parte[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }

  function confirmarLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("tipo");
    navigate("/login");
  }

  return (
    <div className="lista-page">
      <header className="lista-header">
        <button
          className="logout-btn"
          onClick={() => setModalLogoutAberto(true)}
          aria-label="Sair"
        >
          ⎋
        </button>
        <h1>Lista de professores</h1>

        <div className="header-acoes desktop-only">
          <button
            className="salas-btn"
            onClick={() => navigate("/admin/salas")}
          >
            Salas
          </button>
          <button
            className="novo-professor-btn"
            onClick={() => navigate("/admin/cadastrar-professor")}
          >
            + Novo professor
          </button>
        </div>
      </header>

      <main className="lista-conteudo">
        {carregando && <p className="lista-mensagem">Carregando...</p>}

        {!carregando && professores.length === 0 && (
          <p className="lista-mensagem">Nenhum professor cadastrado ainda.</p>
        )}

        <div className="professores-grid">
          {professores.map((professor) => (
            <div
              key={professor._id}
              className="professor-card"
              onClick={() => navigate(`/admin/professor/${professor._id}`)}
            >
              <div className="professor-avatar">{getIniciais(professor.nome)}</div>
              <div className="professor-info">
                <span className="professor-nome">{professor.nome}</span>
                <span className="professor-email">{professor.email}</span>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* botões flutuantes no mobile: um pra salas, outro pra cadastrar professor */}
      <div className="fab-grupo-mobile mobile-only">
        <button
          className="fab-btn fab-secundario"
          onClick={() => navigate("/admin/salas")}
          aria-label="Ver salas"
        >
          🏫
        </button>
        <button
          className="fab-btn"
          onClick={() => navigate("/admin/cadastrar-professor")}
          aria-label="Cadastrar novo professor"
        >
          +
        </button>
      </div>

      <ModalConfirmacao
        aberto={modalLogoutAberto}
        titulo="Sair da conta?"
        mensagem="Você precisará fazer login novamente para acessar o painel."
        textoConfirmar="Sair"
        tipo="perigo"
        onConfirmar={confirmarLogout}
        onCancelar={() => setModalLogoutAberto(false)}
      />
    </div>
  );
}
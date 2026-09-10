import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./ListaProfessores.css";
import ModalConfirmacao from "../components/ModalConfirmacao";

interface Sala {
  _id: string;
  nome: string;
  professorId: string | null;
}

export default function ListaSalas() {
  const [salas, setSalas] = useState<Sala[]>([]);
  const [carregando, setCarregando] = useState(true);
  const navigate = useNavigate();
  const [modalLogoutAberto, setModalLogoutAberto] = useState(false);

  useEffect(() => {
    async function buscarSalas() {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:3000/api/salas", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSalas(response.data.salas);
      } catch (err) {
        console.error(err);
      } finally {
        setCarregando(false);
      }
    }

    buscarSalas();
  }, []);

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
        <h1>Salas</h1>

        <div className="header-acoes desktop-only">
          <button
            className="salas-btn"
            onClick={() => navigate("/admin")}
          >
            Professores
          </button>
          <button
            className="novo-professor-btn"
            onClick={() => navigate("/admin/cadastrar-sala")}
          >
            + Nova sala
          </button>
        </div>
      </header>

      <main className="lista-conteudo">
        {carregando && <p className="lista-mensagem">Carregando...</p>}

        {!carregando && salas.length === 0 && (
          <p className="lista-mensagem">Nenhuma sala cadastrada ainda.</p>
        )}

        <div className="professores-grid">
          {salas.map((sala) => (
            <div
              key={sala._id}
              className="professor-card"
              onClick={() => navigate(`/admin/sala/${sala._id}/detalhes`)}
            >
              <div className="professor-avatar">🏫</div>
              <div className="professor-info">
                <span className="professor-nome">{sala.nome}</span>
                <span className="professor-email">
                  {sala.professorId ? "Professor vinculado" : "Sem professor vinculado"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* botões flutuantes no mobile: um pra professores, outro pra cadastrar sala */}
      <div className="fab-grupo-mobile mobile-only">
        <button
          className="fab-btn fab-secundario"
          onClick={() => navigate("/admin")}
          aria-label="Ver professores"
        >
          👤
        </button>
        <button
          className="fab-btn"
          onClick={() => navigate("/admin/cadastrar-sala")}
          aria-label="Cadastrar nova sala"
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
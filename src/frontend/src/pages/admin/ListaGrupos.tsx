import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./ListaProfissionais.css";
import ModalConfirmacao from "../components/ModalConfirmacao";
import { FiLogOut, FiPlus } from "react-icons/fi";
import { FaSchool, FaUser } from "react-icons/fa";

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
          <FiLogOut />
        </button>
        <h1>Grupos</h1>

        <div className="header-acoes desktop-only">
          <button
            className="salas-btn"
            onClick={() => navigate("/admin")}
          >
            Profissionais
          </button>
          <button
            className="novo-professor-btn"
            onClick={() => navigate("/admin/cadastrar-grupo")}
          >
            <FiPlus style={{ marginRight: 4 }} /> Novo grupo
          </button>
        </div>
      </header>

      <main className="lista-conteudo">
        {carregando && <p className="lista-mensagem">Carregando...</p>}

        {!carregando && salas.length === 0 && (
          <p className="lista-mensagem">Nenhum grupo cadastrada ainda.</p>
        )}

        <div className="professores-grid">
          {salas.map((sala) => (
            <div
              key={sala._id}
              className="professor-card"
              onClick={() => navigate(`/admin/grupo/${sala._id}/detalhes`)}
            >
              <div className="professor-avatar"><FaSchool /></div>
              <div className="professor-info">
                <span className="professor-nome">{sala.nome}</span>
                <span className="professor-email">
                  {sala.professorId ? "Profissional vinculado" : "Sem profissional vinculado"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* botões flutuantes no mobile: um pra profissionais, outro pra cadastrar grupo */}
      <div className="fab-grupo-mobile mobile-only">
        <button
          className="fab-btn fab-secundario"
          onClick={() => navigate("/admin")}
          aria-label="Ver profissionais"
        >
          <FaUser />
        </button>
        <button
          className="fab-btn"
          onClick={() => navigate("/admin/cadastrar-grupo")}
          aria-label="Cadastrar nova sala"
        >
          <FiPlus />
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
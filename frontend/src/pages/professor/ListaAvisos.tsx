import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./ListaAvisos.css";
import Logotipo from "../../assets/logo/Logo_MoveTec.png";
import ModalConfirmacao from "../components/ModalConfirmacao";

interface Aviso {
  _id: string;
  titulo: string;
  descricao: string;
  data: string;
  salaId: string | null;
}

export default function ListaAvisos() {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [carregando, setCarregando] = useState(true);

  const [avisoSelecionado, setAvisoSelecionado] = useState<Aviso | null>(null);
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    buscarAvisos();
  }, []);

  async function buscarAvisos() {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3000/api/professor/avisos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAvisos(response.data.avisos);
    } catch (err) {
      console.error(err);
    } finally {
      setCarregando(false);
    }
  }

  function abrirModalExcluir(e: React.MouseEvent, aviso: Aviso) {
    e.stopPropagation();
    setAvisoSelecionado(aviso);
    setModalExcluirAberto(true);
  }

  async function confirmarExclusao() {
    if (!avisoSelecionado) return;

    setExcluindo(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:3000/api/professor/avisos/${avisoSelecionado._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setModalExcluirAberto(false);
      setAvisoSelecionado(null);
      buscarAvisos();
    } catch (err) {
      console.error(err);
    } finally {
      setExcluindo(false);
    }
  }

  function formatarData(dataIso: string) {
    return new Date(dataIso).toLocaleDateString("pt-BR", { timeZone: "UTC" });
  }

  return (
    <div className="lista-avisos-page">
      <NavegacaoProfessor />

      <div className="lista-avisos-main">
        <header className="lista-avisos-header">
          <h1>Central de Avisos</h1>
          <button type="button" className="lista-avisos-novo-btn" onClick={() => navigate("/professor/avisos/novo")}>
            + Novo aviso
          </button>
        </header>

        <main className="lista-avisos-conteudo">
          {carregando && <p className="lista-avisos-mensagem">Carregando...</p>}
          {!carregando && avisos.length === 0 && (
            <p className="lista-avisos-mensagem">Nenhum aviso publicado ainda.</p>
          )}

          <div className="avisos-lista">
            {avisos.map((aviso) => (
              <div
                key={aviso._id}
                className="aviso-card"
                onClick={() => navigate(`/professor/avisos/${aviso._id}/editar`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigate(`/professor/avisos/${aviso._id}/editar`);
                  }
                }}
              >
                <div className="aviso-card-topo">
                  <div>
                    <h3>{aviso.titulo}</h3>
                    <span className="aviso-card-data">{formatarData(aviso.data)}</span>
                    <span className="aviso-card-destinatario">
                      {aviso.salaId ? "Sala específica" : "Geral — todos os alunos"}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="aviso-excluir-btn"
                    onClick={(e) => abrirModalExcluir(e, aviso)}
                    aria-label="Excluir aviso"
                  >
                    🗑
                  </button>
                </div>
                <p className="aviso-card-descricao">{aviso.descricao}</p>
              </div>
            ))}
          </div>
        </main>
      </div>

      <ModalConfirmacao
        aberto={modalExcluirAberto}
        titulo="Excluir aviso?"
        mensagem={`Tem certeza que deseja excluir "${avisoSelecionado?.titulo}"? Essa ação não pode ser desfeita.`}
        textoConfirmar="Excluir"
        tipo="perigo"
        carregando={excluindo}
        onConfirmar={confirmarExclusao}
        onCancelar={() => {
          setModalExcluirAberto(false);
          setAvisoSelecionado(null);
        }}
      />
    </div>
  );
}

function NavegacaoProfessor() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItens = [
    { rota: "/dashboard", icone: "📊", rotulo: "Salas" },
    { rota: "/professor/avisos", icone: "📢", rotulo: "Avisos" },
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
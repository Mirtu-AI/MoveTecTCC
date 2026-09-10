import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./ListaRotinas.css";
import Logotipo from "../../assets/logo/Logo_MoveTec.png";
import ModalConfirmacao from "../components/ModalConfirmacao";

interface Rotina {
  _id: string;
  titulo: string;
  descricao: string;
  grupos: { nome: string; treinos: any[] }[];
}

export default function ListaRotinas() {
  const [rotinas, setRotinas] = useState<Rotina[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");

  const [rotinaSelecionada, setRotinaSelecionada] = useState<Rotina | null>(null);
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    buscarRotinas();
  }, []);

  async function buscarRotinas() {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3000/api/rotinas", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRotinas(response.data.rotinas);
    } catch (err) {
      console.error(err);
    } finally {
      setCarregando(false);
    }
  }

  function abrirModalExcluir(e: React.MouseEvent, rotina: Rotina) {
    e.stopPropagation();
    setRotinaSelecionada(rotina);
    setModalExcluirAberto(true);
  }

  async function confirmarExclusao() {
    if (!rotinaSelecionada) return;

    setExcluindo(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:3000/api/professor/rotinas/${rotinaSelecionada._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setModalExcluirAberto(false);
      setRotinaSelecionada(null);
      buscarRotinas();
    } catch (err) {
      console.error(err);
    } finally {
      setExcluindo(false);
    }
  }

  const rotinasFiltradas = rotinas.filter((rotina) =>
    rotina.titulo.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="lista-rotinas-page">
      <NavegacaoProfessor />

      <div className="lista-rotinas-main">
        <header className="lista-rotinas-header">
          <h1>Rotinas</h1>
          <button
            type="button"
            className="lista-rotinas-nova-btn"
            onClick={() => navigate("/professor/rotinas/nova")}
          >
            + Nova rotina
          </button>
        </header>

        <main className="lista-rotinas-conteudo">
          <div className="lista-rotinas-busca-container">
            <input
              type="text"
              placeholder="Buscar rotina..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="lista-rotinas-busca-input"
            />
          </div>

          {carregando && <p className="lista-rotinas-mensagem">Carregando...</p>}

          {!carregando && rotinas.length === 0 && (
            <p className="lista-rotinas-mensagem">Nenhuma rotina cadastrada ainda.</p>
          )}

          {!carregando && rotinas.length > 0 && rotinasFiltradas.length === 0 && (
            <p className="lista-rotinas-mensagem">Nenhuma rotina encontrada para "{busca}".</p>
          )}

          <div className="rotinas-lista">
            {rotinasFiltradas.map((rotina) => (
              <div
                key={rotina._id}
                className="rotina-card"
                onClick={() => navigate(`/professor/rotinas/${rotina._id}/editar`)}
              >
                <div className="rotina-card-topo">
                  <h3>{rotina.titulo}</h3>
                  <button
                    type="button"
                    className="rotina-excluir-btn"
                    onClick={(e) => abrirModalExcluir(e, rotina)}
                    aria-label="Excluir rotina"
                  >
                    🗑
                  </button>
                </div>
                <p className="rotina-card-descricao">{rotina.descricao}</p>
                <span className="rotina-card-grupos-contagem">
                  {rotina.grupos.length} {rotina.grupos.length === 1 ? "grupo" : "grupos"}
                </span>
              </div>
            ))}
          </div>
        </main>
      </div>

      <ModalConfirmacao
        aberto={modalExcluirAberto}
        titulo="Excluir rotina?"
        mensagem={`Tem certeza que deseja excluir "${rotinaSelecionada?.titulo}"? Essa ação não pode ser desfeita.`}
        textoConfirmar="Excluir"
        tipo="perigo"
        carregando={excluindo}
        onConfirmar={confirmarExclusao}
        onCancelar={() => {
          setModalExcluirAberto(false);
          setRotinaSelecionada(null);
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
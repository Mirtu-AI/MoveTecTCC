import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./ListaTreinos.css";
import Logotipo from "../../assets/logo/Logo_MoveTec.png";
import ModalConfirmacao from "../components/ModalConfirmacao";

interface ItemExercicio {
  exercicioId: string;
  series: string;
  repeticoes: string;
  exercicio: {
    nome: string;
  } | null;
}

interface Treino {
  _id: string;
  titulo: string;
  descricao: string;
  exercicios: ItemExercicio[];
}

export default function ListaTreinos() {
  const [treinos, setTreinos] = useState<Treino[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");

  const [treinoSelecionado, setTreinoSelecionado] = useState<Treino | null>(null);
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    buscarTreinos();
  }, []);

  async function buscarTreinos() {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3000/api/treinos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTreinos(response.data.treinos);
    } catch (err) {
      console.error(err);
    } finally {
      setCarregando(false);
    }
  }

  function abrirModalExcluir(e: React.MouseEvent, treino: Treino) {
    e.stopPropagation();
    setTreinoSelecionado(treino);
    setModalExcluirAberto(true);
  }

  async function confirmarExclusao() {
    if (!treinoSelecionado) return;

    setExcluindo(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:3000/api/professor/treinos/${treinoSelecionado._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setModalExcluirAberto(false);
      setTreinoSelecionado(null);
      buscarTreinos();
    } catch (err) {
      console.error(err);
    } finally {
      setExcluindo(false);
    }
  }

  const treinosFiltrados = treinos.filter((treino) => {
    const termo = busca.toLowerCase();
    const tituloMatch = treino.titulo.toLowerCase().includes(termo);
    const descricaoMatch = treino.descricao.toLowerCase().includes(termo);
    const exercicioMatch = treino.exercicios.some((item) =>
      item.exercicio?.nome.toLowerCase().includes(termo)
    );

    return tituloMatch || descricaoMatch || exercicioMatch;
  });

  return (
    <div className="lista-treinos-page">
      <NavegacaoProfessor />

      <div className="lista-treinos-main">
        <header className="lista-treinos-header">
          <h1>Treinos</h1>
          <div className="lista-treinos-header-acoes">
            <button
              type="button"
              className="lista-treinos-exercicios-btn"
              onClick={() => navigate("/professor/exercicios")}
            >
              Exercícios
            </button>
            <button
              type="button"
              className="lista-treinos-novo-btn"
              onClick={() => navigate("/professor/treinos/novo")}
            >
              + Novo treino
            </button>
          </div>
        </header>

        <main className="lista-treinos-conteudo">
          <div className="lista-treinos-busca-container">
            <input
              type="text"
              placeholder="Buscar por treino ou exercício..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="lista-treinos-busca-input"
            />
          </div>

          {carregando && <p className="lista-treinos-mensagem">Carregando...</p>}

          {!carregando && treinos.length === 0 && (
            <p className="lista-treinos-mensagem">Nenhum treino cadastrado ainda.</p>
          )}

          {!carregando && treinos.length > 0 && treinosFiltrados.length === 0 && (
            <p className="lista-treinos-mensagem">Nenhum treino encontrado para "{busca}".</p>
          )}

          <div className="treinos-lista">
            {treinosFiltrados.map((treino) => (
              <div
                key={treino._id}
                className="treino-card"
                onClick={() => navigate(`/professor/treinos/${treino._id}/editar`)}
              >
                <div className="treino-card-topo">
                  <h3>{treino.titulo}</h3>
                  <div className="treino-card-topo-acoes">
                    <span className="treino-card-contagem">
                      {treino.exercicios.length}{" "}
                      {treino.exercicios.length === 1 ? "exercício" : "exercícios"}
                    </span>
                    <button
                      type="button"
                      className="treino-excluir-btn"
                      onClick={(e) => abrirModalExcluir(e, treino)}
                      aria-label="Excluir treino"
                    >
                      🗑
                    </button>
                  </div>
                </div>
                <p className="treino-card-descricao">{treino.descricao}</p>

                <div className="treino-card-exercicios">
                  {treino.exercicios.map((item, indice) => (
                    <div key={indice} className="treino-exercicio-linha">
                      <span className="treino-exercicio-nome">
                        {item.exercicio?.nome || "Exercício removido"}
                      </span>
                      <span className="treino-exercicio-detalhe">
                        {item.series} x {item.repeticoes}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      <ModalConfirmacao
        aberto={modalExcluirAberto}
        titulo="Excluir treino?"
        mensagem={`Tem certeza que deseja excluir "${treinoSelecionado?.titulo}"? Essa ação não pode ser desfeita.`}
        textoConfirmar="Excluir"
        tipo="perigo"
        carregando={excluindo}
        onConfirmar={confirmarExclusao}
        onCancelar={() => {
          setModalExcluirAberto(false);
          setTreinoSelecionado(null);
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
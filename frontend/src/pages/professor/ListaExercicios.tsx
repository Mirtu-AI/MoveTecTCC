import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./ListaExercicios.css";
import ModalConfirmacao from "../components/ModalConfirmacao";
import Logotipo from "../../assets/logo/Logo_MoveTec.png";

interface Exercicio {
  _id: string;
  nome: string;
  midiaUrl: string | null;
  orientacoes: string;
  adaptacoes: string;
}

export default function ListaExercicios() {
  const [exercicios, setExercicios] = useState<Exercicio[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");

  const [exercicioSelecionado, setExercicioSelecionado] = useState<Exercicio | null>(null);
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    buscarExercicios();
  }, []);

  async function buscarExercicios() {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3000/api/exercicios", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExercicios(response.data.exercicios || []);
    } catch (err) {
      console.error(err);
    } finally {
      setCarregando(false);
    }
  }

  function abrirModalExcluir(e: React.MouseEvent, exercicio: Exercicio) {
    e.stopPropagation();
    setExercicioSelecionado(exercicio);
    setModalExcluirAberto(true);
  }

  async function confirmarExclusao() {
    if (!exercicioSelecionado) return;

    setExcluindo(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:3000/api/professor/exercicios/${exercicioSelecionado._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setModalExcluirAberto(false);
      setExercicioSelecionado(null);
      buscarExercicios();
    } catch (err) {
      console.error(err);
    } finally {
      setExcluindo(false);
    }
  }

  const exerciciosFiltrados = exercicios.filter((exercicio) => {
    const termo = busca.toLowerCase();
    const nomeMatch = exercicio.nome?.toLowerCase().includes(termo) ?? false;
    const orientacoesMatch = exercicio.orientacoes?.toLowerCase().includes(termo) ?? false;
    return nomeMatch || orientacoesMatch;
  });

  return (
    <div className="lista-exercicios-page">
      <NavegacaoProfessor />

      <div className="lista-exercicios-main">
        <header className="lista-exercicios-header">
          <div className="lista-exercicios-header-titulo">
            <h1>Exercícios</h1>
          </div>
          <button
            type="button"
            className="lista-exercicios-novo-btn"
            onClick={() => navigate("/professor/exercicios/novo")}
          >
            + Novo exercício
          </button>
        </header>

        <main className="lista-exercicios-conteudo">
          <div className="lista-exercicios-busca-container">
            <input
              type="text"
              placeholder="Buscar por nome ou orientação..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="lista-exercicios-busca-input"
            />
          </div>

          {carregando && <p className="lista-exercicios-mensagem">Carregando...</p>}

          {!carregando && exercicios.length === 0 && (
            <p className="lista-exercicios-mensagem">
              Nenhum exercício cadastrado ainda. Cadastre exercícios aqui antes de montar um treino.
            </p>
          )}

          {!carregando && exercicios.length > 0 && exerciciosFiltrados.length === 0 && (
            <p className="lista-exercicios-mensagem">Nenhum exercício encontrado para "{busca}".</p>
          )}

          <div className="exercicios-lista">
            {exerciciosFiltrados.map((exercicio) => (
              <div
                key={exercicio._id}
                className="exercicio-card"
                onClick={() => navigate(`/professor/exercicios/${exercicio._id}/editar`)}
              >
                <div className="exercicio-card-midia">
                  {exercicio.midiaUrl ? "▶" : "🏋️"}
                </div>
                <div className="exercicio-card-info">
                  <span className="exercicio-card-nome">{exercicio.nome}</span>
                  <span className="exercicio-card-orientacoes">{exercicio.orientacoes}</span>
                </div>
                <button
                  type="button"
                  className="exercicio-excluir-btn"
                  onClick={(e) => abrirModalExcluir(e, exercicio)}
                  aria-label="Excluir exercício"
                >
                  🗑
                </button>
              </div>
            ))}
          </div>
        </main>
      </div>

      <ModalConfirmacao
        aberto={modalExcluirAberto}
        titulo="Excluir exercício?"
        mensagem={`Tem certeza que deseja excluir "${exercicioSelecionado?.nome}"? Se algum treino já usar esse exercício, ele vai aparecer como "Exercício removido". Essa ação não pode ser desfeita.`}
        textoConfirmar="Excluir"
        tipo="perigo"
        carregando={excluindo}
        onConfirmar={confirmarExclusao}
        onCancelar={() => {
          setModalExcluirAberto(false);
          setExercicioSelecionado(null);
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
    { rota: "/professor/treinos", icone: "🏋️‍♂️", rotulo: "Treinos" },
    { rota: "/professor/exercicios", icone: "🏋️‍♂️", rotulo: "Exercícios" },
    { rota: "/professor/perfil", icone: "👤", rotulo: "Perfil" },
  ];

  return (
    <nav className="navegacao-professor">
      <div className="navegacao-logo">
        <img src={Logotipo} alt="MoveTec" />
      </div>
      <ul className="navegacao-lista">
        {menuItens.map((item) => {
          const ativo =
            location.pathname === item.rota ||
            (item.rota === "/dashboard" && location.pathname === "/professor/salas");
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
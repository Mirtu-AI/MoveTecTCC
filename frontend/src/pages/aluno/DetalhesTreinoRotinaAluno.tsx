import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./DetalhesTreinoRotinaAluno.css";

interface ItemExercicio {
  exercicioId: string;
  series: string;
  repeticoes: string;
  exercicio: { nome: string; tempoEstimado: number | null } | null;
}

interface Treino {
  titulo: string;
  descricao: string;
  midiaUrl: string | null;
  exercicios: ItemExercicio[];
}

export default function DetalhesTreinoRotinaAluno() {
  const { rotinaId, treinoId } = useParams();
  const navigate = useNavigate();

  const [treino, setTreino] = useState<Treino | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [concluindo] = useState(false);
  const [mostrarConfete] = useState(false);

  useEffect(() => {
    buscarTreino();
  }, [treinoId]);

  async function buscarTreino() {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:3000/api/aluno/treinos/${treinoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTreino(response.data.treino || null);
    } catch (err) {
      console.error(err);
    } finally {
      setCarregando(false);
    }
  }

  function formatarTempo(segundos: number | null) {
    if (!segundos) return "--";
    const min = Math.floor(segundos / 60);
    const seg = segundos % 60;
    return min > 0 ? `${min}min ${seg > 0 ? seg + "s" : ""}` : `${seg}s`;
  }

  async function comecar() {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:3000/api/aluno/treinos/${treinoId}/iniciar-execucao`,
        { rotinaId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate(`/aluno/execucoes-treino/${response.data.execucaoId}/executar`);
    } catch (err) {
      console.error(err);
    }
  }

  if (carregando) {
    return (
      <div className="detalhes-treino-rotina-carregando">
        <div className="detalhes-treino-rotina-spinner" />
        <p>Carregando detalhes do treino...</p>
      </div>
    );
  }

  if (!treino) {
    return (
      <div className="detalhes-treino-rotina-page">
        <div className="detalhes-treino-rotina-vazio-card">
          <p>Treino não encontrado ou indisponível.</p>
          <button className="detalhes-treino-rotina-voltar-btn" onClick={() => navigate(-1)}>
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="detalhes-treino-rotina-page">
      <header className="detalhes-treino-rotina-header">
        <button
          className="detalhes-treino-rotina-voltar"
          onClick={() => navigate(`/aluno/rotinas/${rotinaId}`)}
          aria-label="Voltar"
        >
          ←
        </button>
        <h1>{treino.titulo}</h1>
      </header>

      <main className="detalhes-treino-rotina-conteudo">
        {/* Banner de Mídia */}
        <div className="detalhes-treino-rotina-midia">
          {treino.midiaUrl ? (
            <img src={treino.midiaUrl} alt={treino.titulo} />
          ) : (
            <div className="detalhes-treino-rotina-placeholder">
              <span className="detalhes-treino-rotina-icone-placeholder">🏋️‍♂️</span>
            </div>
          )}
        </div>

        {/* Descrição */}
        {treino.descricao && (
          <div className="detalhes-treino-rotina-descricao-box">
            <span className="detalhes-treino-rotina-descricao-label">Orientação:</span>
            <p>{treino.descricao}</p>
          </div>
        )}

        {/* Lista de Exercícios */}
        <div className="detalhes-treino-rotina-secao-header">
          <span className="detalhes-treino-rotina-secao-titulo">Exercícios do Treino</span>
          <span className="detalhes-treino-rotina-badge-count">
            {treino.exercicios.length} {treino.exercicios.length === 1 ? "exercício" : "exercícios"}
          </span>
        </div>

        <div className="detalhes-treino-rotina-exercicios-lista">
          {treino.exercicios.map((item, index) => (
            <button
              type="button"
              key={item.exercicioId || index}
              className="detalhes-treino-rotina-exercicio-item"
              onClick={() => navigate(`/aluno/exercicios/${item.exercicioId}`)}
            >
              <div className="detalhes-treino-rotina-exercicio-badge">
                {index + 1}
              </div>
              
              <div className="detalhes-treino-rotina-exercicio-info">
                <span className="detalhes-treino-rotina-exercicio-nome">
                  {item.exercicio?.nome || "Exercício não especificado"}
                </span>
                <span className="detalhes-treino-rotina-exercicio-detalhes">
                  {item.series ? `${item.series} séries` : ""}
                  {item.series && item.repeticoes ? " • " : ""}
                  {item.repeticoes ? `${item.repeticoes} reps` : ""}
                </span>
              </div>

              <div className="detalhes-treino-rotina-exercicio-meta">
                <span className="detalhes-treino-rotina-exercicio-tempo">
                  ⏱️ {formatarTempo(item.exercicio?.tempoEstimado ?? null)}
                </span>
                <span className="detalhes-treino-rotina-seta">→</span>
              </div>
            </button>
          ))}
        </div>

        {/* Ação de Início */}
        <div className="detalhes-treino-rotina-comecar-wrap">
          <button
            type="button"
            className="detalhes-treino-rotina-comecar-btn"
            onClick={comecar}
            disabled={concluindo}
          >
            {concluindo ? "Iniciando..." : "🚀 Começar Treino"}
          </button>

          {mostrarConfete && (
            <div className="detalhes-treino-rotina-confete-container">
              {Array.from({ length: 16 }).map((_, i) => (
                <span
                  key={i}
                  className="detalhes-treino-rotina-confete-peca"
                  style={{
                    left: `${i * 6.5}%`,
                    backgroundColor: i % 2 === 0 ? "#ff552e" : "#10b981",
                    animationDelay: `${i * 0.04}s`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
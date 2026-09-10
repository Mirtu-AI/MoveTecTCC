import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./ExecutarAtividade.css";

interface ExercicioDetalhe {
  nome: string;
  midiaUrl: string | null;
  tempoEstimado: number | null;
}

interface ExercicioItem {
  exercicioId: string;
  concluido: boolean;
  exercicio: ExercicioDetalhe | null;
}

interface Atividade {
  titulo: string;
  exercicios: ExercicioItem[];
}

export default function ExecutarAtividade() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [atividade, setAtividade] = useState<Atividade | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [tempoRestante, setTempoRestante] = useState(0);
  const [avancando, setAvancando] = useState(false);

  useEffect(() => {
    buscarAtividade();
  }, [id]);

  async function buscarAtividade() {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:3000/api/aluno/atividades/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAtividade(response.data.atividade || null);
    } catch (err) {
      console.error(err);
    } finally {
      setCarregando(false);
    }
  }

  const exercicioAtual = atividade?.exercicios[indiceAtual];
  const tempoTotal = exercicioAtual?.exercicio?.tempoEstimado ?? 0;
  const ultimoExercicio = atividade ? indiceAtual === atividade.exercicios.length - 1 : false;

  useEffect(() => {
    if (!exercicioAtual) return;
    setTempoRestante(exercicioAtual.exercicio?.tempoEstimado ?? 0);
  }, [indiceAtual, exercicioAtual]);

  useEffect(() => {
    if (tempoRestante <= 0) return;
    const intervalo = setInterval(() => {
      setTempoRestante((atual) => (atual > 0 ? atual - 1 : 0));
    }, 1000);
    return () => clearInterval(intervalo);
  }, [tempoRestante > 0, indiceAtual]);

  function formatarTempo(segundos: number) {
    const min = Math.floor(segundos / 60);
    const seg = segundos % 60;
    return `${String(min).padStart(2, "0")}:${String(seg).padStart(2, "0")}s`;
  }

  function voltar() {
    setIndiceAtual((atual) => Math.max(0, atual - 1));
  }

  async function confirmar() {
    if (!atividade || !exercicioAtual || avancando) return;

    setAvancando(true);
    try {
      if (!exercicioAtual.concluido) {
        const token = localStorage.getItem("token");
        await axios.put(
          `http://localhost:3000/api/aluno/atividades/${id}/exercicios/${exercicioAtual.exercicioId}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      if (ultimoExercicio) {
        navigate(`/aluno/atividades/${id}/parabens`);
      } else {
        setIndiceAtual((atual) => atual + 1);
        await buscarAtividade();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAvancando(false);
    }
  }

  if (carregando) {
    return <p className="executar-atividade-mensagem">Carregando...</p>;
  }

  if (!atividade || !exercicioAtual) {
    return <p className="executar-atividade-mensagem">Atividade não encontrada.</p>;
  }

  const progressoAnel = tempoTotal > 0 ? (tempoRestante / tempoTotal) * 100 : 100;
  const circunferencia = 2 * Math.PI * 54;
  const offset = circunferencia * (1 - progressoAnel / 100);

  return (
    <div className="executar-atividade-page">
      <header className="executar-atividade-header">
        <button
          className="executar-atividade-voltar-topo"
          onClick={() => navigate(-1)}
          aria-label="Sair da execução"
        >
          ←
        </button>
        <h1>{exercicioAtual.exercicio?.nome || "Exercício"}</h1>
      </header>

      <main className="executar-atividade-conteudo">
        <div className="executar-atividade-midia-wrap">
          <svg className="executar-atividade-anel" viewBox="0 0 120 120">
            <circle className="executar-atividade-anel-trilha" cx="60" cy="60" r="54" />
            {tempoTotal > 0 && (
              <circle
                className="executar-atividade-anel-progresso"
                cx="60"
                cy="60"
                r="54"
                strokeDasharray={circunferencia}
                strokeDashoffset={offset}
              />
            )}
          </svg>

          <div className="executar-atividade-midia">
            {exercicioAtual.exercicio?.midiaUrl ? (
              <a
                href={exercicioAtual.exercicio.midiaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="executar-atividade-midia-play"
                aria-label="Abrir mídia"
              >
                ▶
              </a>
            ) : (
              <span className="executar-atividade-midia-placeholder">🖼️</span>
            )}
          </div>
        </div>

        <h2 className="executar-atividade-nome">{exercicioAtual.exercicio?.nome}</h2>

        {tempoTotal > 0 && (
          <span className="executar-atividade-tempo">{formatarTempo(tempoRestante)}</span>
        )}

        <div className="executar-atividade-controles">
          <button
            type="button"
            className="executar-atividade-controle-btn"
            onClick={voltar}
            disabled={indiceAtual === 0}
            aria-label="Exercício anterior"
          >
            «
          </button>
          <button
            type="button"
            className="executar-atividade-controle-btn confirmar"
            onClick={confirmar}
            disabled={avancando}
            aria-label={ultimoExercicio ? "Finalizar exercícios" : "Próximo exercício"}
          >
            ✓
          </button>
        </div>
      </main>
    </div>
  );
}
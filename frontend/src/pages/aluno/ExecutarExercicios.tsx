import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./ExecutarAtividade.css";

interface ExercicioItem {
  exercicioId: string;
  concluido: boolean;
  exercicio: { nome: string; midiaUrl: string | null; tempoEstimado: number | null } | null;
}
interface Dados {
  exercicios: ExercicioItem[];
}
interface Props {
  tipo: "atividade" | "treino";
}

export default function ExecutarExercicios({ tipo }: Props) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [dados, setDados] = useState<Dados | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [tempoRestante, setTempoRestante] = useState(0);
  const [avancando, setAvancando] = useState(false);

  const baseUrl =
    tipo === "atividade"
      ? `http://localhost:3000/api/aluno/atividades/${id}`
      : `http://localhost:3000/api/aluno/execucoes-treino/${id}`;

  useEffect(() => {
    buscarDados();
  }, [id]);

  async function buscarDados() {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(baseUrl, { headers: { Authorization: `Bearer ${token}` } });
      setDados((tipo === "atividade" ? response.data.atividade : response.data.execucao) || null);
    } catch (err) {
      console.error(err);
    } finally {
      setCarregando(false);
    }
  }

  const exercicioAtual = dados?.exercicios[indiceAtual];
  const tempoTotal = exercicioAtual?.exercicio?.tempoEstimado ?? 0;
  const ultimoExercicio = dados ? indiceAtual === dados.exercicios.length - 1 : false;

  useEffect(() => {
    if (!exercicioAtual) return;
    setTempoRestante(exercicioAtual.exercicio?.tempoEstimado ?? 0);
  }, [indiceAtual, exercicioAtual]);

  useEffect(() => {
    if (tempoRestante <= 0) return;
    const intervalo = setInterval(() => setTempoRestante((a) => (a > 0 ? a - 1 : 0)), 1000);
    return () => clearInterval(intervalo);
  }, [tempoRestante > 0, indiceAtual]);

  function formatarTempo(segundos: number) {
    const min = Math.floor(segundos / 60);
    const seg = segundos % 60;
    return `${String(min).padStart(2, "0")}:${String(seg).padStart(2, "0")}s`;
  }

  function voltar() {
    setIndiceAtual((a) => Math.max(0, a - 1));
  }

  async function confirmar() {
    if (!dados || !exercicioAtual || avancando) return;

    setAvancando(true);
    try {
      if (!exercicioAtual.concluido) {
        const token = localStorage.getItem("token");
        await axios.put(
          `${baseUrl}/exercicios/${exercicioAtual.exercicioId}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      if (ultimoExercicio) {
        navigate(`${tipo === "atividade" ? "/aluno/atividades" : "/aluno/execucoes-treino"}/${id}/parabens`);
      } else {
        setIndiceAtual((a) => a + 1);
        await buscarDados();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAvancando(false);
    }
  }

  if (carregando) return <p className="executar-atividade-mensagem">Carregando...</p>;
  if (!dados || !exercicioAtual) return <p className="executar-atividade-mensagem">Não encontrado.</p>;

  const progressoAnel = tempoTotal > 0 ? (tempoRestante / tempoTotal) * 100 : 100;
  const circunferencia = 2 * Math.PI * 54;
  const offset = circunferencia * (1 - progressoAnel / 100);

  return (
    <div className="executar-atividade-page">
      <header className="executar-atividade-header">
        <button className="executar-atividade-voltar-topo" onClick={() => navigate(-1)} aria-label="Sair">
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
                cx="60" cy="60" r="54"
                strokeDasharray={circunferencia}
                strokeDashoffset={offset}
              />
            )}
          </svg>
          <div className="executar-atividade-midia">
            {exercicioAtual.exercicio?.midiaUrl ? (
              <a href={exercicioAtual.exercicio.midiaUrl} target="_blank" rel="noopener noreferrer" className="executar-atividade-midia-play">▶</a>
            ) : (
              <span className="executar-atividade-midia-placeholder">🖼️</span>
            )}
          </div>
        </div>

        <h2 className="executar-atividade-nome">{exercicioAtual.exercicio?.nome}</h2>
        {tempoTotal > 0 && <span className="executar-atividade-tempo">{formatarTempo(tempoRestante)}</span>}

        <div className="executar-atividade-controles">
          <button type="button" className="executar-atividade-controle-btn" onClick={voltar} disabled={indiceAtual === 0}>«</button>
          <button type="button" className="executar-atividade-controle-btn confirmar" onClick={confirmar} disabled={avancando}>✓</button>
        </div>
      </main>
    </div>
  );
}
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
  const [concluindo, setConcluindo] = useState(false);
  const [mostrarConfete, setMostrarConfete] = useState(false);

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
    if (!segundos) return "Tempo";
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
    return <p className="detalhes-treino-rotina-mensagem">Carregando...</p>;
  }

  if (!treino) {
    return <p className="detalhes-treino-rotina-mensagem">Treino não encontrado.</p>;
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
        <div className="detalhes-treino-rotina-midia">
          {treino.midiaUrl ? <img src={treino.midiaUrl} alt="" /> : <span>🖼️</span>}
        </div>

        {treino.descricao && (
          <div className="detalhes-treino-rotina-descricao-box">{treino.descricao}</div>
        )}

        <span className="detalhes-treino-rotina-secao-titulo">Exercícios</span>

        <div className="detalhes-treino-rotina-exercicios-lista">
          {treino.exercicios.map((item) => (
            <button
              type="button"
              key={item.exercicioId}
              className="detalhes-treino-rotina-exercicio-item"
              onClick={() => navigate(`/aluno/exercicios/${item.exercicioId}`)}
            >
              <span className="detalhes-treino-rotina-exercicio-icone">🖼️</span>
              <span className="detalhes-treino-rotina-exercicio-nome">
                {item.exercicio?.nome || "Exercício removido"}
              </span>
              <span className="detalhes-treino-rotina-exercicio-tempo">
                {formatarTempo(item.exercicio?.tempoEstimado ?? null)}
              </span>
            </button>
          ))}
        </div>

        <div className="detalhes-treino-rotina-comecar-wrap">
          <button
            type="button"
            className="detalhes-treino-rotina-comecar-btn"
            onClick={comecar}
            disabled={concluindo}
          >
            ✓ {concluindo ? "Concluindo..." : "Começar"}
          </button>

          {mostrarConfete && (
            <div className="detalhes-treino-rotina-confete-container">
              {Array.from({ length: 16 }).map((_, i) => (
                <span
                  key={i}
                  className="detalhes-treino-rotina-confete-peca"
                  style={{
                    left: `${i * 6.5}%`,
                    backgroundColor: i % 2 === 0 ? "orange" : "#22c55e",
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
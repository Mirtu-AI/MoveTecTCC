import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import confetti from "canvas-confetti";
import "./ParabensAtividade.css";

interface ExercicioItem {
  exercicio: { tempoEstimado: number | null } | null;
}

interface Atividade {
  titulo: string;
  exercicios: ExercicioItem[];
}

export default function ParabensAtividade() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [atividade, setAtividade] = useState<Atividade | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
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

    buscarAtividade();
  }, [id]);

  // Efeito para disparar confetes assim que os dados carregarem
  useEffect(() => {
    if (!carregando && atividade) {
      // Disparo inicial
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#ff5722", "#22c55e", "#ffffff", "#ffb703"],
      });

      // Segundo disparo para reforçar a sensação de festa
      const timeout = setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#ff5722", "#22c55e"],
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#ff5722", "#22c55e"],
        });
      }, 300);

      return () => clearTimeout(timeout);
    }
  }, [carregando, atividade]);

  function formatarTempoTotal(segundosTotal: number) {
    const min = Math.floor(segundosTotal / 60);
    const seg = segundosTotal % 60;
    if (min === 0) return `${seg}s`;
    return `${min}min ${seg > 0 ? seg + "s" : ""}`;
  }

  if (carregando) {
    return <p className="parabens-atividade-mensagem">Carregando...</p>;
  }

  if (!atividade) {
    return <p className="parabens-atividade-mensagem">Atividade não encontrada.</p>;
  }

  const totalExercicios = atividade.exercicios.length;
  const tempoTotal = atividade.exercicios.reduce(
    (soma, item) => soma + (item.exercicio?.tempoEstimado || 0),
    0
  );

  return (
    <div className="parabens-atividade-page">
      <main className="parabens-atividade-conteudo">
        <div className="parabens-atividade-badge-wrapper">
          <div className="parabens-atividade-check">✓</div>
        </div>

        <h1 className="parabens-atividade-titulo">Atividade Concluída!</h1>
        <p className="parabens-atividade-subtitulo">Excelente trabalho, meta batida! 🔥</p>

        <div className="parabens-atividade-resumo">
          <div className="parabens-atividade-resumo-linha">
            <span>Exercícios Concluídos</span>
            <strong>{totalExercicios}</strong>
          </div>
          <div className="parabens-atividade-resumo-linha">
            <span>Tempo Estimado</span>
            <strong>{formatarTempoTotal(tempoTotal)}</strong>
          </div>
        </div>

        <button
          type="button"
          className="parabens-atividade-finalizar-btn"
          onClick={() => navigate(`/aluno/atividades/${id}`)}
        >
          ✓ Voltar para Detalhes
        </button>
      </main>
    </div>
  );
}
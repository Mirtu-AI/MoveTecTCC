import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import confetti from "canvas-confetti";
import "./ParabensAtividade.css";

interface ExercicioItem {
  exercicio: { tempoEstimado: number | null } | null;
}

interface Dados {
  titulo?: string;
  exercicios: ExercicioItem[];
  rotinaId?: string | null;
}

interface Props {
  tipo: "atividade" | "treino";
}

export default function ParabensAtividade({ tipo }: Props) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [dados, setDados] = useState<Dados | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function buscarDados() {
      try {
        const token = localStorage.getItem("token");
        const baseUrl =
          tipo === "atividade"
            ? `http://localhost:3000/api/aluno/atividades/${id}`
            : `http://localhost:3000/api/aluno/execucoes-treino/${id}`;

        const response = await axios.get(baseUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setDados((tipo === "atividade" ? response.data.atividade : response.data.execucao) || null);
      } catch (err) {
        console.error(err);
      } finally {
        setCarregando(false);
      }
    }

    buscarDados();
  }, [id, tipo]);

  // Efeito para disparar confetes assim que os dados carregarem
  useEffect(() => {
    if (!carregando && dados) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#ff5722", "#22c55e", "#ffffff", "#ffb703"],
      });

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
  }, [carregando, dados]);

  function formatarTempoTotal(segundosTotal: number) {
    const min = Math.floor(segundosTotal / 60);
    const seg = segundosTotal % 60;
    if (min === 0) return `${seg}s`;
    return `${min}min ${seg > 0 ? seg + "s" : ""}`;
  }

  if (carregando) {
    return <p className="parabens-atividade-mensagem">Carregando...</p>;
  }

  if (!dados) {
    return <p className="parabens-atividade-mensagem">Não encontrado.</p>;
  }

  const totalExercicios = dados.exercicios.length;
  const tempoTotal = dados.exercicios.reduce(
    (soma, item) => soma + (item.exercicio?.tempoEstimado || 0),
    0
  );

  return (
    <div className="parabens-atividade-page">
      <main className="parabens-atividade-conteudo">
        <div className="parabens-atividade-badge-wrapper">
          <div className="parabens-atividade-check">✓</div>
        </div>

        <h1 className="parabens-atividade-titulo">
          {tipo === "atividade" ? "Atividade Concluída!" : "Treino Concluído!"}
        </h1>
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
          onClick={() =>
            navigate(
              tipo === "atividade"
                ? `/aluno/atividades/${id}`
                : dados.rotinaId
                ? `/aluno/rotinas/${dados.rotinaId}`
                : "/aluno"
            )
          }
        >
          ✓ {tipo === "atividade" ? "Voltar para Detalhes" : dados.rotinaId ? "Voltar para a Rotina" : "Voltar para o Início"}
        </button>
      </main>
    </div>
  );
}
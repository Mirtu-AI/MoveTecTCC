import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./DetalhesExercicioAluno.css";

interface Exercicio {
  nome: string;
  midiaUrl: string | null;
  orientacoes: string;
  adaptacoes: string;
  tempoEstimado: number | null;
}

export default function DetalhesExercicioAluno() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [exercicio, setExercicio] = useState<Exercicio | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function buscarExercicio() {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`http://localhost:3000/api/exercicios/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setExercicio(response.data.exercicio || null);
      } catch (err) {
        console.error(err);
      } finally {
        setCarregando(false);
      }
    }

    buscarExercicio();
  }, [id]);

  if (carregando) {
    return <p className="detalhes-exercicio-aluno-mensagem">Carregando...</p>;
  }

  if (!exercicio) {
    return <p className="detalhes-exercicio-aluno-mensagem">Exercício não encontrado.</p>;
  }

  return (
    <div className="detalhes-exercicio-aluno-page">
      <header className="detalhes-exercicio-aluno-header">
        <button
          className="detalhes-exercicio-aluno-voltar"
          onClick={() => navigate(-1)}
          aria-label="Voltar"
        >
          ←
        </button>
        <h1>{exercicio.nome}</h1>
      </header>

      <main className="detalhes-exercicio-aluno-conteudo">
        <div className="detalhes-exercicio-aluno-midia">
          {exercicio.midiaUrl ? (
            <a href={exercicio.midiaUrl} target="_blank" rel="noopener noreferrer" aria-label="Ver mídia">
              ▶
            </a>
          ) : (
            <span style={{ fontSize: "0.9rem", color: "#888" }}>Sem mídia disponível</span>
          )}
        </div>

        {exercicio.tempoEstimado && (
          <div className="detalhes-exercicio-aluno-secao">
            <span className="detalhes-exercicio-aluno-label">Tempo estimado</span>
            <p className="detalhes-exercicio-aluno-texto">⏱️ {exercicio.tempoEstimado} segundos</p>
          </div>
        )}

        <div className="detalhes-exercicio-aluno-secao">
          <span className="detalhes-exercicio-aluno-label">Orientações</span>
          <p className="detalhes-exercicio-aluno-texto">{exercicio.orientacoes}</p>
        </div>

        {exercicio.adaptacoes && (
          <div className="detalhes-exercicio-aluno-secao">
            <span className="detalhes-exercicio-aluno-label">Adaptações</span>
            <p className="detalhes-exercicio-aluno-texto">{exercicio.adaptacoes}</p>
          </div>
        )}
      </main>
    </div>
  );
}
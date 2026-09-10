import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./DetalhesExercicio.css";

interface Exercicio {
  nome: string;
  midiaUrl: string | null;
  orientacoes: string;
  adaptacoes: string;
}

export default function DetalhesExercicio() {
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
        setExercicio(response.data.exercicio);
      } catch (err) {
        console.error(err);
      } finally {
        setCarregando(false);
      }
    }

    buscarExercicio();
  }, [id]);

  if (carregando) {
    return <p className="detalhes-exercicio-mensagem">Carregando...</p>;
  }

  if (!exercicio) {
    return <p className="detalhes-exercicio-mensagem">Exercício não encontrado.</p>;
  }

  return (
    <div className="detalhes-exercicio-page">
      <header className="detalhes-exercicio-header">
        <button
          className="detalhes-exercicio-voltar"
          onClick={() => navigate(-1)}
          aria-label="Voltar"
        >
          ←
        </button>
        <h1>{exercicio.nome}</h1>
      </header>

      <main className="detalhes-exercicio-conteudo">
        {/* Adicionada a div do card principal envelopando as seções */}
        <div className="detalhes-exercicio-card-info">
          
          <div className="detalhes-exercicio-midia">
            {exercicio.midiaUrl ? (
              <a
                href={exercicio.midiaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="detalhes-exercicio-midia-play"
                aria-label="Abrir mídia em nova aba"
              >
                ▶
              </a>
            ) : (
              <span className="detalhes-exercicio-midia-placeholder">Sem mídia</span>
            )}
          </div>

          <div className="detalhes-exercicio-secao">
            <span className="detalhes-exercicio-label">Orientações</span>
            <p className="detalhes-exercicio-texto">{exercicio.orientacoes}</p>
          </div>

          {exercicio.adaptacoes && (
            <div className="detalhes-exercicio-secao">
              <span className="detalhes-exercicio-label">Adaptações</span>
              <p className="detalhes-exercicio-texto">{exercicio.adaptacoes}</p>
            </div>
          )}

          <button
            type="button"
            className="detalhes-exercicio-editar-btn"
            onClick={() => navigate(`/professor/exercicios/${id}/editar`)}
          >
            Editar exercício
          </button>

        </div>
      </main>
    </div>
  );
}
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./DetalhesTreinoEspecifico.css";

interface ItemExercicio {
  series: string;
  repeticoes: string;
  exercicio: { nome: string } | null;
}

interface Treino {
  titulo: string;
  descricao: string;
  midiaUrl: string | null;
  exercicios: ItemExercicio[];
}

export default function DetalhesTreinoEspecificaAluno() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [treino, setTreino] = useState<Treino | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [iniciando, setIniciando] = useState(false);

  useEffect(() => {
    buscarTreino();
  }, [id]);

  async function buscarTreino() {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:3000/api/aluno/treinos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTreino(response.data.treino || null);
    } catch (err) {
      console.error(err);
    } finally {
      setCarregando(false);
    }
  }

  async function comecar() {
    if (iniciando) return;
    setIniciando(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:3000/api/aluno/treinos/${id}/iniciar-execucao`,
        { rotinaId: null },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate(`/aluno/execucoes-treino/${response.data.execucaoId}/executar`);
    } catch (err) {
      console.error(err);
      setIniciando(false);
    }
  }

  if (carregando) {
    return (
      <div className="detalhes-treino-especifico-page">
        <div className="detalhes-treino-especifico-mensagem">
          <div className="detalhes-treino-especifico-spinner" />
          <p>Carregando treino...</p>
        </div>
      </div>
    );
  }

  if (!treino) {
    return (
      <div className="detalhes-treino-especifico-page">
        <div className="detalhes-treino-especifico-mensagem">
          <p>Treino não encontrado.</p>
          <button className="detalhes-treino-especifico-voltar-btn" onClick={() => navigate(-1)}>
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="detalhes-treino-especifico-page">
      <header className="detalhes-treino-especifico-header">
        <button
          className="detalhes-treino-especifico-voltar"
          onClick={() => navigate(-1)}
          aria-label="Voltar"
        >
          ←
        </button>
        <h1>{treino.titulo}</h1>
      </header>

      <main className="detalhes-treino-especifico-conteudo">
        <div className="detalhes-treino-especifico-midia">
          {treino.midiaUrl ? (
            <img src={treino.midiaUrl} alt={treino.titulo} />
          ) : (
            <span className="detalhes-treino-especifico-icone-midia">🏋️</span>
          )}
        </div>

        {treino.descricao && (
          <p className="detalhes-treino-especifico-descricao">{treino.descricao}</p>
        )}

        <div className="detalhes-treino-especifico-secao-header">
          <span className="detalhes-treino-especifico-secao-titulo">Exercícios</span>
          <span className="detalhes-treino-especifico-badge">
            {treino.exercicios.length} {treino.exercicios.length === 1 ? "item" : "itens"}
          </span>
        </div>

        <div className="detalhes-treino-especifico-lista">
          {treino.exercicios.map((item, idx) => (
            <div key={idx} className="detalhes-treino-especifico-item">
              <span className="detalhes-treino-especifico-item-nome">
                {item.exercicio?.nome || "Exercício removido"}
              </span>
              <span className="detalhes-treino-especifico-item-detalhe">
                {item.series ? `${item.series}x` : ""} {item.repeticoes ? `${item.repeticoes}` : ""}
              </span>
            </div>
          ))}
        </div>

        <button
          type="button"
          className="detalhes-treino-especifico-comecar-btn"
          onClick={comecar}
          disabled={iniciando}
        >
          {iniciando ? "Iniciando..." : "✓ Começar"}
        </button>
      </main>
    </div>
  );
}
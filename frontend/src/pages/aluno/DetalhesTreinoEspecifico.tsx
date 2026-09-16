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

  if (carregando) return <p className="detalhes-treino-especifico-mensagem">Carregando...</p>;
  if (!treino) return <p className="detalhes-treino-especifico-mensagem">Treino não encontrado.</p>;

  return (
    <div className="detalhes-treino-especifico-page">
      <header className="detalhes-treino-especifico-header">
        <button className="detalhes-treino-especifico-voltar" onClick={() => navigate(-1)} aria-label="Voltar">
          ←
        </button>
        <h1>{treino.titulo}</h1>
      </header>

      <main className="detalhes-treino-especifico-conteudo">
        <div className="detalhes-treino-especifico-midia">
          {treino.midiaUrl ? <img src={treino.midiaUrl} alt="" /> : <span>🏋️</span>}
        </div>

        <p className="detalhes-treino-especifico-descricao">{treino.descricao}</p>

        <span className="detalhes-treino-especifico-secao-titulo">Exercícios</span>
        <div className="detalhes-treino-especifico-lista">
          {treino.exercicios.map((item, idx) => (
            <div key={idx} className="detalhes-treino-especifico-item">
              <span className="detalhes-treino-especifico-item-nome">
                {item.exercicio?.nome || "Exercício removido"}
              </span>
              <span className="detalhes-treino-especifico-item-detalhe">
                {item.series} x {item.repeticoes}
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
          ✓ {iniciando ? "Iniciando..." : "Começar"}
        </button>
      </main>
    </div>
  );
}
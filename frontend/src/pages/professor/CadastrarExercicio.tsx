import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./CadastrarExercicio.css";

export default function CadastrarExercicio() {
  const { id } = useParams();
  const modoEdicao = Boolean(id);
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [midiaUrl, setMidiaUrl] = useState("");
  const [orientacoes, setOrientacoes] = useState("");
  const [adaptacoes, setAdaptacoes] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [carregandoDados, setCarregandoDados] = useState(modoEdicao);
  const [tempoEstimado, setTempoEstimado] = useState("");

  useEffect(() => {
    if (!modoEdicao) return;

    async function buscarExercicio() {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`http://localhost:3000/api/exercicios/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const exercicio = response.data.exercicio;
        setNome(exercicio.nome);
        setMidiaUrl(exercicio.midiaUrl || "");
        setOrientacoes(exercicio.orientacoes);
        setAdaptacoes(exercicio.adaptacoes || "");
        setTempoEstimado(exercicio.tempoEstimado ? String(exercicio.tempoEstimado) : "");
      } catch (err) {
        console.error(err);
      } finally {
        setCarregandoDados(false);
      }
    }

    buscarExercicio();
  }, [id, modoEdicao]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (!nome.trim() || !orientacoes.trim()) {
      setErro("Preencha ao menos o nome e as orientações do exercício.");
      return;
    }

    setCarregando(true);

    try {
      const token = localStorage.getItem("token");
      const dados = { nome, midiaUrl, orientacoes, adaptacoes, tempoEstimado };

      if (modoEdicao) {
        await axios.put(`http://localhost:3000/api/professor/exercicios/${id}`, dados, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post("http://localhost:3000/api/professor/exercicios", dados, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      navigate("/professor/exercicios");
    } catch (err: any) {
      const mensagem = err.response?.data?.erros?.[0] || "Não foi possível salvar o exercício.";
      setErro(mensagem);
    } finally {
      setCarregando(false);
    }
  }

  if (carregandoDados) {
    return <p className="cadastrar-exercicio-mensagem">Carregando...</p>;
  }

  return (
    <div className="cadastrar-exercicio-page">
      <header className="cadastrar-exercicio-header">
        <button
          className="cadastrar-exercicio-voltar"
          onClick={() => navigate("/professor/exercicios")}
          aria-label="Voltar"
        >
          ←
        </button>
        <h1>{modoEdicao ? "Editar exercício" : "Exercício"}</h1>
      </header>

      <main className="cadastrar-exercicio-conteudo">
        <form onSubmit={handleSubmit} className="cadastrar-exercicio-form">
          <div className="cadastrar-exercicio-midia-preview">
            {midiaUrl ? (
              <div className="cadastrar-exercicio-midia-play">▶</div>
            ) : (
              <span className="cadastrar-exercicio-midia-placeholder">Sem mídia</span>
            )}
          </div>

          <label htmlFor="midiaUrl">Link do vídeo ou imagem (opcional)</label>
          <input
            id="midiaUrl"
            type="text"
            placeholder="https://..."
            value={midiaUrl}
            onChange={(e) => setMidiaUrl(e.target.value)}
          />

          <label htmlFor="nome">Nome</label>
          <input
            id="nome"
            type="text"
            placeholder="Ex: Prancha"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />

          <label htmlFor="orientacoes">Orientações</label>
          <textarea
            id="orientacoes"
            placeholder="Como executar o movimento corretamente"
            value={orientacoes}
            onChange={(e) => setOrientacoes(e.target.value)}
            rows={4}
          />

          <label htmlFor="adaptacoes">Adaptações</label>
          <textarea
            id="adaptacoes"
            placeholder="Alternativa para alunos com alguma limitação (opcional)"
            value={adaptacoes}
            onChange={(e) => setAdaptacoes(e.target.value)}
            rows={3}
          />
          <label htmlFor="tempoEstimado">Tempo estimado (segundos)</label>
          <input
            id="tempoEstimado"
            type="number"
            min="1"
            placeholder="Ex: 60"
            value={tempoEstimado}
            onChange={(e) => setTempoEstimado(e.target.value)}
          />

          {erro && <p className="cadastrar-exercicio-erro">{erro}</p>}

          <button type="submit" className="btn btn-filled cadastrar-exercicio-salvar-btn" disabled={carregando}>
            {carregando ? "Salvando..." : "Adicionar/editar"}
          </button>
        </form>
      </main>
    </div>
  );
}
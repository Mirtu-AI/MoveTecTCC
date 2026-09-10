import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./CadastrarTreino.css";

interface ExercicioCatalogo {
  _id: string;
  nome: string;
}

interface ItemExercicio {
  exercicioId: string;
  nome: string;
  series: string;
  repeticoes: string;
}

export default function CadastrarTreino() {
  const { id } = useParams();
  const modoEdicao = Boolean(id);
  const navigate = useNavigate();

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [catalogo, setCatalogo] = useState<ExercicioCatalogo[]>([]);
  const [selecionadoParaAdicionar, setSelecionadoParaAdicionar] = useState("");
  const [itens, setItens] = useState<ItemExercicio[]>([]);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [carregandoDados, setCarregandoDados] = useState(true);
  const [especifica, setEspecifica] = useState(false);

  const [tipo, setTipo] = useState<"rotina" | "especifica">("rotina");

  useEffect(() => {
    async function carregarDados() {
      try {
        const token = localStorage.getItem("token");
        const responseCatalogo = await axios.get("http://localhost:3000/api/exercicios", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCatalogo(responseCatalogo.data.exercicios);

        if (modoEdicao) {
          const responseTreino = await axios.get(`http://localhost:3000/api/treinos/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const treino = responseTreino.data.treino;
          setTitulo(treino.titulo);
          setDescricao(treino.descricao);
          setEspecifica(Boolean(treino.especifica));
          setItens(
            treino.exercicios.map((item: any) => ({
              exercicioId: item.exercicioId,
              nome: item.exercicio?.nome || "Exercício removido",
              series: item.series,
              repeticoes: item.repeticoes,
            }))
          );
        }
      } catch (err) {
        console.error(err);
      } finally {
        setCarregandoDados(false);
      }
    }

    carregarDados();
  }, [id, modoEdicao]);

  const exerciciosDisponiveis = catalogo.filter(
    (ex) => !itens.some((item) => item.exercicioId === ex._id)
  );

  function adicionarExercicio() {
    if (!selecionadoParaAdicionar) return;

    const exercicio = catalogo.find((ex) => ex._id === selecionadoParaAdicionar);
    if (!exercicio) return;

    setItens((atual) => [
      ...atual,
      { exercicioId: exercicio._id, nome: exercicio.nome, series: "", repeticoes: "" },
    ]);
    setSelecionadoParaAdicionar("");
  }

  function atualizarItem(indice: number, campo: "series" | "repeticoes", valor: string) {
    setItens((atual) =>
      atual.map((item, i) => (i === indice ? { ...item, [campo]: valor } : item))
    );
  }

  function removerItem(indice: number) {
    setItens((atual) => atual.filter((_, i) => i !== indice));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (!titulo.trim() || !descricao.trim()) {
      setErro("Preencha o título e a descrição do treino.");
      return;
    }

    if (itens.length === 0) {
      setErro("Selecione ao menos um exercício.");
      return;
    }

    const itensValidos = itens.every((item) => item.series.trim() && item.repeticoes.trim());
    if (!itensValidos) {
      setErro("Preencha séries e repetições de todos os exercícios selecionados.");
      return;
    }

    setCarregando(true);

    try {
      const token = localStorage.getItem("token");
      const dados = {
        titulo,
        descricao,
        especifica,
        exercicios: itens.map((item) => ({
          exercicioId: item.exercicioId,
          series: item.series,
          repeticoes: item.repeticoes,
        })),
      };

      if (modoEdicao) {
        await axios.put(`http://localhost:3000/api/professor/treinos/${id}`, dados, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post("http://localhost:3000/api/professor/treinos", dados, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      navigate("/professor/treinos");
    } catch (err: any) {
      const mensagem = err.response?.data?.erros?.[0] || "Não foi possível salvar o treino.";
      setErro(mensagem);
    } finally {
      setCarregando(false);
    }
  }

  if (carregandoDados) {
    return <p className="cadastrar-treino-mensagem">Carregando...</p>;
  }

  return (
    <div className="cadastrar-treino-page">
      <header className="cadastrar-treino-header">
        <button
          className="cadastrar-treino-voltar"
          onClick={() => navigate("/professor/treinos")}
          aria-label="Voltar"
        >
          ←
        </button>
        <h1>{modoEdicao ? "Editar treino" : "Novo treino"}</h1>
      </header>

      <main className="cadastrar-treino-conteudo">
        <form onSubmit={handleSubmit} className="cadastrar-treino-form">
          <label htmlFor="titulo">Título do treino</label>
          <input
            id="titulo"
            type="text"
            placeholder="Ex: Treino de pernas — iniciante"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />

          <label htmlFor="descricao">Descrição geral</label>
          <textarea
            id="descricao"
            placeholder="Explique o objetivo do treino, orientações gerais, etc."
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            rows={4}
          />
          <label htmlFor="tipo">Tipo de treino</label>
          <label className="cadastrar-treino-toggle-linha">
            <span>Mostrar como atividade específica na tela do aluno</span>
            <input type="checkbox" checked={especifica} onChange={(e) => setEspecifica(e.target.checked)} />
          </label>

          <div className="cadastrar-treino-exercicios-topo">
            <span>Exercícios</span>
            <button
              type="button"
              className="cadastrar-treino-catalogo-link"
              onClick={() => navigate("/professor/exercicios/novo")}
            >
              Cadastrar novo exercício
            </button>
          </div>

          <div className="cadastrar-treino-seletor">
            <select
              value={selecionadoParaAdicionar}
              onChange={(e) => setSelecionadoParaAdicionar(e.target.value)}
              disabled={exerciciosDisponiveis.length === 0}
            >
              <option value="">
                {exerciciosDisponiveis.length === 0
                  ? "Todos os exercícios já foram adicionados"
                  : "Escolha um exercício do catálogo..."}
              </option>
              {exerciciosDisponiveis.map((ex) => (
                <option key={ex._id} value={ex._id}>
                  {ex.nome}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="cadastrar-treino-add-btn"
              onClick={adicionarExercicio}
              disabled={!selecionadoParaAdicionar}
            >
              Adicionar
            </button>
          </div>

          {catalogo.length === 0 && (
            <p className="cadastrar-treino-aviso-catalogo">
              Você ainda não tem exercícios cadastrados. Cadastre pelo menos um antes de montar o treino.
            </p>
          )}

          <div className="cadastrar-treino-exercicios-lista">
            {itens.map((item, indice) => (
              <div key={item.exercicioId} className="cadastrar-treino-exercicio-card">
                <div className="cadastrar-treino-exercicio-nome-selo">
                  <span>✓</span> {item.nome}
                </div>

                <div className="cadastrar-treino-exercicio-campos">
                  <input
                    type="text"
                    placeholder="Séries"
                    value={item.series}
                    onChange={(e) => atualizarItem(indice, "series", e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Repetições"
                    value={item.repeticoes}
                    onChange={(e) => atualizarItem(indice, "repeticoes", e.target.value)}
                  />
                  <button
                    type="button"
                    className="cadastrar-treino-remover-btn"
                    onClick={() => removerItem(indice)}
                    aria-label="Remover exercício"
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>

          {erro && <p className="cadastrar-treino-erro">{erro}</p>}

          <button type="submit" className="btn btn-filled cadastrar-treino-salvar-btn" disabled={carregando}>
            {carregando ? "Salvando..." : "Adicionar/editar"}
          </button>
        </form>
      </main>
    </div>
  );
}
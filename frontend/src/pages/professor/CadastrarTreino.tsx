import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./CadastrarTreino.css";

interface ExercicioCatalogo {
  _id: string;
  nome: string;
}

export type FormatoMedida = "repeticoes" | "tempo" | "distancia" | "livre";

interface ItemExercicio {
  exercicioId: string;
  nome: string;
  formatoMedida: FormatoMedida;
  series: string;
  repeticoes: string;
  tempo: string;
  distancia: string;
  descanso: string;
  carga: string;
  notas: string;
}

const OBJETIVOS_OPCOES = [
  { valor: "perder-peso", label: "Perder peso" },
  { valor: "ganhar-massa", label: "Ganhar massa muscular" },
  { valor: "melhorar-condicionamento", label: "Melhorar condicionamento" },
  { valor: "manter-ativo", label: "Manter-se ativo" },
  { valor: "sem-objetivo", label: "Sem objetivo" },
];

export default function CadastrarTreino() {
  const { id } = useParams();
  const modoEdicao = Boolean(id);
  const navigate = useNavigate();

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [catalogo, setCatalogo] = useState<ExercicioCatalogo[]>([]);
  const [selecionadoParaAdicionar, setSelecionadoParaAdicionar] = useState("");
  const [itens, setItens] = useState<ItemExercicio[]>([]);
  const [objetivos, setObjetivos] = useState<string[]>([]);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [carregandoDados, setCarregandoDados] = useState(true);
  const [especifica, setEspecifica] = useState(false);

  const [tipo, setTipo] = useState<"rotina" | "especifica">("rotina");

  function alternarObjetivo(valor: string) {
    setObjetivos((atual) =>
      atual.includes(valor) ? atual.filter((o) => o !== valor) : [...atual, valor]
    );
  }

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
          setObjetivos(treino.objetivos || []);
          setItens(
            treino.exercicios.map((item: any) => ({
              exercicioId: item.exercicioId,
              nome: item.exercicio?.nome || "Exercício removido",
              formatoMedida: item.formatoMedida || (item.tempo && !item.repeticoes ? "tempo" : "repeticoes"),
              series: item.series || "",
              repeticoes: item.repeticoes || "",
              tempo: item.tempo || "",
              distancia: item.distancia || "",
              descanso: item.descanso || "",
              carga: item.carga || "",
              notas: item.notas || "",
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
      {
        exercicioId: exercicio._id,
        nome: exercicio.nome,
        formatoMedida: "repeticoes",
        series: "",
        repeticoes: "",
        tempo: "",
        distancia: "",
        descanso: "",
        carga: "",
        notas: "",
      },
    ]);
    setSelecionadoParaAdicionar("");
  }

  function atualizarItem(
    indice: number,
    campo: keyof ItemExercicio,
    valor: string
  ) {
    setItens((atual) =>
      atual.map((item, i) => (i === indice ? { ...item, [campo]: valor } : item))
    );
  }

  function alterarFormatoMedida(indice: number, novoFormato: FormatoMedida) {
    setItens((atual) =>
      atual.map((item, i) =>
        i === indice
          ? {
              ...item,
              formatoMedida: novoFormato,
            }
          : item
      )
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

    for (let i = 0; i < itens.length; i++) {
      const it = itens[i];
      if (it.formatoMedida === "repeticoes") {
        if (!it.series.trim() || !it.repeticoes.trim()) {
          setErro(`Informe as séries e repetições de "${it.nome}".`);
          return;
        }
      } else if (it.formatoMedida === "tempo") {
        if (!it.series.trim() || !it.tempo.trim()) {
          setErro(`Informe as séries e o tempo/duração de "${it.nome}".`);
          return;
        }
      } else if (it.formatoMedida === "distancia") {
        if (!it.distancia.trim() && !it.tempo.trim()) {
          setErro(`Informe a distância ou tempo de "${it.nome}".`);
          return;
        }
      } else if (it.formatoMedida === "livre") {
        if (!it.notas.trim() && !it.tempo.trim() && !it.repeticoes.trim()) {
          setErro(`Informe a instrução/observação de "${it.nome}".`);
          return;
        }
      }
    }

    setCarregando(true);

    try {
      const token = localStorage.getItem("token");
      const dados = {
        titulo,
        descricao,
        especifica,
        objetivos,
        exercicios: itens.map((item) => ({
          exercicioId: item.exercicioId,
          formatoMedida: item.formatoMedida,
          series: item.series,
          repeticoes: item.repeticoes,
          tempo: item.tempo,
          distancia: item.distancia,
          descanso: item.descanso,
          carga: item.carga,
          notas: item.notas,
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
      const mensagem =
        err.response?.data?.erros?.[0] ||
        err.response?.data?.erro ||
        "Não foi possível salvar o treino. Tente novamente em instantes.";
      setErro(mensagem);
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

          <label>Objetivos atendidos por este treino</label>
          <div className="cadastrar-treino-objetivos">
            {OBJETIVOS_OPCOES.map((op) => (
              <label key={op.valor} className="cadastrar-treino-objetivo-item">
                <input
                  type="checkbox"
                  checked={objetivos.includes(op.valor)}
                  onChange={() => alternarObjetivo(op.valor)}
                />
                {op.label}
              </label>
            ))}
          </div>

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
                <div className="cadastrar-treino-exercicio-cabecalho">
                  <div className="cadastrar-treino-exercicio-nome-selo">
                    <span>✓</span> {item.nome}
                  </div>
                  <button
                    type="button"
                    className="cadastrar-treino-remover-btn"
                    onClick={() => removerItem(indice)}
                    aria-label="Remover exercício"
                    title="Remover exercício"
                  >
                    🗑
                  </button>
                </div>

                {/* TIPO DE MEDIDA / FORMA DE PRESCRIÇÃO */}
                <div className="cadastrar-treino-formato-seletor">
                  <label htmlFor={`formato-${indice}`}>Como este exercício será medido?</label>
                  <select
                    id={`formato-${indice}`}
                    value={item.formatoMedida}
                    onChange={(e) => alterarFormatoMedida(indice, e.target.value as FormatoMedida)}
                    className="cadastrar-treino-formato-select"
                  >
                    <option value="repeticoes">🔢 Séries e Repetições (ex: Musculação / Calistenia)</option>
                    <option value="tempo">⏱️ Séries e Tempo / Duração (ex: Prancha / Isometria)</option>
                    <option value="distancia">🏃 Distância / Corrida (ex: Cooper / Caminhada)</option>
                    <option value="livre">📝 Instrução Livre / Alongamento (sem contagem fixa)</option>
                  </select>
                </div>

                <div className="cadastrar-treino-exercicio-campos-grid">
                  {/* CAMPOS PARA REPETIÇÕES */}
                  {item.formatoMedida === "repeticoes" && (
                    <>
                      <div className="cadastrar-treino-campo-item">
                        <label>Séries *</label>
                        <input
                          type="text"
                          placeholder="Ex: 3 ou 4"
                          value={item.series}
                          onChange={(e) => atualizarItem(indice, "series", e.target.value)}
                        />
                      </div>

                      <div className="cadastrar-treino-campo-item">
                        <label>Repetições *</label>
                        <input
                          type="text"
                          placeholder="Ex: 12 ou até a falha"
                          value={item.repeticoes}
                          onChange={(e) => atualizarItem(indice, "repeticoes", e.target.value)}
                        />
                      </div>

                      <div className="cadastrar-treino-campo-item">
                        <label>Descanso (opcional)</label>
                        <input
                          type="text"
                          placeholder="Ex: 45s ou 1 min"
                          value={item.descanso}
                          onChange={(e) => atualizarItem(indice, "descanso", e.target.value)}
                        />
                      </div>

                      <div className="cadastrar-treino-campo-item">
                        <label>Carga / Peso (opcional)</label>
                        <input
                          type="text"
                          placeholder="Ex: 5kg ou peso corporal"
                          value={item.carga}
                          onChange={(e) => atualizarItem(indice, "carga", e.target.value)}
                        />
                      </div>
                    </>
                  )}

                  {/* CAMPOS PARA TEMPO */}
                  {item.formatoMedida === "tempo" && (
                    <>
                      <div className="cadastrar-treino-campo-item">
                        <label>Séries *</label>
                        <input
                          type="text"
                          placeholder="Ex: 3 ou 4"
                          value={item.series}
                          onChange={(e) => atualizarItem(indice, "series", e.target.value)}
                        />
                      </div>

                      <div className="cadastrar-treino-campo-item">
                        <label>Tempo por série *</label>
                        <input
                          type="text"
                          placeholder="Ex: 30s ou 1 min"
                          value={item.tempo}
                          onChange={(e) => atualizarItem(indice, "tempo", e.target.value)}
                        />
                      </div>

                      <div className="cadastrar-treino-campo-item">
                        <label>Descanso (opcional)</label>
                        <input
                          type="text"
                          placeholder="Ex: 30s ou 1 min"
                          value={item.descanso}
                          onChange={(e) => atualizarItem(indice, "descanso", e.target.value)}
                        />
                      </div>

                      <div className="cadastrar-treino-campo-item">
                        <label>Carga / Variação (opcional)</label>
                        <input
                          type="text"
                          placeholder="Ex: Sem joelhos ou com apoio"
                          value={item.carga}
                          onChange={(e) => atualizarItem(indice, "carga", e.target.value)}
                        />
                      </div>
                    </>
                  )}

                  {/* CAMPOS PARA DISTÂNCIA */}
                  {item.formatoMedida === "distancia" && (
                    <>
                      <div className="cadastrar-treino-campo-item">
                        <label>Distância (opcional)</label>
                        <input
                          type="text"
                          placeholder="Ex: 1 km ou 400m"
                          value={item.distancia}
                          onChange={(e) => atualizarItem(indice, "distancia", e.target.value)}
                        />
                      </div>

                      <div className="cadastrar-treino-campo-item">
                        <label>Tempo estimado / Alvo (opcional)</label>
                        <input
                          type="text"
                          placeholder="Ex: 10 min ou ritmo leve"
                          value={item.tempo}
                          onChange={(e) => atualizarItem(indice, "tempo", e.target.value)}
                        />
                      </div>
                    </>
                  )}

                  {/* CAMPOS PARA LIVRE */}
                  {item.formatoMedida === "livre" && (
                    <div className="cadastrar-treino-campo-item cadastrar-treino-campo-full">
                      <label>Duração ou Tempo sugerido (opcional)</label>
                      <input
                        type="text"
                        placeholder="Ex: 5 minutos ou no seu ritmo"
                        value={item.tempo}
                        onChange={(e) => atualizarItem(indice, "tempo", e.target.value)}
                      />
                    </div>
                  )}

                  {/* CAMPO DE NOTAS / DICA (COMUM A TODOS) */}
                  <div className="cadastrar-treino-campo-item cadastrar-treino-campo-full">
                    <label>Orientação / Dica de Execução (opcional)</label>
                    <input
                      type="text"
                      placeholder="Ex: Manter coluna reta, respirar ritmadamente"
                      value={item.notas}
                      onChange={(e) => atualizarItem(indice, "notas", e.target.value)}
                    />
                  </div>
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
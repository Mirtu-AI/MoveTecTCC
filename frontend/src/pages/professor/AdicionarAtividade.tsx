import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./AdicionarAtividade.css";

interface Exercicio {
  _id: string;
  nome: string;
}

interface Aluno {
  nome: string;
}

interface ExercicioAtividade {
  exercicioId: string;
}

interface AtividadeExistente {
  titulo: string;
  descricao: string;
  midiaUrl: string | null;
  dataEntrega: string;
  permiteArquivoAlternativo: boolean;
  alunoId: string;
  exercicios: ExercicioAtividade[];
}

export default function AdicionarAtividade() {
  const { alunoId: alunoIdParam, id } = useParams();
  const navigate = useNavigate();

  const estaEditando = Boolean(id);

  const [alunoId, setAlunoId] = useState<string | undefined>(alunoIdParam);
  const [aluno, setAluno] = useState<Aluno | null>(null);
  const [catalogo, setCatalogo] = useState<Exercicio[]>([]);
  const [busca, setBusca] = useState("");
  const [selecionados, setSelecionados] = useState<string[]>([]);

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [midiaUrl, setMidiaUrl] = useState("");
  const [permiteArquivoAlternativo, setPermiteArquivoAlternativo] = useState(false);
  const [dataEntrega, setDataEntrega] = useState("");

  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [carregandoDados, setCarregandoDados] = useState(true);

  function paraInputDate(dataIso: string) {
    const d = new Date(dataIso);
    const ano = d.getUTCFullYear();
    const mes = String(d.getUTCMonth() + 1).padStart(2, "0");
    const dia = String(d.getUTCDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
  }

  useEffect(() => {
    async function carregarDados() {
      try {
        const token = localStorage.getItem("token");
        const cabecalho = { headers: { Authorization: `Bearer ${token}` } };

        if (estaEditando) {
          // Modo edição: busca a atividade primeiro pra descobrir o alunoId
          const responseAtividade = await axios.get<{ atividade: AtividadeExistente }>(
            `http://localhost:3000/api/atividades/${id}`,
            cabecalho
          );
          const atividade = responseAtividade.data.atividade;

          setAlunoId(atividade.alunoId);
          setTitulo(atividade.titulo);
          setDescricao(atividade.descricao);
          setMidiaUrl(atividade.midiaUrl || "");
          setPermiteArquivoAlternativo(atividade.permiteArquivoAlternativo);
          setDataEntrega(paraInputDate(atividade.dataEntrega));
          setSelecionados(atividade.exercicios.map((ex) => ex.exercicioId.toString()));

          const [responseAluno, responseCatalogo] = await Promise.all([
            axios.get(`http://localhost:3000/api/professor/alunos/${atividade.alunoId}`, cabecalho),
            axios.get("http://localhost:3000/api/exercicios", cabecalho),
          ]);
          setAluno(responseAluno.data.aluno);
          setCatalogo(responseCatalogo.data.exercicios);
        } else {
          const [responseAluno, responseCatalogo] = await Promise.all([
            axios.get(`http://localhost:3000/api/professor/alunos/${alunoIdParam}`, cabecalho),
            axios.get("http://localhost:3000/api/exercicios", cabecalho),
          ]);
          setAluno(responseAluno.data.aluno);
          setCatalogo(responseCatalogo.data.exercicios);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setCarregandoDados(false);
      }
    }

    carregarDados();
  }, [alunoIdParam, id, estaEditando]);

  function alternarSelecao(exercicioId: string) {
    setSelecionados((atual) =>
      atual.includes(exercicioId)
        ? atual.filter((idAtual) => idAtual !== exercicioId)
        : [...atual, exercicioId]
    );
  }

  const exerciciosFiltrados = catalogo.filter((ex) =>
    ex.nome.toLowerCase().includes(busca.toLowerCase())
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (!titulo.trim() || !descricao.trim()) {
      setErro("Preencha o título e a descrição da atividade.");
      return;
    }

    if (!permiteArquivoAlternativo && selecionados.length === 0) {
      setErro("Selecione ao menos um exercício.");
      return;
    }

    if (!dataEntrega) {
      setErro("Informe a data de entrega.");
      return;
    }

    setCarregando(true);

    try {
      const token = localStorage.getItem("token");
      const cabecalho = { headers: { Authorization: `Bearer ${token}` } };

      const [ano, mes, dia] = dataEntrega.split("-").map(Number);
      const dataAjustada = new Date(ano, mes - 1, dia, 23, 59, 59).toISOString();

      const corpo = {
        titulo,
        descricao,
        midiaUrl,
        exercicios: permiteArquivoAlternativo ? [] : selecionados,
        dataEntrega: dataAjustada,
        permiteArquivoAlternativo,
      };

      if (estaEditando) {
        await axios.put(
          `http://localhost:3000/api/professor/atividades/${id}`,
          corpo,
          cabecalho
        );
        navigate(`/professor/atividades/${id}`);
      } else {
        await axios.post(
          `http://localhost:3000/api/professor/alunos/${alunoIdParam}/atividades`,
          corpo,
          cabecalho
        );
        navigate(`/professor/aluno/${alunoIdParam}`);
      }
    } catch (err: any) {
      const mensagem = err.response?.data?.erros?.[0] || "Não foi possível salvar a atividade.";
      setErro(mensagem);
    } finally {
      setCarregando(false);
    }
  }

  if (carregandoDados) {
    return <p className="adicionar-atividade-mensagem">Carregando...</p>;
  }

  return (
    <div className="adicionar-atividade-page">
      <header className="adicionar-atividade-header">
        <button
          className="adicionar-atividade-voltar"
          onClick={() => navigate(-1)}
          aria-label="Voltar"
        >
          ←
        </button>
        <h1>{estaEditando ? `Editar atividade de ${aluno?.nome}` : `Atividade para ${aluno?.nome}`}</h1>
      </header>

      <main className="adicionar-atividade-conteudo">
        <div className="adicionar-atividade-card-info">
          <form onSubmit={handleSubmit} className="adicionar-atividade-form">
            <div className="adicionar-atividade-coluna-esquerda">
              <div className="adicionar-atividade-midia-preview">
                {midiaUrl ? <div className="adicionar-atividade-midia-play">▶</div> : <span>🖼️</span>}
              </div>

              <label htmlFor="midiaUrl">Link do vídeo ou imagem (opcional)</label>
              <input
                id="midiaUrl"
                type="text"
                placeholder="https://..."
                value={midiaUrl}
                onChange={(e) => setMidiaUrl(e.target.value)}
              />

              <label htmlFor="titulo">Título</label>
              <input
                id="titulo"
                type="text"
                placeholder="Ex: Fortalecimento de core"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
              />

              <label htmlFor="descricao">Descrição</label>
              <textarea
                id="descricao"
                placeholder="Explique o objetivo da atividade"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={4}
              />
            </div>

            <div className="adicionar-atividade-coluna-direita">
              <label className="adicionar-atividade-toggle-linha">
                <span>Precisa de outro meio avaliativo?</span>
                <input
                  type="checkbox"
                  checked={permiteArquivoAlternativo}
                  onChange={(e) => setPermiteArquivoAlternativo(e.target.checked)}
                />
              </label>

              {permiteArquivoAlternativo ? (
                <p className="adicionar-atividade-toggle-aviso">
                  O aluno poderá enviar um arquivo .docx, .pdf ou .pptx no lugar da execução dos exercícios.
                </p>
              ) : (
                <>
                  <span className="adicionar-atividade-secao-label">Atividades</span>

                  <div className="adicionar-atividade-busca-wrap">
                    <span className="adicionar-atividade-busca-icone">🔍</span>
                    <input
                      type="text"
                      placeholder="Buscar exercício..."
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      className="adicionar-atividade-busca-input"
                    />
                  </div>

                  <div className="adicionar-atividade-exercicios-lista">
                    {exerciciosFiltrados.length === 0 && (
                      <p className="adicionar-atividade-exercicios-vazio">Nenhum exercício encontrado.</p>
                    )}

                    {exerciciosFiltrados.map((ex) => {
                      const marcado = selecionados.includes(ex._id);
                      return (
                        <div
                          key={ex._id}
                          role="button"
                          tabIndex={0}
                          className={`adicionar-atividade-exercicio-item ${marcado ? "marcado" : ""}`}
                          onClick={() => alternarSelecao(ex._id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              alternarSelecao(ex._id);
                            }
                          }}
                        >
                          <span className={`adicionar-atividade-check ${marcado ? "marcado" : ""}`}>
                            {marcado ? "✓" : ""}
                          </span>
                          <span className="adicionar-atividade-exercicio-icone">🏋️</span>
                          <span className="adicionar-atividade-exercicio-nome">{ex.nome}</span>
                          <button
                            type="button"
                            className="adicionar-atividade-exercicio-info-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/professor/exercicios/${ex._id}`);
                            }}
                            aria-label={`Ver detalhes de ${ex.nome}`}
                          >
                            ℹ️
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              <label htmlFor="dataEntrega">Data de entrega</label>
              <input
                id="dataEntrega"
                type="date"
                value={dataEntrega}
                onChange={(e) => setDataEntrega(e.target.value)}
              />
            </div>

            {erro && <p className="adicionar-atividade-erro">{erro}</p>}

            <button
              type="submit"
              className="btn btn-filled adicionar-atividade-salvar-btn"
              disabled={carregando}
            >
              {carregando ? "Salvando..." : estaEditando ? "✓ Salvar alterações" : "✓ Adicionar"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
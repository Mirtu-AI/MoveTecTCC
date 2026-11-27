import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./DetalhesAtividadeProfissional.css";
import {
  FiArrowLeft,
  FiEdit2,
  FiTrash2,
  FiImage,
  FiCheck,
  FiPaperclip,
  FiMessageCircle,
  FiSend,
} from "react-icons/fi";

interface ExercicioItem {
  concluido: boolean;
  exercicio: { nome: string } | null;
}

interface ArquivoAlternativo {
  nome: string;
  arquivo: string;
}

interface VideoComprovacao {
  nome: string;
  arquivo: string;
  duracaoSegundos: number;
}

interface Feedback {
  reacao: string;
  comentario: string | null;
  dadoEm: string;
}

interface Atividade {
  titulo: string;
  descricao: string;
  midiaUrl: string | null;
  dataEntrega: string;
  status: "andamento" | "entregue" | "validada";
  progresso: number;
  permiteArquivoAlternativo: boolean;
  arquivoAlternativoAluno: ArquivoAlternativo | null;
  videoComprovacao?: VideoComprovacao | null;
  feedback?: Feedback | null;
  exercicios: ExercicioItem[];
}

const REACOES = ["🔥", "👏", "💪", "⭐", "🎯", "🚀"];

export default function DetalhesAtividadeProfessor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [atividade, setAtividade] = useState<Atividade | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [excluindo, setExcluindo] = useState(false);

  const [reacaoSelecionada, setReacaoSelecionada] = useState("");
  const [comentarioFeedback, setComentarioFeedback] = useState("");
  const [enviandoFeedback, setEnviandoFeedback] = useState(false);

  const [validando, setValidando] = useState(false);

  function prazoAindaValido(dataEntregaIso: string) {
    return new Date(dataEntregaIso) >= new Date();
  }

  async function excluirAtividade() {
    if (
      !window.confirm(
        "Tem certeza que deseja excluir esta atividade? Essa ação não pode ser desfeita."
      )
    ) {
      return;
    }

    setExcluindo(true);

    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `http://localhost:3000/api/professor/atividades/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      navigate(-1);
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir a atividade. Tente novamente.");
    } finally {
      setExcluindo(false);
    }
  }

  useEffect(() => {
    buscarAtividade();
  }, [id]);

  async function buscarAtividade() {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `http://localhost:3000/api/atividades/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const dadosAtividade: Atividade | null =
        response.data.atividade || null;

      setAtividade(dadosAtividade);

      if (dadosAtividade?.feedback) {
        setReacaoSelecionada(dadosAtividade.feedback.reacao);
        setComentarioFeedback(
          dadosAtividade.feedback.comentario || ""
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCarregando(false);
    }
  }

  async function enviarFeedback() {
    if (!reacaoSelecionada) {
      alert("Selecione uma reação para enviar o feedback.");
      return;
    }

    setEnviandoFeedback(true);

    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:3000/api/professor/atividades/${id}/feedback`,
        {
          reacao: reacaoSelecionada,
          comentario: comentarioFeedback.trim(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const feedbackAtualizado: Feedback = {
        reacao: reacaoSelecionada,
        comentario: comentarioFeedback.trim() || null,
        dadoEm: new Date().toISOString(),
      };

      setAtividade((atual) =>
        atual
          ? { ...atual, feedback: feedbackAtualizado }
          : atual
      );

      alert("Feedback enviado com sucesso!");
    } catch (err: any) {
      console.error(err);

      alert(
        err.response?.data?.erro ||
          "Erro ao enviar feedback. Tente novamente."
      );
    } finally {
      setEnviandoFeedback(false);
    }
  }

  async function validarAtividade(aprovada: boolean) {
    const mensagem = aprovada
      ? "Validar a conclusão desta atividade?"
      : "Pedir para o aluno refazer? O progresso e a entrega serão zerados.";

    if (!window.confirm(mensagem)) return;

    setValidando(true);

    try {
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `http://localhost:3000/api/professor/atividades/${id}/validacao`,
        { aprovada },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (aprovada) {
        setAtividade((atual) =>
          atual ? { ...atual, status: response.data.status } : atual
        );
      } else {
        // recarrega para refletir exercícios zerados e entrega removida
        await buscarAtividade();
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.erro || "Erro ao validar a atividade.");
    } finally {
      setValidando(false);
    }
  }

  function formatarData(dataIso: string) {
    const data = new Date(dataIso);
    return data.toLocaleDateString("pt-BR", {
      timeZone: "UTC",
    });
  }

  function formatarDataHora(dataIso: string) {
    return new Date(dataIso).toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  if (carregando) {
    return (
      <p className="detalhes-atividade-mensagem">
        Carregando...
      </p>
    );
  }

  if (!atividade) {
    return (
      <p className="detalhes-atividade-mensagem">
        Atividade não encontrada.
      </p>
    );
  }

  const podeDarFeedback =
    atividade.status === "entregue" || atividade.status === "validada";

  return (
    <div className="detalhes-atividade-page">
      <header className="detalhes-atividade-header">
        <button
          className="detalhes-atividade-voltar"
          onClick={() => navigate(-1)}
          aria-label="Voltar"
        >
          <FiArrowLeft />
        </button>

        <h1>{atividade.titulo}</h1>

        {atividade.status === "validada" && (
          <span className="detalhes-atividade-selo-validada">
            <FiCheck /> Validada
          </span>
        )}
      </header>

      <main className="detalhes-atividade-conteudo">
        {/* AÇÕES DO PROFESSOR */}
        {prazoAindaValido(atividade.dataEntrega) && (
          <div className="detalhes-atividade-acoes">
            <button
              type="button"
              className="detalhes-atividade-btn-editar"
              onClick={() =>
                navigate(`/profissional/atividades/${id}/editar`)
              }
            >
              <FiEdit2 style={{ marginRight: 6 }} />
              Editar
            </button>

            <button
              type="button"
              className="detalhes-atividade-btn-excluir"
              onClick={excluirAtividade}
              disabled={excluindo}
            >
              {excluindo ? (
                "Excluindo..."
              ) : (
                <>
                  <FiTrash2 style={{ marginRight: 6 }} />
                  Excluir
                </>
              )}
            </button>
          </div>
        )}

        {/* IMAGEM */}
        <div className="detalhes-atividade-midia">
          {atividade.midiaUrl ? (
            <img src={atividade.midiaUrl} alt="" />
          ) : (
            <span>
              <FiImage />
            </span>
          )}
        </div>

        {/* DESCRIÇÃO */}
        <div className="detalhes-atividade-secao">
          <span className="detalhes-atividade-label">
            Descrição
          </span>

          <p className="detalhes-atividade-texto">
            {atividade.descricao}
          </p>
        </div>

        {/* INFORMAÇÕES */}
        <div className="detalhes-atividade-info-linha">
          <div>
            <span className="detalhes-atividade-label">
              Entrega
            </span>

            <p className="detalhes-atividade-texto">
              {formatarData(atividade.dataEntrega)}
            </p>
          </div>

          <div>
            <span className="detalhes-atividade-label">
              Progresso
            </span>

            <p className="detalhes-atividade-texto">
              {atividade.progresso}%
            </p>
          </div>
        </div>

        {/* EXERCÍCIOS */}
        <div className="detalhes-atividade-secao">
          <span className="detalhes-atividade-label">
            Exercícios
          </span>

          <div className="detalhes-atividade-exercicios-lista">
            {atividade.exercicios.map((item, indice) => (
              <div
                key={indice}
                className="detalhes-atividade-exercicio-linha"
              >
                <span
                  className={`detalhes-atividade-check ${
                    item.concluido ? "concluido" : ""
                  }`}
                >
                  {item.concluido ? <FiCheck /> : null}
                </span>

                <span>
                  {item.exercicio?.nome || "Exercício removido"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ARQUIVO ENVIADO */}
        {atividade.arquivoAlternativoAluno && (
          <div className="detalhes-atividade-secao">
            <span className="detalhes-atividade-label">
              Arquivo enviado pelo aluno
            </span>

            <a
              href={atividade.arquivoAlternativoAluno.arquivo}
              download={atividade.arquivoAlternativoAluno.nome}
              className="detalhes-atividade-arquivo-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FiPaperclip style={{ marginRight: 6 }} />
              {atividade.arquivoAlternativoAluno.nome}
            </a>
          </div>
        )}

        {/* VÍDEO DE COMPROVAÇÃO */}
        {atividade.videoComprovacao && (
          <div className="detalhes-atividade-secao">
            <span className="detalhes-atividade-label">
              Vídeo de comprovação (
              {atividade.videoComprovacao.duracaoSegundos}s)
            </span>

            <video
              src={atividade.videoComprovacao.arquivo}
              controls
              style={{
                width: "100%",
                borderRadius: 12,
              }}
            />
          </div>
        )}

        {/* FEEDBACK DO profissional */}
        <section className="detalhes-atividade-feedback">
          <div className="detalhes-atividade-feedback-titulo">
            <FiMessageCircle />
            <h2>Feedback do profissional</h2>
          </div>

          {podeDarFeedback ? (
            <>
              {atividade.feedback && (
                <div className="detalhes-atividade-feedback-registrado">
                  <span className="detalhes-atividade-feedback-subtitulo">
                    Feedback registrado
                  </span>

                  <div className="detalhes-atividade-feedback-reacao-atual">
                    {atividade.feedback.reacao}
                  </div>

                  <p>
                    {atividade.feedback.comentario ||
                      "Nenhum comentário foi adicionado."}
                  </p>

                  <span className="detalhes-atividade-feedback-data">
                    Enviado em{" "}
                    {formatarDataHora(atividade.feedback.dadoEm)}
                  </span>
                </div>
              )}

              <div className="detalhes-atividade-feedback-form">
                <label className="detalhes-atividade-label">
                  Escolha uma reação
                </label>

                <div
                  className="detalhes-atividade-reacoes"
                  role="group"
                  aria-label="Reações disponíveis"
                >
                  {REACOES.map((reacao) => (
                    <button
                      key={reacao}
                      type="button"
                      className={`detalhes-atividade-reacao-btn ${
                        reacaoSelecionada === reacao
                          ? "selecionada"
                          : ""
                      }`}
                      onClick={() =>
                        setReacaoSelecionada(reacao)
                      }
                      aria-label={`Selecionar reação ${reacao}`}
                      aria-pressed={
                        reacaoSelecionada === reacao
                      }
                    >
                      {reacao}
                    </button>
                  ))}
                </div>

                <label
                  htmlFor="comentario-feedback"
                  className="detalhes-atividade-label"
                >
                  Comentário (opcional)
                </label>

                <textarea
                  id="comentario-feedback"
                  className="detalhes-atividade-feedback-textarea"
                  placeholder="Escreva um comentário para o aluno..."
                  value={comentarioFeedback}
                  onChange={(e) =>
                    setComentarioFeedback(e.target.value)
                  }
                  maxLength={140}
                />

                <div className="detalhes-atividade-feedback-contador">
                  {comentarioFeedback.length}/140 caracteres
                </div>

                <button
                  type="button"
                  className="detalhes-atividade-feedback-enviar"
                  onClick={enviarFeedback}
                  disabled={
                    enviandoFeedback || !reacaoSelecionada
                  }
                >
                  {enviandoFeedback ? (
                    "Enviando..."
                  ) : (
                    <>
                      <FiSend />
                      {atividade.feedback
                        ? "Atualizar feedback"
                        : "Enviar feedback"}
                    </>
                  )}
                </button>
              </div>

              {/* VALIDAÇÃO DA ENTREGA */}
              {atividade.status === "entregue" && (
                <div className="detalhes-atividade-validacao">
                  <span className="detalhes-atividade-label">
                    Validação da entrega
                  </span>

                  <div className="detalhes-atividade-validacao-botoes">
                    <button
                      type="button"
                      className="detalhes-atividade-btn-validar"
                      onClick={() => validarAtividade(true)}
                      disabled={validando}
                    >
                      <FiCheck style={{ marginRight: 6 }} />
                      {validando ? "Processando..." : "Validar conclusão"}
                    </button>

                    <button
                      type="button"
                      className="detalhes-atividade-btn-refazer"
                      onClick={() => validarAtividade(false)}
                      disabled={validando}
                    >
                      Pedir para refazer
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="detalhes-atividade-feedback-aviso">
              O feedback estará disponível após o jovem entregar
              a atividade.
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
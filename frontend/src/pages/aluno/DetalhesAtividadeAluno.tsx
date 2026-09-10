import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./DetalhesAtividadeAluno.css";

interface ExercicioItem {
  exercicioId: string;
  concluido: boolean;
  exercicio: { nome: string; tempoEstimado: number | null } | null;
}

interface Atividade {
  titulo: string;
  midiaUrl: string | null;
  progresso: number;
  status: "andamento" | "entregue";
  dataEntrega: string;
  permiteArquivoAlternativo: boolean;
  arquivoAlternativoAluno: { nome: string } | null;
  exercicios: ExercicioItem[];
}

export default function DetalhesAtividadeAluno() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [atividade, setAtividade] = useState<Atividade | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [iniciando, setIniciando] = useState(false);

  const [arquivoSelecionado, setArquivoSelecionado] = useState<{ nome: string; conteudo: string } | null>(null);
  const [erroArquivo, setErroArquivo] = useState("");
  const [enviandoArquivo, setEnviandoArquivo] = useState(false);
  const [mostrarConfete, setMostrarConfete] = useState(false);
  const [cancelando, setCancelando] = useState(false);

  useEffect(() => {
    buscarAtividade();
  }, [id]);

  async function buscarAtividade() {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:3000/api/aluno/atividades/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAtividade(response.data.atividade || null);
    } catch (err) {
      console.error(err);
    } finally {
      setCarregando(false);
    }
  }

  function formatarTempo(segundos: number | null) {
    if (!segundos) return "";
    const min = Math.floor(segundos / 60);
    const seg = segundos % 60;
    return min > 0 ? `${min}min ${seg > 0 ? seg + "s" : ""}` : `${seg}s`;
  }

  function handleArquivoSelecionado(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;

    const extensoesPermitidas = [".docx", ".pdf", ".pptx"];
    const extensao = arquivo.name.slice(arquivo.name.lastIndexOf(".")).toLowerCase();

    if (!extensoesPermitidas.includes(extensao)) {
      setErroArquivo("Não foi possível anexar: apenas arquivos .docx, .pdf ou .pptx são aceitos.");
      setArquivoSelecionado(null);
      return;
    }

    const tamanhoMaximoBytes = 10 * 1024 * 1024; // 10 MB
    if (arquivo.size > tamanhoMaximoBytes) {
      setErroArquivo("Não foi possível anexar: o arquivo ultrapassa o limite de 10 MB.");
      setArquivoSelecionado(null);
      return;
    }

    setErroArquivo("");

    const leitor = new FileReader();
    leitor.onload = () => {
      setArquivoSelecionado({ nome: arquivo.name, conteudo: leitor.result as string });
    };
    leitor.readAsDataURL(arquivo);
  }

  async function finalizarComArquivo() {
    if (!arquivoSelecionado) return;

    setEnviandoArquivo(true);
    setErroArquivo("");
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:3000/api/aluno/atividades/${id}/arquivo-alternativo`,
        { arquivo: arquivoSelecionado.conteudo, nomeArquivo: arquivoSelecionado.nome },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await buscarAtividade();
      setMostrarConfete(true);
      setTimeout(() => setMostrarConfete(false), 1600);
    } catch (err: any) {
      setErroArquivo(err.response?.data?.erro || "Não foi possível enviar o arquivo.");
    } finally {
      setEnviandoArquivo(false);
    }
  }

  async function cancelarEnvio() {
    setCancelando(true);
    setErroArquivo("");
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:3000/api/aluno/atividades/${id}/arquivo-alternativo`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setArquivoSelecionado(null);
      await buscarAtividade();
    } catch (err: any) {
      setErroArquivo(err.response?.data?.erro || "Não foi possível cancelar o envio.");
    } finally {
      setCancelando(false);
    }
  }

  async function comecar() {
    setIniciando(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:3000/api/aluno/atividades/${id}/iniciar`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate(`/aluno/atividades/${id}/executar`);
    } catch (err) {
      console.error(err);
    } finally {
      setIniciando(false);
    }
  }

  if (carregando) {
    return <p className="detalhes-atividade-aluno-mensagem">Carregando...</p>;
  }

  if (!atividade) {
    return <p className="detalhes-atividade-aluno-mensagem">Atividade não encontrada.</p>;
  }

  const atividadeFinalizada = atividade.status === "entregue";
  const dentroDoPrazo = new Date() <= new Date(atividade.dataEntrega);

  return (
    <div className="detalhes-atividade-aluno-page">
      <header className="detalhes-atividade-aluno-header">
        <button
          className="detalhes-atividade-aluno-voltar"
          onClick={() => navigate("/aluno")}
          aria-label="Voltar para a página inicial"
        >
          ←
        </button>

        <h1>{atividade.titulo}</h1>
      </header>

      <main className="detalhes-atividade-aluno-conteudo">
        <div className="detalhes-atividade-aluno-midia">
          {atividade.midiaUrl ? <img src={atividade.midiaUrl} alt="" /> : <span>🏋️‍♂️</span>}
        </div>

        <div className="detalhes-atividade-aluno-progresso-linha">
          <span>Progresso: {atividade.progresso}%</span>
          <div className="detalhes-atividade-aluno-progresso-trilha">
            <div
              className="detalhes-atividade-aluno-progresso-barra"
              style={{ width: `${atividade.progresso}%` }}
            />
          </div>
        </div>

        <span className="detalhes-atividade-aluno-secao-titulo">Exercícios</span>

        <div className="detalhes-atividade-aluno-exercicios-lista">
          {atividade.exercicios.map((item) => (
            <button
              type="button"
              key={item.exercicioId}
              className="detalhes-atividade-aluno-exercicio-item"
              onClick={() => navigate(`/aluno/exercicios/${item.exercicioId}`)}
            >
              <span className={`detalhes-atividade-aluno-check ${item.concluido ? "concluido" : ""}`}>
                {item.concluido ? "✓" : ""}
              </span>
              <span className="detalhes-atividade-aluno-exercicio-nome">
                {item.exercicio?.nome || "Exercício"}
              </span>
              <span className="detalhes-atividade-aluno-exercicio-tempo">
                {formatarTempo(item.exercicio?.tempoEstimado ?? null) || "Tempo"}
              </span>
            </button>
          ))}
        </div>

        {atividade.permiteArquivoAlternativo ? (
          <>
            {!atividadeFinalizada && (
              <div className="detalhes-atividade-aluno-anexo">
                <div className="detalhes-atividade-aluno-anexo-linha">
                  <label htmlFor="arquivo-alternativo" className="detalhes-atividade-aluno-anexo-btn">
                    📎 {arquivoSelecionado ? arquivoSelecionado.nome : "Anexar arquivo alternativo"}
                  </label>
                  <input
                    id="arquivo-alternativo"
                    type="file"
                    accept=".docx,.pdf,.pptx"
                    onChange={handleArquivoSelecionado}
                    disabled={enviandoArquivo}
                    className="detalhes-atividade-aluno-anexo-input"
                  />

                  {arquivoSelecionado && (
                    <button
                      type="button"
                      className="detalhes-atividade-aluno-remover-btn"
                      onClick={() => setArquivoSelecionado(null)}
                      disabled={enviandoArquivo}
                      aria-label="Remover arquivo selecionado"
                    >
                      ✕
                    </button>
                  )}
                </div>
                {erroArquivo && <p className="detalhes-atividade-aluno-erro">{erroArquivo}</p>}
              </div>
            )}

            {atividadeFinalizada ? (
              <div className="detalhes-atividade-aluno-anexo-enviado">
                <span>📎 Enviado: {atividade.arquivoAlternativoAluno?.nome}</span>
                {dentroDoPrazo && (
                  <button
                    type="button"
                    className="detalhes-atividade-aluno-cancelar-btn"
                    onClick={cancelarEnvio}
                    disabled={cancelando}
                  >
                    {cancelando ? "Cancelando..." : "Cancelar envio"}
                  </button>
                )}
                {erroArquivo && <p className="detalhes-atividade-aluno-erro">{erroArquivo}</p>}
              </div>
            ) : (
              <div className="detalhes-atividade-aluno-finalizar-wrap">
                <button
                  type="button"
                  className="detalhes-atividade-aluno-comecar-btn"
                  onClick={finalizarComArquivo}
                  disabled={!arquivoSelecionado || enviandoArquivo}
                  style={{ opacity: !arquivoSelecionado || enviandoArquivo ? 0.6 : 1 }}
                >
                  ✓ {enviandoArquivo ? "Enviando..." : "Finalizar atividade"}
                </button>

                {mostrarConfete && (
                  <div className="detalhes-atividade-aluno-confete-container">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <span
                        key={i}
                        className="detalhes-atividade-aluno-confete-peca"
                        style={{
                          left: `${i * 6.5}%`,
                          backgroundColor: i % 2 === 0 ? "var(--laranja-move)" : "var(--sucesso-verde)",
                          animationDelay: `${i * 0.04}s`,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        ) : atividadeFinalizada ? (
          <button
            type="button"
            className="detalhes-atividade-aluno-comecar-btn"
            disabled
            style={{ opacity: 0.65, backgroundColor: "#22c55e" }}
          >
            ✓ Atividade Finalizada
          </button>
        ) : (
          <button
            type="button"
            className="detalhes-atividade-aluno-comecar-btn"
            onClick={comecar}
            disabled={iniciando}
          >
            ✓ {iniciando ? "Iniciando..." : "Começar Atividade"}
          </button>
        )}
      </main>
    </div >
  );
}
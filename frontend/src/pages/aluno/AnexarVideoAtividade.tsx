import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./AnexarVideoAtividade.css";
import { FiVideo, FiPaperclip, FiCheck } from "react-icons/fi";

const DURACAO_MINIMA = 5;
const DURACAO_MAXIMA = 15;

export default function AnexarVideoAtividade() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [videoSelecionado, setVideoSelecionado] = useState<{ nome: string; conteudo: string; duracao: number } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [consentimento, setConsentimento] = useState(false);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  function handleArquivoSelecionado(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;

    const tiposPermitidos = ["video/mp4", "video/webm", "video/quicktime"];
    if (!tiposPermitidos.includes(arquivo.type)) {
      setErro("Envie um vídeo .mp4, .webm ou .mov.");
      return;
    }

    setErro("");
    const urlTemporaria = URL.createObjectURL(arquivo);
    const videoEl = document.createElement("video");
    videoEl.preload = "metadata";

    videoEl.onloadedmetadata = () => {
      const duracao = Math.round(videoEl.duration);

      if (duracao < DURACAO_MINIMA || duracao > DURACAO_MAXIMA) {
        setErro(`O vídeo precisa ter entre ${DURACAO_MINIMA} e ${DURACAO_MAXIMA} segundos (o seu tem ${duracao}s).`);
        URL.revokeObjectURL(urlTemporaria);
        setVideoSelecionado(null);
        setPreviewUrl(null);
        return;
      }

      const leitor = new FileReader();
      leitor.onload = () => {
        setVideoSelecionado({ nome: arquivo.name, conteudo: leitor.result as string, duracao });
        setPreviewUrl(urlTemporaria);
      };
      leitor.readAsDataURL(arquivo);
    };

    videoEl.src = urlTemporaria;
  }

  async function enviarVideo() {
    if (!videoSelecionado) return;
    if (!consentimento) {
      setErro("É necessário autorizar o envio do vídeo para fins de avaliação pedagógica.");
      return;
    }

    setEnviando(true);
    setErro("");
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:3000/api/aluno/atividades/${id}/video-comprovacao`,
        {
          video: videoSelecionado.conteudo,
          nomeArquivo: videoSelecionado.nome,
          duracaoSegundos: videoSelecionado.duracao,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate(`/aluno/atividades/${id}/parabens`);
    } catch (err: any) {
      setErro(err.response?.data?.erro || "Não foi possível enviar o vídeo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="anexar-video-page">
      <header className="anexar-video-header">
        <h1>Comprovação em vídeo</h1>
      </header>

      <main className="anexar-video-conteudo">
        <p className="anexar-video-instrucao">
          Grave ou selecione um vídeo curto (5 a 15 segundos) mostrando parte do treino que você acabou de fazer.
          Isso ajuda seu professor a validar a atividade.
        </p>

        {previewUrl ? (
          <video src={previewUrl} controls className="anexar-video-preview" />
        ) : (
          <label htmlFor="video-input" className="anexar-video-upload-box">
            <FiVideo style={{ marginRight: 8, fontSize: "1.2rem", verticalAlign: "middle" }} /> Toque para selecionar ou gravar um vídeo
          </label>
        )}

        <input
          id="video-input"
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          capture="environment"
          onChange={handleArquivoSelecionado}
          disabled={enviando}
          className="anexar-video-input"
        />

        {videoSelecionado && (
          <p className="anexar-video-info">
            <FiPaperclip style={{ marginRight: 6, verticalAlign: "middle" }} /> {videoSelecionado.nome} — {videoSelecionado.duracao}s
          </p>
        )}

        {/* TERMO DE CONSENTIMENTO / LGPD */}
        <label className="anexar-video-consentimento-box">
          <input
            type="checkbox"
            checked={consentimento}
            onChange={(e) => setConsentimento(e.target.checked)}
            disabled={enviando}
          />
          <span>
            Autorizo o envio deste vídeo <strong>exclusivamente para avaliação pedagógica do professor de Educação Física</strong>, ciente de que a mídia é privada e não será compartilhada publicamente.
          </span>
        </label>

        {erro && <p className="anexar-video-erro">{erro}</p>}

        <button
          type="button"
          className="anexar-video-enviar-btn"
          onClick={enviarVideo}
          disabled={!videoSelecionado || !consentimento || enviando}
        >
          {enviando ? "Enviando..." : <><FiCheck style={{ marginRight: 6 }} /> Enviar e finalizar</>}
        </button>
      </main>
    </div>
  );
}
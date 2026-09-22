import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { io, Socket } from "socket.io-client";
import "./DetalhesComunidade.css";

interface Mensagem {
  _id: string;
  autorId: string;
  autorNome: string;
  autorTipo: "aluno" | "professor";
  texto: string;
  enviadaEm: string;
}

export default function DetalhesComunidade() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [texto, setTexto] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const socketRef = useRef<Socket | null>(null);
  const fimDaListaRef = useRef<HTMLDivElement | null>(null);
  const meuId = useRef<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // decodifica o id do usuário do próprio token (sem lib extra — payload é base64)
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      meuId.current = payload.id;
    } catch {
      meuId.current = null;
    }

    carregarHistorico();

    const socket = io("http://localhost:3000", { auth: { token } });
    socketRef.current = socket;

    socket.emit("entrar-comunidade", id, (resposta: { sucesso: boolean; erro?: string }) => {
      if (!resposta.sucesso) setErro(resposta.erro || "Não foi possível entrar na comunidade.");
    });

    socket.on("nova-mensagem", (mensagem: Mensagem) => {
      setMensagens((atual) => [...atual, mensagem]);
    });

    return () => {
      socket.emit("sair-comunidade", id);
      socket.disconnect();
    };
  }, [id]);

  useEffect(() => {
    fimDaListaRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  async function carregarHistorico() {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:3000/api/comunidades/${id}/mensagens`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMensagens(response.data.mensagens || []);
    } catch (err) {
      console.error(err);
    } finally {
      setCarregando(false);
    }
  }

  function enviarMensagem(e: React.FormEvent) {
    e.preventDefault();
    if (!texto.trim() || !socketRef.current) return;

    socketRef.current.emit(
      "enviar-mensagem",
      { comunidadeId: id, texto },
      (resposta: { sucesso: boolean; erro?: string }) => {
        if (!resposta.sucesso) setErro(resposta.erro || "Não foi possível enviar a mensagem.");
      }
    );
    setTexto("");
  }

  function formatarHora(dataIso: string) {
    return new Date(dataIso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }

  if (carregando) return <p className="comunidade-chat-mensagem">Carregando...</p>;

  return (
    <div className="comunidade-chat-page">
      <header className="comunidade-chat-header">
        <button className="comunidade-chat-voltar" onClick={() => navigate(-1)} aria-label="Voltar">
          ←
        </button>
        <h1>Chat</h1>
      </header>

      {erro && <p className="comunidade-chat-erro">{erro}</p>}

      <main className="comunidade-chat-mensagens">
        {mensagens.map((m) => {
          const minha = m.autorId === meuId.current;
          return (
            <div key={m._id} className={`comunidade-chat-bolha ${minha ? "minha" : ""}`}>
              {!minha && <span className="comunidade-chat-autor">{m.autorNome}</span>}
              <p className="comunidade-chat-texto">{m.texto}</p>
              <span className="comunidade-chat-hora">{formatarHora(m.enviadaEm)}</span>
            </div>
          );
        })}
        <div ref={fimDaListaRef} />
      </main>

      <form onSubmit={enviarMensagem} className="comunidade-chat-input-linha">
        <input
          type="text"
          placeholder="Digite uma mensagem..."
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
        <button type="submit" disabled={!texto.trim()}>
          Enviar
        </button>
      </form>
    </div>
  );
}
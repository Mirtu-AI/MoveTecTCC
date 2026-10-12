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

interface Desafio {
  _id: string;
  titulo: string;
  descricao: string;
  criadorNome: string;
  criadorTipo: "aluno" | "professor";
  criadoEm: string;
  prazo: string;
  totalParticipantes: number;
  totalConcluidos: number;
  expirado: boolean;
  minhaParticipacao: { aceito: boolean; concluido: boolean; concluidoEm: string | null };
}

interface Comunidade {
  tipo: "geral" | "tematica";
  adminId: string;
}

export default function DetalhesComunidade() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [aba, setAba] = useState<"chat" | "desafios">("chat");

  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [texto, setTexto] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [comunidade, setComunidade] = useState<Comunidade | null>(null);
  const [desafios, setDesafios] = useState<Desafio[]>([]);
  const [carregandoDesafios, setCarregandoDesafios] = useState(true);

  const [tituloNovo, setTituloNovo] = useState("");
  const [descricaoNovo, setDescricaoNovo] = useState("");
  const [erroDesafio, setErroDesafio] = useState("");
  const [criandoDesafio, setCriandoDesafio] = useState(false);
  const [mostrarFormDesafio, setMostrarFormDesafio] = useState(false);

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
    carregarComunidadeEDesafios();

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

  async function carregarComunidadeEDesafios() {
    try {
      const token = localStorage.getItem("token");
      const cabecalho = { headers: { Authorization: `Bearer ${token}` } };

      const [respComunidade, respDesafios] = await Promise.all([
        axios.get(`http://localhost:3000/api/comunidades/${id}`, cabecalho),
        axios.get(`http://localhost:3000/api/comunidades/${id}/desafios`, cabecalho),
      ]);

      setComunidade(respComunidade.data.comunidade || null);
      setDesafios(respDesafios.data.desafios || []);
    } catch (err) {
      console.error(err);
    } finally {
      setCarregandoDesafios(false);
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

  async function criarDesafio(e: React.FormEvent) {
    e.preventDefault();
    setErroDesafio("");

    if (!tituloNovo.trim() || !descricaoNovo.trim()) {
      setErroDesafio("Preencha o título e a descrição.");
      return;
    }

    setCriandoDesafio(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:3000/api/comunidades/${id}/desafios`,
        { titulo: tituloNovo, descricao: descricaoNovo },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTituloNovo("");
      setDescricaoNovo("");
      setMostrarFormDesafio(false);
      await carregarComunidadeEDesafios();
    } catch (err: any) {
      setErroDesafio(err.response?.data?.erros?.[0] || "Não foi possível criar o desafio.");
    } finally {
      setCriandoDesafio(false);
    }
  }

  async function aceitarDesafio(desafioId: string) {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:3000/api/desafios/${desafioId}/aceitar`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await carregarComunidadeEDesafios();
    } catch (err) {
      console.error(err);
    }
  }

  async function concluirDesafio(desafioId: string) {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:3000/api/desafios/${desafioId}/concluir`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await carregarComunidadeEDesafios();
    } catch (err) {
      console.error(err);
    }
  }

  function formatarHora(dataIso: string) {
    return new Date(dataIso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }

  function formatarPrazo(dataIso: string) {
    return new Date(dataIso).toLocaleDateString("pt-BR");
  }

  if (carregando) return <p className="comunidade-chat-mensagem">Carregando...</p>;

  const souAdmin = Boolean(comunidade && meuId.current && comunidade.adminId === meuId.current);
  const possoCriarDesafio = Boolean(comunidade && (comunidade.tipo === "tematica" || souAdmin));

  return (
    <div className="comunidade-chat-page">
      <header className="comunidade-chat-header">
        <button className="comunidade-chat-voltar" onClick={() => navigate(-1)} aria-label="Voltar">
          ←
        </button>
        <h1>Chat</h1>
      </header>

      {erro && <p className="comunidade-chat-erro">{erro}</p>}

      <div className="comunidade-chat-abas">
        <button
          type="button"
          className={`comunidade-chat-aba ${aba === "chat" ? "ativa" : ""}`}
          onClick={() => setAba("chat")}
        >
          Chat
        </button>
        <button
          type="button"
          className={`comunidade-chat-aba ${aba === "desafios" ? "ativa" : ""}`}
          onClick={() => setAba("desafios")}
        >
          Desafios
        </button>
      </div>

      {aba === "chat" && (
        <>
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
        </>
      )}

      {aba === "desafios" && (
        <main className="comunidade-desafios-conteudo">
          {!carregandoDesafios && possoCriarDesafio && (
            <button
              type="button"
              className="comunidade-desafios-novo-btn"
              onClick={() => setMostrarFormDesafio((atual) => !atual)}
            >
              {mostrarFormDesafio ? "Cancelar" : "+ Criar desafio"}
            </button>
          )}

          {mostrarFormDesafio && (
            <form onSubmit={criarDesafio} className="comunidade-desafio-form">
              <input
                type="text"
                placeholder="Título do desafio"
                value={tituloNovo}
                onChange={(e) => setTituloNovo(e.target.value)}
              />
              <textarea
                placeholder="Descrição"
                value={descricaoNovo}
                onChange={(e) => setDescricaoNovo(e.target.value)}
                rows={3}
              />
              {erroDesafio && <p className="comunidade-desafio-erro">{erroDesafio}</p>}
              <button type="submit" className="btn btn-filled" disabled={criandoDesafio}>
                {criandoDesafio ? "Criando..." : "✓ Publicar desafio"}
              </button>
            </form>
          )}

          {carregandoDesafios ? (
            <p className="comunidade-chat-mensagem">Carregando...</p>
          ) : desafios.length === 0 ? (
            <p className="comunidade-chat-mensagem">Nenhum desafio por aqui ainda.</p>
          ) : (
            <div className="comunidade-desafios-lista">
              {desafios.map((d) => (
                <div key={d._id} className={`comunidade-desafio-card ${d.expirado ? "expirado" : ""}`}>
                  <div className="comunidade-desafio-topo">
                    <span className="comunidade-desafio-titulo">{d.titulo}</span>
                    <span className="comunidade-desafio-prazo">
                      {d.expirado ? "Encerrado" : `Até ${formatarPrazo(d.prazo)}`}
                    </span>
                  </div>
                  <p className="comunidade-desafio-descricao">{d.descricao}</p>
                  <span className="comunidade-desafio-autor">Por {d.criadorNome}</span>
                  <span className="comunidade-desafio-contagem">
                    {d.totalConcluidos} de {d.totalParticipantes} concluíram
                  </span>

                  {!d.expirado && (
                    <>
                      {!d.minhaParticipacao.aceito && (
                        <button
                          type="button"
                          className="comunidade-desafio-btn"
                          onClick={() => aceitarDesafio(d._id)}
                        >
                          Aceitar desafio
                        </button>
                      )}
                      {d.minhaParticipacao.aceito && !d.minhaParticipacao.concluido && (
                        <button
                          type="button"
                          className="comunidade-desafio-btn concluir"
                          onClick={() => concluirDesafio(d._id)}
                        >
                          Marcar como concluído
                        </button>
                      )}
                      {d.minhaParticipacao.concluido && (
                        <span className="comunidade-desafio-concluido">✓ Você concluiu!</span>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      )}
    </div>
  );
}
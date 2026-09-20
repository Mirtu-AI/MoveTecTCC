import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./MetasAluno.css";

interface Meta {
  _id: string;
  titulo: string;
  tipo: "tempo" | "atividades";
  valorAlvo: number;
  valorAtual: number;
  prazo: string;
  concluida: boolean;
  percentual: number;
}

export default function MetasAluno() {
  const navigate = useNavigate();

  const [metas, setMetas] = useState<Meta[]>([]);
  const [carregando, setCarregando] = useState(true);

  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState<"tempo" | "atividades">("atividades");
  const [valorAlvo, setValorAlvo] = useState("");
  const [prazo, setPrazo] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    buscarMetas();
  }, []);

  async function buscarMetas() {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3000/api/aluno/metas", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMetas(response.data.metas || []);
    } catch (err) {
      console.error(err);
    } finally {
      setCarregando(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (!titulo.trim() || !valorAlvo || !prazo) {
      setErro("Preencha todos os campos obrigatórios.");
      return;
    }

    setSalvando(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:3000/api/aluno/metas",
        { titulo, tipo, valorAlvo: Number(valorAlvo), prazo },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTitulo("");
      setValorAlvo("");
      setPrazo("");
      await buscarMetas();
    } catch (err: any) {
      setErro(err.response?.data?.erros?.[0] || "Não foi possível criar a meta.");
    } finally {
      setSalvando(false);
    }
  }

  async function excluirMeta(id: string) {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:3000/api/aluno/metas/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMetas((atual) => atual.filter((m) => m._id !== id));
    } catch (err) {
      console.error(err);
    }
  }

  function formatarValor(meta: Meta, valor: number) {
    return meta.tipo === "tempo" ? `${valor} min` : `${valor}`;
  }

  const metasEmAndamento = metas.filter((m) => !m.concluida);
  const metasAtingidas = metas.filter((m) => m.concluida);

  if (carregando) {
    return (
      <div className="metas-carregando">
        <div className="metas-spinner" />
        <p>Carregando suas metas...</p>
      </div>
    );
  }

  return (
    <div className="metas-page">
      <header className="metas-header">
        <button className="metas-voltar" onClick={() => navigate(-1)} aria-label="Voltar">
          ←
        </button>
        <h1>Minhas Metas</h1>
      </header>

      <main className="metas-conteudo">
        {/* Bloco 1: Formulário de Nova Meta */}
        <section className="metas-secao">
          <h2 className="metas-secao-titulo">Definir nova meta</h2>

          <form onSubmit={handleSubmit} className="metas-form">
            <div className="metas-campo-grupo">
              <label>Tipo de meta</label>
              <div className="metas-tipo-opcoes">
                <label className={`metas-tipo-opcao ${tipo === "tempo" ? "selecionada" : ""}`}>
                  <input
                    type="radio"
                    name="tipo"
                    checked={tipo === "tempo"}
                    onChange={() => setTipo("tempo")}
                  />
                  <span>⏱️ Tempo</span>
                </label>
                <label className={`metas-tipo-opcao ${tipo === "atividades" ? "selecionada" : ""}`}>
                  <input
                    type="radio"
                    name="tipo"
                    checked={tipo === "atividades"}
                    onChange={() => setTipo("atividades")}
                  />
                  <span>🏋️ Atividades</span>
                </label>
              </div>
            </div>

            <div className="metas-campo-grupo">
              <label htmlFor="titulo">Descrição</label>
              <input
                id="titulo"
                type="text"
                className="metas-input"
                placeholder={tipo === "tempo" ? "Ex: Treinar 300 minutos" : "Ex: Fazer 30 exercícios"}
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
              />
            </div>

            <div className="metas-form-linha">
              <div className="metas-campo-grupo">
                <label htmlFor="valorAlvo">{tipo === "tempo" ? "Minutos alvo" : "Quantidade"}</label>
                <input
                  id="valorAlvo"
                  type="number"
                  min={1}
                  className="metas-input"
                  placeholder="0"
                  value={valorAlvo}
                  onChange={(e) => setValorAlvo(e.target.value)}
                />
              </div>

              <div className="metas-campo-grupo">
                <label htmlFor="prazo">Prazo final</label>
                <input
                  id="prazo"
                  type="date"
                  className="metas-input"
                  value={prazo}
                  onChange={(e) => setPrazo(e.target.value)}
                />
              </div>
            </div>

            {erro && <p className="metas-erro">{erro}</p>}

            <button type="submit" className="metas-salvar-btn" disabled={salvando}>
              {salvando ? "Criando..." : "+ Criar meta"}
            </button>
          </form>
        </section>

        {/* Bloco 2: Metas em Andamento */}
        <section className="metas-secao">
          <h2 className="metas-secao-titulo">Metas em andamento</h2>
          {metasEmAndamento.length === 0 ? (
            <p className="metas-mensagem-vazio">Nenhuma meta em andamento no momento.</p>
          ) : (
            <div className="metas-lista">
              {metasEmAndamento.map((meta) => (
                <div key={meta._id} className="metas-card">
                  <div className="metas-card-topo">
                    <div className="metas-card-info-principal">
                      <span className="metas-card-icone">{meta.tipo === "tempo" ? "⏱️" : "🏋️"}</span>
                      <span className="metas-card-titulo">{meta.titulo}</span>
                    </div>
                    <button
                      type="button"
                      className="metas-item-excluir"
                      onClick={() => excluirMeta(meta._id)}
                      aria-label="Excluir meta"
                      title="Excluir meta"
                    >
                      🗑️
                    </button>
                  </div>

                  <div className="metas-progresso-container">
                    <div className="metas-item-progresso-trilha">
                      <div
                        className="metas-item-progresso-barra"
                        style={{ width: `${Math.min(meta.percentual || 0, 100)}%` }}
                      />
                    </div>
                    <div className="metas-progresso-detalhes">
                      <span>
                        {formatarValor(meta, meta.valorAtual)} de {formatarValor(meta, meta.valorAlvo)}
                      </span>
                      <span className="metas-porcentagem">{Math.round(meta.percentual || 0)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Bloco 3: Metas Atingidas */}
        <section className="metas-secao">
          <h2 className="metas-secao-titulo">Metas atingidas</h2>
          {metasAtingidas.length === 0 ? (
            <p className="metas-mensagem-vazio">Nenhuma meta concluída ainda. Continue treinando!</p>
          ) : (
            <div className="metas-lista">
              {metasAtingidas.map((meta) => (
                <div key={meta._id} className="metas-card metas-card-atingida">
                  <div className="metas-card-topo">
                    <div className="metas-card-info-principal">
                      <span className="metas-badge-check">✓</span>
                      <span className="metas-card-titulo">{meta.titulo}</span>
                    </div>
                    <button
                      type="button"
                      className="metas-item-excluir"
                      onClick={() => excluirMeta(meta._id)}
                      aria-label="Excluir meta"
                      title="Excluir meta"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
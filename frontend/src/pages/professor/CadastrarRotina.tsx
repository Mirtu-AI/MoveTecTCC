import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./CadastrarRotina.css";

interface TreinoCatalogo {
  _id: string;
  titulo: string;
}

interface Grupo {
  nome: string;
  treinosSelecionados: string[];
}

export default function CadastrarRotina() {
  const { id } = useParams();
  const modoEdicao = Boolean(id);
  const navigate = useNavigate();

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [midiaUrl, setMidiaUrl] = useState("");
  const [catalogo, setCatalogo] = useState<TreinoCatalogo[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([{ nome: "", treinosSelecionados: [] }]);

  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [carregandoDados, setCarregandoDados] = useState(true);

  useEffect(() => {
    async function carregarDados() {
      try {
        const token = localStorage.getItem("token");
        const cabecalho = { headers: { Authorization: `Bearer ${token}` } };

        const responseCatalogo = await axios.get("http://localhost:3000/api/treinos", cabecalho);
        setCatalogo(responseCatalogo.data.treinos);

        if (modoEdicao) {
          const responseRotina = await axios.get(`http://localhost:3000/api/rotinas/${id}`, cabecalho);
          const rotina = responseRotina.data.rotina;

          setTitulo(rotina.titulo);
          setDescricao(rotina.descricao);
          setMidiaUrl(rotina.midiaUrl || "");
          setGrupos(
            rotina.grupos.map((g: any) => ({
              nome: g.nome,
              treinosSelecionados: g.treinos.map((t: any) => t.treinoId),
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

  function atualizarNomeGrupo(indiceGrupo: number, nome: string) {
    setGrupos((atual) =>
      atual.map((g, i) => (i === indiceGrupo ? { ...g, nome } : g))
    );
  }

  function alternarTreinoNoGrupo(indiceGrupo: number, treinoId: string) {
    setGrupos((atual) =>
      atual.map((g, i) => {
        if (i !== indiceGrupo) return g;
        const jaSelecionado = g.treinosSelecionados.includes(treinoId);
        return {
          ...g,
          treinosSelecionados: jaSelecionado
            ? g.treinosSelecionados.filter((t) => t !== treinoId)
            : [...g.treinosSelecionados, treinoId],
        };
      })
    );
  }

  function adicionarGrupo() {
    setGrupos((atual) => [...atual, { nome: "", treinosSelecionados: [] }]);
  }

  function removerGrupo(indiceGrupo: number) {
    setGrupos((atual) => atual.filter((_, i) => i !== indiceGrupo));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (!titulo.trim() || !descricao.trim()) {
      setErro("Preencha o título e a descrição da rotina.");
      return;
    }

    if (grupos.length === 0) {
      setErro("Adicione ao menos um grupo.");
      return;
    }

    const grupoInvalido = grupos.find(
      (g) => !g.nome.trim() || g.treinosSelecionados.length === 0
    );
    if (grupoInvalido) {
      setErro("Todo grupo precisa de um nome e ao menos um treino selecionado.");
      return;
    }

    setCarregando(true);

    try {
      const token = localStorage.getItem("token");
      const cabecalho = { headers: { Authorization: `Bearer ${token}` } };

      const dados = {
        titulo,
        descricao,
        midiaUrl,
        grupos: grupos.map((g) => ({ nome: g.nome, treinos: g.treinosSelecionados })),
      };

      if (modoEdicao) {
        await axios.put(`http://localhost:3000/api/professor/rotinas/${id}`, dados, cabecalho);
      } else {
        await axios.post("http://localhost:3000/api/professor/rotinas", dados, cabecalho);
      }

      navigate("/professor/rotinas");
    } catch (err: any) {
      const mensagem = err.response?.data?.erros?.[0] || "Não foi possível salvar a rotina.";
      setErro(mensagem);
    } finally {
      setCarregando(false);
    }
  }

  if (carregandoDados) {
    return <p className="cadastrar-rotina-mensagem">Carregando...</p>;
  }

  return (
    <div className="cadastrar-rotina-page">
      <header className="cadastrar-rotina-header">
        <button
          className="cadastrar-rotina-voltar"
          onClick={() => navigate("/professor/rotinas")}
          aria-label="Voltar"
        >
          ←
        </button>
        <h1>{modoEdicao ? "Editar rotina" : "Nova rotina"}</h1>
      </header>

      <main className="cadastrar-rotina-conteudo">
        <form onSubmit={handleSubmit} className="cadastrar-rotina-form">
          <label htmlFor="titulo">Título da rotina</label>
          <input
            id="titulo"
            type="text"
            placeholder="Ex: Corrida"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />

          <label htmlFor="descricao">Descrição geral</label>
          <textarea
            id="descricao"
            placeholder="Explique o objetivo da rotina"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            rows={3}
          />

          <label htmlFor="midiaUrl">Link do vídeo ou imagem (opcional)</label>
          <input
            id="midiaUrl"
            type="text"
            placeholder="https://..."
            value={midiaUrl}
            onChange={(e) => setMidiaUrl(e.target.value)}
          />

          {catalogo.length === 0 && (
            <p className="cadastrar-rotina-aviso-catalogo">
              Você ainda não tem treinos cadastrados. Cadastre pelo menos um treino antes de montar uma rotina.
            </p>
          )}

          <div className="cadastrar-rotina-grupos-topo">
            <span>Grupos</span>
            <button type="button" className="cadastrar-rotina-add-grupo-btn" onClick={adicionarGrupo}>
              + Adicionar grupo
            </button>
          </div>

          <div className="cadastrar-rotina-grupos-lista">
            {grupos.map((grupo, indiceGrupo) => (
              <div key={indiceGrupo} className="cadastrar-rotina-grupo-card">
                <div className="cadastrar-rotina-grupo-topo">
                  <input
                    type="text"
                    placeholder="Nome do grupo (ex: Pré corrida)"
                    value={grupo.nome}
                    onChange={(e) => atualizarNomeGrupo(indiceGrupo, e.target.value)}
                    className="cadastrar-rotina-grupo-nome-input"
                  />
                  {grupos.length > 1 && (
                    <button
                      type="button"
                      className="cadastrar-rotina-remover-grupo-btn"
                      onClick={() => removerGrupo(indiceGrupo)}
                      aria-label="Remover grupo"
                    >
                      🗑
                    </button>
                  )}
                </div>

                <div className="cadastrar-rotina-treinos-lista">
                  {catalogo.map((treino) => {
                    const marcado = grupo.treinosSelecionados.includes(treino._id);
                    return (
                      <div
                        key={treino._id}
                        role="button"
                        tabIndex={0}
                        className={`cadastrar-rotina-treino-item ${marcado ? "marcado" : ""}`}
                        onClick={() => alternarTreinoNoGrupo(indiceGrupo, treino._id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            alternarTreinoNoGrupo(indiceGrupo, treino._id);
                          }
                        }}
                      >
                        <span className={`cadastrar-rotina-check ${marcado ? "marcado" : ""}`}>
                          {marcado ? "✓" : ""}
                        </span>
                        <span className="cadastrar-rotina-treino-icone">🏋️</span>
                        <span className="cadastrar-rotina-treino-nome">{treino.titulo}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {erro && <p className="cadastrar-rotina-erro">{erro}</p>}

          <button type="submit" className="btn btn-filled cadastrar-rotina-salvar-btn" disabled={carregando}>
            {carregando ? "Salvando..." : modoEdicao ? "✓ Salvar alterações" : "✓ Criar rotina"}
          </button>
        </form>
      </main>
    </div>
  );
}
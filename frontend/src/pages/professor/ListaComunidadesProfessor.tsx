import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./ListaComunidadesProfessor.css";
import Logotipo from "../../assets/logo/Logo_MoveTec.png";
import ModalConfirmacao from "../components/ModalConfirmacao";

interface ComunidadeResumo {
  _id: string;
  nome: string;
  descricao: string;
  totalMembros: number;
  tipo?: "geral" | "tematica";
  ehAdmin?: boolean;
}

interface ComunidadeTematica extends ComunidadeResumo {
  criadorTipo: "aluno" | "professor";
}

export default function ListaComunidadesProfessor() {
  const navigate = useNavigate();

  const [gerais, setGerais] = useState<ComunidadeResumo[]>([]);
  const [minhasTematicas, setMinhasTematicas] = useState<ComunidadeResumo[]>([]);
  const [todasTematicas, setTodasTematicas] = useState<ComunidadeTematica[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");

  const [comunidadeSelecionada, setComunidadeSelecionada] =
    useState<ComunidadeResumo | null>(null);

  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      setCarregando(true);

      const token = localStorage.getItem("token");

      const cabecalho = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const [respMinhas, respTodas] = await Promise.all([
        axios.get(
          "http://localhost:3000/api/professor/comunidades",
          cabecalho
        ),
        axios.get(
          "http://localhost:3000/api/comunidades/tematicas",
          cabecalho
        ),
      ]);

      setGerais(respMinhas.data?.gerais || []);
      setMinhasTematicas(respMinhas.data?.tematicas || []);
      setTodasTematicas(respTodas.data?.comunidades || []);
    } catch (err) {
      console.error("Erro ao carregar comunidades:", err);
    } finally {
      setCarregando(false);
    }
  }

  const idsDasMinhas = new Set(
    minhasTematicas.map((comunidade) => comunidade._id)
  );

  const termoBusca = busca.trim().toLowerCase();

  const paraDescobrir = todasTematicas.filter((comunidade) => {
    const naoParticipa = !idsDasMinhas.has(comunidade._id);

    const correspondeBusca =
      termoBusca === "" ||
      comunidade.nome.toLowerCase().includes(termoBusca);

    return naoParticipa && correspondeBusca;
  });

  async function entrar(comunidadeId: string) {
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `http://localhost:3000/api/professor/comunidades/${comunidadeId}/entrar`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await carregarDados();
    } catch (err) {
      console.error("Erro ao entrar na comunidade:", err);
    }
  }

  function abrirModalExcluir(
    e: React.MouseEvent<HTMLButtonElement>,
    comunidade: ComunidadeResumo
  ) {
    e.stopPropagation();

    setComunidadeSelecionada(comunidade);
    setModalExcluirAberto(true);
  }

  async function confirmarExclusao() {
    if (!comunidadeSelecionada) {
      return;
    }

    setExcluindo(true);

    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `http://localhost:3000/api/comunidades/${comunidadeSelecionada._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setModalExcluirAberto(false);
      setComunidadeSelecionada(null);

      await carregarDados();
    } catch (err) {
      console.error("Erro ao excluir comunidade:", err);
    } finally {
      setExcluindo(false);
    }
  }

  function abrirComunidade(comunidadeId: string) {
    navigate(`/professor/comunidades/${comunidadeId}`);
  }

  function renderCard(
    comunidade: ComunidadeResumo,
    icone: string,
    podeExcluir = false
  ) {
    return (
      <div
        key={comunidade._id}
        className="comunidade-professor-card"
        role="button"
        tabIndex={0}
        onClick={() => abrirComunidade(comunidade._id)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            abrirComunidade(comunidade._id);
          }
        }}
      >
        <span className="comunidade-professor-card-icone">
          {icone}
        </span>

        <div className="comunidade-professor-card-info">
          <span className="comunidade-professor-card-nome">
            {comunidade.nome}
          </span>

          <span className="comunidade-professor-card-membros">
            {comunidade.totalMembros}{" "}
            {comunidade.totalMembros === 1 ? "membro" : "membros"}
          </span>
        </div>

        {comunidade.ehAdmin && (
          <div className="comunidade-professor-card-acoes">
            <button
              type="button"
              className="comunidade-professor-acao-btn"
              onClick={(e) => {
                e.stopPropagation();
                navigate(
                  `/professor/comunidades/${comunidade._id}/editar`
                );
              }}
              aria-label={`Editar comunidade ${comunidade.nome}`}
              title="Editar comunidade"
            >
              ✏️
            </button>

            {podeExcluir && (
              <button
                type="button"
                className="comunidade-professor-acao-btn"
                onClick={(e) =>
                  abrirModalExcluir(e, comunidade)
                }
                aria-label={`Excluir comunidade ${comunidade.nome}`}
                title="Excluir comunidade"
              >
                🗑️
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  if (carregando) {
    return (
      <div className="comunidades-professor-page">
        <NavegacaoProfessor />

        <main className="comunidades-professor-main">
          <p className="comunidades-professor-mensagem">
            Carregando comunidades...
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="comunidades-professor-page">
      <NavegacaoProfessor />

      <div className="comunidades-professor-main">
        <header className="comunidades-professor-header">
          <h1>Comunidades</h1>

          <button
            type="button"
            className="comunidades-professor-nova-btn"
            onClick={() =>
              navigate("/professor/comunidades/nova")
            }
          >
            + Criar comunidade
          </button>
        </header>

        <main className="comunidades-professor-conteudo">
          {/* SALAS GERAIS */}
          {gerais.length > 0 && (
            <section className="comunidades-professor-secao">
              <span className="comunidades-professor-secao-titulo">
                Suas salas
              </span>

              <div className="comunidades-professor-lista">
                {gerais.map((comunidade) =>
                  renderCard(comunidade, "🏫")
                )}
              </div>
            </section>
          )}

          {/* MINHAS COMUNIDADES TEMÁTICAS */}
          <section className="comunidades-professor-secao">
            <span className="comunidades-professor-secao-titulo">
              Suas comunidades temáticas
            </span>

            {minhasTematicas.length === 0 ? (
              <p className="comunidades-professor-mensagem-secao">
                Você ainda não participa de nenhuma comunidade
                temática.
              </p>
            ) : (
              <div className="comunidades-professor-lista">
                {minhasTematicas.map((comunidade) =>
                  renderCard(comunidade, "💬", true)
                )}
              </div>
            )}
          </section>

          {/* DESCOBRIR COMUNIDADES */}
          <section className="comunidades-professor-secao">
            <span className="comunidades-professor-secao-titulo">
              Descobrir comunidades
            </span>

            <input
              type="text"
              placeholder="Buscar por nome..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="comunidades-professor-busca-input"
              aria-label="Buscar comunidades por nome"
            />

            <div className="comunidades-professor-lista">
              {paraDescobrir.length === 0 ? (
                <p className="comunidades-professor-mensagem-secao">
                  {termoBusca
                    ? "Nenhuma comunidade encontrada."
                    : "Não há novas comunidades para descobrir."}
                </p>
              ) : (
                paraDescobrir.map((comunidade) => (
                  <div
                    key={comunidade._id}
                    className="comunidade-professor-card comunidade-professor-card-descobrir"
                  >
                    <span className="comunidade-professor-card-icone">
                      💬
                    </span>

                    <div className="comunidade-professor-card-info">
                      <span className="comunidade-professor-card-nome">
                        {comunidade.nome}
                      </span>

                      <span className="comunidade-professor-card-membros">
                        {comunidade.totalMembros}{" "}
                        {comunidade.totalMembros === 1
                          ? "membro"
                          : "membros"}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="comunidade-professor-entrar-btn"
                      onClick={() => entrar(comunidade._id)}
                    >
                      Entrar
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        </main>
      </div>

      <ModalConfirmacao
        aberto={modalExcluirAberto}
        titulo="Excluir comunidade?"
        mensagem={`Tem certeza que deseja excluir "${comunidadeSelecionada?.nome}"? Todas as mensagens dela serão apagadas e essa ação não pode ser desfeita.`}
        textoConfirmar="Excluir"
        tipo="perigo"
        carregando={excluindo}
        onConfirmar={confirmarExclusao}
        onCancelar={() => {
          if (excluindo) {
            return;
          }

          setModalExcluirAberto(false);
          setComunidadeSelecionada(null);
        }}
      />
    </div>
  );
}

function NavegacaoProfessor() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItens = [
    {
      rota: "/dashboard",
      icone: "📊",
      rotulo: "Salas",
    },
    {
      rota: "/professor/comunidades",
      icone: "💬",
      rotulo: "Comunidades",
    },
    {
      rota: "/professor/avisos",
      icone: "📢",
      rotulo: "Avisos",
    },
    {
      rota: "/professor/rotinas",
      icone: "🏃",
      rotulo: "Rotinas",
    },
    {
      rota: "/professor/treinos",
      icone: "🏋️‍♂️",
      rotulo: "Treinos",
    },
    {
      rota: "/professor/exercicios",
      icone: "🏋️‍♂️",
      rotulo: "Exercícios",
    },
    {
      rota: "/professor/perfil",
      icone: "👤",
      rotulo: "Perfil",
    },
  ];

  return (
    <nav className="navegacao-professor">
      <div className="navegacao-logo">
        <img src={Logotipo} alt="MoveTec" />
      </div>

      <ul className="navegacao-lista">
        {menuItens.map((item) => {
          const ativo =
            location.pathname === item.rota ||
            (item.rota === "/dashboard" &&
              location.pathname === "/professor/salas");

          return (
            <li key={item.rota}>
              <button
                type="button"
                className={`navegacao-btn ${
                  ativo ? "ativo" : ""
                }`}
                onClick={() => navigate(item.rota)}
              >
                <span className="navegacao-icone">
                  {item.icone}
                </span>

                <span className="navegacao-rotulo">
                  {item.rotulo}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

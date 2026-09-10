import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./TelaAlunoLicitacao.css";
import NavegacaoAluno from "./NavegacaoAluno";

interface Perfil {
  nome: string;
  foto?: string | null;
  streakAtual?: number;
  nomeSocial?: string | null;
}

interface ExercicioPopulado {
  exercicio: { nome: string } | null;
}

interface AtividadeProposta {
  _id: string;
  titulo: string;
  midiaUrl: string | null;
  dataEntrega: string;
  progresso: number;
  exercicios: ExercicioPopulado[];
}

interface Treino {
  _id: string;
  titulo: string;
}

interface HistoricoTreino {
  treinoId: string;
  dataConclusao: string;
}

interface TreinoResumo {
  treinoId: string;
  treino: { titulo: string; midiaUrl: string | null } | null;
}
interface GrupoRotina {
  nome: string;
  treinos: TreinoResumo[];
}
interface Rotina {
  _id: string;
  titulo: string;
  grupos: GrupoRotina[];
}

export default function TelaAlunoLicitacao() {
  const navigate = useNavigate();

  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [atividades, setAtividades] = useState<AtividadeProposta[]>([]);
  const [rotinas, setRotinas] = useState<Treino[]>([]);
  const [especificas, setEspecificas] = useState<Treino[]>([]);
  const [historico, setHistorico] = useState<HistoricoTreino[]>([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [streakAnimando, setStreakAnimando] = useState(false);
  const [treinoConcluindo, setTreinoConcluindo] = useState<string | null>(null);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const token = localStorage.getItem("token");
      const cabecalho = { headers: { Authorization: `Bearer ${token}` } };

      const [respPerfil, respAtividades, respRotinas, respEspecificas, respHistorico] = await Promise.all([
        axios.get("http://localhost:3000/api/aluno/perfil", cabecalho),
        axios.get("http://localhost:3000/api/aluno/atividades", cabecalho),
        axios.get("http://localhost:3000/api/aluno/treinos?tipo=rotina", cabecalho),
        axios.get("http://localhost:3000/api/aluno/rotinas", cabecalho),
        axios.get("http://localhost:3000/api/aluno/historico", cabecalho).catch(() => ({ data: { historico: [] } })),
      ]);

      setPerfil(respPerfil.data.aluno || null);
      setAtividades(respAtividades.data.atividades || []);
      setRotinas(respRotinas.data.treinos || []);
      setEspecificas(respEspecificas.data.treinos || []);
      setHistorico(respHistorico.data.historico || []);
      setRotinas(respRotinas.data.rotinas || [])

      setStreakAnimando(true);
      setTimeout(() => setStreakAnimando(false), 900);
    } catch (err) {
      console.error(err);
    } finally {
      setCarregando(false);
    }
  }

  async function concluirTreino(treinoId: string) {
    if (treinoConcluindo) return;

    setTreinoConcluindo(treinoId);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:3000/api/aluno/treinos/${treinoId}/concluir`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPerfil((atual) =>
        atual ? { ...atual, streakAtual: response.data.streakAtual } : atual
      );

      setHistorico((prev) => [
        ...prev,
        { treinoId, dataConclusao: new Date().toISOString() }
      ]);

      setStreakAnimando(true);
      setTimeout(() => setStreakAnimando(false), 900);
    } catch (err) {
      console.error(err);
    } finally {
      setTreinoConcluindo(null);
    }
  }

  function formatarDataHoje() {
    return new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  }

  function formatarDataEntrega(dataIso: string) {
    return new Date(dataIso).toLocaleDateString("pt-BR");
  }

  // LÓGICA DOS WIDGETS LATERAIS
  function obterDiasDaSemana() {
    const diasSiglas = ["D", "S", "T", "Q", "Q", "S", "S"];
    const hoje = new Date();
    const diaSemanaHoje = hoje.getDay(); // 0 (Dom) a 6 (Sáb)

    // Gera os 7 dias da semana atual (Domingo a Sábado)
    const dias = [];
    for (let i = 0; i < 7; i++) {
      const data = new Date(hoje);
      data.setDate(hoje.getDate() - (diaSemanaHoje - i));

      const dataStr = data.toISOString().split("T")[0];
      const treinoFeito = historico.some((h) => h.dataConclusao.startsWith(dataStr));

      dias.push({
        sigla: diasSiglas[i],
        concluido: treinoFeito,
        eHoje: i === diaSemanaHoje,
      });
    }
    return dias;
  }
  function obterInicioDaSemana() {
    const hoje = new Date();
    const inicio = new Date(hoje);
    inicio.setDate(hoje.getDate() - hoje.getDay());
    inicio.setHours(0, 0, 0, 0);
    return inicio;
  }

  function contarTreinosNaSemana() {
    const inicioSemana = obterInicioDaSemana();
    return historico.filter((h) => new Date(h.dataConclusao) >= inicioSemana).length;
  }

  const diasSemana = obterDiasDaSemana();
  const treinosNaSemana = contarTreinosNaSemana();
  const metaSemanal = 5;
  const porcentagemMeta = Math.min(Math.round((treinosNaSemana / metaSemanal) * 100), 100);
  const metaAtingida = treinosNaSemana >= metaSemanal;

  function foiFeitoHoje(treinoId: string) {
    const hoje = new Date().toDateString();
    return historico.some(
      (h) => h.treinoId === treinoId && new Date(h.dataConclusao).toDateString() === hoje
    );
  }


  // (o find aqui já é redundante já que atividadesVisiveis só tem progresso < 100,
  // mas dá pra deixar assim ou simplificar pra atividadesVisiveis[0])
  const rotinaPendente = rotinas.find((t) => !foiFeitoHoje(t._id));
  const especificaPendente = especificas.find((t) => !foiFeitoHoje(t._id));

  // Nova lista: só o que ainda está "ativo" (não vencido e não finalizado)
  const atividadesVisiveis = atividades.filter(
    (a) => a.progresso < 100 && !atividadeExpirada(a.dataEntrega)
  );

  const atividadePendente = atividadesVisiveis.find((a) => a.progresso < 100);

  const proximoFoco =
    atividadePendente?.titulo ||
    rotinaPendente?.titulo ||
    especificaPendente?.titulo ||
    "Tudo em dia por hoje! 🎉";

  const rotinasFiltradas = rotinas.filter((t) =>
    t.titulo.toLowerCase().includes(busca.toLowerCase())
  );
  const especificasFiltradas = especificas.filter((t) =>
    t.titulo.toLowerCase().includes(busca.toLowerCase())
  );

  if (carregando) {
    return <p className="aluno-home-mensagem">Carregando...</p>;
  }

  // Adicione essa função junto das outras funções auxiliares
  function atividadeExpirada(dataEntregaIso: string) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const entrega = new Date(dataEntregaIso);
    entrega.setHours(0, 0, 0, 0);

    return entrega < hoje;
  }



  return (
    <div className="aluno-home-page">
      <NavegacaoAluno />

      <div className="aluno-home-container">
        {/* COLUNA PRINCIPAL */}
        <main className="aluno-home-main">
          <header className="aluno-home-header-banner">
            <div className="aluno-home-banner-conteudo">
              <div className="aluno-home-header-topo">
                <button
                  type="button"
                  className="aluno-home-avatar-btn"
                  onClick={() => navigate("/aluno/perfil")}
                  aria-label="Meu perfil"
                >
                  {perfil?.foto ? <img src={perfil.foto} alt="Foto de perfil" /> : <span>👤</span>}
                </button>
                <span className="aluno-home-data">{formatarDataHoje()}</span>

                <button
                  type="button"
                  className={`aluno-home-streak ${streakAnimando ? "animando" : ""}`}
                  onClick={() => navigate("/aluno/foguinho")}
                  aria-label="Ver detalhes da sequência"
                >
                  <span className="aluno-home-streak-icone">🔥</span>
                  <span className="aluno-home-streak-numero">
                    {String(perfil?.streakAtual || 0).padStart(2, "0")}
                  </span>
                </button>
              </div>

              <h1 className="aluno-home-nome">{perfil?.nomeSocial || perfil?.nome}</h1>
            </div>

          </header>

          <div className="aluno-home-busca-container">
            <span className="aluno-home-busca-icone">🔍</span>
            <input
              type="text"
              placeholder="Buscar treino ou atividade..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="aluno-home-busca-input"
            />
          </div>

          {atividades.length > 0 && (
            <section className="aluno-home-secao">
              <span className="aluno-home-secao-titulo">Atividade proposta pelo professor</span>

              <div className="aluno-home-atividades-carrossel">
                {atividadesVisiveis.map((atividade) => (
                  <div
                    key={atividade._id}
                    className="aluno-home-atividade-card"
                    onClick={() => navigate(`/aluno/atividades/${atividade._id}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        navigate(`/aluno/atividades/${atividade._id}`);
                      }
                    }}
                  >
                    <span className="aluno-home-atividade-data-entrega">
                      Data de entrega: {formatarDataEntrega(atividade.dataEntrega)}
                    </span>

                    <div className="aluno-home-atividade-corpo">
                      <div className="aluno-home-atividade-midia">
                        {atividade.midiaUrl ? <img src={atividade.midiaUrl} alt="" /> : <span>🖼️</span>}
                      </div>

                      {/* TÍTULO DA ATIVIDADE ADICIONADO AQUI */}
                      <div className="aluno-home-atividade-detalhes">
                        <strong className="aluno-home-atividade-titulo">{atividade.titulo}</strong>

                        <ul className="aluno-home-atividade-exercicios">
                          {atividade.exercicios.slice(0, 3).map((item, indice) => (
                            <li key={indice}>{item.exercicio?.nome || "Exercício"}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="aluno-home-atividade-progresso-linha">
                      <div className="aluno-home-atividade-progresso-topo">
                        <span>Progresso </span>
                        <span className="aluno-home-atividade-progresso-porcentagem">
                          {Math.round(atividade.progresso)}%
                        </span>
                      </div>

                      <div className="aluno-home-atividade-progresso-trilha">
                        <div
                          className="aluno-home-atividade-progresso-barra"
                          style={{ width: `${atividade.progresso}%` }}
                        >
                          {/* Opcional: exibe o texto dentro da barra se ela tiver largura suficiente */}
                          {atividade.progresso > 15 && (
                            <span className="aluno-home-atividade-progresso-texto-interno">
                              {Math.round(atividade.progresso)} %
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="aluno-home-secao">
            <span className="aluno-home-secao-titulo">Rotinas</span>

            {rotinasFiltradas.length === 0 && (
              <p className="aluno-home-mensagem-secao">Nenhuma rotina cadastrada ainda.</p>
            )}

            <div className="aluno-home-treinos-carrossel">
              {rotinasFiltradas.map((rotina) => (
                <button
                  type="button"
                  key={rotina._id}
                  className="aluno-home-treino-card"
                  onClick={() => navigate(`/aluno/rotinas/${rotina._id}`)}
                >
                  <span className="aluno-home-treino-icone">🏃</span>
                  <span className="aluno-home-treino-nome">{rotina.titulo}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="aluno-home-secao">
            <span className="aluno-home-secao-titulo">Atividades específicas</span>

            {especificasFiltradas.length === 0 && (
              <p className="aluno-home-mensagem-secao">Nenhuma atividade específica cadastrada ainda.</p>
            )}

            <div className="aluno-home-treinos-grade">
              {especificasFiltradas.map((treino) => (
                <button
                  type="button"
                  key={treino._id}
                  className="aluno-home-treino-card"
                  onClick={() => concluirTreino(treino._id)}
                  disabled={treinoConcluindo === treino._id}
                >
                  <span className="aluno-home-treino-icone">🏋️</span>
                  <span className="aluno-home-treino-nome">{treino.titulo}</span>
                </button>
              ))}
            </div>
          </section>
        </main>

        {/* PAINEL LATERAL DIREITA */}
        <aside className="aluno-home-sidebar-direita">
          <div className="aluno-widget-card">
            <h3 className="aluno-widget-titulo">Resumo Semanal</h3>
            <div className="aluno-widget-dias">
              {diasSemana.map((dia, idx) => (
                <div
                  key={idx}
                  className={`aluno-dia-item ${dia.concluido ? "concluido" : ""} ${dia.eHoje ? "ativo" : ""}`}
                >
                  <span>{dia.sigla}</span>
                  <div className="aluno-dia-dot">{dia.concluido ? "✓" : ""}</div>
                </div>
              ))}
            </div>
          </div>

          <div className={`aluno-widget-card ${metaAtingida ? "meta-atingida" : ""}`}>
            <div className="aluno-widget-topo">
              <h3 className="aluno-widget-titulo">
                {metaAtingida && <span className="aluno-meta-trofeu">🏆</span>}
                Meta da Semana
              </h3>
              <span className="aluno-widget-badge">
                {treinosNaSemana} / {metaSemanal} Treinos
              </span>
            </div>
            <div
              className={`aluno-home-atividade-progresso-trilha ${metaAtingida ? "trilha-dourada" : ""}`}
              style={{ marginTop: "12px" }}
            >
              <div
                className={`aluno-home-atividade-progresso-barra ${metaAtingida ? "barra-dourada" : ""}`}
                style={{ width: `${porcentagemMeta}%` }}
              />
            </div>
            <p className={`aluno-widget-subtexto ${metaAtingida ? "texto-celebracao" : ""}`}>
              {metaAtingida
                ? "🎉 Parabéns! Você bateu sua meta semanal!"
                : `Faltam ${metaSemanal - treinosNaSemana} treinos para bater sua meta semanal!`}
            </p>

            {metaAtingida && (
              <span className="aluno-meta-selo" title="Meta batida!">
                🏅
              </span>
            )}

            {metaAtingida && (
              <div className="aluno-confete-container">
                {Array.from({ length: 16 }).map((_, i) => (
                  <span
                    key={i}
                    className="aluno-confete-peca"
                    style={{
                      left: `${i * 6.5}%`,
                      backgroundColor: `hsl(${i * 23}, 85%, 60%)`,
                      animationDelay: `${i * 0.04}s`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="aluno-widget-card destaque-laranja">
            <span className="aluno-widget-tag">Próximo Foco</span>
            <h4 className="aluno-widget-destaque-titulo">{proximoFoco}</h4>
            <p className="aluno-widget-destaque-desc">Recomendado para a sua rotina atual.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
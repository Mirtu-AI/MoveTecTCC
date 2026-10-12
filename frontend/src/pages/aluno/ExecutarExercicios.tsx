import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./ExecutarAtividade.css";

interface ExercicioItem {
  exercicioId: string;
  concluido: boolean;
  formatoMedida?: string;
  series?: string;
  repeticoes?: string;
  tempo?: string;
  distancia?: string;
  descanso?: string;
  carga?: string;
  notas?: string;
  exercicio: {
    nome: string;
    midiaUrl: string | null;
    tempoEstimado: number | null;
    orientacoes?: string;
    adaptacoes?: string;
  } | null;
}

interface Dados {
  titulo?: string;
  exercicios: ExercicioItem[];
}

interface Props {
  tipo: "atividade" | "treino";
}

function extrairSegundosDoTexto(texto?: string | null): number | null {
  if (!texto) return null;
  const limpo = texto.toLowerCase().trim();
  const matchMin = limpo.match(/(\d+)\s*(min|m(?!s|e))/);
  if (matchMin) {
    return parseInt(matchMin[1], 10) * 60;
  }
  const matchSeg = limpo.match(/(\d+)/);
  if (matchSeg) {
    const valor = parseInt(matchSeg[1], 10);
    return valor > 0 ? valor : null;
  }
  return null;
}

export default function ExecutarExercicios({ tipo }: Props) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [dados, setDados] = useState<Dados | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [avancando, setAvancando] = useState(false);

  // Mapa de séries concluídas: chave = `${exercicioIdx}-${serieIdx}`
  const [seriesFeitas, setSeriesFeitas] = useState<Record<string, boolean>>({});

  // Cronômetro embutido na linha da série
  const [timerAtivoChave, setTimerAtivoChave] = useState<string | null>(null);
  const [temposRestantes, setTemposRestantes] = useState<Record<string, number>>({});

  const baseUrl =
    tipo === "atividade"
      ? `http://localhost:3000/api/aluno/atividades/${id}`
      : `http://localhost:3000/api/aluno/execucoes-treino/${id}`;

  useEffect(() => {
    buscarDados();
  }, [id]);

  async function buscarDados() {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(baseUrl, { headers: { Authorization: `Bearer ${token}` } });
      const recebido: Dados | null =
        (tipo === "atividade" ? response.data.atividade : response.data.execucao) || null;
      setDados(recebido);

      if (recebido) {
        const estadoInicialSeries: Record<string, boolean> = {};
        const estadoInicialTempos: Record<string, number> = {};

        recebido.exercicios.forEach((item, exIdx) => {
          const qtdSeries = obterQuantidadeSeries(item);
          const segs = obterSegundosExercicio(item);

          for (let s = 0; s < qtdSeries; s++) {
            const chave = `${exIdx}-${s}`;
            estadoInicialSeries[chave] = Boolean(item.concluido);
            if (segs > 0) {
              estadoInicialTempos[chave] = segs;
            }
          }
        });

        setSeriesFeitas(estadoInicialSeries);
        setTemposRestantes(estadoInicialTempos);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCarregando(false);
    }
  }

  function obterQuantidadeSeries(item: ExercicioItem): number {
    if (!item.series) return 1;
    const n = parseInt(item.series, 10);
    return !isNaN(n) && n > 0 && n <= 20 ? n : 1;
  }

  function obterSegundosExercicio(item: ExercicioItem): number {
    const doTreino = extrairSegundosDoTexto(item.tempo);
    if (doTreino) return doTreino;
    return item.exercicio?.tempoEstimado ?? 0;
  }

  // Para o cronômetro ao trocar de exercício
  useEffect(() => {
    setTimerAtivoChave(null);
  }, [indiceAtual]);

  // Tick do cronômetro ativo
  useEffect(() => {
    if (!timerAtivoChave) return;

    const intervalo = setInterval(() => {
      setTemposRestantes((atual) => {
        const restante = atual[timerAtivoChave] ?? 0;
        if (restante <= 1) {
          setTimerAtivoChave(null);
          const [exIdxStr, sIdxStr] = timerAtivoChave.split("-");
          marcarSerieAutomatica(parseInt(exIdxStr, 10), parseInt(sIdxStr, 10));
          return { ...atual, [timerAtivoChave]: 0 };
        }
        return { ...atual, [timerAtivoChave]: restante - 1 };
      });
    }, 1000);

    return () => clearInterval(intervalo);
  }, [timerAtivoChave, dados]);

  function marcarSerieAutomatica(exIdx: number, sIdx: number) {
    const chave = `${exIdx}-${sIdx}`;
    setSeriesFeitas((prev) => ({ ...prev, [chave]: true }));
  }

  function alternarSerie(exIdx: number, sIdx: number) {
    const chave = `${exIdx}-${sIdx}`;
    const novoValor = !seriesFeitas[chave];

    if (timerAtivoChave === chave && novoValor) {
      setTimerAtivoChave(null);
    }

    setSeriesFeitas((prev) => ({ ...prev, [chave]: novoValor }));
  }

  function alternarTimer(exIdx: number, sIdx: number, segundosPadrao: number) {
    const chave = `${exIdx}-${sIdx}`;
    if (timerAtivoChave === chave) {
      setTimerAtivoChave(null);
    } else {
      const atual = temposRestantes[chave] ?? segundosPadrao;
      if (atual <= 0) {
        setTemposRestantes((prev) => ({ ...prev, [chave]: segundosPadrao }));
      }
      setTimerAtivoChave(chave);
    }
  }

  function formatarTempo(segundos: number) {
    const min = Math.floor(segundos / 60);
    const seg = segundos % 60;
    return `${String(min).padStart(2, "0")}:${String(seg).padStart(2, "0")}`;
  }

  function obterDescricaoSerie(item: ExercicioItem): string {
    const partes: string[] = [];
    if (item.repeticoes) partes.push(`${item.repeticoes} reps`);
    if (item.tempo) partes.push(`${item.tempo}`);
    if (item.distancia) partes.push(`${item.distancia}`);
    if (item.carga) partes.push(`${item.carga}`);

    if (partes.length === 0) {
      if (item.exercicio?.tempoEstimado) {
        return `${item.exercicio.tempoEstimado}s`;
      }
      return "Executar movimento";
    }
    return partes.join(" • ");
  }

  function voltarExercicio() {
    if (indiceAtual > 0) {
      setIndiceAtual((a) => a - 1);
    }
  }

  async function avancarOuFinalizar() {
    if (!dados || avancando) return;
    const item = dados.exercicios[indiceAtual];
    if (!item) return;

    setAvancando(true);
    setTimerAtivoChave(null);

    try {
      // Marca todas as séries deste exercício como feitas visualmente
      const qtd = obterQuantidadeSeries(item);
      setSeriesFeitas((prev) => {
        const copia = { ...prev };
        for (let s = 0; s < qtd; s++) {
          copia[`${indiceAtual}-${s}`] = true;
        }
        return copia;
      });

      // Sincroniza este exercício com o backend
      if (!item.concluido) {
        const token = localStorage.getItem("token");
        await axios.put(
          `${baseUrl}/exercicios/${item.exercicioId}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setDados((atual) => {
          if (!atual) return atual;
          return {
            ...atual,
            exercicios: atual.exercicios.map((ex, i) =>
              i === indiceAtual ? { ...ex, concluido: true } : ex
            ),
          };
        });
      }

      const ultimo = indiceAtual === dados.exercicios.length - 1;
      if (ultimo) {
        if (tipo === "atividade") {
          navigate(`/aluno/atividades/${id}/anexar-video`);
        } else {
          navigate(`/aluno/execucoes-treino/${id}/parabens`);
        }
      } else {
        setIndiceAtual((a) => a + 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAvancando(false);
    }
  }

  if (carregando) return <p className="executar-atividade-mensagem">Carregando...</p>;
  if (!dados || !dados.exercicios[indiceAtual]) {
    return <p className="executar-atividade-mensagem">Treino não encontrado.</p>;
  }

  const totalExercicios = dados.exercicios.length;
  const itemAtual = dados.exercicios[indiceAtual];
  const qtdSeries = obterQuantidadeSeries(itemAtual);
  const segsExercicio = obterSegundosExercicio(itemAtual);
  const descricaoSerie = obterDescricaoSerie(itemAtual);
  const ultimoExercicio = indiceAtual === totalExercicios - 1;

  const seriesDesteExercicioFeitas = Array.from({ length: qtdSeries }).filter(
    (_, sIdx) => seriesFeitas[`${indiceAtual}-${sIdx}`]
  ).length;
  const exercicioAtualCompleto = seriesDesteExercicioFeitas === qtdSeries;

  const progressoEtapas = Math.round(((indiceAtual + (exercicioAtualCompleto ? 1 : 0)) / totalExercicios) * 100);

  return (
    <div className="executar-atividade-page">
      <header className="executar-atividade-header">
        <button
          className="executar-atividade-voltar-topo"
          onClick={() => navigate(-1)}
          aria-label="Sair"
        >
          ←
        </button>
        <div className="executar-header-info">
          <h1>{dados.titulo || "Execução"}</h1>
          <span className="executar-header-sub">
            Exercício {indiceAtual + 1} de {totalExercicios}
          </span>
        </div>
      </header>

      {/* BARRA DE PROGRESSO NO TOPO */}
      <div className="executar-progresso-barra-trilha">
        <div
          className="executar-progresso-barra-preenchimento"
          style={{ width: `${progressoEtapas}%` }}
        />
      </div>

      <main className="executar-checklist-container">
        {/* INDICADOR DE ETAPAS (1, 2, 3...) */}
        {totalExercicios > 1 && (
          <div className="executar-etapas-pills">
            {dados.exercicios.map((ex, idx) => {
              const ativo = idx === indiceAtual;
              const feito = ex.concluido || idx < indiceAtual;
              return (
                <button
                  key={ex.exercicioId || idx}
                  type="button"
                  className={`executar-etapa-pill ${ativo ? "ativo" : ""} ${feito ? "feito" : ""}`}
                  onClick={() => setIndiceAtual(idx)}
                >
                  {feito && !ativo ? "✓" : idx + 1}
                </button>
              );
            })}
          </div>
        )}

        {/* CARD DO EXERCÍCIO ATUAL */}
        <div className={`executar-card-exercicio ${exercicioAtualCompleto ? "completo" : ""}`}>
          <div className="executar-card-topo">
            <div className="executar-card-titulo-wrap">
              <span className="executar-card-numero">{indiceAtual + 1}</span>
              <div>
                <h2 className="executar-card-nome">
                  {itemAtual.exercicio?.nome || "Exercício"}
                </h2>
                {itemAtual.descanso && (
                  <span className="executar-card-descanso">
                    ⏸ Descanso entre séries: {itemAtual.descanso}
                  </span>
                )}
              </div>
            </div>

            {itemAtual.exercicio?.midiaUrl && (
              <a
                href={itemAtual.exercicio.midiaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="executar-card-video-link"
                title="Ver vídeo demonstrativo"
              >
                ▶ Vídeo
              </a>
            )}
          </div>

          {itemAtual.notas && (
            <p className="executar-card-nota">💡 {itemAtual.notas}</p>
          )}

          {/* CHECKLIST DAS SÉRIES DESTE EXERCÍCIO */}
          <div className="executar-series-lista">
            {Array.from({ length: qtdSeries }).map((_, sIdx) => {
              const chave = `${indiceAtual}-${sIdx}`;
              const feita = Boolean(seriesFeitas[chave]);
              const tempoRestante = temposRestantes[chave] ?? segsExercicio;
              const rodando = timerAtivoChave === chave;

              return (
                <div
                  key={chave}
                  className={`executar-serie-linha ${feita ? "feita" : ""} ${
                    rodando ? "rodando" : ""
                  }`}
                >
                  <button
                    type="button"
                    className="executar-serie-check-area"
                    onClick={() => alternarSerie(indiceAtual, sIdx)}
                  >
                    <span className={`executar-checkbox ${feita ? "marcado" : ""}`}>
                      {feita ? "✓" : ""}
                    </span>
                    <span className="executar-serie-label">
                      {qtdSeries > 1 ? `${sIdx + 1}ª Série` : "Série única"}
                    </span>
                    <span className="executar-serie-meta">{descricaoSerie}</span>
                  </button>

                  {segsExercicio > 0 && !feita && (
                    <button
                      type="button"
                      className={`executar-serie-timer-btn ${rodando ? "ativo" : ""}`}
                      onClick={() => alternarTimer(indiceAtual, sIdx, segsExercicio)}
                    >
                      {rodando ? "⏸" : "▶"} {formatarTempo(tempoRestante)}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* BOTÕES DE NAVEGAÇÃO ENTRE EXERCÍCIOS */}
        <div className="executar-navegacao-rodape">
          <button
            type="button"
            className="executar-btn-anterior"
            onClick={voltarExercicio}
            disabled={indiceAtual === 0 || avancando}
          >
            ← Anterior
          </button>

          <button
            type="button"
            className={`executar-btn-proximo ${exercicioAtualCompleto ? "pronto" : ""}`}
            onClick={avancarOuFinalizar}
            disabled={avancando}
          >
            {avancando
              ? "Salvando..."
              : ultimoExercicio
              ? "🎉 Finalizar Treino"
              : exercicioAtualCompleto
              ? "Próximo Exercício →"
              : "Concluir e Avançar →"}
          </button>
        </div>
      </main>
    </div>
  );
}
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./DesempenhoAluno.css";

interface Conquista {
  id: string;
  nome: string;
  desbloqueada: boolean;
}

interface Desempenho {
  totalRealizadas: number;
  realizadasOntem: number;
  diferencaMesAnterior: number;
  conquistas: Conquista[];
}

interface HistoricoTreino {
  treinoId: string;
  dataConclusao: string;
}

interface Perfil {
  streakAtual?: number;
}

export default function DesempenhoAluno() {
  const navigate = useNavigate();

  const [desempenho, setDesempenho] = useState<Desempenho | null>(null);
  const [historico, setHistorico] = useState<HistoricoTreino[]>([]);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [carregando, setCarregando] = useState(true);

  const [mesAtual, setMesAtual] = useState(() => {
    const hoje = new Date();
    return new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  });

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const token = localStorage.getItem("token");
      const cabecalho = { headers: { Authorization: `Bearer ${token}` } };

      const [respDesempenho, respHistorico, respPerfil] = await Promise.all([
        axios.get("http://localhost:3000/api/aluno/desempenho", cabecalho),
        axios.get("http://localhost:3000/api/aluno/historico", cabecalho),
        axios.get("http://localhost:3000/api/aluno/perfil", cabecalho),
      ]);

      setDesempenho(respDesempenho.data.desempenho || null);
      setHistorico(respHistorico.data.historico || []);
      setPerfil(respPerfil.data.aluno || null);
    } catch (err) {
      console.error(err);
    } finally {
      setCarregando(false);
    }
  }

  // ---------- Últimos 14 dias ----------
  const ultimos14Dias = useMemo(() => {
    const dias: { data: Date; label: string; total: number }[] = [];
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    for (let i = 13; i >= 0; i--) {
      const data = new Date(hoje);
      data.setDate(hoje.getDate() - i);
      const inicioDia = new Date(data);
      const fimDia = new Date(data);
      fimDia.setDate(fimDia.getDate() + 1);

      const total = historico.filter((h) => {
        const dataConclusao = new Date(h.dataConclusao);
        return dataConclusao >= inicioDia && dataConclusao < fimDia;
      }).length;

      dias.push({
        data,
        label: data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        total,
      });
    }

    return dias;
  }, [historico]);

  const maiorTotalNoPeriodo = Math.max(1, ...ultimos14Dias.map((d) => d.total));

  // ---------- Distribuição por dia da semana ----------
  const distribuicaoSemana = useMemo(() => {
    const nomesDias = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const contagem = new Array(7).fill(0);

    historico.forEach((h) => {
      const diaSemana = new Date(h.dataConclusao).getDay();
      contagem[diaSemana]++;
    });

    return nomesDias.map((nome, idx) => ({ nome, total: contagem[idx] }));
  }, [historico]);

  const maiorTotalSemana = Math.max(1, ...distribuicaoSemana.map((d) => d.total));
  const diaMaisAtivo = distribuicaoSemana.reduce((maior, atual) =>
    atual.total > maior.total ? atual : maior
  );

  // ---------- Calendário do mês ----------
  const diasComTreino = useMemo(() => {
    const set = new Set<string>();
    historico.forEach((h) => {
      const data = new Date(h.dataConclusao);
      set.add(`${data.getFullYear()}-${data.getMonth()}-${data.getDate()}`);
    });
    return set;
  }, [historico]);

  function irParaMesAnterior() {
    setMesAtual((atual) => new Date(atual.getFullYear(), atual.getMonth() - 1, 1));
  }

  function irParaProximoMes() {
    setMesAtual((atual) => new Date(atual.getFullYear(), atual.getMonth() + 1, 1));
  }

  function gerarDiasDoMes() {
    const ano = mesAtual.getFullYear();
    const mes = mesAtual.getMonth();
    const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
    const totalDias = new Date(ano, mes + 1, 0).getDate();

    const dias: (number | null)[] = [];
    for (let i = 0; i < primeiroDiaSemana; i++) dias.push(null);
    for (let dia = 1; dia <= totalDias; dia++) dias.push(dia);
    return dias;
  }

  function formatarMesAno() {
    return mesAtual.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  }

  const hoje = new Date();
  const diasDoMes = gerarDiasDoMes();
  const nomesDiasSemanaAbreviados = ["D", "S", "T", "Q", "Q", "S", "S"];

  // ---------- Total no mês exibido ----------
  const totalNoMesExibido = useMemo(() => {
    return historico.filter((h) => {
      const data = new Date(h.dataConclusao);
      return data.getFullYear() === mesAtual.getFullYear() && data.getMonth() === mesAtual.getMonth();
    }).length;
  }, [historico, mesAtual]);

  if (carregando) {
    return <p className="historico-mensagem">Carregando...</p>;
  }

  return (
    <div className="historico-page">
      <header className="historico-header">
        <button className="historico-voltar" onClick={() => navigate(-1)} aria-label="Voltar">
          ←
        </button>
        <h1>Desempenho</h1>
      </header>

      <main className="historico-conteudo">
        {/* Cards de resumo */}
        <div className="historico-cards-resumo">
          <div className="historico-card-resumo">
            <span className="historico-card-numero">{desempenho?.totalRealizadas ?? 0}</span>
            <span className="historico-card-label">Atividades realizadas</span>
          </div>
          <div className="historico-card-resumo">
            <span className="historico-card-numero">{desempenho?.realizadasOntem ?? 0}</span>
            <span className="historico-card-label">Ontem</span>
          </div>
          <div className="historico-card-resumo historico-card-streak">
            <span className="historico-card-numero">🔥 {perfil?.streakAtual ?? 0}</span>
            <span className="historico-card-label">Sequência atual</span>
          </div>
          <div className="historico-card-resumo">
            <span className={`historico-card-numero ${(desempenho?.diferencaMesAnterior ?? 0) >= 0 ? "positivo" : "negativo"}`}>
              {(desempenho?.diferencaMesAnterior ?? 0) >= 0 ? "+" : ""}
              {desempenho?.diferencaMesAnterior ?? 0}
            </span>
            <span className="historico-card-label">Vs. mês anterior</span>
          </div>
        </div>

        {/* Gráfico últimos 14 dias */}
        <section className="historico-secao">
          <span className="historico-secao-titulo">Últimos 14 dias</span>
          <div className="historico-grafico-barras">
            {ultimos14Dias.map((dia, idx) => (
              <div key={idx} className="historico-barra-coluna">
                <div className="historico-barra-trilha">
                  <div
                    className={`historico-barra ${dia.total > 0 ? "ativa" : ""}`}
                    style={{ height: `${(dia.total / maiorTotalNoPeriodo) * 100}%` }}
                  >
                    {dia.total > 0 && <span className="historico-barra-valor">{dia.total}</span>}
                  </div>
                </div>
                <span className="historico-barra-label">{dia.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Distribuição por dia da semana */}
        <section className="historico-secao">
          <span className="historico-secao-titulo">
            Seus dias mais ativos {diaMaisAtivo.total > 0 && `— costume treinar mais ${diaMaisAtivo.nome.toLowerCase()}s`}
          </span>
          <div className="historico-grafico-barras historico-grafico-semana">
            {distribuicaoSemana.map((dia, idx) => (
              <div key={idx} className="historico-barra-coluna">
                <div className="historico-barra-trilha">
                  <div
                    className={`historico-barra ${dia.total === diaMaisAtivo.total && dia.total > 0 ? "destaque" : ""} ${dia.total > 0 ? "ativa" : ""}`}
                    style={{ height: `${(dia.total / maiorTotalSemana) * 100}%` }}
                  >
                    {dia.total > 0 && <span className="historico-barra-valor">{dia.total}</span>}
                  </div>
                </div>
                <span className="historico-barra-label">{dia.nome}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Calendário */}
        <section className="historico-secao">
          <div className="historico-calendario-topo">
            <span className="historico-secao-titulo">Calendário</span>
            <span className="historico-calendario-total">{totalNoMesExibido} atividades no mês</span>
          </div>

          <div className="historico-calendario">
            <div className="historico-calendario-navegacao-topo">
              <span className="historico-mes-nome">{formatarMesAno()}</span>
              <div className="historico-calendario-navegacao">
                <button type="button" onClick={irParaMesAnterior} aria-label="Mês anterior">‹</button>
                <button type="button" onClick={irParaProximoMes} aria-label="Próximo mês">›</button>
              </div>
            </div>

            <div className="historico-calendario-grade historico-calendario-cabecalho">
              {nomesDiasSemanaAbreviados.map((sigla, idx) => (
                <span key={idx}>{sigla}</span>
              ))}
            </div>

            <div className="historico-calendario-grade">
              {diasDoMes.map((dia, idx) => {
                if (dia === null) return <span key={idx} className="historico-dia-vazio" />;

                const chave = `${mesAtual.getFullYear()}-${mesAtual.getMonth()}-${dia}`;
                const teveTreino = diasComTreino.has(chave);
                const eHoje =
                  dia === hoje.getDate() &&
                  mesAtual.getMonth() === hoje.getMonth() &&
                  mesAtual.getFullYear() === hoje.getFullYear();

                return (
                  <div
                    key={idx}
                    className={`historico-dia ${eHoje ? "historico-dia-hoje" : ""} ${teveTreino ? "historico-dia-treino" : ""}`}
                  >
                    <span>{dia}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Conquistas */}
        {desempenho?.conquistas && desempenho.conquistas.length > 0 && (
          <section className="historico-secao">
            <span className="historico-secao-titulo">Conquistas</span>
            <div className="historico-conquistas">
              {desempenho.conquistas.map((conquista) => (
                <span
                  key={conquista.id}
                  className={`historico-medalha-wrap ${conquista.desbloqueada ? "desbloqueada" : ""}`}
                >
                  <span className="historico-medalha">🎖️</span>
                  <span className="historico-medalha-tooltip">{conquista.nome}</span>
                </span>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
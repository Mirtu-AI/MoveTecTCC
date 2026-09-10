import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./TelaFoguinho.css";

interface Perfil {
  nome: string;
  apelidoStreak?: string | null;
  streakAtual?: number;
}

interface HistoricoTreino {
  treinoId: string;
  dataConclusao: string;
}

export default function TelaFoguinho() {
  const navigate = useNavigate();

  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [historico, setHistorico] = useState<HistoricoTreino[]>([]);
  const [carregando, setCarregando] = useState(true);

  const [editandoApelido, setEditandoApelido] = useState(false);
  const [apelido, setApelido] = useState("");
  const [salvandoApelido, setSalvandoApelido] = useState(false);

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

      const [respPerfil, respHistorico] = await Promise.all([
        axios.get("http://localhost:3000/api/aluno/perfil", cabecalho),
        axios.get("http://localhost:3000/api/aluno/historico", cabecalho).catch(() => ({ data: { historico: [] } })),
      ]);

      const aluno = respPerfil.data.aluno;
      setPerfil(aluno);
      setApelido(aluno?.apelidoStreak || "Foguinho");
      setHistorico(respHistorico.data.historico || []);
    } catch (err) {
      console.error(err);
    } finally {
      setCarregando(false);
    }
  }

  async function salvarApelido() {
    const valor = apelido.trim();
    if (!valor) return;

    setSalvandoApelido(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "http://localhost:3000/api/aluno/apelido-streak",
        { apelido: valor },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPerfil((atual) => (atual ? { ...atual, apelidoStreak: valor } : atual));
      setEditandoApelido(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSalvandoApelido(false);
    }
  }

  // Marca em quais dias (ano-mês-dia) o aluno concluiu algum treino
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
  const nomesDiasSemana = ["D", "S", "T", "Q", "Q", "S", "S"];

  if (carregando) {
    return <p className="foguinho-mensagem">Carregando...</p>;
  }

  return (
    <div className="foguinho-page">
      <header className="foguinho-header">
        <button className="foguinho-voltar" onClick={() => navigate(-1)} aria-label="Voltar">
          ←
        </button>

        {editandoApelido ? (
          <input
            type="text"
            className="foguinho-apelido-input"
            value={apelido}
            maxLength={20}
            autoFocus
            onChange={(e) => setApelido(e.target.value)}
            onBlur={salvarApelido}
            onKeyDown={(e) => {
              if (e.key === "Enter") salvarApelido();
            }}
            disabled={salvandoApelido}
          />
        ) : (
          <button type="button" className="foguinho-apelido-btn" onClick={() => setEditandoApelido(true)}>
            {apelido.toUpperCase()} <span className="foguinho-apelido-lapis">✏️</span>
          </button>
        )}
      </header>

      <main className="foguinho-conteudo">
        <div className="foguinho-icone-grande">🔥</div>

        <p className="foguinho-texto">
          Sequência atual: {perfil?.streakAtual || 0} dia{(perfil?.streakAtual || 0) === 1 ? "" : "s"}
        </p>

        <div className="foguinho-calendario">
          <div className="foguinho-calendario-topo">
            <span className="foguinho-mes-nome">{formatarMesAno()}</span>
            <div className="foguinho-calendario-navegacao">
              <button type="button" onClick={irParaMesAnterior} aria-label="Mês anterior">‹</button>
              <button type="button" onClick={irParaProximoMes} aria-label="Próximo mês">›</button>
            </div>
          </div>

          <div className="foguinho-calendario-grade foguinho-calendario-cabecalho">
            {nomesDiasSemana.map((sigla, idx) => (
              <span key={idx}>{sigla}</span>
            ))}
          </div>

          <div className="foguinho-calendario-grade">
            {diasDoMes.map((dia, idx) => {
              if (dia === null) return <span key={idx} className="foguinho-dia-vazio" />;

              const chave = `${mesAtual.getFullYear()}-${mesAtual.getMonth()}-${dia}`;
              const teveTreino = diasComTreino.has(chave);
              const eHoje =
                dia === hoje.getDate() &&
                mesAtual.getMonth() === hoje.getMonth() &&
                mesAtual.getFullYear() === hoje.getFullYear();

              return (
                <div
                  key={idx}
                  className={`foguinho-dia ${eHoje ? "foguinho-dia-hoje" : ""} ${teveTreino ? "foguinho-dia-treino" : ""}`}
                >
                  <span>{dia}</span>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
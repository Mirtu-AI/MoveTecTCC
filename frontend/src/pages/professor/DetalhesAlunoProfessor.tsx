import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./DetalhesAlunoProfessor.css";

const OBJETIVOS_OPCOES = [
  { valor: "perder-peso", label: "Perder peso", emoji: "🔥" },
  { valor: "ganhar-massa", label: "Ganhar massa muscular", emoji: "💪" },
  { valor: "melhorar-condicionamento", label: "Melhorar condicionamento", emoji: "🏃" },
  { valor: "manter-ativo", label: "Manter-se ativo", emoji: "😊" },
  { valor: "sem-objetivo", label: "Sem objetivo definido", emoji: "❓" },
];

interface Aluno {
  _id?: string;
  nome: string;
  email: string;
  salaId?: string;
  salaNome: string;
  objetivo?: string | null;
}

interface Atividade {
  _id: string;
  titulo: string;
  status: "andamento" | "entregue";
  dataEntrega: string;
}

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

export default function DetalhesAlunoProfessor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [aluno, setAluno] = useState<Aluno | null>(null);
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [desempenho, setDesempenho] = useState<Desempenho | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [informacoesAbertas, setInformacoesAbertas] = useState(false);
  const [desempenhoAberto, setDesempenhoAberto] = useState(false);

  useEffect(() => {
    buscarDados();
  }, [id]);

  async function buscarDados() {
    try {
      const token = localStorage.getItem("token");
      const cabecalho = { headers: { Authorization: `Bearer ${token}` } };

      const [responseAluno, responseAtividades, responseDesempenho] = await Promise.all([
        axios.get(`http://localhost:3000/api/professor/alunos/${id}`, cabecalho),
        axios.get(`http://localhost:3000/api/professor/alunos/${id}/atividades`, cabecalho),
        axios.get(`http://localhost:3000/api/professor/alunos/${id}/desempenho`, cabecalho).catch(() => ({ data: { desempenho: null } })),
      ]);
      setAluno(responseAluno.data.aluno || null);
      setAtividades(responseAtividades.data.atividades || []);
      setDesempenho(responseDesempenho.data.desempenho || null);
    } catch (err) {
      console.error(err);
    } finally {
      setCarregando(false);
    }
  }

  function formatarData(dataIso: string) {
    const data = new Date(dataIso);
    return data.toLocaleDateString("pt-BR", { timeZone: "UTC" });
  }

  function obterStatusExibicao(atividade: Atividade) {
    if (atividade.status === "entregue") {
      return { texto: "Entregue", classe: "entregue" };
    }

    const prazoVencido = new Date(atividade.dataEntrega) < new Date();
    if (prazoVencido) {
      return { texto: "Não foi entregue", classe: "nao-entregue" };
    }

    return { texto: "Andamento", classe: "andamento" };
  }

  function handleVoltar() {
    if (aluno?.salaId) {
      navigate(`/professor/sala/${aluno.salaId}`);
    } else {
      navigate(-1);
    }
  }

  function obterObjetivoLabel(objetivo?: string | null) {
    if (!objetivo) return { label: 'Não definido', emoji: '—' };
    const obj = OBJETIVOS_OPCOES.find((o) => o.valor === objetivo);
    return obj ? { label: obj.label, emoji: obj.emoji } : { label: objetivo, emoji: '🎯' };
  }

  const atividadesOrdenadas = [...atividades].sort((a, b) =>
    b._id.localeCompare(a._id)
  );

  const conquistasDesbloqueadas = desempenho?.conquistas.filter((c) => c.desbloqueada) || [];

  if (carregando) {
    return <p className="detalhes-aluno-mensagem">Carregando...</p>;
  }

  if (!aluno) {
    return <p className="detalhes-aluno-mensagem">Aluno não encontrado.</p>;
  }

  const objetivoInfo = obterObjetivoLabel(aluno.objetivo);

  return (
    <div className="detalhes-aluno-page">
      <header className="detalhes-aluno-header">
        <button
          className="detalhes-aluno-voltar"
          onClick={handleVoltar}
          aria-label="Voltar para a lista de alunos"
        >
          ←
        </button>
        <h1>{aluno.nome}</h1>
      </header>

      <main className="detalhes-aluno-conteudo">
        <div className="detalhes-aluno-coluna-info">
          <div className="detalhes-aluno-avatar">👤</div>

          {/* INFORMAÇÕES DO ALUNO */}
          <button
            type="button"
            className="detalhes-aluno-info-toggle"
            onClick={() => setInformacoesAbertas((atual) => !atual)}
          >
            Informações do(a) aluno(a)
            <span className={`detalhes-aluno-seta ${informacoesAbertas ? "aberta" : ""}`}>▾</span>
          </button>

          <div className={`detalhes-aluno-info-corpo ${informacoesAbertas ? "aberta" : ""}`}>
            <div className="detalhes-aluno-campo">
              <span className="detalhes-aluno-label">Email</span>
              <div className="detalhes-aluno-valor">{aluno.email}</div>
            </div>

            <div className="detalhes-aluno-campo">
              <span className="detalhes-aluno-label">Sala</span>
              <div className="detalhes-aluno-valor">{aluno.salaNome}</div>
            </div>

            <div className="detalhes-aluno-campo">
              <span className="detalhes-aluno-label">Objetivo</span>
              <div className="detalhes-aluno-valor detalhes-aluno-objetivo">
                <span>{objetivoInfo.emoji}</span>
                <span>{objetivoInfo.label}</span>
              </div>
            </div>
          </div>

          {/* RESUMO DE DESEMPENHO */}
          <button
            type="button"
            className="detalhes-aluno-info-toggle"
            onClick={() => setDesempenhoAberto((atual) => !atual)}
          >
            Resumo de desempenho
            <span className={`detalhes-aluno-seta ${desempenhoAberto ? "aberta" : ""}`}>▾</span>
          </button>

          <div className={`detalhes-aluno-info-corpo ${desempenhoAberto ? "aberta" : ""}`}>
            {desempenho ? (
              <>
                <div className="detalhes-aluno-desempenho-cards">
                  <div className="detalhes-aluno-desemp-card">
                    <span className="detalhes-aluno-desemp-numero">{desempenho.totalRealizadas}</span>
                    <span className="detalhes-aluno-desemp-label">Atividades realizadas</span>
                  </div>
                  <div className="detalhes-aluno-desemp-card">
                    <span className="detalhes-aluno-desemp-numero">{desempenho.realizadasOntem}</span>
                    <span className="detalhes-aluno-desemp-label">Realizadas ontem</span>
                  </div>
                  <div className={`detalhes-aluno-desemp-card ${desempenho.diferencaMesAnterior >= 0 ? 'positivo' : 'negativo'}`}>
                    <span className="detalhes-aluno-desemp-numero">
                      {desempenho.diferencaMesAnterior >= 0 ? '+' : ''}{desempenho.diferencaMesAnterior}
                    </span>
                    <span className="detalhes-aluno-desemp-label">vs. mês anterior</span>
                  </div>
                  <div className="detalhes-aluno-desemp-card">
                    <span className="detalhes-aluno-desemp-numero">{conquistasDesbloqueadas.length}</span>
                    <span className="detalhes-aluno-desemp-label">Conquistas</span>
                  </div>
                </div>

                {conquistasDesbloqueadas.length > 0 && (
                  <div className="detalhes-aluno-conquistas">
                    <span className="detalhes-aluno-label">Conquistas desbloqueadas</span>
                    <div className="detalhes-aluno-conquistas-lista">
                      {conquistasDesbloqueadas.map((c) => (
                        <span key={c.id} className="detalhes-aluno-conquista-badge">
                          🏅 {c.nome}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="detalhes-aluno-mensagem-atividades">Dados de desempenho indisponíveis.</p>
            )}
          </div>
        </div>

        {/* ATIVIDADES */}
        <div className="detalhes-aluno-coluna-atividades">
          <div className="detalhes-aluno-atividades-topo">
            <span>Atividades</span>
            <span className="detalhes-aluno-atividades-status-label">Status</span>
          </div>

          {atividadesOrdenadas.length === 0 && (
            <p className="detalhes-aluno-mensagem-atividades">
              Nenhuma atividade cadastrada ainda.
            </p>
          )}

          <div className="detalhes-aluno-atividades-lista">
            {atividadesOrdenadas.map((atividade) => {
              const statusExibicao = obterStatusExibicao(atividade);
              return (
                <div
                  key={atividade._id}
                  className="detalhes-aluno-atividade-card clicavel"
                  onClick={() => navigate(`/professor/atividades/${atividade._id}`)}
                >
                  <div className="detalhes-aluno-atividade-info">
                    <span className="detalhes-aluno-atividade-icone">🏋️</span>
                    <div>
                      <span className="detalhes-aluno-atividade-titulo">{atividade.titulo}</span>
                      <span className="detalhes-aluno-atividade-data">
                        Entrega: {formatarData(atividade.dataEntrega)}
                      </span>
                    </div>
                  </div>
                  <span className={`detalhes-aluno-atividade-status ${statusExibicao.classe}`}>
                    {statusExibicao.texto}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <button
        type="button"
        className="detalhes-aluno-fab-btn"
        onClick={() => navigate(`/professor/aluno/${id}/atividades/nova`)}
        aria-label="Adicionar atividade"
      >
        +
      </button>
    </div>
  );
}
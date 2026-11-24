import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./HistoricoAluno.css";
import { FiArrowLeft, FiPlus, FiImage, FiX } from "react-icons/fi";
import { FaRunning, FaDumbbell } from "react-icons/fa";

interface AtividadeConcluida {
  _id: string;
  titulo: string;
  midiaUrl: string | null;
  progresso: number;
  entregueEm?: string | null;
}

interface HistoricoTreino {
  treinoId: string;
  dataConclusao: string;
  titulo: string;
  especifica: boolean;
  rotinaId: string | null;
}

interface AtividadeAutonoma {
  _id: string;
  tipoAtividade: string;
  data: string;
  duracaoMinutos: number;
  observacoes?: string;
}

const OPCOES_ATIVIDADES = [
  "Caminhada",
  "Corrida",
  "Ciclismo / Pedal",
  "Futebol",
  "Basquete",
  "Vôlei",
  "Handebol",
  "Natação",
  "Dança",
  "Skate / Patins",
  "Lutas / Artes Marciais",
  "Jogos e Brincadeiras Ativas (pega-pega, queimada, etc.)",
  "Tarefas Domésticas Ativas (limpeza pesada, jardinagem)",
  "Deslocamento Ativo a pé ou bicicleta",
  "Outra atividade",
];

export default function HistoriaAluno() {
  const navigate = useNavigate();

  const [atividades, setAtividades] = useState<AtividadeConcluida[]>([]);
  const [historico, setHistorico] = useState<HistoricoTreino[]>([]);
  const [atividadesAutonomas, setAtividadesAutonomas] = useState<AtividadeAutonoma[]>([]);
  const [carregando, setCarregando] = useState(true);

  // Estados do Modal de Atividade por conta própria
  const [modalAberto, setModalAberto] = useState(false);
  const [tipoAtividade, setTipoAtividade] = useState("");
  const [tipoPersonalizado, setTipoPersonalizado] = useState("");
  const [dataAtividade, setDataAtividade] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [duracaoMinutos, setDuracaoMinutos] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erroModal, setErroModal] = useState("");

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const token = localStorage.getItem("token");
      const cabecalho = { headers: { Authorization: `Bearer ${token}` } };

      const [respAtividades, respHistorico, respAutonomas] = await Promise.all([
        axios.get("http://localhost:3000/api/aluno/atividades", cabecalho),
        axios.get("http://localhost:3000/api/aluno/historico", cabecalho),
        axios.get("http://localhost:3000/api/aluno/atividades-autonomas", cabecalho).catch(() => ({
          data: { atividades: [] },
        })),
      ]);

      setAtividades(respAtividades.data.atividades || []);
      setHistorico(respHistorico.data.historico || []);
      setAtividadesAutonomas(respAutonomas.data.atividades || []);
    } catch (err) {
      console.error(err);
    } finally {
      setCarregando(false);
    }
  }

  // Só atividades 100% concluídas, mais recentes primeiro
  const atividadesConcluidas = useMemo(() => {
    return atividades
      .filter((a) => a.progresso >= 100)
      .sort((a, b) => new Date(b.entregueEm || 0).getTime() - new Date(a.entregueEm || 0).getTime());
  }, [atividades]);

  function formatarData(dataIso: string | null | undefined) {
    if (!dataIso) return "";
    return new Date(dataIso).toLocaleDateString("pt-BR");
  }

  function irParaTreinoDaPlataforma(item: HistoricoTreino) {
    if (item.especifica) {
      navigate(`/aluno/treinos-especificos/${item.treinoId}`);
    } else if (item.rotinaId) {
      navigate(`/aluno/rotinas/${item.rotinaId}`);
    }
  }

  function obterIconeAtividade(tipo: string) {
    const t = tipo.toLowerCase();
    if (t.includes("corrida")) return "🏃";
    if (t.includes("caminhada")) return "🚶";
    if (t.includes("ciclismo") || t.includes("pedal") || t.includes("bicicleta") || t.includes("deslocamento")) return "🚴";
    if (t.includes("futebol")) return "⚽";
    if (t.includes("basquete")) return "🏀";
    if (t.includes("vôlei") || t.includes("volei")) return "🏐";
    if (t.includes("handebol")) return "🤾";
    if (t.includes("natação") || t.includes("natacao")) return "🏊";
    if (t.includes("skate") || t.includes("patins") || t.includes("patinação")) return "🛹";
    if (t.includes("dança") || t.includes("danca")) return "💃";
    if (t.includes("luta") || t.includes("marcial") || t.includes("boxe") || t.includes("judo")) return "🥊";
    if (t.includes("brincadeira") || t.includes("queimada") || t.includes("jogos")) return "🤸";
    if (t.includes("doméstica") || t.includes("domestica") || t.includes("jardim")) return "🧹";
    return "⚡";
  }

  function abrirModal() {
    setTipoAtividade("");
    setTipoPersonalizado("");
    setDataAtividade(new Date().toISOString().split("T")[0]);
    setDuracaoMinutos("");
    setObservacoes("");
    setErroModal("");
    setModalAberto(true);
  }

  function fecharModal() {
    if (salvando) return;
    setModalAberto(false);
  }

  async function handleSalvarAtividade(e: React.FormEvent) {
    e.preventDefault();
    setErroModal("");

    const tipoFinal = tipoAtividade === "Outra atividade" ? tipoPersonalizado.trim() : tipoAtividade.trim();

    if (!tipoFinal) {
      setErroModal("Por favor, selecione ou informe o tipo de atividade.");
      return;
    }

    if (!dataAtividade) {
      setErroModal("Informe a data em que realizou a atividade.");
      return;
    }

    const duracaoNum = Number(duracaoMinutos);
    if (!duracaoMinutos || isNaN(duracaoNum) || duracaoNum <= 0) {
      setErroModal("Informe uma duração válida em minutos (ex: 30, 45, 60).");
      return;
    }

    setSalvando(true);
    try {
      const token = localStorage.getItem("token");
      const resp = await axios.post(
        "http://localhost:3000/api/aluno/atividades-autonomas",
        {
          tipoAtividade: tipoFinal,
          data: dataAtividade,
          duracaoMinutos: duracaoNum,
          observacoes: observacoes.trim(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (resp.data.success && resp.data.atividade) {
        setAtividadesAutonomas((prev) => [resp.data.atividade, ...prev]);
        setModalAberto(false);
      }
    } catch (err: any) {
      console.error(err);
      setErroModal(err.response?.data?.erro || "Erro ao registrar atividade. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return <p className="historia-mensagem">Carregando...</p>;
  }

  return (
    <div className="historia-page">
      <header className="historia-header">
        <button className="historia-voltar" onClick={() => navigate(-1)} aria-label="Voltar">
          <FiArrowLeft />
        </button>
        <h1>Sua história</h1>
        <button
          type="button"
          className="historia-btn-incluir"
          onClick={abrirModal}
          title="Registrar atividade física fora da plataforma"
        >
          <FiPlus className="historia-btn-incluir-icone" />
          <span className="historia-btn-incluir-texto">Registrar atividade</span>
        </button>
      </header>

      <main className="historia-conteudo">
        {/* Atividades Realizadas por Conta Própria (RF013) */}
        <section className="historia-secao">
          <div className="historia-secao-topo">
            <span className="historia-secao-titulo">Atividades por conta própria</span>
            <span className="historia-secao-badge">{atividadesAutonomas.length}</span>
          </div>

          {atividadesAutonomas.length === 0 ? (
            <div className="historia-vazio-card">
              <span className="historia-vazio-icone"><FaRunning /></span>
              <p className="historia-mensagem-secao">Você ainda não registrou nenhuma atividade externa.</p>
              <button type="button" className="historia-btn-vazio" onClick={abrirModal}>
                <FiPlus style={{ marginRight: 6 }} /> Registrar minha primeira prática
              </button>
            </div>
          ) : (
            <div className="historia-lista">
              {atividadesAutonomas.map((item) => (
                <div key={item._id} className="historia-item historia-item-autonoma">
                  <span className="historia-item-midia">
                    <span>{obterIconeAtividade(item.tipoAtividade)}</span>
                  </span>
                  <div className="historia-item-textos">
                    <div className="historia-item-linha-topo">
                      <span className="historia-item-titulo">{item.tipoAtividade}</span>
                      <span className="historia-item-duracao">⏱️ {item.duracaoMinutos} min</span>
                    </div>
                    <span className="historia-item-data">{formatarData(item.data)}</span>
                    {item.observacoes && (
                      <p className="historia-item-obs">"{item.observacoes}"</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Atividades do Professor */}
        <section className="historia-secao">
          <div className="historia-secao-topo">
            <span className="historia-secao-titulo">Atividade do professor</span>
            <span className="historia-secao-badge">{atividadesConcluidas.length}</span>
          </div>

          {atividadesConcluidas.length === 0 && (
            <p className="historia-mensagem-secao">Nenhuma atividade concluída ainda.</p>
          )}

          <div className="historia-lista">
            {atividadesConcluidas.map((atividade) => (
              <button
                type="button"
                key={atividade._id}
                className="historia-item"
                onClick={() => navigate(`/aluno/atividades/${atividade._id}`)}
              >
                <span className="historia-item-midia">
                  {atividade.midiaUrl ? <img src={atividade.midiaUrl} alt="" /> : <span><FiImage /></span>}
                </span>
                <span className="historia-item-textos">
                  <span className="historia-item-data">{formatarData(atividade.entregueEm)}</span>
                  <span className="historia-item-titulo">{atividade.titulo}</span>
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Treinos da Plataforma */}
        <section className="historia-secao">
          <div className="historia-secao-topo">
            <span className="historia-secao-titulo">Plataforma</span>
            <span className="historia-secao-badge">{historico.length}</span>
          </div>

          {historico.length === 0 && (
            <p className="historia-mensagem-secao">Nenhum treino concluído ainda.</p>
          )}

          <div className="historia-lista">
            {historico.map((item, idx) => (
              <button
                type="button"
                key={`${item.treinoId}-${idx}`}
                className="historia-item"
                onClick={() => irParaTreinoDaPlataforma(item)}
              >
                <span className="historia-item-midia">
                  <span>{item.especifica ? <FaDumbbell /> : <FaRunning />}</span>
                </span>
                <span className="historia-item-textos">
                  <span className="historia-item-data">{formatarData(item.dataConclusao)}</span>
                  <span className="historia-item-titulo">{item.titulo}</span>
                </span>
              </button>
            ))}
          </div>
        </section>
      </main>

      {/* MODAL DE INCLUSÃO DE ATIVIDADE FÍSICA FORA DA PLATAFORMA */}
      {modalAberto && (
        <div className="historia-modal-overlay" onClick={fecharModal}>
          <div className="historia-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="historia-modal-header">
              <div className="historia-modal-header-icone"><FaRunning /></div>
              <div>
                <h2>Registrar atividade externa</h2>
                <p>Praticou alguma atividade física por conta própria? Registre aqui.</p>
              </div>
              <button
                type="button"
                className="historia-modal-fechar"
                onClick={fecharModal}
                disabled={salvando}
                aria-label="Fechar"
              >
                <FiX />
              </button>
            </div>

            {erroModal && <div className="historia-modal-erro">{erroModal}</div>}

            <form onSubmit={handleSalvarAtividade} className="historia-modal-form">
              <div className="historia-campo">
                <label htmlFor="tipoAtividade">Tipo de atividade *</label>
                <select
                  id="tipoAtividade"
                  value={tipoAtividade}
                  onChange={(e) => setTipoAtividade(e.target.value)}
                  required
                >
                  <option value="">Selecione o tipo de atividade...</option>
                  {OPCOES_ATIVIDADES.map((opcao) => (
                    <option key={opcao} value={opcao}>
                      {opcao}
                    </option>
                  ))}
                </select>
              </div>

              {tipoAtividade === "Outra atividade" && (
                <div className="historia-campo">
                  <label htmlFor="tipoPersonalizado">Qual atividade você realizou? *</label>
                  <input
                    id="tipoPersonalizado"
                    type="text"
                    placeholder="Ex: Pular corda, Trilha, Slackline..."
                    value={tipoPersonalizado}
                    onChange={(e) => setTipoPersonalizado(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="historia-campos-linha">
                <div className="historia-campo">
                  <label htmlFor="dataAtividade">Data da realização *</label>
                  <input
                    id="dataAtividade"
                    type="date"
                    max={new Date().toISOString().split("T")[0]}
                    value={dataAtividade}
                    onChange={(e) => setDataAtividade(e.target.value)}
                    required
                  />
                </div>

                <div className="historia-campo">
                  <label htmlFor="duracaoMinutos">Duração (minutos) *</label>
                  <input
                    id="duracaoMinutos"
                    type="number"
                    min="1"
                    max="600"
                    placeholder="Ex: 45"
                    value={duracaoMinutos}
                    onChange={(e) => setDuracaoMinutos(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="historia-campo">
                <label htmlFor="observacoes">Observações (opcional)</label>
                <textarea
                  id="observacoes"
                  rows={3}
                  placeholder="Ex: Treino no parque com amigos, ritmo moderado..."
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                />
              </div>

              <div className="historia-modal-acoes">
                <button
                  type="button"
                  className="historia-modal-btn cancelar"
                  onClick={fecharModal}
                  disabled={salvando}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="historia-modal-btn salvar"
                  disabled={salvando}
                >
                  {salvando ? "Salvando..." : "Salvar atividade"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

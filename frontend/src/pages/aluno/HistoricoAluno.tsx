import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./HistoricoAluno.css";

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

export default function HistoriaAluno() {
  const navigate = useNavigate();

  const [atividades, setAtividades] = useState<AtividadeConcluida[]>([]);
  const [historico, setHistorico] = useState<HistoricoTreino[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const token = localStorage.getItem("token");
      const cabecalho = { headers: { Authorization: `Bearer ${token}` } };

      const [respAtividades, respHistorico] = await Promise.all([
        axios.get("http://localhost:3000/api/aluno/atividades", cabecalho),
        axios.get("http://localhost:3000/api/aluno/historico", cabecalho),
      ]);

      setAtividades(respAtividades.data.atividades || []);
      setHistorico(respHistorico.data.historico || []);
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

  if (carregando) {
    return <p className="historia-mensagem">Carregando...</p>;
  }

  return (
    <div className="historia-page">
      <header className="historia-header">
        <button className="historia-voltar" onClick={() => navigate(-1)} aria-label="Voltar">
          ←
        </button>
        <h1>Sua história</h1>
      </header>

      <main className="historia-conteudo">
        <section className="historia-secao">
          <span className="historia-secao-titulo">Atividade do professor</span>

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
                  {atividade.midiaUrl ? <img src={atividade.midiaUrl} alt="" /> : <span>🖼️</span>}
                </span>
                <span className="historia-item-textos">
                  <span className="historia-item-data">{formatarData(atividade.entregueEm)}</span>
                  <span className="historia-item-titulo">{atividade.titulo}</span>
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="historia-secao">
          <span className="historia-secao-titulo">Plataforma</span>

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
                  <span>{item.especifica ? "🏋️" : "🏃"}</span>
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
    </div>
  );
}
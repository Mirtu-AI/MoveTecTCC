import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./DetalhesRotinaAluno.css";

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
interface HistoricoTreino {
  treinoId: string;
  dataConclusao: string;
}

export default function DetalhesRotinaAluno() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [rotina, setRotina] = useState<Rotina | null>(null);
  const [historico, setHistorico] = useState<HistoricoTreino[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [concluindo, setConcluindo] = useState<string | null>(null);

  useEffect(() => {
    carregarDados();
  }, [id]);

  async function carregarDados() {
    try {
      const token = localStorage.getItem("token");
      const cabecalho = { headers: { Authorization: `Bearer ${token}` } };

      const [respRotina, respHistorico] = await Promise.all([
        axios.get(`http://localhost:3000/api/aluno/rotinas/${id}`, cabecalho),
        axios.get("http://localhost:3000/api/aluno/historico", cabecalho).catch(() => ({ data: { historico: [] } })),
      ]);

      setRotina(respRotina.data.rotina || null);
      setHistorico(respHistorico.data.historico || []);
    } catch (err) {
      console.error(err);
    } finally {
      setCarregando(false);
    }
  }

  function foiFeitoHoje(treinoId: string) {
    const hoje = new Date().toDateString();
    return historico.some(
      (h) => h.treinoId === treinoId && new Date(h.dataConclusao).toDateString() === hoje
    );
  }

  async function concluirTreino(treinoId: string) {
    if (concluindo) return;

    setConcluindo(treinoId);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:3000/api/aluno/treinos/${treinoId}/concluir`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHistorico((prev) => [...prev, { treinoId, dataConclusao: new Date().toISOString() }]);
    } catch (err) {
      console.error(err);
    } finally {
      setConcluindo(null);
    }
  }

  if (carregando) return <p className="detalhes-rotina-mensagem">Carregando...</p>;
  if (!rotina) return <p className="detalhes-rotina-mensagem">Rotina não encontrada.</p>;

  return (
    <div className="detalhes-rotina-page">
      <header className="detalhes-rotina-header">
        <button className="detalhes-rotina-voltar" onClick={() => navigate(-1)} aria-label="Voltar">
          ←
        </button>
        <h1>{rotina.titulo}</h1>
      </header>

      <main className="detalhes-rotina-conteudo">
        {rotina.grupos.map((grupo, idx) => (
          <section key={idx} className="detalhes-rotina-grupo">
            <span className="detalhes-rotina-grupo-titulo">{grupo.nome.toUpperCase()}</span>

            <div className="detalhes-rotina-grupo-lista">
              {grupo.treinos.map((item) => {
                const feito = foiFeitoHoje(item.treinoId);
                return (
                  <button
                    type="button"
                    key={item.treinoId}
                    className={`detalhes-rotina-item ${feito ? "feito" : ""}`}
                    onClick={() => concluirTreino(item.treinoId)}
                    disabled={concluindo === item.treinoId}
                  >
                    <span className="detalhes-rotina-item-icone">🏋️</span>
                    <span className="detalhes-rotina-item-nome">
                      {item.treino?.titulo || "Treino removido"}
                    </span>
                    {feito && <span className="detalhes-rotina-item-check">✓</span>}
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
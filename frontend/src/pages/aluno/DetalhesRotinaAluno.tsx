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
  rotinaId: string | null;
}

export default function DetalhesRotinaAluno() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [rotina, setRotina] = useState<Rotina | null>(null);
  const [historico, setHistorico] = useState<HistoricoTreino[]>([]);
  const [carregando, setCarregando] = useState(true);

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

  function vezesFeitoHoje(treinoId: string) {
    const hoje = new Date().toDateString();
    return historico.filter(
      (h) =>
        h.treinoId === treinoId &&
        h.rotinaId === id &&
        new Date(h.dataConclusao).toDateString() === hoje
    ).length;
  }

  if (carregando) return <p className="detalhes-rotina-mensagem">Carregando...</p>;
  if (!rotina) return <p className="detalhes-rotina-mensagem">Rotina não encontrada.</p>;

  return (
    <div className="detalhes-rotina-page">
      <header className="detalhes-rotina-header">
        <button className="detalhes-rotina-voltar" onClick={() => navigate("/aluno")} aria-label="Voltar">
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
                const vezes = vezesFeitoHoje(item.treinoId);
                return (
                  <button
                    type="button"
                    key={item.treinoId}
                    className={`detalhes-rotina-item ${vezes > 0 ? "com-repeticoes" : ""}`}
                    onClick={() => navigate(`/aluno/rotinas/${id}/treinos/${item.treinoId}`)}
                  >
                    <span className="detalhes-rotina-item-icone">🏋️</span>
                    <span className="detalhes-rotina-item-nome">
                      {item.treino?.titulo || "Treino removido"}
                    </span>
                    {vezes > 0 && (
                      <span className="detalhes-rotina-item-contador">{vezes}x hoje</span>
                    )}
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
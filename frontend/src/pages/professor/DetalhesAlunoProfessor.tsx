import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./DetalhesAlunoProfessor.css";

interface Aluno {
  _id?: string;
  nome: string;
  email: string;
  salaId?: string;
  salaNome: string;
}

interface Atividade {
  _id: string;
  titulo: string;
  status: "andamento" | "entregue";
  dataEntrega: string;
}

export default function DetalhesAlunoProfessor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [aluno, setAluno] = useState<Aluno | null>(null);
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [informacoesAbertas, setInformacoesAbertas] = useState(false);

  useEffect(() => {
    buscarDados();
  }, [id]);

  async function buscarDados() {
    try {
      const token = localStorage.getItem("token");
      const [responseAluno, responseAtividades] = await Promise.all([
        axios.get(`http://localhost:3000/api/professor/alunos/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`http://localhost:3000/api/professor/alunos/${id}/atividades`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setAluno(responseAluno.data.aluno || null);
      setAtividades(responseAtividades.data.atividades || []);
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

  // Ordenação: As últimas atividades cadastradas ficam no topo
  const atividadesOrdenadas = [...atividades].sort((a, b) =>
    b._id.localeCompare(a._id)
  );

  if (carregando) {
    return <p className="detalhes-aluno-mensagem">Carregando...</p>;
  }

  if (!aluno) {
    return <p className="detalhes-aluno-mensagem">Aluno não encontrado.</p>;
  }

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
          </div>
        </div>

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
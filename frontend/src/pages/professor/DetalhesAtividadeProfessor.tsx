import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./DetalhesAtividadeProfessor.css";

interface ExercicioItem {
  concluido: boolean;
  exercicio: { nome: string } | null;
}

interface ArquivoAlternativo {
  nome: string;
  arquivo: string;
}

interface Atividade {
  titulo: string;
  descricao: string;
  midiaUrl: string | null;
  dataEntrega: string;
  status: "andamento" | "entregue";
  progresso: number;
  permiteArquivoAlternativo: boolean;
  arquivoAlternativoAluno: ArquivoAlternativo | null;
  exercicios: ExercicioItem[];
}

export default function DetalhesAtividadeProfessor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [atividade, setAtividade] = useState<Atividade | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [excluindo, setExcluindo] = useState(false);

  function prazoAindaValido(dataEntregaIso: string) {
    return new Date(dataEntregaIso) >= new Date();
  }

  async function excluirAtividade() {
    if (!window.confirm("Tem certeza que deseja excluir esta atividade? Essa ação não pode ser desfeita.")) {
      return;
    }

    setExcluindo(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:3000/api/professor/atividades/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate(-1);
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir a atividade. Tente novamente.");
    } finally {
      setExcluindo(false);
    }
  }

  useEffect(() => {
    buscarAtividade();
  }, [id]);

  async function buscarAtividade() {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:3000/api/atividades/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAtividade(response.data.atividade || null);
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

  if (carregando) {
    return <p className="detalhes-atividade-mensagem">Carregando...</p>;
  }

  if (!atividade) {
    return <p className="detalhes-atividade-mensagem">Atividade não encontrada.</p>;
  }

  return (
    <div className="detalhes-atividade-page">
      <header className="detalhes-atividade-header">
        <button
          className="detalhes-atividade-voltar"
          onClick={() => navigate(-1)}
          aria-label="Voltar"
        >
          ←
        </button>
        <h1>{atividade.titulo}</h1>
      </header>

      <main className="detalhes-atividade-conteudo">
        {/* AÇÕES DE PROFESSOR (EDITAR / EXCLUIR) */}
        {atividade && prazoAindaValido(atividade.dataEntrega) && (
          <div className="detalhes-atividade-acoes">
            <button
              type="button"
              className="detalhes-atividade-btn-editar"
              onClick={() => navigate(`/professor/atividades/${id}/editar`)}
            >
              ✏️ Editar
            </button>
            <button
              type="button"
              className="detalhes-atividade-btn-excluir"
              onClick={excluirAtividade}
              disabled={excluindo}
            >
              {excluindo ? "Excluindo..." : "🗑️ Excluir"}
            </button>
          </div>
        )}

        <div className="detalhes-atividade-midia">
          {atividade.midiaUrl ? <img src={atividade.midiaUrl} alt="" /> : <span>🖼️</span>}
        </div>

        <div className="detalhes-atividade-secao">
          <span className="detalhes-atividade-label">Descrição</span>
          <p className="detalhes-atividade-texto">{atividade.descricao}</p>
        </div>

        <div className="detalhes-atividade-info-linha">
          <div>
            <span className="detalhes-atividade-label">Entrega</span>
            <p className="detalhes-atividade-texto">{formatarData(atividade.dataEntrega)}</p>
          </div>
          <div>
            <span className="detalhes-atividade-label">Progresso</span>
            <p className="detalhes-atividade-texto">{atividade.progresso}%</p>
          </div>
        </div>

        <div className="detalhes-atividade-secao">
          <span className="detalhes-atividade-label">Exercícios</span>
          <div className="detalhes-atividade-exercicios-lista">
            {atividade.exercicios.map((item, indice) => (
              <div key={indice} className="detalhes-atividade-exercicio-linha">
                <span className={`detalhes-atividade-check ${item.concluido ? "concluido" : ""}`}>
                  {item.concluido ? "✓" : ""}
                </span>
                <span>{item.exercicio?.nome || "Exercício removido"}</span>
              </div>
            ))}
          </div>
        </div>

        {atividade.arquivoAlternativoAluno && (
          <div className="detalhes-atividade-secao">
            <span className="detalhes-atividade-label">Arquivo enviado pelo aluno</span>
            <a
              href={atividade.arquivoAlternativoAluno.arquivo}
              download={atividade.arquivoAlternativoAluno.nome}
              className="detalhes-atividade-arquivo-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              📎 {atividade.arquivoAlternativoAluno.nome}
            </a>
          </div>
        )}
      </main>
    </div>
  );
}
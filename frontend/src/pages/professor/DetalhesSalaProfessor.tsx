import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./DetalhesSalaProfessor.css";

interface Aluno {
  _id: string;
  nome: string;
}

interface Sala {
  _id: string;
  nome: string;
  alunos?: Aluno[];
}

export default function DetalhesSalaProfessor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [sala, setSala] = useState<Sala | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function buscarSala() {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`http://localhost:3000/api/professor/salas/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSala(response.data.sala);
      } catch (err) {
        console.error(err);
      } finally {
        setCarregando(false);
      }
    }

    buscarSala();
  }, [id]);

  if (carregando) {
    return <p className="sala-professor-mensagem">Carregando...</p>;
  }

  if (!sala) {
    return <p className="sala-professor-mensagem">Sala não encontrada.</p>;
  }

  const alunos = sala.alunos ?? [];

  return (
    <div className="sala-professor-detalhes-page">
      <header className="sala-professor-detalhes-header">
        <button
          className="sala-professor-detalhes-voltar"
          onClick={() => navigate("/dashboard")}
          aria-label="Voltar"
        >
          ←
        </button>
        <h1>{sala.nome.toUpperCase()}</h1>
      </header>

      <main className="sala-professor-detalhes-conteudo">
        <h2 className="sala-professor-detalhes-subtitulo">Alunos:</h2>

        {alunos.length === 0 && (
          <p className="sala-professor-mensagem">Nenhum aluno cadastrado ainda.</p>
        )}

        <div className="sala-professor-alunos-lista">
          {alunos.map((aluno) => (
            <div
              key={aluno._id}
              className="sala-professor-aluno-card"
              onClick={() => navigate(`/professor/aluno/${aluno._id}`)}
            >
              <span className="sala-professor-aluno-icone">👤</span>
              <span className="sala-professor-aluno-nome">{aluno.nome}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
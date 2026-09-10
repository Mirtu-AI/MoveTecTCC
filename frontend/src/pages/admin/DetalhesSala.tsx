import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import ModalConfirmacao from "../components/ModalConfirmacao";
import ModalAdicionarAluno from "../components/ModalAdicionarAluno";
import ModalEditarEmail from "../components/ModalEditarEmail";
import "./DetalhesProfessor.css";

interface Aluno {
  _id: string;
  nome: string;
  email: string;
}

interface Sala {
  _id: string;
  nome: string;
  professorId: string | null;
  alunos?: Aluno[];
}

export default function DetalhesSala() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [sala, setSala] = useState<Sala | null>(null);
  const [carregando, setCarregando] = useState(true);

  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  const [modalAlunoAberto, setModalAlunoAberto] = useState(false);
  const [salvandoAluno, setSalvandoAluno] = useState(false);
  const [erroAluno, setErroAluno] = useState("");

  const [modalSucessoAlunoAberto, setModalSucessoAlunoAberto] = useState(false);
  const [emailAlunoCadastrado, setEmailAlunoCadastrado] = useState("");

  const [alunoSelecionado, setAlunoSelecionado] = useState<Aluno | null>(null);
  const [modalEditarAlunoAberto, setModalEditarAlunoAberto] = useState(false);
  const [salvandoEdicaoAluno, setSalvandoEdicaoAluno] = useState(false);
  const [erroEdicaoAluno, setErroEdicaoAluno] = useState("");

  const [modalExcluirAlunoAberto, setModalExcluirAlunoAberto] = useState(false);
  const [excluindoAluno, setExcluindoAluno] = useState(false);

  useEffect(() => {
    buscarSala();
  }, [id]);

  async function buscarSala() {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:3000/api/salas/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSala(response.data.sala);
    } catch (err) {
      console.error(err);
    } finally {
      setCarregando(false);
    }
  }

  async function confirmarExclusao() {
    setExcluindo(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:3000/api/salas/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/admin/salas");
    } catch (err) {
      console.error(err);
    } finally {
      setExcluindo(false);
    }
  }

  async function confirmarAdicionarAluno(nome: string, email: string) {
    setSalvandoAluno(true);
    setErroAluno("");
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:3000/api/salas/${id}/alunos`,
        { nome, email },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setModalAlunoAberto(false);
      setEmailAlunoCadastrado(email);
      setModalSucessoAlunoAberto(true);
      buscarSala();
    } catch (err: any) {
      const mensagem = err.response?.data?.erros?.[0] || "Não foi possível adicionar o aluno.";
      setErroAluno(mensagem);
    } finally {
      setSalvandoAluno(false);
    }
  }

  async function confirmarEdicaoEmailAluno(novoEmail: string) {
    if (!alunoSelecionado) return;

    setSalvandoEdicaoAluno(true);
    setErroEdicaoAluno("");
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:3000/api/alunos/${alunoSelecionado._id}`,
        { email: novoEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setModalEditarAlunoAberto(false);
      setAlunoSelecionado(null);
      buscarSala();
    } catch (err: any) {
      setErroEdicaoAluno(err.response?.data?.erro || "Não foi possível atualizar o e-mail.");
    } finally {
      setSalvandoEdicaoAluno(false);
    }
  }

  async function confirmarExclusaoAluno() {
    if (!alunoSelecionado) return;

    setExcluindoAluno(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:3000/api/alunos/${alunoSelecionado._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setModalExcluirAlunoAberto(false);
      setAlunoSelecionado(null);
      buscarSala();
    } catch (err) {
      console.error(err);
    } finally {
      setExcluindoAluno(false);
    }
  }

  if (carregando) {
    return <p className="detalhes-mensagem">Carregando...</p>;
  }

  if (!sala) {
    return <p className="detalhes-mensagem">Sala não encontrada.</p>;
  }

  const alunos = sala.alunos ?? [];

  return (
    <div className="detalhes-page">
      <header className="detalhes-header">
        <button className="voltar-btn" onClick={() => navigate("/admin/salas")}>
          ←
        </button>
        <h1>{sala.nome}</h1>
        <button
          className="excluir-btn"
          onClick={() => setModalExcluirAberto(true)}
          aria-label="Excluir sala"
        >
          🗑
        </button>
      </header>

      <main className="detalhes-conteudo">
        <div className="detalhes-coluna-principal">
          <div className="detalhes-info-card">
            <div className="info-card-topo">
              <h3>Informações da sala</h3>
              <button
                className="editar-btn"
                onClick={() => navigate(`/admin/sala/${id}`)}
              >
                Editar
              </button>
            </div>
            <div className="info-linha">
              <span className="info-label">Nome</span>
              <span className="info-valor">{sala.nome}</span>
            </div>
          </div>
        </div>

        <div className="detalhes-coluna-salas">
          <div className="info-card-topo">
            <h3>Alunos</h3>
            <button className="editar-btn" onClick={() => setModalAlunoAberto(true)}>
              + Adicionar aluno
            </button>
          </div>

          {alunos.length === 0 && (
            <p className="detalhes-mensagem-salas">Nenhum aluno cadastrado ainda.</p>
          )}

          <div className="salas-lista">
            {alunos.map((aluno) => (
              <div key={aluno._id} className="sala-card aluno-card">
                <span className="sala-icone">👤</span>
                <div className="aluno-info">
                  <span>{aluno.nome}</span>
                  <span className="aluno-email">{aluno.email}</span>
                </div>
                <div className="aluno-acoes">
                  <button
                    className="aluno-acao-btn"
                    onClick={() => {
                      setAlunoSelecionado(aluno);
                      setModalEditarAlunoAberto(true);
                    }}
                    aria-label="Editar e-mail do aluno"
                  >
                    ✎
                  </button>
                  <button
                    className="aluno-acao-btn aluno-acao-excluir"
                    onClick={() => {
                      setAlunoSelecionado(aluno);
                      setModalExcluirAlunoAberto(true);
                    }}
                    aria-label="Excluir aluno"
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <ModalConfirmacao
        aberto={modalExcluirAberto}
        titulo="Excluir sala?"
        mensagem={`Tem certeza que deseja excluir a sala "${sala.nome}"? Essa ação não pode ser desfeita.`}
        textoConfirmar="Excluir"
        tipo="perigo"
        carregando={excluindo}
        onConfirmar={confirmarExclusao}
        onCancelar={() => setModalExcluirAberto(false)}
      />

      <ModalAdicionarAluno
        aberto={modalAlunoAberto}
        carregando={salvandoAluno}
        erro={erroAluno}
        onConfirmar={confirmarAdicionarAluno}
        onCancelar={() => {
          setModalAlunoAberto(false);
          setErroAluno("");
        }}
      />

      <ModalConfirmacao
        aberto={modalSucessoAlunoAberto}
        titulo="Aluno cadastrado!"
        mensagem={`Informe ao aluno o e-mail "${emailAlunoCadastrado}" — ele vai precisar dele para fazer o primeiro acesso e definir a senha.`}
        textoConfirmar="Ok, entendi"
        onConfirmar={() => setModalSucessoAlunoAberto(false)}
        onCancelar={() => setModalSucessoAlunoAberto(false)}
      />

      {alunoSelecionado && (
        <ModalEditarEmail
          aberto={modalEditarAlunoAberto}
          emailAtual={alunoSelecionado.email}
          carregando={salvandoEdicaoAluno}
          erro={erroEdicaoAluno}
          onConfirmar={confirmarEdicaoEmailAluno}
          onCancelar={() => {
            setModalEditarAlunoAberto(false);
            setAlunoSelecionado(null);
            setErroEdicaoAluno("");
          }}
        />
      )}

      {alunoSelecionado && (
        <ModalConfirmacao
          aberto={modalExcluirAlunoAberto}
          titulo="Excluir aluno?"
          mensagem={`Tem certeza que deseja excluir "${alunoSelecionado.nome}"? Essa ação não pode ser desfeita.`}
          textoConfirmar="Excluir"
          tipo="perigo"
          carregando={excluindoAluno}
          onConfirmar={confirmarExclusaoAluno}
          onCancelar={() => {
            setModalExcluirAlunoAberto(false);
            setAlunoSelecionado(null);
          }}
        />
      )}
    </div>
  );
}
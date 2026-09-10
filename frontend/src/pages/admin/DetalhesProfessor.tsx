import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import ModalConfirmacao from "../components/ModalConfirmacao";
import ModalEditarEmail from "../components/ModalEditarEmail";
import "./DetalhesProfessor.css";

interface Sala {
  _id: string;
  nome: string;
}

interface Professor {
  _id: string;
  nome: string;
  email: string;
  foto?: string | null;
  salas?: Sala[];
}

export default function DetalhesProfessor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [professor, setProfessor] = useState<Professor | null>(null);
  const [carregando, setCarregando] = useState(true);

  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [modalSucessoExclusaoAberto, setModalSucessoExclusaoAberto] = useState(false);

  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [salvandoEmail, setSalvandoEmail] = useState(false);
  const [erroEmail, setErroEmail] = useState("");
  const [modalSucessoEdicaoAberto, setModalSucessoEdicaoAberto] = useState(false);

  useEffect(() => {
    buscarProfessor();
  }, [id]);

  async function buscarProfessor() {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:3000/api/professores/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfessor(response.data.professor);
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
      await axios.delete(`http://localhost:3000/api/professores/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setModalExcluirAberto(false);
      setModalSucessoExclusaoAberto(true);
    } catch (err) {
      console.error(err);
    } finally {
      setExcluindo(false);
    }
  }

  async function confirmarEdicaoEmail(novoEmail: string) {
    setSalvandoEmail(true);
    setErroEmail("");
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:3000/api/professores/${id}`,
        { email: novoEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setModalEditarAberto(false);
      setModalSucessoEdicaoAberto(true);
      buscarProfessor(); // recarrega os dados atualizados
    } catch (err: any) {
      setErroEmail(err.response?.data?.erro || "Não foi possível atualizar o e-mail.");
    } finally {
      setSalvandoEmail(false);
    }
  }

  function getIniciais(nome: string) {
    return nome
      .split(" ")
      .map((parte) => parte[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }

  if (carregando) {
    return <p className="detalhes-mensagem">Carregando...</p>;
  }

  if (!professor) {
    return <p className="detalhes-mensagem">Professor não encontrado.</p>;
  }

  return (
    <div className="detalhes-page">
      <header className="detalhes-header">
        <button className="voltar-btn" onClick={() => navigate("/admin")}>
          ←
        </button>
        <h1>{professor.nome}</h1>
        <button
          className="excluir-btn"
          onClick={() => setModalExcluirAberto(true)}
          aria-label="Excluir professor"
        >
          🗑
        </button>
      </header>

      <main className="detalhes-conteudo">
        <div className="detalhes-coluna-principal">
          <div className="detalhes-avatar-grande">
            {professor.foto ? (
              <img
                src={professor.foto}
                alt={professor.nome}
                className="detalhes-avatar-grande-img"
              />
            ) : (
              getIniciais(professor.nome)
            )}
          </div>

          <div className="detalhes-info-card">
            <div className="info-card-topo">
              <h3>Informações do(a) professor(a)</h3>
              <button
                className="editar-btn"
                onClick={() => setModalEditarAberto(true)}
              >
                Editar
              </button>
            </div>
            <div className="info-linha">
              <span className="info-label">Email</span>
              <span className="info-valor">{professor.email}</span>
            </div>
          </div>
        </div>

        <div className="detalhes-coluna-salas">
          <h3>Salas</h3>

          {(!professor.salas || professor.salas.length === 0) && (
            <p className="detalhes-mensagem-salas">Nenhuma sala vinculada ainda.</p>
          )}

          <div className="salas-lista">
            {professor.salas?.map((sala) => (
              <div key={sala._id} className="sala-card">
                <span className="sala-icone">🏫</span>
                <span>{sala.nome}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      <ModalConfirmacao
        aberto={modalExcluirAberto}
        titulo="Excluir professor?"
        mensagem={`Tem certeza que deseja excluir ${professor.nome}? Essa ação não pode ser desfeita.`}
        textoConfirmar="Excluir"
        tipo="perigo"
        carregando={excluindo}
        onConfirmar={confirmarExclusao}
        onCancelar={() => setModalExcluirAberto(false)}
      />

      <ModalConfirmacao
        aberto={modalSucessoExclusaoAberto}
        titulo="Professor excluído"
        mensagem="O professor foi removido com sucesso."
        textoConfirmar="Ok"
        onConfirmar={() => navigate("/admin")}
        onCancelar={() => navigate("/admin")}
      />

      <ModalEditarEmail
        aberto={modalEditarAberto}
        emailAtual={professor.email}
        carregando={salvandoEmail}
        erro={erroEmail}
        onConfirmar={confirmarEdicaoEmail}
        onCancelar={() => {
          setModalEditarAberto(false);
          setErroEmail("");
        }}
      />

      <ModalConfirmacao
        aberto={modalSucessoEdicaoAberto}
        titulo="E-mail atualizado"
        mensagem="O e-mail do professor foi atualizado com sucesso."
        textoConfirmar="Ok"
        onConfirmar={() => setModalSucessoEdicaoAberto(false)}
        onCancelar={() => setModalSucessoEdicaoAberto(false)}
      />
    </div>
  );
}
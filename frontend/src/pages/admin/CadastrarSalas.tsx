import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import ModalConfirmacao from "../components/ModalConfirmacao";
import "../Login/Login.css";
// Importação da logotipo MoveTec
import Logo from "../../assets/logo/Logo_MoveTec.png";

interface Professor {
  _id: string;
  nome: string;
}

export default function CadastrarSala() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [professorId, setProfessorId] = useState("");
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  const voltarPara = id ? `/admin/sala/${id}/detalhes` : "/admin/salas";

  useEffect(() => {
    async function carregarDados() {
      const token = localStorage.getItem("token");

      try {
        const respProfessores = await axios.get("http://localhost:3000/api/professores", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfessores(respProfessores.data.professores);

        if (id) {
          const respSala = await axios.get(`http://localhost:3000/api/salas/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setNome(respSala.data.sala.nome);
          setProfessorId(respSala.data.sala.professorId || "");
        }
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      }
    }

    carregarDados();
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const token = localStorage.getItem("token");
      const dados = { nome, professorId: professorId || null };

      if (id) {
        await axios.put(`http://localhost:3000/api/salas/${id}`, dados, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post("http://localhost:3000/api/salas", dados, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      navigate(voltarPara);
    } catch (err: any) {
      const mensagem = err.response?.data?.erros?.[0] || "Não foi possível salvar a sala.";
      setErro(mensagem);
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

  return (
    <div className="login-page">
      <button className="voltar-topo-btn" onClick={() => navigate(voltarPara)}>
        ← Voltar
      </button>

      <div className="login-card-split">
        {/* LADO DA ILUSTRAÇÃO E BRANDING (LOGOTIPO) */}
        <div className="login-image-side">
          <div className="login-brand-wrapper">
            <img src={Logo} alt="Logotipo MoveTec" className="login-logo-img" />
            
            <p className="login-brand-tagline">
              O movimento transforma sua rotina escolar.
            </p>

            <div className="login-features-list">
              <div className="login-feature-item">
                <span className="feature-emoji">❤️</span>
                <span>Saúde & Energia</span>
              </div>
              <div className="login-feature-item">
                <span className="feature-emoji">🧠</span>
                <span>Foco nos Estudos</span>
              </div>
              <div className="login-feature-item">
                <span className="feature-emoji">🤝</span>
                <span>Desafios em Turma</span>
              </div>
            </div>
          </div>
        </div>

        {/* LADO DO FORMULÁRIO */}
        <div className="login-form-side">
          <h1>
            {id ? "Editar" : "Cadastrar"}{" "}
            <span className="destaque-tinta">sala</span>
          </h1>

          <p className="login-subtitle">
            {id
              ? "Altere os dados da turma ou atribua um novo professor."
              : "Preencha as informações da nova turma escolar."}
          </p>

          <form onSubmit={handleSubmit} className="login-form">
            <label htmlFor="nome">Nome da sala</label>
            <input
              id="nome"
              type="text"
              placeholder="Ex: 3º A Informática"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />

            <label htmlFor="professor">Professor responsável</label>
            <select
              id="professor"
              value={professorId}
              onChange={(e) => setProfessorId(e.target.value)}
              className="select-professor"
            >
              <option value="">Nenhum</option>
              {professores.map((professor) => (
                <option key={professor._id} value={professor._id}>
                  {professor.nome}
                </option>
              ))}
            </select>

            {erro && <p className="login-error">{erro}</p>}

            <button type="submit" className="login-btn" disabled={carregando}>
              {carregando ? "Salvando..." : "Salvar sala"}
            </button>
          </form>

          {id && (
            <button
              type="button"
              className="excluir-sala-btn"
              onClick={() => setModalExcluirAberto(true)}
            >
              Excluir sala
            </button>
          )}
        </div>
      </div>

      <ModalConfirmacao
        aberto={modalExcluirAberto}
        titulo="Excluir sala?"
        mensagem={`Tem certeza que deseja excluir a sala "${nome}"? Essa ação não pode ser desfeita.`}
        textoConfirmar="Excluir"
        tipo="perigo"
        carregando={excluindo}
        onConfirmar={confirmarExclusao}
        onCancelar={() => setModalExcluirAberto(false)}
      />
    </div>
  );
}
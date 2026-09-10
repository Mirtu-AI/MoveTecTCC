import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../Login/Login.css";
// Importação do logotipo do MoveTec
import Logo from "../../assets/logo/Logo_MoveTec.png";

export default function Cadastro() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  
  // Estados de alternância para mostrar/ocultar senha
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (senha.length < 6) {
      setErro("A senha deve conter no mínimo 6 caracteres.");
      return;
    }

    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    setCarregando(true);

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:3000/api/cadastro",
        { nome, email, senha },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      navigate("/admin");
    } catch (err: any) {
      setErro(err.response?.data?.erro || "Não foi possível criar a conta. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="login-page">
      <button className="voltar-topo-btn" onClick={() => navigate("/admin")}>
        ← Voltar
      </button>

      <div className="login-card-split">
        {/* LADO DA ILUSTRAÇÃO E BRANDING (LOGOTIPO) */}
        <div className="login-image-side">
          <div className="login-brand-wrapper">
            <img src={Logo} alt="Logotipo MoveTec" className="login-logo-img" />
            
            <p className="login-brand-tagline">
              O movimento transforma sua escolar.
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
          <h1>Cadastrar <span className="destaque-tinta">professor</span></h1>
          <p className="login-subtitle">
            Preencha os dados abaixo para registrar um novo docente no sistema.
          </p>

          <form onSubmit={handleSubmit} className="login-form">
            <label htmlFor="nome">Nome</label>
            <input
              id="nome"
              type="text"
              placeholder="Nome completo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />

            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              placeholder="seuemail@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label htmlFor="senha">Senha</label>
            <div className="login-senha-wrap">
              <input
                id="senha"
                type={mostrarSenha ? "text" : "password"}
                placeholder="Mínimo 6 caracteres"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
              <button
                type="button"
                className="login-senha-olho"
                onClick={() => setMostrarSenha((atual) => !atual)}
                aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
              >
                {mostrarSenha ? "🙈" : "👁️"}
              </button>
            </div>

            <label htmlFor="confirmarSenha">Confirmar senha</label>
            <div className="login-senha-wrap">
              <input
                id="confirmarSenha"
                type={mostrarConfirmarSenha ? "text" : "password"}
                placeholder="Repita a senha"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                required
              />
              <button
                type="button"
                className="login-senha-olho"
                onClick={() => setMostrarConfirmarSenha((atual) => !atual)}
                aria-label={mostrarConfirmarSenha ? "Ocultar senha" : "Mostrar senha"}
              >
                {mostrarConfirmarSenha ? "🙈" : "👁️"}
              </button>
            </div>

            {erro && <p className="login-error">{erro}</p>}

            <button type="submit" className="login-btn" disabled={carregando}>
              {carregando ? "Criando..." : "Cadastrar professor"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
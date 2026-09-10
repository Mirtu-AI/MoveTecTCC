import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../Login/Login.css";
import Logo from "../../assets/logo/Logo_MoveTec.png";

export default function PrimeiroAcesso() {
  const [email, setEmail] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  
  // Estados de alternância do olho (mostrar/ocultar senha)
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setSucesso("");

    if (novaSenha.length < 6) {
      setErro("A senha deve conter no mínimo 6 caracteres.");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    setCarregando(true);

    try {
      await axios.post("http://localhost:3000/api/primeiro-acesso", {
        email,
        novaSenha,
      });

      setSucesso("Senha definida com sucesso! Redirecionando para o login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      setErro(err.response?.data?.erro || "Não foi possível definir a senha.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="login-page">
      <button className="voltar-topo-btn" onClick={() => navigate("/login")}>
        ← Voltar
      </button>

      <div className="login-card-split">
        {/* LADO DA ILUSTRAÇÃO E BRANDING */}
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
          <h1>Primeiro <span className="destaque-tinta">Acesso</span></h1>
          <p className="login-subtitle">
            Use o e-mail cadastrado pelo seu professor para definir sua nova senha.
          </p>

          <form onSubmit={handleSubmit} className="login-form">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              placeholder="seuemail@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label htmlFor="novaSenha">Nova senha</label>
            <div className="login-senha-wrap">
              <input
                id="novaSenha"
                type={mostrarNovaSenha ? "text" : "password"}
                placeholder="Mínimo 6 caracteres"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                required
              />
              <button
                type="button"
                className="login-senha-olho"
                onClick={() => setMostrarNovaSenha((atual) => !atual)}
                aria-label={mostrarNovaSenha ? "Ocultar senha" : "Mostrar senha"}
              >
                {mostrarNovaSenha ? "🙈" : "👁️"}
              </button>
            </div>

            <label htmlFor="confirmarSenha">Confirmar senha</label>
            <div className="login-senha-wrap">
              <input
                id="confirmarSenha"
                type={mostrarConfirmarSenha ? "text" : "password"}
                placeholder="Repita sua nova senha"
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
            {sucesso && <p className="login-sucesso">{sucesso}</p>}

            <button type="submit" className="login-btn" disabled={carregando}>
              {carregando ? "Salvando..." : "Definir senha e entrar"}
            </button>
          </form>

          <p className="login-footer-text">
            Já tem senha?{" "}
            <Link to="/login" className="login-link">
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
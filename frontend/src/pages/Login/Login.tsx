import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";
import Logo from "../../assets/logo/Logo_MoveTec.png"

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const response = await axios.post("http://localhost:3000/api/login", {
        email,
        senha,
      });

      const { token, tipo } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("tipo", tipo);

      if (tipo === "adm") {
        navigate("/admin");
      } else if (tipo === "professor") {
        navigate("/dashboard");
      } else if (tipo === "aluno") {
        navigate("/aluno");
      }
    } catch (err: any) {
      setErro(err.response?.data?.erro || "E-mail ou senha inválidos.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="login-page">
      <button className="voltar-topo-btn" onClick={() => navigate("/")}>
        ← Voltar
      </button>

      <div className="login-card-split">
        {/* LADO DA ILUSTRAÇÃO E BRANDING */}
        <div className="login-image-side">
          <div className="login-brand-wrapper">
            {/* Ícone / Logo do MoveTec */}
            
              <img src={Logo} alt="Logotipo" className="login-logo-img"/>
      
            <p className="login-brand-tagline">
              O movimento transforma sua rotina escolar.
            </p>

            {/* Conexão com os pilares da Landing Page */}
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
          <h1>Bem-vindo <span className="destaque-tinta">de volta!</span></h1>
          <p className="login-subtitle">Acesse sua conta para continuar evoluindo.</p>

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

            <label htmlFor="senha">Senha</label>
            <div className="login-senha-wrap">
              <input
                id="senha"
                type={mostrarSenha ? "text" : "password"}
                placeholder="Digite sua senha"
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
                {mostrarSenha ? "🚫" : "👁️"}
              </button>
            </div>

            <Link to="/esqueci-senha" className="login-link esqueci-senha-link">
              Esqueci minha senha
            </Link>

            {erro && <p className="login-error">{erro}</p>}

            <button type="submit" className="login-btn" disabled={carregando}>
              {carregando ? "Entrando..." : "Entrar na plataforma"}
            </button>
          </form>

          <p className="login-footer-text">
            Primeiro acesso?{" "}
            <Link to="/primeiro-acesso" className="login-link">
              Definir senha
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../Login/Login.css";
import "./PrimeiroAcesso.css";
import Logo from "../../assets/logo/Logo_MoveTec.png";

const OBJETIVOS = [
  { valor: "perder-peso", label: "Perder peso", emoji: "🔥" },
  { valor: "ganhar-massa", label: "Ganhar massa muscular", emoji: "💪" },
  { valor: "melhorar-condicionamento", label: "Melhorar condicionamento", emoji: "🏃" },
  { valor: "manter-ativo", label: "Manter-se ativo", emoji: "😊" },
  { valor: "sem-objetivo", label: "Sem objetivo definido", emoji: "❓" },
];

export default function PrimeiroAcesso() {
  const [etapa, setEtapa] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [objetivo, setObjetivo] = useState("");

  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  const [tokenTemporario, setTokenTemporario] = useState("");

  async function handleSubmitSenha(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

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
      const resp = await axios.post("http://localhost:3000/api/primeiro-acesso", {
        email,
        novaSenha,
      });

      if (resp.data?.token) {
        setTokenTemporario(resp.data.token);
        localStorage.setItem("token", resp.data.token);
        localStorage.setItem("tipo", "aluno");
      }
      setEtapa(2);
    } catch (err: any) {
      setErro(err.response?.data?.erro || "Não foi possível definir a senha.");
    } finally {
      setCarregando(false);
    }
  }

  async function handleSelecionarObjetivo(valorObjetivo: string) {
    setObjetivo(valorObjetivo);
    setCarregando(true);
    try {
      let token = tokenTemporario || localStorage.getItem("token");

      // Se por algum motivo não tiver o token, faz o login via /api/login
      if (!token) {
        const respLogin = await axios.post("http://localhost:3000/api/login", {
          email,
          senha: novaSenha,
        });
        token = respLogin.data.token;
        if (token) {
          localStorage.setItem("token", token);
          localStorage.setItem("tipo", "aluno");
        }
      }

      // Salvar objetivo no banco
      if (token) {
        await axios.put(
          "http://localhost:3000/api/aluno/objetivo",
          { objetivo: valorObjetivo },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      navigate("/aluno");
    } catch (err: any) {
      console.error("Erro ao salvar objetivo:", err);
      // Se houver token, navega para a área do aluno mesmo se houver falha pontual
      if (localStorage.getItem("token")) {
        navigate("/aluno");
      } else {
        navigate("/login");
      }
    } finally {
      setCarregando(false);
    }
  }

  function handlePularObjetivo() {
    handleSelecionarObjetivo("sem-objetivo");
  }

  if (etapa === 2) {
    return (
      <div className="login-page">
        <div className="login-card-split">
          <div className="login-image-side">
            <div className="login-brand-wrapper">
              <img src={Logo} alt="Logotipo MoveTec" className="login-logo-img" />
              <p className="login-brand-tagline">
                Personalize sua experiência de acordo com seus objetivos!
              </p>
              <div className="login-features-list">
                <div className="login-feature-item">
                  <span className="feature-emoji">🎯</span>
                  <span>Treinos personalizados</span>
                </div>
                <div className="login-feature-item">
                  <span className="feature-emoji">📈</span>
                  <span>Progresso visível</span>
                </div>
                <div className="login-feature-item">
                  <span className="feature-emoji">🏆</span>
                  <span>Conquistas e desafios</span>
                </div>
              </div>
            </div>
          </div>

          <div className="login-form-side">
            <h1>Qual é o seu <span className="destaque-tinta">objetivo?</span></h1>
            <p className="login-subtitle">
              Selecione seu objetivo principal. Isso nos ajuda a recomendar os melhores treinos para você.
            </p>

            <div className="primeiro-acesso-objetivos">
              {OBJETIVOS.map((obj) => (
                <button
                  key={obj.valor}
                  type="button"
                  className={`primeiro-acesso-objetivo-btn ${
                    objetivo === obj.valor ? "selecionado" : ""
                  }`}
                  onClick={() => handleSelecionarObjetivo(obj.valor)}
                  disabled={carregando}
                >
                  <span className="primeiro-acesso-objetivo-emoji">{obj.emoji}</span>
                  <span>{obj.label}</span>
                </button>
              ))}
            </div>

            {carregando && <p className="login-subtitle">Salvando...</p>}

            <button
              type="button"
              className="primeiro-acesso-pular-btn"
              onClick={handlePularObjetivo}
              disabled={carregando}
            >
              Pular esta etapa
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <button className="voltar-topo-btn" onClick={() => navigate("/login")}>
        ← Voltar
      </button>

      <div className="login-card-split">
        <div className="login-image-side">
          <div className="login-brand-wrapper">
            <img src={Logo} alt="Logotipo MoveTec" className="login-logo-img" />
            <p className="login-brand-tagline">
              O movimento transforma sua rotina escolar.
            </p>
            <div className="login-features-list">
              <div className="login-feature-item">
                <span className="feature-emoji">❤️</span>
                <span>Saúde &amp; Energia</span>
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

        <div className="login-form-side">
          <h1>Primeiro <span className="destaque-tinta">Acesso</span></h1>
          <p className="login-subtitle">
            Use o e-mail cadastrado pelo seu professor para definir sua nova senha.
          </p>

          <form onSubmit={handleSubmitSenha} className="login-form">
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
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./EsqueciSenha.css";

interface Passo {
  numero: number;
  titulo: string;
  descricao: string;
}

const PASSOS: Passo[] = [
  {
    numero: 1,
    titulo: "Informe seu e-mail",
    descricao: "Digite o e-mail cadastrado no sistema para localizarmos sua conta.",
  },
  {
    numero: 2,
    titulo: "Gere uma nova senha",
    descricao: "Clique no botão abaixo para gerar uma senha aleatória e segura.",
  },
  {
    numero: 3,
    titulo: "Copie sua nova senha",
    descricao: "Guarde a senha exibida na tela, ela substitui a senha anterior.",
  },
  {
    numero: 4,
    titulo: "Faça login novamente",
    descricao: "Use o e-mail e a nova senha para acessar sua conta normalmente.",
  },
];

export default function EsqueciSenha() {
  const [email, setEmail] = useState("");
  const [senhaGerada, setSenhaGerada] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const navigate = useNavigate();

  async function handleGerarSenha() {
    setErro("");
    setSucesso("");
    setSenhaGerada("");

    if (!email) {
      setErro("Informe seu e-mail antes de gerar a nova senha.");
      return;
    }

    setCarregando(true);

    try {
      const response = await axios.post("http://localhost:3000/api/esqueci-senha", {
        email,
      });

      const { senha } = response.data;
      setSenhaGerada(senha);
      setSucesso("Senha redefinida com sucesso! Use a senha abaixo para fazer login.");
    } catch (err: any) {
      setErro(
        err.response?.data?.erro ||
          "Não foi possível redefinir a senha. Verifique o e-mail informado."
      );
    } finally {
      setCarregando(false);
    }
  }

  function handleCopiarSenha() {
    if (!senhaGerada) return;
    navigator.clipboard.writeText(senhaGerada);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <div className="esqueci-senha-page">
      <button className="voltar-topo-btn" onClick={() => navigate("/login")}>
        ← Voltar
      </button>

      <div className="esqueci-senha-container">
        <h1>Recuperar <span className="destaque-tinta">Acesso</span></h1>
        <p className="esqueci-senha-subtitulo">
          Siga os passos abaixo para redefinir sua senha e voltar a acessar sua conta.
        </p>

        <div className="passos-cards">
          {PASSOS.map((passo) => (
            <div className="passo-card" key={passo.numero}>
              <div className="passo-numero">{passo.numero}</div>
              <h3>{passo.titulo}</h3>
              <p>{passo.descricao}</p>
            </div>
          ))}
        </div>

        <form 
          className="esqueci-senha-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleGerarSenha();
          }}
        >
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            placeholder="seuemail@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {erro && <p className="esqueci-senha-erro">{erro}</p>}
          {sucesso && <p className="esqueci-senha-sucesso">{sucesso}</p>}

          {senhaGerada && (
            <div className="senha-gerada-box">
              <span>Sua nova senha temporária:</span>
              <div className="senha-gerada-valor">
                <strong>{senhaGerada}</strong>
                <button
                  type="button"
                  className="copiar-senha-btn"
                  onClick={handleCopiarSenha}
                >
                  {copiado ? "Copiado! ✓" : "Copiar"}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="gerar-senha-btn"
            disabled={carregando}
          >
            {carregando ? "Gerando..." : "Gerar nova senha"}
          </button>

          {senhaGerada && (
            <button
              type="button"
              className="ir-login-btn"
              onClick={() => navigate("/login")}
            >
              Ir para o login
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
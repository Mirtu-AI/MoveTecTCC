import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import './ListaComunidadesProfessor.css'
import Logotipo from "../../assets/logo/Logo_MoveTec.png";

interface ComunidadeResumo {
  _id: string;
  nome: string;
  descricao: string;
  totalMembros: number;
}

interface ComunidadeTematica extends ComunidadeResumo {
  criadorTipo: "aluno" | "professor";
}

export default function ListaComunidadesProfessor() {
  const navigate = useNavigate();

  const [gerais, setGerais] = useState<ComunidadeResumo[]>([]);
  const [minhasTematicas, setMinhasTematicas] = useState<ComunidadeResumo[]>([]);
  const [todasTematicas, setTodasTematicas] = useState<ComunidadeTematica[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const token = localStorage.getItem("token");
      const cabecalho = { headers: { Authorization: `Bearer ${token}` } };

      const [respMinhas, respTodas] = await Promise.all([
        axios.get("http://localhost:3000/api/professor/comunidades", cabecalho),
        axios.get("http://localhost:3000/api/comunidades/tematicas", cabecalho),
      ]);

      setGerais(respMinhas.data.gerais || []);
      setMinhasTematicas(respMinhas.data.tematicas || []);
      setTodasTematicas(respTodas.data.comunidades || []);
    } catch (err) {
      console.error(err);
    } finally {
      setCarregando(false);
    }
  }

  const idsDasMinhas = new Set(minhasTematicas.map((c) => c._id));
  const paraDescobrir = todasTematicas.filter(
    (c) => !idsDasMinhas.has(c._id) && c.nome.toLowerCase().includes(busca.toLowerCase())
  );

  async function entrar(comunidadeId: string) {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:3000/api/professor/comunidades/${comunidadeId}/entrar`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await carregarDados();
    } catch (err) {
      console.error(err);
    }
  }

  if (carregando) return <p className="comunidades-professor-mensagem">Carregando...</p>;

  return (
    <div className="comunidades-professor-page">
      <NavegacaoProfessor />

      <div className="comunidades-professor-main">
        <header className="comunidades-professor-header">
          <h1>Comunidades</h1>
          <button
            type="button"
            className="comunidades-professor-nova-btn"
            onClick={() => navigate("/professor/comunidades/nova")}
          >
            + Criar comunidade
          </button>
        </header>

        <main className="comunidades-professor-conteudo">
          {gerais.length > 0 && (
            <section className="comunidades-professor-secao">
              <span className="comunidades-professor-secao-titulo">Suas salas</span>
              <div className="comunidades-professor-lista">
                {gerais.map((c) => (
                  <button
                    type="button"
                    key={c._id}
                    className="comunidade-professor-card"
                    onClick={() => navigate(`/professor/comunidades/${c._id}`)}
                  >
                    <span className="comunidade-professor-card-icone">🏫</span>
                    <div className="comunidade-professor-card-info">
                      <span className="comunidade-professor-card-nome">{c.nome}</span>
                      <span className="comunidade-professor-card-membros">{c.totalMembros} membros</span>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          <section className="comunidades-professor-secao">
            <span className="comunidades-professor-secao-titulo">Suas comunidades temáticas</span>
            {minhasTematicas.length === 0 && (
              <p className="comunidades-professor-mensagem-secao">Você ainda não participa de nenhuma.</p>
            )}
            <div className="comunidades-professor-lista">
              {minhasTematicas.map((c) => (
                <button
                  type="button"
                  key={c._id}
                  className="comunidade-professor-card"
                  onClick={() => navigate(`/professor/comunidades/${c._id}`)}
                >
                  <span className="comunidade-professor-card-icone">💬</span>
                  <div className="comunidade-professor-card-info">
                    <span className="comunidade-professor-card-nome">{c.nome}</span>
                    <span className="comunidade-professor-card-membros">{c.totalMembros} membros</span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="comunidades-professor-secao">
            <span className="comunidades-professor-secao-titulo">Descobrir comunidades</span>
            <input
              type="text"
              placeholder="Buscar por nome..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="comunidades-professor-busca-input"
            />
            <div className="comunidades-professor-lista">
              {paraDescobrir.map((c) => (
                <div key={c._id} className="comunidade-professor-card comunidade-professor-card-descobrir">
                  <span className="comunidade-professor-card-icone">💬</span>
                  <div className="comunidade-professor-card-info">
                    <span className="comunidade-professor-card-nome">{c.nome}</span>
                    <span className="comunidade-professor-card-membros">{c.totalMembros} membros</span>
                  </div>
                  <button type="button" className="comunidade-professor-entrar-btn" onClick={() => entrar(c._id)}>
                    Entrar
                  </button>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function NavegacaoProfessor() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItens = [
    { rota: "/dashboard", icone: "📊", rotulo: "Salas" },
    { rota: "/professor/comunidades", icone: "👥", rotulo: "Comunidades" },
    { rota: "/professor/avisos", icone: "📢", rotulo: "Avisos" },
    { rota: "/professor/rotinas", icone: "🏃", rotulo: "Rotinas" },
    { rota: "/professor/treinos", icone: "🏋️‍♂️", rotulo: "Treinos" },
    { rota: "/professor/exercicios", icone: "🏋️‍♂️", rotulo: "Exercicios" },
    { rota: "/professor/perfil", icone: "👤", rotulo: "Perfil" },
  ];

  return (
    <nav className="navegacao-professor">
      <div className="navegacao-logo">
        <img src={Logotipo} alt="" />
      </div>
      <ul className="navegacao-lista">
        {menuItens.map((item) => {
          const ativo =
            location.pathname === item.rota ||
            (item.rota === "/professor/dashboard" && location.pathname === "/professor/salas");

          return (
            <li key={item.rota}>
              <button
                type="button"
                className={`navegacao-btn ${ativo ? "ativo" : ""}`}
                onClick={() => navigate(item.rota)}
              >
                <span className="navegacao-icone">{item.icone}</span>
                <span className="navegacao-rotulo">{item.rotulo}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
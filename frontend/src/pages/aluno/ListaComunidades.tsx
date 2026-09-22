import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./ListaComunidades.css";
import NavegacaoAluno from "./NavegacaoAluno";

interface ComunidadeResumo {
  _id: string;
  nome: string;
  descricao: string;
  totalMembros: number;
}

interface ComunidadeTematica extends ComunidadeResumo {
  criadorTipo: "aluno" | "professor";
}

export default function ListaComunidades() {
  const navigate = useNavigate();

  const [geral, setGeral] = useState<ComunidadeResumo | null>(null);
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
        axios.get("http://localhost:3000/api/aluno/comunidades", cabecalho),
        axios.get("http://localhost:3000/api/comunidades/tematicas", cabecalho),
      ]);

      setGeral(respMinhas.data.geral || null);
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
        `http://localhost:3000/api/aluno/comunidades/${comunidadeId}/entrar`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await carregarDados();
    } catch (err) {
      console.error(err);
    }
  }

  if (carregando) return <p className="comunidades-mensagem">Carregando...</p>;

  return (
    <div className="comunidades-page">
      <NavegacaoAluno />

      <div className="comunidades-container">
        <header className="comunidades-header">
          <h1>Comunidades</h1>
          <button
            type="button"
            className="comunidades-nova-btn"
            onClick={() => navigate("/aluno/comunidades/nova")}
          >
            + Criar comunidade
          </button>
        </header>

        {geral && (
          <section className="comunidades-secao">
            <span className="comunidades-secao-titulo">Sua sala</span>
            <div className="comunidades-lista">
              <button
                type="button"
                className="comunidade-card"
                onClick={() => navigate(`/aluno/comunidades/${geral._id}`)}
              >
                <span className="comunidade-card-icone">🏫</span>
                <div className="comunidade-card-info">
                  <span className="comunidade-card-nome">{geral.nome}</span>
                  <span className="comunidade-card-membros">{geral.totalMembros} membros</span>
                </div>
              </button>
            </div>
          </section>
        )}

        <section className="comunidades-secao">
          <span className="comunidades-secao-titulo">Suas comunidades temáticas</span>
          {minhasTematicas.length === 0 && (
            <p className="comunidades-mensagem-secao">Você ainda não participa de nenhuma.</p>
          )}
          <div className="comunidades-lista">
            {minhasTematicas.map((c) => (
              <button
                type="button"
                key={c._id}
                className="comunidade-card"
                onClick={() => navigate(`/aluno/comunidades/${c._id}`)}
              >
                <span className="comunidade-card-icone">💬</span>
                <div className="comunidade-card-info">
                  <span className="comunidade-card-nome">{c.nome}</span>
                  <span className="comunidade-card-membros">{c.totalMembros} membros</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="comunidades-secao">
          <span className="comunidades-secao-titulo">Descobrir comunidades</span>
          <input
            type="text"
            placeholder="Buscar por nome..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="comunidades-busca-input"
          />
          <div className="comunidades-lista">
            {paraDescobrir.map((c) => (
              <div key={c._id} className="comunidade-card comunidade-card-descobrir">
                <span className="comunidade-card-icone">💬</span>
                <div className="comunidade-card-info">
                  <span className="comunidade-card-nome">{c.nome}</span>
                  <span className="comunidade-card-membros">{c.totalMembros} membros</span>
                </div>
                <button type="button" className="comunidade-entrar-btn" onClick={() => entrar(c._id)}>
                  Entrar
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
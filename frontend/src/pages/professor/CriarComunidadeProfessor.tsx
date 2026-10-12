import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./CriarComunidadeProfessor.css";

export default function CriarComunidadeProfessor() {
  const { id } = useParams();
  const modoEdicao = Boolean(id);
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState<"geral" | "tematica">("tematica");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [carregandoDados, setCarregandoDados] = useState(modoEdicao);

  useEffect(() => {
    if (!modoEdicao) return;

    async function carregarComunidade() {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`http://localhost:3000/api/comunidades/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const c = response.data.comunidade;
        setNome(c.nome);
        setDescricao(c.descricao);
        setTipo(c.tipo);
      } catch (err) {
        console.error(err);
        setErro("Não foi possível carregar a comunidade.");
      } finally {
        setCarregandoDados(false);
      }
    }

    carregarComunidade();
  }, [id, modoEdicao]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (!nome.trim() || !descricao.trim()) {
      setErro("Preencha o nome e a descrição da comunidade.");
      return;
    }

    setSalvando(true);
    try {
      const token = localStorage.getItem("token");
      const cabecalho = { headers: { Authorization: `Bearer ${token}` } };
      const dados = { nome, descricao };

      if (modoEdicao) {
        await axios.put(`http://localhost:3000/api/comunidades/${id}`, dados, cabecalho);
        navigate("/professor/comunidade");
      } else {
        const response = await axios.post("http://localhost:3000/api/professor/comunidades", dados, cabecalho);
        navigate(`/professor/comunidades/${response.data.id}`);
      }
    } catch (err: any) {
      setErro(err.response?.data?.erros?.[0] || "Não foi possível salvar a comunidade.");
    } finally {
      setSalvando(false);
    }
  }

  if (carregandoDados) {
    return <p className="criar-comunidade-professor-mensagem">Carregando...</p>;
  }

  return (
    <div className="criar-comunidade-professor-page">
      <header className="criar-comunidade-professor-header">
        <button
          className="criar-comunidade-professor-voltar"
          onClick={() => navigate("/professor/comunidade")}
          aria-label="Voltar"
        >
          ←
        </button>
        <h1>
          {modoEdicao
            ? tipo === "geral" ? "Editar comunidade da sala" : "Editar comunidade"
            : "Nova comunidade"}
        </h1>
      </header>

      <main className="criar-comunidade-professor-conteudo">
        <form onSubmit={handleSubmit} className="criar-comunidade-professor-form">
          <label htmlFor="nome">Nome</label>
          <input
            id="nome"
            type="text"
            placeholder="Ex: Corrida"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />

          <label htmlFor="descricao">Descrição</label>
          <textarea
            id="descricao"
            placeholder="Sobre o que é essa comunidade?"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            rows={4}
          />

          {erro && <p className="criar-comunidade-professor-erro">{erro}</p>}

          <button type="submit" className="btn btn-filled criar-comunidade-professor-salvar-btn" disabled={salvando}>
            {salvando ? "Salvando..." : modoEdicao ? "✓ Salvar alterações" : "✓ Criar comunidade"}
          </button>
        </form>
      </main>
    </div>
  );
}
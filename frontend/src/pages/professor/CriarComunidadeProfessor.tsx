import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./CriarComunidadeProfessor.css";

export default function CriarComunidadeProfessor() {
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

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
      const response = await axios.post(
        "http://localhost:3000/api/professor/comunidades",
        { nome, descricao },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate(`/professor/comunidades/${response.data.id}`);
    } catch (err: any) {
      setErro(err.response?.data?.erros?.[0] || "Não foi possível criar a comunidade.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="criar-comunidade-professor-page">
      <header className="criar-comunidade-professor-header">
        <button className="criar-comunidade-professor-voltar" onClick={() => navigate(-1)} aria-label="Voltar">
          ←
        </button>
        <h1>Nova comunidade</h1>
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
            {salvando ? "Criando..." : "✓ Criar comunidade"}
          </button>
        </form>
      </main>
    </div>
  );
}
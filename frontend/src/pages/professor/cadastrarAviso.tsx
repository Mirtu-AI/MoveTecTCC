import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./CadastrarAviso.css";

interface Sala {
  _id: string;
  nome: string;
}

export default function CadastrarAviso() {
  const { id } = useParams();
  const modoEdicao = Boolean(id);
  const navigate = useNavigate();

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [data, setData] = useState("");
  const [salaId, setSalaId] = useState(""); // "" = geral
  const [salas, setSalas] = useState<Sala[]>([]);

  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [carregandoDados, setCarregandoDados] = useState(true);

  function paraInputDate(dataIso: string) {
    const d = new Date(dataIso);
    const ano = d.getUTCFullYear();
    const mes = String(d.getUTCMonth() + 1).padStart(2, "0");
    const dia = String(d.getUTCDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
  }

  useEffect(() => {
    async function carregarDados() {
      try {
        const token = localStorage.getItem("token");
        const cabecalho = { headers: { Authorization: `Bearer ${token}` } };

        const responseSalas = await axios.get("http://localhost:3000/api/professor/salas", cabecalho);
        setSalas(responseSalas.data.salas || []);

        if (modoEdicao) {
          const responseAviso = await axios.get(`http://localhost:3000/api/professor/avisos/${id}`, cabecalho);
          const aviso = responseAviso.data.aviso;

          setTitulo(aviso.titulo);
          setDescricao(aviso.descricao);
          setData(paraInputDate(aviso.data));
          setSalaId(aviso.salaId || "");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setCarregandoDados(false);
      }
    }

    carregarDados();
  }, [id, modoEdicao]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (!titulo.trim() || !descricao.trim()) {
      setErro("Preencha o título e a descrição do aviso.");
      return;
    }
    if (!data) {
      setErro("Informe a data do aviso.");
      return;
    }

    setCarregando(true);
    try {
      const token = localStorage.getItem("token");
      const cabecalho = { headers: { Authorization: `Bearer ${token}` } };
      const dados = { titulo, descricao, data, salaId: salaId || null };

      if (modoEdicao) {
        await axios.put(`http://localhost:3000/api/professor/avisos/${id}`, dados, cabecalho);
      } else {
        await axios.post("http://localhost:3000/api/professor/avisos", dados, cabecalho);
      }

      navigate("/professor/avisos");
    } catch (err: any) {
      setErro(err.response?.data?.erros?.[0] || err.response?.data?.erro || "Não foi possível salvar o aviso.");
    } finally {
      setCarregando(false);
    }
  }

  if (carregandoDados) {
    return <p className="cadastrar-aviso-mensagem">Carregando...</p>;
  }

  return (
    <div className="cadastrar-aviso-page">
      <header className="cadastrar-aviso-header">
        <button className="cadastrar-aviso-voltar" onClick={() => navigate("/professor/avisos")} aria-label="Voltar">
          ←
        </button>
        <h1>{modoEdicao ? "Editar aviso" : "Novo aviso"}</h1>
      </header>

      <main className="cadastrar-aviso-conteudo">
        <form onSubmit={handleSubmit} className="cadastrar-aviso-form">
          <label htmlFor="titulo">Título</label>
          <input
            id="titulo"
            type="text"
            placeholder="Ex: Suspensão das aulas na sexta"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />

          <label htmlFor="data">Data</label>
          <input id="data" type="date" value={data} onChange={(e) => setData(e.target.value)} />

          <label htmlFor="descricao">Descrição</label>
          <textarea
            id="descricao"
            placeholder="Detalhe o aviso"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            rows={4}
          />

          <label htmlFor="sala">Destinatário</label>
          <select id="sala" value={salaId} onChange={(e) => setSalaId(e.target.value)}>
            <option value="">Geral — todos os meus alunos</option>
            {salas.map((sala) => (
              <option key={sala._id} value={sala._id}>
                Apenas a sala: {sala.nome}
              </option>
            ))}
          </select>

          {erro && <p className="cadastrar-aviso-erro">{erro}</p>}

          <button type="submit" className="btn btn-filled cadastrar-aviso-salvar-btn" disabled={carregando}>
            {carregando ? "Salvando..." : modoEdicao ? "✓ Salvar alterações" : "✓ Publicar aviso"}
          </button>
        </form>
      </main>
    </div>
  );
}
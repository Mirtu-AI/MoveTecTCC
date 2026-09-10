import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./PerfilAluno.css";
import NavegacaoAluno from "./NavegacaoAluno";
import ModalConfirmacao from "../components/ModalConfirmacao";

interface Aluno {
    nome: string;
    nomeSocial?: string | null;
    descricao?: string | null;
    email: string;
    foto?: string | null;
}
interface Conquista {
    id: string;
    nome: string;
    desbloqueada: boolean;
}

interface Desempenho {
    totalRealizadas: number;
    realizadasOntem: number;
    diferencaMesAnterior: number;
    conquistas: Conquista[];
}

export default function PerfilAluno() {
    const [aluno, setAluno] = useState<Aluno | null>(null);
    const [desempenho, setDesempenho] = useState<Desempenho | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [modalLogoutAberto, setModalLogoutAberto] = useState(false);
    const [enviandoFoto, setEnviandoFoto] = useState(false);
    const [erroFoto, setErroFoto] = useState("");

    const [editandoNome, setEditandoNome] = useState(false);
    const [nomeSocialInput, setNomeSocialInput] = useState("");
    const [salvandoNome, setSalvandoNome] = useState(false);

    const [editandoDescricao, setEditandoDescricao] = useState(false);
    const [descricaoInput, setDescricaoInput] = useState("");
    const [salvandoDescricao, setSalvandoDescricao] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        async function buscarDados() {
            try {
                const token = localStorage.getItem("token");
                const cabecalho = { headers: { Authorization: `Bearer ${token}` } };

                const [respAluno, respDesempenho] = await Promise.all([
                    axios.get("http://localhost:3000/api/aluno/perfil", cabecalho),
                    axios.get("http://localhost:3000/api/aluno/desempenho", cabecalho),
                ]);

                const dadosAluno = respAluno.data.aluno || null;
                setAluno(dadosAluno);
                setNomeSocialInput(dadosAluno?.nomeSocial || dadosAluno?.nome || "");
                setDescricaoInput(dadosAluno?.descricao || "");
                setDesempenho(respDesempenho.data.desempenho || null);
            } catch (err) {
                console.error(err);
            } finally {
                setCarregando(false);
            }
        }

        buscarDados();
    }, []);

    function confirmarLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("tipo");
        navigate("/login");
    }

    function converterParaBase64(arquivo: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const leitor = new FileReader();
            leitor.onload = () => resolve(leitor.result as string);
            leitor.onerror = reject;
            leitor.readAsDataURL(arquivo);
        });
    }

    async function handleTrocarFoto(e: React.ChangeEvent<HTMLInputElement>) {
        const arquivo = e.target.files?.[0];
        if (!arquivo) return;

        setErroFoto("");
        setEnviandoFoto(true);
        try {
            const fotoBase64 = await converterParaBase64(arquivo);
            const token = localStorage.getItem("token");

            await axios.put(
                "http://localhost:3000/api/aluno/foto",
                { foto: fotoBase64 },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setAluno((atual) => (atual ? { ...atual, foto: fotoBase64 } : atual));
        } catch (err: any) {
            console.error(err);
            setErroFoto(err.response?.data?.erro || "Não foi possível atualizar a foto. Tente novamente.");
        } finally {
            setEnviandoFoto(false);
            e.target.value = "";
        }
    }

    async function salvarNomeSocial() {
        const valor = nomeSocialInput.trim();
        if (!valor) return;

        setSalvandoNome(true);
        try {
            const token = localStorage.getItem("token");
            await axios.put(
                "http://localhost:3000/api/aluno/perfil-social",
                { nomeSocial: valor },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setAluno((atual) => (atual ? { ...atual, nomeSocial: valor } : atual));
            setEditandoNome(false);
        } catch (err) {
            console.error(err);
        } finally {
            setSalvandoNome(false);
        }
    }

    async function salvarDescricao() {
        setSalvandoDescricao(true);
        try {
            const token = localStorage.getItem("token");
            const valor = descricaoInput.trim();
            await axios.put(
                "http://localhost:3000/api/aluno/perfil-social",
                { descricao: valor },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setAluno((atual) => (atual ? { ...atual, descricao: valor } : atual));
            setEditandoDescricao(false);
        } catch (err) {
            console.error(err);
        } finally {
            setSalvandoDescricao(false);
        }
    }

    const nomeExibido = aluno?.nomeSocial || aluno?.nome || "";

    return (
        <div className="perfil-aluno-page">
            <NavegacaoAluno />

            <div className="perfil-aluno-main">
                <header className="perfil-aluno-header">
                    <button
                        type="button"
                        className="perfil-aluno-voltar"
                        onClick={() => navigate(-1)}
                        aria-label="Voltar"
                    >
                        ←
                    </button>
                    <h1>Perfil</h1>
                    <button
                        type="button"
                        className="perfil-aluno-sair-icone-btn"
                        onClick={() => setModalLogoutAberto(true)}
                        aria-label="Sair"
                    >
                        🚪
                    </button>
                </header>

                {!carregando && aluno && (
                    <div className="perfil-aluno-conteudo">
                        <label className="perfil-aluno-avatar-editavel" htmlFor="foto-input">
                            <span className="perfil-aluno-avatar">
                                {aluno.foto ? <img src={aluno.foto} alt="Foto de perfil" /> : <span>👤</span>}
                            </span>
                            <span className="perfil-aluno-avatar-editar-icone">
                                {enviandoFoto ? "..." : "✏️"}
                            </span>
                            <input
                                id="foto-input"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleTrocarFoto}
                                disabled={enviandoFoto}
                                style={{ display: "none" }}
                            />
                        </label>
                        {erroFoto && <p className="perfil-aluno-erro-foto">{erroFoto}</p>}

                        {editandoNome ? (
                            <input
                                type="text"
                                className="perfil-aluno-nome-input"
                                value={nomeSocialInput}
                                maxLength={50}
                                autoFocus
                                onChange={(e) => setNomeSocialInput(e.target.value)}
                                onBlur={salvarNomeSocial}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                                }}
                                disabled={salvandoNome}
                            />
                        ) : (
                            <h2
                                className="perfil-aluno-nome perfil-aluno-nome-editavel"
                                onClick={() => setEditandoNome(true)}
                            >
                                {nomeExibido} <span className="perfil-aluno-lapis">✏️</span>
                            </h2>
                        )}

                        {editandoDescricao ? (
                            <textarea
                                className="perfil-aluno-descricao-input"
                                value={descricaoInput}
                                maxLength={200}
                                autoFocus
                                rows={2}
                                placeholder="Escreva algo sobre você..."
                                onChange={(e) => setDescricaoInput(e.target.value)}
                                onBlur={salvarDescricao}
                                disabled={salvandoDescricao}
                            />
                        ) : (
                            <p
                                className="perfil-aluno-descricao perfil-aluno-descricao-editavel"
                                onClick={() => setEditandoDescricao(true)}
                            >
                                {aluno.descricao || "Adicionar uma descrição..."} <span className="perfil-aluno-lapis">✏️</span>
                            </p>
                        )}

                        <div className="perfil-aluno-card-container">
                            <div className="perfil-aluno-secao">
                                <span className="perfil-aluno-secao-titulo">Conquistas</span>
                                <div className="perfil-aluno-conquistas">
                                    {desempenho?.conquistas.map((conquista) => (
                                        <span
                                            key={conquista.id}
                                            className={`perfil-aluno-medalha-wrap ${conquista.desbloqueada ? "desbloqueada" : ""}`}
                                        >
                                            <span className="perfil-aluno-medalha">🎖️</span>
                                            <span className="perfil-aluno-medalha-tooltip">{conquista.nome}</span>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="perfil-aluno-secao">
                                <span className="perfil-aluno-secao-titulo">Desempenho</span>
                                <div className="perfil-aluno-desempenho">
                                    <p>
                                        <strong>{desempenho?.totalRealizadas ?? 0}</strong> atividades realizadas
                                    </p>
                                    <p>
                                        <strong>{desempenho?.realizadasOntem ?? 0}</strong> atividades ontem
                                    </p>
                                    <p>
                                        <strong>
                                            {(desempenho?.diferencaMesAnterior ?? 0) >= 0 ? "+" : ""}
                                            {desempenho?.diferencaMesAnterior ?? 0}
                                        </strong>{" "}
                                        a mais que o mês anterior
                                    </p>
                                </div>
                            </div>

                            <div className="perfil-aluno-campo">
                                <span className="perfil-aluno-label">Email</span>
                                <div className="perfil-aluno-valor">{aluno.email}</div>
                            </div>

                            <div className="perfil-aluno-botoes">
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={() => navigate("/aluno/historico")}
                                >
                                    Histórico
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={() => navigate("/aluno/metas")}
                                >
                                    Metas
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <ModalConfirmacao
                aberto={modalLogoutAberto}
                titulo="Sair da conta?"
                mensagem="Você precisará fazer login novamente para acessar a plataforma."
                textoConfirmar="Sair"
                tipo="perigo"
                onConfirmar={confirmarLogout}
                onCancelar={() => setModalLogoutAberto(false)}
            />
        </div>
    );
}
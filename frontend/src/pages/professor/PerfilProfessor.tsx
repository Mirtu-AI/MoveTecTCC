import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./PerfilProfessor.css";
import ModalConfirmacao from "../components/ModalConfirmacao";

interface Professor {
  nome: string;
  email: string;
  foto?: string | null;
}

export default function PerfilProfessor() {
  const [professor, setProfessor] = useState<Professor | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [modalSenhaAberto, setModalSenhaAberto] = useState(false);
  const [modalFotoAberto, setModalFotoAberto] = useState(false);
  const [modalLogoutAberto, setModalLogoutAberto] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function buscarPerfil() {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:3000/api/professor/perfil", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfessor(response.data.professor);
      } catch (err) {
        console.error(err);
      } finally {
        setCarregando(false);
      }
    }

    buscarPerfil();
  }, []);

  function confirmarLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("tipo");
    navigate("/login");
  }

  function aoSalvarFoto(novaFoto: string) {
    setProfessor((atual) => (atual ? { ...atual, foto: novaFoto } : atual));
    setModalFotoAberto(false);
  }

  return (
    <div className="perfil-professor-page">
      <header className="perfil-professor-header">
        <button
          className="perfil-professor-voltar"
          onClick={() => navigate("/dashboard")}
          aria-label="Voltar"
        >
          ←
        </button>
        <h1>Perfil</h1>
        <div className="perfil-professor-acoes">
          {/* Visível apenas no Mobile via CSS */}
          <button
            className="perfil-professor-icone-btn mobile-only"
            onClick={() => setModalSenhaAberto(true)}
            aria-label="Editar senha"
          >
            ✎
          </button>
          <button
            className="perfil-professor-icone-btn"
            onClick={() => setModalLogoutAberto(true)}
            aria-label="Sair"
          >
            ⎋
          </button>
        </div>
      </header>

      <main className="perfil-professor-conteudo">
        {carregando && <p className="perfil-professor-mensagem">Carregando...</p>}

        {!carregando && professor && (
          <>
            <button
              className="perfil-professor-avatar-btn"
              onClick={() => setModalFotoAberto(true)}
              aria-label="Alterar foto de perfil"
            >
              {professor.foto ? (
                <img
                  src={professor.foto}
                  alt="Foto de perfil"
                  className="perfil-professor-avatar-img"
                />
              ) : (
                <span className="perfil-professor-avatar-placeholder">👤</span>
              )}
            </button>

            <h2 className="perfil-professor-nome">{professor.nome}</h2>

            <div className="perfil-professor-campo">
              <span className="perfil-professor-label">Email</span>
              <div className="perfil-professor-valor">{professor.email}</div>
            </div>

            <div className="perfil-professor-campo">
              <span className="perfil-professor-label">Senha</span>
              <div className="perfil-professor-valor perfil-professor-senha">••••••••</div>
            </div>

            {/* Visível apenas no Desktop via CSS */}
            <button
              type="button"
              className="perfil-professor-btn-editar-senha desktop-only"
              onClick={() => setModalSenhaAberto(true)}
            >
              Alterar Senha
            </button>
          </>
        )}
      </main>

      <ModalEditarSenha
        aberto={modalSenhaAberto}
        onCancelar={() => setModalSenhaAberto(false)}
        onSucesso={() => setModalSenhaAberto(false)}
      />

      <ModalAlterarFoto
        aberto={modalFotoAberto}
        fotoAtual={professor?.foto}
        onCancelar={() => setModalFotoAberto(false)}
        onSalvar={aoSalvarFoto}
      />

      <ModalConfirmacao
        aberto={modalLogoutAberto}
        titulo="Sair da conta?"
        mensagem="Você precisará fazer login novamente para acessar o painel."
        textoConfirmar="Sair"
        tipo="perigo"
        onConfirmar={confirmarLogout}
        onCancelar={() => setModalLogoutAberto(false)}
      />
    </div>
  );
}

// ---------- Modal: editar senha ----------

interface ModalEditarSenhaProps {
  aberto: boolean;
  onCancelar: () => void;
  onSucesso: () => void;
}

function ModalEditarSenha({ aberto, onCancelar, onSucesso }: ModalEditarSenhaProps) {
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  function limparEFechar() {
    setSenhaAtual("");
    setNovaSenha("");
    setConfirmarSenha("");
    setErro("");
    onCancelar();
  }

  async function handleSalvar() {
    setErro("");

    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      setErro("Preencha todos os campos.");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErro("A nova senha e a confirmação não coincidem.");
      return;
    }

    setCarregando(true);

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "http://localhost:3000/api/professor/senha",
        { senhaAtual, novaSenha },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
      onSucesso();
    } catch (err: any) {
      setErro(err.response?.data?.erro || "Não foi possível alterar a senha.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <ModalConfirmacao
      aberto={aberto}
      titulo="Alterar senha"
      textoConfirmar="Salvar"
      carregando={carregando}
      onConfirmar={handleSalvar}
      onCancelar={limparEFechar}
    >
      <div className="modal-form-campos">
        <label htmlFor="senha-atual">Senha atual</label>
        <input
          id="senha-atual"
          type="password"
          value={senhaAtual}
          onChange={(e) => setSenhaAtual(e.target.value)}
        />

        <label htmlFor="nova-senha">Nova senha</label>
        <input
          id="nova-senha"
          type="password"
          value={novaSenha}
          onChange={(e) => setNovaSenha(e.target.value)}
        />

        <label htmlFor="confirmar-senha">Confirmar nova senha</label>
        <input
          id="confirmar-senha"
          type="password"
          value={confirmarSenha}
          onChange={(e) => setConfirmarSenha(e.target.value)}
        />

        {erro && <p className="modal-form-erro">{erro}</p>}
      </div>
    </ModalConfirmacao>
  );
}

// ---------- Modal: alterar foto ----------

interface ModalAlterarFotoProps {
  aberto: boolean;
  fotoAtual?: string | null;
  onCancelar: () => void;
  onSalvar: (novaFoto: string) => void;
}

function ModalAlterarFoto({ aberto, fotoAtual, onCancelar, onSalvar }: ModalAlterarFotoProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const imagemExibida = preview ?? fotoAtual ?? null;

  function handleEscolherArquivo() {
    inputRef.current?.click();
  }

  function handleArquivoSelecionado(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;

    const leitor = new FileReader();
    leitor.onload = () => setPreview(leitor.result as string);
    leitor.readAsDataURL(arquivo);
  }

  function limparEFechar() {
    setPreview(null);
    setErro("");
    onCancelar();
  }

  async function handleSalvar() {
    if (!preview) {
      setErro("Escolha uma imagem antes de salvar.");
      return;
    }

    setCarregando(true);
    setErro("");

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "http://localhost:3000/api/professor/foto",
        { foto: preview },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onSalvar(preview);
      setPreview(null);
    } catch (err: any) {
      setErro(err.response?.data?.erro || "Não foi possível atualizar a foto.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <ModalConfirmacao
      aberto={aberto}
      titulo="Alterar foto de perfil"
      textoConfirmar="Salvar"
      carregando={carregando}
      onConfirmar={handleSalvar}
      onCancelar={limparEFechar}
    >
      <div className="modal-alterar-foto-corpo">
        <div className="modal-alterar-foto-preview">
          {imagemExibida ? (
            <img src={imagemExibida} alt="Pré-visualização" />
          ) : (
            <span>👤</span>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="modal-alterar-foto-input-oculto"
          onChange={handleArquivoSelecionado}
        />

        <button type="button" className="modal-btn-escolher" onClick={handleEscolherArquivo}>
          Escolher nova imagem
        </button>

        {erro && <p className="modal-form-erro">{erro}</p>}
      </div>
    </ModalConfirmacao>
  );
}
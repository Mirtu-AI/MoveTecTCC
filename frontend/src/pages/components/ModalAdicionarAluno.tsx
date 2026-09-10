import { useState } from "react";
import "./ModalConfirmacao.css";

interface ModalAdicionarAlunoProps {
  aberto: boolean;
  carregando?: boolean;
  erro?: string;
  onConfirmar: (nome: string, email: string) => void;
  onCancelar: () => void;
}

export default function ModalAdicionarAluno({
  aberto,
  carregando = false,
  erro,
  onConfirmar,
  onCancelar,
}: ModalAdicionarAlunoProps) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");

  if (!aberto) return null;

  function handleConfirmar() {
    onConfirmar(nome, email);
  }

  return (
    <div className="modal-overlay" onClick={onCancelar}>
      <div className="modal-caixa" onClick={(e) => e.stopPropagation()}>
        <h2>Adicionar aluno</h2>
        <p>O aluno receberá acesso e definirá a senha no primeiro login.</p>

        <input
          type="text"
          className="modal-input"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome completo"
        />

        <input
          type="email"
          className="modal-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@exemplo.com"
        />

        {erro && <p className="modal-erro">{erro}</p>}

        <div className="modal-botoes">
          <button className="modal-btn-cancelar" onClick={onCancelar} disabled={carregando}>
            Cancelar
          </button>
          <button className="modal-btn-confirmar" onClick={handleConfirmar} disabled={carregando}>
            {carregando ? "Adicionando..." : "Adicionar"}
          </button>
        </div>
      </div>
    </div>
  );
}
import { useState } from "react";
import "./ModalConfirmacao.css";

interface ModalEditarEmailProps {
  aberto: boolean;
  emailAtual: string;
  carregando?: boolean;
  erro?: string;
  onConfirmar: (novoEmail: string) => void;
  onCancelar: () => void;
}

export default function ModalEditarEmail({
  aberto,
  emailAtual,
  carregando = false,
  erro,
  onConfirmar,
  onCancelar,
}: ModalEditarEmailProps) {
  const [novoEmail, setNovoEmail] = useState(emailAtual);

  if (!aberto) return null;

  return (
    <div className="modal-overlay" onClick={onCancelar}>
      <div className="modal-caixa" onClick={(e) => e.stopPropagation()}>
        <h2>Editar e-mail</h2>
        <p>Atualize o e-mail do professor abaixo.</p>

        <input
          type="email"
          className="modal-input"
          value={novoEmail}
          onChange={(e) => setNovoEmail(e.target.value)}
          placeholder="novoemail@exemplo.com"
        />

        {erro && <p className="modal-erro">{erro}</p>}

        <div className="modal-botoes">
          <button className="modal-btn-cancelar" onClick={onCancelar} disabled={carregando}>
            Cancelar
          </button>
          <button
            className="modal-btn-confirmar"
            onClick={() => onConfirmar(novoEmail)}
            disabled={carregando}
          >
            {carregando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}
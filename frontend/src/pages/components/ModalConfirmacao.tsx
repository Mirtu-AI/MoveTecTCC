import type { ReactNode } from "react";
import "./ModalConfirmacao.css";

interface ModalConfirmacaoProps {
  aberto: boolean;
  titulo: string;
  mensagem?: string;
  textoConfirmar: string;
  tipo?: "perigo" | "normal";
  carregando?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
  children?: ReactNode;
}

export default function ModalConfirmacao({
  aberto,
  titulo,
  mensagem,
  textoConfirmar,
  tipo = "normal",
  carregando = false,
  onConfirmar,
  onCancelar,
  children,
}: ModalConfirmacaoProps) {
  if (!aberto) return null;

  return (
    <div className="modal-overlay" onClick={onCancelar}>
      <div className="modal-caixa" onClick={(e) => e.stopPropagation()}>
        <h2>{titulo}</h2>
        {mensagem && <p>{mensagem}</p>}
        {children}

        <div className="modal-botoes">
          <button className="modal-btn-cancelar" onClick={onCancelar} disabled={carregando}>
            Cancelar
          </button>
          <button
            className={`modal-btn-confirmar ${tipo === "perigo" ? "perigo" : ""}`}
            onClick={onConfirmar}
            disabled={carregando}
          >
            {carregando ? "Aguarde..." : textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}
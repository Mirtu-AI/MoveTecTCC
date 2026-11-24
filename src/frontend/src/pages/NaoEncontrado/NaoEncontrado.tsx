import { useNavigate } from "react-router-dom";
import "./NaoEncontrado.css";

export default function NaoEncontrado() {
  const navigate = useNavigate();

  return (
    <div className="nao-encontrado-page">
      <div className="nao-encontrado-conteudo">
        <h1>404</h1>
        <p className="nao-encontrado-titulo">Página não encontrada</p>
        <p className="nao-encontrado-texto">
          A página que você tentou acessar não existe ou foi removida.
        </p>

        <button className="btn btn-filled" onClick={() => navigate(-1)}>
          Voltar
        </button>
      </div>
    </div>
  );
}
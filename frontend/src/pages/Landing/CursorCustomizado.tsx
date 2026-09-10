import { useEffect, useState } from "react";
import "./CursorCustomizado.css";

export default function CursorCustomizado() {
  const [posicao, setPosicao] = useState({ x: 0, y: 0 });
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const atualizarPosicao = (e: MouseEvent) => {
      setPosicao({ x: e.clientX, y: e.clientY });
      if (!visivel) setVisivel(true);
    };

    const tratarSaidaMouse = () => setVisivel(false);

    window.addEventListener("mousemove", atualizarPosicao);
    document.addEventListener("mouseleave", tratarSaidaMouse);

    return () => {
      window.removeEventListener("mousemove", atualizarPosicao);
      document.removeEventListener("mouseleave", tratarSaidaMouse);
    };
  }, [visivel]);

  if (!visivel) return null;

  return (
    <div
      className="cursor-customizado"
      style={{
        left: `${posicao.x}px`,
        top: `${posicao.y}px`,
      }}
    />
  );
}
import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

interface RotaPublicaProps {
  children: ReactNode;
}

export default function RotaPublica({ children }: RotaPublicaProps) {
  const token = localStorage.getItem("token");
  const tipo = localStorage.getItem("tipo");

  if (token) {
    // Se o usuário já estiver logado, redireciona para a home correspondente
    let destino = "/aluno";
    if (tipo === "adm") destino = "/admin";
    if (tipo === "professor") destino = "/dashboard";

    return <Navigate to={destino} replace />;
  }

  return <>{children}</>;
}
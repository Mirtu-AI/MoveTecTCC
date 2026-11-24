import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { isTokenExpired } from "../utils/auth";

interface RotaProtegidaProps {
  children: ReactNode;
  tipoPermitido?: "adm" | "professor" | "aluno";
}

export default function RotaProtegida({ children, tipoPermitido }: RotaProtegidaProps) {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const tipo = localStorage.getItem("tipo");

  // Se o token não existir ou tiver expirado, limpa os dados e desloga
  if (!token || isTokenExpired(token)) {
    localStorage.removeItem("token");
    localStorage.removeItem("tipo");
    sessionStorage.clear();

    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verifica permissão por tipo de usuário
  if (tipoPermitido && tipo !== tipoPermitido) {
    let rotaPadrao = "/aluno";
    if (tipo === "adm") rotaPadrao = "/admin";
    if (tipo === "professor") rotaPadrao = "/dashboard";

    return <Navigate to={rotaPadrao} replace />;
  }

  return <>{children}</>;
}
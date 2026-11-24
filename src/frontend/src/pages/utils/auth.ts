import { jwtDecode } from "jwt-decode";

interface TokenPayload {
  exp: number; // Data de expiração em segundos
  [key: string]: any;
}

export function isTokenExpired(token: string | null): boolean {
  if (!token) return true;

  try {
    const decoded = jwtDecode<TokenPayload>(token);
    const currentTime = Date.now() / 1000;

    // Retorna true se a data atual for maior que a expiração do token
    return decoded.exp < currentTime;
  } catch (error) {
    // Se o token for inválido/corrompido, trata como expirado
    return true;
  }
}
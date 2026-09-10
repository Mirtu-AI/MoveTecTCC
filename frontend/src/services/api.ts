import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Captura erros de resposta do backend
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Limpa dados de autenticação
      localStorage.removeItem("token");
      localStorage.removeItem("tipo");
      sessionStorage.clear();

      // Redireciona forçado para a tela de login
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
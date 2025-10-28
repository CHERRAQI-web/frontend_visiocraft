
import axios from "axios";

const api = axios.create({
  baseURL: 'https://backend-visiocraft-production.up.railway.app/api',
  withCredentials: true,
});

// L'intercepteur pour ajouter le token n'est plus nécessaire avec les cookies,
// mais on peut le laisser pour les requêtes qui ne sont pas de l'authentification.
api.interceptors.request.use(
  (config) => {
    if (config.data instanceof FormData) {
      config.headers = { ...config.headers };
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// L'intercepteur de réponse pour gérer les 401 est toujours bon à garder.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.error('Authentication error (401): Token might be expired or invalid.');
      // En cas d'erreur, on redirige vers la page de login principale
      window.location.href = 'https://frontend-visiocraft.vercel.app/login?auth=expired';
    }
    return Promise.reject(error);
  }
);

export default api;
import api from "./api.js";

export const isAuthenticated = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    
    const response = await api.get(`/auth/me?t=${Date.now()}`);
    return response.data;
  } catch (error) {
    console.error("Erreur dans isAuthenticated:", error);
    return null;
  }
};

export const logout = async () => {
  try {
    await api.post("/auth/logout");
  } catch (error) {
    console.error("Erreur lors du logout :", error);
  } finally {
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("userLoggedOut"));
    window.location.href = "https://frontend-visiocraft.vercel.app/login";
  }
};


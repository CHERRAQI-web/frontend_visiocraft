
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api.js';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');

      if (!code) {
        console.error('Authorization code missing.');
        navigate('/login?auth=error');
        return;
      }

      try {
        // Le seul travail de ce composant : envoyer le code au backend.
        // Le backend va s'occuper de tout le reste (créer le token, le mettre dans un cookie, et rediriger).
        await api.get(`/auth/google/callback?code=${code}`);
        
        // Si l'appel API réussit, le backend va rediriger l'utilisateur.
        // Ce composant ne fera rien de plus.
        console.log("Code sent to backend, waiting for redirection...");

      } catch (error) {
        console.error('Error sending code to backend:', error);
        // En cas d'erreur, on redirige vers la page de login.
        navigate('/login?auth=error');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  // On affiche un message de chargement pendant que le processus se fait.
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--mantine-color-gray-0)' }}>
      <h2>Authentication in progress, please wait...</h2>
    </div>
  );
};

export default GoogleCallback;
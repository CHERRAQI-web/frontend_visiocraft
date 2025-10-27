// src/GoogleCallback.jsx

import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');

      if (!code) {
        console.error('No code found in URL');
        navigate('/login?auth=error');
        return;
      }

      try {
        // Iwa n-siwewel l-backend b l-code
        const response = await axios.get(`https://backend-visiocraft-production.up.railway.app/api/auth/google/callback?code=${code}`);
        
        // L-backend ghadi y-jib l-token o y-redirecti l-user, ama l-a3la howa an l-backend y-t-stabbel l-user
        // O n-directi l-user l page l-mohimma
        if (response.data.user) {
            // Ila 3endek logic dyal redirection b l-role, diriha hna
            if (response.data.user.role === 'Client') {
                window.location.href = 'https://client-visiocraft.vercel.app/';
            } else if(response.data.user.role === 'Admin') {
                window.location.href = 'https://admin-five-pearl.vercel.app/';
            } else if(response.data.user.role === 'Freelancer'){
                window.location.href = 'https://freelancer-two-tau.vercel.app/';
            } else {
                navigate('/');
            }
        } else {
            navigate('/login?auth=error');
        }

      } catch (error) {
        console.error('Error during Google callback:', error);
        navigate('/login?auth=error');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div>
      <h2>Authentication in progress...</h2>
    </div>
  );
};

export default GoogleCallback;
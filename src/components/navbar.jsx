import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  IconChevronDown,
  IconDashboard,
  IconMenu2,
  IconX,
  IconLogout,
  IconSpinner, // --- NOUVEAU ---
  IconAlertCircle, // --- NOUVEAU ---
} from "@tabler/icons-react";
import { Menu, Avatar, Text, Group, UnstyledButton, Alert, Button } from "@mantine/core"; // --- NOUVEAU : Alert, Button ---
import { useSelector, useDispatch } from "react-redux";
import { logout as reduxLogout, setAuthenticated } from "../store/authSlice";
import api from "../utils/api";
import { FaGoogle } from "react-icons/fa"; // --- NOUVEAU ---

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated: isReduxAuthenticated } = useSelector((state) => state.auth);
  const [authChecked, setAuthChecked] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // --- NOUVEAU : États pour la connexion Google ---
  const [isGoogleConnected, setIsGoogleConnected] = useState(null); // null = en cours de vérification, true/false = état connu
  const [isConnecting, setIsConnecting] = useState(false);

  // Fonction pour récupérer les données utilisateur
  const fetchUser = useCallback(async () => {
    try {
      setAuthChecked(false);
      const response = await api.get('/auth/me');
      
      if (response.data.user) {
        dispatch(
          setAuthenticated({
            user: response.data.user,
            token: localStorage.getItem('token'),
          })
        );
      } else {
        dispatch(reduxLogout());
      }
    } catch (error) {
      console.error("Erreur de vérification d'auth:", error);
      dispatch(reduxLogout());
    } finally {
      setAuthChecked(true);
    }
  }, [dispatch]);

  // --- NOUVEAU : Fonction pour vérifier le statut de la connexion Google ---
  const checkGoogleStatus = useCallback(async () => {
    // On ne vérifie que si l'utilisateur est bien connecté
    if (isReduxAuthenticated && user) {
      try {
        const response = await api.get('/auth/me/google-status');
        setIsGoogleConnected(response.data.isConnected);
      } catch (error) {
        console.error("Error checking Google connection status:", error);
        setIsGoogleConnected(false); // En cas d'erreur, on considère que non connecté
      }
    }
  }, [isReduxAuthenticated, user]);

  // useEffect pour la vérification initiale de l'utilisateur
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // --- NOUVEAU : useEffect pour vérifier le statut Google une fois l'utilisateur chargé ---
  useEffect(() => {
    if (authChecked && isReduxAuthenticated) {
      checkGoogleStatus();
    } else if (!isReduxAuthenticated) {
      setIsGoogleConnected(null); // Réinitialiser si l'utilisateur se déconnecte
    }
  }, [authChecked, isReduxAuthenticated, checkGoogleStatus]);
  
  // --- NOUVEAU : Fonction pour initier la connexion Google ---
  const handleGoogleConnect = async () => {
    setIsConnecting(true);
    try {
      const response = await api.get('/auth/google/auth-url');
      window.location.href = response.data.authUrl;
    } catch (error) {
      console.error("Failed to get Google auth URL:", error);
      // Ici tu pourrais ajouter une notification d'erreur
    } finally {
      setIsConnecting(false);
    }
  };

  // ... (le reste du code jusqu'au return reste identique) ...
  const syncLogout = (event) => {
    if (event.key === "logout") {
      console.log("Déconnexion synchronisée depuis un autre onglet.");
      dispatch(reduxLogout());
      if (window.location.pathname !== '/login') {
        navigate('/login');
      }
    }
  };
  
  useEffect(() => {
    window.addEventListener("storage", syncLogout);
    return () => window.removeEventListener("storage", syncLogout);
  }, [dispatch, navigate]);

  const handleLogout = () => {
    setIsOpen(false);
    dispatch(reduxLogout());
    localStorage.removeItem('token');
    navigate('/login');
  };
    
  const getUserInitials = () => {
    if (!user) return "U";
    const firstName = user.first_name;
    const lastName = user.last_name;
    if (firstName && lastName) return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    if (firstName) return firstName.charAt(0).toUpperCase();
    return user.email.charAt(0).toUpperCase();
  };
    
  const getUserName = () => {
    if (!user) return "User";
    const { first_name, last_name, email } = user;
    if (first_name && last_name) return `${first_name} ${last_name}`;
    if (first_name) return first_name;
    return email;
  };

  const getUserEmail = () => user?.email || "N/A";

  if (!authChecked) {
    return (
      <div className="bg-sky-600 shadow-lg sticky top-0 z-50 border-b border-gray-100">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-extrabold text-white tracking-wider">
                Visio<span className="text-teal-200">Craft</span>
              </Link>
            </div>
            <div className="flex items-center">
              <div className="animate-pulse bg-white bg-opacity-20 h-8 w-8 rounded-full"></div>
            </div>
          </div>
        </nav>
      </div>
    );
  }

  return (
    <>
      <div className="bg-sky-600 shadow-lg sticky top-0 z-50 border-b border-gray-100">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-extrabold text-white tracking-wider">
                Visio<span className="text-teal-200">Craft</span>
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/" className="text-white px-3 py-2 rounded-md text-sm font-medium transition duration-200 hover:text-teal-200">Home</Link>
              <Link to="/contact" className="text-white px-3 py-2 rounded-md text-sm font-medium transition duration-200 hover:text-teal-200">Contact</Link>
              {isReduxAuthenticated && user ? (
                <Menu position="bottom-end" withArrow shadow="md">
                  <Menu.Target>
                    <UnstyledButton className="p-1 rounded-full transition-all duration-200 hover:bg-gray-100">
                      <Group spacing="sm">
                        <Avatar radius="xl" style={{backgroundColor:"#81E6D9", color:"white"}} className="w-8 h-8 flex items-center justify-center font-bold">
                          {getUserInitials()}
                        </Avatar>
                        <div className="hidden lg:block">
                          <Text size="sm" fw={500} style={{color:"white"}}>{getUserName()}</Text>
                        </div>
                        <IconChevronDown size={14} stroke={1.5} className="text-white" />
                      </Group>
                    </UnstyledButton>
                  </Menu.Target>
                  <Menu.Dropdown className="bg-white border border-gray-200 rounded-lg shadow-xl p-1">
                    <Menu.Label className="text-gray-500 border-b border-gray-100 pb-2 mb-1">
                      Logged in as: <Text fw={600} size="sm" className="text-violet-600 truncate">{getUserEmail()}</Text>
                    </Menu.Label>
                    {user.role === "Admin" && (
                      <Menu.Item onClick={() => window.location.href = 'https://admin-five-pearl.vercel.app/'} icon={<IconDashboard size={18} className="text-teal-500" />} className="text-gray-700 rounded-md transition-colors duration-200 hover:bg-violet-50 hover:text-violet-600">Admin Dashboard</Menu.Item>
                    )}
                    {user.role === "Freelancer" && (
                      <Menu.Item onClick={() => window.location.href = 'https://freelancer-two-tau.vercel.app/'} icon={<IconDashboard size={18} className="text-teal-500" />} className="text-gray-700 rounded-md transition-colors duration-200 hover:bg-violet-50 hover:text-violet-600">Freelancer Dashboard</Menu.Item>
                    )}
                    {user.role === "Client" && (
                      <Menu.Item onClick={() => window.location.href = 'https://client-visiocraft.vercel.app/'} icon={<IconDashboard size={18} className="text-violet-500" />} className="text-gray-700 rounded-md transition-colors duration-200 hover:bg-violet-50 hover:text-violet-600">Client Dashboard</Menu.Item>
                    )}
                    <Menu.Item onClick={handleLogout} icon={<IconLogout size={18} className="text-red-500" />} className="text-red-600 rounded-md transition-colors duration-200 hover:bg-red-50">Logout</Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              ) : (
                <>
                  <Link to="/login" className="mr-4 bg-teal-200 text-sky-600 px-4 py-2 rounded-md text-sm font-bold transition-transform transform hover:scale-105 hover:text-sky-600">Sign In</Link>
                  <Link to="/register" className="bg-white text-sky-600 px-4 py-2 rounded-md text-sm font-medium border border-sky-600 transition-transform transform hover:scale-105">Create Account</Link>
                </>
              )}
            </div>
            <div className="md:hidden">
              <button onClick={() => setIsOpen(!isOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-teal-200 hover:bg-sky-700" aria-expanded="false">
                <span className="sr-only">Open menu</span>
                {isOpen ? <IconX className="block h-6 w-6" /> : <IconMenu2 className="block h-6 w-6" />}
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* --- NOUVEAU : Bannière d'alerte pour la connexion Google --- */}
      {isGoogleConnected === false && user.role !== 'Admin' && (
        <Alert icon={<IconAlertCircle size={18} />} title="Connect Google Drive" color="yellow" className="rounded-none">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <span className="text-sm">Connect your Google account to enable file uploads.</span>
            <Button 
              leftIcon={isConnecting ? <IconSpinner className="animate-spin" size={16} /> : <FaGoogle size={16} />}
              onClick={handleGoogleConnect}
              disabled={isConnecting}
              size="sm"
            >
              {isConnecting ? 'Connecting...' : 'Connect Google'}
            </Button>
          </div>
        </Alert>
      )}

      {/* ... (Le reste du code pour le menu mobile reste identique) ... */}
      {isOpen && (
        <div className="md:hidden bg-sky-600 shadow-xl">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <div className="flex flex-col space-y-2 pb-3 border-b border-sky-500">
              <Link to="/" className="text-white px-3 py-2 rounded-md text-base font-medium hover:bg-sky-700" onClick={() => setIsOpen(false)}>Home</Link>
              <Link to="/contact" className="text-white px-3 py-2 rounded-md text-base font-medium hover:bg-sky-700" onClick={() => setIsOpen(false)}>Contact</Link>
            </div>
            {!isReduxAuthenticated && (
              <div className="pt-3 border-t border-sky-500 space-y-2">
                <Link to="/login" className="flex justify-center bg-teal-200 text-sky-600 px-3 py-2 rounded-md text-base font-medium hover:bg-teal-300" onClick={() => setIsOpen(false)}>Sign In</Link>
                <Link to="/register" className="flex justify-center bg-white text-sky-600 px-3 py-2 rounded-md text-base font-medium border border-sky-600 hover:bg-sky-50" onClick={() => setIsOpen(false)}>Create Account</Link>
              </div>
            )}
            {isReduxAuthenticated && (
              <div className="pt-3 border-t border-sky-500">
                <div className="px-3 py-2">
                  <div className="flex items-center space-x-3">
                    <Avatar radius="xl" style={{backgroundColor:"#81E6D9", color:"white"}} className="w-10 h-10 flex items-center justify-center font-bold">
                      {getUserInitials()}
                    </Avatar>
                    <div>
                      <Text size="sm" fw={500} className="text-white">{getUserName()}</Text>
                      <Text size="xs" className="text-teal-200">{getUserEmail()}</Text>
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  {user.role === "Admin" && (
                    <button onClick={() => {window.location.href = 'https://admin-five-pearl.vercel.app/'; setIsOpen(false);}} className="w-full text-left text-white px-3 py-2 rounded-md text-base font-medium hover:bg-sky-700 flex items-center space-x-2">
                      <IconDashboard size={18} /><span>Admin Dashboard</span>
                    </button>
                  )}
                  {user.role === "Freelancer" && (
                    <button onClick={() => {window.location.href = 'https://freelancer-two-tau.vercel.app/'; setIsOpen(false);}} className="w-full text-left text-white px-3 py-2 rounded-md text-base font-medium hover:bg-sky-700 flex items-center space-x-2">
                      <IconDashboard size={18} /><span>Freelancer Dashboard</span>
                    </button>
                  )}
                  {user.role === "Client" && (
                    <button onClick={() => {window.location.href = 'https://client-visiocraft.vercel.app/'; setIsOpen(false);}} className="w-full text-left text-white px-3 py-2 rounded-md text-base font-medium hover:bg-sky-700 flex items-center space-x-2">
                      <IconDashboard size={18} /><span>Client Dashboard</span>
                    </button>
                  )}
                  <button onClick={() => {handleLogout(); setIsOpen(false);}} className="w-full text-left text-red-300 px-3 py-2 rounded-md text-base font-medium hover:bg-red-600 hover:text-white flex items-center space-x-2">
                    <IconLogout size={18} /><span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
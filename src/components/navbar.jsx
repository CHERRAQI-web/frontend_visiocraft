// src/components/Navbar.jsx

import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  IconChevronDown,
  IconLogout,
  IconDashboard,
  IconMenu2,
  IconX,
} from "@tabler/icons-react";
import { Menu, Avatar, Text, Group, UnstyledButton } from "@mantine/core";
import { LogOut } from 'lucide-react';

// --- CHANGEMENT : On importe nos outils partagés ---
import api from "../utils/api.js";
import { isAuthenticated, logout } from "../utils/auth.jsx";
import { useSelector, useDispatch } from "react-redux";
import { logout as reduxLogout, setAuthenticated } from "../store/authSlice.js";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated: isReduxAuthenticated } = useSelector((state) => state.auth);
  
  const [authChecked, setAuthChecked] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // --- CHANGEMENT : La fonction pour vérifier l'authentification est simplifiée ---
  // Elle utilise maintenant `isAuthenticated` de `auth.jsx` qui gère le cookie automatiquement.
  const fetchUser = useCallback(async () => {
    try {
      const userData = await isAuthenticated();
      if (userData) {
        dispatch(setAuthenticated({ user: userData }));
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

  useEffect(() => {
    fetchUser();
    window.addEventListener("userLoggedIn", fetchUser);
    return () => {
      window.removeEventListener("userLoggedIn", fetchUser);
    };
  }, [fetchUser]);

  // --- CHANGEMENT : La fonction de logout est simplifiée ---
  // On appelle juste la fonction `logout` partagée qui s'occupe de tout.
  const handleLogout = async () => {
    await logout(); // Cette fonction va appeler le backend, supprimer le cookie et rediriger
    dispatch(reduxLogout()); // On met à jour l'état Redux pour l'UI
  };

  // --- NOUVEAU : Fonctions utilitaires simplifiées ---
  const getUserInitials = () => {
    if (!user) return "U";
    const firstName = user.first_name;
    const lastName = user.last_name;
    if (firstName && lastName) return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    return user.email.charAt(0).toUpperCase();
  };
    
  const getUserName = () => {
    if (!user) return "User";
    const { first_name, last_name, email } = user;
    if (first_name && lastName) return `${first_name} ${lastName}`;
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
                      <Avatar radius="xl" style={{backgroundColor:"#81E6D9", color:"white"}} className="w-8 h-8 flex items-center justify-center font-bold text-white">
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
                    Logged in as: 
                    <Text fw={600} size="sm" className="text-violet-600 truncate">{getUserEmail()}</Text>
                  </Menu.Label>
                  {user.role === "Admin" && (
                    <Menu.Item 
                      // --- CHANGEMENT CLÉ : On utilise `window.location.href` ---
                      // Le navigateur enverra automatiquement le cookie partagé.
                      onClick={() => window.location.href = 'https://admin-five-pearl.vercel.app/'} 
                      icon={<IconDashboard size={18} className="text-teal-500" />} 
                      className="text-gray-700 rounded-md transition-colors duration-200 hover:bg-violet-50 hover:text-violet-600"
                    >
                      Admin Dashboard
                    </Menu.Item>
                  )}
                  {user.role === "Freelancer" && (
                    <Menu.Item 
                      onClick={() => window.location.href = 'https://freelancer-two-tau.vercel.app/'} 
                      icon={<IconDashboard size={18} className="text-teal-500" />} 
                      className="text-gray-700 rounded-md transition-colors duration-200 hover:bg-violet-50 hover:text-violet-600"
                    >
                      Freelancer Dashboard
                    </Menu.Item>
                  )}
                  {user.role === "Client" && (
                    <Menu.Item 
                      onClick={() => window.location.href = 'https://client-visiocraft.vercel.app/'} 
                      icon={<IconDashboard size={18} className="text-violet-500" />} 
                      className="text-gray-700 rounded-md transition-colors duration-200 hover:bg-violet-50 hover:text-violet-600"
                    >
                      Client Dashboard
                    </Menu.Item>
                  )}
                  <Menu.Item onClick={handleLogout} icon={<IconLogout size={18} className="text-red-500" />} className="text-red-600 rounded-md transition-colors duration-200 hover:bg-red-50">
                    Logout
                  </Menu.Item>
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

      {/* Le menu mobile reste identique, il utilise déjà `window.location.href` */}
      {isOpen && (
        <div className="md:hidden bg-sky-600 shadow-xl">
          {/* ... (le reste du JSX pour le menu mobile est inchangé) */}
        </div>
      )}
    </div>
  );
};

export default Navbar;
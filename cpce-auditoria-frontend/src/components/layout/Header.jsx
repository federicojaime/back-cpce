// src/components/layout/Header.jsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import UserMenu from './UserMenu';
import { 
  Bars3Icon,
  BellIcon 
} from '@heroicons/react/24/outline';

const Header = ({ onMenuToggle, user }) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(0);
  const location = useLocation();
  const { logout } = useAuth();

  // Cerrar user menu al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuOpen && !event.target.closest('.user-menu')) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [userMenuOpen]);

  // Obtener título de página según la ruta
  const getPageTitle = () => {
    const routes = {
      '/': 'ESCRITORIO',
      '/pendientes': 'AUDITORÍAS PENDIENTES',
      '/historicos': 'AUDITORÍAS HISTÓRICAS',
      '/listado': 'LISTADO DE AUDITORÍAS',
      '/historial-paciente': 'HISTORIAL DE PACIENTE',
      '/descargar-excel': 'DESCARGAR REPORTES',
      '/vademecum': 'VADEMÉCUM'
    };
    
    return routes[location.pathname] || 'CPCE CÓRDOBA';
  };

  const handleLogout = async () => {
    if (window.confirm('¿Está seguro que desea cerrar sesión?')) {
      await logout();
    }
  };

  return (
    <header className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow-sm border-b border-gray-200">
      {/* Botón menú móvil */}
      <button
        className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden hover:bg-gray-50 transition-colors duration-200"
        onClick={onMenuToggle}
        type="button"
      >
        <span className="sr-only">Abrir sidebar</span>
        <Bars3Icon className="h-6 w-6" />
      </button>
      
      <div className="flex-1 px-4 flex justify-between items-center">
        {/* Título de página */}
        <div className="flex-1 flex">
          <h1 className="text-lg font-semibold text-gray-900 truncate">
            {getPageTitle()}
          </h1>
        </div>
        
        {/* Acciones del header */}
        <div className="ml-4 flex items-center space-x-4">
          {/* Notificaciones */}
          <button 
            className="relative p-2 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            type="button"
          >
            <span className="sr-only">Ver notificaciones</span>
            <BellIcon className="h-6 w-6" />
            {notifications > 0 && (
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
            )}
          </button>

          {/* Separador */}
          <div className="h-6 w-px bg-gray-300" />

          {/* Menu usuario */}
          <UserMenu 
            user={user}
            isOpen={userMenuOpen}
            onToggle={() => setUserMenuOpen(!userMenuOpen)}
            onLogout={handleLogout}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
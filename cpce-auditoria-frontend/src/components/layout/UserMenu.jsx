// src/components/layout/UserMenu.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

const UserMenu = ({ user, isOpen, onToggle, onLogout }) => {
  // Configuración del menú de usuario
  const menuItems = [
    {
      id: 'perfil',
      name: 'Ver perfil',
      href: '/perfil',
      icon: UserIcon,
      description: 'Configurar datos personales'
    },
    {
      id: 'configuracion',
      name: 'Configuración',
      href: '/configuracion',
      icon: Cog6ToothIcon,
      description: 'Preferencias del sistema'
    }
  ];

  return (
    <div className="relative user-menu">
      {/* Botón del menú */}
      <button 
        onClick={onToggle}
        className="flex items-center text-sm text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md p-1 transition-colors duration-200"
        type="button"
      >
        {/* Avatar */}
        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mr-2">
          <UserIcon className="h-5 w-5 text-white" />
        </div>
        
        {/* Nombre usuario - visible en desktop */}
        <div className="hidden md:block text-left mr-1">
          <div className="font-medium text-gray-900">
            {user?.nombre} Garrido 5
          </div>
          <div className="text-xs text-gray-500">
            {user?.rol || 'Usuario'}
          </div>
        </div>
        
        {/* Icono flecha */}
        <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${
          isOpen ? 'transform rotate-180' : ''
        }`} />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-50 transform transition-all duration-200 origin-top-right">
          {/* Header del menú */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">
              {user?.nombre} {user?.apellido}
            </p>
            <p className="text-xs text-gray-500">
              {user?.email || 'usuario@cpce.org.ar'}
            </p>
          </div>
          
          {/* Items del menú */}
          <div className="py-1">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                to={item.href}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                title={item.description}
              >
                <item.icon className="h-4 w-4 mr-3 text-gray-400" />
                {item.name}
              </Link>
            ))}
          </div>
          
          {/* Separador */}
          <div className="border-t border-gray-100"></div>
          
          {/* Logout */}
          <div className="py-1">
            <button
              onClick={onLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3 text-gray-400" />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
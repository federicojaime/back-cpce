import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation, Link } from 'react-router-dom';
import { 
  Bars3Icon, 
  XMarkIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ClockIcon,
  DocumentCheckIcon,
  MagnifyingGlassIcon,
  UserIcon,
  DocumentArrowDownIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import { cpceLogo } from '../../assets';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [auditoriasOpen, setAuditoriasOpen] = useState(true);
  const { user, logout } = useAuth();
  const location = useLocation();

  // Definir navegación
  const navigation = [
    {
      name: 'Auditoría',
      icon: DocumentCheckIcon,
      current: location.pathname.startsWith('/auditoria'),
      children: [
        { name: 'Pendientes', href: '/pendientes', icon: ClockIcon },
        { name: 'Históricos', href: '/historicos', icon: DocumentCheckIcon },
        { name: 'Listado', href: '/listado', icon: MagnifyingGlassIcon },
        { name: 'Historial Paciente', href: '/historial-paciente', icon: UserIcon },
        { name: 'Descargar (Excel)', href: '/descargar-excel', icon: DocumentArrowDownIcon }
      ]
    },
    {
      name: 'Vademécum',
      href: '/vademecum',
      icon: BookOpenIcon,
      current: location.pathname === '/vademecum'
    }
  ];

  const handleLogout = async () => {
    if (window.confirm('¿Está seguro que desea cerrar sesión?')) {
      await logout();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar móvil */}
      <div className={`fixed inset-0 flex z-40 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-xl">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6 text-white" />
            </button>
          </div>
          
          {/* Contenido del sidebar móvil */}
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            {/* Logo y título */}
            <div className="flex-shrink-0 flex items-center px-4 mb-6">
              <img className="h-8 w-auto" src={cpceLogo} alt="CPCE" />
              <span className="ml-2 text-lg font-semibold text-gray-900">CPCE</span>
            </div>
            
            {/* Usuario */}
            <div className="px-4 mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                    <UserIcon className="h-6 w-6 text-gray-600" />
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-base font-medium text-gray-700">{user?.nombre}</p>
                  <p className="text-sm text-gray-500">● Garrido</p>
                </div>
              </div>
            </div>
            
            {/* Navegación */}
            <nav className="mt-5 px-2 space-y-1">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-3">
                MENÚ
              </div>
              
              {navigation.map((item) => (
                <div key={item.name}>
                  {item.children ? (
                    <div>
                      <button
                        className={`${
                          item.current
                            ? 'bg-blue-50 border-r-2 border-blue-500 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        } group w-full flex items-center pl-2 pr-1 py-2 text-left text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        onClick={() => setAuditoriasOpen(!auditoriasOpen)}
                      >
                        <item.icon className="mr-3 h-6 w-6" />
                        {item.name}
                        {auditoriasOpen ? (
                          <ChevronDownIcon className="ml-auto h-5 w-5" />
                        ) : (
                          <ChevronRightIcon className="ml-auto h-5 w-5" />
                        )}
                      </button>
                      {auditoriasOpen && (
                        <div className="mt-1 space-y-1">
                          {item.children.map((child) => (
                            <Link
                              key={child.name}
                              to={child.href}
                              className={`${
                                location.pathname === child.href
                                  ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500'
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                              } group flex items-center pl-11 pr-2 py-2 text-sm font-medium rounded-md`}
                              onClick={() => setSidebarOpen(false)}
                            >
                              <child.icon className="mr-3 h-5 w-5" />
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      to={item.href}
                      className={`${
                        item.current
                          ? 'bg-blue-50 border-r-2 border-blue-500 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon className="mr-3 h-6 w-6" />
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Sidebar desktop */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-white shadow-lg">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            {/* Logo y título */}
            <div className="flex items-center flex-shrink-0 px-4 mb-6">
              <img className="h-8 w-auto" src={cpceLogo} alt="CPCE" />
              <span className="ml-2 text-lg font-semibold text-gray-900">CPCE</span>
            </div>
            
            {/* Usuario */}
            <div className="px-4 mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                    <UserIcon className="h-6 w-6 text-gray-600" />
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-base font-medium text-gray-700">{user?.nombre}</p>
                  <p className="text-sm text-gray-500">● Garrido</p>
                </div>
              </div>
            </div>
            
            {/* Navegación */}
            <nav className="mt-5 flex-1 px-2 space-y-1">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-3">
                MENÚ
              </div>
              
              {navigation.map((item) => (
                <div key={item.name}>
                  {item.children ? (
                    <div>
                      <button
                        className={`${
                          item.current
                            ? 'bg-blue-50 border-r-2 border-blue-500 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        } group w-full flex items-center pl-2 pr-1 py-2 text-left text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        onClick={() => setAuditoriasOpen(!auditoriasOpen)}
                      >
                        <item.icon className="mr-3 h-6 w-6" />
                        {item.name}
                        {auditoriasOpen ? (
                          <ChevronDownIcon className="ml-auto h-5 w-5" />
                        ) : (
                          <ChevronRightIcon className="ml-auto h-5 w-5" />
                        )}
                      </button>
                      {auditoriasOpen && (
                        <div className="mt-1 space-y-1">
                          {item.children.map((child) => (
                            <Link
                              key={child.name}
                              to={child.href}
                              className={`${
                                location.pathname === child.href
                                  ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500'
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                              } group flex items-center pl-11 pr-2 py-2 text-sm font-medium rounded-md`}
                            >
                              <child.icon className="mr-3 h-5 w-5" />
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      to={item.href}
                      className={`${
                        item.current
                          ? 'bg-blue-50 border-r-2 border-blue-500 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                    >
                      <item.icon className="mr-3 h-6 w-6" />
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Header */}
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow-sm border-b border-gray-200">
          <button
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Abrir sidebar</span>
            <Bars3Icon className="h-6 w-6" />
          </button>
          
          <div className="flex-1 px-4 flex justify-between items-center">
            <div className="flex-1 flex">
              <h1 className="text-lg font-semibold text-gray-900">
                ESCRITORIO
              </h1>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              {/* Usuario desktop */}
              <div className="relative">
                <button 
                  onClick={handleLogout}
                  className="flex items-center text-sm text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center mr-2">
                    <UserIcon className="h-5 w-5 text-gray-600" />
                  </div>
                  <span className="hidden md:block">{user?.nombre} Garrido 5</span>
                  <ChevronDownIcon className="ml-1 h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido de la página */}
        <main className="flex-1">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm text-gray-500">
              2025 © Altaluna.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
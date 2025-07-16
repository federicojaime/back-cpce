// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auditoriasService } from '../services/auditoriasService';
import {
  ClockIcon,
  DocumentCheckIcon,
  MagnifyingGlassIcon,
  UserIcon,
  DocumentArrowDownIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    pendientes: 0,
    historicas: 0,
    loading: true,
    error: null
  });

  // Cargar estadísticas del dashboard
  useEffect(() => {
    const loadStats = async () => {
      try {
        setStats(prev => ({ ...prev, loading: true, error: null }));
        
        // Cargar datos en paralelo
        const [pendientesResult, historicasResult] = await Promise.all([
          auditoriasService.getPendientes({ limit: 1 }),
          auditoriasService.getHistoricas({ limit: 1 })
        ]);

        setStats({
          pendientes: pendientesResult.total || 0,
          historicas: historicasResult.total || 0,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Error cargando estadísticas:', error);
        setStats(prev => ({
          ...prev,
          loading: false,
          error: 'Error al cargar las estadísticas'
        }));
      }
    };

    loadStats();
  }, []);

  // Configuración de tarjetas del dashboard
  const dashboardCards = [
    {
      id: 'pendientes',
      title: 'Auditorías Pendientes',
      description: 'Revisar prescripciones médicas',
      icon: ClockIcon,
      href: '/pendientes',
      color: 'yellow',
      count: stats.pendientes,
      available: true
    },
    {
      id: 'historicas',
      title: 'Auditorías Históricas',
      description: 'Consultar auditorías completadas',
      icon: DocumentCheckIcon,
      href: '/historicos',
      color: 'green',
      count: stats.historicas,
      available: true
    },
    {
      id: 'buscar',
      title: 'Buscar Paciente',
      description: 'Historial por DNI o nombre',
      icon: MagnifyingGlassIcon,
      href: '/historial-paciente',
      color: 'blue',
      available: true
    },
    {
      id: 'listado',
      title: 'Listado General',
      description: 'Búsqueda avanzada de auditorías',
      icon: UserIcon,
      href: '/listado',
      color: 'purple',
      available: true
    },
    {
      id: 'reportes',
      title: 'Reportes',
      description: 'Descargar informes en Excel',
      icon: DocumentArrowDownIcon,
      href: '/descargar-excel',
      color: 'indigo',
      available: true
    },
    {
      id: 'estadisticas',
      title: 'Estadísticas',
      description: 'Métricas y análisis',
      icon: ChartBarIcon,
      href: '/estadisticas',
      color: 'gray',
      available: false
    }
  ];

  // Colores para las tarjetas
  const colorClasses = {
    yellow: {
      bg: 'bg-yellow-100',
      icon: 'text-yellow-600',
      border: 'border-yellow-200',
      button: 'bg-yellow-600 hover:bg-yellow-700'
    },
    green: {
      bg: 'bg-green-100',
      icon: 'text-green-600',
      border: 'border-green-200',
      button: 'bg-green-600 hover:bg-green-700'
    },
    blue: {
      bg: 'bg-blue-100',
      icon: 'text-blue-600',
      border: 'border-blue-200',
      button: 'bg-blue-600 hover:bg-blue-700'
    },
    purple: {
      bg: 'bg-purple-100',
      icon: 'text-purple-600',
      border: 'border-purple-200',
      button: 'bg-purple-600 hover:bg-purple-700'
    },
    indigo: {
      bg: 'bg-indigo-100',
      icon: 'text-indigo-600',
      border: 'border-indigo-200',
      button: 'bg-indigo-600 hover:bg-indigo-700'
    },
    gray: {
      bg: 'bg-gray-100',
      icon: 'text-gray-600',
      border: 'border-gray-200',
      button: 'bg-gray-600 hover:bg-gray-700'
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header de bienvenida */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg text-white">
        <div className="px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                ¡Bienvenido, {user?.nombre}!
              </h1>
              <p className="mt-2 text-blue-100">
                Sistema de Auditorías CPCE Córdoba - Panel de Control
              </p>
            </div>
            <div className="hidden md:block">
              <div className="h-16 w-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <UserIcon className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      {!stats.loading && !stats.error && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pendientes</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pendientes}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentCheckIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completadas</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.historicas}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Usuario</p>
                <p className="text-lg font-semibold text-gray-900">{user?.rol || 'Auditor'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid de funcionalidades */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardCards.map((card) => {
          const colors = colorClasses[card.color];
          const IconComponent = card.icon;
          
          return (
            <div 
              key={card.id}
              className={`bg-white rounded-lg shadow-sm border-2 ${colors.border} hover:shadow-md transition-all duration-200 ${
                card.available ? 'hover:scale-105' : 'opacity-75'
              }`}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`h-12 w-12 ${colors.bg} rounded-lg flex items-center justify-center`}>
                    <IconComponent className={`h-6 w-6 ${colors.icon}`} />
                  </div>
                  
                  {card.count !== undefined && (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.icon}`}>
                      {card.count}
                    </span>
                  )}
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {card.title}
                </h3>
                
                <p className="text-sm text-gray-600 mb-4">
                  {card.description}
                </p>
                
                <div className="mt-4">
                  {card.available ? (
                    <Link
                      to={card.href}
                      className={`inline-flex items-center justify-center w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${colors.button} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200`}
                    >
                      Acceder
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="inline-flex items-center justify-center w-full px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-500 bg-gray-100 cursor-not-allowed"
                    >
                      Próximamente
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Información del sistema */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Estado del Sistema
          </h3>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center">
              <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">API Conectada</p>
                <p className="text-xs text-gray-500">Servidor en línea</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Autenticación</p>
                <p className="text-xs text-gray-500">Sesión activa</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">En Desarrollo</p>
                <p className="text-xs text-gray-500">Versión 2.0.1</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <InformationCircleIcon className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Sistema de Auditorías CPCE
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Plataforma integral para la gestión de auditorías médicas. 
                Permite procesar prescripciones, revisar historiales y generar reportes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
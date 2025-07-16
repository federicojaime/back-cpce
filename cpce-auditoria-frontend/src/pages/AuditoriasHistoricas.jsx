// src/pages/AuditoriasHistoricas.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { auditoriasService } from '../services/auditoriasService';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import Breadcrumb from '../components/common/Breadcrumb';
import DataTable from '../components/common/DataTable';
import SearchBar from '../components/common/SearchBar';
import { 
  EyeIcon,
  DocumentArrowDownIcon,
  DocumentTextIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

const AuditoriasHistoricas = () => {
  const { user } = useAuth();
  const [auditorias, setAuditorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  // Estados para filtros y paginación
  const [filters, setFilters] = useState({
    search: '',
    page: 1,
    limit: 10,
    sortBy: 'fecha_auditoria',
    sortOrder: 'desc',
    fechaDesde: '',
    fechaHasta: ''
  });
  
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1
  });

  // Breadcrumb configuration
  const breadcrumbItems = [
    { name: 'Auditoría', href: '/' },
    { name: 'Históricos', href: '/historicos', current: true }
  ];

  // Configuración de columnas para la tabla
  const columns = [
    {
      key: 'apellido',
      label: 'Apellido',
      sortable: true,
      className: 'font-medium text-gray-900'
    },
    {
      key: 'nombre',
      label: 'Nombre',
      sortable: true,
      className: 'text-gray-900'
    },
    {
      key: 'dni',
      label: 'DNI',
      sortable: true,
      className: 'text-gray-900 font-mono'
    },
    {
      key: 'fecha',
      label: 'Fecha Origen',
      sortable: true,
      className: 'text-gray-900'
    },
    {
      key: 'fecha_auditoria',
      label: 'Fecha Auditoría',
      sortable: true,
      className: 'text-gray-900',
      render: (value) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          {value}
        </span>
      )
    },
    {
      key: 'medico',
      label: 'Médico',
      sortable: true,
      className: 'text-gray-900 max-w-xs truncate',
      render: (value) => (
        <span title={value} className="truncate block">
          {value}
        </span>
      )
    },
    {
      key: 'auditadoX',
      label: 'Auditado Por',
      sortable: true,
      className: 'text-gray-900 max-w-xs truncate',
      render: (value) => (
        <span title={value} className="truncate block font-medium">
          {value || 'No especificado'}
        </span>
      )
    },
    {
      key: 'renglones',
      label: 'Medicamentos',
      sortable: true,
      className: 'text-center text-gray-900',
      render: (value) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {value}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Acciones',
      className: 'text-center',
      render: (_, row) => (
        <div className="flex justify-center space-x-2">
          <Link
            to={`/auditoria/${row.id}`}
            className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            title="Ver detalles"
          >
            <EyeIcon className="h-4 w-4 mr-1" />
            Ver
          </Link>
        </div>
      )
    }
  ];

  // Cargar auditorías
  const loadAuditorias = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError('');
      
      const result = await auditoriasService.getHistoricas(filters);
      
      if (result.success) {
        setAuditorias(result.data);
        setPagination({
          total: result.total,
          totalPages: Math.ceil(result.total / filters.limit),
          currentPage: filters.page
        });
      } else {
        setError(result.message);
        setAuditorias([]);
      }
    } catch (error) {
      console.error('Error cargando auditorías históricas:', error);
      setError('Error inesperado al cargar las auditorías históricas');
      setAuditorias([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters]);

  // Efecto para cargar datos iniciales
  useEffect(() => {
    loadAuditorias();
  }, [loadAuditorias]);

  // Manejar búsqueda
  const handleSearch = (searchTerm) => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm,
      page: 1
    }));
  };

  // Manejar cambio de página
  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  // Manejar cambio de límite por página
  const handleLimitChange = (newLimit) => {
    setFilters(prev => ({
      ...prev,
      limit: newLimit,
      page: 1
    }));
  };

  // Manejar ordenamiento
  const handleSort = (column) => {
    setFilters(prev => ({
      ...prev,
      sortBy: column,
      sortOrder: prev.sortBy === column && prev.sortOrder === 'asc' ? 'desc' : 'asc',
      page: 1
    }));
  };

  // Refrescar datos
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAuditorias(false);
  };

  // Exportar a Excel
  const handleExportExcel = async () => {
    try {
      const fecha = new Date().toISOString().slice(0, 7);
      const result = await auditoriasService.generarExcel(fecha);
      
      if (!result.success) {
        setError(result.message);
      }
    } catch (error) {
      console.error('Error exportando Excel:', error);
      setError('Error al generar el archivo Excel');
    }
  };

  // Aplicar filtros de fecha
  const handleDateFilter = () => {
    setFilters(prev => ({
      ...prev,
      page: 1
    }));
  };

  // Limpiar filtros de fecha
  const clearDateFilters = () => {
    setFilters(prev => ({
      ...prev,
      fechaDesde: '',
      fechaHasta: '',
      page: 1
    }));
  };

  // Render loading
  if (loading) {
    return (
      <div className="p-4 lg:p-6">
        <Loading text="Cargando auditorías históricas..." />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Header de la página */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Histórico de Auditoría Médica
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Consultar auditorías ya procesadas y completadas
              </p>
            </div>
            
            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <button 
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200"
              >
                <DocumentTextIcon className={`h-5 w-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Actualizando...' : 'Actualizar'}
              </button>
              
              <button 
                onClick={handleExportExcel}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                Excel
              </button>
              
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200">
                <DocumentTextIcon className="h-5 w-5 mr-2" />
                PDF
              </button>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="px-6 py-4 space-y-4">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Buscar por apellido, nombre, DNI, médico o auditor..."
            value={filters.search}
          />
          
          {/* Filtros de fecha */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha desde
              </label>
              <input
                type="date"
                value={filters.fechaDesde}
                onChange={(e) => setFilters(prev => ({ ...prev, fechaDesde: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha hasta
              </label>
              <input
                type="date"
                value={filters.fechaHasta}
                onChange={(e) => setFilters(prev => ({ ...prev, fechaHasta: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={handleDateFilter}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                Filtrar
              </button>
              
              {(filters.fechaDesde || filters.fechaHasta) && (
                <button
                  onClick={clearDateFilters}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <ErrorMessage 
          message={error} 
          onRetry={() => loadAuditorias()} 
        />
      )}

      {/* Tabla de datos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <DataTable
          columns={columns}
          data={auditorias}
          loading={loading}
          onSort={handleSort}
          sortBy={filters.sortBy}
          sortOrder={filters.sortOrder}
          emptyMessage={
            filters.search 
              ? 'No se encontraron auditorías históricas que coincidan con la búsqueda' 
              : 'No hay auditorías históricas'
          }
          pagination={{
            current: pagination.currentPage,
            total: pagination.total,
            pageSize: filters.limit,
            totalPages: pagination.totalPages,
            onPageChange: handlePageChange,
            onPageSizeChange: handleLimitChange
          }}
        />
      </div>

      {/* Información adicional */}
      {auditorias.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Auditorías completadas
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  Se encontraron <strong>{pagination.total}</strong> auditorías completadas.
                  Todas las auditorías mostradas han sido procesadas y finalizadas.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditoriasHistoricas;
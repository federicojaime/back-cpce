// src/pages/ListadoAuditorias.jsx
import React, { useState } from 'react';
import { auditoriasService } from '../services/auditoriasService';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import Breadcrumb from '../components/common/Breadcrumb';
import DataTable from '../components/common/DataTable';
import { 
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

const ListadoAuditorias = () => {
  const [auditorias, setAuditorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  
  // Estados para filtros
  const [filters, setFilters] = useState({
    dni: '',
    fechaDesde: '',
    fechaHasta: '',
    apellido: '',
    nombre: ''
  });

  // Breadcrumb configuration
  const breadcrumbItems = [
    { name: 'Auditoría', href: '/' },
    { name: 'Listado', href: '/listado', current: true }
  ];

  // Configuración de columnas
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
      label: 'Fecha',
      sortable: true,
      className: 'text-gray-900'
    },
    {
      key: 'medico',
      label: 'Médico',
      sortable: true,
      className: 'text-gray-900 max-w-xs truncate'
    },
    {
      key: 'auditado',
      label: 'Estado',
      sortable: true,
      className: 'text-center',
      render: (value) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value === '1' || value === 1
            ? 'bg-green-100 text-green-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {value === '1' || value === 1 ? 'Auditado' : 'Pendiente'}
        </span>
      )
    },
    {
      key: 'auditadoX',
      label: 'Auditado Por',
      className: 'text-gray-900 max-w-xs truncate',
      render: (value) => value || '-'
    }
  ];

  // Realizar búsqueda
  const handleSearch = async () => {
    if (!filters.dni && !filters.apellido && !filters.nombre && !filters.fechaDesde) {
      setError('Debe completar al menos un campo de búsqueda');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setHasSearched(true);
      
      const result = await auditoriasService.buscarAuditorias(filters);
      
      if (result.success) {
        setAuditorias(result.data);
      } else {
        setError(result.message);
        setAuditorias([]);
      }
    } catch (error) {
      console.error('Error en búsqueda:', error);
      setError('Error inesperado en la búsqueda');
      setAuditorias([]);
    } finally {
      setLoading(false);
    }
  };

  // Limpiar formulario
  const handleClear = () => {
    setFilters({
      dni: '',
      fechaDesde: '',
      fechaHasta: '',
      apellido: '',
      nombre: ''
    });
    setAuditorias([]);
    setError('');
    setHasSearched(false);
  };

  // Exportar resultados
  const handleExport = async () => {
    try {
      const fecha = new Date().toISOString().slice(0, 7);
      const result = await auditoriasService.generarExcel(fecha);
      
      if (!result.success) {
        setError(result.message);
      }
    } catch (error) {
      console.error('Error exportando:', error);
      setError('Error al generar el archivo Excel');
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">
            Listado General de Auditorías
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Búsqueda avanzada con múltiples criterios de filtrado
          </p>
        </div>

        {/* Formulario de búsqueda */}
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* DNI */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                DNI del Paciente
              </label>
              <input
                type="text"
                value={filters.dni}
                onChange={(e) => setFilters(prev => ({ ...prev, dni: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Ej: 12345678"
                maxLength="8"
              />
            </div>

            {/* Apellido */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apellido
              </label>
              <input
                type="text"
                value={filters.apellido}
                onChange={(e) => setFilters(prev => ({ ...prev, apellido: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Apellido del paciente"
              />
            </div>

            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                type="text"
                value={filters.nombre}
                onChange={(e) => setFilters(prev => ({ ...prev, nombre: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Nombre del paciente"
              />
            </div>

            {/* Fecha desde */}
            <div>
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

            {/* Fecha hasta */}
            <div>
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

            {/* Botones */}
            <div className="flex items-end space-x-2">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                {loading ? 'Buscando...' : 'Buscar'}
              </button>
              
              <button
                onClick={handleClear}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FunnelIcon className="h-4 w-4 mr-2" />
                Limpiar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <ErrorMessage 
          message={error} 
          onRetry={handleSearch}
          showRetry={hasSearched}
        />
      )}

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <Loading text="Realizando búsqueda..." />
        </div>
      )}

      {/* Resultados */}
      {!loading && hasSearched && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Header de resultados */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Resultados de la búsqueda
              </h3>
              <p className="text-sm text-gray-500">
                {auditorias.length} auditorías encontradas
              </p>
            </div>
            
            {auditorias.length > 0 && (
              <button
                onClick={handleExport}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                Exportar Excel
              </button>
            )}
          </div>

          {/* Tabla */}
          <DataTable
            columns={columns}
            data={auditorias}
            loading={false}
            emptyMessage="No se encontraron auditorías con los criterios especificados"
          />
        </div>
      )}

      {/* Instrucciones iniciales */}
      {!hasSearched && !loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <MagnifyingGlassIcon className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Búsqueda avanzada de auditorías
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Complete al menos uno de los campos de búsqueda para obtener resultados. 
                  Puede combinar múltiples criterios para refinar su búsqueda.
                </p>
                <ul className="mt-2 list-disc list-inside">
                  <li>Use el DNI para búsquedas exactas</li>
                  <li>Los campos de texto buscan coincidencias parciales</li>
                  <li>Las fechas permiten filtrar por rango temporal</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListadoAuditorias;
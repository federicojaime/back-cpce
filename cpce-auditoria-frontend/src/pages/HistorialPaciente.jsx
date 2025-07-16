// src/pages/HistorialPaciente.jsx
import React, { useState } from 'react';
import { auditoriasService } from '../services/auditoriasService';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import Breadcrumb from '../components/common/Breadcrumb';
import DataTable from '../components/common/DataTable';
import { 
  UserIcon,
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  PhoneIcon,
  EnvelopeIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';

const HistorialPaciente = () => {
  const [paciente, setPaciente] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  
  // Estados para filtros
  const [filters, setFilters] = useState({
    dni: '',
    fechaDesde: '',
    fechaHasta: ''
  });

  // Breadcrumb configuration
  const breadcrumbItems = [
    { name: 'Auditoría', href: '/' },
    { name: 'Historial Paciente', href: '/historial-paciente', current: true }
  ];

  // Configuración de columnas para el historial
  const columns = [
    {
      key: 'fecha_audi',
      label: 'Fecha Auditoría',
      sortable: true,
      className: 'text-gray-900'
    },
    {
      key: 'medico',
      label: 'Médico Prescriptor',
      className: 'text-gray-900 max-w-xs truncate'
    },
    {
      key: 'nombre_comercial',
      label: 'Medicamento',
      className: 'text-gray-900 font-medium'
    },
    {
      key: 'monodroga',
      label: 'Monodroga',
      className: 'text-gray-900 text-sm'
    },
    {
      key: 'presentacion',
      label: 'Presentación',
      className: 'text-gray-900 text-sm'
    },
    {
      key: 'cantprescripta',
      label: 'Cantidad',
      className: 'text-center text-gray-900'
    },
    {
      key: 'posologia',
      label: 'Posología',
      className: 'text-gray-900 max-w-xs truncate',
      render: (value) => (
        <span title={value} className="truncate block">
          {value}
        </span>
      )
    },
    {
      key: 'estado_auditoria1',
      label: 'Estado',
      className: 'text-center',
      render: (value, row) => {
        const estado = value || row.estado_auditoria2 || row.estado_auditoria3;
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            estado === '1' || estado === 1
              ? 'bg-green-100 text-green-800'
              : estado === '2' || estado === 2
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {estado === '1' || estado === 1 ? 'Aprobado' : 
             estado === '2' || estado === 2 ? 'Rechazado' : 'Pendiente'}
          </span>
        );
      }
    },
    {
      key: 'auditadoX',
      label: 'Auditado Por',
      className: 'text-gray-900 text-sm',
      render: (value) => value || '-'
    }
  ];

  // Realizar búsqueda
  const handleSearch = async () => {
    if (!filters.dni || filters.dni.length < 7) {
      setError('El DNI debe tener al menos 7 dígitos');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setHasSearched(true);
      
      const result = await auditoriasService.getHistorialPaciente(filters);
      
      if (result.success) {
        setPaciente(result.paciente);
        setHistorial(result.data);
      } else {
        setError(result.message);
        setPaciente(null);
        setHistorial([]);
      }
    } catch (error) {
      console.error('Error obteniendo historial:', error);
      setError('Error inesperado al obtener el historial del paciente');
      setPaciente(null);
      setHistorial([]);
    } finally {
      setLoading(false);
    }
  };

  // Limpiar búsqueda
  const handleClear = () => {
    setFilters({
      dni: '',
      fechaDesde: '',
      fechaHasta: ''
    });
    setPaciente(null);
    setHistorial([]);
    setError('');
    setHasSearched(false);
  };

  // Exportar historial
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
            Historial de Paciente
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Consultar el historial completo de auditorías de un paciente específico
          </p>
        </div>

        {/* Formulario de búsqueda */}
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* DNI */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                DNI del Paciente *
              </label>
              <input
                type="text"
                value={filters.dni}
                onChange={(e) => setFilters(prev => ({ ...prev, dni: e.target.value.replace(/\D/g, '') }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Ej: 12345678"
                maxLength="8"
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
                disabled={loading || !filters.dni}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                {loading ? 'Buscando...' : 'Buscar'}
              </button>
              
              <button
                onClick={handleClear}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
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
          <Loading text="Obteniendo historial del paciente..." />
        </div>
      )}

      {/* Datos del paciente */}
      {paciente && !loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <UserIcon className="h-5 w-5 mr-2" />
              Información del Paciente
            </h3>
          </div>
          
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <IdentificationIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {paciente.apellidoNombre}
                  </p>
                  <p className="text-sm text-gray-500">DNI: {paciente.dni}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <CalendarIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {paciente.edad} años
                  </p>
                  <p className="text-sm text-gray-500">Sexo: {paciente.sexo}</p>
                </div>
              </div>
              
              {paciente.telefono && (
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <PhoneIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {paciente.telefono}
                    </p>
                    <p className="text-sm text-gray-500">Teléfono</p>
                  </div>
                </div>
              )}
              
              {paciente.email && (
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <EnvelopeIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {paciente.email}
                    </p>
                    <p className="text-sm text-gray-500">Email</p>
                  </div>
                </div>
              )}
            </div>
            
            {(paciente.talla || paciente.peso) && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  {paciente.talla && (
                    <div>
                      <p className="text-sm text-gray-500">Talla</p>
                      <p className="text-sm font-medium text-gray-900">{paciente.talla} cm</p>
                    </div>
                  )}
                  {paciente.peso && (
                    <div>
                      <p className="text-sm text-gray-500">Peso</p>
                      <p className="text-sm font-medium text-gray-900">{paciente.peso} kg</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Historial de auditorías */}
      {!loading && hasSearched && paciente && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Header del historial */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Historial de Auditorías
              </h3>
              <p className="text-sm text-gray-500">
                {historial.length} registros encontrados
              </p>
            </div>
            
            {historial.length > 0 && (
              <button
                onClick={handleExport}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                Exportar Excel
              </button>
            )}
          </div>

          {/* Tabla de historial */}
          <DataTable
            columns={columns}
            data={historial}
            loading={false}
            emptyMessage="No se encontraron auditorías para este paciente en el período especificado"
          />
        </div>
      )}

      {/* Instrucciones iniciales */}
      {!hasSearched && !loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <UserIcon className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Consulta de historial de paciente
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Ingrese el DNI del paciente para consultar su historial completo de auditorías médicas.
                </p>
                <ul className="mt-2 list-disc list-inside">
                  <li>El DNI es obligatorio y debe tener al menos 7 dígitos</li>
                  <li>Las fechas son opcionales para filtrar por período</li>
                  <li>Se mostrarán todos los medicamentos auditados para el paciente</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistorialPaciente;
// src/pages/HistorialPaciente.jsx - CORREGIDO COMPLETAMENTE
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { auditoriasService } from '../services/auditoriasService';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import Breadcrumb from '../components/common/Breadcrumb';
import { 
  UserIcon,
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  PhoneIcon,
  EnvelopeIcon,
  IdentificationIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const HistorialPaciente = () => {
  const [paciente, setPaciente] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para filtros y paginación
  const [filters, setFilters] = useState({
    dni: '',
    fechaDesde: '',
    fechaHasta: '',
    page: 1,
    limit: 10
  });

  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1
  });

  // Ref para controlar búsquedas automáticas
  const isFirstSearch = useRef(true);

  // Breadcrumb configuration
  const breadcrumbItems = [
    { name: 'Auditoría', href: '/' },
    { name: 'Historial Paciente', href: '/historial-paciente', current: true }
  ];

  // Cargar historial con paginación
  const loadHistorial = useCallback(async (showLoading = true, keepPaciente = false) => {
    if (!filters.dni || filters.dni.length < 7) {
      return;
    }

    try {
      if (showLoading) setLoading(true);
      setError('');

      const queryFilters = {
        dni: filters.dni,
        page: filters.page,
        limit: filters.limit
      };

      // Agregar filtros opcionales solo si tienen valor
      if (filters.fechaDesde) {
        queryFilters.fechaDesde = filters.fechaDesde;
      }
      if (filters.fechaHasta) {
        queryFilters.fechaHasta = filters.fechaHasta;
      }
      if (searchTerm && searchTerm.trim()) {
        queryFilters.search = searchTerm.trim();
      }

      console.log('Cargando historial con filtros:', queryFilters);
      
      const result = await auditoriasService.getHistorialPaciente(queryFilters);
      
      console.log('Resultado recibido:', result);
      
      if (result.success) {
        if (!keepPaciente || !paciente) {
          setPaciente(result.paciente);
        }
        setHistorial(result.data || []);
        setPagination({
          total: result.total || 0,
          totalPages: result.totalPages || Math.ceil((result.total || 0) / filters.limit),
          currentPage: result.page || filters.page
        });
        
        if (result.data && result.data.length === 0 && !searchTerm) {
          setError('No se encontraron registros para este paciente en el período especificado');
        }
      } else {
        setError(result.message || 'Error al obtener el historial');
        if (!keepPaciente) {
          setPaciente(null);
        }
        setHistorial([]);
        setPagination({ total: 0, totalPages: 0, currentPage: 1 });
      }
    } catch (error) {
      console.error('Error obteniendo historial:', error);
      setError('Error inesperado al obtener el historial del paciente');
      if (!keepPaciente) {
        setPaciente(null);
      }
      setHistorial([]);
      setPagination({ total: 0, totalPages: 0, currentPage: 1 });
    } finally {
      setLoading(false);
    }
  }, [filters.dni, filters.page, filters.limit, filters.fechaDesde, filters.fechaHasta, searchTerm, paciente]);

  // Efecto para cargar datos cuando cambia la página o el límite
  useEffect(() => {
    if (hasSearched && !isFirstSearch.current) {
      loadHistorial(true, true);
    }
  }, [filters.page, filters.limit]);

  // Efecto para búsqueda con debounce
  useEffect(() => {
    if (hasSearched && !isFirstSearch.current) {
      const timeoutId = setTimeout(() => {
        setFilters(prev => ({ ...prev, page: 1 }));
        loadHistorial(true, true);
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm]);

  // Realizar búsqueda inicial o aplicar filtros de fecha
  const handleSearch = async () => {
    if (!filters.dni || filters.dni.length < 7) {
      setError('El DNI debe tener al menos 7 dígitos');
      return;
    }

    setHasSearched(true);
    isFirstSearch.current = false;
    setFilters(prev => ({ ...prev, page: 1 }));
    await loadHistorial(true, false);
  };

  // Limpiar búsqueda
  const handleClear = () => {
    isFirstSearch.current = true;
    setFilters({
      dni: '',
      fechaDesde: '',
      fechaHasta: '',
      page: 1,
      limit: 10
    });
    setSearchTerm('');
    setPaciente(null);
    setHistorial([]);
    setError('');
    setHasSearched(false);
    setPagination({
      total: 0,
      totalPages: 0,
      currentPage: 1
    });
  };

  // Manejar cambio de página
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    console.log('Cambiando a página:', newPage);
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  // Manejar cambio de tamaño de página
  const handlePageSizeChange = (newSize) => {
    console.log('Cambiando tamaño a:', newSize);
    setFilters(prev => ({ ...prev, limit: parseInt(newSize), page: 1 }));
  };

  // Exportar historial
  const handleExport = async () => {
    try {
      const exportFilters = {
        dni: filters.dni,
        fechaDesde: filters.fechaDesde,
        fechaHasta: filters.fechaHasta
      };
      
      const result = await auditoriasService.exportarHistorialPaciente(exportFilters);
      
      if (!result.success) {
        setError(result.message);
      }
    } catch (error) {
      console.error('Error exportando:', error);
      setError('Error al generar el archivo Excel');
    }
  };

  // Renderizar estado de medicamento - ESTE ES TEMPORAL, DEBERÍAS USAR DATOS REALES
  const renderEstadoMedicamento = (item, mes) => {
    // Si tienes datos reales de estados por mes, úsalos aquí
    // Por ejemplo: item.estados && item.estados[`mes${mes}`]
    
    // Por ahora, verifico si el medicamento tiene estado
    if (item.estado_auditoria === 'APROBADO') {
      return <CheckCircleIcon className="h-4 w-4 text-green-500" title="Aprobado" />;
    } else if (item.estado_auditoria === 'RECHAZADO') {
      return <XCircleIcon className="h-4 w-4 text-red-500" title="Rechazado" />;
    } else if (item.estado_auditoria === 'OBSERVADO') {
      return <ClockIcon className="h-4 w-4 text-yellow-500" title="Observado" />;
    }
    return <span className="text-gray-400">-</span>;
  };

  // Generar array de páginas para mostrar
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    let startPage = 1;
    let endPage = pagination.totalPages;

    if (pagination.totalPages > maxPagesToShow) {
      const halfPages = Math.floor(maxPagesToShow / 2);
      
      if (pagination.currentPage <= halfPages) {
        endPage = maxPagesToShow;
      } else if (pagination.currentPage + halfPages >= pagination.totalPages) {
        startPage = pagination.totalPages - maxPagesToShow + 1;
      } else {
        startPage = pagination.currentPage - halfPages;
        endPage = pagination.currentPage + halfPages;
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">
            HISTORIAL DE PACIENTE
          </h1>
        </div>

        {/* Filtros */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de DNI:
              </label>
              <input
                type="text"
                value={filters.dni}
                onChange={(e) => setFilters(prev => ({ ...prev, dni: e.target.value.replace(/\D/g, '') }))}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="16410809"
                maxLength="8"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Desde:
              </label>
              <input
                type="date"
                value={filters.fechaDesde}
                onChange={(e) => setFilters(prev => ({ ...prev, fechaDesde: e.target.value }))
                }
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Hasta:
              </label>
              <input
                type="date"
                value={filters.fechaHasta}
                onChange={(e) => setFilters(prev => ({ ...prev, fechaHasta: e.target.value }))
                }
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleSearch}
                disabled={loading || !filters.dni}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Filtrar
              </button>
              <button
                onClick={handleClear}
                className="px-4 py-2 bg-gray-500 text-white rounded-md text-sm font-medium hover:bg-gray-600"
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
          showRetry={hasSearched && !!filters.dni}
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
            <h3 className="text-lg font-medium text-gray-900">
              Datos del Paciente
            </h3>
          </div>
          
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div>
                <span className="text-gray-600">Apellido y Nombre:</span>
                <div className="font-medium text-blue-600">{paciente.apellidoNombre}</div>
              </div>
              <div>
                <span className="text-gray-600">Altura:</span>
                <div className="font-medium">{paciente.talla || 'N/A'}</div>
              </div>
              <div>
                <span className="text-gray-600">Teléfono:</span>
                <div className="font-medium">{paciente.telefono || 'N/A'}</div>
              </div>
              <div>
                <span className="text-gray-600">DNI:</span>
                <div className="font-medium">{paciente.dni}</div>
              </div>
              <div>
                <span className="text-gray-600">Peso:</span>
                <div className="font-medium">{paciente.peso || 'N/A'}</div>
              </div>
              <div>
                <span className="text-gray-600">Email:</span>
                <div className="font-medium">{paciente.email || 'N/A'}</div>
              </div>
              <div>
                <span className="text-gray-600">Sexo:</span>
                <div className="font-medium">{paciente.sexo}</div>
              </div>
              <div>
                <span className="text-gray-600">Edad:</span>
                <div className="font-medium">{paciente.edad} años</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Búsqueda en el historial */}
      {hasSearched && paciente && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-4 space-y-4 sm:space-y-0">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buscar:
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Buscar en medicamentos, médico, etc..."
                />
              </div>
              {historial.length > 0 && (
                <button
                  onClick={handleExport}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                  Exportar Excel
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tabla de historial */}
      {!loading && hasSearched && paciente && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          
          {/* Tabla con scroll horizontal */}
          <div className="overflow-x-auto" style={{ maxWidth: '100vw' }}>
            <table className="w-full" style={{ minWidth: '1200px' }}>
              <thead className="bg-gray-50">
                <tr className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-2 py-3 text-left border-r border-gray-200 w-20">Fecha</th>
                  <th className="px-2 py-3 text-left border-r border-gray-200 w-24">Auditor</th>
                  <th className="px-2 py-3 text-left border-r border-gray-200 w-32">Médico</th>
                  <th className="px-2 py-3 text-left border-r border-gray-200 w-28">Comercial</th>
                  <th className="px-2 py-3 text-left border-r border-gray-200 w-24">Monodroga</th>
                  <th className="px-2 py-3 text-left border-r border-gray-200 w-32">Presentación</th>
                  <th className="px-1 py-3 text-center border-r border-gray-200 w-12">Cant</th>
                  <th className="px-1 py-3 text-center border-r border-gray-200 w-12">Dos</th>
                  <th className="px-1 py-3 text-center border-r border-gray-200 w-12">Cob</th>
                  <th className="px-1 py-3 text-center border-r border-gray-200 w-12">M1</th>
                  <th className="px-1 py-3 text-center border-r border-gray-200 w-12">M2</th>
                  <th className="px-1 py-3 text-center border-r border-gray-200 w-12">M3</th>
                  <th className="px-1 py-3 text-center border-r border-gray-200 w-12">M4</th>
                  <th className="px-1 py-3 text-center border-r border-gray-200 w-12">M5</th>
                  <th className="px-1 py-3 text-center border-r border-gray-200 w-12">M6</th>
                  <th className="px-2 py-3 text-center w-16">Ver</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {historial.length === 0 ? (
                  <tr>
                    <td colSpan="16" className="px-6 py-12 text-center text-gray-500">
                      No se encontraron medicamentos para este paciente
                    </td>
                  </tr>
                ) : (
                  historial.map((item, index) => (
                    <tr key={item.id || index} className="hover:bg-gray-50 text-xs">
                      <td className="px-2 py-2 border-r border-gray-200">
                        {item.fecha_auditoria ? new Date(item.fecha_auditoria).toLocaleDateString('es-AR') : '-'}
                      </td>
                      <td className="px-2 py-2 border-r border-gray-200 text-blue-600">
                        {item.auditor || 'José Garrido'}
                      </td>
                      <td className="px-2 py-2 border-r border-gray-200 truncate" title={item.medico}>
                        {(item.medico || '').substring(0, 20)}{(item.medico || '').length > 20 ? '...' : ''}
                      </td>
                      <td className="px-2 py-2 border-r border-gray-200 font-medium">
                        {item.nombre_comercial || '-'}
                      </td>
                      <td className="px-2 py-2 border-r border-gray-200">
                        {item.monodroga || '-'}
                      </td>
                      <td className="px-2 py-2 border-r border-gray-200 truncate" title={item.presentacion}>
                        {item.presentacion || '-'}
                      </td>
                      <td className="px-1 py-2 text-center border-r border-gray-200">
                        {item.cantprescripta || '-'}
                      </td>
                      <td className="px-1 py-2 text-center border-r border-gray-200">
                        {item.posologia || '-'}
                      </td>
                      <td className="px-1 py-2 text-center border-r border-gray-200">
                        <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">
                          {item.cobertura || '-'}
                        </span>
                      </td>
                      
                      {/* Meses con estados */}
                      {[1, 2, 3, 4, 5, 6].map((mes) => (
                        <td key={mes} className="px-1 py-2 text-center border-r border-gray-200">
                          {renderEstadoMedicamento(item, mes)}
                        </td>
                      ))}
                      
                      <td className="px-2 py-2 text-center">
                        <Link
                          to={`/auditoria/${item.idauditoria || item.id}/historica`}
                          className="inline-flex items-center px-1 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                          title="Ver auditoría"
                        >
                          <EyeIcon className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {historial.length > 0 && pagination.totalPages > 1 && (
            <div className="border-t border-gray-200 px-4 py-3">
              <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
                
                {/* Información de registros */}
                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <div className="text-sm text-gray-700">
                    Mostrando <span className="font-medium">{((pagination.currentPage - 1) * filters.limit) + 1}</span> al{' '}
                    <span className="font-medium">{Math.min(pagination.currentPage * filters.limit, pagination.total)}</span> de{' '}
                    <span className="font-medium">{pagination.total}</span> registros
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-700">Mostrar</span>
                    <select
                      value={filters.limit}
                      onChange={(e) => handlePageSizeChange(e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    <span className="text-sm text-gray-700">por página</span>
                  </div>
                </div>

                {/* Controles de paginación */}
                <div className="flex items-center space-x-1">
                  {/* Botón Primera página */}
                  {pagination.currentPage > 2 && (
                    <>
                      <button
                        onClick={() => handlePageChange(1)}
                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        1
                      </button>
                      {pagination.currentPage > 3 && (
                        <span className="px-2 text-gray-500">...</span>
                      )}
                    </>
                  )}

                  {/* Números de página */}
                  {getPageNumbers().map(pageNum => (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                        pageNum === pagination.currentPage
                          ? 'bg-blue-600 text-white border border-blue-600'
                          : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  {/* Botón Última página */}
                  {pagination.currentPage < pagination.totalPages - 1 && (
                    <>
                      {pagination.currentPage < pagination.totalPages - 2 && (
                        <span className="px-2 text-gray-500">...</span>
                      )}
                      <button
                        onClick={() => handlePageChange(pagination.totalPages)}
                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        {pagination.totalPages}
                      </button>
                    </>
                  )}

                  {/* Botones Anterior/Siguiente */}
                  <div className="flex space-x-1 ml-2">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.totalPages}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
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
                  <li>Use la búsqueda para filtrar resultados específicos</li>
                  <li>Use "Ver" para acceder al detalle de cada auditoría</li>
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
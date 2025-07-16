// src/pages/AuditoriasPendientes.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { auditoriasService } from '../services/auditoriasService';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import Breadcrumb from '../components/common/Breadcrumb';
import {
    EyeIcon,
    DocumentArrowDownIcon,
    DocumentTextIcon,
    MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const AuditoriasPendientes = () => {
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
        sortBy: 'fecha',
        sortOrder: 'desc'
    });

    const [pagination, setPagination] = useState({
        total: 0,
        totalPages: 0,
        currentPage: 1
    });

    // Breadcrumb configuration
    const breadcrumbItems = [
        { name: 'Auditoría', href: '/' },
        { name: 'Pendientes', href: '/pendientes', current: true }
    ];

    // Cargar auditorías
    const loadAuditorias = useCallback(async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true);
            setError('');

            // Construir parámetros de consulta
            const queryParams = new URLSearchParams();
            if (filters.search) queryParams.append('search', filters.search);
            queryParams.append('page', filters.page);
            queryParams.append('limit', filters.limit);

            const url = `/auditorias/pendientes?${queryParams.toString()}`;
            const response = await fetch(`${import.meta.env.VITE_API_URL}${url}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('cpce_token')}`
                }
            });

            const result = await response.json();

            if (result.success) {
                setAuditorias(result.data || []);
                setPagination({
                    total: result.total || 0,
                    totalPages: result.totalPages || 0,
                    currentPage: result.page || 1
                });
            } else {
                setError(result.message || 'Error al cargar auditorías');
                setAuditorias([]);
                setPagination({ total: 0, totalPages: 0, currentPage: 1 });
            }
        } catch (error) {
            console.error('Error cargando auditorías:', error);
            setError('Error inesperado al cargar las auditorías');
            setAuditorias([]);
            setPagination({ total: 0, totalPages: 0, currentPage: 1 });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [filters]);

    // Efecto para cargar datos cuando cambian los filtros
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            loadAuditorias();
        }, 300); // Debounce de 300ms para la búsqueda

        return () => clearTimeout(timeoutId);
    }, [filters]);

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

    // Refrescar datos
    const handleRefresh = async () => {
        setRefreshing(true);
        await loadAuditorias(false);
    };

    // Exportar a Excel
    const handleExportExcel = async () => {
        try {
            const fecha = new Date().toISOString().slice(0, 7); // YYYY-MM
            const result = await auditoriasService.generarExcel(fecha);

            if (!result.success) {
                setError(result.message);
            }
        } catch (error) {
            console.error('Error exportando Excel:', error);
            setError('Error al generar el archivo Excel');
        }
    };

    // Render loading
    if (loading) {
        return (
            <div className="p-4 lg:p-6">
                <Loading text="Cargando auditorías pendientes..." />
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
                                Pacientes para Auditoría Médica
                            </h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Gestionar auditorías pendientes de procesamiento
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
                        </div>
                    </div>
                </div>

                {/* Barra de búsqueda y filtros */}
                <div className="px-6 py-4">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Buscar por apellido, nombre, DNI o médico..."
                        />
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
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <div className="border-t border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                                    Apellido
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                                    Nombre
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                                    DNI
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                                    Fecha
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                                    Médico
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                                    Medicamentos
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                                    Meses
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                            <span className="mt-2 text-sm text-gray-500">Cargando auditorías...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : auditorias.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center">
                                            <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <span className="mt-2 text-sm text-gray-500">
                                                {filters.search ? 'No se encontraron auditorías que coincidan con la búsqueda' : 'No hay auditorías pendientes'}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                auditorias.map((auditoria, index) => (
                                    <tr key={auditoria.id || index} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200">
                                            {auditoria.apellido}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                                            {auditoria.nombre}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono border-r border-gray-200">
                                            {auditoria.dni}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                                            {auditoria.fecha}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate border-r border-gray-200">
                                            <span title={auditoria.medico} className="truncate block">
                                                {auditoria.medico}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center border-r border-gray-200">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {auditoria.renglones}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 border-r border-gray-200">
                                            {auditoria.meses}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <Link
                                                to={`/auditoria/${auditoria.id}`}
                                                className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                                                title="Ver auditoría"
                                            >
                                                <EyeIcon className="h-4 w-4 mr-1" />
                                                Ver
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Paginación */}
            {auditorias.length > 0 && (
                <div className="bg-white px-4 py-3 sm:px-6 border border-gray-200 rounded-lg shadow-sm">
                    <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">

                        {/* Información de registros y selector de página */}
                        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
                            <div className="text-sm text-gray-700">
                                Mostrando <span className="font-medium">{pagination.total === 0 ? 0 : (pagination.currentPage - 1) * filters.limit + 1}</span> al{' '}
                                <span className="font-medium">{Math.min(pagination.currentPage * filters.limit, pagination.total)}</span> de{' '}
                                <span className="font-medium">{pagination.total}</span> registros
                            </div>

                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-700">Mostrar</span>
                                <select
                                    value={filters.limit}
                                    onChange={(e) => handleLimitChange(Number(e.target.value))}
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
                            {/* Botón anterior */}
                            <button
                                onClick={() => handlePageChange(pagination.currentPage - 1)}
                                disabled={pagination.currentPage === 1}
                                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                                Anterior
                            </button>

                            {/* Números de página */}
                            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                let pageNum;
                                if (pagination.totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (pagination.currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (pagination.currentPage >= pagination.totalPages - 2) {
                                    pageNum = pagination.totalPages - 4 + i;
                                } else {
                                    pageNum = pagination.currentPage - 2 + i;
                                }

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => handlePageChange(pageNum)}
                                        className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${pageNum === pagination.currentPage
                                                ? 'bg-blue-600 text-white border border-blue-600'
                                                : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}

                            {/* Botón siguiente */}
                            <button
                                onClick={() => handlePageChange(pagination.currentPage + 1)}
                                disabled={pagination.currentPage === pagination.totalPages}
                                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Información adicional */}
            {auditorias.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800">
                                Información sobre las auditorías
                            </h3>
                            <div className="mt-2 text-sm text-blue-700">
                                <p>
                                    Se encontraron <strong>{pagination.total}</strong> auditorías pendientes de procesamiento.
                                    {user?.rol === '9' && ' Como médico auditor, solo puedes ver las auditorías enviadas por farmacéuticos.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuditoriasPendientes;
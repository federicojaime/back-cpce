import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { auditoriasService } from '../services/auditoriasService';
import { useAuth } from '../context/AuthContext';
import TableWithFilters from '../components/common/TableWithFilters';
import {
    EyeIcon,
    DocumentArrowDownIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';

const AuditoriasPendientes = () => {
    const { user } = useAuth();
    const [auditorias, setAuditorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        page: 1,
        limit: 10
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

    // Columnas de la tabla
    const columns = [
        { key: 'apellido', label: 'Apellido', className: 'whitespace-nowrap text-sm font-medium text-gray-900' },
        { key: 'nombre', label: 'Nombre', className: 'whitespace-nowrap text-sm text-gray-900' },
        { key: 'dni', label: 'DNI', className: 'whitespace-nowrap text-sm text-gray-900 font-mono' },
        { key: 'fecha', label: 'Fecha', className: 'whitespace-nowrap text-sm text-gray-900' },
        {
            key: 'medico',
            label: 'Médico',
            className: 'text-sm text-gray-900 max-w-xs truncate',
            render: (row) => (
                <span title={row.medico} className="truncate block">
                    {row.medico}
                </span>
            )
        },
        {
            key: 'renglones',
            label: 'Medicamentos',
            align: 'center',
            className: 'whitespace-nowrap text-center',
            render: (row) => (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {row.renglones}
                </span>
            )
        },
        {
            key: 'meses',
            label: 'Meses',
            align: 'center',
            className: 'whitespace-nowrap text-center text-sm text-gray-900'
        },
        {
            key: 'acciones',
            label: 'Acciones',
            align: 'center',
            className: 'whitespace-nowrap text-center',
            render: (row) => (
                <Link
                    to={`/auditoria/${row.id}`}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                    title="Ver auditoría"
                >
                    <EyeIcon className="h-4 w-4 mr-1" />
                    Ver
                </Link>
            )
        }
    ];

    // Cargar auditorías
    const loadAuditorias = useCallback(async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true);
            setError('');

            const queryParams = new URLSearchParams();
            if (searchTerm) queryParams.append('search', searchTerm);
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
            }
        } catch (error) {
            console.error('Error cargando auditorías:', error);
            setError('Error inesperado al cargar las auditorías');
            setAuditorias([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [searchTerm, filters]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            loadAuditorias();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [loadAuditorias]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadAuditorias(false);
    };

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

    const handleSearchChange = (value) => {
        setSearchTerm(value);
        setFilters(prev => ({ ...prev, page: 1 }));
    };

    const handlePageChange = (newPage) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    const handlePageSizeChange = (newSize) => {
        setFilters(prev => ({ ...prev, limit: newSize, page: 1 }));
    };

    // Acciones personalizadas
    const actions = (
        <>
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
        </>
    );

    // Información adicional
    const additionalInfo = (
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
    );

    return (
        <TableWithFilters
            title="Pacientes para Auditoría Médica"
            subtitle="Gestionar auditorías pendientes de procesamiento"
            breadcrumbItems={breadcrumbItems}
            data={auditorias}
            columns={columns}
            loading={loading}
            error={error}
            refreshing={refreshing}
            searchValue={searchTerm}
            searchPlaceholder="Buscar por apellido, nombre, DNI o médico..."
            onSearchChange={handleSearchChange}
            pagination={pagination}
            pageSize={filters.limit}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            actions={actions}
            onRefresh={handleRefresh}
            emptyMessage="No hay auditorías pendientes"
            emptySearchMessage="No se encontraron auditorías que coincidan con la búsqueda"
            additionalInfo={additionalInfo}
        />
    );
};

export default AuditoriasPendientes;
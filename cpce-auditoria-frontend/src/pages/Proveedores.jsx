// src/pages/Proveedores.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { proveedoresService } from '../services/proveedoresService';
import TableWithFilters from '../components/common/TableWithFilters';
import {
    PlusIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon,
    ArrowPathIcon,
    BuildingOfficeIcon,
    UserGroupIcon,
    CheckCircleIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';

const Proveedores = () => {
    const [proveedores, setProveedores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        page: 1,
        limit: 10,
        activo: true,
        tipo: 'todos'
    });

    const [pagination, setPagination] = useState({
        total: 0,
        totalPages: 0,
        currentPage: 1
    });

    const [stats, setStats] = useState({
        total_proveedores: 0,
        proveedores_activos: 0,
        proveedores_inactivos: 0,
        laboratorios: 0,
        droguerias: 0,
        ambos: 0,
        total_contactos: 0
    });

    // Breadcrumb configuration
    const breadcrumbItems = [
        { name: 'Proveedores', href: '/proveedores', current: true }
    ];

    // Columnas de la tabla
    const columns = [
        { 
            key: 'razon_social', 
            label: 'Razón Social', 
            className: 'text-sm font-medium text-gray-900',
            render: (row) => (
                <Link
                    to={`/proveedores/${row.id_proveedor}`}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                >
                    {row.razon_social}
                </Link>
            )
        },
        { 
            key: 'cuit', 
            label: 'CUIT', 
            className: 'text-sm text-gray-900 font-mono' 
        },
        { 
            key: 'tipo_proveedor', 
            label: 'Tipo', 
            className: 'text-sm text-gray-900',
            render: (row) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    row.tipo_proveedor === 'Laboratorio' ? 'bg-blue-100 text-blue-800' :
                    row.tipo_proveedor === 'Droguería' ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                }`}>
                    {row.tipo_proveedor}
                </span>
            )
        },
        { 
            key: 'email_general', 
            label: 'Email', 
            className: 'text-sm text-gray-900 max-w-xs truncate',
            render: (row) => (
                <span title={row.email_general} className="truncate block">
                    {row.email_general || '-'}
                </span>
            )
        },
        { 
            key: 'telefono_general', 
            label: 'Teléfono', 
            className: 'text-sm text-gray-900' 
        },
        { 
            key: 'total_contactos', 
            label: 'Contactos', 
            align: 'center',
            className: 'text-center',
            render: (row) => (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {row.total_contactos || 0}
                </span>
            )
        },
        { 
            key: 'activo', 
            label: 'Estado', 
            align: 'center',
            className: 'text-center',
            render: (row) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    row.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                    {row.activo ? (
                        <>
                            <CheckCircleIcon className="h-3 w-3 mr-1" />
                            Activo
                        </>
                    ) : (
                        <>
                            <XCircleIcon className="h-3 w-3 mr-1" />
                            Inactivo
                        </>
                    )}
                </span>
            )
        },
        { 
            key: 'acciones', 
            label: 'Acciones',
            align: 'center',
            className: 'text-center',
            render: (row) => (
                <div className="flex justify-center space-x-2">
                    <Link
                        to={`/proveedores/${row.id_proveedor}`}
                        className="text-blue-600 hover:text-blue-800"
                        title="Ver proveedor"
                    >
                        <EyeIcon className="h-5 w-5" />
                    </Link>
                    <Link
                        to={`/proveedores/${row.id_proveedor}/editar`}
                        className="text-yellow-600 hover:text-yellow-800"
                        title="Editar proveedor"
                    >
                        <PencilIcon className="h-5 w-5" />
                    </Link>
                    <button
                        onClick={() => handleDelete(row.id_proveedor, row.razon_social)}
                        className="text-red-600 hover:text-red-800"
                        title="Desactivar proveedor"
                    >
                        <TrashIcon className="h-5 w-5" />
                    </button>
                </div>
            )
        }
    ];

    // Cargar proveedores
    const loadProveedores = useCallback(async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true);
            setError('');

            const params = {
                ...filters,
                search: searchTerm
            };

            const result = await proveedoresService.getProveedores(params);

            if (result.success) {
                setProveedores(result.data);
                setPagination(result.pagination);
            } else {
                setError(result.message);
                setProveedores([]);
            }
        } catch (error) {
            console.error('Error cargando proveedores:', error);
            setError('Error inesperado al cargar proveedores');
            setProveedores([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [searchTerm, filters]);

    // Cargar estadísticas
    const loadStats = useCallback(async () => {
        try {
            const result = await proveedoresService.getEstadisticas();
            if (result.success) {
                setStats(result.data);
            }
        } catch (error) {
            console.error('Error cargando estadísticas:', error);
        }
    }, []);

    // Efectos
    useEffect(() => {
        loadProveedores();
        loadStats();
    }, [loadProveedores, loadStats]);

    // Debounce para búsqueda
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setFilters(prev => ({ ...prev, page: 1 }));
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    // Manejar eliminación
    const handleDelete = async (id, nombre) => {
        if (!window.confirm(`¿Está seguro de desactivar el proveedor "${nombre}"?`)) {
            return;
        }

        try {
            const result = await proveedoresService.deleteProveedor(id);
            
            if (result.success) {
                await loadProveedores(false);
                await loadStats();
            } else {
                setError(result.message);
            }
        } catch (error) {
            console.error('Error eliminando proveedor:', error);
            setError('Error al desactivar el proveedor');
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadProveedores(false);
        await loadStats();
    };

    const handleSearchChange = (value) => {
        setSearchTerm(value);
    };

    const handlePageChange = (newPage) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    const handlePageSizeChange = (newSize) => {
        setFilters(prev => ({ ...prev, limit: newSize, page: 1 }));
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    };

    // Filtros adicionales
    const extraFilters = (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                </label>
                <select
                    value={filters.activo}
                    onChange={(e) => handleFilterChange('activo', e.target.value === 'true')}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value={true}>Activos</option>
                    <option value={false}>Inactivos</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo
                </label>
                <select
                    value={filters.tipo}
                    onChange={(e) => handleFilterChange('tipo', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="todos">Todos</option>
                    <option value="Laboratorio">Laboratorio</option>
                    <option value="Droguería">Droguería</option>
                    <option value="Ambos">Ambos</option>
                </select>
            </div>
        </div>
    );

    // Acciones del header
    const actions = (
        <>
            <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
                <ArrowPathIcon className={`h-5 w-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Actualizando...' : 'Actualizar'}
            </button>

            <Link
                to="/proveedores/nuevo"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
                <PlusIcon className="h-5 w-5 mr-2" />
                Nuevo Proveedor
            </Link>
        </>
    );

    // Información adicional con estadísticas
    const additionalInfo = (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Estadísticas</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.total_proveedores}</div>
                    <div className="text-xs text-gray-500">Total</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.proveedores_activos}</div>
                    <div className="text-xs text-gray-500">Activos</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.laboratorios}</div>
                    <div className="text-xs text-gray-500">Laboratorios</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{stats.total_contactos}</div>
                    <div className="text-xs text-gray-500">Contactos</div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Filtros personalizados */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Filtros de Búsqueda</h3>
                    {extraFilters}
                </div>
            </div>

            {/* Tabla principal */}
            <TableWithFilters
                title="Gestión de Proveedores"
                subtitle="Administrar proveedores de medicación de alto costo"
                breadcrumbItems={breadcrumbItems}
                data={proveedores}
                columns={columns}
                loading={loading}
                error={error}
                refreshing={refreshing}
                searchValue={searchTerm}
                searchPlaceholder="Buscar por razón social, CUIT, email o localidad..."
                onSearchChange={handleSearchChange}
                pagination={pagination}
                pageSize={filters.limit}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                actions={actions}
                onRefresh={handleRefresh}
                emptyMessage="No hay proveedores registrados"
                emptySearchMessage="No se encontraron proveedores que coincidan con la búsqueda"
                additionalInfo={additionalInfo}
            />
        </div>
    );
};

export default Proveedores;
// src/pages/Proveedores.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, PencilIcon, EyeIcon, TrashIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { getProveedores, deleteProveedor, exportProveedoresToExcel } from '../services/proveedoresService';
import DataTable from '../components/common/DataTable';
import SearchBar from '../components/common/SearchBar';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';

const Proveedores = () => {
    const [proveedores, setProveedores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({
        tipo: '',
        activo: ''
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
                    {row.activo ? 'Activo' : 'Inactivo'}
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
                page: currentPage,
                search: searchTerm,
                ...filters
            };

            const result = await getProveedores(params);

            if (result.success) {
                setProveedores(result.data);
                setTotalPages(result.totalPages);
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
        }
    }, [searchTerm, filters, currentPage]);

    // Efectos
    useEffect(() => {
        loadProveedores();
    }, [loadProveedores]);

    // Debounce para búsqueda
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setCurrentPage(1);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    // Manejar eliminación
    const handleDelete = async (id, nombre) => {
        if (!window.confirm(`¿Está seguro de desactivar el proveedor "${nombre}"?`)) {
            return;
        }

        try {
            const result = await deleteProveedor(id);
            
            if (result.success) {
                await loadProveedores();
            } else {
                setError(result.message);
            }
        } catch (error) {
            console.error('Error eliminando proveedor:', error);
            setError('Error al desactivar el proveedor');
        }
    };

    const handleExport = async () => {
        try {
            await exportProveedoresToExcel({ ...filters, search: searchTerm });
        } catch (err) {
            setError('Error al exportar los datos');
        }
    };

    const handleSearch = (value) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
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
                onClick={handleExport}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
                Exportar Excel
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

    if (loading) return <Loading text="Cargando proveedores..." />;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-gray-900">Proveedores</h1>
                    <div className="flex space-x-3">
                        {actions}
                    </div>
                </div>

                <div className="flex items-center space-x-4 mb-4">
                    <div className="flex-1">
                        <SearchBar
                            value={searchTerm}
                            onChange={handleSearch}
                            placeholder="Buscar por nombre, CUIT..."
                        />
                    </div>
                    <select
                        value={filters.tipo}
                        onChange={(e) => setFilters({ ...filters, tipo: e.target.value })}
                        className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="">Todos los tipos</option>
                        <option value="Laboratorio">Laboratorio</option>
                        <option value="Droguería">Droguería</option>
                    </select>
                    <select
                        value={filters.activo}
                        onChange={(e) => setFilters({ ...filters, activo: e.target.value })}
                        className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="">Todos los estados</option>
                        <option value="true">Activos</option>
                        <option value="false">Inactivos</option>
                    </select>
                </div>
            </div>

            {error && <ErrorMessage message={error} />}

            <DataTable
                columns={columns}
                data={proveedores}
                pagination={{
                    currentPage,
                    totalPages,
                    onPageChange: setCurrentPage
                }}
            />
        </div>
    );
};

export default Proveedores;
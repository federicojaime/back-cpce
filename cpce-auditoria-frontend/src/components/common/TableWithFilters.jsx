import React from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Breadcrumb from './Breadcrumb';
import Loading from './Loading';
import ErrorMessage from './ErrorMessage';

const TableWithFilters = ({
    // Props de configuración
    title,
    subtitle,
    breadcrumbItems,
    
    // Props de datos
    data,
    columns,
    loading,
    error,
    refreshing,
    
    // Props de búsqueda y filtros
    searchValue,
    searchPlaceholder = 'Buscar...',
    onSearchChange,
    
    // Props de paginación
    pagination,
    pageSize,
    onPageChange,
    onPageSizeChange,
    
    // Props de acciones
    actions,
    onRefresh,
    
    // Props de renderizado personalizado
    emptyMessage = 'No hay datos disponibles',
    emptySearchMessage = 'No se encontraron resultados',
    renderRow,
    additionalInfo
}) => {
    return (
        <div className="p-4 lg:p-6 space-y-6">
            {/* Breadcrumb */}
            {breadcrumbItems && <Breadcrumb items={breadcrumbItems} />}

            {/* Header de la página */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
                            {subtitle && (
                                <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
                            )}
                        </div>

                        {/* Botones de acción */}
                        {actions && (
                            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                                {actions}
                            </div>
                        )}
                    </div>
                </div>

                {/* Barra de búsqueda */}
                <div className="px-6 py-4">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={searchValue}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder={searchPlaceholder}
                        />
                    </div>
                </div>
            </div>

            {/* Mensaje de error */}
            {error && <ErrorMessage message={error} onRetry={onRefresh} />}

            {/* Loading inicial */}
            {loading && !data.length && (
                <Loading text="Cargando datos..." />
            )}

            {/* Tabla de datos */}
            {!loading || data.length > 0 ? (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <div className="border-t border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {columns.map((column, index) => (
                                        <th
                                            key={column.key}
                                            className={`px-6 py-3 text-${column.align || 'left'} text-xs font-medium text-gray-500 uppercase tracking-wider ${
                                                index < columns.length - 1 ? 'border-r border-gray-200' : ''
                                            }`}
                                        >
                                            {column.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {refreshing && !loading ? (
                                    <tr>
                                        <td colSpan={columns.length} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                                <span className="mt-2 text-sm text-gray-500">Actualizando...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : data.length === 0 ? (
                                    <tr>
                                        <td colSpan={columns.length} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center">
                                                <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <span className="mt-2 text-sm text-gray-500">
                                                    {searchValue ? emptySearchMessage : emptyMessage}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    data.map((item, index) => renderRow ? renderRow(item, index) : (
                                        <tr key={item.id || index} className="hover:bg-gray-50">
                                            {columns.map((column, colIndex) => (
                                                <td
                                                    key={column.key}
                                                    className={`px-6 py-4 ${column.className || ''} ${
                                                        colIndex < columns.length - 1 ? 'border-r border-gray-200' : ''
                                                    }`}
                                                >
                                                    {column.render ? column.render(item) : item[column.key]}
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : null}

            {/* Paginación */}
            {data.length > 0 && pagination && (
                <div className="bg-white px-4 py-3 sm:px-6 border border-gray-200 rounded-lg shadow-sm">
                    <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
                        {/* Información de registros y selector de página */}
                        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
                            <div className="text-sm text-gray-700">
                                Mostrando <span className="font-medium">{pagination.total === 0 ? 0 : (pagination.currentPage - 1) * pageSize + 1}</span> al{' '}
                                <span className="font-medium">{Math.min(pagination.currentPage * pageSize, pagination.total)}</span> de{' '}
                                <span className="font-medium">{pagination.total}</span> registros
                            </div>

                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-700">Mostrar</span>
                                <select
                                    value={pageSize}
                                    onChange={(e) => onPageSizeChange(Number(e.target.value))}
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
                            <button
                                onClick={() => onPageChange(pagination.currentPage - 1)}
                                disabled={pagination.currentPage === 1}
                                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                                Anterior
                            </button>

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
                                        onClick={() => onPageChange(pageNum)}
                                        className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                                            pageNum === pagination.currentPage
                                                ? 'bg-blue-600 text-white border border-blue-600'
                                                : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}

                            <button
                                onClick={() => onPageChange(pagination.currentPage + 1)}
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
            {additionalInfo && data.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    {additionalInfo}
                </div>
            )}
        </div>
    );
};

export default TableWithFilters;
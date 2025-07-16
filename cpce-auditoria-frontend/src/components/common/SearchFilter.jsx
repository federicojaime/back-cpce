// src/components/common/SearchFilter.jsx
import React from 'react';
import {
    MagnifyingGlassIcon,
    CalendarIcon,
    FunnelIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

const SearchFilter = ({
    searchValue = '',
    onSearchChange,
    dateFilters = {},
    onDateFilterChange,
    onApplyFilters,
    onClearFilters,
    showDateFilters = true,
    placeholder = 'Buscar...',
    extraFilters = null,
    className = ''
}) => {
    const hasFilters = searchValue || dateFilters.fechaDesde || dateFilters.fechaHasta;

    return (
        <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
            <div className="p-6">

                {/* Búsqueda principal */}
                <div className="mb-4">
                    <div className="relative">
                        <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            value={searchValue}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder={placeholder}
                        />
                    </div>
                </div>

                {/* Filtros adicionales */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                    {/* Filtros de fecha */}
                    {showDateFilters && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Fecha desde
                                </label>
                                <input
                                    type="date"
                                    value={dateFilters.fechaDesde || ''}
                                    onChange={(e) => onDateFilterChange('fechaDesde', e.target.value)}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Fecha hasta
                                </label>
                                <input
                                    type="date"
                                    value={dateFilters.fechaHasta || ''}
                                    onChange={(e) => onDateFilterChange('fechaHasta', e.target.value)}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </>
                    )}

                    {/* Filtros extra personalizables */}
                    {extraFilters && (
                        <div className="md:col-span-1">
                            {extraFilters}
                        </div>
                    )}

                    {/* Botones */}
                    <div className="flex items-end space-x-2">
                        <button
                            onClick={onApplyFilters}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
                        >
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            Filtrar
                        </button>

                        {hasFilters && (
                            <button
                                onClick={onClearFilters}
                                className="px-4 py-2 bg-gray-500 text-white rounded-md text-sm font-medium hover:bg-gray-600 transition-colors flex items-center"
                            >
                                <XMarkIcon className="h-4 w-4 mr-2" />
                                Limpiar
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchFilter;
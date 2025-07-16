// src/components/common/DataTable.jsx
import React from 'react';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import Pagination from './Pagination';

const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  onSort,
  sortBy,
  sortOrder,
  emptyMessage = 'No hay datos disponibles',
  pagination,
  className = ''
}) => {
  
  // Renderizar icono de ordenamiento
  const renderSortIcon = (column) => {
    if (!column.sortable || !onSort) return null;
    
    if (sortBy === column.key) {
      return sortOrder === 'asc' ? (
        <ChevronUpIcon className="w-4 h-4 ml-1" />
      ) : (
        <ChevronDownIcon className="w-4 h-4 ml-1" />
      );
    }
    
    return (
      <div className="flex flex-col ml-1">
        <ChevronUpIcon className="w-3 h-3 text-gray-300" />
        <ChevronDownIcon className="w-3 h-3 text-gray-300 -mt-1" />
      </div>
    );
  };

  // Manejar click en header para ordenamiento
  const handleSort = (column) => {
    if (column.sortable && onSort) {
      onSort(column.key);
    }
  };

  // Renderizar celda
  const renderCell = (column, row, value) => {
    if (column.render) {
      return column.render(value, row);
    }
    return value || '-';
  };

  return (
    <div className={`bg-white ${className}`}>
      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          {/* Header */}
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable && onSort 
                      ? 'cursor-pointer hover:bg-gray-100 transition-colors duration-200' 
                      : ''
                  }`}
                  onClick={() => handleSort(column)}
                >
                  <div className="flex items-center">
                    {column.label}
                    {renderSortIcon(column)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              // Loading state
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="mt-2 text-sm text-gray-500">Cargando datos...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              // Empty state
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center">
                    <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="mt-2 text-sm text-gray-500">{emptyMessage}</span>
                  </div>
                </td>
              </tr>
            ) : (
              // Data rows
              data.map((row, index) => (
                <tr 
                  key={row.id || index} 
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  {columns.map((column) => (
                    <td
                      key={`${row.id || index}-${column.key}`}
                      className={`px-6 py-4 whitespace-nowrap text-sm ${column.className || ''}`}
                    >
                      {renderCell(column, row, row[column.key])}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {pagination && data.length > 0 && (
        <div className="border-t border-gray-200">
          <Pagination {...pagination} />
        </div>
      )}
    </div>
  );
};

export default DataTable;
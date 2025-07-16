// src/components/common/Pagination.jsx
import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const Pagination = ({
  current = 1,
  total = 0,
  pageSize = 10,
  totalPages = 0,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  showSizeChanger = true,
  showTotal = true,
  className = ''
}) => {
  
  // Calcular rango de registros mostrados
  const startRecord = total === 0 ? 0 : (current - 1) * pageSize + 1;
  const endRecord = Math.min(current * pageSize, total);

  // Generar array de páginas a mostrar
  const getPageNumbers = () => {
    const delta = 2; // Número de páginas a mostrar a cada lado de la actual
    const range = [];
    const rangeWithDots = [];

    // Calcular el rango de páginas
    for (
      let i = Math.max(2, current - delta);
      i <= Math.min(totalPages - 1, current + delta);
      i++
    ) {
      range.push(i);
    }

    // Agregar primera página
    if (current - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    // Agregar páginas del rango
    rangeWithDots.push(...range);

    // Agregar última página
    if (current + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const pageNumbers = getPageNumbers();

  // Manejar cambio de página
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== current) {
      onPageChange(page);
    }
  };

  // Manejar cambio de tamaño de página
  const handlePageSizeChange = (newPageSize) => {
    if (onPageSizeChange) {
      onPageSizeChange(Number(newPageSize));
    }
  };

  if (total === 0) return null;

  return (
    <div className={`bg-white px-4 py-3 sm:px-6 ${className}`}>
      <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
        
        {/* Información de registros y selector de página */}
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
          {showTotal && (
            <div className="text-sm text-gray-700">
              Mostrando <span className="font-medium">{startRecord}</span> al{' '}
              <span className="font-medium">{endRecord}</span> de{' '}
              <span className="font-medium">{total}</span> registros
            </div>
          )}

          {showSizeChanger && onPageSizeChange && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Mostrar</span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {pageSizeOptions.map(size => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <span className="text-sm text-gray-700">por página</span>
            </div>
          )}
        </div>

        {/* Controles de paginación */}
        <div className="flex items-center space-x-1">
          {/* Botón anterior */}
          <button
            onClick={() => handlePageChange(current - 1)}
            disabled={current === 1}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>

          {/* Números de página */}
          {pageNumbers.map((page, index) => {
            if (page === '...') {
              return (
                <span
                  key={`dots-${index}`}
                  className="px-3 py-2 text-sm font-medium text-gray-500"
                >
                  ...
                </span>
              );
            }

            return (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  page === current
                    ? 'bg-blue-600 text-white border border-blue-600'
                    : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            );
          })}

          {/* Botón siguiente */}
          <button
            onClick={() => handlePageChange(current + 1)}
            disabled={current === totalPages}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
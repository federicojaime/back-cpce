// src/components/common/DataTable.jsx
import React from 'react';
import Loading from './Loading';

const DataTable = ({
    columns = [],
    data = [],
    loading = false,
    emptyMessage = 'No hay datos disponibles',
    emptySearchMessage = 'No se encontraron resultados',
    searchValue,
    className = ''
}) => {
    // Función auxiliar para renderizar una celda
    const renderCell = (row, column) => {
        // Verificar que row existe
        if (!row) {
            console.error('Row is undefined in renderCell');
            return <span className="text-gray-400">-</span>;
        }

        if (column.render) {
            // Si tiene función render personalizada, usarla
            return column.render(row);
        }
        
        // Si no, mostrar el valor de la propiedad
        const value = row[column.key];
        return value !== null && value !== undefined ? value : '-';
    };

    // Si está cargando y no hay datos
    if (loading && data.length === 0) {
        return (
            <div className="p-8">
                <Loading text="Cargando datos..." />
            </div>
        );
    }

    // Si no hay datos
    if (data.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">
                    {searchValue ? emptySearchMessage : emptyMessage}
                </p>
            </div>
        );
    }

    return (
        <div className={`bg-white ${className}`}>
            {/* Contenedor con scroll horizontal */}
            <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5">
                <table className="min-w-full divide-y divide-gray-200">
                    {/* Header */}
                    <thead className="bg-gray-50">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap ${
                                        column.align === 'center' ? 'text-center' : ''
                                    } ${column.align === 'right' ? 'text-right' : ''}`}
                                >
                                    {column.label}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    {/* Body */}
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.map((row, index) => (
                            <tr 
                                key={row.id || index} 
                                className="hover:bg-gray-50 transition-colors duration-150"
                            >
                                {columns.map((column) => (
                                    <td
                                        key={`${row.id || index}-${column.key}`}
                                        className={`px-6 py-4 text-sm whitespace-nowrap ${column.className || ''}`}
                                    >
                                        {renderCell(row, column)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DataTable;
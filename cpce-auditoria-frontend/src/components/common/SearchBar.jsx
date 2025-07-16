// src/components/common/SearchBar.jsx
import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

const SearchBar = ({ 
  onSearch, 
  placeholder = 'Buscar...', 
  value = '',
  debounceMs = 300,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState(value);
  const [isSearching, setIsSearching] = useState(false);

  // Debounce para optimizar las búsquedas
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== value) {
        setIsSearching(true);
        onSearch(searchTerm);
        setTimeout(() => setIsSearching(false), 100);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, debounceMs, onSearch, value]);

  // Sincronizar con el valor externo
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  // Limpiar búsqueda
  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
  };

  // Manejar envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="relative">
        {/* Icono de búsqueda */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isSearching ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          ) : (
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          )}
        </div>

        {/* Input de búsqueda */}
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-200"
          placeholder={placeholder}
        />

        {/* Botón limpiar */}
        {searchTerm && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors duration-200"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Hints de búsqueda (opcional) */}
      {searchTerm.length > 0 && searchTerm.length < 3 && (
        <div className="absolute z-10 mt-1 text-xs text-gray-500 bg-yellow-50 border border-yellow-200 rounded-md px-3 py-1">
          Ingresa al menos 3 caracteres para una búsqueda más efectiva
        </div>
      )}
    </form>
  );
};

export default SearchBar;
// src/components/common/ErrorMessage.jsx
import React from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const ErrorMessage = ({ 
  message = 'Ha ocurrido un error inesperado', 
  onRetry,
  showRetry = true,
  type = 'error', // 'error', 'warning', 'info'
  className = ''
}) => {
  
  // Configuración de estilos según el tipo
  const typeStyles = {
    error: {
      container: 'bg-red-50 border-red-200 text-red-800',
      icon: 'text-red-400',
      button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      icon: 'text-yellow-400',
      button: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
    },
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: 'text-blue-400',
      button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
    }
  };

  const styles = typeStyles[type] || typeStyles.error;

  return (
    <div className={`border rounded-md p-4 ${styles.container} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon className={`h-5 w-5 ${styles.icon}`} />
        </div>
        
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium">
            {type === 'error' && 'Error'}
            {type === 'warning' && 'Advertencia'}
            {type === 'info' && 'Información'}
          </h3>
          
          <div className="mt-2 text-sm">
            <p>{message}</p>
          </div>

          {showRetry && onRetry && (
            <div className="mt-4">
              <button
                type="button"
                onClick={onRetry}
                className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white ${styles.button} focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200`}
              >
                <ArrowPathIcon className="h-4 w-4 mr-1" />
                Intentar de nuevo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;
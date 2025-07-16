// src/pages/DescargarExcel.jsx
import React, { useState } from 'react';
import { auditoriasService } from '../services/auditoriasService';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import Breadcrumb from '../components/common/Breadcrumb';
import { 
  DocumentArrowDownIcon,
  CalendarIcon,
  FolderArrowDownIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const DescargarExcel = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7) // YYYY-MM formato
  );
  const [downloadHistory, setDownloadHistory] = useState([]);

  // Breadcrumb configuration
  const breadcrumbItems = [
    { name: 'Auditoría', href: '/' },
    { name: 'Descargar Excel', href: '/descargar-excel', current: true }
  ];

  // Generar opciones de meses (últimos 12 meses)
  const generateMonthOptions = () => {
    const options = [];
    const today = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const value = date.toISOString().slice(0, 7);
      const label = date.toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long' 
      });
      
      options.push({ value, label });
    }
    
    return options;
  };

  const monthOptions = generateMonthOptions();

  // Manejar descarga
  const handleDownload = async () => {
    if (!selectedMonth) {
      setError('Debe seleccionar un mes');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const result = await auditoriasService.generarExcel(selectedMonth);
      
      if (result.success) {
        setSuccess(`Archivo Excel descargado correctamente para ${selectedMonth}`);
        
        // Agregar al historial
        const newDownload = {
          id: Date.now(),
          month: selectedMonth,
          date: new Date().toISOString(),
          status: 'success'
        };
        
        setDownloadHistory(prev => [newDownload, ...prev.slice(0, 4)]); // Mantener últimos 5
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('Error descargando Excel:', error);
      setError('Error inesperado al generar el archivo Excel');
    } finally {
      setLoading(false);
    }
  };

  // Formatear fecha para mostrar
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Formatear mes para mostrar
  const formatMonth = (monthString) => {
    const date = new Date(monthString + '-01');
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long'
    });
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">
            Descargar Reportes en Excel
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Generar y descargar reportes de auditorías en formato Excel por mes
          </p>
        </div>

        {/* Formulario de descarga */}
        <div className="px-6 py-6">
          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar mes para el reporte
            </label>
            
            <div className="flex space-x-3">
              <div className="flex-1">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Seleccionar mes...</option>
                  {monthOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <button
                onClick={handleDownload}
                disabled={loading || !selectedMonth}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generando...
                  </>
                ) : (
                  <>
                    <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                    Descargar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <Loading text="Generando archivo Excel..." />
        </div>
      )}

      {/* Mensajes */}
      {error && (
        <ErrorMessage 
          message={error} 
          onRetry={handleDownload}
          showRetry={!!selectedMonth}
        />
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Descarga completada
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>{success}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Historial de descargas */}
      {downloadHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <ClockIcon className="h-5 w-5 mr-2" />
              Historial de Descargas
            </h3>
          </div>
          
          <div className="px-6 py-4">
            <div className="space-y-3">
              {downloadHistory.map(download => (
                <div key={download.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <FolderArrowDownIcon className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Reporte de {formatMonth(download.month)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Descargado el {formatDate(download.date)}
                      </p>
                    </div>
                  </div>
                  
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Completado
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Información sobre el reporte */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <DocumentArrowDownIcon className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Información sobre los reportes Excel
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>Los reportes incluyen:</p>
              <ul className="mt-1 list-disc list-inside">
                <li>Datos completos de pacientes auditados</li>
                <li>Información de medicamentos prescritos</li>
                <li>Estado de las auditorías y fechas</li>
                <li>Datos del médico prescriptor y auditor</li>
                <li>Porcentajes de cobertura aplicados</li>
              </ul>
              <p className="mt-2">
                <strong>Nota:</strong> Solo se incluyen las auditorías del mes seleccionado que tengan medicamentos procesados.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Accesos rápidos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Accesos Rápidos
          </h3>
        </div>
        
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => {
                const currentMonth = new Date().toISOString().slice(0, 7);
                setSelectedMonth(currentMonth);
              }}
              className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <CalendarIcon className="h-5 w-5 mr-2" />
              Mes Actual
            </button>
            
            <button
              onClick={() => {
                const lastMonth = new Date();
                lastMonth.setMonth(lastMonth.getMonth() - 1);
                setSelectedMonth(lastMonth.toISOString().slice(0, 7));
              }}
              className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <CalendarIcon className="h-5 w-5 mr-2" />
              Mes Anterior
            </button>
            
            <button
              onClick={() => {
                const threeMonthsAgo = new Date();
                threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
                setSelectedMonth(threeMonthsAgo.toISOString().slice(0, 7));
              }}
              className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <CalendarIcon className="h-5 w-5 mr-2" />
              Hace 3 Meses
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DescargarExcel;
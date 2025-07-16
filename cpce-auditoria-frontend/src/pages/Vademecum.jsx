// src/pages/Vademecum.jsx
import React from 'react';
import Breadcrumb from '../components/common/Breadcrumb';
import { 
  BookOpenIcon,
  WrenchScrewdriverIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const Vademecum = () => {
  // Breadcrumb configuration
  const breadcrumbItems = [
    { name: 'Vademécum', href: '/vademecum', current: true }
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <BookOpenIcon className="h-6 w-6 text-gray-400 mr-3" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Vademécum
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Consulta de medicamentos y monodrogas
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mensaje de mantenimiento */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <WrenchScrewdriverIcon className="h-8 w-8 text-yellow-600" />
          </div>
          <div className="ml-4 flex-1">
            <h3 className="text-lg font-medium text-yellow-800 mb-2">
              Funcionalidad en Desarrollo
            </h3>
            <div className="text-sm text-yellow-700 space-y-3">
              <p>
                El módulo de <strong>Vademécum</strong> está siendo desarrollado como una aplicación independiente 
                en React que se integrará próximamente con el sistema de auditorías.
              </p>
              
              <div className="bg-yellow-100 rounded-md p-4 mt-4">
                <h4 className="font-medium text-yellow-800 mb-2">Características planificadas:</h4>
                <ul className="list-disc list-inside space-y-1 text-yellow-700">
                  <li>Búsqueda avanzada de medicamentos por nombre comercial</li>
                  <li>Consulta por monodroga activa</li>
                  <li>Información de laboratorios y presentaciones</li>
                  <li>Códigos de troquel y números de registro</li>
                  <li>Integración con el sistema de auditorías</li>
                  <li>Exportación de consultas</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mt-4">
                <div className="flex items-start">
                  <ExclamationTriangleIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-blue-800 text-sm">
                      <strong>Estado actual:</strong> Esta sección será reemplazada por un repositorio independiente 
                      que contendrá la aplicación completa del Vademécum con todas sus funcionalidades.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Información temporal */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Acceso Temporal
          </h3>
        </div>
        
        <div className="px-6 py-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <BookOpenIcon className="h-8 w-8 text-gray-400" />
            </div>
            
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Consulta de Medicamentos
              </h4>
              <p className="text-gray-600 max-w-md mx-auto">
                Mientras desarrollamos la nueva plataforma, puede continuar utilizando 
                el sistema legacy para consultas de medicamentos.
              </p>
            </div>
            
            <div className="pt-4">
              <button 
                className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-not-allowed"
                disabled
              >
                <BookOpenIcon className="h-5 w-5 mr-2" />
                Acceder al Vademécum (Próximamente)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Información del sistema */}
      <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
        <div className="flex items-center text-sm text-gray-600">
          <WrenchScrewdriverIcon className="h-4 w-4 mr-2" />
          <span>
            <strong>Desarrollo en progreso:</strong> Esta funcionalidad será implementada 
            como una aplicación React independiente que se integrará con el sistema principal.
          </span>
        </div>
      </div>
    </div>
  );
};

export default Vademecum;
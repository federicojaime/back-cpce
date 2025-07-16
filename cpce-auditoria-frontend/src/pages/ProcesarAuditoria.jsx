// src/pages/ProcesarAuditoria.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auditoriasService } from '../services/auditoriasService';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import Breadcrumb from '../components/common/Breadcrumb';
import { 
  UserIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  ArrowUturnLeftIcon,
  CalendarIcon,
  IdentificationIcon,
  HeartIcon,
  ScaleIcon
} from '@heroicons/react/24/outline';

const ProcesarAuditoria = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [auditoria, setAuditoria] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Estados para el procesamiento
  const [medicamentosSeleccionados, setMedicamentosSeleccionados] = useState({});
  const [mesesSeleccionados, setMesesSeleccionados] = useState({}); // Nuevo estado para meses
  const [coberturas, setCoberturas] = useState({});
  const [tiposCobertura, setTiposCobertura] = useState({});
  const [nota, setNota] = useState('');

  // Breadcrumb configuration
  const breadcrumbItems = [
    { name: 'Auditoría', href: '/' },
    { name: 'Pendientes', href: '/pendientes' },
    { name: `Auditoría #${id}`, href: `/auditoria/${id}`, current: true }
  ];

  // Opciones de cobertura
  const opcionesCobertura = [
    { value: '50', label: '50%' },
    { value: '70', label: '70%' },
    { value: '100', label: '100%' }
  ];

  const tiposCoberturaMedicamento = [
    { value: 'BIAC', label: 'BIAC' },
    { value: 'CE', label: 'CE' },
    { value: 'DSC', label: 'DSC' },
    { value: 'HO', label: 'HO' },
    { value: 'ONC', label: 'ONC' }
  ];

  // Cargar datos de la auditoría
  useEffect(() => {
    const loadAuditoria = async () => {
      try {
        setLoading(true);
        setError('');
        
        const result = await auditoriasService.getAuditoria(id);
        
        if (result.success) {
          setAuditoria(result.data);
          
          // Inicializar estados
          const medicamentos = result.data.medicamentos || [];
          const seleccionados = {};
          const mesesPorMedicamento = {};
          const coberturasPorDefecto = {};
          const tiposPorDefecto = {};
          
          medicamentos.forEach((med, index) => {
            const key = `${med.idreceta1}-${med.renglon}`;
            seleccionados[key] = false;
            
            // Inicializar meses para cada medicamento (de 1 a 6 meses)
            const meses = {};
            for (let i = 1; i <= 6; i++) {
              meses[i] = false; // Por defecto ningún mes seleccionado
            }
            mesesPorMedicamento[key] = meses;
            
            coberturasPorDefecto[index + 1] = '50';
            tiposPorDefecto[index + 1] = 'BIAC';
          });
          
          setMedicamentosSeleccionados(seleccionados);
          setMesesSeleccionados(mesesPorMedicamento);
          setCoberturas(coberturasPorDefecto);
          setTiposCobertura(tiposPorDefecto);
        } else {
          setError(result.message);
        }
      } catch (error) {
        console.error('Error cargando auditoría:', error);
        setError('Error inesperado al cargar la auditoría');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadAuditoria();
    }
  }, [id]);

  // Manejar selección de meses
  const handleMesChange = (medicamentoKey, mes) => {
    setMesesSeleccionados(prev => ({
      ...prev,
      [medicamentoKey]: {
        ...prev[medicamentoKey],
        [mes]: !prev[medicamentoKey][mes]
      }
    }));
  };

  // Seleccionar/deseleccionar todos los meses de un medicamento
  const handleSelectAllMeses = (medicamentoKey, selectAll) => {
    setMesesSeleccionados(prev => {
      const nuevosMeses = {};
      for (let i = 1; i <= 6; i++) {
        nuevosMeses[i] = selectAll;
      }
      return {
        ...prev,
        [medicamentoKey]: nuevosMeses
      };
    });
  };

  // Manejar cambio de cobertura
  const handleCoberturaChange = (renglon, valor) => {
    setCoberturas(prev => ({
      ...prev,
      [renglon]: valor
    }));
  };

  // Manejar cambio de tipo de cobertura
  const handleTipoCoberturaChange = (renglon, valor) => {
    setTiposCobertura(prev => ({
      ...prev,
      [renglon]: valor
    }));
  };

  // Procesar auditoría
  const handleProcesar = async () => {
    try {
      setProcessing(true);
      setError('');
      
      // Construir datos basados en meses seleccionados
      const aprobados = [];
      const rechazados = [];
      
      Object.entries(mesesSeleccionados).forEach(([medicamentoKey, meses]) => {
        const mesesAprobados = Object.entries(meses)
          .filter(([mes, seleccionado]) => seleccionado)
          .map(([mes]) => mes);
        
        if (mesesAprobados.length > 0) {
          // Si hay meses seleccionados, agregar a aprobados
          aprobados.push(medicamentoKey);
        } else {
          // Si no hay meses seleccionados, agregar a rechazados
          rechazados.push(medicamentoKey);
        }
      });

      const datos = {
        chequedos: aprobados.join(','),
        nochequeados: rechazados.join(','),
        cobert1: coberturas[1] || '50',
        cobert2: coberturas[2] || '50',
        cobert3: coberturas[3] || '50',
        cobert4: coberturas[4] || '50',
        cobert2_1: tiposCobertura[1] || 'BIAC',
        cobert2_2: tiposCobertura[2] || 'BIAC',
        cobert2_3: tiposCobertura[3] || 'BIAC',
        cobert2_4: tiposCobertura[4] || 'BIAC',
        nota,
        estadoIdentidad: 0,
        // Agregar información de meses seleccionados
        mesesSeleccionados: JSON.stringify(mesesSeleccionados)
      };

      const result = await auditoriasService.procesarAuditoria(id, datos);
      
      if (result.success) {
        setSuccess('Auditoría procesada correctamente');
        setTimeout(() => {
          navigate('/pendientes');
        }, 2000);
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('Error procesando auditoría:', error);
      setError('Error inesperado al procesar la auditoría');
    } finally {
      setProcessing(false);
    }
  };

  // Enviar a médico auditor
  const handleEnviarMedico = async () => {
    if (!window.confirm('¿Está seguro de enviar esta auditoría al médico auditor?')) {
      return;
    }

    try {
      setProcessing(true);
      setError('');
      
      const result = await auditoriasService.enviarMedicoAuditor(id);
      
      if (result.success) {
        setSuccess('Auditoría enviada al médico auditor correctamente');
        setTimeout(() => {
          navigate('/pendientes');
        }, 2000);
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('Error enviando a médico:', error);
      setError('Error inesperado al enviar al médico auditor');
    } finally {
      setProcessing(false);
    }
  };

  // Calcular edad del paciente
  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return null;
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    const edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      return edad - 1;
    }
    return edad;
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-4 lg:p-6">
        <Loading text="Cargando auditoría..." />
      </div>
    );
  }

  // Error state
  if (error && !auditoria) {
    return (
      <div className="p-4 lg:p-6 space-y-6">
        <Breadcrumb items={breadcrumbItems} />
        <ErrorMessage 
          message={error} 
          onRetry={() => window.location.reload()} 
        />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Mensajes */}
      {error && (
        <ErrorMessage message={error} />
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <CheckCircleIcon className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* Datos del paciente */}
      {auditoria?.paciente && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <UserIcon className="h-5 w-5 mr-2" />
              Información del Paciente
            </h2>
          </div>
          
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-center space-x-3">
                <IdentificationIcon className="h-6 w-6 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {auditoria.paciente.apellido}, {auditoria.paciente.nombre}
                  </p>
                  <p className="text-sm text-gray-500">DNI: {auditoria.paciente.dni}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <CalendarIcon className="h-6 w-6 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {auditoria.paciente.edad || calcularEdad(auditoria.paciente.fecnac)} años
                  </p>
                  <p className="text-sm text-gray-500">Sexo: {auditoria.paciente.sexo}</p>
                </div>
              </div>
              
              {auditoria.paciente.talla && (
                <div className="flex items-center space-x-3">
                  <ScaleIcon className="h-6 w-6 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {auditoria.paciente.talla} cm
                    </p>
                    <p className="text-sm text-gray-500">Talla</p>
                  </div>
                </div>
              )}
              
              {auditoria.paciente.peso && (
                <div className="flex items-center space-x-3">
                  <HeartIcon className="h-6 w-6 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {auditoria.paciente.peso} kg
                    </p>
                    <p className="text-sm text-gray-500">Peso</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Diagnóstico */}
      {auditoria?.diagnostico && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              Diagnóstico
            </h2>
          </div>
          
          <div className="px-6 py-4">
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {auditoria.diagnostico.diagnostico}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Fecha de emisión: {auditoria.diagnostico.fechaemision}
                </p>
              </div>
              
              {auditoria.diagnostico.diagnostico2 && (
                <div className="border-t border-gray-200 pt-3">
                  <p className="text-sm text-gray-700">
                    {auditoria.diagnostico.diagnostico2}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Medicamentos */}
      {auditoria?.medicamentos && auditoria.medicamentos.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Medicamentos para Auditoría ({auditoria.medicamentos.length})
            </h2>
          </div>
          
          <div className="px-6 py-4">
            <div className="space-y-6">
              {auditoria.medicamentos.map((medicamento, index) => {
                const key = `${medicamento.idreceta1}-${medicamento.renglon}`;
                const isSelected = medicamentosSeleccionados[key];
                
                return (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        {/* Header del medicamento */}
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="flex-1">
                            <h3 className="text-base font-medium text-gray-900">
                              {medicamento.nombre}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {medicamento.monodroga}
                            </p>
                          </div>
                        </div>
                        
                        {/* Detalles del medicamento */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                          <div>
                            <span className="font-medium text-gray-500">Presentación:</span>
                            <p className="text-gray-900">{medicamento.presentacion}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-500">Cantidad:</span>
                            <p className="text-gray-900">{medicamento.cantprescripta}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-500">Posología:</span>
                            <p className="text-gray-900">{medicamento.posologia}</p>
                          </div>
                        </div>

                        {/* Selección de meses */}
                        <div className="border-t border-gray-200 pt-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-medium text-gray-700">Seleccionar meses a aprobar:</h4>
                            <div className="flex space-x-2">
                              <button
                                type="button"
                                onClick={() => handleSelectAllMeses(key, true)}
                                className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                              >
                                Todos
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSelectAllMeses(key, false)}
                                className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                              >
                                Ninguno
                              </button>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-6 gap-2 mb-4">
                            {[1, 2, 3, 4, 5, 6].map(mes => {
                              const isSelected = mesesSeleccionados[key]?.[mes] || false;
                              return (
                                <div key={mes} className="flex flex-col items-center">
                                  <label className="flex flex-col items-center cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => handleMesChange(key, mes)}
                                      disabled={auditoria.botonesDeshabilitados}
                                      className="mb-1"
                                    />
                                    <span className={`text-xs px-2 py-1 rounded ${
                                      isSelected 
                                        ? 'bg-green-100 text-green-800 border border-green-300' 
                                        : 'bg-gray-100 text-gray-600 border border-gray-300'
                                    }`}>
                                      Mes {mes}
                                    </span>
                                  </label>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        
                        {/* Configuración de cobertura - solo si hay meses seleccionados */}
                        {Object.values(mesesSeleccionados[key] || {}).some(selected => selected) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-200 pt-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Porcentaje de Cobertura
                              </label>
                              <select
                                value={coberturas[medicamento.renglon] || '50'}
                                onChange={(e) => handleCoberturaChange(medicamento.renglon, e.target.value)}
                                disabled={auditoria.botonesDeshabilitados}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              >
                                {opcionesCobertura.map(opcion => (
                                  <option key={opcion.value} value={opcion.value}>
                                    {opcion.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tipo de Cobertura
                              </label>
                              <select
                                value={tiposCobertura[medicamento.renglon] || 'BIAC'}
                                onChange={(e) => handleTipoCoberturaChange(medicamento.renglon, e.target.value)}
                                disabled={auditoria.botonesDeshabilitados}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              >
                                {tiposCoberturaMedicamento.map(tipo => (
                                  <option key={tipo.value} value={tipo.value}>
                                    {tipo.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Notas de auditoría */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Observaciones de la Auditoría
          </h2>
        </div>
        
        <div className="px-6 py-4">
          <textarea
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            rows={4}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Ingrese observaciones sobre la auditoría (opcional)..."
            disabled={auditoria?.botonesDeshabilitados}
          />
        </div>
      </div>

      {/* Botones de acción */}
      {!auditoria?.botonesDeshabilitados && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4">
            <div className="flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0 sm:space-x-3">
              {/* Botones principales */}
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={handleProcesar}
                  disabled={processing}
                  className="inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  {processing ? 'Procesando...' : 'Procesar Auditoría'}
                </button>
                
                {user?.rol !== '9' && (
                  <button
                    onClick={handleEnviarMedico}
                    disabled={processing}
                    className="inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                  >
                    <PaperAirplaneIcon className="h-5 w-5 mr-2" />
                    Enviar a Médico
                  </button>
                )}
              </div>
              
              {/* Botón de regreso */}
              <button
                onClick={() => navigate('/pendientes')}
                className="inline-flex items-center px-6 py-2 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ArrowUturnLeftIcon className="h-5 w-5 mr-2" />
                Volver a Pendientes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Información de estado bloqueado */}
      {auditoria?.botonesDeshabilitados && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <XMarkIcon className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Auditoría bloqueada
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                Esta auditoría ha sido enviada al médico auditor y no puede ser modificada.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcesarAuditoria;
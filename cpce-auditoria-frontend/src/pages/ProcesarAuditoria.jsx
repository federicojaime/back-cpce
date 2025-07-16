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
    CheckCircleIcon,
    XMarkIcon,
    PaperAirplaneIcon
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
    const [mesesSeleccionados, setMesesSeleccionados] = useState({});
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
                    const mesesPorMedicamento = {};
                    const coberturasPorDefecto = {};
                    const tiposPorDefecto = {};

                    medicamentos.forEach((med, index) => {
                        const key = `${med.idreceta1}-${med.renglon}`;

                        // Inicializar meses para cada medicamento (de 1 a 6 meses)
                        const meses = {};
                        for (let i = 1; i <= 6; i++) {
                            meses[i] = false;
                        }
                        mesesPorMedicamento[key] = meses;

                        coberturasPorDefecto[index + 1] = '50';
                        tiposPorDefecto[index + 1] = 'BIAC';
                    });

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
                    aprobados.push(medicamentoKey);
                } else {
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
        <div className="min-h-screen bg-gray-100 p-4">
            {/* Breadcrumb */}
            <div className="mb-4">
                <Breadcrumb items={breadcrumbItems} />
            </div>

            {/* Mensajes */}
            {error && (
                <div className="mb-4">
                    <ErrorMessage message={error} />
                </div>
            )}

            {success && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
                    <div className="flex">
                        <CheckCircleIcon className="h-5 w-5 text-green-400" />
                        <div className="ml-3">
                            <p className="text-sm font-medium text-green-800">{success}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Card principal */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-300 overflow-hidden">

                {/* Header con título */}
                <div className="bg-blue-600 text-white px-6 py-4">
                    <h1 className="text-lg font-semibold flex items-center">
                        <UserIcon className="h-5 w-5 mr-2" />
                        Auditoría médica TRATAMIENTO PROLONGADO
                    </h1>
                </div>

                {/* Contenido principal */}
                <div className="p-6">

                    {/* Información del paciente, médico y diagnóstico */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

                        {/* PACIENTE */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg">
                            <div className="bg-gray-200 px-4 py-2 border-b border-gray-300">
                                <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                                    📋 PACIENTE
                                </h3>
                            </div>
                            <div className="p-4 space-y-2">
                                <div className="grid grid-cols-2 gap-x-2 text-sm">
                                    <div>
                                        <span className="text-gray-600">Apellido:</span>
                                        <div className="font-semibold">{auditoria?.paciente?.apellido}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Nombre:</span>
                                        <div className="font-semibold">{auditoria?.paciente?.nombre}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">DNI:</span>
                                        <div className="font-semibold">{auditoria?.paciente?.dni}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Sexo:</span>
                                        <div className="font-semibold">{auditoria?.paciente?.sexo}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Edad:</span>
                                        <div className="font-semibold">{auditoria?.paciente?.edad} años</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Talla:</span>
                                        <div className="font-semibold">{auditoria?.paciente?.talla || 0}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Peso:</span>
                                        <div className="font-semibold">{auditoria?.paciente?.peso || 0}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Teléfono:</span>
                                        <div className="font-semibold">{auditoria?.paciente?.telefono || '-'}</div>
                                    </div>
                                </div>
                                <div className="col-span-2 pt-1">
                                    <span className="text-gray-600 text-sm">Email:</span>
                                    <div className="font-semibold text-sm">{auditoria?.paciente?.email || '-'}</div>
                                </div>
                            </div>
                        </div>

                        {/* MÉDICO */}
                        <div className="bg-green-50 border border-green-200 rounded-lg">
                            <div className="bg-green-200 px-4 py-2 border-b border-green-300">
                                <h3 className="text-sm font-semibold text-green-800 flex items-center">
                                    👨‍⚕️ MÉDICO
                                </h3>
                            </div>
                            <div className="p-4 space-y-3 text-sm">
                                <div>
                                    <span className="text-gray-600">Profesional:</span>
                                    <div className="font-semibold">ALEJANDRA MARÍA NIORO</div>
                                    <div className="text-blue-600 font-medium text-xs">MP-255967 | ME-19465</div>
                                </div>
                                <div>
                                    <span className="text-gray-600">Especialidad:</span>
                                    <div className="font-semibold text-green-700">GINECOLOGIA</div>
                                </div>
                                <div>
                                    <span className="text-gray-600">Fecha atención:</span>
                                    <div className="font-semibold">31, March, 2025</div>
                                </div>
                                <div>
                                    <span className="text-gray-600">Diagnóstico:</span>
                                    <div className="font-semibold">Anticoncepción. Tto prolongado</div>
                                </div>
                            </div>
                        </div>

                        {/* DIAGNÓSTICO COMPLETO */}
                        <div className="bg-yellow-50 border border-yellow-300 rounded-lg">
                            <div className="bg-yellow-200 px-4 py-2 border-b border-yellow-300">
                                <h3 className="text-sm font-semibold text-yellow-800 flex items-center">
                                    🔍 DIAGNÓSTICO COMPLETO
                                </h3>
                            </div>
                            <div className="p-4 space-y-3">
                                <div className="bg-yellow-100 border border-yellow-300 rounded p-3">
                                    <div className="font-semibold text-yellow-900 text-sm">
                                        {auditoria?.diagnostico?.diagnostico || 'Anticoncepción. Tto prolongado'}
                                    </div>
                                </div>
                                <div className="text-xs text-gray-600">
                                    <span className="font-medium">Fecha emisión:</span> {auditoria?.diagnostico?.fechaemision || '2025-03-31T17:59:51.000Z'}
                                </div>
                                {auditoria?.diagnostico?.diagnostico2 && (
                                    <div className="bg-white border border-gray-200 rounded p-3 text-xs">
                                        <div className="text-gray-700">
                                            <span className="font-medium">Resumen de Historia Clínica:</span><br />
                                            {auditoria.diagnostico.diagnostico2}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tabla de medicamentos */}
                    {auditoria?.medicamentos && auditoria.medicamentos.length > 0 && (
                        <div className="mb-6">
                            <div className="bg-gray-50 border border-gray-200 rounded-t-lg px-4 py-3">
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                    📋 Medicamentos para Auditoría
                                </h3>
                            </div>

                            <div className="border border-t-0 border-gray-200 rounded-b-lg overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-100 border-b border-gray-200">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-200">
                                                    NOMBRE COMERCIAL
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-200">
                                                    MONODROGA
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-200">
                                                    PRESENTACIÓN
                                                </th>
                                                <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase border-r border-gray-200">
                                                    CANT.
                                                </th>
                                                <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase border-r border-gray-200">
                                                    DOSIS
                                                </th>
                                                <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase border-r border-gray-200">
                                                    COBERTURA
                                                </th>
                                                <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase border-r border-gray-200">
                                                    COBERTURA2
                                                </th>
                                                <th className="px-2 py-3 text-center text-xs font-semibold text-gray-700 uppercase border-r border-gray-200">
                                                    MES1
                                                </th>
                                                <th className="px-2 py-3 text-center text-xs font-semibold text-gray-700 uppercase border-r border-gray-200">
                                                    MES2
                                                </th>
                                                <th className="px-2 py-3 text-center text-xs font-semibold text-gray-700 uppercase border-r border-gray-200">
                                                    MES3
                                                </th>
                                                <th className="px-2 py-3 text-center text-xs font-semibold text-gray-700 uppercase border-r border-gray-200">
                                                    MES4
                                                </th>
                                                <th className="px-2 py-3 text-center text-xs font-semibold text-gray-700 uppercase border-r border-gray-200">
                                                    MES5
                                                </th>
                                                <th className="px-2 py-3 text-center text-xs font-semibold text-gray-700 uppercase border-r border-gray-200">
                                                    MES6
                                                </th>
                                                <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                                                    TODOS
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {auditoria.medicamentos.map((medicamento, index) => {
                                                const key = `${medicamento.idreceta1}-${medicamento.renglon}`;

                                                return (
                                                    <tr key={index} className="bg-white border-b border-gray-200 hover:bg-gray-50">
                                                        <td className="px-4 py-3 text-sm border-r border-gray-200">
                                                            <div className="font-medium text-gray-900">{medicamento.nombre}</div>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                                                            {medicamento.monodroga}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                                                            {medicamento.presentacion}
                                                        </td>
                                                        <td className="px-3 py-3 text-sm text-center font-medium border-r border-gray-200">
                                                            {medicamento.cantprescripta}
                                                        </td>
                                                        <td className="px-3 py-3 text-sm text-center border-r border-gray-200">
                                                            {medicamento.posologia}
                                                        </td>

                                                        {/* Cobertura */}
                                                        <td className="px-3 py-3 text-center border-r border-gray-200">
                                                            <select
                                                                value={coberturas[medicamento.renglon] || '50'}
                                                                onChange={(e) => handleCoberturaChange(medicamento.renglon, e.target.value)}
                                                                disabled={auditoria.botonesDeshabilitados}
                                                                className="w-16 px-1 py-1 text-xs border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            >
                                                                {opcionesCobertura.map(opcion => (
                                                                    <option key={opcion.value} value={opcion.value}>
                                                                        {opcion.label}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </td>

                                                        {/* Tipo de Cobertura */}
                                                        <td className="px-3 py-3 text-center border-r border-gray-200">
                                                            <select
                                                                value={tiposCobertura[medicamento.renglon] || 'BIAC'}
                                                                onChange={(e) => handleTipoCoberturaChange(medicamento.renglon, e.target.value)}
                                                                disabled={auditoria.botonesDeshabilitados}
                                                                className="w-16 px-1 py-1 text-xs border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            >
                                                                {tiposCoberturaMedicamento.map(tipo => (
                                                                    <option key={tipo.value} value={tipo.value}>
                                                                        {tipo.label}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </td>

                                                        {/* Meses - checkboxes con indicadores visuales */}
                                                        {[1, 2, 3, 4, 5, 6].map(mes => {
                                                            const isSelected = mesesSeleccionados[key]?.[mes] || false;
                                                            return (
                                                                <td key={mes} className={`px-2 py-3 text-center border-r border-gray-200 ${isSelected ? 'bg-green-100' : 'bg-red-50'
                                                                    }`}>
                                                                    <div className="flex flex-col items-center">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={isSelected}
                                                                            onChange={() => handleMesChange(key, mes)}
                                                                            disabled={auditoria.botonesDeshabilitados}
                                                                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                                        />
                                                                        <span className={`text-xs font-bold mt-1 ${isSelected ? 'text-green-600' : 'text-red-500'
                                                                            }`}>
                                                                            {isSelected ? '✓' : '✗'}
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                            );
                                                        })}

                                                        {/* Botones Todos/Ninguno */}
                                                        <td className="px-3 py-3 text-center">
                                                            <div className="flex flex-col space-y-1">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleSelectAllMeses(key, true)}
                                                                    disabled={auditoria.botonesDeshabilitados}
                                                                    className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 transition-colors"
                                                                >
                                                                    Todos
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleSelectAllMeses(key, false)}
                                                                    disabled={auditoria.botonesDeshabilitados}
                                                                    className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 transition-colors"
                                                                >
                                                                    Ninguno
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Nota */}
                    <div className="mb-6">
                        <div className="bg-gray-50 border border-gray-200 rounded-t-lg px-4 py-3">
                            <h3 className="text-lg font-semibold text-gray-800">Nota</h3>
                        </div>
                        <div className="border border-t-0 border-gray-200 rounded-b-lg p-4 bg-white">
                            <textarea
                                value={nota}
                                onChange={(e) => setNota(e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Esta nota impacta en el cuerpo del email que el afiliado recibe."
                                disabled={auditoria?.botonesDeshabilitados}
                            />
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex justify-center space-x-4 pt-4 border-t border-gray-200">
                        {!auditoria?.botonesDeshabilitados && (
                            <>
                                <button
                                    onClick={handleEnviarMedico}
                                    disabled={processing}
                                    className="px-6 py-2 bg-orange-600 text-white rounded font-medium hover:bg-orange-700 disabled:opacity-50 transition-colors"
                                >
                                    Enviar a Médico Auditor
                                </button>

                                <button
                                    onClick={handleProcesar}
                                    disabled={processing}
                                    className="px-6 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                >
                                    {processing ? 'Procesando...' : 'Confirmar Auditoría'}
                                </button>
                            </>
                        )}

                        <button
                            onClick={() => navigate('/pendientes')}
                            className="px-6 py-2 bg-gray-500 text-white rounded font-medium hover:bg-gray-600 transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>

                    {/* Información de estado bloqueado */}
                    {auditoria?.botonesDeshabilitados && (
                        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
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
            </div>
        </div>
    );
};

export default ProcesarAuditoria;
// src/services/proveedoresService.js - SERVICIO COMPLETO MEJORADO
import api from './api';

// Constantes para paginación y límites
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

// Clase de servicio para manejar errores de manera consistente
class ProveedoresAPIError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ProveedoresAPIError';
    this.status = status;
    this.data = data;
  }
}

// Utilitario para manejar respuestas de API
const handleAPIResponse = (response) => {
  if (response.data.success === false) {
    throw new ProveedoresAPIError(
      response.data.message || 'Error en la API',
      response.status,
      response.data
    );
  }
  return response.data;
};

// Utilitario para crear parámetros de consulta
const createQueryParams = (params) => {
  const cleanParams = Object.entries(params)
    .filter(([_, value]) => value !== null && value !== undefined && value !== '')
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
  
  return new URLSearchParams(cleanParams);
};

// ===== SERVICIOS PRINCIPALES =====

/**
 * Obtener lista de proveedores con filtros avanzados
 * @param {Object} params - Parámetros de búsqueda y paginación
 * @returns {Promise<Object>} Respuesta con datos paginados
 */
export const getProveedores = async (params = {}) => {
  try {
    const {
      page = 1,
      limit = DEFAULT_PAGE_SIZE,
      search = '',
      activo = null,
      tipo = '',
      sortBy = 'razon_social',
      sortOrder = 'asc'
    } = params;

    // Validar límites
    const validLimit = Math.min(Math.max(1, parseInt(limit)), MAX_PAGE_SIZE);
    const validPage = Math.max(1, parseInt(page));

    const queryParams = createQueryParams({
      page: validPage,
      limit: validLimit,
      search: search.trim(),
      activo,
      tipo,
      sortBy,
      sortOrder
    });

    console.log('🔍 Buscando proveedores:', queryParams.toString());

    const response = await api.get(`/proveedores?${queryParams.toString()}`);
    const data = handleAPIResponse(response);

    return {
      success: true,
      data: data.data || [],
      pagination: {
        currentPage: data.page || validPage,
        totalPages: data.totalPages || 1,
        total: data.total || 0,
        limit: validLimit,
        hasNextPage: data.page < data.totalPages,
        hasPrevPage: data.page > 1
      },
      filters: {
        search,
        activo,
        tipo,
        sortBy,
        sortOrder
      }
    };
  } catch (error) {
    console.error('❌ Error obteniendo proveedores:', error);
    
    if (error instanceof ProveedoresAPIError) {
      return {
        success: false,
        message: error.message,
        data: [],
        pagination: { currentPage: 1, totalPages: 0, total: 0, limit: DEFAULT_PAGE_SIZE }
      };
    }

    return {
      success: false,
      message: 'Error de conexión al obtener proveedores',
      data: [],
      pagination: { currentPage: 1, totalPages: 0, total: 0, limit: DEFAULT_PAGE_SIZE }
    };
  }
};

/**
 * Obtener un proveedor específico por ID
 * @param {string|number} id - ID del proveedor
 * @returns {Promise<Object>} Datos del proveedor con contactos
 */
export const getProveedor = async (id) => {
  try {
    if (!id) {
      throw new ProveedoresAPIError('ID de proveedor requerido', 400);
    }

    console.log(`🔍 Obteniendo proveedor ID: ${id}`);
    
    const response = await api.get(`/proveedores/${id}`);
    const data = handleAPIResponse(response);

    return {
      success: true,
      data: data.data,
      message: 'Proveedor obtenido correctamente'
    };
  } catch (error) {
    console.error(`❌ Error obteniendo proveedor ${id}:`, error);
    
    if (error instanceof ProveedoresAPIError) {
      return {
        success: false,
        message: error.message,
        data: null
      };
    }

    return {
      success: false,
      message: 'Error al obtener datos del proveedor',
      data: null
    };
  }
};

/**
 * Crear un nuevo proveedor
 * @param {Object} proveedorData - Datos del proveedor
 * @returns {Promise<Object>} Resultado de la creación
 */
export const createProveedor = async (proveedorData) => {
  try {
    // Validaciones básicas
    if (!proveedorData.razon_social?.trim()) {
      throw new ProveedoresAPIError('La razón social es obligatoria', 400);
    }

    if (!proveedorData.cuit?.trim()) {
      throw new ProveedoresAPIError('El CUIT es obligatorio', 400);
    }

    // Validar formato CUIT
    const cuitRegex = /^\d{2}-\d{8}-\d{1}$/;
    if (!cuitRegex.test(proveedorData.cuit)) {
      throw new ProveedoresAPIError('Formato de CUIT inválido (XX-XXXXXXXX-X)', 400);
    }

    console.log('📝 Creando proveedor:', proveedorData.razon_social);

    const response = await api.post('/proveedores', {
      ...proveedorData,
      razon_social: proveedorData.razon_social.trim(),
      cuit: proveedorData.cuit.trim(),
      email_general: proveedorData.email_general?.trim() || '',
      telefono_general: proveedorData.telefono_general?.trim() || '',
      activo: proveedorData.activo !== false // Default true
    });

    const data = handleAPIResponse(response);

    return {
      success: true,
      data: data.data,
      message: 'Proveedor creado exitosamente'
    };
  } catch (error) {
    console.error('❌ Error creando proveedor:', error);
    
    if (error instanceof ProveedoresAPIError) {
      return {
        success: false,
        message: error.message
      };
    }

    const errorMessage = error.response?.data?.message || 'Error al crear el proveedor';
    return {
      success: false,
      message: errorMessage
    };
  }
};

/**
 * Actualizar un proveedor existente
 * @param {string|number} id - ID del proveedor
 * @param {Object} updateData - Datos a actualizar
 * @returns {Promise<Object>} Resultado de la actualización
 */
export const updateProveedor = async (id, updateData) => {
  try {
    if (!id) {
      throw new ProveedoresAPIError('ID de proveedor requerido', 400);
    }

    // Limpiar datos de entrada
    const cleanData = Object.entries(updateData)
      .filter(([_, value]) => value !== null && value !== undefined)
      .reduce((acc, [key, value]) => {
        if (typeof value === 'string') {
          acc[key] = value.trim();
        } else {
          acc[key] = value;
        }
        return acc;
      }, {});

    // Validar CUIT si se está actualizando
    if (cleanData.cuit) {
      const cuitRegex = /^\d{2}-\d{8}-\d{1}$/;
      if (!cuitRegex.test(cleanData.cuit)) {
        throw new ProveedoresAPIError('Formato de CUIT inválido (XX-XXXXXXXX-X)', 400);
      }
    }

    console.log(`📝 Actualizando proveedor ID: ${id}`);

    const response = await api.put(`/proveedores/${id}`, cleanData);
    const data = handleAPIResponse(response);

    return {
      success: true,
      data: data.data,
      message: 'Proveedor actualizado exitosamente'
    };
  } catch (error) {
    console.error(`❌ Error actualizando proveedor ${id}:`, error);
    
    if (error instanceof ProveedoresAPIError) {
      return {
        success: false,
        message: error.message
      };
    }

    const errorMessage = error.response?.data?.message || 'Error al actualizar el proveedor';
    return {
      success: false,
      message: errorMessage
    };
  }
};

/**
 * Desactivar un proveedor (soft delete)
 * @param {string|number} id - ID del proveedor
 * @returns {Promise<Object>} Resultado de la desactivación
 */
export const deleteProveedor = async (id) => {
  try {
    if (!id) {
      throw new ProveedoresAPIError('ID de proveedor requerido', 400);
    }

    console.log(`🗑️ Desactivando proveedor ID: ${id}`);

    const response = await api.delete(`/proveedores/${id}`);
    const data = handleAPIResponse(response);

    return {
      success: true,
      message: 'Proveedor desactivado exitosamente'
    };
  } catch (error) {
    console.error(`❌ Error desactivando proveedor ${id}:`, error);
    
    if (error instanceof ProveedoresAPIError) {
      return {
        success: false,
        message: error.message
      };
    }

    return {
      success: false,
      message: 'Error al desactivar el proveedor'
    };
  }
};

// ===== SERVICIOS DE CONTACTOS =====

/**
 * Obtener contactos de un proveedor
 * @param {string|number} proveedorId - ID del proveedor
 * @returns {Promise<Object>} Lista de contactos
 */
export const getContactosByProveedorId = async (proveedorId) => {
  try {
    if (!proveedorId) {
      throw new ProveedoresAPIError('ID de proveedor requerido', 400);
    }

    console.log(`🔍 Obteniendo contactos del proveedor ID: ${proveedorId}`);

    const response = await api.get(`/proveedores/${proveedorId}/contactos`);
    const data = handleAPIResponse(response);

    return {
      success: true,
      data: data.data || [],
      message: 'Contactos obtenidos correctamente'
    };
  } catch (error) {
    console.error(`❌ Error obteniendo contactos del proveedor ${proveedorId}:`, error);
    
    if (error instanceof ProveedoresAPIError) {
      return {
        success: false,
        message: error.message,
        data: []
      };
    }

    return {
      success: false,
      message: 'Error al obtener contactos',
      data: []
    };
  }
};

/**
 * Crear un nuevo contacto
 * @param {string|number} proveedorId - ID del proveedor
 * @param {Object} contactoData - Datos del contacto
 * @returns {Promise<Object>} Resultado de la creación
 */
export const createContacto = async (proveedorId, contactoData) => {
  try {
    if (!proveedorId) {
      throw new ProveedoresAPIError('ID de proveedor requerido', 400);
    }

    if (!contactoData.nombre?.trim()) {
      throw new ProveedoresAPIError('El nombre del contacto es obligatorio', 400);
    }

    console.log(`📝 Creando contacto para proveedor ID: ${proveedorId}`);

    const response = await api.post(`/proveedores/${proveedorId}/contactos`, {
      ...contactoData,
      nombre: contactoData.nombre.trim(),
      apellido: contactoData.apellido?.trim() || '',
      email: contactoData.email?.trim() || '',
      telefono: contactoData.telefono?.trim() || '',
      cargo: contactoData.cargo?.trim() || ''
    });

    const data = handleAPIResponse(response);

    return {
      success: true,
      data: data.data,
      message: 'Contacto creado exitosamente'
    };
  } catch (error) {
    console.error(`❌ Error creando contacto para proveedor ${proveedorId}:`, error);
    
    if (error instanceof ProveedoresAPIError) {
      return {
        success: false,
        message: error.message
      };
    }

    return {
      success: false,
      message: 'Error al crear el contacto'
    };
  }
};

/**
 * Actualizar un contacto
 * @param {string|number} proveedorId - ID del proveedor
 * @param {string|number} contactoId - ID del contacto
 * @param {Object} updateData - Datos a actualizar
 * @returns {Promise<Object>} Resultado de la actualización
 */
export const updateContacto = async (proveedorId, contactoId, updateData) => {
  try {
    if (!proveedorId || !contactoId) {
      throw new ProveedoresAPIError('ID de proveedor y contacto requeridos', 400);
    }

    console.log(`📝 Actualizando contacto ID: ${contactoId} del proveedor ID: ${proveedorId}`);

    const response = await api.put(`/proveedores/${proveedorId}/contactos/${contactoId}`, updateData);
    const data = handleAPIResponse(response);

    return {
      success: true,
      data: data.data,
      message: 'Contacto actualizado exitosamente'
    };
  } catch (error) {
    console.error(`❌ Error actualizando contacto ${contactoId}:`, error);
    
    if (error instanceof ProveedoresAPIError) {
      return {
        success: false,
        message: error.message
      };
    }

    return {
      success: false,
      message: 'Error al actualizar el contacto'
    };
  }
};

/**
 * Eliminar un contacto
 * @param {string|number} proveedorId - ID del proveedor
 * @param {string|number} contactoId - ID del contacto
 * @returns {Promise<Object>} Resultado de la eliminación
 */
export const deleteContacto = async (proveedorId, contactoId) => {
  try {
    if (!proveedorId || !contactoId) {
      throw new ProveedoresAPIError('ID de proveedor y contacto requeridos', 400);
    }

    console.log(`🗑️ Eliminando contacto ID: ${contactoId} del proveedor ID: ${proveedorId}`);

    const response = await api.delete(`/proveedores/${proveedorId}/contactos/${contactoId}`);
    const data = handleAPIResponse(response);

    return {
      success: true,
      message: 'Contacto eliminado exitosamente'
    };
  } catch (error) {
    console.error(`❌ Error eliminando contacto ${contactoId}:`, error);
    
    if (error instanceof ProveedoresAPIError) {
      return {
        success: false,
        message: error.message
      };
    }

    return {
      success: false,
      message: 'Error al eliminar el contacto'
    };
  }
};

// ===== SERVICIOS AUXILIARES =====

/**
 * Obtener tipos de proveedores disponibles
 * @returns {Promise<Object>} Lista de tipos
 */
export const getTiposProveedores = async () => {
  try {
    console.log('🔍 Obteniendo tipos de proveedores');
    
    const response = await api.get('/proveedores/tipos');
    const data = handleAPIResponse(response);

    return {
      success: true,
      data: data.data || [],
      message: 'Tipos obtenidos correctamente'
    };
  } catch (error) {
    console.error('❌ Error obteniendo tipos de proveedores:', error);
    
    // Fallback con tipos predefinidos
    return {
      success: true,
      data: [
        { value: 'Laboratorio', label: 'Laboratorio' },
        { value: 'Droguería', label: 'Droguería' },
        { value: 'Ambos', label: 'Ambos' }
      ],
      message: 'Tipos cargados (fallback)'
    };
  }
};

/**
 * Obtener estadísticas de proveedores
 * @returns {Promise<Object>} Estadísticas
 */
export const getEstadisticasProveedores = async () => {
  try {
    console.log('📊 Obteniendo estadísticas de proveedores');
    
    const response = await api.get('/proveedores/estadisticas');
    const data = handleAPIResponse(response);

    return {
      success: true,
      data: data.data,
      message: 'Estadísticas obtenidas correctamente'
    };
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
    
    if (error instanceof ProveedoresAPIError) {
      return {
        success: false,
        message: error.message,
        data: {}
      };
    }

    return {
      success: false,
      message: 'Error al obtener estadísticas',
      data: {}
    };
  }
};

/**
 * Búsqueda rápida de proveedores (para autocompletar)
 * @param {string} query - Término de búsqueda
 * @param {number} limit - Límite de resultados
 * @returns {Promise<Object>} Resultados de búsqueda
 */
export const searchProveedores = async (query, limit = 10) => {
  try {
    if (!query || query.trim().length < 2) {
      return {
        success: true,
        data: [],
        message: 'Ingrese al menos 2 caracteres'
      };
    }

    const queryParams = createQueryParams({
      q: query.trim(),
      limit: Math.min(limit, 50)
    });

    console.log(`🔍 Búsqueda rápida: "${query}"`);

    const response = await api.get(`/proveedores/buscar?${queryParams.toString()}`);
    const data = handleAPIResponse(response);

    return {
      success: true,
      data: data.data || [],
      message: 'Búsqueda completada'
    };
  } catch (error) {
    console.error('❌ Error en búsqueda rápida:', error);
    
    if (error instanceof ProveedoresAPIError) {
      return {
        success: false,
        message: error.message,
        data: []
      };
    }

    return {
      success: false,
      message: 'Error en la búsqueda',
      data: []
    };
  }
};

/**
 * Exportar proveedores a Excel
 * @param {Object} filters - Filtros para la exportación
 * @returns {Promise<Object>} Resultado de la exportación
 */
export const exportProveedoresToExcel = async (filters = {}) => {
  try {
    console.log('📄 Exportando proveedores a Excel');

    const queryParams = createQueryParams(filters);

    const response = await api.get(`/proveedores/excel?${queryParams.toString()}`, {
      responseType: 'blob'
    });

    // Crear enlace de descarga
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    const timestamp = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `proveedores_${timestamp}.xlsx`);
    
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return {
      success: true,
      message: 'Archivo Excel descargado correctamente'
    };
  } catch (error) {
    console.error('❌ Error exportando a Excel:', error);
    
    return {
      success: false,
      message: 'Error al generar el archivo Excel'
    };
  }
};

// ===== UTILITARIOS =====

/**
 * Validar datos de proveedor
 * @param {Object} data - Datos a validar
 * @returns {Object} Resultado de validación
 */
export const validateProveedorData = (data) => {
  const errors = [];

  if (!data.razon_social?.trim()) {
    errors.push('La razón social es obligatoria');
  }

  if (!data.cuit?.trim()) {
    errors.push('El CUIT es obligatorio');
  } else {
    const cuitRegex = /^\d{2}-\d{8}-\d{1}$/;
    if (!cuitRegex.test(data.cuit)) {
      errors.push('Formato de CUIT inválido (XX-XXXXXXXX-X)');
    }
  }

  if (!data.tipo_proveedor) {
    errors.push('El tipo de proveedor es obligatorio');
  }

  if (data.email_general && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email_general)) {
    errors.push('Formato de email inválido');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Formatear datos de proveedor para mostrar
 * @param {Object} proveedor - Datos del proveedor
 * @returns {Object} Datos formateados
 */
export const formatProveedorData = (proveedor) => {
  if (!proveedor) return null;

  return {
    ...proveedor,
    direccion_completa: [
      proveedor.direccion_calle,
      proveedor.direccion_numero,
      proveedor.barrio,
      proveedor.localidad,
      proveedor.provincia
    ].filter(Boolean).join(', '),
    
    contacto_principal: proveedor.contactos?.find(c => c.principal)?.nombre || 'Sin contacto principal',
    
    fecha_alta_formatted: proveedor.fecha_alta ? 
      new Date(proveedor.fecha_alta).toLocaleDateString('es-AR') : 
      'Sin fecha',
      
    estado_text: proveedor.activo ? 'Activo' : 'Inactivo',
    estado_color: proveedor.activo ? 'green' : 'red'
  };
};

// Exportar todo como objeto por defecto
const proveedoresService = {
  // CRUD Principal
  getProveedores,
  getProveedor,
  createProveedor,
  updateProveedor,
  deleteProveedor,
  
  // Contactos
  getContactosByProveedorId,
  createContacto,
  updateContacto,
  deleteContacto,
  
  // Auxiliares
  getTiposProveedores,
  getEstadisticasProveedores,
  searchProveedores,
  exportProveedoresToExcel,
  
  // Utilitarios
  validateProveedorData,
  formatProveedorData
};

export default proveedoresService;
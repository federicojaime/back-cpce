// src/services/proveedoresService.js
import api from './api';

export const proveedoresService = {
  // ==========================================
  // CRUD PROVEEDORES
  // ==========================================

  // Obtener lista de proveedores
  getProveedores: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();

      if (params.search) queryParams.append('search', params.search);
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.activo !== undefined) queryParams.append('activo', params.activo);
      if (params.tipo && params.tipo !== 'todos') queryParams.append('tipo', params.tipo);

      const url = `/proveedores${queryParams.toString() ? `?${queryParams}` : ''}`;
      const response = await api.get(url);

      return {
        success: true,
        data: response.data.data || [],
        pagination: response.data.pagination || {},
        message: 'Proveedores cargados correctamente'
      };
    } catch (error) {
      console.error('Error en getProveedores:', error);
      return {
        success: false,
        data: [],
        pagination: {},
        message: error.response?.data?.message || 'Error al obtener proveedores'
      };
    }
  },

  // Obtener proveedor por ID
  getProveedorById: async (id) => {
    try {
      const response = await api.get(`/proveedores/${id}`);

      return {
        success: true,
        data: response.data.data || {},
        message: 'Proveedor cargado correctamente'
      };
    } catch (error) {
      console.error('Error en getProveedorById:', error);
      return {
        success: false,
        data: {},
        message: error.response?.data?.message || 'Error al obtener proveedor'
      };
    }
  },

  // Crear proveedor
  createProveedor: async (datos) => {
    try {
      const response = await api.post('/proveedores', datos);

      return {
        success: true,
        data: response.data.data || {},
        message: response.data.message || 'Proveedor creado correctamente'
      };
    } catch (error) {
      console.error('Error en createProveedor:', error);
      return {
        success: false,
        data: {},
        message: error.response?.data?.message || 'Error al crear proveedor'
      };
    }
  },

  // Actualizar proveedor
  updateProveedor: async (id, datos) => {
    try {
      const response = await api.put(`/proveedores/${id}`, datos);

      return {
        success: true,
        data: response.data.data || {},
        message: response.data.message || 'Proveedor actualizado correctamente'
      };
    } catch (error) {
      console.error('Error en updateProveedor:', error);
      return {
        success: false,
        data: {},
        message: error.response?.data?.message || 'Error al actualizar proveedor'
      };
    }
  },

  // Eliminar proveedor (soft delete)
  deleteProveedor: async (id) => {
    try {
      const response = await api.delete(`/proveedores/${id}`);

      return {
        success: true,
        data: response.data.data || {},
        message: response.data.message || 'Proveedor desactivado correctamente'
      };
    } catch (error) {
      console.error('Error en deleteProveedor:', error);
      return {
        success: false,
        data: {},
        message: error.response?.data?.message || 'Error al desactivar proveedor'
      };
    }
  },

  // ==========================================
  // CRUD CONTACTOS
  // ==========================================

  // Obtener contactos de un proveedor
  getContactosProveedor: async (proveedorId) => {
    try {
      const response = await api.get(`/proveedores/${proveedorId}/contactos`);

      return {
        success: true,
        data: response.data.data || [],
        message: 'Contactos cargados correctamente'
      };
    } catch (error) {
      console.error('Error en getContactosProveedor:', error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Error al obtener contactos'
      };
    }
  },

  // Crear contacto
  createContacto: async (proveedorId, datos) => {
    try {
      const response = await api.post(`/proveedores/${proveedorId}/contactos`, datos);

      return {
        success: true,
        data: response.data.data || {},
        message: response.data.message || 'Contacto creado correctamente'
      };
    } catch (error) {
      console.error('Error en createContacto:', error);
      return {
        success: false,
        data: {},
        message: error.response?.data?.message || 'Error al crear contacto'
      };
    }
  },

  // Actualizar contacto
  updateContacto: async (proveedorId, contactoId, datos) => {
    try {
      const response = await api.put(`/proveedores/${proveedorId}/contactos/${contactoId}`, datos);

      return {
        success: true,
        data: response.data.data || {},
        message: response.data.message || 'Contacto actualizado correctamente'
      };
    } catch (error) {
      console.error('Error en updateContacto:', error);
      return {
        success: false,
        data: {},
        message: error.response?.data?.message || 'Error al actualizar contacto'
      };
    }
  },

  // Eliminar contacto
  deleteContacto: async (proveedorId, contactoId) => {
    try {
      const response = await api.delete(`/proveedores/${proveedorId}/contactos/${contactoId}`);

      return {
        success: true,
        data: response.data.data || {},
        message: response.data.message || 'Contacto eliminado correctamente'
      };
    } catch (error) {
      console.error('Error en deleteContacto:', error);
      return {
        success: false,
        data: {},
        message: error.response?.data?.message || 'Error al eliminar contacto'
      };
    }
  },

  // ==========================================
  // ENDPOINTS AUXILIARES
  // ==========================================

  // Obtener tipos de proveedores
  getTiposProveedores: async () => {
    try {
      const response = await api.get('/proveedores/tipos');

      return {
        success: true,
        data: response.data.data || [],
        message: 'Tipos de proveedores cargados correctamente'
      };
    } catch (error) {
      console.error('Error en getTiposProveedores:', error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Error al obtener tipos de proveedores'
      };
    }
  },

  // Obtener estadísticas
  getEstadisticas: async () => {
    try {
      const response = await api.get('/proveedores/estadisticas');

      return {
        success: true,
        data: response.data.data || {},
        message: 'Estadísticas cargadas correctamente'
      };
    } catch (error) {
      console.error('Error en getEstadisticas:', error);
      return {
        success: false,
        data: {},
        message: error.response?.data?.message || 'Error al obtener estadísticas'
      };
    }
  },

  // Búsqueda rápida
  buscarProveedores: async (query, limit = 10) => {
    try {
      const response = await api.get(`/proveedores/buscar?q=${encodeURIComponent(query)}&limit=${limit}`);

      return {
        success: true,
        data: response.data.data || [],
        message: 'Búsqueda completada'
      };
    } catch (error) {
      console.error('Error en buscarProveedores:', error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Error en la búsqueda'
      };
    }
  },

  // ==========================================
  // VALIDACIONES
  // ==========================================

  // Validar CUIT
  validarCUIT: (cuit) => {
    if (!cuit) return false;
    
    // Formato XX-XXXXXXXX-X
    const regex = /^\d{2}-\d{8}-\d{1}$/;
    return regex.test(cuit);
  },

  // Formatear CUIT
  formatearCUIT: (cuit) => {
    if (!cuit) return '';
    
    // Remover caracteres no numéricos
    const numeros = cuit.replace(/\D/g, '');
    
    // Formatear como XX-XXXXXXXX-X
    if (numeros.length === 11) {
      return `${numeros.slice(0, 2)}-${numeros.slice(2, 10)}-${numeros.slice(10)}`;
    }
    
    return cuit;
  },

  // Validar email
  validarEmail: (email) => {
    if (!email) return true; // Email es opcional
    
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
};
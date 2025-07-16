// src/services/auditoriasService.js
import api from './api';

export const auditoriasService = {
  // Obtener auditorías pendientes
  getPendientes: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Agregar parámetros de filtro si existen
      if (params.search) queryParams.append('search', params.search);
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      
      const url = `/auditorias/pendientes${queryParams.toString() ? `?${queryParams}` : ''}`;
      const response = await api.get(url);
      
      return {
        success: true,
        data: response.data.data || [],
        total: response.data.total || 0,
        message: response.data.message || 'Auditorías cargadas correctamente'
      };
    } catch (error) {
      console.error('Error en getPendientes:', error);
      return {
        success: false,
        data: [],
        total: 0,
        message: error.response?.data?.message || 'Error al obtener auditorías pendientes'
      };
    }
  },

  // Obtener auditorías históricas
  getHistoricas: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.search) queryParams.append('search', params.search);
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.fechaDesde) queryParams.append('fechaDesde', params.fechaDesde);
      if (params.fechaHasta) queryParams.append('fechaHasta', params.fechaHasta);
      
      const url = `/auditorias/historicas${queryParams.toString() ? `?${queryParams}` : ''}`;
      const response = await api.get(url);
      
      return {
        success: true,
        data: response.data.data || [],
        total: response.data.total || 0,
        message: response.data.message || 'Auditorías históricas cargadas correctamente'
      };
    } catch (error) {
      console.error('Error en getHistoricas:', error);
      return {
        success: false,
        data: [],
        total: 0,
        message: error.response?.data?.message || 'Error al obtener auditorías históricas'
      };
    }
  },

  // Obtener auditoría específica para procesar
  getAuditoria: async (id) => {
    try {
      const response = await api.get(`/auditorias/${id}`);
      
      return {
        success: true,
        data: response.data.auditoria || {},
        message: response.data.message || 'Auditoría cargada correctamente'
      };
    } catch (error) {
      console.error('Error en getAuditoria:', error);
      return {
        success: false,
        data: {},
        message: error.response?.data?.message || 'Error al obtener datos de la auditoría'
      };
    }
  },

  // Procesar auditoría (aprobar/denegar medicamentos)
  procesarAuditoria: async (id, datos) => {
    try {
      const response = await api.post(`/auditorias/${id}/procesar`, datos);
      
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Auditoría procesada correctamente'
      };
    } catch (error) {
      console.error('Error en procesarAuditoria:', error);
      return {
        success: false,
        data: {},
        message: error.response?.data?.message || 'Error al procesar la auditoría'
      };
    }
  },

  // Enviar a médico auditor
  enviarMedicoAuditor: async (id) => {
    try {
      const response = await api.post(`/auditorias/${id}/enviar-medico`);
      
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Auditoría enviada a médico auditor'
      };
    } catch (error) {
      console.error('Error en enviarMedicoAuditor:', error);
      return {
        success: false,
        data: {},
        message: error.response?.data?.message || 'Error al enviar a médico auditor'
      };
    }
  },

  // Revertir auditoría
  revertirAuditoria: async (id, nota = '') => {
    try {
      const response = await api.post(`/auditorias/${id}/revertir-borrar`, {
        accion: '1', // 1 = revertir
        nota
      });
      
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Auditoría revertida correctamente'
      };
    } catch (error) {
      console.error('Error en revertirAuditoria:', error);
      return {
        success: false,
        data: {},
        message: error.response?.data?.message || 'Error al revertir la auditoría'
      };
    }
  },

  // Buscar auditorías con filtros
  buscarAuditorias: async (filtros) => {
    try {
      const response = await api.post('/auditorias/listado', filtros);
      
      return {
        success: true,
        data: response.data.data || [],
        total: response.data.total || 0,
        message: response.data.message || 'Búsqueda completada'
      };
    } catch (error) {
      console.error('Error en buscarAuditorias:', error);
      return {
        success: false,
        data: [],
        total: 0,
        message: error.response?.data?.message || 'Error en la búsqueda'
      };
    }
  },

  // Obtener historial de paciente
  getHistorialPaciente: async (filtros) => {
    try {
      const response = await api.post('/auditorias/paciente', filtros);
      
      return {
        success: true,
        data: response.data.historial || [],
        paciente: response.data.paciente || {},
        message: response.data.message || 'Historial obtenido correctamente'
      };
    } catch (error) {
      console.error('Error en getHistorialPaciente:', error);
      return {
        success: false,
        data: [],
        paciente: {},
        message: error.response?.data?.message || 'Error al obtener historial del paciente'
      };
    }
  },

  // Generar reporte Excel
  generarExcel: async (fecha) => {
    try {
      const response = await api.post('/auditorias/excel', { fecha }, {
        responseType: 'blob' // Para manejar archivos
      });
      
      // Crear URL para descargar el archivo
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `auditorias_${fecha}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return {
        success: true,
        message: 'Archivo Excel descargado correctamente'
      };
    } catch (error) {
      console.error('Error en generarExcel:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al generar el archivo Excel'
      };
    }
  },

  // Obtener auditorías médicas (solo para médicos auditores)
  getAuditoriasMedicas: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.search) queryParams.append('search', params.search);
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      
      const url = `/auditorias/medicas${queryParams.toString() ? `?${queryParams}` : ''}`;
      const response = await api.get(url);
      
      return {
        success: true,
        data: response.data.data || [],
        total: response.data.total || 0,
        message: response.data.message || 'Auditorías médicas cargadas correctamente'
      };
    } catch (error) {
      console.error('Error en getAuditoriasMedicas:', error);
      return {
        success: false,
        data: [],
        total: 0,
        message: error.response?.data?.message || 'Error al obtener auditorías médicas'
      };
    }
  }
};
import api from './api';

export const auditoriasService = {
  // Obtener auditorías pendientes
  getPendientes: async () => {
    try {
      const response = await api.get('/auditorias/pendientes');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener auditorías pendientes');
    }
  },

  // Obtener auditorías históricas
  getHistoricas: async () => {
    try {
      const response = await api.get('/auditorias/historicas');
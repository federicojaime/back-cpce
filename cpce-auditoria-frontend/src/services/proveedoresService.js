// src/services/proveedoresService.js
import api from './api';

// Obtener todos los proveedores con filtros
export const getProveedores = async (params = {}) => {
  try {
    const response = await api.get('/proveedores', { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    throw error;
  }
};

// Obtener un proveedor por ID
export const getProveedor = async (id) => {
  try {
    const response = await api.get(`/proveedores/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener proveedor:', error);
    throw error;
  }
};

// Crear un nuevo proveedor
export const createProveedor = async (data) => {
  try {
    const response = await api.post('/proveedores', data);
    return response.data;
  } catch (error) {
    console.error('Error al crear proveedor:', error);
    throw error;
  }
};

// Actualizar un proveedor
export const updateProveedor = async (id, data) => {
  try {
    const response = await api.put(`/proveedores/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar proveedor:', error);
    throw error;
  }
};

// Eliminar un proveedor
export const deleteProveedor = async (id) => {
  try {
    const response = await api.delete(`/proveedores/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar proveedor:', error);
    throw error;
  }
};

// Obtener contactos de un proveedor
export const getContactosByProveedorId = async (proveedorId) => {
  try {
    const response = await api.get(`/proveedores/${proveedorId}/contactos`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener contactos:', error);
    throw error;
  }
};

// Crear un nuevo contacto
export const createContacto = async (data) => {
  try {
    const response = await api.post('/proveedores/contactos', data);
    return response.data;
  } catch (error) {
    console.error('Error al crear contacto:', error);
    throw error;
  }
};

// Actualizar un contacto
export const updateContacto = async (id, data) => {
  try {
    const response = await api.put(`/proveedores/contactos/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar contacto:', error);
    throw error;
  }
};

// Eliminar un contacto
export const deleteContacto = async (id) => {
  try {
    const response = await api.delete(`/proveedores/contactos/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar contacto:', error);
    throw error;
  }
};

// Buscar proveedores
export const searchProveedores = async (query) => {
  try {
    const response = await api.get('/proveedores/search', { params: { q: query } });
    return response.data;
  } catch (error) {
    console.error('Error al buscar proveedores:', error);
    throw error;
  }
};

// Exportar proveedores a Excel
export const exportProveedoresToExcel = async (params = {}) => {
  try {
    const response = await api.get('/proveedores/export', {
      params,
      responseType: 'blob'
    });
    
    // Crear un enlace para descargar el archivo
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `proveedores_${new Date().toISOString().split('T')[0]}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return response.data;
  } catch (error) {
    console.error('Error al exportar proveedores:', error);
    throw error;
  }
};
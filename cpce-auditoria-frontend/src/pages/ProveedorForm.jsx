import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { getProveedor, createProveedor, updateProveedor } from '../services/proveedoresService';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';

const ProveedorForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    razon_social: '',
    cuit: '',
    tipo: 'farmacia',
    direccion: '',
    telefono: '',
    email: '',
    observaciones: '',
    activo: true
  });

  useEffect(() => {
    if (isEditMode) {
      fetchProveedor();
    }
  }, [id]);

  const fetchProveedor = async () => {
    try {
      setLoading(true);
      const data = await getProveedor(id);
      setFormData({
        nombre: data.nombre || '',
        razon_social: data.razon_social || '',
        cuit: data.cuit || '',
        tipo: data.tipo || 'farmacia',
        direccion: data.direccion || '',
        telefono: data.telefono || '',
        email: data.email || '',
        observaciones: data.observaciones || '',
        activo: data.activo ?? true
      });
    } catch (err) {
      setError('Error al cargar los datos del proveedor');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);
      if (isEditMode) {
        await updateProveedor(id, formData);
      } else {
        await createProveedor(formData);
      }
      navigate('/proveedores');
    } catch (err) {
      setError(isEditMode ? 'Error al actualizar el proveedor' : 'Error al crear el proveedor');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) return <Loading text="Cargando proveedor..." />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/proveedores')}
            className="text-gray-400 hover:text-gray-500"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? 'Editar Proveedor' : 'Nuevo Proveedor'}
          </h1>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg p-6">
        <div className="grid grid-cols-1 gap-6">
          {/* Información básica */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                  Nombre *
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="razon_social" className="block text-sm font-medium text-gray-700">
                  Razón Social
                </label>
                <input
                  type="text"
                  id="razon_social"
                  name="razon_social"
                  value={formData.razon_social}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="cuit" className="block text-sm font-medium text-gray-700">
                  CUIT *
                </label>
                <input
                  type="text"
                  id="cuit"
                  name="cuit"
                  value={formData.cuit}
                  onChange={handleInputChange}
                  required
                  placeholder="XX-XXXXXXXX-X"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="tipo" className="block text-sm font-medium text-gray-700">
                  Tipo *
                </label>
                <select
                  id="tipo"
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="farmacia">Farmacia</option>
                  <option value="drogueria">Droguería</option>
                </select>
              </div>
            </div>
          </div>

          {/* Información de contacto */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Información de Contacto</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="direccion" className="block text-sm font-medium text-gray-700">
                  Dirección
                </label>
                <input
                  type="text"
                  id="direccion"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">
                  Teléfono
                </label>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Información Adicional</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700">
                  Observaciones
                </label>
                <textarea
                  id="observaciones"
                  name="observaciones"
                  rows={4}
                  value={formData.observaciones}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="activo"
                  name="activo"
                  checked={formData.activo}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="activo" className="ml-2 block text-sm text-gray-900">
                  Proveedor activo
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="mt-6 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/proveedores')}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Guardando...' : (isEditMode ? 'Actualizar' : 'Crear')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProveedorForm;
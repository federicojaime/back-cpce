import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeftIcon, PencilIcon, PhoneIcon, EnvelopeIcon, MapPinIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { getProveedor } from '../services/proveedoresService';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';

const ProveedorDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proveedor, setProveedor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProveedor();
  }, [id]);

  const fetchProveedor = async () => {
    try {
      setLoading(true);
      const data = await getProveedor(id);
      setProveedor(data);
    } catch (err) {
      setError('Error al cargar los datos del proveedor');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading text="Cargando proveedor..." />;
  if (error) return <ErrorMessage message={error} />;
  if (!proveedor) return <ErrorMessage message="Proveedor no encontrado" />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/proveedores')}
              className="text-gray-400 hover:text-gray-500"
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{proveedor.nombre}</h1>
              <p className="text-sm text-gray-500">CUIT: {proveedor.cuit}</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Link
              to={`/proveedores/${id}/contactos`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <UserGroupIcon className="h-4 w-4 mr-2" />
              Contactos
            </Link>
            <Link
              to={`/proveedores/${id}/editar`}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Editar
            </Link>
          </div>
        </div>
      </div>

      {/* Información General */}
      <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Información General</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500">Razón Social</label>
            <p className="mt-1 text-sm text-gray-900">{proveedor.razon_social || '-'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">CUIT</label>
            <p className="mt-1 text-sm text-gray-900">{proveedor.cuit}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Tipo</label>
            <p className="mt-1 text-sm text-gray-900">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full 
                ${proveedor.tipo === 'farmacia' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                {proveedor.tipo}
              </span>
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Estado</label>
            <p className="mt-1 text-sm text-gray-900">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full 
                ${proveedor.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {proveedor.activo ? 'Activo' : 'Inactivo'}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Información de Contacto */}
      <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Información de Contacto</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start">
            <PhoneIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
            <div>
              <label className="block text-sm font-medium text-gray-500">Teléfono</label>
              <p className="mt-1 text-sm text-gray-900">{proveedor.telefono || '-'}</p>
            </div>
          </div>
          <div className="flex items-start">
            <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
            <div>
              <label className="block text-sm font-medium text-gray-500">Email</label>
              <p className="mt-1 text-sm text-gray-900">{proveedor.email || '-'}</p>
            </div>
          </div>
          <div className="flex items-start md:col-span-2">
            <MapPinIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-500">Dirección</label>
              <p className="mt-1 text-sm text-gray-900">{proveedor.direccion || '-'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Información Adicional */}
      {proveedor.observaciones && (
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Observaciones</h2>
          <p className="text-sm text-gray-900 whitespace-pre-wrap">{proveedor.observaciones}</p>
        </div>
      )}
    </div>
  );
};

export default ProveedorDetalle;
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, PlusIcon, PencilIcon, TrashIcon, UserIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { getProveedor, getContactosByProveedorId, createContacto, updateContacto, deleteContacto } from '../services/proveedoresService';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';

const ContactosProveedor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proveedor, setProveedor] = useState(null);
  const [contactos, setContactos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingContacto, setEditingContacto] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    cargo: '',
    telefono: '',
    email: '',
    observaciones: ''
  });

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [proveedorData, contactosData] = await Promise.all([
        getProveedor(id),
        getContactosByProveedorId(id)
      ]);
      setProveedor(proveedorData);
      setContactos(contactosData);
    } catch (err) {
      setError('Error al cargar los datos');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingContacto) {
        await updateContacto(editingContacto.id, { ...formData, proveedor_id: id });
      } else {
        await createContacto({ ...formData, proveedor_id: id });
      }
      await fetchData();
      resetForm();
    } catch (err) {
      setError('Error al guardar el contacto');
      console.error('Error:', err);
    }
  };

  const handleEdit = (contacto) => {
    setEditingContacto(contacto);
    setFormData({
      nombre: contacto.nombre || '',
      cargo: contacto.cargo || '',
      telefono: contacto.telefono || '',
      email: contacto.email || '',
      observaciones: contacto.observaciones || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (contactoId) => {
    if (window.confirm('¿Está seguro de eliminar este contacto?')) {
      try {
        await deleteContacto(contactoId);
        await fetchData();
      } catch (err) {
        setError('Error al eliminar el contacto');
        console.error('Error:', err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      cargo: '',
      telefono: '',
      email: '',
      observaciones: ''
    });
    setEditingContacto(null);
    setShowForm(false);
  };

  if (loading) return <Loading text="Cargando contactos..." />;
  if (error && !proveedor) return <ErrorMessage message={error} />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(`/proveedores/${id}`)}
              className="text-gray-400 hover:text-gray-500"
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Contactos de {proveedor?.nombre || 'Proveedor'}
              </h1>
              <p className="text-sm text-gray-500">Gestión de personas de contacto</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Nuevo Contacto
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Formulario de contacto */}
      {showForm && (
        <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingContacto ? 'Editar Contacto' : 'Nuevo Contacto'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                  Nombre Completo *
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
                <label htmlFor="cargo" className="block text-sm font-medium text-gray-700">
                  Cargo
                </label>
                <input
                  type="text"
                  id="cargo"
                  name="cargo"
                  value={formData.cargo}
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
              <div className="md:col-span-2">
                <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700">
                  Observaciones
                </label>
                <textarea
                  id="observaciones"
                  name="observaciones"
                  rows={3}
                  value={formData.observaciones}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                {editingContacto ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de contactos */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        {contactos.length === 0 ? (
          <div className="text-center py-12">
            <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Sin contactos</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comience agregando un nuevo contacto para este proveedor.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {contactos.map((contacto) => (
              <div key={contacto.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <UserIcon className="h-10 w-10 text-gray-400 mr-4" />
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{contacto.nombre}</h3>
                        {contacto.cargo && (
                          <p className="text-sm text-gray-500">{contacto.cargo}</p>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center space-x-6 text-sm text-gray-500">
                      {contacto.telefono && (
                        <div className="flex items-center">
                          <PhoneIcon className="h-4 w-4 mr-1" />
                          {contacto.telefono}
                        </div>
                      )}
                      {contacto.email && (
                        <div className="flex items-center">
                          <EnvelopeIcon className="h-4 w-4 mr-1" />
                          {contacto.email}
                        </div>
                      )}
                    </div>
                    {contacto.observaciones && (
                      <p className="mt-2 text-sm text-gray-600">{contacto.observaciones}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(contacto)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(contacto.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactosProveedor;
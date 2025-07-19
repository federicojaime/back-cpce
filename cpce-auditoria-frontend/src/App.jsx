// src/App.jsx - ACTUALIZADO CON RUTAS DE PROVEEDORES
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Login from './components/auth/Login';
import Loading from './components/common/Loading';

// Páginas de Auditorías
import Dashboard from './pages/Dashboard';
import AuditoriasPendientes from './pages/AuditoriasPendientes';
import AuditoriasHistoricas from './pages/AuditoriasHistoricas';
import ListadoAuditorias from './pages/ListadoAuditorias';
import HistorialPaciente from './pages/HistorialPaciente';
import DescargarExcel from './pages/DescargarExcel';
import Vademecum from './pages/Vademecum';
import ProcesarAuditoria from './pages/ProcesarAuditoria';
import VerAuditoriaHistorica from './pages/VerAuditoriaHistorica';

// Páginas de Proveedores
import Proveedores from './pages/Proveedores';
import ProveedorDetalle from './pages/ProveedorDetalle';
import ProveedorForm from './pages/ProveedorForm';
import ContactosProveedor from './pages/ContactosProveedor';

// Componente para rutas protegidas
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading text="Verificando sesión..." />
      </div>
    );
  }

  return isAuthenticated ? (
    <Layout>{children}</Layout>
  ) : (
    <Navigate to="/login" replace />
  );
};

// Componente para rutas públicas (redirigir si ya está logueado)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading text="Verificando sesión..." />
      </div>
    );
  }

  return !isAuthenticated ? children : <Navigate to="/" replace />;
};

// Componente principal de la aplicación
function AppContent() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* Rutas protegidas - Dashboard */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Rutas protegidas - Auditorías */}
      <Route
        path="/pendientes"
        element={
          <ProtectedRoute>
            <AuditoriasPendientes />
          </ProtectedRoute>
        }
      />

      <Route
        path="/historicos"
        element={
          <ProtectedRoute>
            <AuditoriasHistoricas />
          </ProtectedRoute>
        }
      />

      <Route
        path="/listado"
        element={
          <ProtectedRoute>
            <ListadoAuditorias />
          </ProtectedRoute>
        }
      />

      <Route
        path="/historial-paciente"
        element={
          <ProtectedRoute>
            <HistorialPaciente />
          </ProtectedRoute>
        }
      />

      <Route
        path="/descargar-excel"
        element={
          <ProtectedRoute>
            <DescargarExcel />
          </ProtectedRoute>
        }
      />

      <Route
        path="/vademecum"
        element={
          <ProtectedRoute>
            <Vademecum />
          </ProtectedRoute>
        }
      />

      {/* Rutas para procesar auditorías */}
      <Route
        path="/auditoria/:id"
        element={
          <ProtectedRoute>
            <ProcesarAuditoria />
          </ProtectedRoute>
        }
      />

      <Route
        path="/auditoria/:id/historica"
        element={
          <ProtectedRoute>
            <VerAuditoriaHistorica />
          </ProtectedRoute>
        }
      />

      {/* ===== RUTAS DE PROVEEDORES ===== */}
      
      {/* Lista de proveedores */}
      <Route
        path="/proveedores"
        element={
          <ProtectedRoute>
            <Proveedores />
          </ProtectedRoute>
        }
      />

      {/* Crear nuevo proveedor */}
      <Route
        path="/proveedores/nuevo"
        element={
          <ProtectedRoute>
            <ProveedorForm />
          </ProtectedRoute>
        }
      />

      {/* Ver detalle de proveedor */}
      <Route
        path="/proveedores/:id"
        element={
          <ProtectedRoute>
            <ProveedorDetalle />
          </ProtectedRoute>
        }
      />

      {/* Editar proveedor */}
      <Route
        path="/proveedores/:id/editar"
        element={
          <ProtectedRoute>
            <ProveedorForm />
          </ProtectedRoute>
        }
      />

      {/* Gestión de contactos */}
      <Route
        path="/proveedores/contactos"
        element={
          <ProtectedRoute>
            <ContactosProveedor />
          </ProtectedRoute>
        }
      />

      {/* Gestión de contactos de un proveedor específico */}
      <Route
        path="/proveedores/:id/contactos"
        element={
          <ProtectedRoute>
            <ContactosProveedor />
          </ProtectedRoute>
        }
      />

      {/* Rutas de administración/configuración */}
      <Route
        path="/perfil"
        element={
          <ProtectedRoute>
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-900">Perfil de Usuario</h1>
              <p className="mt-2 text-gray-600">Funcionalidad en desarrollo</p>
            </div>
          </ProtectedRoute>
        }
      />

      <Route
        path="/configuracion"
        element={
          <ProtectedRoute>
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
              <p className="mt-2 text-gray-600">Funcionalidad en desarrollo</p>
            </div>
          </ProtectedRoute>
        }
      />

      {/* Páginas de ayuda */}
      <Route
        path="/ayuda"
        element={
          <ProtectedRoute>
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-900">Centro de Ayuda</h1>
              <p className="mt-2 text-gray-600">Documentación y soporte técnico</p>
            </div>
          </ProtectedRoute>
        }
      />

      <Route
        path="/manual"
        element={
          <ProtectedRoute>
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-900">Manual de Usuario</h1>
              <p className="mt-2 text-gray-600">Guía completa del sistema</p>
            </div>
          </ProtectedRoute>
        }
      />

      {/* Ruta de fallback - 404 */}
      <Route
        path="/404"
        element={
          <ProtectedRoute>
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h1 className="mt-4 text-xl font-bold text-gray-900">Página no encontrada</h1>
                <p className="mt-2 text-sm text-gray-600">
                  La página que buscas no existe o ha sido movida.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => window.history.back()}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Volver atrás
                  </button>
                </div>
              </div>
            </div>
          </ProtectedRoute>
        }
      />

      {/* Redirigir cualquier ruta no encontrada a 404 */}
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}

// Componente principal con providers
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppContent />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
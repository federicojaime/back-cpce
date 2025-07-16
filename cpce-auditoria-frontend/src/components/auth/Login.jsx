import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { EyeIcon, EyeSlashIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

// Importar assets
import { cpceLogo, loginBackground } from '../../assets';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const { login, isAuthenticated, clearLoginError } = useAuth();
  const navigate = useNavigate();

  // Cargar error de sessionStorage al montar
  useEffect(() => {
    const savedError = sessionStorage.getItem('login_error');
    if (savedError) {
      setLocalError(savedError);
    }
  }, []);

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      // Limpiar error al autenticarse exitosamente
      sessionStorage.removeItem('login_error');
      setLocalError('');
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username.trim() || !password) {
      const error = 'Por favor complete todos los campos';
      setLocalError(error);
      sessionStorage.setItem('login_error', error);
      return;
    }

    setLoading(true);
    setLocalError('');
    sessionStorage.removeItem('login_error');
    
    try {
      const result = await login(username.trim(), password);
      
      if (!result.success) {
        const error = result.message || 'Usuario y/o contraseña incorrectos';
        console.log('❌ Login fallido:', error);
        
        // Guardar error en AMBOS lados
        setLocalError(error);
        sessionStorage.setItem('login_error', error);
        
        // Limpiar contraseña
        setPassword('');
      }
      // Si es exitoso, se maneja en el useEffect de isAuthenticated
    } catch (error) {
      const errorMsg = 'Error de conexión. Verifique su red.';
      setLocalError(errorMsg);
      sessionStorage.setItem('login_error', errorMsg);
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setLocalError('');
    sessionStorage.removeItem('login_error');
    clearLoginError();
  };

  const handleInputChange = (field, value) => {
    if (field === 'username') {
      setUsername(value);
    } else {
      setPassword(value);
    }
    
    // Limpiar error solo si el usuario está escribiendo
    if (localError && value.length > 0) {
      clearError();
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center relative"
      style={{
        backgroundImage: `url(${loginBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay oscuro */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      
      {/* Contenedor del formulario */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          
          {/* Header con logo */}
          <div className="px-8 pt-8 pb-6 text-center bg-white">
            <div className="mb-4">
              <img 
                src={cpceLogo} 
                alt="CPCE Córdoba" 
                className="mx-auto h-20 w-auto"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              {/* Logo fallback */}
              <div 
                className="mx-auto h-20 w-20 bg-blue-600 rounded-lg items-center justify-center text-white font-bold text-lg"
                style={{ display: 'none' }}
              >
                CPCE
              </div>
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Ingreso
            </h2>
          </div>

          {/* ERROR PERSISTENTE CON SESSIONSTORAGE */}
          {localError && (
            <div className="mx-8 mb-4 bg-red-50 border-l-4 border-red-400 rounded-r-md p-4 shadow-md">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-red-800">
                    Error de autenticación
                  </h3>
                  <p className="text-sm text-red-700 mt-1">
                    {localError}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <button
                    type="button"
                    onClick={clearError}
                    className="text-red-400 hover:text-red-600 focus:outline-none focus:text-red-600 transition ease-in-out duration-150"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Formulario */}
          <div className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Campo Usuario */}
              <div>
                <input
                  type="text"
                  required
                  className="block w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-200"
                  placeholder="Usuario"
                  value={username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  disabled={loading}
                  autoComplete="username"
                />
              </div>

              {/* Campo Contraseña */}
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="block w-full px-4 py-3 pr-12 border border-gray-300 rounded-md bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-200"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>

              {/* Loading */}
              {loading && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-center">
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-sm text-blue-600 font-medium">Verificando credenciales...</span>
                  </div>
                </div>
              )}

              {/* Botón Ingresar */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || !username.trim() || !password}
                  className="w-full flex justify-center items-center px-4 py-3 text-base font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 shadow-lg"
                >
                  {loading ? 'Ingresando...' : 'Ingresar'}
                </button>
              </div>

              {/* Enlace cambio de contraseña */}
              <div className="text-center pt-4">
                <button
                  type="button"
                  onClick={() => alert('Funcionalidad próximamente')}
                  className="text-sm text-gray-600 hover:text-teal-600 transition duration-200"
                  disabled={loading}
                >
                  🔒 ¿Olvidaste tu contraseña?
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
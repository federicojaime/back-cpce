import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState(''); // ERROR PERSISTENTE AQUÍ

  useEffect(() => {
    const token = localStorage.getItem('cpce_token');
    const userData = localStorage.getItem('cpce_user');
    
    console.log('AuthContext - Verificando token existente:', !!token);
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
        setLoginError(''); // Limpiar error si ya está autenticado
        console.log('AuthContext - Usuario cargado:', parsedUser.nombre);
      } catch (error) {
        console.error('Error parsing user data:', error);
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      console.log('AuthContext - Enviando request de login...');
      
      // Limpiar error anterior
      setLoginError('');
      
      const response = await api.post('/auth/login', {
        username,
        password
      });

      console.log('AuthContext - Respuesta recibida:', response.data);

      if (response.data.success) {
        const { token, user: userData } = response.data;
        
        // Guardar en localStorage
        localStorage.setItem('cpce_token', token);
        localStorage.setItem('cpce_user', JSON.stringify(userData));
        
        // Actualizar estado
        setUser(userData);
        setIsAuthenticated(true);
        setLoginError(''); // Limpiar cualquier error
        
        console.log('AuthContext - Login exitoso para:', userData.nombre);
        
        return { success: true, user: userData };
      } else {
        const errorMsg = response.data.message || 'Usuario y/o contraseña incorrectos';
        console.log('AuthContext - Login fallido:', errorMsg);
        setLoginError(errorMsg); // GUARDAR ERROR EN CONTEXTO
        return { success: false, message: errorMsg };
      }
    } catch (error) {
      console.error('AuthContext - Error en login:', error);
      const errorMsg = error.response?.data?.message || 'Error de conexión';
      setLoginError(errorMsg); // GUARDAR ERROR EN CONTEXTO
      return { 
        success: false, 
        message: errorMsg
      };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
      console.log('AuthContext - Logout exitoso');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Limpiar datos locales
      localStorage.removeItem('cpce_token');
      localStorage.removeItem('cpce_user');
      setUser(null);
      setIsAuthenticated(false);
      setLoginError(''); // Limpiar error
      console.log('AuthContext - Estado limpiado');
    }
  };

  const clearLoginError = () => {
    console.log('AuthContext - Limpiando error de login');
    setLoginError('');
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    loginError,
    login,
    logout,
    clearLoginError
  };

  console.log('AuthContext - Estado actual:', { 
    isAuthenticated, 
    loading, 
    userName: user?.nombre,
    hasError: !!loginError
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
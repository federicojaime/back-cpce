// Importar imágenes desde las carpetas correctas
import cpceLogo from './logos/logo-dark.png';
import loginBackground from './images/auth-bg.jpg';

// Exportar assets individuales
export {
  cpceLogo,
  loginBackground
};

// Exportar como objeto para facilitar el uso
export const assets = {
  logos: {
    cpce: cpceLogo,
    dark: cpceLogo
  },
  images: {
    loginBackground,
    authBg: loginBackground
  }
};
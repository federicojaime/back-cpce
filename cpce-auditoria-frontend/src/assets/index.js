// Importar imágenes desde las carpetas correctas
import cpceLogo from './logos/logo-dark.png';
import loginBackground from './images/auth-bg.jpg';

// Placeholder para más assets si se necesitan
export const defaultAvatar = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNEMUQ1REIiLz4KPHBhdGggZD0iTTIwIDEwYzIuNzYgMCA1IDIuMjQgNSA1cy0yLjI0IDUtNSA1LTUtMi4yNC01LTUgMi4yNC01IDUtNXptMCA0YzYuNjMgMCAxMiAyLjY5IDEyIDZzLTUuMzcgNi0xMiA2LTEyLTIuNjktMTItNiA1LjM3LTYgMTItNnoiIGZpbGw9IiM5Q0E4QjQiLz4KPC9zdmc+Cg==";

// Iconos adicionales si se necesitan
export const medicalIcons = {
    stethoscope: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTExIDJjMC0uNTUuNDUtMSAxLTFzMSAuNDUgMSAxdjE2YzAgMS4xLjkgMiAyIDJzMi0uOSAyLTJjMC0uNTUuNDUtMSAxLTFzMSAuNDUgMSAxYzAgMi4yMS0xLjc5IDQtNCA0cy00LTEuNzktNC00VjJaIiBmaWxsPSJjdXJyZW50Q29sb3IiLz4KPC9zdmc+Cg=="
};
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
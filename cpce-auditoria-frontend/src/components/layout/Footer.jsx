// src/components/layout/Footer.jsx
import React from 'react';

const Footer = () => {
    // Configuración de enlaces del footer
    const footerLinks = [
        {
            id: 'ayuda',
            name: 'Ayuda',
            href: '/ayuda',
            external: false
        },
        {
            id: 'soporte',
            name: 'Soporte Técnico',
            href: 'mailto:soporte@cpce.org.ar',
            external: true
        },
        {
            id: 'manual',
            name: 'Manual de Usuario',
            href: '/manual',
            external: false
        },
        {
            id: 'version',
            name: 'Versión 2.0.1',
            href: '#',
            external: false,
            disabled: true
        }
    ];

    // Información del sistema
    const systemInfo = {
        year: new Date().getFullYear(),
        company: 'Altaluna',
        version: '2.0.1',
        lastUpdate: 'Enero 2025'
    };

    return (
        <footer className="bg-white border-t border-gray-200 py-4 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">

                    {/* Información de copyright */}
                    <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
                        <p className="text-sm text-gray-500">
                            {systemInfo.year} © {systemInfo.company}
                        </p>
                        <div className="hidden sm:block h-4 w-px bg-gray-300" />
                        <p className="text-xs text-gray-400">
                            CPCE Córdoba - Sistema de Auditorías
                        </p>
                    </div>

                    {/* Enlaces y información del sistema */}
                    <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6">
                        {/* Enlaces */}
                        <div className="flex items-center space-x-4">
                            {footerLinks.map((link) => {
                                if (link.disabled) {
                                    return (
                                        <span
                                            key={link.id}
                                            className="text-xs text-gray-400 cursor-default"
                                        >
                                            {link.name}
                                        </span>
                                    );
                                }

                                if (link.external) {
                                    return (
                                        <a
                                            key={link.id}
                                            href={link.href}
                                            className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
                                            target={link.href.startsWith('mailto:') ? '_self' : '_blank'}
                                            rel={link.href.startsWith('mailto:') ? '' : 'noopener noreferrer'}
                                        >
                                            {link.name}
                                        </a>
                                    );
                                }

                                return (
                                    <a
                                        key={link.id}
                                        href={link.href}
                                        className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
                                    >
                                        {link.name}
                                    </a>
                                );
                            })}
                        </div>

                        {/* Información adicional */}
                        <div className="flex items-center space-x-2 text-xs text-gray-400">
                            <span>•</span>
                            <span>Actualizado {systemInfo.lastUpdate}</span>
                        </div>
                    </div>
                </div>

                {/* Información adicional en móvil */}
                <div className="mt-3 pt-3 border-t border-gray-100 block sm:hidden">
                    <div className="flex justify-center items-center space-x-4 text-xs text-gray-400">
                        <span>Estado: Sistema activo</span>
                        <span>•</span>
                        <span>Servidor: Online</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
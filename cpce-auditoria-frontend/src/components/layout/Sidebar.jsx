// src/components/layout/Sidebar.jsx - ACTUALIZADO CON PROVEEDORES
import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { cpceLogo } from '../../assets';
import {
    HomeIcon,
    DocumentCheckIcon,
    ClockIcon,
    MagnifyingGlassIcon,
    UserIcon,
    DocumentArrowDownIcon,
    BookOpenIcon,
    BuildingOfficeIcon,
    UserGroupIcon,
    PlusIcon,
    ChevronDownIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';

const Sidebar = () => {
    const [expandedMenus, setExpandedMenus] = useState({ 
        auditoria: true, 
        proveedores: true 
    });
    const location = useLocation();
    const { user } = useAuth();

    // Configuración de navegación actualizada
    const navigationConfig = [
        {
            id: 'auditoria',
            name: 'Auditoría',
            icon: DocumentCheckIcon,
            children: [
                {
                    id: 'pendientes',
                    name: 'Pendientes',
                    href: '/pendientes',
                    icon: ClockIcon
                },
                {
                    id: 'historicos',
                    name: 'Históricos',
                    href: '/historicos',
                    icon: DocumentCheckIcon
                },
                {
                    id: 'listado',
                    name: 'Listado',
                    href: '/listado',
                    icon: MagnifyingGlassIcon
                },
                {
                    id: 'historial-paciente',
                    name: 'Historial Paciente',
                    href: '/historial-paciente',
                    icon: UserIcon
                },
                {
                    id: 'descargar-excel',
                    name: 'Descargar (Excel)',
                    href: '/descargar-excel',
                    icon: DocumentArrowDownIcon
                }
            ]
        },
        {
            id: 'proveedores',
            name: 'Proveedores',
            icon: BuildingOfficeIcon,
            children: [
                {
                    id: 'lista-proveedores',
                    name: 'Lista de Proveedores',
                    href: '/proveedores',
                    icon: BuildingOfficeIcon
                },
                {
                    id: 'nuevo-proveedor',
                    name: 'Nuevo Proveedor',
                    href: '/proveedores/nuevo',
                    icon: PlusIcon
                },
                {
                    id: 'contactos',
                    name: 'Gestión de Contactos',
                    href: '/proveedores/contactos',
                    icon: UserGroupIcon
                }
            ]
        },
        {
            id: 'vademecum',
            name: 'Vademécum',
            href: '/vademecum',
            icon: BookOpenIcon
        }
    ];

    // Verificar si una ruta está activa
    const isActive = (href) => {
        if (href === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(href);
    };

    // Verificar si un menú padre tiene rutas activas
    const hasActiveChild = (children) => {
        return children?.some(child => isActive(child.href));
    };

    // Toggle de menús expandibles
    const toggleMenu = (menuId) => {
        setExpandedMenus(prev => ({
            ...prev,
            [menuId]: !prev[menuId]
        }));
    };

    // Construir URL de la foto del usuario
    const getUserPhotoUrl = () => {
        if (user?.foto) {
            const baseUrl = import.meta.env.VITE_PHOTOS_BASE_URL || 'https://cpce.recetasalud.ar/img-auditores';
            return `${baseUrl}/${user.foto}`;
        }
        return null;
    };

    return (
        <div className="flex flex-col h-full">
            {/* Logo y título */}
            <div className="flex items-center flex-shrink-0 px-4 py-4 border-b border-gray-200">
                <img
                    src={cpceLogo}
                    alt="CPCE Córdoba"
                    className="h-10 w-18 object-contain"
                    onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                    }}
                />
            </div>

            {/* Información del usuario */}
            <div className="px-4 py-4 border-b border-gray-200">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        {getUserPhotoUrl() ? (
                            <img
                                src={getUserPhotoUrl()}
                                alt={`${user.nombre} ${user.apellido}`}
                                className="h-10 w-10 rounded-full object-cover"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                        ) : null}
                        {/* Fallback avatar */}
                        <div
                            className={`h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center ${getUserPhotoUrl() ? 'hidden' : 'flex'
                                }`}
                        >
                            <UserIcon className="h-6 w-6 text-white" />
                        </div>
                    </div>
                    <div className="ml-3 min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-700 truncate">
                            {user?.nombre} {user?.apellido}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center">
                            <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                            {user?.rol === 5 ? 'Administrativo' : 'Médico Auditor'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Navegación */}
            <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-3">
                    MENÚ
                </div>

                {navigationConfig.map((item) => {
                    const isItemActive = item.href ? isActive(item.href) : hasActiveChild(item.children);
                    const isExpanded = expandedMenus[item.id];

                    return (
                        <div key={item.id}>
                            {item.children ? (
                                // Menú con submenús
                                <div>
                                    <button
                                        className={`${isItemActive
                                                ? 'bg-blue-50 border-r-2 border-blue-500 text-blue-700'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            } group w-full flex items-center pl-2 pr-1 py-2 text-left text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200`}
                                        onClick={() => toggleMenu(item.id)}
                                    >
                                        <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                                        <span className="flex-1 truncate">{item.name}</span>
                                        {isExpanded ? (
                                            <ChevronDownIcon className="ml-2 h-4 w-4 flex-shrink-0 transition-transform duration-200" />
                                        ) : (
                                            <ChevronRightIcon className="ml-2 h-4 w-4 flex-shrink-0 transition-transform duration-200" />
                                        )}
                                    </button>

                                    {/* Submenús */}
                                    <div className={`mt-1 space-y-1 transition-all duration-200 overflow-hidden ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                        }`}>
                                        {item.children.map((child) => (
                                            <Link
                                                key={child.id}
                                                to={child.href}
                                                className={`${isActive(child.href)
                                                        ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500'
                                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                    } group flex items-center pl-11 pr-2 py-2 text-sm font-medium rounded-md transition-all duration-200`}
                                            >
                                                <child.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                                                <span className="truncate">{child.name}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                // Menú simple
                                <Link
                                    to={item.href}
                                    className={`${isItemActive
                                            ? 'bg-blue-50 border-r-2 border-blue-500 text-blue-700'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-200`}
                                >
                                    <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                                    <span className="truncate">{item.name}</span>
                                </Link>
                            )}
                        </div>
                    );
                })}
            </nav>
        </div>
    );
};

export default Sidebar;
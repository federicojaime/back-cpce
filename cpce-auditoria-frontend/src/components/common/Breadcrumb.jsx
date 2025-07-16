// src/components/common/Breadcrumb.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';

const Breadcrumb = ({ items = [] }) => {
  return (
    <nav className="flex mb-6" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        {/* Home siempre presente */}
        <li className="inline-flex items-center">
          <Link 
            to="/" 
            className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200"
          >
            <HomeIcon className="w-4 h-4 mr-2" />
            Inicio
          </Link>
        </li>
        
        {/* Items dinámicos */}
        {items.map((item, index) => (
          <li key={item.href || index}>
            <div className="flex items-center">
              <ChevronRightIcon className="w-5 h-5 text-gray-400" />
              {item.current || !item.href ? (
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                  {item.name}
                </span>
              ) : (
                <Link
                  to={item.href}
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2 transition-colors duration-200"
                >
                  {item.name}
                </Link>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
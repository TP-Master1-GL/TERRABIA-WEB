// Header.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ShoppingCartIcon, 
  UserIcon, 
  Bars3Icon,
  XMarkIcon 
} from '@heroicons/react/24/outline';
import ProfileModal from '../ProfileModal';
import logo from '../../assets/terra.png'; // <== Mets ici le chemin vers ton logo

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Accueil', href: '/', current: location.pathname === '/' },
    { name: 'Marché', href: '/marketplace', current: location.pathname === '/marketplace' },
    // { name: 'Agriculteurs', href: '/farmers', current: location.pathname === '/farmers' },
  ];

  const userNavigation = user ? [
    { name: 'Mon Profil', onClick: () => setIsProfileModalOpen(true) },
    { name: user.role === 'farmer' ? 'Mes Produits' : 'Mes Commandes', href: '/dashboard' },
    { name: 'Déconnexion', onClick: logout },
  ] : [
    { name: 'Connexion', href: '/login' },
    { name: 'Inscription', href: '/register' },
  ];

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            
            {/* Logo + Navigation principale */}
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center">
              
                <span className="text-xl font-extrabold text-gray-900 tracking-wide">
                  <img
                  src={logo}
                  alt="Terrabia Logo"
                  className="h-40 w-auto mr-2"
                />
                </span>
              </Link>

              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      item.current
                        ? 'border-primary-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Navigation utilisateur */}
            <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/cart"
                    className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
                  >
                    <ShoppingCartIcon className="h-6 w-6" />
                  </Link>
                  <div className="relative group">
                    <button className="flex items-center text-sm text-gray-500 hover:text-gray-700 focus:outline-none">
                      <UserIcon className="h-6 w-6" />
                      <span className="ml-2">{user.name}</span>
                    </button>
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <div className="py-1">
                        {userNavigation.map((item) => (
                          item.href ? (
                            <Link
                              key={item.name}
                              to={item.href}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              {item.name}
                            </Link>
                          ) : (
                            <button
                              key={item.name}
                              onClick={item.onClick}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              {item.name}
                            </button>
                          )
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex space-x-4">
                  <Link
                    to="/login"
                    className="text-gray-500 hover:text-gray-700 font-medium"
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/register"
                    className="bg-primary-500 text-white px-4 py-2 rounded-md font-medium hover:bg-primary-600"
                  >
                    Inscription
                  </Link>
                </div>
              )}
            </div>

            {/* Menu mobile */}
            <div className="sm:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-500 hover:text-gray-700 p-2"
              >
                {isMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Menu mobile */}
          {isMenuOpen && (
            <div className="sm:hidden">
              <div className="pt-2 pb-3 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      item.current
                        ? 'bg-primary-50 border-primary-500 text-primary-700'
                        : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                    } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              <div className="pt-4 pb-3 border-t border-gray-200">
                {isAuthenticated ? (
                  <div className="space-y-1">
                    <div className="px-4 py-2 text-base font-medium text-gray-800">
                      {user.name}
                    </div>
                    {userNavigation.map((item) => (
                      item.href ? (
                        <Link
                          key={item.name}
                          to={item.href}
                          className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {item.name}
                        </Link>
                      ) : (
                        <button
                          key={item.name}
                          onClick={() => {
                            item.onClick();
                            setIsMenuOpen(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                        >
                          {item.name}
                        </button>
                      )
                    ))}
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Link
                      to="/login"
                      className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Connexion
                    </Link>
                    <Link
                      to="/register"
                      className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Inscription
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Modal du profil */}
      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />
    </>
  );
};

export default Header;

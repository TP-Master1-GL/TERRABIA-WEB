import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logo1 from '../../assets/terrabia-logo.png';
import { useAuth } from '../../contexts/AuthContext';
import { 
  EyeIcon, 
  EyeSlashIcon,
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
  BuildingStorefrontIcon,
  TruckIcon
} from '@heroicons/react/24/outline';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData);
    
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.error || 'Email ou mot de passe incorrect');
    }
    
    setLoading(false);
  };

  const handleDemoLogin = (role) => {
    const demoAccounts = {
      farmer: { email: 'demo@agriculteur.com', password: 'demo123' },
      buyer: { email: 'demo@acheteur.com', password: 'demo123' },
      driver: { email: 'demo@livreur.com', password: 'demo123' }
    };
    
    setFormData(demoAccounts[role]);
  };

  const accountTypes = [
    {
      role: 'farmer',
      label: 'Agriculteur',
      icon: BuildingStorefrontIcon,
      color: 'green',
      description: 'Vendez vos produits'
    },
    {
      role: 'buyer',
      label: 'Acheteur',
      icon: UserIcon,
      color: 'blue',
      description: 'Achetez des produits frais'
    },
    {
      role: 'driver',
      label: 'Entreprise de livraison',
      icon: TruckIcon,
      color: 'orange',
      description: 'Livrez les commandes'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl"> <img
                                              src={logo1}
                                              alt="Terrabia Logo"
                                              className="h-50 w-auto mr-2"
                                            /></span>
          </div>
        </div>
        <h2 className="mt-8 text-center text-3xl font-bold bg-gradient-to-r from-gray-900 to-green-700 bg-clip-text text-transparent">
          Content de vous revoir
        </h2>
        <p className="mt-3 text-center text-sm text-gray-600">
          Connectez-vous à votre compte pour continuer
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-gray-100 sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Adresse email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <EnvelopeIcon className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="entrez votre email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <LockClosedIcon className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="entrez votre mot de passe"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                  Se souvenir de moi
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-green-600 hover:text-green-500 transition-colors">
                  Mot de passe oublié ?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 transition-all duration-200"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Connexion...
                </>
              ) : (
                'Se connecter'
              )}
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Nouveau membre ?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-green-600 hover:text-green-500 transition-colors"
                >
                  Créez un compte ici
                </Link>
              </p>
            </div>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">Comptes de démonstration</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3">
              {accountTypes.map((account) => {
                const IconComponent = account.icon;
                const colorClasses = {
                  green: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100',
                  blue: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
                  orange: 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100'
                };

                return (
                  <button
                    key={account.role}
                    onClick={() => handleDemoLogin(account.role)}
                    className={`w-full flex items-center justify-between p-4 border rounded-xl transition-all duration-200 transform hover:-translate-y-0.5 ${colorClasses[account.color]}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-white bg-opacity-50">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-sm">{account.label}</div>
                        <div className="text-xs opacity-75">{account.description}</div>
                      </div>
                    </div>
                    <div className="text-xs font-medium opacity-75">Cliquez pour remplir</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
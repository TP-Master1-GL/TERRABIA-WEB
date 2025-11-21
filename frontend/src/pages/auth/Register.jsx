import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo1 from '../../assets/terrabia-logo.png';
import { useAuth } from '../../contexts/AuthContext';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  UserIcon,
  BuildingStorefrontIcon,
  TruckIcon 
} from '@heroicons/react/24/outline';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'buyer',
    phone: '',
    location: '',
    acceptTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

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

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      setLoading(false);
      return;
    }

    if (!formData.acceptTerms) {
      setError('Veuillez accepter les conditions d\'utilisation');
      setLoading(false);
      return;
    }

    const { confirmPassword, acceptTerms, ...submitData } = formData;

    const result = await register(submitData);
    
    if (result.success) {
      if (result.user?.role === 'farmer') {
        navigate('/farmer/dashboard', { replace: true });
      } else if (result.user?.role === 'driver') {
        navigate('/driver/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } else {
      setError(result.error || 'Une erreur est survenue lors de l\'inscription');
    }
    
    setLoading(false);
  };

  const roleOptions = [
    {
      value: 'buyer',
      label: 'Acheteur',
      description: 'Achetez des produits frais directement des agriculteurs',
      icon: UserIcon,
      color: 'blue'
    },
    {
      value: 'farmer',
      label: 'Agriculteur',
      description: 'Vendez vos produits agricoles directement aux consommateurs',
      icon: BuildingStorefrontIcon,
      color: 'green'
    },
    {
      value: 'driver',
      label: 'Entreprise de livraison',
      description: 'Rejoignez notre réseau de livraison',
      icon: TruckIcon,
      color: 'orange'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      green: 'border-green-200 bg-green-50 text-green-700',
      blue: 'border-blue-200 bg-blue-50 text-blue-700',
      orange: 'border-orange-200 bg-orange-50 text-orange-700'
    };
    return colors[color] || colors.green;
  };

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
          Rejoignez notre communauté
        </h2>
        <p className="mt-3 text-center text-sm text-gray-600 max-w-sm mx-auto">
          Créez votre compte et commencez à bénéficier de produits frais directement de la ferme
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-gray-100 sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Nom complet *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="Votre nom complet"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Adresse email *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="email@exemple.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                  Téléphone *
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="+237 6 XX XX XX XX"
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2">
                  Localisation *
                </label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="Ville, Région"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                Type de compte *
              </label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {roleOptions.map((role) => {
                  const IconComponent = role.icon;
                  return (
                    <div
                      key={role.value}
                      className={`relative cursor-pointer border-2 rounded-xl p-4 transition-all duration-200 ${
                        formData.role === role.value
                          ? `${getColorClasses(role.color)} border-current ring-2 ring-current ring-opacity-20`
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                      onClick={() => setFormData({ ...formData, role: role.value })}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          formData.role === role.value 
                            ? 'bg-current bg-opacity-10' 
                            : 'bg-gray-100'
                        }`}>
                          <IconComponent className={`w-5 h-5 ${
                            formData.role === role.value 
                              ? 'text-current' 
                              : 'text-gray-400'
                          }`} />
                        </div>
                        <span className="text-sm font-medium">{role.label}</span>
                      </div>
                      <p className="mt-2 text-xs text-gray-500 leading-relaxed">
                        {role.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Mot de passe *
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 pr-12"
                    placeholder="Minimum 8 caractères"
                    minLength="8"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
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

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirmation *
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="Retapez votre mot de passe"
                />
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <input
                id="acceptTerms"
                name="acceptTerms"
                type="checkbox"
                required
                checked={formData.acceptTerms}
                onChange={handleChange}
                className="mt-1 w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="acceptTerms" className="text-sm text-gray-600">
                J'accepte les{' '}
                <a href="#" className="text-green-600 hover:text-green-500 font-medium">
                  conditions d'utilisation
                </a>{' '}
                et la{' '}
                <a href="#" className="text-green-600 hover:text-green-500 font-medium">
                  politique de confidentialité
                </a>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 transition-all duration-200"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Création du compte...
                </>
              ) : (
                'Créer mon compte'
              )}
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Déjà membre ?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-green-600 hover:text-green-500 transition-colors"
                >
                  Connectez-vous ici
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
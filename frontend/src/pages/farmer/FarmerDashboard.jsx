import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  PlusIcon,
  ChartBarIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

const FarmerDashboard = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalSales: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    averageRating: 0
  });

  useEffect(() => {
    fetchFarmerProducts();
  }, []);

  const fetchFarmerProducts = async () => {
    try {
      setLoading(true);
      // Simulation des données - À remplacer par votre API
      const mockProducts = [
        {
          id: 1,
          name: 'Tomates fraîches',
          category: 'Légumes',
          price: 1500,
          stockQuantity: 50,
          status: 'active',
          images: ['/api/placeholder/400/300'],
          rating: 4.5,
          sales: 23
        },
        {
          id: 2,
          name: 'Bananes plantains',
          category: 'Fruits',
          price: 800,
          stockQuantity: 25,
          status: 'active',
          images: ['/api/placeholder/400/300'],
          rating: 4.8,
          sales: 15
        }
      ];
      
      setProducts(mockProducts);
      
      // Calcul des statistiques
      setStats({
        totalProducts: mockProducts.length,
        activeProducts: mockProducts.filter(p => p.status === 'active').length,
        totalSales: mockProducts.reduce((sum, p) => sum + (p.sales || 0), 0),
        totalRevenue: mockProducts.reduce((sum, p) => sum + (p.price * (p.sales || 0)), 0),
        pendingOrders: 3,
        averageRating: 4.6
      });
    } catch (error) {
      console.error('Error fetching farmer products:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickStats = [
    {
      name: 'Produits en ligne',
      value: stats.activeProducts,
      icon: ShoppingBagIcon,
      color: 'green',
      change: '+2',
      changeType: 'positive'
    },
    {
      name: 'Commandes en attente',
      value: stats.pendingOrders,
      icon: UserGroupIcon,
      color: 'blue',
      change: '+1',
      changeType: 'positive'
    },
    {
      name: 'Revenus totaux',
      value: `${stats.totalRevenue.toLocaleString()} FCFA`,
      icon: CurrencyDollarIcon,
      color: 'emerald',
      change: '+15%',
      changeType: 'positive'
    },
    {
      name: 'Note moyenne',
      value: stats.averageRating,
      icon: ChartBarIcon,
      color: 'yellow',
      change: '+0.2',
      changeType: 'positive'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête personnalisé agriculteur */}
        <div className="mb-8 text-center animate-fade-in-down">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <span className="text-2xl text-white">👨‍🌾</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">
            Bonjour, <span className="gradient-text">{user?.name}</span>
          </h1>
          <p className="text-xl text-gray-600">
            Gérez votre boutique agricole et suivez vos performances
          </p>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {quickStats.map((stat, index) => (
            <div
              key={stat.name}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-all duration-300 animate-fade-in-up border border-white/20"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`p-3 rounded-2xl bg-${stat.color}-100`}>
                    <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                    <span className={`ml-2 text-sm font-medium ${
                      stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions rapides */}
        <div className="mb-8 animate-fade-in-up animation-delay-400">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Actions rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link
              to="/farmer/products/new"
              className="group bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl p-6 shadow-2xl transform hover:scale-105 transition-all duration-300 hover:shadow-3xl"
            >
              <div className="flex items-center">
                <PlusIcon className="h-8 w-8 mr-4 transform group-hover:rotate-90 transition-transform duration-300" />
                <div>
                  <h3 className="text-xl font-black">Ajouter un produit</h3>
                  <p className="text-green-100 mt-1">Publiez un nouveau produit</p>
                </div>
              </div>
            </Link>

            <Link
              to="/farmer/products"
              className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl"
            >
              <div className="flex items-center">
                <ShoppingBagIcon className="h-8 w-8 mr-4 text-gray-600 group-hover:text-green-600 transition-colors duration-300" />
                <div>
                  <h3 className="text-xl font-black text-gray-900">Mes produits</h3>
                  <p className="text-gray-600 mt-1">Gérer mon inventaire</p>
                </div>
              </div>
            </Link>

            <Link
              to="/farmer/analytics"
              className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl"
            >
              <div className="flex items-center">
                <ArrowTrendingUpIcon className="h-8 w-8 mr-4 text-gray-600 group-hover:text-green-600 transition-colors duration-300" />
                <div>
                  <h3 className="text-xl font-black text-gray-900">Analytiques</h3>
                  <p className="text-gray-600 mt-1">Voir mes performances</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Produits récents */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 animate-fade-in-up animation-delay-600">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-gray-900">Mes produits récents</h2>
            <Link
              to="/farmer/products"
              className="text-green-600 hover:text-green-700 font-semibold flex items-center"
            >
              Voir tout
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.slice(0, 3).map((product, index) => (
                <div
                  key={product.id}
                  className="bg-white rounded-xl shadow-lg border border-gray-100 transform hover:scale-105 transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${index * 200 + 800}ms` }}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-gray-900 line-clamp-2 flex-1">{product.name}</h3>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full ml-2">
                        {product.category}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-black text-green-600">
                        {product.price?.toLocaleString()} FCFA
                      </span>
                      <span className={`text-sm font-semibold ${
                        product.stockQuantity > 10 ? 'text-green-600' : 
                        product.stockQuantity > 0 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {product.stockQuantity} en stock
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center">
                        <span>⭐ {product.rating}</span>
                        <span className="mx-2">•</span>
                        <span>🛒 {product.sales} ventes</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.status === 'active' ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🌱</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun produit encore</h3>
              <p className="text-gray-500 mb-6">Commencez par ajouter votre premier produit</p>
              <Link
                to="/farmer/products/new"
                className="bg-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transform hover:scale-105 transition-all duration-300"
              >
                Ajouter mon premier produit
              </Link>
            </div>
          )}
        </div>

        {/* Conseils pour agriculteurs */}
        <div className="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200 animate-fade-in-up animation-delay-800">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <span className="text-2xl">💡</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-black text-gray-900 mb-2">Conseil du jour</h3>
              <p className="text-gray-700">
                Ajoutez des photos de qualité de vos produits ! Les produits avec de bonnes images 
                se vendent <span className="font-semibold text-green-600">40% plus vite</span> et à 
                des prix <span className="font-semibold text-green-600">15% plus élevés</span>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;
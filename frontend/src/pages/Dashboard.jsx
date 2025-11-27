import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { ordersAPI, analyticsAPI } from '../services/api';
import {
  ChartBarIcon,
  ShoppingBagIcon,
  TruckIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  StarIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'vendeur') {
      navigate('/farmer/dashboard');
    } else {
      fetchDashboardData();
    }
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Récupération des commandes récentes
      let ordersResponse;
      if (user?.role === 'entreprise_livraison') {
        ordersResponse = await ordersAPI.getAll({ limit: 3 });
      } else {
        ordersResponse = await ordersAPI.getBuyerOrders({ limit: 3 });
      }
      setRecentOrders(ordersResponse.data.results || ordersResponse.data || []);

      // Récupération des statistiques
      try {
        const analyticsResponse = await analyticsAPI.getDashboardStats();
        setStats(analyticsResponse.data || {});
      } catch (error) {
        console.warn('Analytics service not available, using default stats');
        setStats(getDefaultStats());
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setStats(getDefaultStats());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultStats = () => {
    if (user?.role === 'entreprise_livraison') {
      return {
        totalDeliveries: 45,
        activeDeliveries: 3,
        totalRevenue: 280000,
        satisfactionRate: 4.9
      };
    } else {
      return {
        totalOrders: 12,
        pendingOrders: 2,
        totalSpent: 125000,
        favoriteFarmers: 8
      };
    }
  };

  const buyerStats = [
    { 
      name: 'Commandes passées', 
      value: stats.totalOrders || '0', 
      icon: ShoppingBagIcon, 
      change: '+3', 
      changeType: 'positive',
      color: 'blue'
    },
    { 
      name: 'En cours', 
      value: stats.pendingOrders || '0', 
      icon: TruckIcon, 
      change: '-1', 
      changeType: 'negative',
      color: 'yellow'
    },
    { 
      name: 'Dépenses totales', 
      value: `${(stats.totalSpent || 0).toLocaleString()} FCFA`, 
      icon: CurrencyDollarIcon, 
      change: '+25%', 
      changeType: 'positive',
      color: 'emerald'
    },
    { 
      name: 'Agriculteurs suivis', 
      value: stats.favoriteFarmers || '0', 
      icon: UserGroupIcon, 
      change: '+2', 
      changeType: 'positive',
      color: 'purple'
    },
  ];

  const driverStats = [
    { 
      name: 'Livraisons ce mois', 
      value: stats.totalDeliveries || '0', 
      icon: TruckIcon, 
      change: '+8', 
      changeType: 'positive',
      color: 'green'
    },
    { 
      name: 'En cours', 
      value: stats.activeDeliveries || '0', 
      icon: ShoppingBagIcon, 
      change: '+1', 
      changeType: 'positive',
      color: 'blue'
    },
    { 
      name: 'Revenus totaux', 
      value: `${(stats.totalRevenue || 0).toLocaleString()} FCFA`, 
      icon: CurrencyDollarIcon, 
      change: '+15%', 
      changeType: 'positive',
      color: 'emerald'
    },
    { 
      name: 'Satisfaction', 
      value: `${stats.satisfactionRate || '0'}/5`, 
      icon: StarIcon, 
      change: '+0.1', 
      changeType: 'positive',
      color: 'yellow'
    },
  ];

  const getStats = () => {
    switch (user?.role) {
      case 'entreprise_livraison':
        return driverStats;
      default:
        return buyerStats;
    }
  };

  const getQuickActions = () => {
    switch (user?.role) {
      case 'entreprise_livraison':
        return [
          { 
            name: 'Nouvelles livraisons', 
            href: '/driver/deliveries', 
            icon: TruckIcon,
            description: 'Prendre en charge de nouvelles livraisons',
            color: 'green'
          },
          { 
            name: 'Mes performances', 
            href: '/driver/performance', 
            icon: ChartBarIcon,
            description: 'Voir mes statistiques de livraison',
            color: 'blue'
          },
          { 
            name: 'Mon planning', 
            href: '/driver/schedule', 
            icon: ChartBarIcon,
            description: 'Gérer mon emploi du temps',
            color: 'purple'
          },
        ];
      default:
        return [
          { 
            name: 'Parcourir le marché', 
            href: '/marketplace', 
            icon: ShoppingBagIcon,
            description: 'Découvrir de nouveaux produits frais',
            color: 'green'
          },
          { 
            name: 'Suivre mes commandes', 
            href: '/orders', 
            icon: TruckIcon,
            description: 'Voir le statut de mes commandes',
            color: 'blue'
          },
          { 
            name: 'Agriculteurs favoris', 
            href: '/favorites', 
            icon: HeartIcon,
            description: 'Retrouver mes producteurs préférés',
            color: 'pink'
          },
        ];
    }
  };

  const upcomingDeliveries = [
    { id: 1, client: 'Alice Martin', address: 'Douala, Bonamoussadi', time: '14:00', products: ['Tomates', 'Oignons'] },
    { id: 2, client: 'Paul Dubois', address: 'Yaoundé, Bastos', time: '16:30', products: ['Bananes', 'Manioc'] },
    { id: 3, client: 'Sophie Ngo', address: 'Douala, Akwa', time: '18:00', products: ['Légumes variés'] },
  ];

  const statsData = getStats();
  const quickActions = getQuickActions();

  const renderDriverDashboard = () => (
    <div className="space-y-8">
      {/* Livraisons à venir */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 animate-fade-in-up animation-delay-600">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-gray-900">Livraisons à venir aujourd'hui</h2>
          <Link
            to="/driver/deliveries"
            className="text-green-600 hover:text-green-700 font-semibold flex items-center"
          >
            Voir tout
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="space-y-4">
          {upcomingDeliveries.map((delivery, index) => (
            <div
              key={delivery.id}
              className="flex items-center justify-between p-4 bg-white rounded-xl shadow border border-gray-100 transform hover:scale-105 transition-all duration-300"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TruckIcon className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{delivery.client}</h3>
                  <p className="text-sm text-gray-500">{delivery.address}</p>
                  <p className="text-xs text-gray-400">
                    Produits: {delivery.products.join(', ')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                  🕒 {delivery.time}
                </span>
                <button className="mt-2 bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-600 transform hover:scale-105 transition-all duration-300">
                  Démarrer
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Conseils livreur */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-100 rounded-2xl p-6 border border-green-200 animate-fade-in-up animation-delay-800">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <span className="text-2xl">💡</span>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-black text-gray-900 mb-2">Conseil de livraison</h3>
            <p className="text-gray-700">
              Vérifiez toujours l'état des produits avant la livraison. Une communication 
              proactive avec les clients augmente la satisfaction de <span className="font-semibold text-green-600">25%</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBuyerDashboard = () => (
    <div className="space-y-8">
      {/* Commandes récentes */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 animate-fade-in-up animation-delay-600">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-gray-900">Commandes récentes</h2>
          <Link
            to="/orders"
            className="text-blue-600 hover:text-blue-700 font-semibold flex items-center"
          >
            Voir tout
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="space-y-4">
          {recentOrders.map((order, index) => (
            <div
              key={order.id}
              className="flex items-center justify-between p-4 bg-white rounded-xl shadow border border-gray-100 transform hover:scale-105 transition-all duration-300"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {order.product || `Commande #${order.id}`}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {order.farmer_name || order.farmer?.name || 'Agriculteur'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                  order.status === 'shipped' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {order.status === 'delivered' ? 'Livré' : 
                   order.status === 'shipped' ? 'Expédié' : 'En cours'}
                </span>
                <p className="text-lg font-black text-gray-900 mt-1">
                  {order.total_amount?.toLocaleString()} FCFA
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(order.created_at || order.createdAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommandations acheteur */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200 animate-fade-in-up animation-delay-800">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <span className="text-2xl">🌟</span>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-black text-gray-900 mb-2">Recommandation du jour</h3>
            <p className="text-gray-700">
              Découvrez les nouveaux agriculteurs de votre région ! Les produits locaux de saison 
              sont <span className="font-semibold text-purple-600">plus frais</span> et 
              <span className="font-semibold text-purple-600"> moins chers</span>.
            </p>
            <Link
              to="/marketplace"
              className="inline-block mt-3 bg-purple-500 text-white px-6 py-2 rounded-xl font-semibold hover:bg-purple-600 transform hover:scale-105 transition-all duration-300"
            >
              Explorer le marché
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            {/* En-tête */}
            <div className="flex items-center justify-center mb-8">
              <div className="w-16 h-16 bg-gray-200 rounded-2xl"></div>
            </div>
            
            {/* Statistiques */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête personnalisé */}
        <div className="mb-8 text-center animate-fade-in-down">
          <div className="flex items-center justify-center mb-4">
            <div className={`w-16 h-16 bg-gradient-to-r ${
              user?.role === 'entreprise_livraison' ? 'from-green-500 to-emerald-600' : 'from-blue-500 to-cyan-600'
            } rounded-2xl flex items-center justify-center shadow-2xl`}>
              <span className="text-2xl text-white">
                {user?.role === 'entreprise_livraison' ? '🚚' : '🛒'}
              </span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">
            Bonjour, <span className="gradient-text">{user?.name || user?.username}</span>
          </h1>
          <p className="text-xl text-gray-600">
            Bienvenue sur votre tableau de bord {user?.role === 'entreprise_livraison' ? 'livreur' : 'acheteur'}
          </p>
        </div>

        {/* Statistiques avec design amélioré */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {statsData.map((item, index) => (
            <div
              key={item.name}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-all duration-300 animate-fade-in-up border border-white/20"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`p-3 rounded-2xl ${
                    item.color === 'blue' ? 'bg-blue-100' :
                    item.color === 'green' ? 'bg-green-100' :
                    item.color === 'yellow' ? 'bg-yellow-100' :
                    item.color === 'emerald' ? 'bg-emerald-100' :
                    item.color === 'purple' ? 'bg-purple-100' : 'bg-gray-100'
                  }`}>
                    <item.icon className={`h-6 w-6 ${
                      item.color === 'blue' ? 'text-blue-600' :
                      item.color === 'green' ? 'text-green-600' :
                      item.color === 'yellow' ? 'text-yellow-600' :
                      item.color === 'emerald' ? 'text-emerald-600' :
                      item.color === 'purple' ? 'text-purple-600' : 'text-gray-600'
                    }`} />
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-500">{item.name}</p>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-black text-gray-900">{item.value}</p>
                    <span className={`ml-2 text-sm font-medium ${
                      item.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {item.change}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions rapides améliorées */}
        <div className="mb-8 animate-fade-in-up animation-delay-400">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Actions rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <Link
                key={action.name}
                to={action.href}
                className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl"
              >
                <div className="flex items-center">
                  <div className={`p-3 rounded-2xl ${
                    action.color === 'blue' ? 'bg-blue-100' :
                    action.color === 'green' ? 'bg-green-100' :
                    action.color === 'pink' ? 'bg-pink-100' :
                    action.color === 'purple' ? 'bg-purple-100' : 'bg-gray-100'
                  } mr-4 group-hover:scale-110 transition-transform duration-300`}>
                    <action.icon className={`h-6 w-6 ${
                      action.color === 'blue' ? 'text-blue-600' :
                      action.color === 'green' ? 'text-green-600' :
                      action.color === 'pink' ? 'text-pink-600' :
                      action.color === 'purple' ? 'text-purple-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 group-hover:text-gray-700 transition-colors duration-300">
                      {action.name}
                    </h3>
                    <p className="text-gray-600 mt-1 group-hover:text-gray-500 transition-colors duration-300">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Contenu spécifique au rôle */}
        {user?.role === 'entreprise_livraison' ? renderDriverDashboard() : renderBuyerDashboard()}
      </div>
    </div>
  );
};

export default Dashboard;
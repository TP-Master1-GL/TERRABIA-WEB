import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI, ordersAPI, analyticsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  PlusIcon,
  ChartBarIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

const FarmerDashboard = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalSales: 0,
    monthlyRevenue: 0,
    pendingOrders: 0,
    averageRating: 0,
    lowStockItems: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Récupération des produits de l'agriculteur
      const productsResponse = await productsAPI.getByFarmer(user.id);
      const farmerProducts = productsResponse.data || [];
      
      // Récupération des commandes récentes
      const ordersResponse = await ordersAPI.getFarmerOrders();
      const orders = ordersResponse.data || [];
      
      // Récupération des statistiques
      const analyticsResponse = await analyticsAPI.getFarmerAnalytics(user.id);
      const analytics = analyticsResponse.data || {};
      
      setProducts(farmerProducts.slice(0, 6));
      setRecentOrders(orders.slice(0, 5));
      
      // Calcul des statistiques
      const lowStockCount = farmerProducts.filter(p => p.stockQuantity < 10 && p.stockQuantity > 0).length;
      const activeProducts = farmerProducts.filter(p => p.status === 'active' && p.stockQuantity > 0);
      
      setStats({
        totalProducts: farmerProducts.length,
        activeProducts: activeProducts.length,
        totalSales: analytics.totalSales || farmerProducts.reduce((sum, p) => sum + (p.salesCount || 0), 0),
        monthlyRevenue: analytics.monthlyRevenue || farmerProducts.reduce((sum, p) => sum + (p.revenue || 0), 0),
        pendingOrders: orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length,
        averageRating: analytics.averageRating || 4.6,
        lowStockItems: lowStockCount
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Fallback avec des données mockées en cas d'erreur
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = () => {
    const mockProducts = [
      {
        id: 1,
        name: 'Tomates fraîches',
        category: 'Légumes',
        price: 1500,
        stockQuantity: 8,
        status: 'active',
        images: ['/api/placeholder/400/300'],
        rating: 4.5,
        salesCount: 23,
        revenue: 34500
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
        salesCount: 15,
        revenue: 12000
      },
      {
        id: 3,
        name: 'Aubergines locales',
        category: 'Légumes',
        price: 900,
        stockQuantity: 3,
        status: 'active',
        images: ['/api/placeholder/400/300'],
        rating: 4.6,
        salesCount: 12,
        revenue: 10800
      }
    ];

    const mockOrders = [
      {
        id: 'CMD-001',
        customerName: 'Alice Martin',
        totalAmount: 4500,
        status: 'pending',
        itemsCount: 3,
        createdAt: new Date().toISOString()
      },
      {
        id: 'CMD-002',
        customerName: 'Paul Dubois',
        totalAmount: 3200,
        status: 'confirmed',
        itemsCount: 2,
        createdAt: new Date(Date.now() - 86400000).toISOString()
      }
    ];

    setProducts(mockProducts);
    setRecentOrders(mockOrders);
    
    setStats({
      totalProducts: mockProducts.length,
      activeProducts: mockProducts.filter(p => p.status === 'active').length,
      totalSales: 50,
      monthlyRevenue: 57300,
      pendingOrders: 2,
      averageRating: 4.6,
      lowStockItems: 2
    });
  };

  const quickStats = [
    {
      name: 'Produits actifs',
      value: stats.activeProducts,
      total: stats.totalProducts,
      icon: ShoppingBagIcon,
      color: 'green',
      description: 'Produits en ligne',
      trend: '+2 ce mois'
    },
    {
      name: 'Commandes en attente',
      value: stats.pendingOrders,
      icon: ClockIcon,
      color: 'blue',
      description: 'À traiter',
      trend: 'À traiter rapidement'
    },
    {
      name: 'Revenus du mois',
      value: `${stats.monthlyRevenue.toLocaleString()} FCFA`,
      icon: CurrencyDollarIcon,
      color: 'emerald',
      description: 'Chiffre d\'affaires',
      trend: '+15% vs mois dernier'
    },
    {
      name: 'Stock faible',
      value: stats.lowStockItems,
      icon: ExclamationTriangleIcon,
      color: 'orange',
      description: 'Produits à réapprovisionner',
      trend: 'Attention nécessaire'
    }
  ];

  const performanceMetrics = [
    {
      label: 'Taux de conversion',
      value: '12.5%',
      change: '+2.1%',
      positive: true
    },
    {
      label: 'Panier moyen',
      value: '4,200 FCFA',
      change: '+350 FCFA',
      positive: true
    },
    {
      label: 'Taux de satisfaction',
      value: '96%',
      change: '+3%',
      positive: true
    }
  ];

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      shipped: 'bg-purple-100 text-purple-800 border-purple-200',
      delivered: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'En attente',
      confirmed: 'Confirmée',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée'
    };
    return texts[status] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            {/* En-tête */}
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-2xl"></div>
              <div>
                <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-64"></div>
              </div>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>

            {/* Grille de contenu */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-100 rounded-lg mb-4"></div>
                ))}
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded-lg mb-3"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête professionnel */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl text-white">👨‍🌾</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Tableau de bord, {user?.name}
                </h1>
                <p className="text-gray-600 mt-1">
                  Aperçu de votre activité et performances commerciales
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Statut de la boutique</p>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {quickStats.map((stat, index) => (
            <div
              key={stat.name}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-${stat.color}-50`}>
                  <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
                {stat.total && (
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {stat.value}/{stat.total}
                  </span>
                )}
              </div>
              
              <div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-sm font-medium text-gray-600 mb-2">{stat.name}</p>
                <p className="text-xs text-gray-500 flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-2 ${
                    stat.trend.includes('+') ? 'bg-green-500' : 
                    stat.trend.includes('Attention') ? 'bg-orange-500' : 'bg-blue-500'
                  }`}></span>
                  {stat.trend}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Métriques de performance */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Indicateurs de performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {performanceMetrics.map((metric, index) => (
              <div key={index} className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</div>
                <div className="text-sm text-gray-600 mb-2">{metric.label}</div>
                <div className={`text-xs font-medium ${
                  metric.positive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.change}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Produits récents */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Produits récents</h2>
              <Link
                to="/farmer/products"
                className="text-green-600 hover:text-green-700 font-medium text-sm"
              >
                Voir tout
              </Link>
            </div>

            <div className="space-y-4">
              {products.map((product) => (
                <div key={product.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <img
                    src={product.images?.[0] || '/api/placeholder/80/80'}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>{product.category}</span>
                      <span>•</span>
                      <span className={`font-medium ${
                        product.stockQuantity < 5 ? 'text-red-600' : 
                        product.stockQuantity < 10 ? 'text-orange-600' : 'text-green-600'
                      }`}>
                        {product.stockQuantity} en stock
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      {product.price?.toLocaleString()} FCFA
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <StarIcon className="h-3 w-3 text-yellow-400 fill-current mr-1" />
                      {product.rating}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {products.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ShoppingBagIcon className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun produit</h3>
                <p className="text-gray-600 mb-4">Commencez par ajouter vos premiers produits</p>
                <Link
                  to="/farmer/products/new"
                  className="inline-flex items-center bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Ajouter un produit
                </Link>
              </div>
            )}
          </div>

          {/* Commandes récentes */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Commandes récentes</h2>
              <Link
                to="/farmer/orders"
                className="text-green-600 hover:text-green-700 font-medium text-sm"
              >
                Voir tout
              </Link>
            </div>

            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-gray-900">{order.id}</div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{order.customerName}</span>
                    <span className="font-semibold text-gray-900">
                      {order.totalAmount?.toLocaleString()} FCFA
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              ))}
            </div>

            {recentOrders.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ClockIcon className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune commande</h3>
                <p className="text-gray-600">Aucune commande récente pour le moment</p>
              </div>
            )}
          </div>
        </div>

        {/* Actions rapides */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Actions rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/farmer/products/new"
              className="flex items-center p-4 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors group"
            >
              <PlusIcon className="h-6 w-6 mr-3" />
              <div>
                <div className="font-semibold">Nouveau produit</div>
                <div className="text-green-100 text-sm">Ajouter un produit</div>
              </div>
            </Link>
            
            <Link
              to="/farmer/analytics"
              className="flex items-center p-4 bg-white border border-gray-300 rounded-xl hover:border-green-300 transition-colors group"
            >
              <ChartBarIcon className="h-6 w-6 mr-3 text-gray-600" />
              <div>
                <div className="font-semibold text-gray-900">Analytiques</div>
                <div className="text-gray-600 text-sm">Voir les statistiques</div>
              </div>
            </Link>
            
            <Link
              to="/farmer/profile"
              className="flex items-center p-4 bg-white border border-gray-300 rounded-xl hover:border-green-300 transition-colors group"
            >
              <PencilIcon className="h-6 w-6 mr-3 text-gray-600" />
              <div>
                <div className="font-semibold text-gray-900">Profil</div>
                <div className="text-gray-600 text-sm">Modifier le profil</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;
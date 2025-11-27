import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ordersAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  ShoppingBagIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let response;
      
      if (user?.role === 'vendeur') {
        response = await ordersAPI.getFarmerOrders();
      } else {
        response = await ordersAPI.getBuyerOrders();
      }
      
      setOrders(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Fallback avec des données mockées
      setOrders(getMockOrders());
    } finally {
      setLoading(false);
    }
  };

  const getMockOrders = () => [
    {
      id: 1,
      status: 'delivered',
      total_amount: 4500,
      created_at: '2024-01-15T10:30:00Z',
      items: [
        {
          id: 1,
          name: 'Tomates fraîches',
          price: 1500,
          quantity: 2,
          image: '/api/placeholder/100/100',
          farmer_name: 'Jean Agriculteur'
        },
        {
          id: 2,
          name: 'Oignons',
          price: 750,
          quantity: 2,
          image: '/api/placeholder/100/100',
          farmer_name: 'Jean Agriculteur'
        }
      ]
    },
    {
      id: 2,
      status: 'shipped',
      total_amount: 2400,
      created_at: '2024-01-14T14:20:00Z',
      items: [
        {
          id: 3,
          name: 'Bananes plantains',
          price: 800,
          quantity: 3,
          image: '/api/placeholder/100/100',
          farmer_name: 'Marie Fermière'
        }
      ]
    }
  ];

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'shipped':
        return <TruckIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'pending': 'En attente',
      'confirmed': 'Confirmée',
      'shipped': 'Expédiée',
      'delivered': 'Livrée',
      'cancelled': 'Annulée'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'confirmed': 'bg-blue-100 text-blue-800 border-blue-200',
      'shipped': 'bg-purple-100 text-purple-800 border-purple-200',
      'delivered': 'bg-green-100 text-green-800 border-green-200',
      'cancelled': 'bg-red-100 text-red-800 border-red-200'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {user?.role === 'vendeur' ? 'Commandes de ma ferme' : 'Mes commandes'}
          </h1>
          <p className="text-gray-600">
            {user?.role === 'vendeur' 
              ? 'Suivez les commandes de vos produits' 
              : 'Suivez l\'état de vos commandes et vos achats précédents'
            }
          </p>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-wrap gap-2">
            {['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === status
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'Toutes' : getStatusText(status)}
              </button>
            ))}
          </div>
        </div>

        {/* Liste des commandes */}
        <div className="space-y-6">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ShoppingBagIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune commande</h3>
              <p className="text-gray-600 mb-6">
                {filter === 'all' 
                  ? "Vous n'avez pas encore de commande."
                  : `Aucune commande avec le statut "${getStatusText(filter)}".`
                }
              </p>
              {user?.role !== 'vendeur' && (
                <Link
                  to="/marketplace"
                  className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                >
                  Découvrir nos produits
                </Link>
              )}
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {/* En-tête de la commande */}
                <div className="border-b border-gray-200 p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(order.status)}
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Commande #{order.id}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm">
                          Passée le {new Date(order.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:mt-0">
                      <div className="text-lg font-bold text-gray-900">
                        {order.total_amount?.toLocaleString()} FCFA
                      </div>
                    </div>
                  </div>
                </div>

                {/* Articles de la commande */}
                <div className="p-6">
                  <div className="space-y-4">
                    {order.items?.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4">
                        <img
                          src={item.image || '/api/placeholder/100/100'}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-600">
                            {user?.role === 'vendeur' ? 'Acheteur: ' : 'Vendeur: '}
                            {item.farmer_name || order.customer_name || 'Non spécifié'}
                          </p>
                          <p className="text-sm text-gray-600">
                            Quantité: {item.quantity} • {item.price?.toLocaleString()} FCFA
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">
                            {((item.price || 0) * (item.quantity || 1)).toLocaleString()} FCFA
                          </div>
                          {order.status === 'delivered' && user?.role !== 'vendeur' && (
                            <button className="text-green-600 hover:text-green-700 text-sm font-medium mt-2">
                              Noter le produit
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t border-gray-200 p-6 bg-gray-50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <div className="text-sm text-gray-600">
                      {order.items?.length} article{order.items?.length > 1 ? 's' : ''}
                    </div>
                    <div className="flex space-x-3">
                      <Link
                        to={`/orders/${order.id}`}
                        className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                      >
                        Voir les détails
                      </Link>
                      {order.status === 'delivered' && user?.role !== 'vendeur' && (
                        <button className="bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors">
                          Commander à nouveau
                        </button>
                      )}
                      {user?.role === 'vendeur' && order.status === 'pending' && (
                        <button className="bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors">
                          Confirmer
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  MapPinIcon,
  CreditCardIcon,
  TruckIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('card');

  const cartItems = [
    {
      id: 1,
      name: 'Tomates fraîches',
      price: 1500,
      quantity: 2,
      image: '/api/placeholder/100/100',
      farmer: 'Jean Agriculteur'
    }
  ];

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 0; // Gratuit
  const total = subtotal + shipping;

  const handleSubmitOrder = async () => {
    // Implémentation de la commande
    setStep(4);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Finaliser la commande</h1>
          <p className="text-gray-600 mt-2">Completez votre achat en quelques étapes</p>
        </div>

        {/* Étapes */}
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between mb-8">
            {['Livraison', 'Paiement', 'Confirmation'].map((label, index) => (
              <div key={label} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step > index + 1 ? 'bg-green-500 text-white' :
                  step === index + 1 ? 'bg-green-500 text-white' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {step > index + 1 ? '✓' : index + 1}
                </div>
                <span className={`ml-2 font-medium ${
                  step >= index + 1 ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {label}
                </span>
                {index < 2 && (
                  <div className={`w-16 h-1 mx-4 ${
                    step > index + 1 ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Formulaire */}
            <div className="lg:col-span-2 space-y-6">
              {step === 1 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Adresse de livraison</h2>
                  <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Prénom
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
                          defaultValue={user?.name?.split(' ')[0]}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nom
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
                          defaultValue={user?.name?.split(' ')[1]}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Adresse
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
                        placeholder="Rue, avenue..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ville
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Téléphone
                        </label>
                        <input
                          type="tel"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
                          defaultValue={user?.phone}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="w-full bg-green-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                    >
                      Continuer vers le paiement
                    </button>
                  </form>
                </div>
              )}

              {step === 2 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Méthode de paiement</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-300 rounded-lg">
                      <div className="flex items-center">
                        <CreditCardIcon className="h-6 w-6 text-gray-400 mr-3" />
                        <div>
                          <div className="font-medium text-gray-900">Carte bancaire</div>
                          <div className="text-sm text-gray-500">Paiement sécurisé</div>
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                        className="text-green-500"
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 border border-gray-300 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center mr-3">
                          <span className="text-white text-sm">M</span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Mobile Money</div>
                          <div className="text-sm text-gray-500">Orange Money, MTN Mobile Money</div>
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'mobile'}
                        onChange={() => setPaymentMethod('mobile')}
                        className="text-green-500"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleSubmitOrder}
                    className="w-full bg-green-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-600 transition-colors mt-6"
                  >
                    Payer {total.toLocaleString()} FCFA
                  </button>
                </div>
              )}

              {step === 3 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl text-green-600">✓</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Commande confirmée !</h2>
                  <p className="text-gray-600 mb-6">
                    Votre commande a été passée avec succès. Vous recevrez un email de confirmation.
                  </p>
                  <div className="flex space-x-4 justify-center">
                    <Link
                      to="/orders"
                      className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                    >
                      Voir mes commandes
                    </Link>
                    <Link
                      to="/marketplace"
                      className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                    >
                      Continuer les achats
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Récapitulatif */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Votre commande</h3>
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.farmer}</div>
                        <div className="text-sm text-gray-600">
                          {item.quantity} x {item.price.toLocaleString()} FCFA
                        </div>
                      </div>
                      <div className="font-semibold text-gray-900">
                        {(item.price * item.quantity).toLocaleString()} FCFA
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 mt-4 pt-4 space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Sous-total</span>
                    <span>{subtotal.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Livraison</span>
                    <span className="text-green-600">Gratuite</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold text-gray-900 pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span>{total.toLocaleString()} FCFA</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
                <div className="flex items-center text-green-800">
                  <LockClosedIcon className="h-5 w-5 mr-2" />
                  <span className="font-medium">Paiement sécurisé</span>
                </div>
                <p className="text-green-700 text-sm mt-2">
                  Vos informations de paiement sont cryptées et sécurisées.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  StarIcon,
  MapPinIcon,
  ShieldCheckIcon,
  TruckIcon,
  ShoppingCartIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isInWishlist, setIsInWishlist] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getById(id);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
      // Fallback avec des données mockées
      setProduct(getMockProduct());
    } finally {
      setLoading(false);
    }
  };

  const getMockProduct = () => ({
    id: parseInt(id),
    name: 'Tomates fraîches',
    description: 'Tomates rouges et juteuses cultivées localement avec des méthodes respectueuses de l\'environnement. Récoltées quotidiennement pour garantir une fraîcheur optimale.',
    price: 1500,
    category: 'Légumes',
    unit: 'kg',
    stock_quantity: 50,
    farmer_name: 'Jean Agriculteur',
    farmer_location: 'Yaoundé, Cameroun',
    farmer_id: 1,
    rating: 4.5,
    review_count: 23,
    images: ['/api/placeholder/600/600', '/api/placeholder/600/600', '/api/placeholder/600/600'],
    cultivation_method: 'biologique',
    is_organic: true,
    harvest_date: '2024-01-10',
    created_at: '2024-01-01T10:00:00Z'
  });

  const handleAddToCart = () => {
    // Logique d'ajout au panier
    console.log('Added to cart:', { product, quantity });
    // Ici vous intégrerez votre logique de panier
  };

  const handleBuyNow = () => {
    // Logique d'achat immédiat
    console.log('Buy now:', { product, quantity });
    // Ici vous intégrerez votre logique de commande rapide
  };

  const toggleWishlist = () => {
    setIsInWishlist(!isInWishlist);
    // Ici vous intégrerez votre logique de wishlist
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded-2xl"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Produit non trouvé</h2>
          <p className="text-gray-600 mb-4">Le produit que vous recherchez n'existe pas ou a été supprimé.</p>
          <Link
            to="/marketplace"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            Retour au marché
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Images du produit */}
            <div>
              <div className="aspect-w-1 aspect-h-1 bg-gray-200 rounded-2xl overflow-hidden mb-4">
                <img
                  src={product.images?.[selectedImage] || '/api/placeholder/600/600'}
                  alt={product.name}
                  className="w-full h-96 object-cover"
                />
              </div>
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-w-1 aspect-h-1 bg-gray-200 rounded-xl overflow-hidden transition-all duration-200 ${
                        selectedImage === index ? 'ring-2 ring-green-500 ring-offset-2' : 'hover:opacity-80'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-20 object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Informations du produit */}
            <div className="flex flex-col">
              <div className="flex-1">
                <div className="mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    {product.category}
                  </span>
                  {product.is_organic && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800 ml-2">
                      🌱 Biologique
                    </span>
                  )}
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {product.name}
                </h1>

                <div className="flex items-center mb-4">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon
                        key={star}
                        className={`h-5 w-5 ${
                          star <= (product.rating || 0)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">
                    {product.rating || 'N/A'} ({product.review_count || 0} avis)
                  </span>
                </div>

                <p className="text-gray-600 mb-6 leading-relaxed">
                  {product.description}
                </p>

                <div className="mb-6">
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    <span>Localisation: {product.farmer_location}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span>Vendu par: </span>
                    <Link
                      to={`/farmer/${product.farmer_id}`}
                      className="ml-1 text-green-600 hover:text-green-500 font-medium"
                    >
                      {product.farmer_name}
                    </Link>
                  </div>
                  {product.cultivation_method && (
                    <div className="text-sm text-gray-500 mt-1">
                      Méthode de culture: {product.cultivation_method}
                    </div>
                  )}
                  {product.harvest_date && (
                    <div className="text-sm text-gray-500 mt-1">
                      Récolté le: {new Date(product.harvest_date).toLocaleDateString('fr-FR')}
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {product.price?.toLocaleString()} FCFA
                    <span className="text-sm text-gray-500 font-normal ml-2">
                      / {product.unit}
                    </span>
                  </div>
                  
                  {product.stock_quantity > 0 ? (
                    <div className="flex items-center text-sm text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      En stock ({product.stock_quantity} {product.unit})
                    </div>
                  ) : (
                    <div className="flex items-center text-sm text-red-600">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                      Rupture de stock
                    </div>
                  )}
                </div>

                {/* Sélection de quantité */}
                <div className="mb-6">
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                    Quantité
                  </label>
                  <div className="flex items-center">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 border border-gray-300 rounded-l-lg bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      id="quantity"
                      min="1"
                      max={product.stock_quantity}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 py-2 text-center border-t border-b border-gray-300 focus:outline-none focus:ring-1 focus:ring-green-500"
                    />
                    <button
                      onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                      className="px-4 py-2 border border-gray-300 rounded-r-lg bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors"
                    >
                      +
                    </button>
                    <span className="ml-2 text-sm text-gray-500">
                      {product.unit}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-4 mb-6">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock_quantity === 0}
                    className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    <ShoppingCartIcon className="h-5 w-5 mr-2" />
                    Ajouter au panier
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={product.stock_quantity === 0}
                    className="flex-1 bg-orange-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Acheter maintenant
                  </button>
                  <button
                    onClick={toggleWishlist}
                    className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <HeartIcon className={`h-6 w-6 ${isInWishlist ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
                  </button>
                </div>
              </div>

              {/* Garanties */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <TruckIcon className="h-5 w-5 mr-2 text-green-500" />
                    Livraison gratuite à partir de 50,000 FCFA
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <ShieldCheckIcon className="h-5 w-5 mr-2 text-blue-500" />
                    Paiement sécurisé
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="w-5 h-5 mr-2">🔄</span>
                    Retour facile sous 7 jours
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section recommandations (à implémenter) */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Produits similaires</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Ici vous pouvez ajouter des produits recommandés */}
            <div className="text-center py-8 text-gray-500">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌱</span>
              </div>
              <p>D'autres produits vous seront bientôt recommandés</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
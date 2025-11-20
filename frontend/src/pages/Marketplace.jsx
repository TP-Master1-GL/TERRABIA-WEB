import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI } from '../services/api';
import { 
  MagnifyingGlassIcon,
  MapPinIcon,
  StarIcon,
  FunnelIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { CardLoader } from '../components/common/LoadingSpinner';

const Marketplace = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const categories = [
    'Fruits',
    'Légumes',
    'Céréales',
    'Tubercules',
    'Épicerie',
    'Boissons'
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getAll();
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products
    .filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(product => 
      selectedCategory ? product.category === selectedCategory : true
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        default:
          return a.name.localeCompare(b.name);
      }
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8 animate-pulse"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <CardLoader key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête animé */}
        <div className="mb-8 text-center animate-fade-in-down">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            Marché <span className="gradient-text">Agricole</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Découvrez des produits <span className="font-semibold text-green-600">frais</span> directement des agriculteurs camerounais
          </p>
        </div>

        {/* Filtres et recherche améliorés */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-6 mb-8 border border-gray-100 animate-fade-in-up">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Barre de recherche avec effet */}
            <div className="flex-1 w-full">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 group-hover:text-green-500 transition-colors duration-300" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher des produits... 🍅🥑🌽"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl leading-5 bg-white/50 backdrop-blur-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 hover:border-green-300"
                />
              </div>
            </div>

            {/* Bouton filtre mobile */}
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="lg:hidden px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5" />
              Filtres
            </button>

            {/* Filtres desktop */}
            <div className={`lg:flex gap-4 ${isFilterOpen ? 'flex flex-col' : 'hidden lg:flex lg:flex-row'}`}>
              {/* Filtre par catégorie */}
              <div className="relative group">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-3 border border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 hover:border-green-300 cursor-pointer min-w-[180px]"
                >
                  <option value="">📦 Toutes les catégories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'Fruits' && '🍎 '}
                      {category === 'Légumes' && '🥦 '}
                      {category === 'Céréales' && '🌾 '}
                      {category === 'Tubercules' && '🥔 '}
                      {category === 'Épicerie' && '🫙 '}
                      {category === 'Boissons' && '🥤 '}
                      {category}
                    </option>
                  ))}
                </select>
                <FunnelIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Tri */}
              <div className="relative group">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-3 border border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 hover:border-green-300 cursor-pointer min-w-[180px]"
                >
                  <option value="name">🔤 Nom</option>
                  <option value="price-low">💰 Prix croissant</option>
                  <option value="price-high">💸 Prix décroissant</option>
                  <option value="rating">⭐ Meilleures notes</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none">
                  ⬇️
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compteur de résultats */}
        {filteredProducts.length > 0 && (
          <div className="mb-6 animate-fade-in-up animation-delay-200">
            <p className="text-gray-600">
              <span className="font-semibold text-green-600">{filteredProducts.length}</span> produit{filteredProducts.length > 1 ? 's' : ''} trouvé{filteredProducts.length > 1 ? 's' : ''}
            </p>
          </div>
        )}

        {/* Grille de produits avec animations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product, index) => (
            <div
              key={product.id}
              className="group relative animate-fade-in-up bg-white rounded-2xl shadow-lg hover:shadow-2xl transform transition-all duration-500 hover:scale-105 overflow-hidden border border-gray-100"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Badge de catégorie flottant */}
              <div className="absolute top-4 left-4 z-10">
                <span className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                  {product.category}
                </span>
              </div>

              {/* Badge de promotion (exemple) */}
              {product.price > 1000 && (
                <div className="absolute top-4 right-4 z-10">
                  <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold shadow-lg pulse-glow">
                    🔥 Populaire
                  </span>
                </div>
              )}

              <Link to={`/product/${product.id}`} className="block">
                {/* Image avec effet de zoom */}
                <div className="relative overflow-hidden bg-gray-200 rounded-t-2xl">
                  {product.images && product.images[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-48 object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center group-hover:from-green-200 group-hover:to-green-300 transition-all duration-500">
                      <span className="text-4xl transform group-hover:scale-110 transition-transform duration-300">🌱</span>
                    </div>
                  )}
                  
                  {/* Overlay au survol */}
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                </div>
                
                {/* Contenu du produit */}
                <div className="p-5 relative">
                  {/* Effet de shine */}
                  <div className="shine-effect"></div>

                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-gray-900 line-clamp-2 flex-1 text-lg group-hover:text-green-700 transition-colors duration-300">
                      {product.name}
                    </h3>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 group-hover:text-gray-700 transition-colors duration-300 leading-relaxed">
                    {product.description}
                  </p>

                  {/* Localisation */}
                  <div className="flex items-center text-sm text-gray-500 mb-3 group-hover:text-gray-600 transition-colors duration-300">
                    <MapPinIcon className="h-4 w-4 mr-2 text-green-500" />
                    <span className="truncate">{product.farmerLocation}</span>
                  </div>

                  {/* Note et vendeur */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-full">
                        <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="ml-1 text-sm font-semibold text-gray-700">
                          {product.rating || '4.5'}
                        </span>
                      </div>
                      <span className="mx-2 text-gray-300">•</span>
                      <span className="text-sm text-gray-500 truncate max-w-[80px]">
                        {product.farmerName}
                      </span>
                    </div>
                  </div>

                  {/* Prix et action */}
                  <div className="flex items-center justify-between">
                    <div className="text-right flex-shrink-0">
                      <div className="text-xl font-black text-green-600 group-hover:text-green-700 transition-colors duration-300">
                        {product.price?.toLocaleString()} FCFA
                      </div>
                      <div className="text-xs text-gray-500">
                        par {product.unit}
                      </div>
                    </div>
                  </div>

                  {/* Stock et bouton d'action */}
                  {product.stockQuantity > 0 ? (
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                        ✅ En stock ({product.stockQuantity})
                      </span>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          console.log('Ajouter au panier:', product);
                        }}
                        className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 group/btn"
                      >
                        <span>🛒</span>
                        Ajouter
                      </button>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <span className="text-sm font-semibold text-red-600 bg-red-50 px-3 py-2 rounded-full w-full text-center block">
                        ❌ Rupture de stock
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* État vide avec animation */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-16 animate-fade-in-up">
            <div className="text-8xl mb-6 floating">🌾</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Aucun produit trouvé
            </h3>
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
              Essayez de modifier vos critères de recherche ou explorez d'autres catégories
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setSortBy('name');
              }}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              🔄 Réinitialiser les filtres
            </button>
          </div>
        )}

        {/* Bouton de retour en haut */}
        {filteredProducts.length > 8 && (
          <div className="text-center mt-12 animate-fade-in-up">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="bg-white text-green-600 px-6 py-3 rounded-xl font-semibold hover:bg-green-50 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl border border-green-200 flex items-center gap-2 mx-auto"
            >
              ⬆️ Retour en haut
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
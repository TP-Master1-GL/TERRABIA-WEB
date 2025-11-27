import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI, categoriesAPI } from '../services/api';
import { 
  MagnifyingGlassIcon,
  MapPinIcon,
  StarIcon,
  FunnelIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  ShoppingCartIcon,
  HeartIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const Marketplace = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [wishlist, setWishlist] = useState(new Set());

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getAll();
      setProducts(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      // Fallback avec des données mockées
      setProducts(getMockProducts());
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories(getMockCategories());
    }
  };

  const getMockProducts = () => [
    {
      id: 1,
      name: 'Tomates fraîches',
      description: 'Tomates rouges et juteuses cultivées localement',
      price: 1500,
      category: 'Légumes',
      unit: 'kg',
      stock_quantity: 50,
      farmer_name: 'Jean Agriculteur',
      farmer_location: 'Yaoundé',
      rating: 4.5,
      review_count: 23,
      images: ['/api/placeholder/400/300'],
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      name: 'Bananes plantains',
      description: 'Bananes plantains mûres et savoureuses',
      price: 800,
      category: 'Fruits',
      unit: 'régime',
      stock_quantity: 25,
      farmer_name: 'Marie Fermière',
      farmer_location: 'Douala',
      rating: 4.8,
      review_count: 15,
      images: ['/api/placeholder/400/300'],
      created_at: new Date().toISOString(),
    }
  ];

  const getMockCategories = () => [
    { id: 1, name: 'Fruits', product_count: 24 },
    { id: 2, name: 'Légumes', product_count: 18 },
    { id: 3, name: 'Céréales', product_count: 12 },
    { id: 4, name: 'Tubercules', product_count: 8 },
    { id: 5, name: 'Épicerie', product_count: 15 },
    { id: 6, name: 'Boissons', product_count: 6 }
  ];

  const toggleWishlist = (productId) => {
    const newWishlist = new Set(wishlist);
    if (newWishlist.has(productId)) {
      newWishlist.delete(productId);
    } else {
      newWishlist.add(productId);
    }
    setWishlist(newWishlist);
  };

  const filteredProducts = products
    .filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.farmer_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(product => 
      selectedCategory ? product.category === selectedCategory : true
    )
    .filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'newest':
          return new Date(b.created_at) - new Date(a.created_at);
        default:
          return a.name.localeCompare(b.name);
      }
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8 animate-pulse"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-48 rounded-2xl mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
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
        {/* En-tête professionnel */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg mb-6">
            <span className="text-3xl text-white">🛒</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Marché Agricole
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Découvrez des produits frais et locaux directement de nos agriculteurs partenaires. 
            Qualité garantie, livraison assurée.
          </p>
        </div>

        {/* Filtres et recherche avancés */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
            {/* Barre de recherche principale */}
            <div className="flex-1 w-full">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher des produits, agriculteurs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 placeholder-gray-500"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Contrôles de filtre */}
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              {/* Bouton filtre mobile */}
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="lg:hidden px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2 font-medium"
              >
                <AdjustmentsHorizontalIcon className="h-5 w-5" />
                Filtres
                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  {selectedCategory ? 1 : 0}
                </span>
              </button>

              {/* Filtres desktop */}
              <div className={`${isFilterOpen ? 'flex flex-col space-y-4' : 'hidden lg:flex lg:flex-row lg:space-y-0 lg:space-x-4'}`}>
                {/* Catégories */}
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="appearance-none pl-4 pr-10 py-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 cursor-pointer min-w-[200px] font-medium"
                  >
                    <option value="">Toutes les catégories</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.name}>
                        {category.name} ({category.product_count || 0})
                      </option>
                    ))}
                  </select>
                  <FunnelIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Tri */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none pl-4 pr-10 py-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 cursor-pointer min-w-[180px] font-medium"
                  >
                    <option value="name">Trier par: Nom</option>
                    <option value="price-low">Prix: Croissant</option>
                    <option value="price-high">Prix: Décroissant</option>
                    <option value="rating">Meilleures notes</option>
                    <option value="newest">Plus récents</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Filtres avancés (prix) */}
          {isFilterOpen && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Fourchette de prix
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
                    />
                    <span className="text-gray-400">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-500">FCFA</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation par catégories */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                selectedCategory === '' 
                  ? 'bg-green-500 text-white shadow-md' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-green-300'
              }`}
            >
              Tous les produits
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.name)}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                  selectedCategory === category.name
                    ? 'bg-green-500 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-green-300'
                }`}
              >
                <span>{
                  category.name === 'Fruits' ? '🍎' :
                  category.name === 'Légumes' ? '🥦' :
                  category.name === 'Céréales' ? '🌾' :
                  category.name === 'Tubercules' ? '🥔' :
                  category.name === 'Épicerie' ? '🫙' : '🥤'
                }</span>
                {category.name}
                <span className="text-xs opacity-75">({category.product_count || 0})</span>
              </button>
            ))}
          </div>
        </div>

        {/* En-tête des résultats */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              {selectedCategory || 'Tous les produits'}
            </h2>
            <p className="text-gray-600 mt-1">
              {filteredProducts.length} produit{filteredProducts.length !== 1 ? 's' : ''} disponible{filteredProducts.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="text-sm text-gray-500">
            Tri: {
              sortBy === 'name' ? 'Nom' :
              sortBy === 'price-low' ? 'Prix croissant' :
              sortBy === 'price-high' ? 'Prix décroissant' :
              sortBy === 'rating' ? 'Meilleures notes' : 'Plus récents'
            }
          </div>
        </div>

        {/* Grille de produits professionnelle */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {filteredProducts.map((product, index) => (
            <div
              key={product.id}
              className="group bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md hover:border-green-300 transition-all duration-300 overflow-hidden"
            >
              {/* En-tête de la carte avec image */}
              <div className="relative overflow-hidden">
                <Link to={`/product/${product.id}`}>
                  {product.images && product.images[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
                      <span className="text-4xl text-green-300">🌱</span>
                    </div>
                  )}
                </Link>

                {/* Actions rapides */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className={`p-2 rounded-full shadow-lg backdrop-blur-sm transition-all duration-200 ${
                      wishlist.has(product.id)
                        ? 'bg-red-500 text-white'
                        : 'bg-white/90 text-gray-700 hover:bg-white'
                    }`}
                  >
                    <HeartIcon className={`h-4 w-4 ${wishlist.has(product.id) ? 'fill-current' : ''}`} />
                  </button>
                  <Link 
                    to={`/product/${product.id}`}
                    className="p-2 rounded-full bg-white/90 text-gray-700 shadow-lg backdrop-blur-sm hover:bg-white transition-colors duration-200"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </Link>
                </div>

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium backdrop-blur-sm">
                    {product.category}
                  </span>
                  {product.stock_quantity < 10 && product.stock_quantity > 0 && (
                    <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium backdrop-blur-sm">
                      Stock limité
                    </span>
                  )}
                </div>
              </div>

              {/* Contenu de la carte */}
              <div className="p-5">
                <Link to={`/product/${product.id}`}>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors duration-200 leading-tight">
                    {product.name}
                  </h3>
                </Link>

                <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">
                  {product.description}
                </p>

                {/* Informations du vendeur */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPinIcon className="h-4 w-4 mr-1 text-green-500" />
                    <span className="truncate max-w-[120px]">{product.farmer_location}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <StarIcon className="h-4 w-4 mr-1 text-yellow-400" />
                    <span className="font-medium">{product.rating || '4.5'}</span>
                  </div>
                </div>

                {/* Prix et action */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xl font-bold text-green-600">
                      {product.price?.toLocaleString()} FCFA
                    </div>
                    <div className="text-xs text-gray-500">
                      par {product.unit || 'kg'}
                    </div>
                  </div>

                  {product.stock_quantity > 0 ? (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        // Ajouter au panier
                        console.log('Added to cart:', product);
                      }}
                      className="bg-green-500 text-white p-2 rounded-xl hover:bg-green-600 transition-colors duration-200 shadow-sm hover:shadow-md"
                    >
                      <ShoppingCartIcon className="h-5 w-5" />
                    </button>
                  ) : (
                    <span className="text-sm font-medium text-red-500 bg-red-50 px-3 py-2 rounded-lg">
                      Rupture
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* État vide */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">🔍</span>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Aucun produit trouvé
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
              Aucun produit ne correspond à vos critères de recherche. 
              Essayez de modifier vos filtres ou votre recherche.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                  setPriceRange([0, 100000]);
                }}
                className="bg-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors duration-200"
              >
                Réinitialiser les filtres
              </button>
              <Link
                to="/marketplace"
                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors duration-200"
              >
                Voir tous les produits
              </Link>
            </div>
          </div>
        )}

        {/* Pagination (exemple) */}
        {filteredProducts.length > 0 && (
          <div className="flex justify-center items-center space-x-2">
            <button className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors">
              ← Précédent
            </button>
            <button className="px-4 py-2 bg-green-500 text-white rounded-lg">1</button>
            <button className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors">2</button>
            <button className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors">3</button>
            <button className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors">
              Suivant →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
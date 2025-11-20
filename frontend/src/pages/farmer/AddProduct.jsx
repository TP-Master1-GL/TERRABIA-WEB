import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsAPI } from '../../services/api';
import { 
  PhotoIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ScaleIcon
} from '@heroicons/react/24/outline';

const AddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    unit: 'kg',
    stockQuantity: '',
    conditionsConservation: '',
    harvestDate: '',
    cultivationMethod: 'conventionnelle',
    isOrganic: false,
    images: []
  });

  const categories = [
    'Fruits',
    'Légumes', 
    'Céréales',
    'Tubercules',
    'Épicerie',
    'Boissons',
    'Produits Laitiers',
    'Viandes',
    'Poissons',
    'Œufs',
    'Miels',
    'Épices'
  ];

  const units = [
    'kg', 'g', 'L', 'mL', 'pièce', 'régime', 'bot', 'sachet', 'carton'
  ];

  const cultivationMethods = [
    'conventionnelle',
    'biologique',
    'raisonnée',
    'permaculture',
    'agroécologie'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    // Simulation d'upload - À remplacer par votre logique d'upload
    const imageUrls = files.map(file => URL.createObjectURL(file));
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...imageUrls]
    }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulation de création - À remplacer par votre API
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Produit créé:', formData);
      
      // Redirection vers le dashboard
      navigate('/farmer/dashboard');
    } catch (error) {
      console.error('Error creating product:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="text-center mb-8 animate-fade-in-down">
          <h1 className="text-4xl font-black text-gray-900 mb-4">
            Ajouter un <span className="gradient-text">nouveau produit</span>
          </h1>
          <p className="text-xl text-gray-600">
            Remplissez les informations de votre produit agricole
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informations de base */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 animate-fade-in-up">
            <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center">
              <PhotoIcon className="h-6 w-6 mr-3 text-green-600" />
              Informations du produit
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nom du produit */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nom du produit *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                  placeholder="Ex: Tomates fraîches bio"
                />
              </div>

              {/* Catégorie */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Catégorie *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                >
                  <option value="">Sélectionnez une catégorie</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description détaillée *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                  placeholder="Décrivez votre produit en détail (qualité, fraîcheur, particularités...)"
                />
              </div>
            </div>
          </div>

          {/* Prix et stock */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 animate-fade-in-up animation-delay-200">
            <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center">
              <CurrencyDollarIcon className="h-6 w-6 mr-3 text-green-600" />
              Prix et disponibilité
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Prix */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Prix (FCFA) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                    placeholder="1500"
                  />
                </div>
              </div>

              {/* Unité */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Unité de vente *
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                >
                  {units.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>

              {/* Stock */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quantité en stock *
                </label>
                <input
                  type="number"
                  name="stockQuantity"
                  value={formData.stockQuantity}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                  placeholder="50"
                />
              </div>
            </div>
          </div>

          {/* Informations agricoles */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 animate-fade-in-up animation-delay-400">
            <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center">
              <ScaleIcon className="h-6 w-6 mr-3 text-green-600" />
              Informations agricoles
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Méthode de culture */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Méthode de culture
                </label>
                <select
                  name="cultivationMethod"
                  value={formData.cultivationMethod}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                >
                  {cultivationMethods.map(method => (
                    <option key={method} value={method}>
                      {method.charAt(0).toUpperCase() + method.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date de récolte */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date de récolte
                </label>
                <input
                  type="date"
                  name="harvestDate"
                  value={formData.harvestDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                />
              </div>

              {/* Agriculture biologique */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isOrganic"
                  checked={formData.isOrganic}
                  onChange={handleChange}
                  className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label className="ml-3 text-sm font-semibold text-gray-700">
                  Produit issu de l'agriculture biologique
                </label>
              </div>

              {/* Conditions de conservation */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Conditions de conservation
                </label>
                <input
                  type="text"
                  name="conditionsConservation"
                  value={formData.conditionsConservation}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                  placeholder="Ex: Conserver au frais, à l'abri de la lumière"
                />
              </div>
            </div>
          </div>

          {/* Upload d'images */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 animate-fade-in-up animation-delay-600">
            <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center">
              <PhotoIcon className="h-6 w-6 mr-3 text-green-600" />
              Photos du produit
            </h2>

            {/* Zone de drop */}
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-green-400 transition-all duration-300">
              <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <label htmlFor="images" className="cursor-pointer">
                  <span className="bg-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transform hover:scale-105 transition-all duration-300 inline-block">
                    📸 Choisir des photos
                  </span>
                  <input
                    id="images"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                <p className="mt-2 text-sm text-gray-500">
                  PNG, JPG, JPEG jusqu'à 10MB
                </p>
              </div>
            </div>

            {/* Aperçu des images */}
            {formData.images.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Aperçu des photos</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Preview ${index}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Boutons d'action */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end animate-fade-in-up animation-delay-800">
            <button
              type="button"
              onClick={() => navigate('/farmer/dashboard')}
              className="px-8 py-4 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transform hover:scale-105 transition-all duration-300"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Publication...
                </>
              ) : (
                <>
                  🌱 Publier le produit
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
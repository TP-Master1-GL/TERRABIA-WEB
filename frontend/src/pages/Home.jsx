import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo1 from '../assets/terrabia-logo.png';
const Home = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      name: 'Livraison Intelligente',
      description: 'Optimisation des trajets pour une livraison rapide et écologique',
      icon: '🚚',
      color: 'from-green-500 to-blue-500'
    },
    {
      name: 'Paiement Sécurisé',
      description: 'Transactions sécurisées avec Mobile Money et autres moyens de paiement',
      icon: '🛡️',
      color: 'from-blue-500 to-purple-500'
    },
    {
      name: 'Marché Transparent',
      description: 'Prix équitables et visibilité sur la chaîne d\'approvisionnement',
      icon: '📊',
      color: 'from-purple-500 to-pink-500'
    },
    {
      name: 'Communauté Agricole',
      description: 'Mise en relation directe entre agriculteurs et consommateurs',
      icon: '👥',
      color: 'from-orange-500 to-red-500'
    },
  ];

  const stats = [
    { label: 'Agriculteurs partenaires', value: '500+', delay: '100' },
    { label: 'Produits disponibles', value: '1,000+', delay: '200' },
    { label: 'Commandes livrées', value: '10,000+', delay: '300' },
    { label: 'Villes couvertes', value: '15+', delay: '400' },
  ];

  return (
    <div className="agriculture-bg min-h-screen overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow animation-delay-4000"></div>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-orange-50"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className={`transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            {/* Animated Logo/Badge */}
            <div className="floating mb-8 inline-block">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-600 to-green-600 rounded-2xl flex items-center justify-center shadow-2xl pulse-glow">
                <span className="text-3xl text-white">  <img
                                  src={logo1}
                                  alt="Terrabia Logo"
                                  className="h-50 w-auto mr-2"
                                /></span>
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-6">
              <span className="block animate-fade-in-down">Bienvenue sur</span>
              <span className="block gradient-text animate-fade-in-up animation-delay-300">TERRABIA</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-500">
              La première plateforme camerounaise qui connecte directement les{' '}
              <span className="font-semibold text-green-600">agriculteurs</span> aux{' '}
              <span className="font-semibold text-orange-600">consommateurs</span>. 
              Des produits frais, locaux et de qualité livrés chez vous.
            </p>

            {/* Animated CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in-up animation-delay-700">
              <Link
                to="/marketplace"
                className="group relative px-12 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-2xl shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-3xl shine-effect overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  🛒 Découvrir le marché
                  <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
              
              <Link
                to="/register"
                className="group px-12 py-4 bg-white text-green-700 font-bold rounded-2xl border-2 border-green-200 shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-green-300 hover:bg-green-50"
              >
                <span className="flex items-center">
                  🌟 Devenir partenaire
                  <svg className="w-5 h-5 ml-2 transform group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute bottom-10 left-10 floating animation-delay-2000">
          <div className="w-8 h-8 bg-green-400 rounded-full opacity-60"></div>
        </div>
        <div className="absolute top-20 right-20 floating animation-delay-1000">
          <div className="w-6 h-6 bg-orange-400 rounded-full opacity-60"></div>
        </div>
        <div className="absolute top-1/3 left-1/4 floating animation-delay-3000">
          <div className="w-4 h-4 bg-yellow-400 rounded-full opacity-60"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-down">
            <span className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold mb-4 animate-bounce-slow">
              🌟 Pourquoi choisir TERRABIA
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
              Une expérience <span className="gradient-text">unique</span> au service de l'agriculture locale
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Découvrez comment nous révolutionnons l'agriculture camerounaise avec des solutions innovantes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.name}
                className="group relative animate-fade-in-up"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="relative bg-white rounded-3xl p-8 shadow-2xl transform transition-all duration-500 group-hover:scale-105 group-hover:shadow-3xl border border-gray-100 overflow-hidden">
                  {/* Gradient Background on Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                  
                  {/* Animated Icon */}
                  <div className="relative z-10">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                      <span className="text-3xl transform group-hover:scale-110 transition-transform duration-300">
                        {feature.icon}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-4 text-center group-hover:text-green-600 transition-colors duration-300">
                      {feature.name}
                    </h3>
                    
                    <p className="text-gray-600 text-center leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                      {feature.description}
                    </p>
                  </div>
                  
                  {/* Hover Effect Line */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-1 bg-gradient-to-r from-green-500 to-orange-500 group-hover:w-3/4 transition-all duration-500 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 bg-gradient-to-br from-green-600 via-green-700 to-green-800 text-white overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-pulse-slow"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-200 rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-pulse-slow animation-delay-2000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-down">
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              Notre impact dans les <span className="text-orange-300">communautés</span>
            </h2>
            <p className="text-xl text-green-100 max-w-2xl mx-auto">
              Des chiffres qui parlent de notre engagement pour l'agriculture camerounaise
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="text-center group animate-fade-in-up"
                style={{ animationDelay: `${stat.delay}ms` }}
              >
                <div className="relative">
                  {/* Animated Circle */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 border-4 border-green-400 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-500 group-hover:scale-110 transition-transform duration-500"></div>
                  </div>
                  
                  <div className="relative z-10">
                    <div className="text-5xl md:text-6xl font-black mb-4 text-white group-hover:text-orange-300 transition-colors duration-300 transform group-hover:scale-110">
                      {stat.value}
                    </div>
                    <div className="text-lg text-green-100 font-medium group-hover:text-white transition-colors duration-300">
                      {stat.label}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Bottom */}
          <div className="text-center mt-16 animate-fade-in-up animation-delay-500">
            <Link
              to="/register"
              className="inline-flex items-center px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-3xl group"
            >
              <span>Rejoindre la révolution agricole</span>
              <svg className="w-5 h-5 ml-3 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="relative py-16 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl md:text-4xl font-black mb-6 animate-fade-in-down">
            Prêt à transformer votre expérience agricole ?
          </h3>
          <p className="text-xl text-gray-300 mb-8 animate-fade-in-up animation-delay-200">
            Rejoignez des milliers d'agriculteurs et de consommateurs qui font confiance à TERRABIA
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-400">
            <Link
              to="/marketplace"
              className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transform transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              🛒 Commencer mes achats
            </Link>
            <Link
              to="/register?type=farmer"
              className="px-8 py-4 bg-transparent border-2 border-green-500 text-green-400 hover:bg-green-500 hover:text-white font-bold rounded-xl transform transition-all duration-300 hover:scale-105"
            >
              🌱 Vendre mes produits
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
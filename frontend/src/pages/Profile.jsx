import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usersAPI } from '../services/api';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || user?.username || '',
    email: user?.email || '',
    phone: user?.phone_number || '',
    location: user?.address || '',
    bio: user?.bio || '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || user.username || '',
        email: user.email || '',
        phone: user.phone_number || '',
        location: user.address || '',
        bio: user.bio || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await updateProfile(formData);
      if (result.success) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleDisplay = (role) => {
    const roles = {
      vendeur: 'Agriculteur',
      acheteur: 'Acheteur',
      entreprise_livraison: 'Livreur',
      admin: 'Administrateur'
    };
    return roles[role] || role;
  };

  if (!user) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Profil Utilisateur
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Informations personnelles et préférences.
                </p>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                {isEditing ? 'Annuler' : 'Modifier'}
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Photo de profil */}
                <div className="sm:col-span-2">
                  <div className="flex items-center">
                    <div className="h-16 w-16 rounded-full bg-green-500 flex items-center justify-center text-white text-xl font-bold">
                      {user?.name?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-medium text-gray-900">{user?.name || user?.username}</h4>
                      <p className="text-sm text-gray-500">{getRoleDisplay(user?.role)}</p>
                    </div>
                  </div>
                </div>

                {/* Nom */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Nom complet
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">{user?.name || user?.username}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
                  )}
                </div>

                {/* Téléphone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Téléphone
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">{user?.phone_number || 'Non renseigné'}</p>
                  )}
                </div>

                {/* Localisation */}
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                    Localisation
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="location"
                      id="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">{user?.address || 'Non renseigné'}</p>
                  )}
                </div>

                {/* Bio */}
                <div className="sm:col-span-2">
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                    Bio
                  </label>
                  {isEditing ? (
                    <textarea
                      name="bio"
                      id="bio"
                      rows={3}
                      value={formData.bio}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      placeholder="Parlez-nous de vous..."
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">
                      {user?.bio || 'Aucune bio renseignée'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 rounded-b-lg">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
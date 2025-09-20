import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Search, 
  Filter, 
  Star,
  Clock,
  Phone,
  Navigation,
  Package,
  Shield,
  Award
} from 'lucide-react';
import api from '../services/api';

const PharmacySearch = () => {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [selectedRadius, setSelectedRadius] = useState(5);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [medicines, setMedicines] = useState([]);

  const radiusOptions = [1, 2, 5, 10, 20];

  useEffect(() => {
    getUserLocation();
    fetchPharmacies();
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to a sample location if geolocation fails
          setUserLocation({
            latitude: 28.6139,
            longitude: 77.2090 // Delhi coordinates
          });
        }
      );
    }
  };

  const fetchPharmacies = async () => {
    try {
      setLoading(true);
      const response = await api.get('/pharmacies');
      setPharmacies(response.data);
    } catch (error) {
      console.error('Error fetching pharmacies:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchNearbyPharmacies = async () => {
    if (!userLocation) {
      alert('Location access is required to search nearby pharmacies');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/pharmacies/nearby', {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        radius: selectedRadius * 1000 // Convert km to meters
      });
      setPharmacies(response.data);
    } catch (error) {
      console.error('Error searching nearby pharmacies:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchMedicineInPharmacy = async (pharmacyId) => {
    try {
      const response = await api.get(`/medicine/pharmacy/${pharmacyId}`);
      const medicines = response.data?.data?.medicines || [];
      setMedicines(medicines);
    } catch (error) {
      console.error('Error fetching pharmacy medicines:', error);
    }
  };

  const calculateDistance = (pharmacy) => {
    if (!userLocation || !pharmacy.location) return null;
    
    const R = 6371; // Earth's radius in kilometers
    const dLat = (pharmacy.location.coordinates[1] - userLocation.latitude) * Math.PI / 180;
    const dLon = (pharmacy.location.coordinates[0] - userLocation.longitude) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(userLocation.latitude * Math.PI / 180) * Math.cos(pharmacy.location.coordinates[1] * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance.toFixed(1);
  };

  const getDirections = (pharmacy) => {
    if (!pharmacy.location) return;
    
    const url = `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.location.coordinates[1]},${pharmacy.location.coordinates[0]}`;
    window.open(url, '_blank');
  };

  const filteredPharmacies = pharmacies.filter(pharmacy =>
    pharmacy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pharmacy.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Find Pharmacies</h1>
        <p className="text-gray-600 mt-1">Search for nearby pharmacies and check medicine availability</p>
      </div>

      {/* Search Controls */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by pharmacy name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex space-x-2">
            <select
              value={selectedRadius}
              onChange={(e) => setSelectedRadius(Number(e.target.value))}
              className="flex-1 px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {radiusOptions.map(radius => (
                <option key={radius} value={radius}>
                  {radius} km
                </option>
              ))}
            </select>
            
            <button
              onClick={searchNearbyPharmacies}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Nearby
            </button>
          </div>
        </div>
      </div>

      {/* Location Status */}
      {userLocation && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <MapPin className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-green-800">
              Location detected: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
            </span>
          </div>
        </div>
      )}

      {/* Pharmacy Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPharmacies.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No pharmacies found</h3>
              <p className="text-gray-600">Try adjusting your search criteria or increase the radius</p>
            </div>
          ) : (
            filteredPharmacies.map((pharmacy) => {
              const distance = calculateDistance(pharmacy);
              const isOpen = true; // You can implement actual opening hours logic
              
              return (
                <div key={pharmacy._id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  {/* Pharmacy Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{pharmacy.name}</h3>
                        {pharmacy.verified && (
                          <Shield className="h-5 w-5 text-blue-600" title="Verified Pharmacy" />
                        )}
                        {pharmacy.rating && (
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600">{pharmacy.rating}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span>{pharmacy.address}</span>
                          {distance && (
                            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                              {distance} km away
                            </span>
                          )}
                        </div>
                        
                        {pharmacy.phone && (
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2" />
                            <span>{pharmacy.phone}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          <span className={isOpen ? 'text-green-600' : 'text-red-600'}>
                            {isOpen ? 'Open Now' : 'Closed'}
                          </span>
                          {pharmacy.openingHours && (
                            <span className="ml-2 text-gray-500">
                              {pharmacy.openingHours}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isOpen 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {isOpen ? 'Open' : 'Closed'}
                    </div>
                  </div>

                  {/* Services */}
                  {pharmacy.services && pharmacy.services.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Services</h4>
                      <div className="flex flex-wrap gap-2">
                        {pharmacy.services.map((service, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setSelectedPharmacy(pharmacy);
                        searchMedicineInPharmacy(pharmacy._id);
                      }}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm flex items-center justify-center"
                    >
                      <Package className="h-4 w-4 mr-2" />
                      View Medicines
                    </button>
                    
                    <button
                      onClick={() => getDirections(pharmacy)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm flex items-center"
                    >
                      <Navigation className="h-4 w-4 mr-2" />
                      Directions
                    </button>
                    
                    {pharmacy.phone && (
                      <button
                        onClick={() => window.open(`tel:${pharmacy.phone}`)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm flex items-center"
                      >
                        <Phone className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Medicine Modal */}
      {selectedPharmacy && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Medicines at {selectedPharmacy.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{selectedPharmacy.address}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedPharmacy(null);
                    setMedicines([]);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="px-6 py-4">
              {medicines.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No medicines data available for this pharmacy</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {medicines.map((medicine) => (
                    <div key={medicine._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">{medicine.name}</h4>
                        <span className="text-lg font-semibold text-gray-900">
                          ₹{medicine.price}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Manufacturer: {medicine.manufacturer}</p>
                        <p>Category: {medicine.category}</p>
                        <p className={`font-medium ${
                          medicine.stock > 10 ? 'text-green-600' : 
                          medicine.stock > 0 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {(typeof medicine.stock === 'object' ? medicine.stock.current_quantity : medicine.stock) > 0 ? `${typeof medicine.stock === 'object' ? medicine.stock.current_quantity : medicine.stock} in stock` : 'Out of stock'}
                        </p>
                      </div>
                      
                      {medicine.description && (
                        <p className="text-sm text-gray-500 mt-2 border-t pt-2">
                          {medicine.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacySearch;
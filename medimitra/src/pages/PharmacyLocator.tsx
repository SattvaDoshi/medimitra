import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { Header } from '@/components/layout/header';
import { BackButton } from '@/components/ui/back-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Phone, 
  Clock, 
  Navigation, 
  Search,
  Star,
  Pill,
  CheckCircle,
  AlertTriangle,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { pharmacyApi, type Pharmacy } from '@/services/pharmacyApi';
import { getCurrentLocation, type LocationCoords, formatAddress } from '@/lib/location';
import PharmacyMedicinesModal from '@/components/PharmacyMedicinesModal';

const PharmacyLocator = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [searchLocation, setSearchLocation] = useState('');
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<LocationCoords | null>(null);
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState<{ id: string; name: string } | null>(null);

  // Get pharmacies from navigation state if available
  useEffect(() => {
    if (location.state?.pharmacies) {
      setPharmacies(location.state.pharmacies);
      setUserLocation(location.state.userLocation);
    } else {
      loadNearbyPharmacies();
    }
  }, [location.state]);

  const loadNearbyPharmacies = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to get user location first
      if (!userLocation) {
        try {
          const coords = await getCurrentLocation();
          setUserLocation(coords);
          
          const response = await pharmacyApi.search({
            lat: coords.lat,
            lng: coords.lng,
            radius: 10,
            limit: 20
          });

          if (response.success) {
            setPharmacies(response.data.pharmacies);
          }
        } catch (locationError) {
          console.error('Location error:', locationError);
          // If location fails, load all pharmacies
          const response = await pharmacyApi.getAll({ limit: 20 });
          if (response.success) {
            setPharmacies(response.data.pharmacies);
          }
        }
      } else {
        // Use existing location
        const response = await pharmacyApi.search({
          lat: userLocation.lat,
          lng: userLocation.lng,
          radius: 10,
          limit: 20
        });

        if (response.success) {
          setPharmacies(response.data.pharmacies);
        }
      }
    } catch (err) {
      console.error('Error loading pharmacies:', err);
      setError('Failed to load pharmacies. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNearMeSearch = async () => {
    try {
      setLoading(true);
      setError(null);
      setSearchLocation(''); // Clear search input
      console.log('Finding nearby pharmacies...');

      // Always try to get fresh location for "Near Me"
      const coords = await getCurrentLocation();
      setUserLocation(coords);
      console.log('User location:', coords);

      const response = await pharmacyApi.search({
        lat: coords.lat,
        lng: coords.lng,
        radius: 10,
        limit: 20
      });

      console.log('Nearby pharmacies response:', response);

      if (response.success) {
        setPharmacies(response.data.pharmacies);
        if (response.data.pharmacies.length === 0) {
          setError('No pharmacies found within 10km of your location');
        }
      } else {
        setPharmacies([]);
        setError('No pharmacies found near your location');
      }
    } catch (err) {
      console.error('Error finding nearby pharmacies:', err);
      if (err instanceof Error && err.message.includes('denied')) {
        setError('Location access denied. Please enable location services and try again.');
      } else {
        setError('Unable to get your location. Please search by city instead.');
      }
      
      // Fallback to all pharmacies
      try {
        const response = await pharmacyApi.getAll({ limit: 20 });
        if (response.success) {
          setPharmacies(response.data.pharmacies);
        }
      } catch (fallbackErr) {
        console.error('Fallback error:', fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle opening medicines modal
  const handleViewMedicines = (pharmacy: Pharmacy) => {
    setSelectedPharmacy({
      id: pharmacy._id,
      name: pharmacy.name
    });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedPharmacy(null);
  };

  const handleLocationSearch = async () => {
    if (!searchLocation.trim()) {
      loadNearbyPharmacies();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('Searching pharmacies with city:', searchLocation);

      const response = await pharmacyApi.search({
        city: searchLocation,
        limit: 20
      });

      console.log('Pharmacy search response:', response);

      if (response.success) {
        setPharmacies(response.data.pharmacies);
        if (response.data.pharmacies.length === 0) {
          setError(`No pharmacies found in "${searchLocation}"`);
        }
      } else {
        setPharmacies([]);
        setError(`No pharmacies found in "${searchLocation}"`);
      }
    } catch (err) {
      console.error('Error searching pharmacies:', err);
      setError('Failed to search pharmacies. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isPharmacyOpen = (operatingHours: any) => {
    if (!operatingHours) return false;
    
    const now = new Date();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = days[now.getDay()];
    const currentTime = now.getHours() * 100 + now.getMinutes();
    
    const todayHours = operatingHours[currentDay];
    if (!todayHours || todayHours.is_closed) return false;
    if (todayHours.is_24_hours) return true;
    
    const openTime = parseInt(todayHours.open.replace(':', ''));
    const closeTime = parseInt(todayHours.close.replace(':', ''));
    
    return currentTime >= openTime && currentTime <= closeTime;
  };

  const formatRating = (rating: number | { average: number; count: number } | null): { display: string; count?: number } => {
    if (!rating) return { display: 'N/A' };
    
    if (typeof rating === 'object') {
      return {
        display: rating.average?.toFixed(1) || 'N/A',
        count: rating.count
      };
    }
    
    return { display: rating.toString() };
  };

  const emergencyMedicines = [
    { name: 'Paracetamol', availability: 'Available', price: '₹15' },
    { name: 'Crocin', availability: 'Available', price: '₹20' },
    { name: 'ORS Packets', availability: 'Available', price: '₹8' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted animate-fade-in">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <BackButton />
        
        {/* Header */}
        <div className="mb-8 animate-fade-in animation-delay-200">
          <h1 className="text-3xl-rural font-bold text-foreground mb-4 animate-scale-in">
            🏪 Pharmacy Locator
          </h1>
          <p className="text-lg text-muted-foreground">
            Find nearest pharmacies and check medicine availability
          </p>
        </div>

        {/* Location Search */}
        <div className="mb-8 animate-fade-in animation-delay-400">
          <div className="flex gap-3 max-w-lg">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by city or pharmacy name..."
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLocationSearch()}
                className="pl-10"
                disabled={loading}
              />
            </div>
            <Button 
              className="hover-scale"
              onClick={handleLocationSearch}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Search
            </Button>
            <Button 
              variant="outline"
              className="hover-scale"
              onClick={handleNearMeSearch}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Finding...
                </>
              ) : (
                <>
                  <MapPin className="h-4 w-4 mr-2" />
                  Near Me
                </>
              )}
            </Button>
          </div>
          
          {/* Error Display */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}

          {/* Location Status */}
          {!error && userLocation && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2 text-blue-700">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">
                📍 Using your location ({userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)})
              </span>
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Nearby Pharmacies */}
            <div className="animate-fade-in animation-delay-500">
              <h2 className="text-2xl font-semibold mb-6">
                {searchLocation ? 'Search Results' : 'Nearby Pharmacies'}
                {pharmacies.length > 0 && ` (${pharmacies.length})`}
              </h2>
              
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading pharmacies...</span>
                </div>
              ) : pharmacies.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">
                    {searchLocation ? 'No pharmacies found for your search' : 'No pharmacies available'}
                  </p>
                  {searchLocation && (
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={loadNearbyPharmacies}
                    >
                      View All Pharmacies
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {pharmacies.map((pharmacy, index) => {
                    const isOpen = isPharmacyOpen(pharmacy.operating_hours);
                    const address = formatAddress(pharmacy.location.address);
                    const ratingInfo = formatRating(pharmacy.rating);
                    
                    return (
                      <Card key={`${pharmacy._id}-${index}`} className="service-card hover-scale">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="font-bold text-lg">{pharmacy.name}</h3>
                                <Badge 
                                  variant={isOpen ? 'default' : 'destructive'}
                                  className="ml-2"
                                >
                                  {isOpen ? (
                                    <>
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Open
                                    </>
                                  ) : (
                                    <>
                                      <AlertTriangle className="h-3 w-3 mr-1" />
                                      Closed
                                    </>
                                  )}
                                </Badge>
                              </div>
                              
                              {/* Enhanced Address Display */}
                              <div className="space-y-1 mb-3">
                                <p className="text-muted-foreground flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  <span className="font-medium">{pharmacy.location.address.street}</span>
                                </p>
                                <p className="text-sm text-muted-foreground ml-5">
                                  {pharmacy.location.address.city}, {pharmacy.location.address.state} - {pharmacy.location.address.pincode}
                                </p>
                                {pharmacy.distance && (
                                  <p className="text-sm text-primary font-medium ml-5">
                                    📍 {pharmacy.distance.toFixed(1)} km away
                                  </p>
                                )}
                              </div>
                              
                              {/* Operating Hours */}
                              <p className="text-sm text-muted-foreground flex items-center gap-1 mb-3">
                                <Clock className="h-4 w-4" />
                                {pharmacy.operating_hours?.monday ? 
                                  (pharmacy.operating_hours.monday.is_24_hours ? 
                                    '24/7 Open' : 
                                    `${pharmacy.operating_hours.monday.open} - ${pharmacy.operating_hours.monday.close}`
                                  ) : 
                                  'Hours not available'
                                }
                              </p>
                              
                              {/* Rating and Services */}
                              <div className="flex items-center gap-2 mb-3">
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                  <span className="text-sm font-medium">
                                    {ratingInfo.display}
                                  </span>
                                  {ratingInfo.count && (
                                    <span className="text-xs text-muted-foreground">
                                      ({ratingInfo.count} reviews)
                                    </span>
                                  )}
                                </div>
                                {pharmacy.services && pharmacy.services.length > 0 && (
                                  <Badge variant="outline" className="text-xs">
                                    {pharmacy.services.length} Services
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Services */}
                          {pharmacy.services && pharmacy.services.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {pharmacy.services.slice(0, 3).map((service, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {service.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </Badge>
                              ))}
                              {pharmacy.services.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{pharmacy.services.length - 3} more
                                </Badge>
                              )}
                            </div>
                          )}
                          
                          {/* Action Buttons */}
                          <div className="flex gap-3">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1 hover-scale"
                              onClick={() => window.open(`tel:${pharmacy.contact.phone.replace(/[^\d]/g, '')}`, '_self')}
                            >
                              <Phone className="h-4 w-4 mr-2" />
                              Call
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1 hover-scale"
                              onClick={() => {
                                const query = `${pharmacy.location.address.street}, ${pharmacy.location.address.city}, ${pharmacy.location.address.state} ${pharmacy.location.address.pincode}`;
                                window.open(`https://maps.google.com/maps?q=${encodeURIComponent(query)}`, '_blank');
                              }}
                            >
                              <Navigation className="h-4 w-4 mr-2" />
                              Directions
                            </Button>
                            <Button 
                              size="sm" 
                              className="flex-1 hover-scale"
                              onClick={() => handleViewMedicines(pharmacy)}
                            >
                              <Pill className="h-4 w-4 mr-2" />
                              View Medicines
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Emergency Medicines */}
            <Card className="animate-fade-in animation-delay-1000">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="h-5 w-5 text-destructive" />
                  Emergency Medicines
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {emergencyMedicines.map((medicine, index) => (
                    <div key={index} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <h4 className="font-medium text-sm">{medicine.name}</h4>
                        <p className="text-xs text-muted-foreground">{medicine.availability}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-primary">{medicine.price}</p>
                        <Badge variant="default" className="text-xs">✓</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Services */}
            <Card className="animate-fade-in animation-delay-1200">
              <CardHeader>
                <CardTitle>Quick Services</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start hover-scale">
                  <Pill className="h-4 w-4 mr-2" />
                  Upload Prescription
                </Button>
                <Button variant="outline" className="w-full justify-start hover-scale">
                  <Clock className="h-4 w-4 mr-2" />
                  Schedule Delivery
                </Button>
                <Button variant="outline" className="w-full justify-start hover-scale">
                  <Phone className="h-4 w-4 mr-2" />
                  24/7 Helpline
                </Button>
              </CardContent>
            </Card>

            {/* Pharmacy Statistics */}
            <Card className="animate-fade-in animation-delay-1400">
              <CardHeader>
                <CardTitle>Area Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">15</p>
                  <p className="text-sm text-muted-foreground">Pharmacies Nearby</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-success">8</p>
                  <p className="text-sm text-muted-foreground">24/7 Available</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-accent">30min</p>
                  <p className="text-sm text-muted-foreground">Avg Delivery Time</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Pharmacy Medicines Modal */}
      {selectedPharmacy && (
        <PharmacyMedicinesModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          pharmacyId={selectedPharmacy.id}
          pharmacyName={selectedPharmacy.name}
        />
      )}
    </div>
  );
};

export default PharmacyLocator;
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/header';
import { BackButton } from '@/components/ui/back-button';
import { ServiceCard } from '@/components/ui/service-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Search, 
  MapPin, 
  DollarSign, 
  Truck, 
  CheckCircle,
  XCircle,
  Clock,
  Pill,
  ArrowLeft,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { medicineApi, type Medicine } from '@/services/medicineApi';
import { pharmacyApi, type Pharmacy } from '@/services/pharmacyApi';
import { getCurrentLocation, type LocationCoords } from '@/lib/location';

const MedicineFinder = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<LocationCoords | null>(null);
  const [nearbyPharmacies, setNearbyPharmacies] = useState<Pharmacy[]>([]);

  // Get user's location
  useEffect(() => {
    getCurrentLocation()
      .then(setUserLocation)
      .catch((error) => {
        console.error('Error getting location:', error);
        // Don't show error to user, just continue without location
      });
  }, []);

  // Load initial medicines and test API connection
  useEffect(() => {
    const testApiConnection = async () => {
      try {
        console.log('Testing API connection...');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        console.log('API URL:', apiUrl);
        
        // Test health endpoint
        const healthResponse = await fetch(`${apiUrl}/health`);
        const healthData = await healthResponse.json();
        console.log('API Health Check:', healthData);
        
        // Test direct fetch to medicine endpoint
        const medicineResponse = await fetch(`${apiUrl}/medicine?available_only=true&limit=5&page=1`);
        const medicineData = await medicineResponse.json();
        console.log('Direct Medicine API Response:', medicineData);
        
      } catch (err) {
        console.error('API Connection Test Failed:', err);
      }
    };
    
    testApiConnection();
    loadMedicines();
  }, []);

  const loadMedicines = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading medicines...');
      
      const response = await medicineApi.getAll({ 
        available_only: true, 
        limit: 20,
        page: 1 
      });
      
      console.log('API Response:', response);
      
      if (response.success && response.data.medicines) {
        console.log('Medicines found:', response.data.medicines.length);
        setMedicines(response.data.medicines);
      } else {
        console.log('No medicines in response or response not successful');
        setMedicines([]);
      }
    } catch (err) {
      console.error('Error loading medicines:', err);
      setError('Failed to load medicines. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadMedicines();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('Searching medicines with query:', searchQuery);
      
      const searchParams = {
        q: searchQuery,
        available_only: true,
        limit: 20,
        page: 1,
        ...(userLocation && {
          lat: userLocation.lat,
          lng: userLocation.lng,
          radius: 10
        })
      };

      console.log('Search params:', searchParams);
      const response = await medicineApi.search(searchParams);
      console.log('Search response:', response);
      
      if (response.success && response.data.medicines) {
        console.log('Search results:', response.data.medicines.length);
        setMedicines(response.data.medicines);
        if (response.data.medicines.length === 0) {
          setError(`No medicines found for "${searchQuery}"`);
        }
      } else {
        console.log('No search results found');
        setMedicines([]);
        setError(`No medicines found for "${searchQuery}"`);
      }
    } catch (err) {
      console.error('Error searching medicines:', err);
      setError('Failed to search medicines. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const findNearbyPharmacies = async () => {
    if (!userLocation) {
      setError('Location permission required to find nearby pharmacies');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await pharmacyApi.search({
        lat: userLocation.lat,
        lng: userLocation.lng,
        radius: 5,
        limit: 10
      });
      
      if (response.success) {
        setNearbyPharmacies(response.data.pharmacies);
        navigate('/pharmacy-locator', { 
          state: { pharmacies: response.data.pharmacies, userLocation } 
        });
      }
    } catch (err) {
      console.error('Error finding pharmacies:', err);
      setError('Failed to find nearby pharmacies. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const services = [
    {
      icon: MapPin,
      title: t('medicine.nearest'),
      description: 'Find nearby pharmacies',
      onClick: findNearbyPharmacies
    },
    {
      icon: DollarSign,
      title: t('medicine.cheapest'),
      description: 'Compare medicine prices',
      onClick: () => navigate('/price-comparison')
    },
    {
      icon: Truck,
      title: t('medicine.delivery'),
      description: 'Order home delivery',
      onClick: () => navigate('/delivery')
    },
    {
      icon: CheckCircle,
      title: t('medicine.availability'),
      description: 'Check stock status',
      onClick: () => handleSearch()
    }
  ];

  const getAvailabilityStatus = (medicine: Medicine) => {
    const currentQuantity = medicine.stock?.current_quantity || 0;
    const expiryDate = new Date(medicine.expiry_date);
    const now = new Date();
    
    if (expiryDate <= now) {
      return 'expired';
    }
    
    if (currentQuantity === 0) {
      return 'out_of_stock';
    }
    
    if (currentQuantity <= 5) { // Assuming low stock threshold
      return 'limited';
    }
    
    return 'available';
  };

  const getAvailabilityIcon = (status: string) => {
    switch (status) {
      case 'available': return CheckCircle;
      case 'limited': return Clock;
      case 'expired': return XCircle;
      default: return XCircle;
    }
  };

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-600';
      case 'limited': return 'text-yellow-600';
      case 'expired': return 'text-red-600';
      default: return 'text-red-600';
    }
  };

  const getAvailabilityText = (status: string) => {
    switch (status) {
      case 'available': return 'In Stock';
      case 'limited': return 'Limited Stock';
      case 'expired': return 'Expired';
      default: return 'Out of Stock';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <BackButton />
          
          <h1 className="text-3xl-rural font-bold text-foreground mb-4">
            {t('medicine.title')}
          </h1>
          
          {/* Quick Navigation */}
          <div className="flex flex-wrap gap-3 mb-6">
            <Button onClick={() => navigate('/pharmacy-locator')} size="sm" variant="outline">
              <MapPin className="h-4 w-4 mr-2" />
              Find Pharmacy
            </Button>
            <Button onClick={() => navigate('/price-comparison')} size="sm" variant="outline">
              <DollarSign className="h-4 w-4 mr-2" />
              Compare Prices
            </Button>
            <Button onClick={() => navigate('/hospital-finder')} size="sm" variant="outline">
              <Pill className="h-4 w-4 mr-2" />
              Find Hospital
            </Button>
            <Button onClick={() => {
              setSearchQuery('');
              loadMedicines();
            }} size="sm" variant="outline">
              <CheckCircle className="h-4 w-4 mr-2" />
              View All
            </Button>
          </div>
          
          {/* Search */}
          <div className="flex gap-2 mb-6">
            <Input
              placeholder={t('medicine.search') || 'Search medicines by name, brand, or composition...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 text-lg py-3"
              disabled={loading}
            />
            <Button 
              size="lg" 
              className="px-6" 
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Search className="h-5 w-5" />
              )}
            </Button>
            {searchQuery && (
              <Button 
                size="lg" 
                variant="outline"
                className="px-4" 
                onClick={() => {
                  setSearchQuery('');
                  loadMedicines();
                }}
                disabled={loading}
              >
                Clear
              </Button>
            )}
          </div>

          {/* Success/Info Messages */}
          {!loading && !error && medicines.length > 0 && searchQuery && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              <span>Found {medicines.length} medicine(s) for "{searchQuery}"</span>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Services */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Medicine Services</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service, index) => (
              <ServiceCard key={index} {...service} />
            ))}
          </div>
        </div>

        {/* Debug Info */}
        {import.meta.env.DEV && (
          <div className="mb-6 p-4 bg-gray-100 rounded-lg text-sm">
            <h3 className="font-bold mb-2">Debug Info:</h3>
            <p>Medicines count: {medicines.length}</p>
            <p>Loading: {loading.toString()}</p>
            <p>Error: {error || 'none'}</p>
            <p>User location: {userLocation ? `${userLocation.lat}, ${userLocation.lng}` : 'not available'}</p>
            <p>Search query: {searchQuery || 'none'}</p>
          </div>
        )}

        {/* Medicine Results */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">
            {searchQuery ? 'Search Results' : 'Available Medicines'}
            {medicines.length > 0 && ` (${medicines.length})`}
          </h2>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading medicines...</span>
            </div>
          ) : medicines.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Pill className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">
                {searchQuery ? 'No medicines found for your search' : 'No medicines available'}
              </p>
              {searchQuery && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={loadMedicines}
                >
                  View All Medicines
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {medicines.map((medicine, index) => {
                const availabilityStatus = getAvailabilityStatus(medicine);
                const AvailabilityIcon = getAvailabilityIcon(availabilityStatus);
                
                return (
                  <Card key={`${medicine._id}-${index}`} className="service-card">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">
                            {medicine.name} {medicine.strength}
                          </h3>
                          <p className="text-muted-foreground text-sm">
                            Brand: {medicine.brand}
                          </p>
                          <p className="text-muted-foreground text-sm">
                            Composition: {medicine.composition}
                          </p>
                          <p className="text-muted-foreground text-sm font-medium">
                            📍 {medicine.pharmacy?.name || 'Unknown Pharmacy'}
                            {medicine.pharmacy?.location?.address?.city && 
                              `, ${medicine.pharmacy.location.address.city}`
                            }
                          </p>
                          {medicine.distance && (
                            <p className="text-muted-foreground text-sm">
                              Distance: {medicine.distance.toFixed(1)} km
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">
                            ₹{medicine.selling_price}
                          </p>
                          {medicine.mrp !== medicine.selling_price && (
                            <p className="text-sm text-muted-foreground line-through">
                              MRP: ₹{medicine.mrp}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className={`flex items-center gap-2 ${getAvailabilityColor(availabilityStatus)}`}>
                          <AvailabilityIcon className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            {getAvailabilityText(availabilityStatus)}
                          </span>
                          {medicine.stock?.current_quantity > 0 && (
                            <span className="text-sm text-muted-foreground">
                              ({medicine.stock.current_quantity} {medicine.stock.unit})
                            </span>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              if (medicine.pharmacy?.location?.address) {
                                const address = medicine.pharmacy.location.address;
                                const query = `${address.street}, ${address.city}, ${address.state} ${address.pincode}`;
                                window.open(`https://maps.google.com/maps?q=${encodeURIComponent(query)}`, '_blank');
                              }
                            }}
                          >
                            <MapPin className="h-4 w-4 mr-1" />
                            Directions
                          </Button>
                          <Button 
                            size="sm" 
                            disabled={availabilityStatus === 'out_of_stock' || availabilityStatus === 'expired'}
                          >
                            <Pill className="h-4 w-4 mr-1" />
                            Order
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          <Card className="service-card text-center">
            <CardContent className="p-6">
              <MapPin className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-2">{nearbyPharmacies.length || '25+'}+</h3>
              <p className="text-sm text-muted-foreground">
                {nearbyPharmacies.length > 0 ? 'Nearby Pharmacies' : 'Pharmacies Connected'}
              </p>
            </CardContent>
          </Card>
          
          <Card className="service-card text-center">
            <CardContent className="p-6">
              <Pill className="h-8 w-8 mx-auto mb-3 text-secondary" />
              <h3 className="font-semibold mb-2">{medicines.length || '500+'}+</h3>
              <p className="text-sm text-muted-foreground">
                {medicines.length > 0 ? 'Medicines Found' : 'Medicines Available'}
              </p>
            </CardContent>
          </Card>
          
          <Card className="service-card text-center">
            <CardContent className="p-6">
              <Truck className="h-8 w-8 mx-auto mb-3 text-accent" />
              <h3 className="font-semibold mb-2">24/7</h3>
              <p className="text-sm text-muted-foreground">Delivery Service</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default MedicineFinder;
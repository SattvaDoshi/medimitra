import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { X, Search, Pill, Calendar, Package, DollarSign, AlertCircle, CheckCircle, Filter } from 'lucide-react';
import pharmacyApi from '@/services/pharmacyApi';

interface Medicine {
  _id: string;
  name: string;
  brand: string;
  category: string;
  composition: string;
  strength: string;
  pack_size: string;
  selling_price: number;
  mrp: number;
  stock: {
    current_quantity: number;
    minimum_threshold: number;
  };
  prescription_required: boolean;
  expiry_date: string;
}

interface PharmacyMedicinesModalProps {
  isOpen: boolean;
  onClose: () => void;
  pharmacyId: string;
  pharmacyName: string;
}

export const PharmacyMedicinesModal: React.FC<PharmacyMedicinesModalProps> = ({
  isOpen,
  onClose,
  pharmacyId,
  pharmacyName
}) => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [availableOnly, setAvailableOnly] = useState(true);
  const [searchDebounce, setSearchDebounce] = useState('');

  const loadMedicines = useCallback(async (searchQuery: string = '', showAvailableOnly: boolean = true) => {
    if (!pharmacyId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Loading medicines with params:', { 
        search: searchQuery, 
        available_only: showAvailableOnly,
        pharmacyId 
      });

      const response = await pharmacyApi.getMedicinesByPharmacy(pharmacyId, {
        search: searchQuery.trim() || undefined,
        available_only: showAvailableOnly,
        limit: 50
      });

      console.log('Medicines response:', response);

      if (response.success && response.data) {
        setMedicines(response.data.medicines);
        if (response.data.medicines.length === 0) {
          setError(searchQuery ? 'No medicines found matching your search' : 
                   showAvailableOnly ? 'No medicines currently available' : 'No medicines found');
        }
      } else {
        setError(response.message || 'Failed to load medicines');
      }
    } catch (err) {
      console.error('Error loading medicines:', err);
      setError('Failed to load medicines');
    } finally {
      setLoading(false);
    }
  }, [pharmacyId]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounce(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load medicines when modal opens or filters change
  useEffect(() => {
    if (isOpen && pharmacyId) {
      loadMedicines(searchDebounce, availableOnly);
    } else if (!isOpen) {
      // Reset state when modal closes
      setMedicines([]);
      setError(null);
      setSearchTerm('');
      setSearchDebounce('');
      setAvailableOnly(true);
    }
  }, [isOpen, pharmacyId, searchDebounce, availableOnly, loadMedicines]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleToggleAvailable = () => {
    setAvailableOnly(!availableOnly);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(today.getMonth() + 6);
    return expiry <= sixMonthsFromNow;
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      tablet: 'bg-blue-100 text-blue-800',
      capsule: 'bg-green-100 text-green-800',
      syrup: 'bg-purple-100 text-purple-800',
      injection: 'bg-red-100 text-red-800',
      cream: 'bg-yellow-100 text-yellow-800',
      ointment: 'bg-orange-100 text-orange-800',
      drops: 'bg-cyan-100 text-cyan-800',
      spray: 'bg-pink-100 text-pink-800',
      inhaler: 'bg-indigo-100 text-indigo-800',
      powder: 'bg-gray-100 text-gray-800',
      gel: 'bg-teal-100 text-teal-800',
      lotion: 'bg-lime-100 text-lime-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-primary" />
            Medicines at {pharmacyName}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Search and Filters */}
          <div className="flex-shrink-0 space-y-4 mb-6 p-1">
            <div className="flex gap-3 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search medicines by name, brand, or composition..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <Button
                  variant={availableOnly ? "default" : "outline"}
                  onClick={handleToggleAvailable}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    availableOnly 
                      ? 'bg-green-600 hover:bg-green-700 text-white shadow-md' 
                      : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300'
                  }`}
                >
                  <CheckCircle className={`h-4 w-4 mr-2 ${availableOnly ? 'text-white' : 'text-green-500'}`} />
                  {availableOnly ? "Available Only" : "Show All"}
                </Button>
              </div>
            </div>
            
            {/* Filter Status Info */}
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-600">
                Showing {medicines.length} medicine{medicines.length !== 1 ? 's' : ''}
                {searchTerm && <span> matching "{searchTerm}"</span>}
                {availableOnly && <span className="text-green-600 font-medium"> (available only)</span>}
              </span>
              {!availableOnly && medicines.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  Including out-of-stock items
                </Badge>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-muted-foreground">Loading medicines...</span>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <p className="text-red-600 font-medium">{error}</p>
                  <Button onClick={() => loadMedicines(searchDebounce, availableOnly)} variant="outline" className="mt-4">
                    Try Again
                  </Button>
                </div>
              </div>
            ) : medicines.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">No medicines found</p>
                  <p className="text-gray-500 text-sm mt-2">
                    {searchTerm ? 'Try adjusting your search terms' : 'This pharmacy has no medicines listed'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid gap-4">
                {medicines.map((medicine) => (
                  <Card key={medicine._id} className="hover:shadow-lg transition-all duration-200 border-gray-200">
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1 pr-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-lg text-gray-900 leading-tight">
                              {medicine.name}
                            </h3>
                            <Badge className={getCategoryColor(medicine.category)}>
                              {medicine.category.charAt(0).toUpperCase() + medicine.category.slice(1)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-1 font-medium">
                            {medicine.brand} • {medicine.strength}
                          </p>
                          <p className="text-xs text-gray-500 leading-relaxed">
                            {medicine.composition}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-blue-500 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs text-gray-500 font-medium">Pack Size</p>
                            <p className="text-sm font-semibold text-gray-900 truncate">{medicine.pack_size}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs text-gray-500 font-medium">Price</p>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-green-600">
                                {formatPrice(medicine.selling_price)}
                              </p>
                              {medicine.selling_price < medicine.mrp && (
                                <p className="text-xs text-gray-500 line-through">
                                  {formatPrice(medicine.mrp)}
                                </p>
                              )}
                            </div>
                            {medicine.selling_price < medicine.mrp && (
                              <p className="text-xs text-green-600 font-medium">
                                Save {formatPrice(medicine.mrp - medicine.selling_price)}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-purple-500 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs text-gray-500 font-medium">Stock</p>
                            <div className="flex items-center gap-1">
                              {medicine.stock.current_quantity > 0 ? (
                                <CheckCircle className="h-3 w-3 text-green-500" />
                              ) : (
                                <AlertCircle className="h-3 w-3 text-red-500" />
                              )}
                              <p className={`text-sm font-semibold ${
                                medicine.stock.current_quantity > 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {medicine.stock.current_quantity > 0 ? 
                                  `${medicine.stock.current_quantity} available` : 
                                  'Out of Stock'
                                }
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-orange-500 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs text-gray-500 font-medium">Expiry</p>
                            <p className={`text-sm font-semibold ${
                              isExpiringSoon(medicine.expiry_date) ? 'text-orange-600' : 'text-gray-900'
                            }`}>
                              {new Date(medicine.expiry_date).toLocaleDateString('en-IN')}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-2 flex-wrap">
                          {medicine.prescription_required && (
                            <Badge variant="destructive" className="text-xs">
                              ℞ Prescription Required
                            </Badge>
                          )}
                          {isExpiringSoon(medicine.expiry_date) && (
                            <Badge variant="outline" className="text-xs text-orange-600 border-orange-600">
                              ⚠ Expiring Soon
                            </Badge>
                          )}
                          {medicine.stock.current_quantity <= medicine.stock.minimum_threshold && medicine.stock.current_quantity > 0 && (
                            <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-600">
                              📦 Low Stock
                            </Badge>
                          )}
                        </div>
                        
                        {medicine.stock.current_quantity > 0 && (
                          <Button 
                            size="sm" 
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm"
                          >
                            <Pill className="h-4 w-4 mr-2" />
                            Add to Cart
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PharmacyMedicinesModal;
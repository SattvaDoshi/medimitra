import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  DollarSign, 
  TrendingDown,
  MapPin,
  ShoppingCart,
  Star,
  Truck,
  Timer,
  Percent
} from 'lucide-react';

const PriceComparison = () => {
  const { t } = useTranslation();
  const [searchMedicine, setSearchMedicine] = useState('');

  const medicineComparisons = [
    {
      medicine: 'Paracetamol 500mg',
      generic: 'Acetaminophen',
      prices: [
        { pharmacy: 'Apollo Pharmacy', price: 25, originalPrice: 30, discount: 17, distance: '1.2 km', rating: 4.5, delivery: true, inStock: true },
        { pharmacy: 'City Medical Store', price: 15, originalPrice: 15, discount: 0, distance: '0.8 km', rating: 4.2, delivery: true, inStock: true },
        { pharmacy: 'Medplus Pharmacy', price: 28, originalPrice: 35, discount: 20, distance: '2.1 km', rating: 4.7, delivery: false, inStock: false },
        { pharmacy: 'Local Pharmacy', price: 12, originalPrice: 12, discount: 0, distance: '3.5 km', rating: 3.9, delivery: true, inStock: true }
      ]
    }
  ];

  const popularMedicines = [
    { name: 'Paracetamol 500mg', searches: 156, avgPrice: '₹20' },
    { name: 'Crocin Advance', searches: 89, avgPrice: '₹25' },
    { name: 'Aspirin 75mg', searches: 67, avgPrice: '₹15' },
    { name: 'Amoxicillin 250mg', searches: 45, avgPrice: '₹45' },
    { name: 'Cetirizine 10mg', searches: 78, avgPrice: '₹18' },
    { name: 'Omeprazole 20mg', searches: 34, avgPrice: '₹32' }
  ];

  const getCheapestPrice = (prices: any[]) => {
    return Math.min(...prices.filter(p => p.inStock).map(p => p.price));
  };

  const getMostExpensive = (prices: any[]) => {
    return Math.max(...prices.filter(p => p.inStock).map(p => p.price));
  };

  const getSavings = (prices: any[]) => {
    const cheapest = getCheapestPrice(prices);
    const expensive = getMostExpensive(prices);
    return expensive - cheapest;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl-rural font-bold text-foreground mb-4">
            💰 Medicine Price Comparison
          </h1>
          
          {/* Search */}
          <div className="flex gap-2 mb-6">
            <Input
              placeholder="Search for medicine..."
              value={searchMedicine}
              onChange={(e) => setSearchMedicine(e.target.value)}
              className="flex-1 text-lg py-3"
            />
            <Button size="lg" className="px-6">
              <Search className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Price Comparison Results */}
        {medicineComparisons.map((comparison, index) => (
          <div key={index} className="mb-8">
            {/* Medicine Header */}
            <Card className="mb-4 bg-gradient-primary text-primary-foreground">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold">{comparison.medicine}</h2>
                    <p className="opacity-90">Generic: {comparison.generic}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm opacity-90">You can save up to</p>
                    <p className="text-2xl font-bold">₹{getSavings(comparison.prices)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Price List */}
            <div className="space-y-3">
              {comparison.prices
                .sort((a, b) => a.price - b.price)
                .map((priceInfo, idx) => (
                <Card 
                  key={idx} 
                  className={`${
                    priceInfo.price === getCheapestPrice(comparison.prices) && priceInfo.inStock
                      ? 'ring-2 ring-success bg-success/5' 
                      : 'service-card'
                  } ${!priceInfo.inStock ? 'opacity-60' : ''}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{priceInfo.pharmacy}</h3>
                          {priceInfo.price === getCheapestPrice(comparison.prices) && priceInfo.inStock && (
                            <Badge className="bg-success text-success-foreground">
                              <TrendingDown className="h-3 w-3 mr-1" />
                              Cheapest
                            </Badge>
                          )}
                          {!priceInfo.inStock && (
                            <Badge variant="destructive">Out of Stock</Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {priceInfo.distance}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            {priceInfo.rating}
                          </span>
                          {priceInfo.delivery && (
                            <span className="flex items-center gap-1">
                              <Truck className="h-3 w-3" />
                              Delivery
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right flex items-center gap-4">
                        <div>
                          {priceInfo.discount > 0 && (
                            <>
                              <p className="text-sm line-through text-muted-foreground">₹{priceInfo.originalPrice}</p>
                              <Badge variant="outline" className="text-xs mb-1">
                                <Percent className="h-3 w-3 mr-1" />
                                {priceInfo.discount}% OFF
                              </Badge>
                            </>
                          )}
                          <p className="text-2xl font-bold text-primary">₹{priceInfo.price}</p>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <Button 
                            size="sm" 
                            disabled={!priceInfo.inStock}
                            className={priceInfo.price === getCheapestPrice(comparison.prices) && priceInfo.inStock ? 'bg-success hover:bg-success/90' : ''}
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            {priceInfo.inStock ? 'Order Now' : 'Out of Stock'}
                          </Button>
                          <Button size="sm" variant="outline">
                            View Store
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

        {/* Popular Medicines */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">Popular Medicine Searches</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {popularMedicines.map((medicine, index) => (
              <Card key={index} className="service-card cursor-pointer hover:bg-gradient-card">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{medicine.name}</h3>
                      <p className="text-sm text-muted-foreground">{medicine.searches} searches today</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">{medicine.avgPrice}</p>
                      <p className="text-xs text-muted-foreground">Avg. Price</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Savings Calculator */}
        <Card className="mb-8 bg-gradient-to-r from-success/10 to-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-success" />
              Your Savings This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="text-center">
                <p className="text-3xl font-bold text-success">₹450</p>
                <p className="text-sm text-muted-foreground">Total Saved</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">₹1,200</p>
                <p className="text-sm text-muted-foreground">Money Spent</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-accent">27%</p>
                <p className="text-sm text-muted-foreground">Avg. Savings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card>
          <CardHeader>
            <CardTitle>💡 Money-Saving Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-success">•</span>
                <span>Always ask for generic alternatives - they can be 30-70% cheaper</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success">•</span>
                <span>Government pharmacies often have the lowest prices</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success">•</span>
                <span>Buy in bulk for chronic medications to get better deals</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success">•</span>
                <span>Check for seasonal discounts and pharmacy offers</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PriceComparison;
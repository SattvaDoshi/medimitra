import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Header } from '@/components/layout/header';
import { BackButton } from '@/components/ui/back-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  TestTube, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone,
  Heart,
  Activity,
  Droplets,
  Search
} from 'lucide-react';

const LabTests = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  const popularTests = [
    {
      name: 'Complete Blood Count (CBC)',
      price: '₹300',
      duration: '4-6 hours',
      fasting: 'No',
      description: 'Checks for infections, anemia, and blood disorders',
      category: 'Blood Test'
    },
    {
      name: 'Blood Sugar (Fasting)',
      price: '₹150',
      duration: '2 hours',
      fasting: 'Yes (12 hours)',
      description: 'Measures glucose levels to detect diabetes',
      category: 'Diabetes'
    },
    {
      name: 'Lipid Profile',
      price: '₹500',
      duration: '4-6 hours',
      fasting: 'Yes (12 hours)',
      description: 'Cholesterol and fat levels in blood',
      category: 'Heart Health'
    },
    {
      name: 'Thyroid Function Test',
      price: '₹600',
      duration: '24 hours',
      fasting: 'No',
      description: 'Checks thyroid hormone levels',
      category: 'Hormone'
    }
  ];

  const nearbyLabs = [
    {
      name: 'PathLabs Nabha',
      distance: '2.1 km',
      rating: 4.5,
      phone: '+91-1765-555001',
      timing: '6:00 AM - 10:00 PM',
      homeCollection: true,
      reportDelivery: '24 hours'
    },
    {
      name: 'SRL Diagnostics',
      distance: '3.2 km',
      rating: 4.3,
      phone: '+91-1765-555002',
      timing: '7:00 AM - 9:00 PM',
      homeCollection: true,
      reportDelivery: '12 hours'
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Blood Test': return 'text-destructive';
      case 'Diabetes': return 'text-warning';
      case 'Heart Health': return 'text-primary';
      default: return 'text-accent';
    }
  };

  return (
    <div className="mobile-app-container min-h-screen bg-gradient-to-br from-background to-muted animate-fade-in">
      <Header />
      
      <main className="container mx-auto px-4 py-4 pb-safe max-w-screen-2xl">
        <BackButton />
        
        {/* Header */}
        <div className="mb-6 animate-fade-in animation-delay-200">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 animate-scale-in">
            🧪 Lab Tests
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Book lab tests and get reports delivered at your doorstep
          </p>
        </div>

        {/* Search */}
        <div className="mb-6 animate-fade-in animation-delay-400">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for tests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 mobile-touch-target"
            />
          </div>
        </div>

        {/* Mobile-First Layout */}
        <div className="space-y-6">
          {/* Popular Tests */}
          <div className="animate-fade-in animation-delay-500">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4">Popular Lab Tests</h2>
            <div className="space-y-4">
              {popularTests.map((test, index) => (
                <Card key={index} className="service-card mobile-hover">
                  <CardContent className="p-4 sm:p-6">
                    <div className="space-y-4">
                      {/* Test Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <TestTube className={`h-6 w-6 sm:h-8 sm:w-8 ${getCategoryColor(test.category)} mt-1 flex-shrink-0`} />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-base sm:text-lg mb-1 line-clamp-2">{test.name}</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground mb-2 line-clamp-2">{test.description}</p>
                            <Badge variant="outline" className="text-xs">
                              {test.category}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-lg sm:text-2xl font-bold text-primary">{test.price}</p>
                        </div>
                      </div>
                      
                      {/* Test Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 flex-shrink-0" />
                          <span>Report in {test.duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 flex-shrink-0" />
                          <span>Fasting: {test.fasting}</span>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button className="flex-1 mobile-touch-target mobile-hover">
                          <TestTube className="h-4 w-4 mr-2" />
                          Book Test
                        </Button>
                        <Button variant="outline" className="sm:w-auto mobile-touch-target mobile-hover">
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Nearby Labs - Mobile Optimized */}
          <Card className="animate-fade-in animation-delay-1000">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5" />
                Nearby Labs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {nearbyLabs.map((lab, index) => (
                  <div key={index} className="p-3 sm:p-4 border rounded-lg mobile-hover">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm sm:text-base truncate">{lab.name}</h4>
                        <p className="text-xs text-muted-foreground">{lab.distance} away</p>
                      </div>
                      <Badge variant="outline" className="text-xs flex-shrink-0">★ {lab.rating}</Badge>
                    </div>
                    
                    <div className="text-xs text-muted-foreground space-y-1 mb-3">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{lab.timing}</span>
                      </div>
                      <div>Report in {lab.reportDelivery}</div>
                    </div>
                    
                    <Button size="sm" variant="outline" className="w-full mobile-touch-target">
                      <Phone className="h-3 w-3 mr-1" />
                      Call Lab
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="animate-fade-in animation-delay-1200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Lab Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-bold text-primary">50+</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Available Tests</p>
                </div>
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-bold text-success">6hrs</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Fastest Report</p>
                </div>
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-bold text-accent">95%</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Accuracy Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default LabTests;
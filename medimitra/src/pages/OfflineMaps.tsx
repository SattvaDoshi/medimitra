import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  MapPin, 
  Download, 
  Navigation,
  Wifi,
  WifiOff,
  Hospital,
  Pill,
  Bus,
  AlertTriangle,
  CheckCircle,
  Map
} from 'lucide-react';

const OfflineMaps = () => {
  const { t } = useTranslation();
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  const mapRegions = [
    {
      name: 'Nabha City Center',
      size: '25 MB',
      coverage: '5 km radius',
      hospitals: 3,
      pharmacies: 12,
      downloaded: true,
      lastUpdated: '2024-01-10'
    },
    {
      name: 'Nabha Rural Areas',
      size: '45 MB',
      coverage: '15 km radius',
      hospitals: 5,
      pharmacies: 8,
      downloaded: false,
      lastUpdated: null
    },
    {
      name: 'Patiala-Nabha Highway',
      size: '30 MB',
      coverage: 'Highway route',
      hospitals: 2,
      pharmacies: 6,
      downloaded: true,
      lastUpdated: '2024-01-08'
    },
    {
      name: 'Surrounding Villages',
      size: '80 MB',
      coverage: '173 villages',
      hospitals: 8,
      pharmacies: 25,
      downloaded: false,
      lastUpdated: null
    }
  ];

  const savedRoutes = [
    {
      name: 'Home to Civil Hospital',
      distance: '2.3 km',
      duration: '8 mins',
      type: 'emergency',
      offline: true
    },
    {
      name: 'Home to Apollo Pharmacy',
      distance: '1.2 km',
      duration: '5 mins',
      type: 'pharmacy',
      offline: true
    },
    {
      name: 'Village to PHC',
      distance: '4.5 km',
      duration: '15 mins',
      type: 'healthcare',
      offline: false
    },
    {
      name: 'Bus Stand to Max Hospital',
      distance: '3.1 km',
      duration: '12 mins',
      type: 'transport',
      offline: true
    }
  ];

  const offlineFeatures = [
    {
      name: 'Healthcare Navigation',
      description: 'Find routes to hospitals and clinics',
      icon: Hospital,
      available: true
    },
    {
      name: 'Pharmacy Locator',
      description: 'Locate nearby pharmacies and medical stores',
      icon: Pill,
      available: true
    },
    {
      name: 'Public Transport',
      description: 'Bus stops and auto stands',
      icon: Bus,
      available: true
    },
    {
      name: 'Safe Routes',
      description: 'Avoid flood-prone and bad road areas',
      icon: AlertTriangle,
      available: false
    }
  ];

  const handleDownload = (regionName: string) => {
    setIsDownloading(true);
    setDownloadProgress(0);
    
    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsDownloading(false);
          // Update the region as downloaded
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const getRouteTypeIcon = (type: string) => {
    switch (type) {
      case 'emergency': return Hospital;
      case 'pharmacy': return Pill;
      case 'transport': return Bus;
      default: return MapPin;
    }
  };

  const getRouteTypeColor = (type: string) => {
    switch (type) {
      case 'emergency': return 'text-destructive';
      case 'pharmacy': return 'text-success';
      case 'transport': return 'text-primary';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl-rural font-bold text-foreground mb-4">
            🗺️ Offline Maps & Navigation
          </h1>
          <p className="text-lg text-muted-foreground">
            Download maps for offline use when internet is unavailable
          </p>
        </div>

        {/* Offline Status */}
        <Card className="mb-8 bg-gradient-to-r from-success/10 to-primary/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <WifiOff className="h-5 w-5 text-muted-foreground" />
                  <span className="font-semibold">Offline Mode Available</span>
                </div>
                <Badge className="bg-success/10 text-success">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  3 regions downloaded
                </Badge>
              </div>
              <Button size="sm" variant="outline">
                <Map className="h-4 w-4 mr-2" />
                View Offline Map
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Download Regions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-6 w-6 text-primary" />
                  Download Map Regions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mapRegions.map((region, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{region.name}</h3>
                            {region.downloaded ? (
                              <Badge className="bg-success/10 text-success">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Downloaded
                              </Badge>
                            ) : (
                              <Badge variant="outline">Not Downloaded</Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Size: {region.size}</span>
                            <span>Coverage: {region.coverage}</span>
                            <span>{region.hospitals} hospitals</span>
                            <span>{region.pharmacies} pharmacies</span>
                          </div>
                          
                          {region.lastUpdated && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Last updated: {new Date(region.lastUpdated).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>

                      {isDownloading && !region.downloaded ? (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Downloading...</span>
                            <span>{downloadProgress}%</span>
                          </div>
                          <Progress value={downloadProgress} className="h-2" />
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          {region.downloaded ? (
                            <>
                              <Button size="sm" variant="outline" className="flex-1">
                                <Navigation className="h-4 w-4 mr-2" />
                                Use Offline
                              </Button>
                              <Button size="sm" variant="outline">
                                Update
                              </Button>
                              <Button size="sm" variant="destructive">
                                Delete
                              </Button>
                            </>
                          ) : (
                            <Button 
                              size="sm" 
                              className="flex-1"
                              onClick={() => handleDownload(region.name)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download {region.size}
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Saved Routes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-6 w-6 text-secondary" />
                  Saved Routes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {savedRoutes.map((route, index) => {
                    const RouteIcon = getRouteTypeIcon(route.type);
                    return (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <RouteIcon className={`h-5 w-5 ${getRouteTypeColor(route.type)}`} />
                            <div>
                              <h3 className="font-semibold text-sm">{route.name}</h3>
                              <p className="text-xs text-muted-foreground">
                                {route.distance} • {route.duration}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {route.offline ? (
                              <Badge variant="outline" className="text-xs">
                                <WifiOff className="h-3 w-3 mr-1" />
                                Offline
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs text-muted-foreground">
                                <Wifi className="h-3 w-3 mr-1" />
                                Online Only
                              </Badge>
                            )}
                            <Button size="sm" variant="outline">
                              Navigate
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Offline Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-6 w-6 text-success" />
                  Offline Features Available
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  {offlineFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                      <feature.icon className={`h-6 w-6 mt-1 ${feature.available ? 'text-success' : 'text-muted-foreground'}`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-sm">{feature.name}</h3>
                          {feature.available ? (
                            <CheckCircle className="h-4 w-4 text-success" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Storage Info */}
            <Card>
              <CardHeader>
                <CardTitle>Storage Usage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Maps Storage</span>
                    <span>180 MB / 500 MB</span>
                  </div>
                  <Progress value={36} className="h-2" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-2xl font-bold text-primary">3</p>
                  <p className="text-sm text-muted-foreground">Regions Downloaded</p>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-2xl font-bold text-secondary">8</p>
                  <p className="text-sm text-muted-foreground">Saved Routes</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start">
                  <Navigation className="h-4 w-4 mr-2" />
                  Navigate Offline
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MapPin className="h-4 w-4 mr-2" />
                  Save Current Location
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Download All Regions
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Map className="h-4 w-4 mr-2" />
                  View Offline Map
                </Button>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle>💡 Offline Navigation Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-success">•</span>
                    <span>Download maps before traveling to rural areas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success">•</span>
                    <span>Save important locations like hospitals and pharmacies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success">•</span>
                    <span>Update maps monthly for accurate information</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success">•</span>
                    <span>GPS works offline but location accuracy may vary</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OfflineMaps;
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Users, 
  MessageCircle, 
  AlertTriangle,
  Megaphone,
  Shield,
  TrendingUp,
  Calendar,
  MapPin,
  UserPlus,
  Bell
} from 'lucide-react';

const CommunityHealth = () => {
  const { t } = useTranslation();
  const [selectedGroup, setSelectedGroup] = useState('');

  const healthGroups = [
    {
      id: 1,
      name: 'Nabha Village Health Group',
      members: 245,
      description: 'General health discussion for Nabha residents',
      lastActive: '2 mins ago',
      moderator: 'Dr. Rajesh Kumar',
      category: 'General Health',
      verified: true
    },
    {
      id: 2,
      name: 'Diabetes Support Group',
      members: 89,
      description: 'Support and tips for diabetes management',
      lastActive: '15 mins ago',
      moderator: 'Dr. Priya Sharma',
      category: 'Diabetes',
      verified: true
    },
    {
      id: 3,
      name: 'Maternal Health - Nabha',
      members: 156,
      description: 'Pregnancy and childcare support group',
      lastActive: '1 hour ago',
      moderator: 'ANM Sunita Kaur',
      category: 'Women Health',
      verified: true
    },
    {
      id: 4,
      name: 'Farmer Health Network',
      members: 78,
      description: 'Health tips for agricultural workers',
      lastActive: '3 hours ago',
      moderator: 'ASHA Worker',
      category: 'Occupational Health',
      verified: false
    }
  ];

  const seasonalAlerts = [
    {
      id: 1,
      title: 'Dengue Prevention Alert',
      message: 'Monsoon season: Keep water containers covered. Remove stagnant water around homes.',
      urgency: 'high',
      date: '2024-01-15',
      category: 'Disease Prevention',
      affected: '173 villages'
    },
    {
      id: 2,
      title: 'Heat Wave Warning',
      message: 'Temperature expected to reach 45°C. Stay hydrated, avoid outdoor activities 11 AM - 4 PM.',
      urgency: 'medium',
      date: '2024-01-14',
      category: 'Weather Health',
      affected: 'Nabha region'
    },
    {
      id: 3,
      title: 'Vaccination Drive',
      message: 'Free COVID booster shots available at Civil Hospital. No appointment needed.',
      urgency: 'low',
      date: '2024-01-13',
      category: 'Vaccination',
      affected: 'All ages'
    }
  ];

  const ashaWorkers = [
    {
      name: 'Paramjit Kaur',
      area: 'Nabha Central',
      households: 150,
      phone: '+91-98765-43210',
      speciality: 'Maternal Health'
    },
    {
      name: 'Gurpreet Singh',
      area: 'Nabha Rural',
      households: 200,
      phone: '+91-98765-43211',
      speciality: 'Vaccination'
    },
    {
      name: 'Manjit Kaur',
      area: 'Surrounding Villages',
      households: 180,
      phone: '+91-98765-43212',
      speciality: 'Child Health'
    }
  ];

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'border-destructive text-destructive bg-destructive/10';
      case 'medium': return 'border-warning text-warning bg-warning/10';
      default: return 'border-success text-success bg-success/10';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'high': return AlertTriangle;
      case 'medium': return Megaphone;
      default: return Bell;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl-rural font-bold text-foreground mb-4">
            🧑‍🤝‍🧑 Community Health
          </h1>
          <p className="text-lg text-muted-foreground">
            Connect with your community for better health outcomes
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Seasonal Health Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-6 w-6 text-warning" />
                  Health Alerts & Announcements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {seasonalAlerts.map((alert) => {
                    const UrgencyIcon = getUrgencyIcon(alert.urgency);
                    return (
                      <div 
                        key={alert.id} 
                        className={`p-4 rounded-lg border-l-4 ${getUrgencyColor(alert.urgency)}`}
                      >
                        <div className="flex items-start gap-3">
                          <UrgencyIcon className="h-5 w-5 mt-1" />
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1">{alert.title}</h3>
                            <p className="text-sm mb-2">{alert.message}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Badge variant="outline" className="text-xs">
                                {alert.category}
                              </Badge>
                              <span>•</span>
                              <span>{alert.affected}</span>
                              <span>•</span>
                              <span>{new Date(alert.date).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Health Groups */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="h-6 w-6 text-primary" />
                    Village Health Groups
                  </span>
                  <Button size="sm">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Join Group
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {healthGroups.map((group) => (
                    <div 
                      key={group.id} 
                      className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setSelectedGroup(group.name)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{group.name}</h3>
                            {group.verified && (
                              <Shield className="h-4 w-4 text-success" />
                            )}
                            <Badge variant="outline" className="text-xs">
                              {group.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{group.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {group.members} members
                            </span>
                            <span>Moderator: {group.moderator}</span>
                            <span>Active: {group.lastActive}</span>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Join Chat
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* ASHA Workers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-6 w-6 text-secondary" />
                  Community Health Workers (ASHA)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-1">
                  {ashaWorkers.map((worker, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-secondary text-secondary-foreground">
                            {worker.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{worker.name}</h3>
                          <p className="text-sm text-muted-foreground">{worker.area}</p>
                          <p className="text-xs text-muted-foreground">
                            {worker.households} households • {worker.speciality}
                          </p>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.open(`tel:${worker.phone}`, '_self')}
                      >
                        Contact
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Health Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-accent" />
                  Community Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">568</p>
                  <p className="text-sm text-muted-foreground">Active Members</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-secondary">12</p>
                  <p className="text-sm text-muted-foreground">Health Groups</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-accent">89%</p>
                  <p className="text-sm text-muted-foreground">Vaccination Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-success">45</p>
                  <p className="text-sm text-muted-foreground">Health Tips Shared</p>
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
                  <Megaphone className="h-4 w-4 mr-2" />
                  Report Health Issue
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Health Camp Schedule
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MapPin className="h-4 w-4 mr-2" />
                  Find ASHA Worker
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Bell className="h-4 w-4 mr-2" />
                  Subscribe to Alerts
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div>
                      <p><strong>Dr. Kumar</strong> shared dengue prevention tips</p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-secondary rounded-full mt-2"></div>
                    <div>
                      <p><strong>ASHA Paramjit</strong> updated vaccination schedule</p>
                      <p className="text-xs text-muted-foreground">5 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                    <div>
                      <p>New health camp announced for next week</p>
                      <p className="text-xs text-muted-foreground">1 day ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CommunityHealth;
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Header } from '@/components/layout/header';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Download, 
  Upload, 
  QrCode, 
  Calendar, 
  User,
  Pill,
  TestTube,
  Syringe
} from 'lucide-react';

const HealthRecords = () => {
  const { t } = useTranslation();

  const records = [
    {
      id: 1,
      date: '2024-01-15',
      doctor: 'Dr. Rajesh Kumar',
      diagnosis: 'Fever & Cold',
      type: 'consultation',
      status: 'completed'
    },
    {
      id: 2,
      date: '2024-01-10',
      doctor: 'Dr. Priya Sharma',
      diagnosis: 'Regular Checkup',
      type: 'checkup',
      status: 'completed'
    },
    {
      id: 3,
      date: '2024-01-05',
      doctor: 'Lab Technician',
      diagnosis: 'Blood Test Report',
      type: 'lab',
      status: 'completed'
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lab': return TestTube;
      case 'checkup': return User;
      case 'vaccination': return Syringe;
      default: return FileText;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'lab': return 'text-accent';
      case 'checkup': return 'text-secondary';
      case 'vaccination': return 'text-success';
      default: return 'text-primary';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted animate-fade-in">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <BackButton />
        
        {/* Header */}
        <div className="mb-8 animate-fade-in animation-delay-200">
          <h1 className="text-3xl-rural font-bold text-foreground mb-4 animate-scale-in">
            {t('health.records')}
          </h1>
          
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-4 mb-6">
            <Button className="gap-2 hover-scale">
              <Upload className="h-4 w-4" />
              {t('common.upload')} Report
            </Button>
            <Button variant="outline" className="gap-2 hover-scale">
              <QrCode className="h-4 w-4" />
              Digital Health Card
            </Button>
            <Button variant="outline" className="gap-2 hover-scale">
              <Download className="h-4 w-4" />
              Export All
            </Button>
          </div>
        </div>

        {/* Digital Health Card */}
        <Card className="mb-8 bg-gradient-primary text-primary-foreground">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Digital Health Card</span>
              <QrCode className="h-8 w-8" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm opacity-80">Patient Name</p>
                <p className="font-semibold">Gurpreet Singh</p>
              </div>
              <div>
                <p className="text-sm opacity-80">ID Number</p>
                <p className="font-semibold">RHC-2024-001</p>
              </div>
              <div>
                <p className="text-sm opacity-80">Blood Group</p>
                <p className="font-semibold">B+</p>
              </div>
              <div>
                <p className="text-sm opacity-80">Emergency Contact</p>
                <p className="font-semibold">+91 98765 43210</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Records List */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">Recent Records</h2>
          <div className="space-y-4">
            {records.map((record) => {
              const TypeIcon = getTypeIcon(record.type);
              return (
                <Card key={record.id} className="service-card">
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex items-center gap-4">
                      <TypeIcon className={`h-8 w-8 ${getTypeColor(record.type)}`} />
                      <div>
                        <h3 className="font-semibold text-lg">{record.diagnosis}</h3>
                        <p className="text-muted-foreground">Dr. {record.doctor}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(record.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        {t('common.view')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Categories */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="service-card text-center">
            <CardContent className="p-6">
              <FileText className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-2">{t('health.prescriptions')}</h3>
              <p className="text-2xl font-bold text-primary">12</p>
            </CardContent>
          </Card>
          
          <Card className="service-card text-center">
            <CardContent className="p-6">
              <TestTube className="h-8 w-8 mx-auto mb-3 text-accent" />
              <h3 className="font-semibold mb-2">{t('health.reports')}</h3>
              <p className="text-2xl font-bold text-accent">8</p>
            </CardContent>
          </Card>
          
          <Card className="service-card text-center">
            <CardContent className="p-6">
              <Syringe className="h-8 w-8 mx-auto mb-3 text-success" />
              <h3 className="font-semibold mb-2">{t('health.vaccinations')}</h3>
              <p className="text-2xl font-bold text-success">5</p>
            </CardContent>
          </Card>
          
          <Card className="service-card text-center">
            <CardContent className="p-6">
              <User className="h-8 w-8 mx-auto mb-3 text-secondary" />
              <h3 className="font-semibold mb-2">Consultations</h3>
              <p className="text-2xl font-bold text-secondary">15</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default HealthRecords;
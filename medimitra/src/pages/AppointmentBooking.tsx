import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Header } from '@/components/layout/header';
import { BackButton } from '@/components/ui/back-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Stethoscope,
  CheckCircle,
  MapPin,
  Phone
} from 'lucide-react';

const AppointmentBooking = () => {
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');

  const doctors = [
    {
      id: 1,
      name: 'Dr. Rajesh Kumar',
      specialty: 'General Medicine',
      hospital: 'Civil Hospital Nabha',
      rating: 4.5,
      experience: '15 years',
      nextAvailable: 'Today 2:00 PM',
      fee: 'Free (Govt)',
      image: '/placeholder-doctor.jpg'
    },
    {
      id: 2,
      name: 'Dr. Priya Sharma',
      specialty: 'Pediatrics',
      hospital: 'Max Healthcare',
      rating: 4.8,
      experience: '12 years',
      nextAvailable: 'Tomorrow 10:00 AM',
      fee: '₹500',
      image: '/placeholder-doctor.jpg'
    },
    {
      id: 3,
      name: 'Dr. Amit Singh',
      specialty: 'Cardiology',
      hospital: 'Apollo Clinic',
      rating: 4.7,
      experience: '20 years',
      nextAvailable: 'Today 4:00 PM',
      fee: '₹800',
      image: '/placeholder-doctor.jpg'
    }
  ];

  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
    '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
    '05:00 PM', '05:30 PM'
  ];

  const bookedSlots = ['10:00 AM', '02:00 PM', '04:00 PM'];

  const handleBookAppointment = () => {
    if (selectedDoctor && selectedDate && selectedTime) {
      alert(`Appointment booked successfully!\nDoctor: ${selectedDoctor}\nDate: ${selectedDate.toLocaleDateString()}\nTime: ${selectedTime}`);
    } else {
      alert('Please select doctor, date and time');
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
            📅 Book Appointment
          </h1>
          <p className="text-lg text-muted-foreground">
            Schedule your consultation with available doctors
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Doctor Selection */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-2xl font-semibold mb-4">Select Doctor</h2>
            {doctors.map((doctor) => (
              <Card 
                key={doctor.id} 
                className={`cursor-pointer transition-all ${
                  selectedDoctor === doctor.name ? 'ring-2 ring-primary bg-primary/5' : 'service-card'
                }`}
                onClick={() => setSelectedDoctor(doctor.name)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center">
                      <User className="h-8 w-8 text-primary-foreground" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-lg">{doctor.name}</h3>
                          <p className="text-primary font-medium">{doctor.specialty}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {doctor.hospital}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant={doctor.fee === 'Free (Govt)' ? 'secondary' : 'outline'}>
                            {doctor.fee}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span>⭐ {doctor.rating} rating</span>
                        <span>{doctor.experience} experience</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">
                          <Clock className="h-4 w-4 inline mr-1" />
                          Next available: <strong>{doctor.nextAvailable}</strong>
                        </span>
                        <Button 
                          size="sm"
                          variant={selectedDoctor === doctor.name ? 'default' : 'outline'}
                        >
                          {selectedDoctor === doctor.name ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Selected
                            </>
                          ) : (
                            'Select'
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Date & Time Selection */}
          <div className="space-y-6">
            {/* Calendar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Select Date
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date()}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            {/* Time Slots */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Select Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {timeSlots.map((time) => {
                    const isBooked = bookedSlots.includes(time);
                    const isSelected = selectedTime === time;
                    
                    return (
                      <Button
                        key={time}
                        variant={isSelected ? 'default' : 'outline'}
                        size="sm"
                        disabled={isBooked}
                        onClick={() => setSelectedTime(time)}
                        className={isBooked ? 'opacity-50' : ''}
                      >
                        {time}
                        {isBooked && ' (Booked)'}
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Patient Details */}
            <Card>
              <CardHeader>
                <CardTitle>Patient Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input placeholder="Full Name" />
                <Input placeholder="Phone Number" type="tel" />
                <Input placeholder="Age" type="number" />
                <Input placeholder="Reason for visit" />
              </CardContent>
            </Card>

            {/* Book Button */}
            <Button 
              className="w-full" 
              size="lg"
              onClick={handleBookAppointment}
              disabled={!selectedDoctor || !selectedDate || !selectedTime}
            >
              <Stethoscope className="h-5 w-5 mr-2" />
              Book Appointment
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid gap-4 sm:grid-cols-4">
          <Card className="service-card text-center">
            <CardContent className="p-6">
              <CalendarIcon className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-2">50+</h3>
              <p className="text-sm text-muted-foreground">Appointments Today</p>
            </CardContent>
          </Card>
          
          <Card className="service-card text-center">
            <CardContent className="p-6">
              <User className="h-8 w-8 mx-auto mb-3 text-secondary" />
              <h3 className="font-semibold mb-2">15</h3>
              <p className="text-sm text-muted-foreground">Doctors Available</p>
            </CardContent>
          </Card>
          
          <Card className="service-card text-center">
            <CardContent className="p-6">
              <Clock className="h-8 w-8 mx-auto mb-3 text-accent" />
              <h3 className="font-semibold mb-2">5min</h3>
              <p className="text-sm text-muted-foreground">Avg Booking Time</p>
            </CardContent>
          </Card>

          <Card className="service-card text-center">
            <CardContent className="p-6">
              <CheckCircle className="h-8 w-8 mx-auto mb-3 text-success" />
              <h3 className="font-semibold mb-2">95%</h3>
              <p className="text-sm text-muted-foreground">Success Rate</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AppointmentBooking;
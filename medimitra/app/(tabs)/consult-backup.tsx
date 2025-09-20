import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Video, 
  Phone, 
  MessageCircle, 
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Users
} from 'lucide-react-native';
import { useTranslation } from '../../src/contexts/TranslationContext';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';

const consultationTypes = [
  {
    id: 'video',
    icon: Video,
    color: '#2563EB',
    price: '₹500',
    duration: '30 min',
  },
  {
    id: 'voice',
    icon: Phone,
    color: '#059669',
    price: '₹300',
    duration: '20 min',
  },
  {
    id: 'chat',
    icon: MessageCircle,
    color: '#7c3aed',
    price: '₹200',
    duration: '24 hrs',
  },
];

const upcomingConsultations = [
  {
    id: '1',
    doctorName: 'Dr. Rajesh Sharma',
    specialty: 'General Medicine',
    date: 'Today',
    time: '3:00 PM',
    type: 'Video',
    status: 'confirmed',
  },
  {
    id: '2',
    doctorName: 'Dr. Priya Patel',
    specialty: 'Pediatrics',
    date: 'Tomorrow',
    time: '10:30 AM',
    type: 'Voice',
    status: 'confirmed',
  },
];

export default function ConsultScreen() {
  const { t } = useTranslation();

  const navigateTo = (route: string) => {
    router.push(route as any);
  };

  const goBack = () => {
    router.back();
  };

  const startConsultation = (consultationId: string, type: string) => {
    if (type.toLowerCase() === 'video') {
      // Navigate to consult tab with video parameter
      router.push(`/consult?type=video&id=${consultationId}`);
    } else {
      // Navigate to consult tab with call parameter
      router.push('/consult?type=call');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2563EB" />
      
      {/* Header */}
      <LinearGradient
        colors={['#2563EB', '#1d4ed8']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={goBack}>
            <ChevronLeft size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('consult')}</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Consultation Types */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Start New Consultation</Text>
          <View style={styles.typesGrid}>
            {consultationTypes.map((type, index) => {
              const IconComponent = type.icon;
              return (
                <Animated.View
                  key={type.id}
                  entering={FadeInRight.delay(200 + index * 100)}
                >
                  <TouchableOpacity
                    style={styles.typeCard}
                    onPress={() => navigateTo(`/doctor/select?type=${type.id}`)}
                  >
                    <View style={[styles.typeIcon, { backgroundColor: `${type.color}20` }]}>
                      <IconComponent size={28} color={type.color} />
                    </View>
                    <Text style={styles.typeName}>{type.id.charAt(0).toUpperCase() + type.id.slice(1)}</Text>
                    <Text style={styles.typePrice}>{type.price}</Text>
                    <Text style={styles.typeDuration}>{type.duration}</Text>
                    <View style={styles.typeFooter}>
                      <Text style={styles.selectText}>Select</Text>
                      <ChevronRight size={16} color="#2563EB" />
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        </View>

        {/* Quick Access */}
        <Animated.View 
          entering={FadeInDown.delay(500)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.quickAccessGrid}>
            <TouchableOpacity style={styles.quickCard}>
              <Calendar size={24} color="#2563EB" />
              <Text style={styles.quickText}>Book Appointment</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickCard} onPress={() => navigateTo('/consult/call')}>
              <Phone size={24} color="#059669" />
              <Text style={styles.quickText}>Emergency Call</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickCard}>
              <Users size={24} color="#7c3aed" />
              <Text style={styles.quickText}>Group Session</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickCard}>
              <Clock size={24} color="#ea580c" />
              <Text style={styles.quickText}>History</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Upcoming Consultations */}
        <Animated.View 
          entering={FadeInDown.delay(700)}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('upcomingAppointments')}</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>{t('viewAll')}</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.consultationsList}>
            {upcomingConsultations.map((consultation, index) => (
              <Animated.View
                key={consultation.id}
                entering={FadeInDown.delay(800 + index * 100)}
              >
                <View style={styles.consultationCard}>
                  <View style={styles.consultationHeader}>
                    <View style={styles.doctorInfo}>
                      <Text style={styles.doctorName}>{consultation.doctorName}</Text>
                      <Text style={styles.specialty}>{consultation.specialty}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: '#10b98120' }]}>
                      <Text style={[styles.statusText, { color: '#059669' }]}>
                        {consultation.status}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.consultationDetails}>
                    <View style={styles.timeInfo}>
                      <Calendar size={16} color="#6b7280" />
                      <Text style={styles.dateTime}>{consultation.date} • {consultation.time}</Text>
                    </View>
                    <View style={styles.typeInfo}>
                      <Video size={16} color="#2563EB" />
                      <Text style={styles.consultationType}>{consultation.type} Call</Text>
                    </View>
                  </View>
                  
                  <View style={styles.consultationActions}>
                    <TouchableOpacity 
                      style={styles.joinButton}
                      onPress={() => startConsultation(consultation.id, consultation.type)}
                    >
                      <Text style={styles.joinButtonText}>Join Now</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.rescheduleButton}>
                      <Text style={styles.rescheduleText}>Reschedule</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Health Tips */}
        <Animated.View 
          entering={FadeInDown.delay(1000)}
          style={styles.tipsSection}
        >
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>💡 Consultation Tips</Text>
            <Text style={styles.tipText}>
              • Prepare your symptoms list beforehand{'\n'}
              • Keep your medical history ready{'\n'}
              • Test your internet connection{'\n'}
              • Find a quiet, well-lit space
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    fontFamily: 'Inter-Bold',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
    fontFamily: 'Inter-Bold',
  },
  viewAllText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  typesGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  typeCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  typeIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
    fontFamily: 'Inter-SemiBold',
  },
  typePrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2563EB',
    marginBottom: 2,
    fontFamily: 'Inter-Bold',
  },
  typeDuration: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 12,
    fontFamily: 'Inter-Regular',
  },
  typeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  selectText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickCard: {
    width: '47%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  quickText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    fontFamily: 'Inter-SemiBold',
  },
  consultationsList: {
    gap: 12,
  },
  consultationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  consultationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
    fontFamily: 'Inter-Bold',
  },
  specialty: {
    fontSize: 14,
    color: '#6b7280',
    fontFamily: 'Inter-Regular',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
    fontFamily: 'Inter-SemiBold',
  },
  consultationDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateTime: {
    fontSize: 14,
    color: '#6b7280',
    fontFamily: 'Inter-Regular',
  },
  typeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  consultationType: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  consultationActions: {
    flexDirection: 'row',
    gap: 12,
  },
  joinButton: {
    flex: 1,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    fontFamily: 'Inter-SemiBold',
  },
  rescheduleButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  rescheduleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    fontFamily: 'Inter-SemiBold',
  },
  tipsSection: {
    marginBottom: 20,
  },
  tipCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400e',
    marginBottom: 8,
    fontFamily: 'Inter-Bold',
  },
  tipText: {
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20,
    fontFamily: 'Inter-Regular',
  },
});
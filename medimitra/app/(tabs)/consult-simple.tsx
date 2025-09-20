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

export default function ConsultScreen() {
  const { t } = useTranslation();

  const navigateTo = (route: string) => {
    router.push(route as any);
  };

  const goBack = () => {
    router.back();
  };

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <ChevronLeft size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('consult.title')}</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>{t('consult.welcome')}</Text>
          <Text style={styles.welcomeSubtitle}>{t('consult.description')}</Text>
        </View>

        {/* Consultation Types */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('consult.types.title')}</Text>
          <View style={styles.typeGrid}>
            {consultationTypes.map((type, index) => {
              const IconComponent = type.icon;
              return (
                <View
                  key={type.id}
                  style={[styles.typeCard, { borderColor: type.color }]}
                >
                  <TouchableOpacity
                    style={styles.typeContent}
                    onPress={() => navigateTo(`/consult/${type.id}`)}
                  >
                    <View style={[styles.iconContainer, { backgroundColor: type.color }]}>
                      <IconComponent size={32} color="white" />
                    </View>
                    <Text style={styles.typeName}>{t(`consult.types.${type.id}`)}</Text>
                    <Text style={styles.typePrice}>{type.price}</Text>
                    <Text style={styles.typeDuration}>{type.duration}</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('consult.quickActions')}</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionCard}>
              <Calendar size={24} color="#667eea" />
              <Text style={styles.actionText}>{t('consult.schedule')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Clock size={24} color="#667eea" />
              <Text style={styles.actionText}>{t('consult.emergency')}</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  placeholder: {
    width: 40,
  },
  welcomeSection: {
    marginBottom: 30,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  typeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    borderWidth: 2,
    width: '48%',
    marginBottom: 15,
  },
  typeContent: {
    padding: 20,
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  typePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4ade80',
    marginBottom: 2,
  },
  typeDuration: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    width: '48%',
  },
  actionText: {
    fontSize: 14,
    color: 'white',
    marginTop: 8,
    textAlign: 'center',
  },
});
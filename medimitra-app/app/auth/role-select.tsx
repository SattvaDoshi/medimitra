import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, User, Heart, Stethoscope } from 'lucide-react-native';
import { useTranslation } from '../../src/contexts/TranslationContext';
import { useDispatch } from 'react-redux';
import { updateUser } from '../../src/store/slices/authSlice';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const roles = [
  {
    key: 'patient',
    icon: User,
    color: '#10b981',
    description: 'Access healthcare services and consultations',
  },
  {
    key: 'asha',
    icon: Heart,
    color: '#f59e0b',
    description: 'Manage community health and patient records',
  },
  {
    key: 'doctor',
    icon: Stethoscope,
    color: '#2563EB',
    description: 'Provide consultations and medical advice',
  },
];

export default function RoleSelectScreen() {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const handleRoleSelect = (role: string) => {
    dispatch(updateUser({ role: role as 'patient' | 'asha' | 'doctor' }));
    
    if (role === 'asha') {
      // Navigate to main dashboard for ASHA workers
      router.replace('/');
    } else {
      router.replace('/(tabs)');
    }
  };

  const goBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#2563EB', '#1d4ed8']}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <ChevronLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        
        <Animated.View entering={FadeInUp.delay(200)}>
          <Text style={styles.title}>{t('selectRole')}</Text>
          <Text style={styles.subtitle}>Choose how you want to use MediMitra</Text>
        </Animated.View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {roles.map((role, index) => {
          const IconComponent = role.icon;
          return (
            <Animated.View
              key={role.key}
              entering={FadeInDown.delay(400 + index * 100)}
            >
              <TouchableOpacity
                style={styles.roleCard}
                onPress={() => handleRoleSelect(role.key)}
              >
                <View style={[styles.iconContainer, { backgroundColor: `${role.color}20` }]}>
                  <IconComponent size={32} color={role.color} />
                </View>
                
                <View style={styles.roleContent}>
                  <Text style={styles.roleTitle}>{t(role.key)}</Text>
                  <Text style={styles.roleDescription}>{role.description}</Text>
                </View>
                
                <View style={styles.arrow}>
                  <ChevronLeft size={20} color="#6b7280" style={{ transform: [{ rotate: '180deg' }] }} />
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
    marginTop: 40,
    fontFamily: 'Inter-Bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#e0e7ff',
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  roleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  roleContent: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
    fontFamily: 'Inter-SemiBold',
  },
  roleDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    fontFamily: 'Inter-Regular',
  },
  arrow: {
    padding: 8,
  },
});
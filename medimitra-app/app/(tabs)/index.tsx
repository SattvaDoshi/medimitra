import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Stethoscope, 
  Pill, 
  FileText, 
  Brain, 
  Hospital, 
  Navigation,
  QrCode,
  Bell,
  User,
  ChevronRight
} from 'lucide-react-native';
import { useTranslation } from '../../src/contexts/TranslationContext';
import { useSelector } from 'react-redux';
import { RootState } from '../../src/store/store';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';

const quickActions = [
  {
    key: 'consult',
    icon: Stethoscope,
    route: '/consult',
    color: '#2563EB',
  },
  {
    key: 'medicine',
    icon: Pill,
    route: '/medicine',
    color: '#059669',
  },
  {
    key: 'community',
    icon: FileText,
    route: '/community',
    color: '#7c3aed',
  },
  {
    key: 'more',
    icon: Brain,
    route: '/more',
    color: '#dc2626',
  },
];

export default function HomeScreen() {
  const { t } = useTranslation();
  const { user } = useSelector((state: RootState) => state.auth);

  const navigateTo = (route: string) => {
    router.push(route as any);
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
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>{t('welcome')}</Text>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.notificationButton}>
              <Bell size={24} color="#ffffff" />
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>3</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.profileButton}>
              <User size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* QR Digital Health Card */}
        <Animated.View 
          entering={FadeInDown.delay(200)}
          style={styles.qrCard}
        >
          <View style={styles.qrCardContent}>
            <View style={styles.qrInfo}>
              <Text style={styles.qrTitle}>Digital Health Card</Text>
              <Text style={styles.qrSubtitle}>Scan for instant access to your records</Text>
            </View>
            <TouchableOpacity style={styles.qrButton}>
              <QrCode size={32} color="#2563EB" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </LinearGradient>

      {/* Main Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <Animated.View
                  key={action.key}
                  entering={FadeInRight.delay(300 + index * 100)}
                >
                  <TouchableOpacity
                    style={styles.actionCard}
                    onPress={() => navigateTo(action.route)}
                  >
                    <View style={[styles.actionIcon, { backgroundColor: `${action.color}20` }]}>
                      <IconComponent size={28} color={action.color} />
                    </View>
                    <Text style={styles.actionText}>{t(action.key)}</Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        </View>

        {/* Health Stats */}
        <Animated.View 
          entering={FadeInDown.delay(800)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Health Overview</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>8</Text>
              <Text style={styles.statLabel}>Consultations</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Prescriptions</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>3</Text>
              <Text style={styles.statLabel}>Reminders</Text>
            </View>
          </View>
        </Animated.View>

        {/* Recent Activity */}
        <Animated.View 
          entering={FadeInDown.delay(1000)}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>{t('viewAll')}</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.activityList}>
            <TouchableOpacity style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Stethoscope size={20} color="#2563EB" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Video consultation with Dr. Sharma</Text>
                <Text style={styles.activityTime}>2 hours ago</Text>
              </View>
              <ChevronRight size={16} color="#9ca3af" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Pill size={20} color="#059669" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Medicine delivery completed</Text>
                <Text style={styles.activityTime}>1 day ago</Text>
              </View>
              <ChevronRight size={16} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Emergency Contact */}
        <Animated.View 
          entering={FadeInDown.delay(1200)}
          style={styles.emergencySection}
        >
          <TouchableOpacity style={styles.emergencyButton}>
            <Text style={styles.emergencyText}>🚨 Emergency Helpline</Text>
            <Text style={styles.emergencyNumber}>Call 108</Text>
          </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: '#e0e7ff',
    fontFamily: 'Inter-Regular',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    fontFamily: 'Inter-Bold',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
    fontFamily: 'Inter-SemiBold',
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
  },
  qrCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  qrInfo: {
    flex: 1,
  },
  qrTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
    fontFamily: 'Inter-SemiBold',
  },
  qrSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'Inter-Regular',
  },
  qrButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
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
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '47%',
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
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    fontFamily: 'Inter-SemiBold',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2563EB',
    marginBottom: 4,
    fontFamily: 'Inter-Bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'Inter-Regular',
  },
  activityList: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
    fontFamily: 'Inter-SemiBold',
  },
  activityTime: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'Inter-Regular',
  },
  emergencySection: {
    marginBottom: 20,
  },
  emergencyButton: {
    backgroundColor: '#dc2626',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#dc2626',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  emergencyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
    fontFamily: 'Inter-Bold',
  },
  emergencyNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    fontFamily: 'Inter-Bold',
  },
});
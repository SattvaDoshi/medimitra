import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight, Globe, Users, Stethoscope } from 'lucide-react-native';
import { useTranslation } from '../src/contexts/TranslationContext';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
];

export default function OnboardingScreen() {
  const { language, setLanguage, t } = useTranslation();
  const [farmerMode, setFarmerMode] = useState(false);

  const handleContinue = () => {
    router.replace('/auth/login');
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#2563EB', '#1d4ed8']}
        style={styles.header}
      >
        <Animated.View entering={FadeInUp.delay(200)}>
          <Text style={styles.title}>MediMitra</Text>
          <Text style={styles.subtitle}>{t('welcomeSubtitle')}</Text>
        </Animated.View>
      </LinearGradient>

      <View style={styles.content}>
        <Animated.View entering={FadeInDown.delay(400)}>
          <View style={styles.section}>
            <Globe size={24} color="#2563EB" />
            <Text style={styles.sectionTitle}>{t('chooseLanguage')}</Text>
          </View>

          <View style={styles.languageGrid}>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageCard,
                  language === lang.code && styles.selectedLanguage,
                ]}
                onPress={() => setLanguage(lang.code)}
              >
                <Text style={[
                  styles.languageName,
                  language === lang.code && styles.selectedLanguageText,
                ]}>
                  {lang.nativeName}
                </Text>
                <Text style={[
                  styles.languageCode,
                  language === lang.code && styles.selectedLanguageText,
                ]}>
                  {lang.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(600)}>
          <View style={styles.section}>
            <Users size={24} color="#2563EB" />
            <Text style={styles.sectionTitle}>{t('farmerMode')}</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.toggleCard,
              farmerMode && styles.toggleCardActive,
            ]}
            onPress={() => setFarmerMode(!farmerMode)}
          >
            <View>
              <Text style={[
                styles.toggleTitle,
                farmerMode && styles.toggleTitleActive,
              ]}>
                {t('enableFarmerMode')}
              </Text>
              <Text style={[
                styles.toggleDescription,
                farmerMode && styles.toggleDescriptionActive,
              ]}>
                {t('farmerModeDescription')}
              </Text>
            </View>
            <View style={[
              styles.toggle,
              farmerMode && styles.toggleActive,
            ]}>
              <View style={[
                styles.toggleIndicator,
                farmerMode && styles.toggleIndicatorActive,
              ]} />
            </View>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(800)}>
          <View style={styles.featuresSection}>
            <View style={styles.featureItem}>
              <Stethoscope size={20} color="#10b981" />
              <Text style={styles.featureText}>{t('feature1')}</Text>
            </View>
            <View style={styles.featureItem}>
              <Globe size={20} color="#10b981" />
              <Text style={styles.featureText}>{t('feature2')}</Text>
            </View>
            <View style={styles.featureItem}>
              <Users size={20} color="#10b981" />
              <Text style={styles.featureText}>{t('feature3')}</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(1000)}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
          >
            <Text style={styles.continueText}>{t('continue')}</Text>
            <ChevronRight size={20} color="#ffffff" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Inter-Bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#e0e7ff',
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
  content: {
    padding: 24,
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 12,
    fontFamily: 'Inter-SemiBold',
  },
  languageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  languageCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  selectedLanguage: {
    backgroundColor: '#eff6ff',
    borderColor: '#2563EB',
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
    fontFamily: 'Inter-SemiBold',
  },
  selectedLanguageText: {
    color: '#2563EB',
  },
  languageCode: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'Inter-Regular',
  },
  toggleCard: {
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  toggleCardActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#2563EB',
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
    fontFamily: 'Inter-SemiBold',
  },
  toggleTitleActive: {
    color: '#2563EB',
  },
  toggleDescription: {
    fontSize: 14,
    color: '#6b7280',
    fontFamily: 'Inter-Regular',
  },
  toggleDescriptionActive: {
    color: '#1e40af',
  },
  toggle: {
    width: 48,
    height: 28,
    backgroundColor: '#d1d5db',
    borderRadius: 14,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: '#2563EB',
  },
  toggleIndicator: {
    width: 24,
    height: 24,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    transform: [{ translateX: 0 }],
  },
  toggleIndicatorActive: {
    transform: [{ translateX: 18 }],
  },
  featuresSection: {
    marginTop: 32,
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 14,
    color: '#1f2937',
    marginLeft: 12,
    fontFamily: 'Inter-Regular',
  },
  continueButton: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 32,
    gap: 8,
  },
  continueText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    fontFamily: 'Inter-SemiBold',
  },
});
import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft } from 'lucide-react-native';
import { useTranslation } from '../../src/contexts/TranslationContext';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../src/store/slices/authSlice';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function OtpScreen() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const { phone } = useLocalSearchParams();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const inputRefs = useRef<TextInput[]>([]);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      Alert.alert('Error', 'Please enter complete 6-digit OTP');
      return;
    }

    setLoading(true);
    
    // Mock API call
    setTimeout(() => {
      setLoading(false);
      
      // Mock login success
      dispatch(loginSuccess({
        user: {
          id: '1',
          phone: phone as string,
          role: 'patient',
          name: 'Kamal Mishra'
        },
        token: 'mock-token'
      }));

      router.replace('/auth/role-select');
    }, 1500);
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
          <Text style={styles.title}>{t('verifyOtp')}</Text>
          <Text style={styles.subtitle}>
            Sent to +91 {phone}
          </Text>
        </Animated.View>
      </LinearGradient>

      <View style={styles.content}>
        <Animated.View entering={FadeInDown.delay(400)}>
          <Text style={styles.label}>{t('enterOtp')}</Text>
          
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  if (ref) inputRefs.current[index] = ref;
                }}
                style={[
                  styles.otpInput,
                  digit && styles.otpInputFilled
                ]}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                keyboardType="number-pad"
                maxLength={1}
                textAlign="center"
              />
            ))}
          </View>

          <TouchableOpacity
            style={[styles.verifyButton, loading && styles.verifyButtonDisabled]}
            onPress={handleVerify}
            disabled={loading}
          >
            <Text style={styles.verifyButtonText}>
              {loading ? 'Verifying...' : t('verify')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.resendButton}>
            <Text style={styles.resendText}>Didn't receive OTP? Resend</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
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
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 24,
    textAlign: 'center',
    fontFamily: 'Inter-SemiBold',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  otpInput: {
    width: 48,
    height: 56,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    fontFamily: 'Inter-SemiBold',
  },
  otpInputFilled: {
    borderColor: '#2563EB',
    backgroundColor: '#eff6ff',
  },
  verifyButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    fontFamily: 'Inter-SemiBold',
  },
  resendButton: {
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    color: '#2563EB',
    fontFamily: 'Inter-Regular',
  },
});
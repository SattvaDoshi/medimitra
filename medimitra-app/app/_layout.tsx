import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { PaperProvider } from 'react-native-paper';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { store } from '../src/store/store';
import { TranslationProvider } from '../src/contexts/TranslationContext';
import { useFonts } from 'expo-font';
import { 
  Inter_400Regular, 
  Inter_600SemiBold, 
  Inter_700Bold 
} from '@expo-google-fonts/inter';
import {
  NotoSansDevanagari_400Regular,
  NotoSansDevanagari_600SemiBold,
} from '@expo-google-fonts/noto-sans-devanagari';

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
    'NotoSans-Regular': NotoSansDevanagari_400Regular,
    'NotoSans-SemiBold': NotoSansDevanagari_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <TranslationProvider>
        <PaperProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </PaperProvider>
      </TranslationProvider>
    </Provider>
  );
}
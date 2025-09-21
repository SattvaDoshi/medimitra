import { Tabs } from 'expo-router';
import { Chrome as Home, Stethoscope, Pill, Users, MoveHorizontal as MoreHorizontal } from 'lucide-react-native';
import { useTranslation } from '../../src/contexts/TranslationContext';

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e5e7eb',
          height: 80,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#6b7280',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('home'),
          tabBarIcon: ({ size, color }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="consult"
        options={{
          title: t('consult'),
          tabBarIcon: ({ size, color }) => (
            <Stethoscope size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="medicine"
        options={{
          title: t('medicine'),
          tabBarIcon: ({ size, color }) => (
            <Pill size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: t('community'),
          tabBarIcon: ({ size, color }) => (
            <Users size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: t('more'),
          tabBarIcon: ({ size, color }) => (
            <MoreHorizontal size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
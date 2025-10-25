
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'

export default function TabsLayout() {
  return (
    <Tabs
        screenOptions={({ route }) => ({
        tabBarActiveTintColor: '#6a1b9a',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { backgroundColor: '#fff' },
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'index') iconName = 'person';
          else if (route.name === 'rewrite') iconName = 'create';
          else if (route.name === 'history') iconName = 'time';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="index" options={{ title: 'Personas' }} />
      <Tabs.Screen name="rewrite" options={{ title: 'Rewrite' }} />
      <Tabs.Screen name="history" options={{ title: 'History' }} />
    </Tabs>
  );
}

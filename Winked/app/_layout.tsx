import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useColorScheme } from 'react-native'; // simpler than custom hook for now

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Personas' }} />
        <Stack.Screen name="rewrite" options={{ title: 'Rewrite' }} />
        <Stack.Screen name="history" options={{ title: 'History' }} />
        <Stack.Screen name="home" options={{ title: 'Home' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useColorScheme } from 'react-native'; // simpler than custom hook for now
import { PersonaProvider } from '../context/PersonaContext.tsx';

export const unstable_settings = {
    initialRouteName: '(tabs)'
}
export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <PersonaProvider>
            <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
        </PersonaProvider>
    </ThemeProvider>
  );
}

import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { useTheme } from "@react-navigation/native";
import { useAppTheme } from "../../context/ThemeContext";

export default function TabsLayout() {
  const { colors } = useTheme();
  const { isDark, toggleTheme } = useAppTheme();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: "#6a1b9a",
        tabBarInactiveTintColor: isDark ? "#9a9a9a" : "gray",
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
        headerRight: () => (
          <TouchableOpacity onPress={toggleTheme} style={{ marginRight: 14 }} hitSlop={8}>
            <Ionicons
              name={isDark ? "moon-outline" : "sunny-outline"}
              size={20}
              color={colors.text}
            />
          </TouchableOpacity>
        ),
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "home";

          if (route.name === "index") iconName = "person";
          else if (route.name === "rewrite") iconName = "create";
          else if (route.name === "history") iconName = "time";

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: "Personas" }} />
      <Tabs.Screen name="rewrite" options={{ title: "Rewrite" }} />
      <Tabs.Screen name="history" options={{ title: "History" }} />
    </Tabs>
  );
}

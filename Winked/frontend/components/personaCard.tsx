import React from "react";
import { Text, Image, TouchableOpacity } from "react-native";
import { useTheme } from "@react-navigation/native";

export default function PersonaCard({ persona, onPress }) {
  const { dark, colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={() => onPress(persona)}
      style={{
        width: 140,
        alignItems: "center",
        margin: 10,
        backgroundColor: dark ? "#2a2a2a" : "#f8f8f8",
        borderRadius: 16,
        padding: 12,
        borderWidth: 1,
        borderColor: dark ? "#3a3a3a" : "#f0f0f0",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
      }}
    >
      <Image
        source={persona.image}
        style={{
          width: 100,
          height: 100,
          borderRadius: 50,
          marginBottom: 10,
        }}
      />
      <Text style={{ fontSize: 16, fontWeight: "600", textAlign: "center", color: colors.text }}>
        {persona.name}
      </Text>
    </TouchableOpacity>
  );
}

import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";

export default function PersonaCard({ persona, onPress }) {
  return (
    <TouchableOpacity
      onPress={() => onPress(persona)}
      style={{
        width: 140,
        alignItems: "center",
        margin: 10,
        backgroundColor: "#f8f8f8",
        borderRadius: 16,
        padding: 12,
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
      <Text style={{ fontSize: 16, fontWeight: "600", textAlign: "center" }}>
        {persona.name}
      </Text>
    </TouchableOpacity>
  );
}

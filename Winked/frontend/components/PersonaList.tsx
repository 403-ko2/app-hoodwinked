import React from "react";
import { FlatList, View } from "react-native";
import PersonaCard from "./personaCard";

export default function PersonaList({ personas, onSelect }) {
  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <FlatList
        data={personas}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2} // 👈 two cards per row
        renderItem={({ item }) => (
          <PersonaCard persona={item} onPress={onSelect} />
        )}
        contentContainerStyle={{
          paddingVertical: 20,
        }}
      />
    </View>
  );
}

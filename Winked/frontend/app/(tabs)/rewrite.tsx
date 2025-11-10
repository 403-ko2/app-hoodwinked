import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { usePersona } from "../../context/PersonaContext";

export default function RewriteScreen() {
  const router = useRouter();
  const { selectedPersona } = usePersona();
  const [text, setText] = useState("");

  const handlePersonaPress = () => {
    // Takes the user back to the persona tab to pick one
    router.replace("/"); 
    fetch('http://localhost:3000/');
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff", padding: 20 }}>
      {/* Persona selection area */}
      <View style={{ alignItems: "center", marginTop: 40 }}>
        <TouchableOpacity onPress={handlePersonaPress}>
          {selectedPersona ? (
            <Image
              source={selectedPersona.image}
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                borderWidth: 2,
                borderColor: "#ccc",
              }}
            />
          ) : (
            <View
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                borderWidth: 2,
                borderColor: "#ccc",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="add" size={40} color="#777" />
            </View>
          )}
        </TouchableOpacity>

        <Text style={{ marginTop: 10, fontSize: 16 }}>
          {selectedPersona ? selectedPersona.name : "Select a persona"}
        </Text>
      </View>

      {/* Input box */}
      <View style={{ marginTop: 60 }}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={
            selectedPersona
              ? "Write your message..."
              : "Select a persona to start writing"
          }
          editable={!!selectedPersona}
          multiline
          numberOfLines={6}
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 15,
            padding: 15,
            fontSize: 16,
            backgroundColor: selectedPersona ? "#fff" : "#f0f0f0",
            textAlignVertical: "top",
          }}
        />
      </View>
    </View>
  );
}

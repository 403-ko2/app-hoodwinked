import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { usePersona } from "../../context/PersonaContext";

export default function RewriteScreen() {
  const router = useRouter();
  const { selectedPersona } = usePersona();
  const [text, setText] = useState("");
  const [lastSubmittedText, setLastSubmittedText] = useState("");

  const handlePersonaPress = () => {
    // Takes user back to personas tab to pick one
    router.replace("/");
  };

  const handleSubmit = () => {
    const normalized = text.trim();
    if (!normalized) return;

    // Temporary local submit behavior until full API wiring.
    setLastSubmittedText(normalized);
    setText("");
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
              : "Write your message (then pick a persona to rewrite)"
          }
          editable
          multiline
          numberOfLines={6}
          returnKeyType="send"
          submitBehavior="submit"
          onSubmitEditing={handleSubmit}
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 15,
            padding: 15,
            fontSize: 16,
            backgroundColor: "#fff",
            textAlignVertical: "top",
          }}
        />
      </View>

      <TouchableOpacity
        onPress={handleSubmit}
        style={{
          marginTop: 16,
          backgroundColor: "#6a1b9a",
          borderRadius: 12,
          paddingVertical: 14,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
          Send
        </Text>
      </TouchableOpacity>

      {lastSubmittedText ? (
        <View
          style={{
            marginTop: 20,
            padding: 12,
            borderRadius: 12,
            backgroundColor: "#f6f2fb",
          }}
        >
          <Text style={{ fontWeight: "600", marginBottom: 6 }}>
            Last submitted
          </Text>
          <Text>{lastSubmittedText}</Text>
        </View>
      ) : null}
    </View>
  );
}

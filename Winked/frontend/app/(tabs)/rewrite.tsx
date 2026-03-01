import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { usePersona } from "../../context/PersonaContext";
import { rewriteText } from "../../services/api";

export default function RewriteScreen() {
  const router = useRouter();
  const { selectedPersona } = usePersona();
  const [text, setText] = useState("");
  const [rewrittenText, setRewrittenText] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePersonaPress = () => {
    // Takes user back to personas tab to pick one
    router.replace("/");
  };

  const handleSubmit = async () => {
    const normalized = text.trim();
    if (!normalized) return;
    if (!selectedPersona) {
      setError("Select a persona first.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      const response = await rewriteText({
        text: normalized,
        personaID: selectedPersona.id,
      });

      setRewrittenText(response.transformedText);
      setText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to rewrite text");
    } finally {
      setIsSubmitting(false);
    }
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
        disabled={isSubmitting}
        style={{
          marginTop: 16,
          backgroundColor: isSubmitting ? "#b695cb" : "#6a1b9a",
          borderRadius: 12,
          paddingVertical: 14,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
          {isSubmitting ? "Rewriting..." : "Rewrite"}
        </Text>
      </TouchableOpacity>

      {error ? (
        <Text style={{ marginTop: 12, color: "#b00020", textAlign: "center" }}>
          {error}
        </Text>
      ) : null}

      {rewrittenText ? (
        <View
          style={{
            marginTop: 20,
            padding: 12,
            borderRadius: 12,
            backgroundColor: "#f6f2fb",
          }}
        >
          <Text style={{ fontWeight: "600", marginBottom: 6 }}>Rewritten text</Text>
          <Text>{rewrittenText}</Text>
        </View>
      ) : null}
    </View>
  );
}

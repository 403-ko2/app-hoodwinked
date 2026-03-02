import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import PersonaList from "../../components/PersonaList";
import { personas } from "../../data/personas";
import { useRouter } from "expo-router";
import { type Persona, usePersona } from "../../context/PersonaContext";
import { getPersonas } from "../../services/api";
import { useTheme } from "@react-navigation/native";

export default function Index() {
  const { colors } = useTheme();
  const router = useRouter();
  const { setSelectedPersona } = usePersona();
  const [personaList, setPersonaList] = useState<Persona[]>(personas as Persona[]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadPersonas = async () => {
      try {
        const apiPersonas = await getPersonas();
        if (!isMounted) return;
        if (apiPersonas.length > 0) {
          setPersonaList(apiPersonas);
        }
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Failed to load personas");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadPersonas();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelect = (persona: Persona) => {
    setSelectedPersona(persona); // Set in context
    router.push("/rewrite");
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Text
        style={{
          fontSize: 24,
          fontWeight: "bold",
          textAlign: "center",
          marginVertical: 20,
          color: colors.text,
        }}
      >
        Choose a Persona
      </Text>
      {loading ? (
        <ActivityIndicator size="large" color="#6a1b9a" />
      ) : (
        <PersonaList personas={personaList} onSelect={handleSelect} />
      )}
      {error ? (
        <Text style={{ textAlign: "center", marginTop: 12, color: "#b00020" }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

//const styles = StyleSheet.create({
//  container: {
//    flex: 1,
//    justifyContent: 'center',
//    padding: 24,
//    backgroundColor: '#fff',
//  },
//  title: {
//    fontSize: 22,
//    fontWeight: '600',
//    marginBottom: 16,
//    textAlign: 'center',
//  },
//  personaButton: {
//    padding: 16,
//    marginVertical: 8,
//    borderRadius: 10,
//    backgroundColor: '#eee',
//  },
//  selected: {
//    backgroundColor: '#d1c4e9',
//  },
//  personaText: {
//    fontSize: 18,
//    textAlign: 'center',
//  },
//  generateButton: {
//    marginTop: 24,
//    backgroundColor: '#6a1b9a',
//    padding: 16,
//    borderRadius: 10,
//  },
//  generateText: {
//    color: '#fff',
//    textAlign: 'center',
//    fontWeight: 'bold',
//  },
//});
//
//

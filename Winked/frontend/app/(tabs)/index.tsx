import { View, Text } from "react-native";
import PersonaList from "../../components/PersonaList";
import { personas } from "../../data/personas";
import { useRouter } from "expo-router";
import { usePersona } from "../../context/PersonaContext";

export default function index() {

    const router = useRouter(); 
    const { setSelectedPersona } = usePersona();

    const handleSelect = (persona) => {
        setSelectedPersona(persona); // Set in context
        router.push("/rewrite")
    };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Text
        style={{
          fontSize: 24,
          fontWeight: "bold",
          textAlign: "center",
          marginVertical: 20,
        }}
      >
        Choose a Persona
      </Text>
      <PersonaList personas={personas} onSelect={handleSelect} />
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

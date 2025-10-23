import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export default function PersonaSelection() {
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);

  // Temporary data — we’ll eventually fetch this from your backend
  const personas = [
    { id: '1', name: 'William Shakespeare' },
    { id: '2', name: 'Friedrich Nietzsche' },
    { id: '3', name: 'Socrates' },
    { id: '4', name: 'Confucius' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose a Persona</Text>

      <FlatList
        data={personas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.personaButton,
              selectedPersona === item.id && styles.selected,
            ]}
            onPress={() => setSelectedPersona(item.id)}
          >
            <Text style={styles.personaText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />

      {selectedPersona && (
        <Link
          href={{
            pathname: '/rewrite',
            params: { personaId: selectedPersona },
          }}
          asChild
        >
          <TouchableOpacity style={styles.generateButton}>
            <Text style={styles.generateText}>Continue</Text>
          </TouchableOpacity>
        </Link>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  personaButton: {
    padding: 16,
    marginVertical: 8,
    borderRadius: 10,
    backgroundColor: '#eee',
  },
  selected: {
    backgroundColor: '#d1c4e9',
  },
  personaText: {
    fontSize: 18,
    textAlign: 'center',
  },
  generateButton: {
    marginTop: 24,
    backgroundColor: '#6a1b9a',
    padding: 16,
    borderRadius: 10,
  },
  generateText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});



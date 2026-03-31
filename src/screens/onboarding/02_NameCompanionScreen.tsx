import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const PRESETS = ['Aria', 'Nova', 'Orion', 'Vex', 'Kira'];

interface Props {
  initialName: string;
  onNext: (name: string) => void;
}

export function NameCompanionScreen({ initialName, onNext }: Props) {
  const [name, setName] = useState(initialName || 'Aria');

  return (
    <View style={styles.container}>
      <Text style={styles.step}>Step 2 of 8</Text>
      <Text style={styles.title}>Name your companion</Text>
      <Text style={styles.body}>Pick a name that feels right. You can always change it later.</Text>

      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Companion name"
        placeholderTextColor="#ffffff44"
        maxLength={24}
      />

      <View style={styles.presets}>
        {PRESETS.map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.chip, name === p && styles.chipActive]}
            onPress={() => setName(p)}
          >
            <Text style={[styles.chipText, name === p && styles.chipTextActive]}>{p}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={() => onNext(name.trim() || 'Aria')}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0e1a', padding: 32, justifyContent: 'center' },
  step: { color: '#ffffff44', fontSize: 13, marginBottom: 8 },
  title: { color: '#ffffff', fontSize: 28, fontWeight: '700', marginBottom: 12 },
  body: { color: '#ffffffaa', fontSize: 16, lineHeight: 24, marginBottom: 32 },
  input: { backgroundColor: '#ffffff11', color: '#ffffff', fontSize: 20, paddingHorizontal: 20, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#ffffff22', marginBottom: 20 },
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 40 },
  chip: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20, backgroundColor: '#ffffff11', borderWidth: 1, borderColor: '#ffffff22' },
  chipActive: { backgroundColor: '#00d4ff22', borderColor: '#00d4ff' },
  chipText: { color: '#ffffffaa', fontSize: 15 },
  chipTextActive: { color: '#00d4ff', fontWeight: '600' },
  button: { backgroundColor: '#00d4ff', paddingVertical: 16, borderRadius: 32, alignItems: 'center' },
  buttonText: { color: '#0a0e1a', fontSize: 18, fontWeight: '700' },
});

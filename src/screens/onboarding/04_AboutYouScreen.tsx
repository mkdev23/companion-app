import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Props {
  initialName: string;
  initialBrief: string;
  onNext: (userName: string, userBrief: string) => void;
}

export function AboutYouScreen({ initialName, initialBrief, onNext }: Props) {
  const [name, setName] = useState(initialName);
  const [brief, setBrief] = useState(initialBrief);

  return (
    <View style={styles.container}>
      <Text style={styles.step}>Step 4 of 8</Text>
      <Text style={styles.title}>About you</Text>
      <Text style={styles.body}>
        Your companion will use this to understand who you are. Be as specific or brief as you like.
      </Text>

      <Text style={styles.label}>Your name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="e.g. Alex"
        placeholderTextColor="#ffffff44"
        maxLength={40}
      />

      <Text style={styles.label}>Tell your companion about yourself</Text>
      <TextInput
        style={[styles.input, styles.textarea]}
        value={brief}
        onChangeText={setBrief}
        placeholder="2-3 sentences — your work, interests, goals, anything relevant..."
        placeholderTextColor="#ffffff44"
        multiline
        numberOfLines={4}
        maxLength={400}
      />

      <TouchableOpacity
        style={[styles.button, !name.trim() && styles.buttonDisabled]}
        onPress={() => onNext(name.trim(), brief.trim())}
        disabled={!name.trim()}
      >
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
  label: { color: '#ffffff88', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { backgroundColor: '#ffffff11', color: '#ffffff', fontSize: 16, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#ffffff22', marginBottom: 20 },
  textarea: { height: 100, textAlignVertical: 'top' },
  button: { backgroundColor: '#00d4ff', paddingVertical: 16, borderRadius: 32, alignItems: 'center' },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: '#0a0e1a', fontSize: 18, fontWeight: '700' },
});

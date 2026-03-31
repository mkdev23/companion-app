import React, { useState } from 'react';
import { Linking, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Props {
  initialKey: string;
  initialUseHosted: boolean;
  onNext: (apiKey: string, useHostedKey: boolean) => void;
}

export function ApiKeyScreen({ initialKey, initialUseHosted, onNext }: Props) {
  const [apiKey, setApiKey] = useState(initialKey);
  const [useHosted, setUseHosted] = useState(initialUseHosted);

  const canContinue = useHosted || apiKey.trim().length > 0;

  return (
    <View style={styles.container}>
      <Text style={styles.step}>Step 7 of 8</Text>
      <Text style={styles.title}>Gemini API key</Text>

      <View style={styles.hostedRow}>
        <View style={styles.hostedText}>
          <Text style={styles.hostedTitle}>Use Companion OS hosted key</Text>
          <Text style={styles.hostedSub}>Free tier: 30 min/day — no setup needed</Text>
        </View>
        <Switch
          value={useHosted}
          onValueChange={setUseHosted}
          trackColor={{ false: '#ffffff22', true: '#00d4ff' }}
          thumbColor="#ffffff"
        />
      </View>

      {!useHosted && (
        <>
          <Text style={styles.label}>Your Gemini API key</Text>
          <TextInput
            style={styles.input}
            value={apiKey}
            onChangeText={setApiKey}
            placeholder="AIza..."
            placeholderTextColor="#ffffff44"
            autoCapitalize="none"
            secureTextEntry
          />
          <TouchableOpacity onPress={() => Linking.openURL('https://aistudio.google.com/app/apikey')}>
            <Text style={styles.link}>Get a free Gemini API key →</Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity
        style={[styles.button, !canContinue && styles.buttonDisabled]}
        onPress={() => onNext(apiKey.trim(), useHosted)}
        disabled={!canContinue}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0e1a', padding: 32, justifyContent: 'center' },
  step: { color: '#ffffff44', fontSize: 13, marginBottom: 8 },
  title: { color: '#ffffff', fontSize: 28, fontWeight: '700', marginBottom: 24 },
  hostedRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#00d4ff11', borderRadius: 12, borderWidth: 1, borderColor: '#00d4ff33', padding: 16, marginBottom: 24 },
  hostedText: { flex: 1, marginRight: 12 },
  hostedTitle: { color: '#00d4ff', fontSize: 16, fontWeight: '600', marginBottom: 4 },
  hostedSub: { color: '#ffffff88', fontSize: 13 },
  label: { color: '#ffffff88', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { backgroundColor: '#ffffff11', color: '#ffffff', fontSize: 16, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#ffffff22', marginBottom: 12 },
  link: { color: '#00d4ff', fontSize: 14, marginBottom: 32 },
  button: { backgroundColor: '#00d4ff', paddingVertical: 16, borderRadius: 32, alignItems: 'center', marginTop: 16 },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: '#0a0e1a', fontSize: 18, fontWeight: '700' },
});

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  onNext: () => void;
}

export function WelcomeScreen({ onNext }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.diagram}>
        <Text style={styles.diagramLabel}>👓 Glasses</Text>
        <Text style={styles.arrow}>↕</Text>
        <Text style={styles.diagramLabel}>📱 Avatar</Text>
        <Text style={styles.arrow}>↕</Text>
        <Text style={styles.diagramLabel}>🖥 Desktop Agent</Text>
      </View>

      <Text style={styles.title}>Companion OS</Text>
      <Text style={styles.tagline}>Your AI. In your world.</Text>
      <Text style={styles.body}>
        Your AI companion lives in three places simultaneously — in your glasses, on your phone, and working for you 24/7. It's not a chatbot. It's a presence.
      </Text>

      <TouchableOpacity style={styles.button} onPress={onNext}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0e1a', alignItems: 'center', justifyContent: 'center', padding: 32 },
  diagram: { alignItems: 'center', marginBottom: 40 },
  diagramLabel: { color: '#00d4ff', fontSize: 16, fontWeight: '600' },
  arrow: { color: '#ffffff44', fontSize: 20, marginVertical: 4 },
  title: { color: '#ffffff', fontSize: 36, fontWeight: '800', letterSpacing: 2, marginBottom: 8 },
  tagline: { color: '#00d4ff', fontSize: 18, fontStyle: 'italic', marginBottom: 24 },
  body: { color: '#ffffffaa', fontSize: 16, textAlign: 'center', lineHeight: 24, marginBottom: 48 },
  button: { backgroundColor: '#00d4ff', paddingHorizontal: 40, paddingVertical: 16, borderRadius: 32 },
  buttonText: { color: '#0a0e1a', fontSize: 18, fontWeight: '700' },
});

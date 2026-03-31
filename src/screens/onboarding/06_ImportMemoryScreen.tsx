import React, { useState } from 'react';
import { Linking, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Props {
  onNext: (memoryText: string) => void;
}

export function ImportMemoryScreen({ onNext }: Props) {
  const [text, setText] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.step}>Step 6 of 8</Text>
      <Text style={styles.title}>Import memory</Text>
      <Text style={styles.body}>
        If you've used Claude, ChatGPT, or another AI, you can import your conversation history. Your companion will learn from it on your first session.
      </Text>

      <View style={styles.links}>
        <TouchableOpacity onPress={() => Linking.openURL('https://claude.ai/settings/data')}>
          <Text style={styles.link}>Export from Claude →</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Linking.openURL('https://help.openai.com/en/articles/7260999')}>
          <Text style={styles.link}>Export from ChatGPT →</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.textarea}
        value={text}
        onChangeText={setText}
        placeholder="Paste exported conversation text here..."
        placeholderTextColor="#ffffff44"
        multiline
        textAlignVertical="top"
      />

      <TouchableOpacity style={styles.button} onPress={() => onNext(text)}>
        <Text style={styles.buttonText}>{text.trim() ? 'Import & Continue' : 'Skip'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0e1a', padding: 32 },
  step: { color: '#ffffff44', fontSize: 13, marginBottom: 8, marginTop: 48 },
  title: { color: '#ffffff', fontSize: 28, fontWeight: '700', marginBottom: 12 },
  body: { color: '#ffffffaa', fontSize: 16, lineHeight: 24, marginBottom: 20 },
  links: { marginBottom: 20, gap: 8 },
  link: { color: '#00d4ff', fontSize: 14 },
  textarea: { flex: 1, backgroundColor: '#ffffff11', color: '#ffffff', fontSize: 14, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#ffffff22', marginBottom: 20 },
  button: { backgroundColor: '#00d4ff', paddingVertical: 16, borderRadius: 32, alignItems: 'center' },
  buttonText: { color: '#0a0e1a', fontSize: 18, fontWeight: '700' },
});

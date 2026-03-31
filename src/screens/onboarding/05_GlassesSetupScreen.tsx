import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Props {
  initialIp: string;
  initialPort: number;
  onNext: (glassesEnabled: boolean, ip: string, port: number) => void;
}

export function GlassesSetupScreen({ initialIp, initialPort, onNext }: Props) {
  const [hasGlasses, setHasGlasses] = useState<boolean | null>(null);
  const [ip, setIp] = useState(initialIp);
  const [port, setPort] = useState(String(initialPort || 9090));

  const handleNext = () => {
    if (hasGlasses === true) {
      onNext(true, ip.trim(), parseInt(port, 10) || 9090);
    } else {
      onNext(false, '', 9090);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.step}>Step 5 of 8</Text>
      <Text style={styles.title}>Ray-Ban Meta glasses</Text>
      <Text style={styles.body}>
        Companion OS is embodied AI — your companion can see through your Ray-Ban Meta glasses in real time. Hands-free. Eyes-free.
      </Text>

      <Text style={styles.question}>Do you have Ray-Ban Meta glasses?</Text>
      <View style={styles.options}>
        <TouchableOpacity
          style={[styles.option, hasGlasses === true && styles.optionActive]}
          onPress={() => setHasGlasses(true)}
        >
          <Text style={styles.optionText}>👓 Yes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.option, hasGlasses === false && styles.optionActive]}
          onPress={() => setHasGlasses(false)}
        >
          <Text style={styles.optionText}>📱 Use phone camera</Text>
        </TouchableOpacity>
      </View>

      {hasGlasses === true && (
        <View style={styles.glassesConfig}>
          <Text style={styles.instructions}>
            1. Open the Meta View app{'\n'}
            2. Enable camera streaming in settings{'\n'}
            3. Note the stream IP and port shown
          </Text>
          <Text style={styles.label}>Stream IP</Text>
          <TextInput
            style={styles.input}
            value={ip}
            onChangeText={setIp}
            placeholder="192.168.1.x"
            placeholderTextColor="#ffffff44"
            keyboardType="numeric"
          />
          <Text style={styles.label}>Port</Text>
          <TextInput
            style={styles.input}
            value={port}
            onChangeText={setPort}
            placeholder="9090"
            placeholderTextColor="#ffffff44"
            keyboardType="numeric"
          />
        </View>
      )}

      {hasGlasses === false && (
        <View style={styles.phoneNote}>
          <Text style={styles.phoneNoteText}>Your companion will use your phone's camera. You can add glasses later in Settings.</Text>
        </View>
      )}

      {hasGlasses === null && (
        <TouchableOpacity style={styles.skip} onPress={() => onNext(false, '', 9090)}>
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      )}

      {hasGlasses !== null && (
        <TouchableOpacity
          style={[styles.button, hasGlasses === true && !ip.trim() && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={hasGlasses === true && !ip.trim()}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0e1a', padding: 32, justifyContent: 'center' },
  step: { color: '#ffffff44', fontSize: 13, marginBottom: 8 },
  title: { color: '#ffffff', fontSize: 28, fontWeight: '700', marginBottom: 12 },
  body: { color: '#ffffffaa', fontSize: 16, lineHeight: 24, marginBottom: 32 },
  question: { color: '#ffffff', fontSize: 18, fontWeight: '600', marginBottom: 16 },
  options: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  option: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: '#ffffff11', borderWidth: 1, borderColor: '#ffffff22', alignItems: 'center' },
  optionActive: { backgroundColor: '#00d4ff22', borderColor: '#00d4ff' },
  optionText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  glassesConfig: { marginBottom: 24 },
  instructions: { color: '#ffffffaa', fontSize: 14, lineHeight: 22, marginBottom: 20, backgroundColor: '#ffffff08', padding: 16, borderRadius: 10 },
  label: { color: '#ffffff88', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { backgroundColor: '#ffffff11', color: '#ffffff', fontSize: 16, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#ffffff22', marginBottom: 16 },
  phoneNote: { backgroundColor: '#00d4ff11', borderRadius: 12, padding: 16, marginBottom: 24 },
  phoneNoteText: { color: '#00d4ffaa', fontSize: 15 },
  button: { backgroundColor: '#00d4ff', paddingVertical: 16, borderRadius: 32, alignItems: 'center' },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: '#0a0e1a', fontSize: 18, fontWeight: '700' },
  skip: { alignItems: 'center', marginTop: 8 },
  skipText: { color: '#ffffff66', fontSize: 16 },
});

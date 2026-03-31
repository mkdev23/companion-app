import React, { useState } from 'react';
import { FlatList, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const PRESET_VRMS = [
  { id: 'aria',   label: 'Aria',   url: 'asset://presets/aria.vrm',   emoji: '👩' },
  { id: 'nova',   label: 'Nova',   url: 'asset://presets/nova.vrm',   emoji: '🌟' },
  { id: 'orion',  label: 'Orion',  url: 'asset://presets/orion.vrm',  emoji: '🧑' },
  { id: 'vex',    label: 'Vex',    url: 'asset://presets/vex.vrm',    emoji: '🤖' },
  { id: 'create', label: 'Create', url: '',                           emoji: '✨' },
];

interface Props {
  initialUrl: string;
  onNext: (vrmUrl: string) => void;
}

export function ChooseAvatarScreen({ initialUrl, onNext }: Props) {
  const [selectedUrl, setSelectedUrl] = useState(initialUrl || PRESET_VRMS[0].url);

  const handleSelect = (item: typeof PRESET_VRMS[0]) => {
    if (item.id === 'create') {
      // Open Avaturn in browser — user exports GLB, then uploads via VRoid Hub or file pick
      Linking.openURL('https://avaturn.me');
    } else {
      setSelectedUrl(item.url);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.step}>Step 3 of 8</Text>
      <Text style={styles.title}>Choose your avatar</Text>
      <Text style={styles.body}>
        Pick a preset, or tap Create to build one free at Avaturn — then upload the GLB below.
      </Text>

      <FlatList
        data={PRESET_VRMS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const isActive = item.id !== 'create' && selectedUrl === item.url;
          return (
            <TouchableOpacity
              style={[styles.card, isActive && styles.cardActive]}
              onPress={() => handleSelect(item)}
            >
              <Text style={styles.cardEmoji}>{item.emoji}</Text>
              <Text style={[styles.cardLabel, isActive && styles.cardLabelActive]}>{item.label}</Text>
            </TouchableOpacity>
          );
        }}
      />

      <Text style={styles.hint}>
        After creating at Avaturn, save the GLB URL — paste it in Settings → Avatar after onboarding.
      </Text>

      <TouchableOpacity style={styles.button} onPress={() => onNext(selectedUrl)}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#0a0e1a', padding: 32, justifyContent: 'center' },
  step:             { color: '#ffffff44', fontSize: 13, marginBottom: 8 },
  title:            { color: '#ffffff', fontSize: 28, fontWeight: '700', marginBottom: 12 },
  body:             { color: '#ffffffaa', fontSize: 16, lineHeight: 24, marginBottom: 32 },
  list:             { paddingBottom: 24, gap: 12 },
  card:             { width: 100, alignItems: 'center', padding: 16, borderRadius: 16, backgroundColor: '#ffffff11', borderWidth: 1, borderColor: '#ffffff22', marginRight: 12 },
  cardActive:       { backgroundColor: '#00d4ff22', borderColor: '#00d4ff' },
  cardEmoji:        { fontSize: 32, marginBottom: 8 },
  cardLabel:        { color: '#ffffffaa', fontSize: 13 },
  cardLabelActive:  { color: '#00d4ff', fontWeight: '600' },
  hint:             { color: '#ffffff33', fontSize: 12, lineHeight: 18, marginBottom: 28, textAlign: 'center' },
  button:           { backgroundColor: '#00d4ff', paddingVertical: 16, borderRadius: 32, alignItems: 'center' },
  buttonText:       { color: '#0a0e1a', fontSize: 18, fontWeight: '700' },
});

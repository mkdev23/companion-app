import React, { useState } from 'react';
import { Alert, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTierGate } from '../../wallet/useTierGate';

const PRESET_VRMS = [
  { id: 'aria', label: 'Aria', url: 'asset://presets/aria.vrm', emoji: '👩' },
  { id: 'nova', label: 'Nova', url: 'asset://presets/nova.vrm', emoji: '🌟' },
  { id: 'orion', label: 'Orion', url: 'asset://presets/orion.vrm', emoji: '🧑' },
  { id: 'vex', label: 'Vex', url: 'asset://presets/vex.vrm', emoji: '🤖' },
  { id: 'rpm', label: 'Ready Player Me', url: '', emoji: '🎨' },
];

interface Props {
  initialUrl: string;
  onNext: (vrmUrl: string) => void;
}

export function ChooseAvatarScreen({ initialUrl, onNext }: Props) {
  const [selectedUrl, setSelectedUrl] = useState(initialUrl || PRESET_VRMS[0].url);
  const [rpmModalVisible, setRpmModalVisible] = useState(false);
  const [rpmUrl, setRpmUrl] = useState('');
  const gate = useTierGate();

  const handleSelect = (item: typeof PRESET_VRMS[0]) => {
    if (item.id === 'rpm') {
      if (!gate.canUseRpm) {
        Alert.alert('Upgrade required', gate.upgradeMessage('Ready Player Me import'));
        return;
      }
      setRpmModalVisible(true);
    } else {
      setSelectedUrl(item.url);
    }
  };

  const handleRpmConfirm = () => {
    if (rpmUrl.trim()) {
      setSelectedUrl(rpmUrl.trim());
    }
    setRpmModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.step}>Step 3 of 8</Text>
      <Text style={styles.title}>Choose your avatar</Text>
      <Text style={styles.body}>Pick a preset or import from Ready Player Me.</Text>

      <FlatList
        data={PRESET_VRMS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const isActive = item.id !== 'rpm' && selectedUrl === item.url;
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

      <TouchableOpacity style={styles.button} onPress={() => onNext(selectedUrl)}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>

      <Modal visible={rpmModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Ready Player Me URL</Text>
            <Text style={styles.modalBody}>Paste the .glb or .vrm URL from readyplayer.me</Text>
            <TextInput
              style={styles.modalInput}
              value={rpmUrl}
              onChangeText={setRpmUrl}
              placeholder="https://models.readyplayer.me/..."
              placeholderTextColor="#ffffff44"
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.button} onPress={handleRpmConfirm}>
              <Text style={styles.buttonText}>Use this avatar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancel} onPress={() => setRpmModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0e1a', padding: 32, justifyContent: 'center' },
  step: { color: '#ffffff44', fontSize: 13, marginBottom: 8 },
  title: { color: '#ffffff', fontSize: 28, fontWeight: '700', marginBottom: 12 },
  body: { color: '#ffffffaa', fontSize: 16, lineHeight: 24, marginBottom: 32 },
  list: { paddingBottom: 32, gap: 12 },
  card: { width: 100, alignItems: 'center', padding: 16, borderRadius: 16, backgroundColor: '#ffffff11', borderWidth: 1, borderColor: '#ffffff22', marginRight: 12 },
  cardActive: { backgroundColor: '#00d4ff22', borderColor: '#00d4ff' },
  cardEmoji: { fontSize: 32, marginBottom: 8 },
  cardLabel: { color: '#ffffffaa', fontSize: 13 },
  cardLabelActive: { color: '#00d4ff', fontWeight: '600' },
  button: { backgroundColor: '#00d4ff', paddingVertical: 16, borderRadius: 32, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#0a0e1a', fontSize: 18, fontWeight: '700' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000088' },
  modalSheet: { backgroundColor: '#0f1524', padding: 32, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  modalTitle: { color: '#ffffff', fontSize: 20, fontWeight: '700', marginBottom: 8 },
  modalBody: { color: '#ffffffaa', fontSize: 14, marginBottom: 20 },
  modalInput: { backgroundColor: '#ffffff11', color: '#ffffff', fontSize: 14, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: '#ffffff22', marginBottom: 16 },
  cancel: { alignItems: 'center', marginTop: 12 },
  cancelText: { color: '#ffffff66', fontSize: 16 },
});

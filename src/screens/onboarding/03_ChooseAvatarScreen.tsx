import React, { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { useTierGate } from '../../wallet/useTierGate';
import { useUserStore } from '../../store/userStore';

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
  const [selectedUrl, setSelectedUrl]       = useState(initialUrl || PRESET_VRMS[0].url);
  const [avaturnVisible, setAvaturnVisible] = useState(false);
  const [avaturnUrl, setAvaturnUrl]         = useState<string | null>(null);
  const [loadingSession, setLoadingSession] = useState(false);
  const gate = useTierGate();
  const { companionClawHost } = useUserStore();

  const openAvaturn = async () => {
    if (!gate.canUseAvatarCreate) {
      Alert.alert('Upgrade required', gate.upgradeMessage('Avaturn avatar creator'));
      return;
    }
    setLoadingSession(true);
    try {
      const res = await fetch(`${companionClawHost}/avaturn/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'guest' }),
      });
      if (!res.ok) throw new Error('session failed');
      const { sessionUrl } = await res.json() as { sessionUrl: string };
      setAvaturnUrl(sessionUrl);
      setAvaturnVisible(true);
    } catch {
      Alert.alert('Avatar creator unavailable', 'Upload a .vrm file from VRoid Hub instead.');
    } finally {
      setLoadingSession(false);
    }
  };

  const handleSelect = (item: typeof PRESET_VRMS[0]) => {
    if (item.id === 'create') {
      openAvaturn();
    } else {
      setSelectedUrl(item.url);
    }
  };

  // Fired when Avaturn iframe posts the export event
  const handleWebViewMessage = (e: WebViewMessageEvent) => {
    try {
      const msg = JSON.parse(e.nativeEvent.data);
      if (msg?.source === 'avaturn' && msg?.eventName === 'export') {
        const glbUrl: string = msg?.data?.url;
        if (glbUrl) {
          setSelectedUrl(glbUrl);
          setAvaturnVisible(false);
        }
      }
    } catch {}
  };

  // Inject JS to forward postMessage events from Avaturn to React Native
  const INJECT = `
    (function() {
      const orig = window.postMessage;
      window.addEventListener('message', function(e) {
        if (e.data && e.data.source === 'avaturn') {
          window.ReactNativeWebView.postMessage(JSON.stringify(e.data));
        }
      });
    })();
    true;
  `;

  return (
    <View style={styles.container}>
      <Text style={styles.step}>Step 3 of 8</Text>
      <Text style={styles.title}>Choose your avatar</Text>
      <Text style={styles.body}>Pick a preset or create your own with Avaturn.</Text>

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
              disabled={loadingSession && item.id === 'create'}
            >
              {loadingSession && item.id === 'create'
                ? <ActivityIndicator color="#00d4ff" />
                : <Text style={styles.cardEmoji}>{item.emoji}</Text>
              }
              <Text style={[styles.cardLabel, isActive && styles.cardLabelActive]}>{item.label}</Text>
            </TouchableOpacity>
          );
        }}
      />

      <TouchableOpacity style={styles.button} onPress={() => onNext(selectedUrl)}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>

      {/* Avaturn creator modal */}
      <Modal visible={avaturnVisible} animationType="slide" onRequestClose={() => setAvaturnVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalHeaderText}>Create avatar — tap Export when done</Text>
            <TouchableOpacity onPress={() => setAvaturnVisible(false)} style={styles.modalClose}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          {avaturnUrl ? (
            <WebView
              source={{ uri: avaturnUrl }}
              style={styles.webview}
              injectedJavaScriptBeforeContentLoaded={INJECT}
              onMessage={handleWebViewMessage}
              mediaPlaybackRequiresUserAction={false}
            />
          ) : null}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#0a0e1a', padding: 32, justifyContent: 'center' },
  step:            { color: '#ffffff44', fontSize: 13, marginBottom: 8 },
  title:           { color: '#ffffff', fontSize: 28, fontWeight: '700', marginBottom: 12 },
  body:            { color: '#ffffffaa', fontSize: 16, lineHeight: 24, marginBottom: 32 },
  list:            { paddingBottom: 32, gap: 12 },
  card:            { width: 100, alignItems: 'center', padding: 16, borderRadius: 16, backgroundColor: '#ffffff11', borderWidth: 1, borderColor: '#ffffff22', marginRight: 12 },
  cardActive:      { backgroundColor: '#00d4ff22', borderColor: '#00d4ff' },
  cardEmoji:       { fontSize: 32, marginBottom: 8 },
  cardLabel:       { color: '#ffffffaa', fontSize: 13 },
  cardLabelActive: { color: '#00d4ff', fontWeight: '600' },
  button:          { backgroundColor: '#00d4ff', paddingVertical: 16, borderRadius: 32, alignItems: 'center', marginTop: 8 },
  buttonText:      { color: '#0a0e1a', fontSize: 18, fontWeight: '700' },
  modalContainer:  { flex: 1, backgroundColor: '#0a0e1a' },
  modalHeader:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#ffffff15' },
  modalHeaderText: { color: '#ffffffaa', fontSize: 14, flex: 1 },
  modalClose:      { padding: 8 },
  modalCloseText:  { color: '#ffffff66', fontSize: 18 },
  webview:         { flex: 1 },
});

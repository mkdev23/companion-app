import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { AvatarWebView } from '../../components/AvatarWebView';
import { GeminiService, GeminiState } from '../../gemini/GeminiService';
import { GlassesStreamService, GlassesStatus } from '../../glasses/GlassesStreamService';
import { GlassesStatusIndicator } from '../../glasses/GlassesStatusIndicator';
import { CameraService } from '../../glasses/CameraService';
import { DemoCtaBanner } from './DemoCtaBanner';
import { useUserStore } from '../../store/userStore';

export function SessionScreen() {
  const store = useUserStore();
  const [geminiState, setGeminiState] = useState<GeminiState>('DISCONNECTED');
  const [glassesStatus, setGlassesStatus] = useState<GlassesStatus>('DISCONNECTED');
  const [transcript, setTranscript] = useState('');
  const [avatarEmotion, setAvatarEmotion] = useState('neutral');

  const geminiRef = useRef<GeminiService | null>(null);
  const glassesRef = useRef<GlassesStreamService | null>(null);
  const cameraServiceRef = useRef<CameraService | null>(null);
  const phoneCameraRef = useRef<Camera>(null);

  // Camera permission + device (front camera for companion use)
  const { hasPermission, requestPermission } = useCameraPermission();
  const frontDevice = useCameraDevice('front');

  // Whether phone camera should be active: glasses not connected + permission granted
  const usePhoneCamera =
    (!store.glassesEnabled || glassesStatus !== 'CONNECTED') &&
    hasPermission &&
    !!frontDevice;

  const connectGemini = useCallback(() => {
    const svc = new GeminiService({
      onStateChange: (state) => {
        setGeminiState(state);
        if (state === 'SPEAKING') setAvatarEmotion('happy');
        else if (state === 'READY') setAvatarEmotion('neutral');
      },
      onAudioOutput: (_b64) => { /* TODO: play audio via expo-av AudioTrack */ },
      onTextOutput: (text) => setTranscript(text),
      onError: (msg) => console.warn('[Gemini]', msg),
    });
    geminiRef.current = svc;
    svc.connect();
  }, []);

  const connectGlasses = useCallback(() => {
    if (!store.glassesEnabled || !store.glassesIp) return;
    const svc = new GlassesStreamService({
      onFrame: (base64Jpeg) => geminiRef.current?.sendVideoFrame(base64Jpeg),
      onStatusChange: (status) => {
        setGlassesStatus(status);
        // When glasses disconnect, phone camera picks up automatically
      },
    });
    glassesRef.current = svc;
    svc.connect(store.glassesIp, store.glassesPort);
  }, [store.glassesEnabled, store.glassesIp, store.glassesPort]);

  const startPhoneCamera = useCallback(() => {
    if (!phoneCameraRef.current) return;
    const svc = new CameraService({
      onFrame: (base64Jpeg) => geminiRef.current?.sendVideoFrame(base64Jpeg),
      onError: (msg) => console.warn('[CameraService]', msg),
    });
    cameraServiceRef.current = svc;
    svc.start(phoneCameraRef as React.RefObject<Camera>);
  }, []);

  const stopPhoneCamera = useCallback(() => {
    cameraServiceRef.current?.stop();
    cameraServiceRef.current = null;
  }, []);

  // Request camera permission on mount if not yet granted
  useEffect(() => {
    if (!hasPermission) requestPermission();
  }, [hasPermission]);

  // Main connection lifecycle
  useEffect(() => {
    connectGemini();
    connectGlasses();
    return () => {
      geminiRef.current?.disconnect();
      glassesRef.current?.disconnect();
      stopPhoneCamera();
    };
  }, []);

  // Start/stop phone camera when glasses status changes
  useEffect(() => {
    if (usePhoneCamera) {
      startPhoneCamera();
    } else {
      stopPhoneCamera();
    }
  }, [usePhoneCamera]);

  const stateColor: Record<GeminiState, string> = {
    DISCONNECTED: '#ffffff44',
    CONNECTING: '#ffcc00',
    READY: '#00d4ff',
    SPEAKING: '#00ff88',
    LISTENING: '#ff6600',
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Hidden phone camera — renders off-screen when active, feeds frames to Gemini */}
      {usePhoneCamera && frontDevice && (
        <Camera
          ref={phoneCameraRef}
          style={styles.hiddenCamera}
          device={frontDevice}
          isActive={usePhoneCamera}
          photo
          onInitialized={startPhoneCamera}
        />
      )}

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.companionName}>{store.companionName}</Text>
        <View style={styles.statusRow}>
          <View style={[styles.dot, { backgroundColor: stateColor[geminiState] }]} />
          <Text style={styles.statusText}>{geminiState}</Text>
          <GlassesStatusIndicator
            glassesStatus={glassesStatus}
            glassesEnabled={store.glassesEnabled}
            onPress={() => { /* TODO: navigate to settings */ }}
          />
        </View>
      </View>

      {/* 3D Avatar */}
      <AvatarWebView
        vrmUrl={store.selectedVrmUrl}
        isSpeaking={geminiState === 'SPEAKING'}
        emotion={avatarEmotion}
      />

      {/* Transcript */}
      {transcript ? (
        <View style={styles.transcriptBar}>
          <Text style={styles.transcriptText} numberOfLines={2}>{transcript}</Text>
        </View>
      ) : null}

      {/* Demo mode CTA — shown after 3 minutes */}
      <DemoCtaBanner visible={store.isDemoMode} />

      {/* Reconnect button */}
      {geminiState === 'DISCONNECTED' && (
        <TouchableOpacity style={styles.reconnect} onPress={connectGemini}>
          <Text style={styles.reconnectText}>Reconnect</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0e1a' },
  hiddenCamera: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
    top: 0,
    left: 0,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  companionName: { color: '#ffffff', fontSize: 18, fontWeight: '700' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { color: '#ffffff88', fontSize: 12, marginRight: 8 },
  transcriptBar: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: '#ffffff11',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ffffff22',
  },
  transcriptText: { color: '#ffffffcc', fontSize: 15 },
  reconnect: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: '#00d4ff',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24,
  },
  reconnectText: { color: '#0a0e1a', fontWeight: '700', fontSize: 16 },
});

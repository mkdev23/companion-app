import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useUserStore } from '../../store/userStore';

// Re-export the presets so SettingsScreen can show them too
const VRM_PRESETS = [
  { id: 'aria',   label: 'Aria',   url: 'asset://presets/aria.vrm' },
  { id: 'nova',   label: 'Nova',   url: 'asset://presets/nova.vrm' },
  { id: 'orion',  label: 'Orion',  url: 'asset://presets/orion.vrm' },
  { id: 'vex',    label: 'Vex',    url: 'asset://presets/vex.vrm' },
];

export function SettingsScreen() {
  const store = useUserStore();

  const [companionName, setCompanionName] = useState(store.companionName);
  const [userName, setUserName]           = useState(store.userName);
  const [userBrief, setUserBrief]         = useState(store.userBrief);
  const [geminiKey, setGeminiKey]         = useState(store.geminiApiKey);
  const [useHosted, setUseHosted]         = useState(store.useHostedKey);
  const [clawHost, setClawHost]           = useState(store.companionClawHost);
  const [glassesIp, setGlassesIp]         = useState(store.glassesIp);
  const [glassesPort, setGlassesPort]     = useState(String(store.glassesPort));
  const [glassesEnabled, setGlassesEnabled] = useState(store.glassesEnabled);
  const [dirty, setDirty]                 = useState(false);

  const mark = () => setDirty(true);

  const save = () => {
    store.setCompanionName(companionName.trim() || 'Aria');
    store.setUserName(userName.trim());
    store.setUserBrief(userBrief.trim());
    store.setGeminiApiKey(geminiKey.trim());
    store.setUseHostedKey(useHosted);
    store.setCompanionClawHost(clawHost.trim() || 'https://api.companion-os.xyz');
    store.setGlassesIp(glassesIp.trim());
    store.setGlassesPort(parseInt(glassesPort, 10) || 9090);
    store.setGlassesEnabled(glassesEnabled);
    setDirty(false);
    Alert.alert('Saved', 'Settings updated. Reconnect your session to apply changes.');
  };

  const confirmReset = () => {
    Alert.alert(
      'Reset everything?',
      'This clears all settings and returns to onboarding.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: () => store.reset() },
      ]
    );
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Settings</Text>

      {/* Companion */}
      <Section label="Companion">
        <Field label="Companion name">
          <TextInput
            style={styles.input}
            value={companionName}
            onChangeText={(v) => { setCompanionName(v); mark(); }}
            placeholder="Aria"
            placeholderTextColor="#ffffff33"
          />
        </Field>

        <Field label="Avatar">
          <View style={styles.presetRow}>
            {VRM_PRESETS.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={[styles.presetBtn, store.selectedVrmUrl === p.url && styles.presetBtnActive]}
                onPress={() => { store.setSelectedVrmUrl(p.url); mark(); }}
              >
                <Text style={[styles.presetLabel, store.selectedVrmUrl === p.url && styles.presetLabelActive]}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Field>
      </Section>

      {/* You */}
      <Section label="About you">
        <Field label="Your name">
          <TextInput
            style={styles.input}
            value={userName}
            onChangeText={(v) => { setUserName(v); mark(); }}
            placeholder="Your name"
            placeholderTextColor="#ffffff33"
          />
        </Field>
        <Field label="Brief about yourself">
          <TextInput
            style={[styles.input, styles.inputMulti]}
            value={userBrief}
            onChangeText={(v) => { setUserBrief(v); mark(); }}
            placeholder="2-3 sentences about you, your goals, interests..."
            placeholderTextColor="#ffffff33"
            multiline
            numberOfLines={3}
          />
        </Field>
      </Section>

      {/* AI */}
      <Section label="AI">
        <Field label="Use Companion OS hosted key (free tier)">
          <Switch
            value={useHosted}
            onValueChange={(v) => { setUseHosted(v); mark(); }}
            trackColor={{ true: '#00d4ff' }}
            thumbColor="#ffffff"
          />
        </Field>
        {!useHosted && (
          <Field label="Gemini API key">
            <TextInput
              style={styles.input}
              value={geminiKey}
              onChangeText={(v) => { setGeminiKey(v); mark(); }}
              placeholder="AIzaSy..."
              placeholderTextColor="#ffffff33"
              secureTextEntry
              autoCapitalize="none"
            />
          </Field>
        )}
        <Field label="CompanionClaw host">
          <TextInput
            style={styles.input}
            value={clawHost}
            onChangeText={(v) => { setClawHost(v); mark(); }}
            placeholder="https://api.companion-os.xyz"
            placeholderTextColor="#ffffff33"
            autoCapitalize="none"
            keyboardType="url"
          />
        </Field>
      </Section>

      {/* Glasses */}
      <Section label="Ray-Ban Meta glasses">
        <Field label="Glasses enabled">
          <Switch
            value={glassesEnabled}
            onValueChange={(v) => { setGlassesEnabled(v); mark(); }}
            trackColor={{ true: '#00d4ff' }}
            thumbColor="#ffffff"
          />
        </Field>
        {glassesEnabled && (
          <>
            <Field label="Glasses IP">
              <TextInput
                style={styles.input}
                value={glassesIp}
                onChangeText={(v) => { setGlassesIp(v); mark(); }}
                placeholder="192.168.1.x"
                placeholderTextColor="#ffffff33"
                keyboardType="numbers-and-punctuation"
                autoCapitalize="none"
              />
            </Field>
            <Field label="Port">
              <TextInput
                style={styles.input}
                value={glassesPort}
                onChangeText={(v) => { setGlassesPort(v); mark(); }}
                placeholder="9090"
                placeholderTextColor="#ffffff33"
                keyboardType="number-pad"
              />
            </Field>
          </>
        )}
      </Section>

      {dirty && (
        <TouchableOpacity style={styles.saveBtn} onPress={save}>
          <Text style={styles.saveBtnText}>Save changes</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.resetBtn} onPress={confirmReset}>
        <Text style={styles.resetBtnText}>Reset & re-onboard</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      {children}
    </View>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll:           { flex: 1, backgroundColor: '#0a0e1a' },
  container:        { padding: 24 },
  title:            { color: '#ffffff', fontSize: 24, fontWeight: '700', marginBottom: 24 },
  section:          { marginBottom: 28 },
  sectionLabel:     { color: '#00d4ff', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 },
  field:            { marginBottom: 14 },
  fieldLabel:       { color: '#ffffffaa', fontSize: 13, marginBottom: 6 },
  input:            { backgroundColor: '#ffffff0d', color: '#ffffff', fontSize: 14, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#ffffff1a' },
  inputMulti:       { height: 80, textAlignVertical: 'top' },
  presetRow:        { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  presetBtn:        { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#ffffff11', borderWidth: 1, borderColor: '#ffffff22' },
  presetBtnActive:  { backgroundColor: '#00d4ff22', borderColor: '#00d4ff' },
  presetLabel:      { color: '#ffffffaa', fontSize: 13 },
  presetLabelActive: { color: '#00d4ff', fontWeight: '600' },
  saveBtn:          { backgroundColor: '#00d4ff', paddingVertical: 14, borderRadius: 28, alignItems: 'center', marginBottom: 12 },
  saveBtnText:      { color: '#0a0e1a', fontSize: 16, fontWeight: '700' },
  resetBtn:         { paddingVertical: 12, alignItems: 'center' },
  resetBtnText:     { color: '#ff4444aa', fontSize: 14 },
});

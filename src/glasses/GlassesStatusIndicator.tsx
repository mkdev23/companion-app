import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { GlassesStatus } from './GlassesStreamService';

interface Props {
  glassesStatus: GlassesStatus;
  glassesEnabled: boolean;
  onPress: () => void;
}

export function GlassesStatusIndicator({ glassesStatus, glassesEnabled, onPress }: Props) {
  const connected = glassesEnabled && glassesStatus === 'CONNECTED';
  const label = connected ? '👓 Glasses' : '📱 Phone camera';
  const color = connected ? '#00d4ff' : '#ffffff66';

  return (
    <TouchableOpacity style={styles.pill} onPress={onPress}>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#ffffff11',
    borderWidth: 1,
    borderColor: '#ffffff22',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
});

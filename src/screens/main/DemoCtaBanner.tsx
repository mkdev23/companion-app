/**
 * DemoCtaBanner — shown in demo mode after 3 minutes.
 * Floats above the avatar with a "Create your own →" prompt.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Animated, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const SHOW_AFTER_MS = 3 * 60 * 1000; // 3 minutes

interface Props {
  visible: boolean;
}

export function DemoCtaBanner({ visible }: Props) {
  const [show, setShow] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => setShow(true), SHOW_AFTER_MS);
    return () => clearTimeout(timer);
  }, [visible]);

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: show ? 1 : 0,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [show]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <View style={styles.banner}>
        <Text style={styles.label}>Enjoying the demo?</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => Linking.openURL('https://companion-os.xyz')}
        >
          <Text style={styles.buttonText}>Create your own companion →</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  banner: {
    backgroundColor: '#0f1524ee',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#00d4ff44',
    paddingHorizontal: 20,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 10,
  },
  label: {
    color: '#ffffffaa',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#00d4ff',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 24,
  },
  buttonText: {
    color: '#0a0e1a',
    fontWeight: '700',
    fontSize: 15,
  },
});

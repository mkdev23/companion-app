import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

interface Props {
  companionName: string;
  onLaunch: () => void;
}

export function LaunchScreen({ companionName, onLaunch }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
    ]).start(() => {
      setTimeout(onLaunch, 1200);
    });
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity, transform: [{ scale }] }}>
        <Text style={styles.emoji}>✨</Text>
        <Text style={styles.title}>{companionName} is ready</Text>
        <Text style={styles.body}>Your companion is online. Say hello.</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0e1a', alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 64, textAlign: 'center', marginBottom: 24 },
  title: { color: '#ffffff', fontSize: 32, fontWeight: '800', textAlign: 'center', marginBottom: 12 },
  body: { color: '#ffffffaa', fontSize: 18, textAlign: 'center' },
});

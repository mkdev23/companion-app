import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SessionScreen } from './SessionScreen';
import { IntegrationsScreen } from './IntegrationsScreen';
import { SettingsScreen } from './SettingsScreen';
import { WalletConnectScreen } from '../../wallet/WalletConnectScreen';
import { useUserStore } from '../../store/userStore';

type Tab = 'session' | 'integrations' | 'wallet' | 'settings';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'session',      label: 'Home',         icon: '◈' },
  { id: 'integrations', label: 'Connect',      icon: '⊕' },
  { id: 'wallet',       label: 'Wallet',        icon: '◎' },
  { id: 'settings',     label: 'Settings',     icon: '⊙' },
];

export function MainNavigator() {
  const [tab, setTab] = useState<Tab>('session');
  const store = useUserStore();

  const renderTab = () => {
    switch (tab) {
      case 'session':      return <SessionScreen />;
      case 'integrations': return <IntegrationsScreen userId={store.walletAddress ?? 'local'} />;
      case 'wallet':       return <WalletConnectScreen />;
      case 'settings':     return <SettingsScreen />;
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.content}>{renderTab()}</View>
      <View style={styles.tabBar}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.id}
            style={styles.tabItem}
            onPress={() => setTab(t.id)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabIcon, tab === t.id && styles.tabIconActive]}>{t.icon}</Text>
            <Text style={[styles.tabLabel, tab === t.id && styles.tabLabelActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root:           { flex: 1, backgroundColor: '#0a0e1a' },
  content:        { flex: 1 },
  tabBar:         { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#ffffff0f', backgroundColor: '#080c17', paddingBottom: 8, paddingTop: 6 },
  tabItem:        { flex: 1, alignItems: 'center', paddingVertical: 4 },
  tabIcon:        { fontSize: 20, color: '#ffffff33', marginBottom: 2 },
  tabIconActive:  { color: '#00d4ff' },
  tabLabel:       { fontSize: 10, color: '#ffffff33', letterSpacing: 0.5 },
  tabLabelActive: { color: '#00d4ff' },
});

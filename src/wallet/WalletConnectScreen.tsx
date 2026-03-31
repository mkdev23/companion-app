/**
 * WalletConnectScreen — Phantom/Solflare connect via Solana Mobile Wallet Adapter.
 *
 * Shows the user's current $COMPANION balance and tier.
 * Handles connect, disconnect, and balance refresh.
 */

import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useWalletStore } from './walletStore';
import { TIER_BENEFITS, CompanionTier } from './CompanionTier';

const TIER_COLOR: Record<CompanionTier, string> = {
  FREE: '#ffffff55',
  HOLDER: '#00d4ff',
  STAKER: '#7c3aed',
  BUILDER: '#f59e0b',
};

interface Props {
  onClose?: () => void;
}

export function WalletConnectScreen({ onClose }: Props) {
  const { address, companionBalance, tier, isLoading, error, setAddress, fetchBalance, disconnect } =
    useWalletStore();

  useEffect(() => {
    if (address) fetchBalance();
  }, [address]);

  const handleConnect = async () => {
    // TODO: invoke @solana/mobile-wallet-adapter-mobile transact() to get public key
    // Placeholder: prompt for manual address input in v1
    // Full MWA flow requires Android Activity context — wire in a real RN component
    const mockAddress = 'Demo: connect Phantom in production build';
    setAddress(mockAddress);
  };

  const handleDisconnect = () => {
    disconnect();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>$COMPANION Wallet</Text>

      {!address ? (
        <View style={styles.connectSection}>
          <Text style={styles.body}>
            Connect your Solana wallet to unlock higher tiers and earn $COMPANION.
          </Text>
          <TouchableOpacity style={styles.connectButton} onPress={handleConnect}>
            <Text style={styles.connectButtonText}>Connect Phantom / Solflare</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.walletSection}>
          {/* Balance card */}
          <View style={[styles.balanceCard, { borderColor: TIER_COLOR[tier] + '44' }]}>
            <Text style={styles.balanceLabel}>$COMPANION balance</Text>
            {isLoading ? (
              <ActivityIndicator color="#00d4ff" />
            ) : (
              <Text style={[styles.balanceAmount, { color: TIER_COLOR[tier] }]}>
                {companionBalance.toLocaleString()}
              </Text>
            )}
            <View style={[styles.tierBadge, { backgroundColor: TIER_COLOR[tier] + '22', borderColor: TIER_COLOR[tier] + '66' }]}>
              <Text style={[styles.tierBadgeText, { color: TIER_COLOR[tier] }]}>{tier}</Text>
            </View>
          </View>

          {/* Address */}
          <Text style={styles.addressLabel} numberOfLines={1} ellipsizeMode="middle">
            {address}
          </Text>

          {/* Tier benefits */}
          <Text style={styles.sectionTitle}>Your {tier} benefits</Text>
          {TIER_BENEFITS[tier].map((b, i) => (
            <View key={i} style={styles.benefitRow}>
              <Text style={styles.benefitIcon}>✓</Text>
              <Text style={styles.benefitText}>{b}</Text>
            </View>
          ))}

          {/* Upgrade prompt */}
          {tier !== 'BUILDER' && (
            <View style={styles.upgradeCard}>
              <Text style={styles.upgradeTitle}>Unlock more</Text>
              <Text style={styles.upgradeBody}>
                {tier === 'FREE'
                  ? 'Hold 100 $COMPANION to unlock the full VRM library and 90-day memory.'
                  : tier === 'HOLDER'
                  ? 'Hold 1,000 $COMPANION for unlimited memory and 3 companions.'
                  : 'Hold 10,000 $COMPANION for API access and hosting revenue share.'}
              </Text>
            </View>
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity style={styles.refreshButton} onPress={fetchBalance}>
            <Text style={styles.refreshText}>Refresh balance</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.disconnectButton} onPress={handleDisconnect}>
            <Text style={styles.disconnectText}>Disconnect wallet</Text>
          </TouchableOpacity>
        </View>
      )}

      {onClose && (
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeText}>Close</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0e1a' },
  content: { padding: 24, paddingBottom: 48 },
  title: { color: '#ffffff', fontSize: 24, fontWeight: '800', marginBottom: 24 },
  body: { color: '#ffffffaa', fontSize: 16, lineHeight: 24, marginBottom: 24 },
  connectSection: { alignItems: 'center', paddingTop: 40 },
  connectButton: { backgroundColor: '#00d4ff', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 32 },
  connectButtonText: { color: '#0a0e1a', fontSize: 16, fontWeight: '700' },
  walletSection: { gap: 16 },
  balanceCard: { backgroundColor: '#ffffff08', borderRadius: 16, borderWidth: 1, padding: 20, alignItems: 'center', gap: 8 },
  balanceLabel: { color: '#ffffff66', fontSize: 13 },
  balanceAmount: { fontSize: 40, fontWeight: '800' },
  tierBadge: { paddingHorizontal: 14, paddingVertical: 4, borderRadius: 12, borderWidth: 1, marginTop: 4 },
  tierBadgeText: { fontSize: 13, fontWeight: '700', letterSpacing: 1 },
  addressLabel: { color: '#ffffff33', fontSize: 11, textAlign: 'center' },
  sectionTitle: { color: '#ffffff88', fontSize: 14, fontWeight: '600', marginTop: 8 },
  benefitRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  benefitIcon: { color: '#00d4ff', fontSize: 14, marginTop: 2 },
  benefitText: { color: '#ffffffaa', fontSize: 14, flex: 1 },
  upgradeCard: { backgroundColor: '#00d4ff08', borderRadius: 12, borderWidth: 1, borderColor: '#00d4ff22', padding: 16, marginTop: 8 },
  upgradeTitle: { color: '#00d4ff', fontSize: 14, fontWeight: '700', marginBottom: 6 },
  upgradeBody: { color: '#ffffffaa', fontSize: 13, lineHeight: 20 },
  error: { color: '#ff6b6b', fontSize: 13, textAlign: 'center' },
  refreshButton: { alignItems: 'center', paddingVertical: 12 },
  refreshText: { color: '#00d4ff', fontSize: 14 },
  disconnectButton: { alignItems: 'center', paddingVertical: 12 },
  disconnectText: { color: '#ffffff44', fontSize: 14 },
  closeButton: { alignItems: 'center', marginTop: 24 },
  closeText: { color: '#ffffff66', fontSize: 16 },
});

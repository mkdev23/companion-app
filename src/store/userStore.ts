import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type CompanionTier = 'FREE' | 'HOLDER' | 'STAKER' | 'BUILDER';

export interface UserStore {
  hasOnboarded: boolean;
  companionName: string;
  userName: string;
  userBrief: string;
  selectedVrmUrl: string;
  memoryImportText: string;
  memoryProcessed: boolean;
  isDemoMode: boolean;
  geminiApiKey: string;
  useHostedKey: boolean;
  companionClawHost: string;
  glassesIp: string;
  glassesPort: number;
  glassesEnabled: boolean;
  fcmToken: string | null;
  walletAddress: string | null;
  companionTier: CompanionTier;

  // setters
  setHasOnboarded: (v: boolean) => void;
  setCompanionName: (v: string) => void;
  setUserName: (v: string) => void;
  setUserBrief: (v: string) => void;
  setSelectedVrmUrl: (v: string) => void;
  setMemoryImportText: (v: string) => void;
  setMemoryProcessed: (v: boolean) => void;
  setIsDemoMode: (v: boolean) => void;
  setGeminiApiKey: (v: string) => void;
  setUseHostedKey: (v: boolean) => void;
  setCompanionClawHost: (v: string) => void;
  setGlassesIp: (v: string) => void;
  setGlassesPort: (v: number) => void;
  setGlassesEnabled: (v: boolean) => void;
  setFcmToken: (v: string | null) => void;
  setWalletAddress: (v: string | null) => void;
  setCompanionTier: (v: CompanionTier) => void;
  reset: () => void;
}

const DEFAULTS = {
  hasOnboarded: false,
  companionName: 'Aria',
  userName: '',
  userBrief: '',
  selectedVrmUrl: 'asset://presets/aria.vrm',
  memoryImportText: '',
  memoryProcessed: false,
  isDemoMode: false,
  geminiApiKey: '',
  useHostedKey: true,
  companionClawHost: 'https://api.companion-os.xyz',
  glassesIp: '',
  glassesPort: 9090,
  glassesEnabled: false,
  fcmToken: null,
  walletAddress: null,
  companionTier: 'FREE' as CompanionTier,
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      setHasOnboarded: (v) => set({ hasOnboarded: v }),
      setCompanionName: (v) => set({ companionName: v }),
      setUserName: (v) => set({ userName: v }),
      setUserBrief: (v) => set({ userBrief: v }),
      setSelectedVrmUrl: (v) => set({ selectedVrmUrl: v }),
      setMemoryImportText: (v) => set({ memoryImportText: v }),
      setMemoryProcessed: (v) => set({ memoryProcessed: v }),
      setIsDemoMode: (v) => set({ isDemoMode: v }),
      setGeminiApiKey: (v) => set({ geminiApiKey: v }),
      setUseHostedKey: (v) => set({ useHostedKey: v }),
      setCompanionClawHost: (v) => set({ companionClawHost: v }),
      setGlassesIp: (v) => set({ glassesIp: v }),
      setGlassesPort: (v) => set({ glassesPort: v }),
      setGlassesEnabled: (v) => set({ glassesEnabled: v }),
      setFcmToken: (v) => set({ fcmToken: v }),
      setWalletAddress: (v) => set({ walletAddress: v }),
      setCompanionTier: (v) => set({ companionTier: v }),
      reset: () => set(DEFAULTS),
    }),
    {
      name: 'companion-user-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

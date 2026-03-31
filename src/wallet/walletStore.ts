import { create } from 'zustand';
import { CompanionTier, resolveCompanionTier } from './CompanionTier';

const COMPANION_MINT = 'COMPANION_MINT_ADDRESS_PLACEHOLDER'; // replace after token launch
const COMPANION_DECIMALS = 6;

interface WalletStore {
  address: string | null;
  companionBalance: number;
  tier: CompanionTier;
  isLoading: boolean;
  error: string | null;

  setAddress: (address: string | null) => void;
  fetchBalance: () => Promise<void>;
  disconnect: () => void;
}

export const useWalletStore = create<WalletStore>((set, get) => ({
  address: null,
  companionBalance: 0,
  tier: 'FREE',
  isLoading: false,
  error: null,

  setAddress: (address) => {
    set({ address });
    if (address) get().fetchBalance();
  },

  fetchBalance: async () => {
    const { address } = get();
    if (!address) return;
    set({ isLoading: true, error: null });
    try {
      // Query Solana RPC for COMPANION token account balance
      const rpc = 'https://api.mainnet-beta.solana.com';
      const body = {
        jsonrpc: '2.0',
        id: 1,
        method: 'getTokenAccountsByOwner',
        params: [
          address,
          { mint: COMPANION_MINT },
          { encoding: 'jsonParsed' },
        ],
      };
      const res = await fetch(rpc, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      const accounts = json?.result?.value ?? [];
      let balance = 0;
      if (accounts.length > 0) {
        balance = Number(accounts[0].account.data.parsed.info.tokenAmount.uiAmount) || 0;
      }
      set({ companionBalance: balance, tier: resolveCompanionTier(balance), isLoading: false });
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  disconnect: () => {
    set({ address: null, companionBalance: 0, tier: 'FREE' });
  },
}));

/**
 * GeminiService — connects to Gemini Live (or CompanionClaw KeyProxy).
 *
 * Session lifecycle:
 *   1. Fetch soul bundle from CompanionClaw (or empty if offline)
 *   2. Open WebSocket to Gemini (direct or via KeyProxy)
 *   3. Send setup with system prompt (soul + memory injected)
 *   4. On READY: inject memory import if first session
 *   5. Relay audio/video frames to Gemini, deliver responses back
 */

import { useUserStore } from '../store/userStore';
import { buildSystemPrompt } from './buildSystemPrompt';
import { CompanionClawClient } from './CompanionClawClient';

const GEMINI_LIVE_URL =
  'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent';
const MODEL = 'models/gemini-2.0-flash-live-001';

export type GeminiState = 'DISCONNECTED' | 'CONNECTING' | 'READY' | 'SPEAKING' | 'LISTENING';

export interface GeminiServiceCallbacks {
  onStateChange: (state: GeminiState) => void;
  onAudioOutput: (base64Pcm: string) => void;
  onTextOutput: (text: string) => void;
  onError: (msg: string) => void;
}

export class GeminiService {
  private ws: WebSocket | null = null;
  private callbacks: GeminiServiceCallbacks;
  private clawClient: CompanionClawClient | null = null;
  private memoryInjected = false;

  constructor(callbacks: GeminiServiceCallbacks) {
    this.callbacks = callbacks;
  }

  async connect(): Promise<void> {
    const store = useUserStore.getState();
    this.callbacks.onStateChange('CONNECTING');

    // 1. Fetch soul + memory from CompanionClaw (non-blocking fallback)
    let soul = { soul: '', user: '', memory: '' };
    const userId = store.userName
      ? `${store.userName.toLowerCase().replace(/\s+/g, '-')}-companion`
      : 'guest';

    if (store.companionClawHost) {
      this.clawClient = new CompanionClawClient(store.companionClawHost, userId);
      soul = await this.clawClient.fetchSoul();
      this.clawClient.connectSession(store.fcmToken ?? undefined);
    }

    // 2. Build system prompt with soul + memory injected
    const systemPrompt = buildSystemPrompt(store, soul);

    // 3. Route: KeyProxy or direct Gemini
    let url: string;
    if (store.useHostedKey || !store.geminiApiKey) {
      const wsHost = store.companionClawHost
        .replace('https://', 'wss://')
        .replace('http://', 'ws://');
      const tier = store.companionTier ?? 'FREE';
      url = `${wsHost}/gemini-proxy?userId=${encodeURIComponent(userId)}&tier=${tier}`;
    } else {
      url = `${GEMINI_LIVE_URL}?key=${store.geminiApiKey}`;
    }

    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      this.sendSetup(systemPrompt);
    };

    this.ws.onmessage = (event) => {
      this.handleMessage(event.data);
    };

    this.ws.onerror = () => {
      this.callbacks.onError('WebSocket error');
      this.callbacks.onStateChange('DISCONNECTED');
    };

    this.ws.onclose = () => {
      this.callbacks.onStateChange('DISCONNECTED');
    };
  }

  private sendSetup(systemPrompt: string): void {
    if (!this.ws) return;
    const setup = {
      setup: {
        model: MODEL,
        generation_config: {
          response_modalities: ['AUDIO'],
          speech_config: {
            voice_config: { prebuilt_voice_config: { voice_name: 'Aoede' } },
          },
        },
        system_instruction: { parts: [{ text: systemPrompt }] },
      },
    };
    this.ws.send(JSON.stringify(setup));
  }

  sendAudioChunk(base64Pcm: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify({
      realtime_input: {
        media_chunks: [{ mime_type: 'audio/pcm;rate=16000', data: base64Pcm }],
      },
    }));
  }

  sendVideoFrame(base64Jpeg: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify({
      realtime_input: {
        media_chunks: [{ mime_type: 'image/jpeg', data: base64Jpeg }],
      },
    }));
  }

  async sendTextTurn(text: string): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify({
      client_content: {
        turns: [{ role: 'user', parts: [{ text }] }],
        turn_complete: true,
      },
    }));
    // Log user turn to CompanionClaw for memory
    this.clawClient?.logTurn('user', text);
  }

  private handleMessage(data: string): void {
    try {
      const msg = JSON.parse(data);

      if (msg.setupComplete) {
        this.callbacks.onStateChange('READY');
        // Memory import fires HERE — after READY, not before setup
        if (!this.memoryInjected) {
          this.memoryInjected = true;
          this.maybeInjectMemoryImport();
        }
        return;
      }

      const parts = msg?.serverContent?.modelTurn?.parts;
      if (parts) {
        let responseText = '';
        for (const part of parts) {
          if (part.inlineData?.mimeType?.startsWith('audio/')) {
            this.callbacks.onStateChange('SPEAKING');
            this.callbacks.onAudioOutput(part.inlineData.data);
          }
          if (part.text) {
            responseText += part.text;
            this.callbacks.onTextOutput(part.text);
          }
        }
        // Log assistant response to CompanionClaw
        if (responseText) {
          this.clawClient?.logTurn('assistant', responseText);
        }
      }

      if (msg?.serverContent?.turnComplete) {
        this.callbacks.onStateChange('READY');
      }
    } catch {
      // non-JSON frame, ignore
    }
  }

  /**
   * Inject memory import on first session after onboarding.
   * Called only after READY to ensure Gemini is listening.
   */
  private async maybeInjectMemoryImport(): Promise<void> {
    const store = useUserStore.getState();
    if (!store.memoryImportText || store.memoryProcessed) return;
    const snippet = store.memoryImportText.slice(0, 8000);
    await this.sendTextTurn(
      `[memory-import] I've pasted conversation history from my previous AI. ` +
      `Extract key facts about me — preferences, goals, relationships, projects — ` +
      `and hold them as your understanding of who I am:\n\n${snippet}`,
    );
    store.setMemoryProcessed(true);
  }

  disconnect(): void {
    this.clawClient?.disconnect();
    this.ws?.close();
    this.ws = null;
  }
}

/**
 * CompanionClawClient — REST + WebSocket client for the CompanionClaw backend.
 *
 * Fetches soul, user profile, and memory projection at session start
 * so they can be injected into the Gemini system prompt.
 *
 * Also sends session turns to CompanionClaw for memory logging.
 */

import { useUserStore } from '../store/userStore';

export interface SoulBundle {
  soul: string;
  user: string;
  memory: string;
}

export class CompanionClawClient {
  private host: string;
  private userId: string;
  private ws: WebSocket | null = null;

  constructor(host: string, userId: string) {
    this.host = host.replace(/\/$/, '');
    this.userId = userId;
  }

  /**
   * Fetch soul + user profile + memory projection.
   * Returns empty strings if backend is unavailable (app works offline).
   */
  async fetchSoul(): Promise<SoulBundle> {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`${this.host}/users/${this.userId}/state`, {
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (!res.ok) return this.emptySoul();
      return await res.json() as SoulBundle;
    } catch {
      return this.emptySoul();
    }
  }

  /**
   * Connect the CompanionClaw session WebSocket for live logging.
   * Non-blocking — if it fails, memory just doesn't get logged.
   */
  connectSession(fcmToken?: string): void {
    const store = useUserStore.getState();
    const wsHost = this.host
      .replace('https://', 'wss://')
      .replace('http://', 'ws://');

    const params = new URLSearchParams({ userId: this.userId });
    if (fcmToken) params.set('fcmToken', fcmToken);
    if (store.geminiApiKey) params.set('geminiApiKey', store.geminiApiKey);

    try {
      this.ws = new WebSocket(`${wsHost}?${params}`);
      this.ws.onerror = () => {};   // silent — non-critical
      this.ws.onclose = () => { this.ws = null; };
    } catch {
      // Backend unavailable — app keeps working without logging
    }
  }

  /**
   * Log a conversation turn to CompanionClaw for memory reconciliation.
   */
  logTurn(role: 'user' | 'assistant', text: string): void {
    this.send({ type: 'session_turn', payload: { role, text } });
  }

  /**
   * Log a free-form session note (e.g., end-of-session summary).
   */
  logNote(text: string): void {
    this.send({ type: 'log_session', payload: { text } });
  }

  disconnect(): void {
    this.ws?.close();
    this.ws = null;
  }

  private send(msg: object): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  private emptySoul(): SoulBundle {
    return { soul: '', user: '', memory: '' };
  }
}

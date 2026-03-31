/**
 * GlassesStreamService — WebSocket receiver for Ray-Ban Meta glasses JPEG stream.
 *
 * Mirrors VisionClaw's StreamViewModel glasses pipeline.
 * Opens ws://{glassesIp}:{glassesPort} and forwards JPEG frames to a callback.
 * Falls back gracefully if connection fails — phone camera takes over.
 */

export type GlassesStatus = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR';

export interface GlassesStreamCallbacks {
  onFrame: (base64Jpeg: string) => void;
  onStatusChange: (status: GlassesStatus) => void;
}

export class GlassesStreamService {
  private ws: WebSocket | null = null;
  private callbacks: GlassesStreamCallbacks;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private shouldReconnect = true;

  constructor(callbacks: GlassesStreamCallbacks) {
    this.callbacks = callbacks;
  }

  connect(ip: string, port: number): void {
    this.shouldReconnect = true;
    this.open(ip, port);
  }

  private open(ip: string, port: number): void {
    this.callbacks.onStatusChange('CONNECTING');
    try {
      this.ws = new WebSocket(`ws://${ip}:${port}`);
    } catch {
      this.callbacks.onStatusChange('ERROR');
      return;
    }

    (this.ws as any).binaryType = 'arraybuffer';

    this.ws.onopen = () => {
      this.callbacks.onStatusChange('CONNECTED');
    };

    this.ws.onmessage = (event) => {
      // Glasses stream sends raw JPEG bytes as ArrayBuffer
      if (event.data instanceof ArrayBuffer) {
        const bytes = new Uint8Array(event.data);
        const base64 = this.arrayBufferToBase64(bytes);
        this.callbacks.onFrame(base64);
      } else if (typeof event.data === 'string') {
        // Some implementations send base64 directly
        this.callbacks.onFrame(event.data);
      }
    };

    this.ws.onerror = () => {
      this.callbacks.onStatusChange('ERROR');
    };

    this.ws.onclose = () => {
      this.callbacks.onStatusChange('DISCONNECTED');
      if (this.shouldReconnect) {
        // Retry after 3s
        this.reconnectTimer = setTimeout(() => this.open(ip, port), 3000);
      }
    };
  }

  disconnect(): void {
    this.shouldReconnect = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.ws?.close();
    this.ws = null;
  }

  private arrayBufferToBase64(bytes: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return Buffer.from(binary, 'binary').toString('base64');
  }
}

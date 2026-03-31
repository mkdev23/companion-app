/**
 * CameraService — captures JPEG frames from the phone's front camera.
 *
 * Used as a fallback when Ray-Ban glasses are not connected.
 * Snapshots are taken at ~2fps to match glasses stream cadence for Gemini Live.
 *
 * Usage:
 *   const cam = new CameraService({ onFrame: (b64Jpeg) => gemini.sendVideoFrame(b64Jpeg) });
 *   cam.start(cameraRef);
 *   cam.stop();
 */

import { Camera, CameraDevice } from 'react-native-vision-camera';

export interface CameraServiceCallbacks {
  onFrame: (base64Jpeg: string) => void;
  onError?: (msg: string) => void;
}

const FRAME_INTERVAL_MS = 500; // 2fps

export class CameraService {
  private callbacks: CameraServiceCallbacks;
  private timer: ReturnType<typeof setInterval> | null = null;
  private cameraRef: React.RefObject<Camera> | null = null;
  private running = false;

  constructor(callbacks: CameraServiceCallbacks) {
    this.callbacks = callbacks;
  }

  start(cameraRef: React.RefObject<Camera>): void {
    if (this.running) return;
    this.cameraRef = cameraRef;
    this.running = true;
    this.timer = setInterval(() => this.captureFrame(), FRAME_INTERVAL_MS);
  }

  stop(): void {
    this.running = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.cameraRef = null;
  }

  private async captureFrame(): Promise<void> {
    if (!this.running || !this.cameraRef?.current) return;
    try {
      const photo = await this.cameraRef.current.takeSnapshot({
        quality: 60,
      });
      // photo.path is a file URI; convert to base64
      const base64 = await CameraService.fileToBase64(photo.path);
      this.callbacks.onFrame(base64);
    } catch (e: any) {
      // Snapshot can fail if camera not ready; silent skip
      this.callbacks.onError?.(`snapshot error: ${e.message}`);
    }
  }

  static async requestPermission(): Promise<boolean> {
    const status = await Camera.requestCameraPermission();
    return status === 'granted';
  }

  static async getPreferredDevice(): Promise<CameraDevice | undefined> {
    const devices = Camera.getAvailableCameraDevices();
    // Prefer front camera for companion use
    return devices.find((d) => d.position === 'front') ?? devices[0];
  }

  private static async fileToBase64(path: string): Promise<string> {
    // React Native: use fetch to read the file as a blob, then convert to base64
    const cleanPath = path.startsWith('file://') ? path : `file://${path}`;
    const res = await fetch(cleanPath);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Strip the data:image/jpeg;base64, prefix
        resolve(result.split(',')[1] ?? result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

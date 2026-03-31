/**
 * Companion OS — Three.js VRM Avatar
 *
 * Reads window.companionConfig.vrmUrl at startup.
 * Receives postMessage from React Native WebView:
 *   { type: 'emotion', value: 'happy|sad|angry|surprised|relaxed|neutral' }
 *   { type: 'speaking', value: true|false }
 *   { type: 'gesture', value: 'wave|nod|...' }
 *   { type: 'loadVrm', url: '...' }
 *
 * Posts back to RN:
 *   'ready' — avatar loaded and rendering
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';

// ─── Config ─────────────────────────────────────────────────────────
const config = window.companionConfig ?? {};
const VRM_URL = config.vrmUrl || null;

// ─── Scene setup ────────────────────────────────────────────────────
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 20);
camera.position.set(0, 1.4, 3.5);
camera.lookAt(0, 1.2, 0);

// Lighting — warm front light + cool rim
const keyLight = new THREE.DirectionalLight(0xfff5e0, 1.8);
keyLight.position.set(1, 2, 2);
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(0x00d4ff, 0.4);
rimLight.position.set(-2, 1, -1);
scene.add(rimLight);

scene.add(new THREE.AmbientLight(0x404060, 1.2));

// ─── State ──────────────────────────────────────────────────────────
let currentVrm = null;
let isSpeaking = false;
let currentEmotion = 'neutral';
let blinkTimer = 0;
let breathTimer = 0;
let speakTimer = 0;
let emotionTimer = 0;

// ─── VRM loading ────────────────────────────────────────────────────
const loader = new GLTFLoader();
loader.register((parser) => new VRMLoaderPlugin(parser));

async function loadVrm(url) {
  // Resolve asset:// scheme to file path for Android
  let resolvedUrl = url;
  if (url && url.startsWith('asset://')) {
    resolvedUrl = url.replace('asset://', './');
  }

  if (currentVrm) {
    scene.remove(currentVrm.scene);
    VRMUtils.deepDispose(currentVrm.scene);
    currentVrm = null;
  }

  if (!resolvedUrl) {
    showFallbackAvatar();
    return;
  }

  try {
    const gltf = await loader.loadAsync(resolvedUrl);
    const vrm = gltf.userData.vrm;
    if (!vrm) throw new Error('Not a VRM file');

    VRMUtils.removeUnnecessaryVertices(gltf.scene);
    VRMUtils.combineSkeletons(gltf.scene);

    currentVrm = vrm;
    scene.add(vrm.scene);

    // Center and floor the model
    const box = new THREE.Box3().setFromObject(vrm.scene);
    const center = box.getCenter(new THREE.Vector3());
    vrm.scene.position.sub(center);
    const min = box.getMin(new THREE.Vector3());
    vrm.scene.position.y -= min.y;

    // Rotate to face camera (VRM default is -Z forward)
    vrm.scene.rotation.y = Math.PI;

    postToRN('ready');
    setStatus('');
  } catch (err) {
    console.error('[avatar] VRM load failed:', err);
    showFallbackAvatar();
  }
}

// Fallback: simple capsule silhouette when no VRM loaded
function showFallbackAvatar() {
  const bodyGeo = new THREE.CapsuleGeometry(0.22, 0.9, 8, 16);
  const mat = new THREE.MeshStandardMaterial({ color: 0x00d4ff, metalness: 0.3, roughness: 0.6 });
  const body = new THREE.Mesh(bodyGeo, mat);
  body.position.y = 1.2;
  scene.add(body);

  const headGeo = new THREE.SphereGeometry(0.2, 16, 16);
  const head = new THREE.Mesh(headGeo, mat);
  head.position.y = 1.9;
  scene.add(head);

  postToRN('ready');
  setStatus('');
}

// ─── Emotion ────────────────────────────────────────────────────────
const EMOTION_MAP = {
  happy: { happy: 1.0, surprised: 0 },
  sad: { sad: 1.0 },
  angry: { angry: 1.0 },
  surprised: { surprised: 1.0 },
  relaxed: { relaxed: 1.0 },
  neutral: {},
};

function applyEmotion(name) {
  if (!currentVrm?.expressionManager) return;
  const em = currentVrm.expressionManager;
  // Reset all blendshapes
  ['happy', 'sad', 'angry', 'surprised', 'relaxed', 'neutral'].forEach((e) => {
    try { em.setValue(e, 0); } catch {}
  });
  const targets = EMOTION_MAP[name] ?? {};
  for (const [key, val] of Object.entries(targets)) {
    try { em.setValue(key, val); } catch {}
  }
}

// ─── Blink ──────────────────────────────────────────────────────────
function updateBlink(delta) {
  if (!currentVrm?.expressionManager) return;
  blinkTimer += delta;
  // Blink roughly every 3-5s
  const interval = 3.5 + Math.sin(blinkTimer * 0.3) * 1.5;
  if (blinkTimer > interval) {
    blinkTimer = 0;
    doBlink();
  }
}

async function doBlink() {
  if (!currentVrm?.expressionManager) return;
  const em = currentVrm.expressionManager;
  const steps = 6;
  for (let i = 0; i <= steps; i++) {
    try { em.setValue('blink', i / steps); } catch {}
    await sleep(16);
  }
  for (let i = steps; i >= 0; i--) {
    try { em.setValue('blink', i / steps); } catch {}
    await sleep(16);
  }
}

// ─── Breathing idle ─────────────────────────────────────────────────
function updateBreath(delta) {
  if (!currentVrm?.humanoid) return;
  breathTimer += delta;
  const breath = Math.sin(breathTimer * 1.2) * 0.015;
  const spine = currentVrm.humanoid.getNormalizedBoneNode('spine');
  if (spine) spine.rotation.x = breath;
}

// ─── Speaking jaw ────────────────────────────────────────────────────
function updateSpeaking(delta) {
  if (!currentVrm?.expressionManager) return;
  if (!isSpeaking) {
    try { currentVrm.expressionManager.setValue('aa', 0); } catch {}
    return;
  }
  speakTimer += delta;
  // Oscillate jaw open/close at speech frequency
  const aa = Math.abs(Math.sin(speakTimer * 8.5)) * 0.55;
  try { currentVrm.expressionManager.setValue('aa', aa); } catch {}
}

// ─── Head look ───────────────────────────────────────────────────────
function updateHeadLook(delta) {
  if (!currentVrm?.humanoid) return;
  const head = currentVrm.humanoid.getNormalizedBoneNode('head');
  if (!head) return;
  // Gentle idle sway
  const t = Date.now() * 0.0004;
  head.rotation.y = Math.sin(t) * 0.04;
  head.rotation.x = Math.sin(t * 0.7) * 0.015;
}

// ─── Render loop ─────────────────────────────────────────────────────
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  if (currentVrm) {
    updateBlink(delta);
    updateBreath(delta);
    updateSpeaking(delta);
    updateHeadLook(delta);
    currentVrm.update(delta);
  }

  renderer.render(scene, camera);
}

// ─── Resize handler ──────────────────────────────────────────────────
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ─── RN bridge ───────────────────────────────────────────────────────
function postToRN(msg) {
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(typeof msg === 'string' ? msg : JSON.stringify(msg));
  }
}

document.addEventListener('message', handleRNMessage);   // Android
window.addEventListener('message', handleRNMessage);     // iOS

function handleRNMessage(event) {
  let data;
  try {
    data = JSON.parse(event.data);
  } catch {
    return;
  }

  switch (data.type) {
    case 'emotion':
      currentEmotion = data.value || 'neutral';
      applyEmotion(currentEmotion);
      break;
    case 'speaking':
      isSpeaking = !!data.value;
      if (!isSpeaking) speakTimer = 0;
      break;
    case 'gesture':
      playGesture(data.value);
      break;
    case 'loadVrm':
      setStatus('Loading avatar...');
      loadVrm(data.url);
      break;
  }
}

// ─── Gesture playback ────────────────────────────────────────────────
async function playGesture(name) {
  if (!currentVrm?.humanoid) return;

  const rightArm = currentVrm.humanoid.getNormalizedBoneNode('rightUpperArm');
  const rightForearm = currentVrm.humanoid.getNormalizedBoneNode('rightLowerArm');
  if (!rightArm || !rightForearm) return;

  switch (name) {
    case 'wave': {
      // Raise arm and wave
      for (let i = 0; i <= 10; i++) {
        rightArm.rotation.z = -(i / 10) * 1.8;
        await sleep(30);
      }
      for (let w = 0; w < 3; w++) {
        for (let i = 0; i <= 8; i++) { rightForearm.rotation.z = (i / 8) * 0.6; await sleep(40); }
        for (let i = 8; i >= 0; i--) { rightForearm.rotation.z = (i / 8) * 0.6; await sleep(40); }
      }
      for (let i = 10; i >= 0; i--) {
        rightArm.rotation.z = -(i / 10) * 1.8;
        await sleep(30);
      }
      break;
    }
    case 'nod': {
      const head = currentVrm.humanoid.getNormalizedBoneNode('head');
      if (!head) break;
      for (let n = 0; n < 2; n++) {
        for (let i = 0; i <= 8; i++) { head.rotation.x = (i / 8) * 0.25; await sleep(50); }
        for (let i = 8; i >= 0; i--) { head.rotation.x = (i / 8) * 0.25; await sleep(50); }
      }
      break;
    }
    default:
      break;
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function setStatus(msg) {
  const el = document.getElementById('status');
  if (el) { el.textContent = msg; el.style.display = msg ? 'block' : 'none'; }
}

// ─── Boot ─────────────────────────────────────────────────────────────
setStatus('Loading avatar...');
animate();
loadVrm(VRM_URL);

import React, { useState } from 'react';
import { Platform } from 'react-native';
import { useUserStore } from '../../store/userStore';

function generateUserId(): string {
  const rand = () => Math.random().toString(36).slice(2, 9);
  return `u_${Date.now().toString(36)}_${rand()}`;
}

// Gemini Live voice per archetype — mirrors PersonalityGenome.ts
const ARCHETYPE_GEMINI_VOICE: Record<string, string> = {
  nova:      'Kore',    // bright, curious
  aria:      'Aoede',   // warm, empathic
  orion:     'Charon',  // deep, analytical
  vex:       'Fenrir',  // bold, energetic
  kira:      'Puck',    // playful, creative
  sakura:    'Aoede',   // soft, intimate
  'vex-dark':'Charon',  // commanding, deep
};
import { WelcomeScreen } from './01_WelcomeScreen';
import { NameCompanionScreen } from './02_NameCompanionScreen';
import { ChooseAvatarScreen } from './03_ChooseAvatarScreen';
import { AboutYouScreen } from './04_AboutYouScreen';
import { GlassesSetupScreen } from './05_GlassesSetupScreen';
import { ImportMemoryScreen } from './06_ImportMemoryScreen';
import { ApiKeyScreen } from './07_ApiKeyScreen';
import { LaunchScreen } from './08_LaunchScreen';

interface Props {
  onComplete: () => void;
}

export function OnboardingNavigator({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const store = useUserStore();

  const next = () => setStep((s) => s + 1);

  switch (step) {
    case 0:
      return <WelcomeScreen onNext={next} />;

    case 1:
      return (
        <NameCompanionScreen
          initialName={store.companionName}
          onNext={(name) => { store.setCompanionName(name); next(); }}
        />
      );

    case 2:
      return (
        <ChooseAvatarScreen
          initialUrl={store.selectedVrmUrl}
          onNext={(url) => { store.setSelectedVrmUrl(url); next(); }}
        />
      );

    case 3:
      return (
        <AboutYouScreen
          initialName={store.userName}
          initialBrief={store.userBrief}
          onNext={(name, brief) => { store.setUserName(name); store.setUserBrief(brief); next(); }}
        />
      );

    case 4:
      return (
        <GlassesSetupScreen
          initialIp={store.glassesIp}
          initialPort={store.glassesPort}
          onNext={(enabled, ip, port) => {
            store.setGlassesEnabled(enabled);
            store.setGlassesIp(ip);
            store.setGlassesPort(port);
            next();
          }}
        />
      );

    case 5:
      return (
        <ImportMemoryScreen
          onNext={(text) => { store.setMemoryImportText(text); next(); }}
        />
      );

    case 6:
      return (
        <ApiKeyScreen
          initialKey={store.geminiApiKey}
          initialUseHosted={store.useHostedKey}
          onNext={(key, useHosted) => {
            store.setGeminiApiKey(key);
            store.setUseHostedKey(useHosted);
            next();
          }}
        />
      );

    case 7:
      return (
        <LaunchScreen
          companionName={store.companionName}
          onLaunch={async () => {
            // Generate stable userId if not yet set
            const userId = store.userId || generateUserId();
            if (!store.userId) store.setUserId(userId);

            // Lock in the Gemini voice for this archetype
            const geminiVoice = ARCHETYPE_GEMINI_VOICE[store.archetypeId] ?? 'Aoede';
            store.setGeminiVoice(geminiVoice);

            // Provision workspace on CompanionClaw
            const host = store.companionClawHost;
            if (host) {
              try {
                await fetch(`${host}/onboard`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    userId,
                    companionName: store.companionName,
                    userName: store.userName,
                    userBrief: store.userBrief,
                    archetypeId: store.archetypeId,
                    ageVerified: store.ageVerified,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    fcmToken: store.fcmToken,
                    geminiApiKey: store.useHostedKey ? undefined : store.geminiApiKey,
                    platform: Platform.OS,
                  }),
                });
              } catch {
                // Backend offline — app works without it
              }
            }

            store.setHasOnboarded(true);
            onComplete();
          }}
        />
      );

    default:
      return null;
  }
}

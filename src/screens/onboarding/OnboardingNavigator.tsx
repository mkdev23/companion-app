import React, { useState } from 'react';
import { useUserStore } from '../../store/userStore';
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
          onLaunch={() => {
            store.setHasOnboarded(true);
            onComplete();
          }}
        />
      );

    default:
      return null;
  }
}

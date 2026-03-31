import React, { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';

interface Props {
  vrmUrl: string;
  emotion?: string;
  isSpeaking?: boolean;
  onReady?: () => void;
}

/**
 * Hosts the Three.js VRM avatar via react-native-webview.
 * The bundled avatar.html reads window.companionConfig.vrmUrl at startup.
 * Messages to/from the WebView control emotion and speaking state.
 */
export function AvatarWebView({ vrmUrl, emotion, isSpeaking, onReady }: Props) {
  const webViewRef = useRef<WebView>(null);

  const injectedConfig = `
    window.companionConfig = {
      vrmUrl: ${JSON.stringify(vrmUrl)},
    };
    true;
  `;

  const handleMessage = (event: WebViewMessageEvent) => {
    const data = event.nativeEvent.data;
    if (data === 'ready' && onReady) {
      onReady();
    }
  };

  // Send emotion/speaking updates via postMessage
  React.useEffect(() => {
    if (!webViewRef.current) return;
    webViewRef.current.postMessage(JSON.stringify({ type: 'emotion', value: emotion ?? 'neutral' }));
  }, [emotion]);

  React.useEffect(() => {
    if (!webViewRef.current) return;
    webViewRef.current.postMessage(JSON.stringify({ type: 'speaking', value: isSpeaking ?? false }));
  }, [isSpeaking]);

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: 'file:///android_asset/avatar/index.html' }}
        injectedJavaScriptBeforeContentLoaded={injectedConfig}
        onMessage={handleMessage}
        allowFileAccess
        allowFileAccessFromFileURLs
        allowUniversalAccessFromFileURLs
        javaScriptEnabled
        style={styles.webview}
        scrollEnabled={false}
        bounces={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e1a',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.patronos.app',
  appName: 'Patron OS',
  webDir: 'out',
  server: {
    url: 'https://patronos.net',
    cleartext: false,
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scheme: 'patronos',
    backgroundColor: '#0B0B0B',
  },
  plugins: {
    StatusBar: {
      style: 'dark',
      backgroundColor: '#0B0B0B',
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0B0B0B',
      showSpinner: false,
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
  },
};

export default config;

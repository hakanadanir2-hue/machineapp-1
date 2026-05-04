import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.patronos.app',
  appName: 'Patron OS',
  webDir: 'out',
  server: {
    // Geliştirme sırasında localhost'a bağlan
    // Production'da kaldır
    url: 'https://machineapp.vercel.app',
    cleartext: false,
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scheme: 'Patron OS',
  },
  plugins: {
    StatusBar: {
      style: 'light',
    },
  },
};

export default config;

import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.letsword.game',
  appName: 'LetsWord',
  webDir: 'dist',
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#6366f1',
    preferredContentMode: 'mobile'
  },
  android: {
    backgroundColor: '#6366f1',
    allowMixedContent: false,
    useLegacyBridge: false
  },
  server: {
    // For development - comment out for production
    // url: 'http://localhost:5173',
    // cleartext: true
  }
};

export default config;

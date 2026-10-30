import type { CapacitorConfig } from '@capacitor/cli';

const serverUrl = process.env.CAPACITOR_SERVER_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://resq-kerala.org';

const config: CapacitorConfig = {
  appId: 'in.resqkerala.app',
  appName: 'RESQ KERALA',
  webDir: 'www',
  server: {
    url: serverUrl,
    cleartext: true,
    androidScheme: 'https',
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    backgroundColor: '#0A192F',
  },
};

export default config;

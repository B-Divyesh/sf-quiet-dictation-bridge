import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'in.sociobot.quietdictationbridge',
  appName: 'Quiet Dictation Bridge',
  webDir: 'dist',
  server: { androidScheme: 'https' },
  android: { backgroundColor: '#080d12' },
};

export default config;

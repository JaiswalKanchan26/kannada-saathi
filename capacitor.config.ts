
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nammakannada.app',
  appName: 'Namma Kannada',
  webDir: 'dist/kannada-saathi/browser',
  plugins: {
    SplashScreen: {
      launchShowDuration: 500,
      launchAutoHide: true,
      backgroundColor: '#176B57',
      splashFullScreen: true,
      splashImmersive: true
    }
  }
};

export default config;

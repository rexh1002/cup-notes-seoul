import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cupnotes.seoul',
  appName: 'CUP NOTES SEOUL',
  webDir: 'out',
  server: {
    url: 'https://cup-notes-seoul.vercel.app',
    cleartext: false
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      backgroundColor: "#3b82f6",
      showSpinner: true,
      spinnerColor: "#ffffff"
    },
    StatusBar: {
      style: 'dark'
    }
  }
};

export default config;

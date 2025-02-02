import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'dev.lovable.csngjtaxbnebqfismwvs',
  appName: 'connect-and-care',
  webDir: 'dist',
  server: {
    url: 'https://csngjtaxbnebqfismwvs.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#488AFF",
      sound: "beep.wav",
    },
    Geolocation: {
      ios: {
        plist: {
          NSLocationWhenInUseUsageDescription: "We need your location to show you on the map and provide care coordination features.",
          NSLocationAlwaysUsageDescription: "We need your location to provide continuous care coordination features even when the app is in the background."
        }
      },
      android: {
        permissions: [
          "android.permission.ACCESS_COARSE_LOCATION",
          "android.permission.ACCESS_FINE_LOCATION"
        ]
      }
    }
  }
};

export default config;
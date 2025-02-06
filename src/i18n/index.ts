import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translations
const resources = {
  en: {
    translation: {
      // General
      appName: 'Care Companion',
      welcome: 'Welcome',
      user: 'User',
      
      // Navigation
      home: 'Home',
      careGroups: 'Care Groups',
      moodSupport: 'Mood Support',
      messages: 'Messages',
      more: 'More',
      settings: 'Settings',
      
      // Auth
      signIn: 'Sign In',
      signUp: 'Sign Up',
      signOut: 'Sign Out',
      
      // Notifications
      newMessage: 'New Message',
      newMessageInGroup: 'You have a new message in your care group',
      
      // Errors
      error: 'Error',
      signOutError: 'Failed to sign out',
      
      // Features
      generateCareGuides: 'Generate Care Guides',
      findCreateGroup: 'Find or Create a Care Group',
      noCareGroup: 'No Care Group Found',
      joinCareGroup: 'Join a care group to access check-ins and other features',
      
      // Health Monitoring
      vitalSigns: 'Vital Signs',
      bloodPressure: 'Blood Pressure',
      heartRate: 'Heart Rate',
      temperature: 'Temperature',
      oxygenLevel: 'Oxygen Level',
      
      // Emergency
      emergency: 'Emergency',
      emergencyAlert: 'Emergency Alert',
      emergencyHelp: 'Help is on the way. Stay calm.',
      emergencyError: 'Failed to send emergency alert. Please try again or call emergency services directly.',
      
      // Medication
      medicationReminder: 'Medication Reminder',
      takeMedication: 'Time to take your medication',
      medicationVerification: 'Please take a photo to verify',
      
      // Care Quality
      careQuality: 'Care Quality',
      metrics: 'Metrics',
      analytics: 'Analytics',
      
      // Wellness
      wellnessScore: 'Wellness Score',
      wellnessTracking: 'Track your wellness',
      
      // Voice Commands
      voiceCommand: 'Voice Command',
      voiceEnabled: 'Voice commands enabled',
      
      // Support
      supportGroups: 'Support Groups',
      findSupport: 'Find Support',
      
      // Resources
      resourceLibrary: 'Resource Library',
      careGuides: 'Care Guides',
      
      // Scheduling
      respiteCare: 'Respite Care',
      scheduleRespite: 'Schedule Respite Care',
      
      // Documents
      documents: 'Documents',
      secureSharing: 'Secure Document Sharing',
      
      // Medical Devices
      devices: 'Medical Devices',
      connectDevice: 'Connect Device'
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    interpolation: {
      escapeValue: false
    },
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development'
  });

export default i18n;
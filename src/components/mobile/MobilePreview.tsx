import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';
import { MobileNavigation } from './MobileNavigation';
import { MobileSchedule } from './MobileSchedule';
import { ActivityTracker } from '../health-wellness/ActivityTracker';
import { SleepTracker } from '../health-wellness/SleepTracker';
import { wearableService } from '@/lib/device-integration/wearable-service';
import { healthPredictionService } from '@/lib/ai/health-prediction-service';

const SCREEN_VARIANTS = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0
  })
};

export const MobilePreview: React.FC = () => {
  const [activeTab, setActiveTab] = useState('schedule');
  const [pageDirection, setPageDirection] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    initializeApp();
    return () => cleanup();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize status bar
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#1F2937' });

      // Initialize services
      await wearableService.initialize();
      await healthPredictionService.initialize();

      // Scan for devices
      const devices = await wearableService.scanForDevices();
      if (devices.length > 0) {
        await wearableService.connectDevice(devices[0]);
        setIsConnected(true);
        await Haptics.impact({ style: ImpactStyle.Medium });
      }
    } catch (error) {
      console.error('Error initializing app:', error);
    }
  };

  const cleanup = () => {
    wearableService.cleanup();
    healthPredictionService.cleanup();
  };

  const handleTabChange = async (tab: string) => {
    const direction = getPageDirection(activeTab, tab);
    setPageDirection(direction);
    await Haptics.impact({ style: ImpactStyle.Light });
    setActiveTab(tab);
  };

  const getPageDirection = (current: string, next: string) => {
    const pages = ['schedule', 'activity', 'sleep', 'profile'];
    const currentIndex = pages.indexOf(current);
    const nextIndex = pages.indexOf(next);
    return nextIndex > currentIndex ? 1 : -1;
  };

  const renderScreen = () => {
    return (
      <AnimatePresence mode="wait" custom={pageDirection}>
        <motion.div
          key={activeTab}
          custom={pageDirection}
          variants={SCREEN_VARIANTS}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
          }}
          className="w-full h-full"
        >
          {activeTab === 'schedule' && <MobileSchedule />}
          {activeTab === 'activity' && <ActivityTracker />}
          {activeTab === 'sleep' && <SleepTracker />}
          {activeTab === 'profile' && (
            <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h2>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={async () => {
                      setIsDarkMode(!isDarkMode);
                      await Haptics.impact({ style: ImpactStyle.Light });
                      await StatusBar.setStyle({ 
                        style: !isDarkMode ? Style.Dark : Style.Light 
                      });
                    }}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700"
                  >
                    {isDarkMode ? '🌙' : '☀️'}
                  </motion.button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Device Status</span>
                    <span className={`px-2 py-1 rounded ${
                      isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {isConnected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={async () => {
                      await Haptics.impact({ style: ImpactStyle.Medium });
                      const devices = await wearableService.scanForDevices();
                      if (devices.length > 0) {
                        await wearableService.connectDevice(devices[0]);
                        setIsConnected(true);
                      }
                    }}
                    className="w-full py-2 bg-blue-500 text-white rounded-lg"
                  >
                    Scan for Devices
                  </motion.button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className={`h-screen flex flex-col ${isDarkMode ? 'dark' : ''}`}>
      <div className="flex-1 relative overflow-hidden">
        {renderScreen()}
      </div>
      <MobileNavigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};

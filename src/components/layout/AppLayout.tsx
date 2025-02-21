import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Outlet, useLocation } from 'react-router-dom';
import { AppNavigation } from '@/components/navigation/AppNavigation';
import { QuickActions } from '@/components/actions/QuickActions';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { AIAssistant } from '@/components/ai/AIAssistant';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useAuth } from '@/hooks/useAuth';
import { APP_MODULES } from '@/app.structure';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { StatusBar } from '@capacitor/status-bar';
import { App } from '@capacitor/app';

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [currentModule, setCurrentModule] = useState<typeof APP_MODULES[0] | null>(null);

  useEffect(() => {
    // Find current module based on route
    const moduleId = location.pathname.split('/')[1];
    const module = APP_MODULES.find(m => m.id === moduleId);
    setCurrentModule(module || null);

    // Mobile-specific setup
    if (isMobile) {
      StatusBar.setStyle({ style: 'dark' });
      App.addListener('appStateChange', ({ isActive }) => {
        if (isActive) {
          // Refresh critical data when app becomes active
          // TODO: Implement data refresh logic
        }
      });
    }
  }, [location, isMobile]);

  const togglePanel = async (panel: 'notifications' | 'assistant') => {
    if (isMobile) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
    if (panel === 'notifications') {
      setIsNotificationOpen(!isNotificationOpen);
      setIsAssistantOpen(false);
    } else {
      setIsAssistantOpen(!isAssistantOpen);
      setIsNotificationOpen(false);
    }
  };

  const renderMobileLayout = () => (
    <div className="h-screen bg-gray-50 dark:bg-gray-900">
      <motion.header
        className="fixed top-0 inset-x-0 bg-white dark:bg-gray-800 z-40"
        initial={false}
        animate={{
          height: currentModule ? 'auto' : 0,
          opacity: currentModule ? 1 : 0,
        }}
      >
        {currentModule && (
          <div className="p-4">
            <h1 className="text-xl font-bold">{currentModule.name}</h1>
            <p className="text-sm text-gray-500">{currentModule.description}</p>
          </div>
        )}
      </motion.header>

      <main className="pt-20 pb-24 px-4">
        <Outlet />
      </main>

      <AppNavigation />

      <AnimatePresence>
        {(isNotificationOpen || isAssistantOpen) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => {
              setIsNotificationOpen(false);
              setIsAssistantOpen(false);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isNotificationOpen && (
          <NotificationCenter
            onClose={() => setIsNotificationOpen(false)}
            className="fixed inset-y-0 right-0 w-full max-w-sm z-50"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAssistantOpen && (
          <AIAssistant
            onClose={() => setIsAssistantOpen(false)}
            className="fixed inset-y-0 right-0 w-full max-w-sm z-50"
          />
        )}
      </AnimatePresence>
    </div>
  );

  const renderDesktopLayout = () => (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <AppNavigation />

      <div className="flex-1 flex">
        <main className="flex-1 overflow-y-auto p-8">
          {currentModule && (
            <div className="mb-8">
              <h1 className="text-3xl font-bold">{currentModule.name}</h1>
              <p className="text-gray-500 mt-2">{currentModule.description}</p>
            </div>
          )}
          <Outlet />
        </main>

        <aside className="w-80 bg-white dark:bg-gray-800 shadow-lg overflow-y-auto">
          <div className="p-4">
            <QuickActions />
          </div>

          <AnimatePresence>
            {isNotificationOpen && (
              <NotificationCenter
                onClose={() => setIsNotificationOpen(false)}
                className="border-t"
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isAssistantOpen && (
              <AIAssistant
                onClose={() => setIsAssistantOpen(false)}
                className="border-t"
              />
            )}
          </AnimatePresence>
        </aside>
      </div>
    </div>
  );

  return isMobile ? renderMobileLayout() : renderDesktopLayout();
};

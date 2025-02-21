import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { APP_MODULES } from '@/app.structure';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useAuth } from '@/hooks/useAuth';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { SearchBar } from '@/components/ui/SearchBar';
import { Avatar } from '@/components/ui/Avatar';
import { Dialog } from '@/components/ui/Dialog';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App } from '@capacitor/app';

interface NavigationItemProps {
  icon: string;
  label: string;
  path: string;
  badge?: number;
  isActive: boolean;
  onClick: () => void;
}

const NavigationItem: React.FC<NavigationItemProps> = ({
  icon,
  label,
  path,
  badge,
  isActive,
  onClick,
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleClick = async () => {
    if (isMobile) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
    onClick();
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, x: 4 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className={`
        flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200
        ${isActive 
          ? 'bg-primary-100 text-primary-900 shadow-sm border-l-4 border-primary-500' 
          : 'hover:bg-gray-50 dark:hover:bg-gray-800'}
      `}
    >
      <Icon 
        name={icon} 
        className={`
          w-5 h-5 mr-3 transition-transform duration-200
          ${isActive ? 'text-primary-600 scale-110' : 'text-gray-500'}
        `} 
      />
      <span className={`
        flex-1 font-medium transition-colors duration-200
        ${isActive ? 'text-primary-900' : 'text-gray-700 dark:text-gray-300'}
      `}>
        {label}
      </span>
      {badge && (
        <motion.span 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="bg-red-500 text-white rounded-full px-2 py-0.5 text-xs font-medium ml-2"
        >
          {badge}
        </motion.span>
      )}
    </motion.div>
  );
};

export const AppNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isMobile) {
      // Set up mobile-specific configurations
      StatusBar.setStyle({ style: isDarkMode ? Style.Dark : Style.Light });
      
      // Handle hardware back button
      App.addListener('backButton', ({ canGoBack }) => {
        if (canGoBack) {
          window.history.back();
        } else {
          App.minimizeApp();
        }
      });
    }
  }, [isMobile, isDarkMode]);

  const handleNavigate = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  const toggleDarkMode = async () => {
    if (isMobile) {
      await Haptics.impact({ style: ImpactStyle.Medium });
    }
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const renderNavigationItems = () => (
    <div className="space-y-2">
      {APP_MODULES.map(module => (
        <div key={module.id} className="mb-6">
          <h3 className="text-sm font-semibold text-gray-500 mb-2">
            {module.name}
          </h3>
          {module.features.map(feature => (
            <NavigationItem
              key={feature.id}
              icon={feature.id}
              label={feature.name}
              path={`/${module.id}/${feature.id}`}
              isActive={location.pathname.includes(`/${module.id}/${feature.id}`)}
              onClick={() => handleNavigate(`/${module.id}/${feature.id}`)}
              badge={feature.id === 'care-alerts' ? 3 : undefined}
            />
          ))}
        </div>
      ))}
    </div>
  );

  const renderMobileNavigation = () => (
    <>
      <motion.div
        initial={false}
        animate={{ y: mobileMenuOpen ? 0 : '100%' }}
        className="fixed inset-x-0 bottom-0 bg-white dark:bg-gray-900 shadow-lg rounded-t-xl z-50"
        style={{ height: '80vh' }}
      >
        <div className="p-4 overflow-y-auto h-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Menu</h2>
            <Button
              variant="ghost"
              onClick={() => setMobileMenuOpen(false)}
              icon="close"
            />
          </div>
          {renderNavigationItems()}
        </div>
      </motion.div>

      <motion.div
        className="fixed bottom-0 inset-x-0 bg-white dark:bg-gray-900 shadow-lg z-40 p-4"
        initial={false}
        animate={{ y: mobileMenuOpen ? '100%' : 0 }}
      >
        <div className="flex justify-around">
          <Button
            variant="ghost"
            icon="home"
            onClick={() => handleNavigate('/dashboard')}
          />
          <Button
            variant="ghost"
            icon="search"
            onClick={() => setIsSearchOpen(true)}
          />
          <Button
            variant="primary"
            icon="menu"
            onClick={() => setMobileMenuOpen(true)}
          />
          <Button
            variant="ghost"
            icon="notifications"
            onClick={() => handleNavigate('/notifications')}
            badge={3}
          />
          <Button
            variant="ghost"
            icon="person"
            onClick={() => handleNavigate('/profile')}
          />
        </div>
      </motion.div>
    </>
  );

  const renderDesktopNavigation = () => (
    <motion.div 
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-64 h-screen bg-white dark:bg-gray-900 shadow-lg flex flex-col"
    >
      <div className="p-4 border-b dark:border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <motion.img 
            src="/logo.svg" 
            alt="Logo" 
            className="h-8"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          />
          <Button
            variant="ghost"
            icon={isDarkMode ? 'light_mode' : 'dark_mode'}
            onClick={toggleDarkMode}
            className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
          />
        </div>

        <SearchBar
          placeholder="Search features..."
          onChange={() => {}}
          className="hover:shadow-sm transition-shadow duration-200"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {APP_MODULES.map(module => (
          <motion.div 
            key={module.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 px-3">
              {module.name}
            </h3>
            <div className="space-y-1">
              {module.features.map(feature => (
                <NavigationItem
                  key={feature.id}
                  icon={feature.id}
                  label={feature.name}
                  path={`/${module.id}/${feature.id}`}
                  isActive={location.pathname.includes(`/${module.id}/${feature.id}`)}
                  onClick={() => handleNavigate(`/${module.id}/${feature.id}`)}
                  badge={feature.id === 'care-alerts' ? 3 : undefined}
                />
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div 
        className="mt-auto border-t dark:border-gray-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="p-4">
          <div className="flex items-center space-x-3 rounded-lg p-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200">
            <Avatar 
              src={user?.avatar} 
              alt={user?.name} 
              className="ring-2 ring-primary-100 dark:ring-gray-700"
            />
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">{user?.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user?.role}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <>
      {isMobile ? renderMobileNavigation() : renderDesktopNavigation()}

      <Dialog
        open={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        title="Search"
      >
        <SearchBar
          placeholder="Search features, resources, or help..."
          onChange={() => {}}
          autoFocus
        />
      </Dialog>
    </>
  );
};

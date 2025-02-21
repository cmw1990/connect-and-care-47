import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { APP_MODULES } from '@/app.structure';
import { cn } from '@/lib/utils';
import {
  Home,
  Users,
  Heart,
  LifeBuoy,
  DollarSign,
  Package,
  MessageSquare,
  Settings,
  Menu,
} from 'lucide-react';

const MobileNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);

  const icons = {
    dashboard: Home,
    'care-network': Users,
    'care-management': Heart,
    support: LifeBuoy,
    financial: DollarSign,
    marketplace: Package,
    communication: MessageSquare,
    settings: Settings,
  };

  const mainModules = APP_MODULES.slice(0, 4); // Show only first 4 modules in bottom nav
  const moreModules = APP_MODULES.slice(4); // Rest in the menu

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 bg-background border-t border-border h-16 px-2"
      >
        <nav className="h-full max-w-lg mx-auto flex items-center justify-between">
          {mainModules.map((module) => {
            const Icon = icons[module.id as keyof typeof icons];
            const isActive = location.pathname.startsWith(module.path);

            return (
              <button
                key={module.id}
                onClick={() => handleNavigate(module.path)}
                className={cn(
                  "flex flex-col items-center justify-center w-16 h-16 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium truncate">
                  {module.title.split(' ')[0]}
                </span>
              </button>
            );
          })}

          <button
            onClick={() => setIsOpen(true)}
            className="flex flex-col items-center justify-center w-16 h-16 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Menu className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">More</span>
          </button>
        </nav>
      </motion.div>

      {/* More Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-background rounded-t-xl p-4 pb-8 max-h-[80vh] overflow-y-auto"
            >
              <div className="space-y-6">
                {moreModules.map((module) => {
                  const Icon = icons[module.id as keyof typeof icons];
                  const isActive = location.pathname.startsWith(module.path);

                  return (
                    <div key={module.id} className="space-y-2">
                      <button
                        onClick={() => handleNavigate(module.path)}
                        className={cn(
                          "flex items-center w-full p-2 rounded-lg transition-colors",
                          isActive ? "bg-primary/10 text-primary" : "hover:bg-muted"
                        )}
                      >
                        <Icon className="h-5 w-5 mr-3" />
                        <span className="font-medium">{module.title}</span>
                      </button>

                      <div className="pl-10 space-y-1">
                        {module.features.map((feature) => (
                          <button
                            key={feature.id}
                            onClick={() => handleNavigate(feature.path)}
                            className={cn(
                              "w-full text-left p-2 rounded-lg transition-colors text-sm",
                              location.pathname === feature.path
                                ? "text-primary"
                                : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            {feature.title}
                            {feature.beta && (
                              <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
                                Beta
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Settings */}
                <div>
                  <button
                    onClick={() => handleNavigate('/settings')}
                    className={cn(
                      "flex items-center w-full p-2 rounded-lg transition-colors",
                      location.pathname === '/settings'
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted"
                    )}
                  >
                    <Settings className="h-5 w-5 mr-3" />
                    <span className="font-medium">Settings</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileNav;

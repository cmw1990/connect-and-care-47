
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Navbar } from "@/components/navigation/navbar";
import { MobileNav } from "@/components/navigation/mobile-nav";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";
import Dashboard from "@/pages/Dashboard";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeProvider } from 'next-themes';
import { DevelopmentModeProvider } from '@/contexts/development-mode';
import { LanguageProvider } from '@/providers/LanguageProvider';
import "./App.css";

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" enableSystem>
      <DevelopmentModeProvider>
        <LanguageProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </LanguageProvider>
      </DevelopmentModeProvider>
    </ThemeProvider>
  );
}

function AppContent() {
  const isMobile = useIsMobile();
  const showNavbar = window.location.pathname !== '/auth';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {showNavbar && !isMobile && <Navbar />}
      <AnimatePresence mode="wait">
        <motion.main
          key={window.location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "flex-1 container mx-auto px-4 py-6",
            isMobile && "pb-20"
          )}
        >
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </motion.main>
      </AnimatePresence>
      {showNavbar && isMobile && <MobileNav />}
    </div>
  );
}

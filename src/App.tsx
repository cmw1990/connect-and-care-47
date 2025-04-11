
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { MobileNav } from '@/components/navigation/mobile-nav';
import { TopNavBar } from '@/components/navigation/TopNavBar';
import Index from '@/pages/Index';
import { Toaster } from '@/components/ui/toaster';
import { SleepTracker } from '@/components/health-wellness/SleepTracker';
import CareNetwork from '@/pages/CareNetwork';
import CareManagement from '@/pages/CareManagement';
import NotFound from '@/pages/NotFound';
import Coverage from '@/pages/insurance/Coverage';

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <Router>
        <div className="min-h-screen bg-background text-foreground">
          <TopNavBar />
          <main className="container mx-auto px-4 py-6">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<div>Dashboard</div>} />
              <Route path="/care-network" element={<CareNetwork />} />
              <Route path="/care-management" element={<CareManagement />} />
              <Route path="/sleep" element={<SleepTracker />} />
              <Route path="/support" element={<div>Support Page</div>} />
              <Route path="/settings" element={<div>Settings Page</div>} />
              <Route path="/profile" element={<div>Profile Page</div>} />
              <Route path="/auth" element={<div>Authentication Page</div>} />
              <Route path="/about" element={<div>About Us</div>} />
              
              {/* Insurance Routes */}
              <Route path="/insurance/coverage" element={<Coverage />} />
              
              {/* Wildcard Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <MobileNav />
          <Toaster />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;

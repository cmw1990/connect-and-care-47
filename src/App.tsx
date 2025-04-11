
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { MobileNav } from '@/components/navigation/mobile-nav';
import { TopNavBar } from '@/components/navigation/TopNavBar';
import Index from '@/pages/Index';
import { Toaster } from '@/components/ui/toaster';
import { SleepTracker } from '@/components/health-wellness/SleepTracker';

function App() {
  return (
    <ThemeProvider attribute="class">
      <Router>
        <div className="min-h-screen bg-white text-foreground">
          <TopNavBar />
          <main className="container mx-auto px-4 py-6">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<div>Dashboard</div>} />
              <Route path="/care-network" element={<div>Care Network</div>} />
              <Route path="/care-management" element={<div>Care Management</div>} />
              <Route path="/support" element={<div>Support</div>} />
              <Route path="/settings" element={<div>Settings</div>} />
              <Route path="/sleep" element={<SleepTracker />} />
              <Route path="/profile" element={<div>Profile</div>} />
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

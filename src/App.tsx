import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Subscribe from "@/pages/Subscribe";
import NotFound from "@/pages/NotFound";
import Dashboard from "@/pages/Dashboard";
import CareOverview from "@/pages/CareOverview";
import CareInsights from "@/pages/CareInsights";
import CareAlerts from "@/pages/CareAlerts";
import CareNetwork from "@/pages/CareNetwork";
import Caregivers from "@/pages/Caregivers";
import CaregiverJobs from "@/pages/caregivers/Jobs";
import CareHomes from "@/pages/care-homes/CareHomes";
import CareGroups from "@/pages/groups/CareGroups";
import CareManagement from "@/pages/CareManagement";
import HealthMonitoring from "@/pages/HealthMonitoring";
import MedicationManagement from "@/pages/MedicationManagement";
import Appointments from "@/pages/Appointments";
import CarePlans from "@/pages/CarePlans";
import SupportServices from "@/pages/SupportServices";
import MentalHealthSupport from "@/pages/MentalHealthSupport";
import CareGuides from "@/pages/CareGuides";
import CommunitySupport from "@/pages/CommunitySupport";
import CaregiverTraining from "@/pages/CaregiverTraining";
import FinancialManagement from "@/pages/FinancialManagement";
import Insurance from "@/pages/Insurance";
import Claims from "@/pages/insurance/Claims";
import Coverage from "@/pages/insurance/Coverage";
import Network from "@/pages/insurance/Network";
import Documents from "@/pages/insurance/Documents";
import CareExpenses from "@/pages/CareExpenses";
import BillingPayments from "@/pages/BillingPayments";
import CareMarketplace from "@/pages/CareMarketplace";
import CareEssentials from "@/pages/CareEssentials";
import CareServices from "@/pages/CareServices";
import MedicalEquipment from "@/pages/MedicalEquipment";
import Communication from "@/pages/Communication";
import Messages from "@/pages/Messages";
import CareUpdates from "@/pages/CareUpdates";
import CareDocuments from "@/pages/CareDocuments";
import Settings from "@/pages/Settings";
import Breadcrumbs from "@/components/ui/breadcrumbs"; // Import Breadcrumbs component
import { motion, AnimatePresence } from "framer-motion";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { ThemeProvider } from 'next-themes';
import { DevelopmentModeProvider } from '@/contexts/development-mode';
import { DevSuccessApple } from '@/components/development/dev-success-apple';
import { LanguageProvider } from '@/providers/LanguageProvider';
import "./App.css";

const AppContent = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const showNavbar = !location.pathname.includes('/auth');
  const isAuthPage = location.pathname.includes('/auth');

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {showNavbar && !isMobile && <Navbar />}
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "flex-1 container mx-auto px-4 py-6",
            isMobile && "pb-20", // Extra padding for mobile navigation
            isAuthPage && "max-w-md" // Narrow container for auth pages
          )}
        >
          {/* Show breadcrumbs on all pages except auth and home */}
          {showNavbar && location.pathname !== '/' && <Breadcrumbs />}
          
          {/* Main content area */}
          <div className="space-y-6">
            <Routes>
              {/* Core Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/subscribe" element={<Subscribe />} />
              <Route path="*" element={<NotFound />} />

              {/* Dashboard Module */}
              <Route path="/dashboard">
                <Route index element={<Dashboard />} />
                <Route path="overview" element={<CareOverview />} />
                <Route path="insights" element={<CareInsights />} />
                <Route path="notifications" element={<CareAlerts />} />
              </Route>

              {/* Care Network Module */}
              <Route path="/care-network">
                <Route index element={<CareNetwork />} />
                <Route path="caregivers" element={<Caregivers />} />
                <Route path="jobs" element={<CaregiverJobs />} />
                <Route path="facilities" element={<CareHomes />} />
                <Route path="groups" element={<CareGroups />} />
              </Route>

              {/* Care Management Module */}
              <Route path="/care-management">
                <Route index element={<CareManagement />} />
                <Route path="monitoring" element={<HealthMonitoring />} />
                <Route path="medications" element={<MedicationManagement />} />
                <Route path="appointments" element={<Appointments />} />
                <Route path="care-plan" element={<CarePlans />} />
              </Route>

              {/* Support Services Module */}
              <Route path="/support">
                <Route index element={<SupportServices />} />
                <Route path="mental-health" element={<MentalHealthSupport />} />
                <Route path="guides" element={<CareGuides />} />
                <Route path="community" element={<CommunitySupport />} />
                <Route path="training" element={<CaregiverTraining />} />
              </Route>

              {/* Financial Management Module */}
              <Route path="/financial">
                <Route index element={<FinancialManagement />} />
                <Route path="insurance" element={<Insurance />}>
                  <Route index element={<Coverage />} />
                  <Route path="claims" element={<Claims />} />
                  <Route path="network" element={<Network />} />
                  <Route path="documents" element={<Documents />} />
                </Route>
                <Route path="expenses" element={<CareExpenses />} />
                <Route path="billing" element={<BillingPayments />} />
              </Route>

              {/* Marketplace Module */}
              <Route path="/marketplace">
                <Route index element={<CareMarketplace />} />
                <Route path="essentials" element={<CareEssentials />} />
                <Route path="services" element={<CareServices />} />
                <Route path="equipment" element={<MedicalEquipment />} />
              </Route>

              {/* Communication Module */}
              <Route path="/communication">
                <Route index element={<Communication />} />
                <Route path="messages" element={<Messages />} />
                <Route path="updates" element={<CareUpdates />} />
                <Route path="documents" element={<CareDocuments />} />
              </Route>

              {/* Settings */}
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </div>
        </motion.main>
      </AnimatePresence>
      {showNavbar && isMobile && <MobileNav />}
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" enableSystem>
      <DevelopmentModeProvider>
        <I18nextProvider i18n={i18n}>
          <LanguageProvider>
            <BrowserRouter>
              <AppContent />
              <DevSuccessApple />
            </BrowserRouter>
          </LanguageProvider>
        </I18nextProvider>
      </DevelopmentModeProvider>
    </ThemeProvider>
  );
}

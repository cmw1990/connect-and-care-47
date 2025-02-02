import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Groups from "@/pages/Groups";
import GroupDetails from "@/pages/GroupDetails";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";
import { CareComparison } from "@/components/comparison/CareComparison";
import { CareGuides } from "@/pages/CareGuides";
import { Navbar } from "@/components/navigation/navbar";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/groups/:groupId" element={<GroupDetails />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/compare" element={<CareComparison />} />
            <Route path="/care-guides" element={<CareGuides />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
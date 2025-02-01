import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Groups from "@/pages/Groups";
import GroupDetails from "@/pages/GroupDetails";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/groups" element={<Groups />} />
        <Route path="/groups/:groupId" element={<GroupDetails />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
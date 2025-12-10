
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";
import LoginAdmin from "./pages/LoginAdmin";
import LoginStaff from "./pages/LoginStaff";
import Dashboard from "./pages/Dashboard";
import Bookings from "./pages/Bookings";
import BookingForm from "./pages/BookingForm";
import Inventory from "./pages/Inventory";
import Venues from "./pages/Venues";
import EventPlanning from "./pages/EventPlanning";
import Catering from "./pages/Catering";
import Staff from "./pages/Staff";
import Billing from "./pages/Billing";
import ClientManagement from "./pages/ClientManagement";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import EditBooking from "./pages/EditBooking";
import RequirePageAccess from './components/RequirePageAccess';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} key="index" />
          <Route path="/landing" element={<Landing />} key="landing" />
          <Route path="/login-admin" element={<LoginAdmin />} key="login-admin" />
          <Route path="/login-staff" element={<LoginStaff />} key="login-staff" />
          <Route path="/dashboard" element={<RequirePageAccess pageKey="dashboard"><Dashboard /></RequirePageAccess>} key="dashboard" />
          <Route path="/bookings" element={<RequirePageAccess pageKey="bookings"><Bookings /></RequirePageAccess>} key="bookings" />
          <Route path="/bookings/new" element={<RequirePageAccess pageKey="bookings"><BookingForm /></RequirePageAccess>} key="new-booking" />
          <Route path="/inventory" element={<Inventory />} key="inventory" />
          <Route path="/inventory" element={<RequirePageAccess pageKey="inventory"><Inventory /></RequirePageAccess>} key="inventory" />
          <Route path="/venues" element={<RequirePageAccess pageKey="venues"><Venues /></RequirePageAccess>} key="venues" />
          <Route path="/event-planning" element={<RequirePageAccess pageKey="event_planning"><EventPlanning /></RequirePageAccess>} key="event-planning" />
          <Route path="/catering" element={<RequirePageAccess pageKey="catering"><Catering /></RequirePageAccess>} key="catering" />
          <Route path="/staff" element={<RequirePageAccess pageKey="staff"><Staff /></RequirePageAccess>} key="staff" />
          <Route path="/billing" element={<RequirePageAccess pageKey="billing"><Billing /></RequirePageAccess>} key="billing" />
          <Route path="/clients" element={<RequirePageAccess pageKey="clients"><ClientManagement /></RequirePageAccess>} key="clients" />
          <Route path="/reports" element={<RequirePageAccess pageKey="reports"><Reports /></RequirePageAccess>} key="reports" />
          <Route path="/settings" element={<RequirePageAccess pageKey="settings"><Settings /></RequirePageAccess>} key="settings" />
          <Route path="/bookings/edit/:id" element={<EditBooking />} key="edit-booking" />
          <Route path="*" element={<NotFound />} key="not-found" />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

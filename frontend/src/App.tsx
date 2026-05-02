import { BookingProvider } from './context/BookingContext';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Home from './pages/Home';
import EventDetails from './pages/EventDetails';
import SeatSelection from './pages/SeatSelection';
import MyTickets from './pages/MyTickets';
import TicketView from './pages/TicketView';
import RoleSelection from './pages/RoleSelection';
import HostDashboard from './pages/HostDashboard';
import AddEvent from './pages/AddEvent';
import VenueSelection from './pages/VenueSelection';
import HostSeatRemoval from './pages/HostSeatRemoval';
import HostVenuePricing from './pages/HostVenuePricing';
import HostNoSeatsVenue from './pages/HostNoSeatsVenue';
import HostEventDetails from './pages/HostEventDetails';
import HostRoomOutline from './pages/HostRoomOutline';
import { Payment } from './pages/checkout/Payment';
import SuccessPage from './pages/checkout/SuccessPage';
import ThemeToggle from './components/layout/ThemeToggle';
import CustomerProfile from './pages/CustomerProfile';
import CompanyProfile from './pages/CompanyProfile';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import HostOnboarding from './pages/HostOnboarding';
import { useLocation } from 'react-router-dom';


const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  return isLoggedIn ? <>{children}</> : <Navigate to="/login" replace />;
};

const AppLayout = () => {
  const { pathname } = useLocation();

  const showFloatingThemeToggle = [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/role-selection',
  ].includes(pathname);

  return (
    <div className="min-h-screen bg-[#faf9f0] flex flex-col font-sans">
      {showFloatingThemeToggle && (
        <div className="fixed bottom-5 right-5 z-[200]">
          <ThemeToggle className="h-12 w-12 border-[#d3265b]/60 bg-[#3a0e23] text-[#ffbcc7] shadow-2xl hover:bg-[#4a1230] hover:text-white" />
        </div>
      )}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected Routes */}
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/role-selection" element={<ProtectedRoute><RoleSelection /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><CustomerProfile /></ProtectedRoute>} />
        <Route path="/company-profile" element={<ProtectedRoute><CompanyProfile /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/host-onboarding" element={<ProtectedRoute><HostOnboarding /></ProtectedRoute>} />
        <Route path="/host-dashboard" element={<ProtectedRoute><HostDashboard /></ProtectedRoute>} />
        <Route path="/host-dashboard/add-event" element={<ProtectedRoute><AddEvent /></ProtectedRoute>} />
        <Route path="/host-dashboard/add-event/venue" element={<ProtectedRoute><VenueSelection /></ProtectedRoute>} />
        <Route path="/host-dashboard/add-event/venue/:id/seating" element={<ProtectedRoute><HostSeatRemoval /></ProtectedRoute>} />
        <Route path="/host-dashboard/add-event/venue/:id/pricing" element={<ProtectedRoute><HostVenuePricing /></ProtectedRoute>} />
        <Route path="/host-dashboard/add-event/venue/:id/configure-no-seats" element={<ProtectedRoute><HostNoSeatsVenue /></ProtectedRoute>} />
        <Route path="/host-dashboard/event/:id" element={<ProtectedRoute><HostEventDetails /></ProtectedRoute>} />
        <Route path="/host-dashboard/event/:id/room-outline" element={<ProtectedRoute><HostRoomOutline /></ProtectedRoute>} />
        <Route path="/event/:id" element={<ProtectedRoute><EventDetails /></ProtectedRoute>} />
        <Route path="/success" element={<ProtectedRoute><SuccessPage /></ProtectedRoute>} />
        <Route path="/checkout/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
        <Route path="/checkout/:id" element={<ProtectedRoute><SeatSelection /></ProtectedRoute>} />
        <Route path="/my-tickets" element={<ProtectedRoute><MyTickets /></ProtectedRoute>} />
        <Route path="/my-tickets/:id" element={<ProtectedRoute><TicketView /></ProtectedRoute>} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <BookingProvider>
    <Router>
      <AppLayout />
    </Router>
    </BookingProvider>
  );
}

export default App;
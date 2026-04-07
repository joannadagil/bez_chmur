// App.tsx
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
import RoleSelection from './pages/RoleSelection';
import HostDashboard from './pages/HostDashboard';
import { Payment } from './pages/checkout/Payment';
import SuccessPage from './pages/checkout/SuccessPage';


const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  return isLoggedIn ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <BookingProvider>
    <Router>
      <div className="min-h-screen bg-[#faf9f0] flex flex-col font-sans">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected Routes */}
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/role-selection" element={<ProtectedRoute><RoleSelection /></ProtectedRoute>} />
          <Route path="/host-dashboard" element={<ProtectedRoute><HostDashboard /></ProtectedRoute>} />
          <Route path="/event/:id" element={<ProtectedRoute><EventDetails /></ProtectedRoute>} />
          <Route path="/checkout/success" element={<ProtectedRoute><SuccessPage /></ProtectedRoute>} />
          <Route path="/checkout/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
          <Route path="/checkout/:id" element={<ProtectedRoute><SeatSelection /></ProtectedRoute>} />
          <Route path="/my-tickets" element={<ProtectedRoute><MyTickets /></ProtectedRoute>} />
        </Routes>
      </div>
    </Router>
    </BookingProvider>
  );
}

export default App;
// App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import EventDetails from './pages/EventDetails';
import SeatSelection from './pages/SeatSelection';
import MyTickets from './pages/MyTickets';
import { Payment } from './pages/checkout/Payment';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#faf9f0] flex flex-col font-sans">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/event/:id" element={<EventDetails />} />
          <Route path="/checkout/payment" element={<Payment />} />
          <Route path="/checkout/:id" element={<SeatSelection />} />
          <Route path="/my-tickets" element={<MyTickets />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
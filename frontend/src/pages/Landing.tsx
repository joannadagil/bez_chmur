import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import logo from '../assets/logo.png';

const Landing = () => {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f27690] via-[#ffbb9c] to-[#fff2c4]" style={{ fontFamily: 'TT Firs Neue, sans-serif' }}>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <img
                src={logo}
                alt="getAroom Logo"
                className="w-28 h-28 object-contain cursor-pointer"
                onClick={() => navigate(isLoggedIn ? '/home' : '/login')}
              />
            </div>

            <h1 className="text-6xl lg:text-7xl font-black text-[#d3265b] uppercase tracking-tighter italic leading-none mb-6" style={{ fontFamily: 'Placard Next, sans-serif' }}>
              find or create your next event
            </h1>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/register"
                className="bg-[#d3265b] text-white px-8 py-4 rounded-full font-black uppercase tracking-wider hover:bg-[#b81d4a] transition-all transform hover:scale-105 shadow-lg flex items-center gap-3"
              >
                Get Started
                <ArrowRight className="w-6 h-6" />
              </Link>

              <Link
                to="/login"
                className="bg-white/20 backdrop-blur-sm text-[#d3265b] px-8 py-4 rounded-full font-black uppercase tracking-wider hover:bg-white/30 transition-all border-2 border-white/30"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-4 h-4 bg-white/20 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-6 h-6 bg-white/10 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-3 h-3 bg-white/15 rounded-full animate-pulse delay-500"></div>
      </div>
    </div>
  );
};

export default Landing;
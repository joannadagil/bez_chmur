import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Building2, ArrowRight } from 'lucide-react';
import logo from '../assets/logo.png';

const RoleSelection = () => {
  const [selectedRole, setSelectedRole] = useState<'customer' | 'host' | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [nip, setNip] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRoleSelect = (role: 'customer' | 'host') => {
    setSelectedRole(role);
  };

  const handleContinue = async () => {
    if (!selectedRole) return;

    setIsLoading(true);

    if (selectedRole === 'customer') {
      // Navigate to customer home
      setTimeout(() => {
        navigate('/home');
      }, 1000);
    } else {
      // For host, validate company details
      if (!companyName.trim() || !nip.trim()) {
        alert('Please fill in all company details');
        setIsLoading(false);
        return;
      }

      if (!/^[0-9]{10}$/.test(nip)) {
        alert('NIP must be exactly 10 digits');
        setIsLoading(false);
        return;
      }

      // Navigate to host home
      setTimeout(() => {
        navigate('/host-dashboard');
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f27690] via-[#ffbb9c] to-[#fff2c4] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <img
              src={logo}
              alt="getAroom Logo"
              className="w-24 h-24 object-contain cursor-pointer"
              onClick={() => navigate(localStorage.getItem('isLoggedIn') === 'true' ? '/home' : '/login')}
            />
          </div>
          <h1 className="text-4xl font-black text-[#d3265b] uppercase tracking-tighter italic mb-2" style={{ fontFamily: 'Placard Next, sans-serif' }}>
            find or create your next event
          </h1>
          <p className="text-white/80 font-medium text-lg">
            Almost done! Now, tell us if you're going to be attending events or organising them:
          </p>
        </div>

        {/* Role Selection */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Customer Card */}
            <div
              onClick={() => handleRoleSelect('customer')}
              className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                selectedRole === 'customer'
                  ? 'border-[#e71555] bg-[#e71555]/5 shadow-lg'
                  : 'border-gray-200 hover:border-[#f05258] hover:shadow-md'
              }`}
            >
              <div className="text-center">
                <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                  selectedRole === 'customer' ? 'bg-[#e71555]' : 'bg-[#f05258]'
                }`}>
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-black text-[#3a0e23] uppercase tracking-wider mb-2">
                  Attend Events
                </h3>
                <p className="text-gray-600 font-medium text-sm leading-relaxed">
                  Discover amazing events, book tickets, and create unforgettable memories
                </p>
              </div>
            </div>

            {/* Host Card */}
            <div
              onClick={() => handleRoleSelect('host')}
              className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                selectedRole === 'host'
                  ? 'border-[#e71555] bg-[#e71555]/5 shadow-lg'
                  : 'border-gray-200 hover:border-[#f05258] hover:shadow-md'
              }`}
            >
              <div className="text-center">
                <div className="text-center">
                  <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                    selectedRole === 'host' ? 'bg-[#e71555]' : 'bg-[#f05258]'
                  }`}>
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-black text-[#3a0e23] uppercase tracking-wider mb-2">
                    Organise Events
                  </h3>
                  <p className="text-gray-600 font-medium text-sm leading-relaxed">
                    Create and manage your own events, reach audiences, and grow your business
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Host Details Form */}
          {selectedRole === 'host' && (
            <div className="space-y-4 mb-6 p-6 bg-[#f5f5dc] rounded-2xl border border-[#e71555]/20">
              <h4 className="text-lg font-black text-[#3a0e23] uppercase tracking-wider mb-4">
                Company Details
              </h4>

              <div>
                <label className="block text-sm font-bold text-[#3a0e23] uppercase tracking-wider mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl bg-[#f05258]/10 border-white/30 focus:outline-none focus:border-white focus:ring-1 focus:ring-white/50 transition-colors font-medium text-[#3a0e23]"
                  placeholder="Your Company Name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#3a0e23] uppercase tracking-wider mb-2">
                  NIP (Tax Number)
                </label>
                <input
                  type="text"
                  value={nip}
                  onChange={(e) => setNip(e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl bg-[#f05258]/10 border-white/30 focus:outline-none focus:border-white focus:ring-1 focus:ring-white/50 transition-colors font-medium text-[#3a0e23]"
                  placeholder="1234567890"
                  required
                />
              </div>
            </div>
          )}

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            disabled={!selectedRole || isLoading || (selectedRole === 'host' && (!companyName.trim() || !nip.trim()))}
            className="w-full bg-[#e71555] text-white py-4 px-6 rounded-xl font-black uppercase tracking-wider hover:bg-[#d3265b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
          >
            {isLoading ? (
              <>
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Setting Up...
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="w-6 h-6" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, CheckCircle, ArrowLeft } from 'lucide-react';
import logo from '../assets/logo.png';
import logo_white from '../assets/logo_white.png';
import { useTheme } from '../context/ThemeContext';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const { isDark } = useTheme();
  const authLogo = isDark ? logo_white : logo;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 1500);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f27690] via-[#ffbb9c] to-[#fff2c4] flex items-center justify-center p-4" style={{ fontFamily: 'TT Firs Neue, sans-serif' }}>
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <img src={authLogo} alt="getAroom Logo" className="w-250 h-30 object-contain cursor-pointer" />
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-6 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>

            <h2 className="text-2xl font-black text-[#3a0e23] uppercase tracking-tighter mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Check Your Email
            </h2>

            <p className="text-gray-600 font-medium mb-6 leading-relaxed" style={{ fontFamily: 'TT Firs Neue, sans-serif' }}>
              We've sent password reset instructions to <strong>{email}</strong>.
              Please check your email and follow the link to reset your password.
            </p>

            <div className="space-y-3">
              <p className="text-sm text-gray-500" style={{ fontFamily: 'TT Firs Neue, sans-serif' }}>
                Didn't receive the email? Check your spam folder or{' '}
                <button
                  onClick={() => setIsSuccess(false)}
                  className="text-[#e71555] font-bold hover:text-[#f05258] transition-colors"
                >
                  try again
                </button>
              </p>

              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-[#e71555] font-bold hover:text-[#f05258] transition-colors uppercase tracking-wider text-sm"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f27690] via-[#ffbb9c] to-[#fff2c4] flex items-center justify-center p-4" style={{ fontFamily: 'TT Firs Neue, sans-serif' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <img
              src={authLogo}
              alt="getAroom Logo"
              className="w-250 h-30 object-contain cursor-pointer"
              onClick={() => navigate(isLoggedIn ? '/home' : '/login')}
            />
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-2xl font-black text-[#d3265b] uppercase tracking-tighter mb-6 text-center" style={{ fontFamily: 'TT Firs Neue, sans-serif' }}>
            Forgot your password?
          </h2>

          <p className="text-[#d3265b] font-medium text-center mb-6 leading-relaxed" style={{ fontFamily: 'TT Firs Neue, sans-serif' }}>
            It happens :-(
            <br />
            But with us you will NEVER forget an event
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-[#3a0e23] uppercase tracking-wider mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-3 pl-12 border rounded-xl bg-[#f05258]/10 text-[#3a0e23] border-white/30 focus:outline-none focus:border-white focus:ring-1 focus:ring-white/50 transition-colors font-medium ${
                    error ? 'border-red-300 focus:border-red-500' : 'border-white/30 focus:border-white'
                  }`}
                  placeholder="your@email.com"
                  required
                  style={{ fontFamily: 'TT Firs Neue, sans-serif' }}
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              {error && <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#e71555] text-white py-4 px-6 rounded-xl font-black uppercase tracking-wider hover:bg-[#d3265b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              {isLoading ? (
                <>
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending Reset Link...
                </>
              ) : (
                <>
                  Send Reset Link
                  <ArrowRight className="w-6 h-6" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-[#e71555] font-bold hover:text-[#f05258] transition-colors uppercase tracking-wider"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
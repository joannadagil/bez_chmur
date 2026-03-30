import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Users, Building2 } from 'lucide-react';
import logo from '../assets/logo.png';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'customer' as 'customer' | 'host'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validatePassword = (password: string): boolean => {
    // At least 8 characters, one uppercase, one number, one special character
    const minLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    return minLength && hasUppercase && hasNumber && hasSpecialChar;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';

    if (!formData.password) newErrors.password = 'Password is required';
    else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters with uppercase, number, and special character';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    // Check if user exists and password matches
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const user = registeredUsers.find((u: any) => u.email === formData.email);

    if (!user) {
      setErrors({ email: 'No account found with this email address' });
      setIsLoading(false);
      return;
    }

    if (user.password !== formData.password) {
      setErrors({ password: 'Incorrect password' });
      setIsLoading(false);
      return;
    }

    // Simulate login - replace with actual authentication
    setTimeout(() => {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('currentUser', JSON.stringify(user));
      setIsLoading(false);
      if (formData.userType === 'customer') {
        navigate('/home');
      } else {
        navigate('/role-selection');
      }
    }, 1500);
  };

  const handleQuickLogin = () => {
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const quickUser = registeredUsers.find((u: any) => u.email === 'john.doe@example.com');

    if (quickUser) {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('currentUser', JSON.stringify(quickUser));
      navigate('/home');
    } else {
      // If quick user doesn't exist, create it
      const newUser = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password123!',
        createdAt: new Date().toISOString()
      };
      registeredUsers.push(newUser);
      localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      navigate('/home');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f27690] via-[#ffbb9c] to-[#fff2c4] flex items-center justify-center p-4" style={{ fontFamily: 'TT Firs Neue, sans-serif' }}>
      <div className="w-full max-w-md">
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
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-2xl font-black text-[#3a0e23] uppercase tracking-tighter mb-6 text-center" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Welcome Back
          </h2>

          {/* Quick Login Button */}
          <button
            onClick={handleQuickLogin}
            className="w-full mb-6 bg-[#f5f5dc] text-[#3a0e23] py-3 px-4 rounded-xl font-bold hover:bg-[#e71555] hover:text-white transition-colors border-2 border-[#e71555] flex items-center justify-center gap-2"
          >
            <User className="w-5 h-5" />
            Log in as John Doe
          </button>

          {/* User Type Selection */}
          <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-xl">
            <button
              onClick={() => setFormData(prev => ({ ...prev, userType: 'customer' }))}
              className={`flex-1 py-2 px-4 rounded-lg font-bold uppercase tracking-wider text-sm transition-colors flex items-center justify-center gap-2 ${
                formData.userType === 'customer'
                  ? 'bg-[#e71555] text-white'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Users className="w-4 h-4" />
              Customer
            </button>
            <button
              onClick={() => setFormData(prev => ({ ...prev, userType: 'host' }))}
              className={`flex-1 py-2 px-4 rounded-lg font-bold uppercase tracking-wider text-sm transition-colors flex items-center justify-center gap-2 ${
                formData.userType === 'host'
                  ? 'bg-[#e71555] text-white'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Host
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-[#3a0e23] uppercase tracking-wider mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 pl-12 border rounded-xl bg-[#f05258]/10 border-white/30 focus:outline-none transition-colors font-medium ${
                    errors.email ? 'border-red-300 focus:border-red-500' : 'border-white/30 focus:border-white'
                  }`}
                  placeholder="your@email.com"
                  required
                  style={{ fontFamily: 'TT Firs Neue, sans-serif' }}
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-[#3a0e23] uppercase tracking-wider mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 pl-12 pr-12 border rounded-xl bg-[#f05258]/10 border-white/30 focus:outline-none transition-colors font-medium ${
                    errors.password ? 'border-red-300 focus:border-red-500' : 'border-white/30 focus:border-white'
                  }`}
                  placeholder="••••••••"
                  required
                  style={{ fontFamily: 'TT Firs Neue, sans-serif' }}
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#e71555] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1 font-medium">{errors.password}</p>}
            </div>

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm font-bold text-[#e71555] hover:text-[#f05258] transition-colors uppercase tracking-wider"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                Forgot Password?
              </Link>
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
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-6 h-6" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 font-medium" style={{ fontFamily: 'TT Firs Neue, sans-serif' }}>
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-[#e71555] font-bold hover:text-[#f05258] transition-colors uppercase tracking-wider"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
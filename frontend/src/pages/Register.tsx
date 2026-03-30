import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, UserPlus } from 'lucide-react';
import logo from '../assets/logo.png';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters with uppercase, number, and special character';
    }
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    // Check if user already exists
    const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const userExists = existingUsers.some((user: any) => user.email === formData.email);

    if (userExists) {
      setErrors({ email: 'An account with this email already exists' });
      setIsLoading(false);
      return;
    }

    // Store user data
    const newUser = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password, // In real app, this should be hashed
      createdAt: new Date().toISOString()
    };

    existingUsers.push(newUser);
    localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));

    // Simulate registration - replace with actual API call
    setTimeout(() => {
      setIsLoading(false);
      navigate('/login');
    }, 1500);
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
              className="w-250 h-30 object-contain cursor-pointer" 
              onClick={() => navigate('/')}
            />
          </div>
          {/*<h1 className="text-4xl font-black text-white uppercase tracking-tighter italic mb-2" style={{ fontFamily: 'Placard Next, sans-serif' }}>
            find or create your next event
          </h1>*/}
        </div>

        {/* Register Form */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-2xl font-black text-[#3a0e23] uppercase tracking-tighter mb-6 text-center" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Create Account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-[#3a0e23] uppercase tracking-wider mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  First Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 pl-12 border rounded-xl bg-[#f05258]/10 border-white/30 focus:outline-none transition-colors font-medium ${
                      errors.firstName ? 'border-red-300 focus:border-red-500' : 'border-white/30 focus:border-white'
                    }`}
                    placeholder="John"
                    required
                    style={{ fontFamily: 'TT Firs Neue, sans-serif' }}
                  />
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                {errors.firstName && <p className="text-red-500 text-xs mt-1 font-medium">{errors.firstName}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-[#3a0e23] uppercase tracking-wider mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Last Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 pl-12 border rounded-xl bg-[#f05258]/10 border-white/30 focus:outline-none transition-colors font-medium ${
                      errors.lastName ? 'border-red-300 focus:border-red-500' : 'border-white/30 focus:border-white'
                    }`}
                    placeholder="Doe"
                    required
                    style={{ fontFamily: 'TT Firs Neue, sans-serif' }}
                  />
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                {errors.lastName && <p className="text-red-500 text-xs mt-1 font-medium">{errors.lastName}</p>}
              </div>
            </div>

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
                  className={`w-full px-4 py-3 pl-12 border rounded-xl bg-[#f05258]/10 text-[#3a0e23] border-white/30 focus:outline-none transition-colors font-medium ${
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

            <div>
              <label className="block text-sm font-bold text-[#3a0e23] uppercase tracking-wider mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 pl-12 pr-12 border rounded-xl bg-[#f05258]/10 border-white/30 focus:outline-none transition-colors font-medium ${
                    errors.confirmPassword ? 'border-red-300 focus:border-red-500' : 'border-white/30 focus:border-white'
                  }`}
                  placeholder="••••••••"
                  required
                  style={{ fontFamily: 'TT Firs Neue, sans-serif' }}
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#e71555] transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 font-medium">{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#e71555] text-white py-4 px-6 rounded-xl font-black uppercase tracking-wider hover:bg-[#d3265b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-6"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              {isLoading ? (
                <>
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus className="w-6 h-6" />
                  Create Account
                  <ArrowRight className="w-6 h-6" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 font-medium" style={{ fontFamily: 'TT Firs Neue, sans-serif' }}>
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-[#e71555] font-bold hover:text-[#f05258] transition-colors uppercase tracking-wider"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
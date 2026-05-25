import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiHome, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'user' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!formData.name.trim()) e.name = 'Name is required';
    else if (formData.name.length < 2) e.name = 'Name must be at least 2 characters';
    if (!formData.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = 'Invalid email';
    if (!formData.password) e.password = 'Password is required';
    else if (formData.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      const { data } = await register({ name: formData.name, email: formData.email, password: formData.password, role: formData.role });
      loginUser(data.user, data.token);
      toast.success(`Welcome to StayHub, ${data.user.name}! 🎉`);
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = () => {
    const p = formData.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };

  const strength = passwordStrength();
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['', 'bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-400'];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f3460 0%, #16213e 60%, #1a1a2e 100%)' }}
      >
        <div className="absolute inset-0 opacity-20">
          <div className="absolute bottom-20 left-10 w-72 h-72 bg-primary-500 rounded-full filter blur-3xl" />
          <div className="absolute top-20 right-10 w-72 h-72 bg-purple-500 rounded-full filter blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-between p-12">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl airbnb-gradient flex items-center justify-center">
              <FiHome className="text-white text-xl" />
            </div>
            <span className="text-2xl font-bold text-white font-display">StayHub</span>
          </Link>
          <div>
            <h2 className="text-4xl font-bold text-white font-display mb-4 leading-tight">
              Join millions of<br />travelers worldwide
            </h2>
            <p className="text-white/70 text-lg mb-10">
              Create an account and start exploring unique stays around the world.
            </p>
            <div className="space-y-4">
              {[
                'Access 50,000+ verified properties',
                'Secure and instant bookings',
                'Earn rewards on every stay',
                'List your own property and earn',
              ].map((benefit) => (
                <div key={benefit} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-400 flex items-center justify-center flex-shrink-0">
                    <FiCheck className="text-white text-xs" />
                  </div>
                  <span className="text-white/80 text-sm">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <Link to="/" className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-9 h-9 rounded-xl airbnb-gradient flex items-center justify-center">
              <FiHome className="text-white" />
            </div>
            <span className="text-xl font-bold text-primary-500 font-display">StayHub</span>
          </Link>

          <h1 className="text-3xl font-bold font-display text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-500 mb-8">Join StayHub and start exploring</p>

          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className={`input-field pl-10 ${errors.name ? 'border-red-400' : ''}`}
                />
              </div>
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email address</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={`input-field pl-10 ${errors.email ? 'border-red-400' : ''}`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Account Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, role: 'user' }))}
                  className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                    formData.role === 'user'
                      ? 'border-primary-500 bg-primary-50 text-primary-600'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  🧳 Traveler
                </button>
                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, role: 'host' }))}
                  className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                    formData.role === 'host'
                      ? 'border-primary-500 bg-primary-50 text-primary-600'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  🏠 Host
                </button>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-400' : ''}`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {formData.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((s) => (
                      <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${strength >= s ? strengthColors[strength] : 'bg-gray-200'}`} />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${['', 'text-red-500', 'text-yellow-600', 'text-blue-500', 'text-green-500'][strength]}`}>
                    {strengthLabels[strength]}
                  </p>
                </div>
              )}
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat your password"
                  className={`input-field pl-10 ${errors.confirmPassword ? 'border-red-400' : ''}`}
                />
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

            <button type="submit" disabled={loading} className="w-full btn-primary py-3.5 text-base airbnb-gradient">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-500 font-semibold hover:text-primary-600 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

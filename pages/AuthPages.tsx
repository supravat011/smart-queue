import React, { useState } from 'react';
import { UserRole, User } from '../types';
import { Link } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, Phone, Shield } from 'lucide-react';

interface AuthPageProps {
  mode: 'login' | 'register';
  onLogin: (user: User) => void;
}

const AuthPages: React.FC<AuthPageProps> = ({ mode, onLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: UserRole.NORMAL
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const { authAPI } = await import('../services/api');
        const response: any = await authAPI.login(formData.email, formData.password);

        console.log('Login response:', response); // Debug log

        // Validate response structure
        if (!response.user) {
          throw new Error('Invalid response from server: missing user data');
        }

        // Store token
        localStorage.setItem('token', response.access_token);

        // Use user info from login response
        const newUser: User = {
          id: response.user.id.toString(),
          name: response.user.name,
          email: response.user.email,
          role: response.user.role as UserRole,
          token: response.access_token
        };

        onLogin(newUser);
      } else {
        const { authAPI } = await import('../services/api');
        await authAPI.register({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          role: formData.role
        });
        // Auto-login after registration
        const response: any = await authAPI.login(formData.email, formData.password);
        localStorage.setItem('token', response.access_token);

        const newUser: User = {
          id: response.user.id.toString(),
          name: response.user.name,
          email: response.user.email,
          role: response.user.role as UserRole,
          token: response.access_token
        };

        onLogin(newUser);
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-background px-4 py-12">
      <div className="max-w-md w-full bg-white p-10 rounded-2xl border border-gray-100 shadow-xl">
        <div className="mb-8">
          <span className="text-primary text-xs font-bold uppercase tracking-widest block mb-2">
            {mode === 'login' ? 'Authentication' : 'Registration'}
          </span>
          <h2 className="text-4xl font-bold text-navy mb-2">
            {mode === 'login' ? 'Welcome Back' : 'Join SmartQueue'}
          </h2>
          <p className="text-sm text-gray-500 font-medium">
            {mode === 'login' ? "Access your dashboard." : "Start optimizing your time today."}
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          <div className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Full Name</label>
                  <div className="relative">
                    <input
                      name="name"
                      type="text"
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-navy focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                      placeholder="Enter name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Phone</label>
                  <div className="relative">
                    <input
                      name="phone"
                      type="tel"
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-navy focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                      placeholder="Enter phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Email</label>
              <div className="relative">
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-navy focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type="password"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-navy focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Account Type</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-navy focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                >
                  <option value={UserRole.NORMAL}>Normal User</option>
                  <option value={UserRole.SENIOR}>Senior Citizen (Priority)</option>
                  <option value={UserRole.VIP}>VIP Access</option>
                  <option value={UserRole.ADMIN}>Administrator (Demo)</option>
                </select>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-4 px-4 border border-transparent rounded-full text-sm font-bold uppercase tracking-widest text-white bg-primary hover:bg-navy focus:outline-none transform transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Please wait...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
          </button>

          <div className="text-center mt-4">
            <Link to={mode === 'login' ? '/register' : '/login'} className="text-xs font-semibold text-gray-500 hover:text-primary transition-colors">
              {mode === 'login' ? 'Create a new account' : 'Already have an account? Sign in'}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthPages;
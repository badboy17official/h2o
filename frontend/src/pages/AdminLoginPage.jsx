import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useThemeStore } from '../store/store';
import { authAPI } from '../services/api';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { theme } = useThemeStore();
  const isElegant = theme === 'elegant';
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.adminLogin(formData);
      login({ ...response.data.admin, role: 'admin' }, response.data.token);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 ${
      isElegant
        ? 'bg-gradient-to-br from-purple-50 via-white to-pink-50'
        : 'bg-gray-900 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900'
    }`}>
      <div className="max-w-md w-full">
        <div className={`rounded-2xl p-8 ${
          isElegant
            ? 'bg-white shadow-2xl'
            : 'glass border-2 border-neon-purple shadow-[0_0_30px_rgba(180,0,255,0.3)]'
        }`}>
          <div className="text-center mb-8">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              isElegant
                ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                : 'bg-neon-purple bg-opacity-20 border-2 border-neon-purple'
            }`}>
              <svg className={`w-8 h-8 ${isElegant ? 'text-white' : 'text-neon-purple'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 className={`text-3xl font-bold ${
              isElegant
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'
                : 'text-neon-purple drop-shadow-[0_0_10px_rgba(180,0,255,0.5)]'
            }`}>
              Admin Login
            </h2>
            <p className={`mt-2 ${isElegant ? 'text-gray-600' : 'text-gray-300'}`}>
              Access the admin dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isElegant ? 'text-gray-700' : 'text-gray-300'
              }`}>
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                autoComplete="off"
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                  isElegant
                    ? 'border-gray-200 focus:border-purple-500'
                    : 'bg-gray-800 bg-opacity-50 border-neon-purple focus:border-neon-pink text-white placeholder-gray-500'
                }`}
                placeholder="Enter admin username"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isElegant ? 'text-gray-700' : 'text-gray-300'
              }`}>
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="off"
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                  isElegant
                    ? 'border-gray-200 focus:border-purple-500'
                    : 'bg-gray-800 bg-opacity-50 border-neon-purple focus:border-neon-pink text-white placeholder-gray-500'
                }`}
                placeholder="Enter admin password"
              />
            </div>

            {error && (
              <div className={`px-4 py-3 rounded-lg border-2 ${
                isElegant
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : 'bg-red-900 bg-opacity-50 border-red-500 text-red-200'
              }`}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                isElegant
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl'
                  : 'bg-neon-purple bg-opacity-20 border-2 border-neon-purple text-neon-purple hover:bg-opacity-30 shadow-[0_0_15px_rgba(180,0,255,0.3)] hover:shadow-[0_0_25px_rgba(180,0,255,0.5)]'
              }`}
            >
              {loading ? 'Logging in...' : 'Login as Admin'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className={`transition-colors ${
                isElegant ? 'text-gray-600 hover:text-gray-800' : 'text-gray-400 hover:text-white'
              }`}
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

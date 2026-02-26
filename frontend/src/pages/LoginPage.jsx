import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useThemeStore } from '../store/store';
import { authAPI } from '../services/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { theme } = useThemeStore();
  const isElegant = theme === 'elegant';
  
  const [formData, setFormData] = useState({
    team_id: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.teamLogin(formData);
      login(response.data.team, response.data.token);
      navigate('/quiz');
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
        ? 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
        : 'bg-gray-900 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900'
    }`}>
      <div className="max-w-md w-full">
        <div className={`rounded-2xl p-8 ${
          isElegant
            ? 'bg-white shadow-2xl'
            : 'glass border-2 border-neon-blue shadow-[0_0_30px_rgba(0,240,255,0.3)]'
        }`}>
          <div className="text-center mb-8">
            <h2 className={`text-3xl font-bold ${
              isElegant
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'
                : 'text-neon-blue drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]'
            }`}>
              Team Login
            </h2>
            <p className={`mt-2 ${isElegant ? 'text-gray-600' : 'text-gray-300'}`}>
              Enter your credentials to start
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isElegant ? 'text-gray-700' : 'text-gray-300'
              }`}>
                Team ID
              </label>
              <input
                type="text"
                name="team_id"
                value={formData.team_id}
                onChange={handleChange}
                required
                autoComplete="off"
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                  isElegant
                    ? 'border-gray-200 focus:border-blue-500'
                    : 'bg-gray-800 bg-opacity-50 border-neon-blue focus:border-neon-purple text-white placeholder-gray-500'
                }`}
                placeholder="Enter your team ID"
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
                    ? 'border-gray-200 focus:border-blue-500'
                    : 'bg-gray-800 bg-opacity-50 border-neon-blue focus:border-neon-purple text-white placeholder-gray-500'
                }`}
                placeholder="Enter your password"
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
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl'
                  : 'bg-neon-blue bg-opacity-20 border-2 border-neon-blue text-neon-blue hover:bg-opacity-30 shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:shadow-[0_0_25px_rgba(0,240,255,0.5)]'
              }`}
            >
              {loading ? 'Logging in...' : 'Login'}
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

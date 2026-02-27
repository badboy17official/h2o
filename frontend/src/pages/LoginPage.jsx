import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/store';
import { authAPI } from '../services/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  
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
    <div className="min-h-screen bg-surface-dim flex items-center justify-center px-4">
      <div className="max-w-md w-full animate-slide-up">
        <div className="surface-1 rounded-3xl p-8 shadow-elevated-3">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-primary-container border border-primary/20">
              <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-on-surface">
              Team Login
            </h2>
            <p className="mt-2 text-sm text-on-surface-variant">
              Enter your credentials to start
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2 text-on-surface-variant">
                Team ID
              </label>
              <input
                type="text"
                name="team_id"
                value={formData.team_id}
                onChange={handleChange}
                required
                autoComplete="off"
                className="input-m3 w-full px-4 py-3 rounded-2xl"
                placeholder="Enter your team ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-on-surface-variant">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="off"
                className="input-m3 w-full px-4 py-3 rounded-2xl"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className="px-4 py-3 rounded-2xl bg-error-container border border-error/20 text-error text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 rounded-2xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-on-surface-variant hover:text-primary transition-colors duration-200 text-sm"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

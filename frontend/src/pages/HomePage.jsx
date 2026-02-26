import { useNavigate } from 'react-router-dom';
import { useAuthStore, useThemeStore } from '../store/store';
import { useEffect } from 'react';

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  
  useEffect(() => {
    if (isAuthenticated) {
      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/quiz');
      }
    }
  }, [isAuthenticated, role, navigate]);

  const isElegant = theme === 'elegant';

  return (
    <div className={`min-h-screen ${
      isElegant
        ? 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
        : 'bg-gray-900 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900'
    }`}>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Header */}
          <div className="mb-12 animate-float">
            <h1 className={`text-6xl font-bold mb-4 ${
              isElegant
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'
                : 'text-neon-blue drop-shadow-[0_0_15px_rgba(0,240,255,0.5)] animate-glow'
            }`}>
              MCQ Competition
            </h1>
            <p className={`text-xl ${isElegant ? 'text-gray-600' : 'text-gray-300'}`}>
              Test your programming knowledge across multiple languages
            </p>
          </div>

          {/* Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className={`rounded-2xl p-8 transition-all duration-300 transform hover:-translate-y-2 ${
              isElegant
                ? 'bg-white shadow-xl hover:shadow-2xl'
                : 'glass hover:bg-opacity-20 border-2 border-neon-blue shadow-[0_0_15px_rgba(0,240,255,0.3)]'
            }`}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                isElegant
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                  : 'bg-neon-blue bg-opacity-20 border-2 border-neon-blue'
              }`}>
                <svg className={`w-8 h-8 ${isElegant ? 'text-white' : 'text-neon-blue'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className={`text-2xl font-bold mb-2 ${isElegant ? 'text-gray-800' : 'text-white'}`}>Team Login</h3>
              <p className={`mb-6 ${isElegant ? 'text-gray-600' : 'text-gray-300'}`}>
                Access the competition with your team credentials
              </p>
              <button
                onClick={() => navigate('/login')}
                className={`w-full px-8 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  isElegant
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl'
                    : 'bg-neon-blue bg-opacity-20 border-2 border-neon-blue text-neon-blue hover:bg-opacity-30 shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:shadow-[0_0_25px_rgba(0,240,255,0.5)]'
                }`}
              >
                Team Login
              </button>
            </div>

            <div className={`rounded-2xl p-8 transition-all duration-300 transform hover:-translate-y-2 ${
              isElegant
                ? 'bg-white shadow-xl hover:shadow-2xl'
                : 'glass hover:bg-opacity-20 border-2 border-neon-purple shadow-[0_0_15px_rgba(180,0,255,0.3)]'
            }`}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                isElegant
                  ? 'bg-gradient-to-br from-purple-500 to-purple-600'
                  : 'bg-neon-purple bg-opacity-20 border-2 border-neon-purple'
              }`}>
                <svg className={`w-8 h-8 ${isElegant ? 'text-white' : 'text-neon-purple'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className={`text-2xl font-bold mb-2 ${isElegant ? 'text-gray-800' : 'text-white'}`}>Admin Panel</h3>
              <p className={`mb-6 ${isElegant ? 'text-gray-600' : 'text-gray-300'}`}>
                Manage teams, view results, and export data
              </p>
              <button
                onClick={() => navigate('/admin/login')}
                className={`w-full px-8 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  isElegant
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 shadow-lg hover:shadow-xl'
                    : 'bg-neon-purple bg-opacity-20 border-2 border-neon-purple text-neon-purple hover:bg-opacity-30 shadow-[0_0_15px_rgba(180,0,255,0.3)] hover:shadow-[0_0_25px_rgba(180,0,255,0.5)]'
                }`}
              >
                Admin Login
              </button>
            </div>
          </div>

          {/* Features */}
          <div className={`rounded-2xl p-8 ${
            isElegant ? 'bg-white shadow-xl' : 'glass border-2 border-gray-700'
          }`}>
            <h2 className={`text-2xl font-bold mb-6 ${isElegant ? 'text-gray-800' : 'text-white'}`}>Competition Features</h2>
            <div className="grid md:grid-cols-4 gap-4 text-left">
              <div>
                <div className={`text-3xl font-bold mb-2 ${isElegant ? 'text-blue-600' : 'text-neon-blue'}`}>50</div>
                <div className={`text-sm ${isElegant ? 'text-gray-600' : 'text-gray-400'}`}>Total Questions</div>
              </div>
              <div>
                <div className={`text-3xl font-bold mb-2 ${isElegant ? 'text-purple-600' : 'text-neon-purple'}`}>50</div>
                <div className={`text-sm ${isElegant ? 'text-gray-600' : 'text-gray-400'}`}>Per Team</div>
              </div>
              <div>
                <div className={`text-3xl font-bold mb-2 ${isElegant ? 'text-indigo-600' : 'text-neon-pink'}`}>60</div>
                <div className={`text-sm ${isElegant ? 'text-gray-600' : 'text-gray-400'}`}>Minutes</div>
              </div>
              <div>
                <div className={`text-3xl font-bold mb-2 ${isElegant ? 'text-pink-600' : 'text-purple-400'}`}>4</div>
                <div className={`text-sm ${isElegant ? 'text-gray-600' : 'text-gray-400'}`}>Languages</div>
              </div>
            </div>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`mt-8 px-6 py-3 rounded-lg transition-all duration-300 ${
              isElegant
                ? 'bg-gray-800 text-white hover:bg-gray-900'
                : 'border-2 border-white text-white hover:bg-white hover:text-gray-900'
            }`}
          >
            {isElegant ? '🌙 Switch to Cyberpunk Theme' : '☀️ Switch to Elegant Theme'}
          </button>
        </div>
      </div>
    </div>
  );
}

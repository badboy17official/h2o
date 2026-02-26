import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useThemeStore, useQuizStore } from '../store/store';
import { submissionsAPI } from '../services/api';

export default function ResultPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { theme } = useThemeStore();
  const { resetQuiz } = useQuizStore();
  
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const response = await submissionsAPI.getStatus();
        
        if (!response.data.submitted) {
          navigate('/quiz');
          return;
        }

        setResult(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching result:', error);
        alert('Failed to load results');
      }
    };

    fetchResult();
  }, [navigate]);

  const handleLogout = () => {
    resetQuiz();
    logout();
    navigate('/');
  };

  const formatTime = (seconds) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getScorePercentage = () => {
    if (!result) return 0;
    return ((result.score / result.total) * 100).toFixed(1);
  };

  const getGrade = () => {
    const percentage = parseFloat(getScorePercentage());
    if (percentage >= 90) return { grade: 'A+', color: theme === 'elegant' ? 'text-green-600' : 'text-green-400' };
    if (percentage >= 80) return { grade: 'A', color: theme === 'elegant' ? 'text-green-600' : 'text-green-400' };
    if (percentage >= 70) return { grade: 'B', color: theme === 'elegant' ? 'text-blue-600' : 'text-blue-400' };
    if (percentage >= 60) return { grade: 'C', color: theme === 'elegant' ? 'text-yellow-600' : 'text-yellow-400' };
    if (percentage >= 50) return { grade: 'D', color: theme === 'elegant' ? 'text-orange-600' : 'text-orange-400' };
    return { grade: 'F', color: theme === 'elegant' ? 'text-red-600' : 'text-red-400' };
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'elegant' ? 'bg-gradient-to-br from-blue-50 to-purple-50' : 'bg-gray-900'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className={theme === 'elegant' ? 'text-gray-600' : 'text-gray-300'}>Loading results...</p>
        </div>
      </div>
    );
  }

  const gradeInfo = getGrade();

  const ElegantTheme = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
          {/* Celebration Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Quiz Completed!
            </h1>
            <p className="text-gray-600">Great job, {user?.team_name}!</p>
          </div>

          {/* Score Circle */}
          <div className="flex justify-center mb-8">
            <div className="relative w-48 h-48">
              <svg className="transform -rotate-90 w-48 h-48">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="url(#gradient)"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${(getScorePercentage() / 100) * 553} 553`}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-5xl font-bold text-gray-800">{result.score}</div>
                <div className="text-gray-600">out of {result.total}</div>
                <div className={`text-2xl font-bold ${gradeInfo.color} mt-1`}>{gradeInfo.grade}</div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-blue-600">{getScorePercentage()}%</div>
              <div className="text-sm text-gray-600 mt-1">Accuracy</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-purple-600">{formatTime(result.time_taken)}</div>
              <div className="text-sm text-gray-600 mt-1">Time Taken</div>
            </div>
          </div>

          {/* Details */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-gray-800 mb-4">Result Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Correct Answers:</span>
                <span className="font-semibold text-green-600">{result.score}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Wrong Answers:</span>
                <span className="font-semibold text-red-600">{result.total - result.score}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Submitted At:</span>
                <span className="font-semibold text-gray-800">
                  {new Date(result.submitted_at).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <button
            onClick={handleLogout}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 rounded-xl font-bold hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Finish & Logout
          </button>
        </div>
      </div>
    </div>
  );

  const CyberpunkTheme = () => (
    <div className="min-h-screen bg-gray-900 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <div className="glass rounded-3xl border-2 border-neon-blue shadow-[0_0_40px_rgba(0,240,255,0.3)] p-8 mb-6">
          {/* Celebration Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-4xl font-bold text-neon-blue drop-shadow-[0_0_15px_rgba(0,240,255,0.5)] mb-2">
              Quiz Completed!
            </h1>
            <p className="text-gray-300">Great job, {user?.team_name}!</p>
          </div>

          {/* Score Circle */}
          <div className="flex justify-center mb-8">
            <div className="relative w-48 h-48">
              <svg className="transform -rotate-90 w-48 h-48">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="#00f0ff"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${(getScorePercentage() / 100) * 553} 553`}
                  strokeLinecap="round"
                  className="drop-shadow-[0_0_10px_rgba(0,240,255,0.8)]"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-5xl font-bold text-white">{result.score}</div>
                <div className="text-gray-400">out of {result.total}</div>
                <div className={`text-2xl font-bold ${gradeInfo.color} mt-1`}>{gradeInfo.grade}</div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-neon-blue bg-opacity-10 border-2 border-neon-blue rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-neon-blue">{getScorePercentage()}%</div>
              <div className="text-sm text-gray-400 mt-1">Accuracy</div>
            </div>
            <div className="bg-neon-purple bg-opacity-10 border-2 border-neon-purple rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-neon-purple">{formatTime(result.time_taken)}</div>
              <div className="text-sm text-gray-400 mt-1">Time Taken</div>
            </div>
          </div>

          {/* Details */}
          <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 mb-8 border border-gray-700">
            <h3 className="font-semibold text-white mb-4">Result Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Correct Answers:</span>
                <span className="font-semibold text-green-400">{result.score}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Wrong Answers:</span>
                <span className="font-semibold text-red-400">{result.total - result.score}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Submitted At:</span>
                <span className="font-semibold text-white">
                  {new Date(result.submitted_at).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <button
            onClick={handleLogout}
            className="w-full bg-neon-blue bg-opacity-20 border-2 border-neon-blue text-neon-blue py-4 rounded-xl font-bold hover:bg-opacity-30 transition-all duration-300 shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_30px_rgba(0,240,255,0.5)]"
          >
            Finish & Logout
          </button>
        </div>
      </div>
    </div>
  );

  return theme === 'elegant' ? <ElegantTheme /> : <CyberpunkTheme />;
}

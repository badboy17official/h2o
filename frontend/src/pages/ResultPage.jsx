import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useQuizStore } from '../store/store';
import { submissionsAPI } from '../services/api';

export default function ResultPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
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
    if (percentage >= 90) return { grade: 'A+', color: 'text-success' };
    if (percentage >= 80) return { grade: 'A', color: 'text-success' };
    if (percentage >= 70) return { grade: 'B', color: 'text-primary' };
    if (percentage >= 60) return { grade: 'C', color: 'text-warning' };
    if (percentage >= 50) return { grade: 'D', color: 'text-warning' };
    return { grade: 'F', color: 'text-error' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-dim flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 spinner-m3 mx-auto mb-4"></div>
          <p className="text-on-surface-variant text-sm">Loading results...</p>
        </div>
      </div>
    );
  }

  const gradeInfo = getGrade();

  return (
    <div className="min-h-screen bg-surface-dim px-4 py-12">
      <div className="max-w-2xl mx-auto animate-slide-up">
        <div className="surface-1 rounded-3xl shadow-elevated-3 p-8 mb-6">
          {/* Celebration Header */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🎉</div>
            <h1 className="text-3xl font-bold text-on-surface mb-2">
              Quiz Completed!
            </h1>
            <p className="text-on-surface-variant text-sm">Great job, {user?.team_name}!</p>
          </div>

          {/* Score Circle */}
          <div className="flex justify-center mb-8">
            <div className="relative w-44 h-44">
              <svg className="transform -rotate-90 w-44 h-44">
                <circle
                  cx="88"
                  cy="88"
                  r="80"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="10"
                  fill="none"
                />
                <circle
                  cx="88"
                  cy="88"
                  r="80"
                  stroke="#00cfff"
                  strokeWidth="10"
                  fill="none"
                  strokeDasharray={`${(getScorePercentage() / 100) * 503} 503`}
                  strokeLinecap="round"
                  className="drop-shadow-[0_0_8px_rgba(0,207,255,0.5)]"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-4xl font-bold text-on-surface">{result.score}</div>
                <div className="text-on-surface-variant text-xs">out of {result.total}</div>
                <div className={`text-xl font-bold mt-1 ${gradeInfo.color}`}>{gradeInfo.grade}</div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="surface-2 rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-primary font-mono">{getScorePercentage()}%</div>
              <div className="text-xs text-on-surface-variant mt-1">Accuracy</div>
            </div>
            <div className="surface-2 rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-secondary font-mono">{formatTime(result.time_taken)}</div>
              <div className="text-xs text-on-surface-variant mt-1">Time Taken</div>
            </div>
          </div>

          {/* Details */}
          <div className="surface-2 rounded-2xl p-5 mb-8">
            <h3 className="font-semibold text-on-surface mb-4 text-sm">Result Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Correct Answers</span>
                <span className="font-semibold text-success font-mono">{result.score}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Wrong Answers</span>
                <span className="font-semibold text-error font-mono">{result.total - result.score}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Submitted At</span>
                <span className="font-medium text-on-surface font-mono text-xs">
                  {new Date(result.submitted_at).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <button
            onClick={handleLogout}
            className="btn-primary w-full py-4 rounded-2xl font-semibold"
          >
            Finish & Logout
          </button>
        </div>
      </div>
    </div>
  );
}

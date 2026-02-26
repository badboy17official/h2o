import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useQuizStore, useThemeStore } from '../store/store';
import { questionsAPI, submissionsAPI } from '../services/api';

export default function QuizPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { theme } = useThemeStore();
  const {
    questions,
    currentQuestion,
    answers,
    timeRemaining,
    setQuestions,
    setCurrentQuestion,
    saveAnswer,
    decrementTime,
    submitQuiz: submitQuizToStore,
  } = useQuizStore();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [hasStarted, setHasStarted] = useState(false);

  // Fetch questions on mount
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        // Check submission status first
        const statusResponse = await submissionsAPI.getStatus();
        if (statusResponse.data.submitted) {
          navigate('/result');
          return;
        }

        const response = await questionsAPI.getAll();
        setQuestions(response.data.questions);
        
        // Use server-provided time remaining (prevents refresh exploit)
        if (response.data.serverTimeRemaining !== undefined) {
          const { setTimeRemaining } = useQuizStore.getState();
          setTimeRemaining(response.data.serverTimeRemaining);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching questions:', error);
        alert('Failed to load questions');
      }
    };

    fetchQuestions();
  }, [setQuestions, navigate]);

  // Timer countdown
  useEffect(() => {
    if (!hasStarted || !questions.length) return;

    const timer = setInterval(() => {
      decrementTime();
    }, 1000);

    return () => clearInterval(timer);
  }, [hasStarted, questions, decrementTime]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (timeRemaining === 0 && hasStarted) {
      handleSubmit();
    }
  }, [timeRemaining, hasStarted]);

  // Set selected answer from saved answers
  useEffect(() => {
    if (questions[currentQuestion]) {
      const questionId = questions[currentQuestion].id;
      setSelectedAnswer(answers[questionId] || questions[currentQuestion].selected_answer || null);
    }
  }, [currentQuestion, questions, answers]);

  // Prevent page refresh/navigation during quiz
  useEffect(() => {
    if (!hasStarted) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasStarted]);

  const handleAnswerSelect = async (answer) => {
    setSelectedAnswer(answer);
    const questionId = questions[currentQuestion].id;
    saveAnswer(questionId, answer);

    // Save to backend
    try {
      await submissionsAPI.saveAnswer({
        question_id: questionId,
        selected_answer: answer,
      });
    } catch (error) {
      console.error('Error saving answer:', error);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;

    const confirmSubmit = window.confirm(
      'Are you sure you want to submit? You cannot change your answers after submission.'
    );

    if (!confirmSubmit && timeRemaining > 0) return;

    setSubmitting(true);

    try {
      const timeTaken = (60 * 60) - timeRemaining;
      const response = await submissionsAPI.submitQuiz({ time_taken: timeTaken });
      submitQuizToStore(response.data.score);
      navigate('/result');
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Failed to submit quiz. Please try again.');
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'elegant' ? 'bg-gradient-to-br from-blue-50 to-purple-50' : 'bg-gray-900'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className={theme === 'elegant' ? 'text-gray-600' : 'text-gray-300'}>Loading questions...</p>
        </div>
      </div>
    );
  }

  if (!hasStarted) {
    return (
      <div className={`min-h-screen flex items-center justify-center px-4 ${theme === 'elegant' ? 'bg-gradient-to-br from-blue-50 to-purple-50' : 'bg-gray-900 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900'}`}>
        <div className={`max-w-2xl w-full p-8 rounded-2xl ${theme === 'elegant' ? 'bg-white shadow-2xl' : 'glass border-2 border-neon-blue shadow-[0_0_30px_rgba(0,240,255,0.3)]'}`}>
          <h2 className={`text-3xl font-bold mb-6 text-center ${theme === 'elegant' ? 'text-gray-800' : 'text-neon-blue'}`}>
            Welcome, {user?.team_name}!
          </h2>
          
          <div className="mb-8 space-y-4">
            <div className={`p-4 rounded-lg ${theme === 'elegant' ? 'bg-blue-50' : 'bg-gray-800 bg-opacity-50 border border-neon-blue'}`}>
              <h3 className={`font-semibold mb-2 ${theme === 'elegant' ? 'text-gray-800' : 'text-white'}`}>Quiz Instructions:</h3>
              <ul className={`list-disc list-inside space-y-2 ${theme === 'elegant' ? 'text-gray-700' : 'text-gray-300'}`}>
                <li>You have 1 hour to complete {questions.length} questions</li>
                <li>Questions cover C, Python, Java, and SQL</li>
                <li>Select one answer per question</li>
                <li>You can navigate between questions</li>
                <li>Your answers are auto-saved</li>
                <li>Submit before time runs out</li>
                <li className="text-red-500 font-semibold">Do not refresh the page during the quiz!</li>
              </ul>
            </div>

            <div className={`p-4 rounded-lg ${theme === 'elegant' ? 'bg-purple-50' : 'bg-gray-800 bg-opacity-50 border border-neon-purple'}`}>
              <p className={`font-semibold ${theme === 'elegant' ? 'text-gray-800' : 'text-white'}`}>
                Total Questions: <span className={theme === 'elegant' ? 'text-purple-600' : 'text-neon-purple'}>{questions.length}</span>
              </p>
              <p className={`font-semibold ${theme === 'elegant' ? 'text-gray-800' : 'text-white'}`}>
                Time Limit: <span className={theme === 'elegant' ? 'text-purple-600' : 'text-neon-purple'}>1 hour</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setHasStarted(true)}
            className={`w-full py-4 rounded-lg font-bold text-lg transition-all duration-300 ${
              theme === 'elegant'
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl'
                : 'bg-neon-blue bg-opacity-20 border-2 border-neon-blue text-neon-blue hover:bg-opacity-30 shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:shadow-[0_0_25px_rgba(0,240,255,0.5)]'
            }`}
          >
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className={`min-h-screen px-4 py-8 ${theme === 'elegant' ? 'bg-gradient-to-br from-blue-50 to-purple-50' : 'bg-gray-900 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900'}`}>
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className={`p-4 rounded-lg flex justify-between items-center ${theme === 'elegant' ? 'bg-white shadow-lg' : 'glass border border-gray-700'}`}>
          <div>
            <p className={`font-semibold ${theme === 'elegant' ? 'text-gray-800' : 'text-white'}`}>{user?.team_name}</p>
            <p className={`text-sm ${theme === 'elegant' ? 'text-gray-600' : 'text-gray-400'}`}>
              Answered: {answeredCount}/{questions.length}
            </p>
          </div>
          <div className={`text-right`}>
            <p className={`text-sm ${theme === 'elegant' ? 'text-gray-600' : 'text-gray-400'}`}>Time Remaining</p>
            <p className={`text-2xl font-bold ${timeRemaining < 300 ? 'text-red-500' : (theme === 'elegant' ? 'text-blue-600' : 'text-neon-blue')}`}>
              {formatTime(timeRemaining)}
            </p>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="max-w-4xl mx-auto">
        <div className={`p-8 rounded-2xl ${theme === 'elegant' ? 'bg-white shadow-2xl' : 'glass border-2 border-neon-blue shadow-[0_0_20px_rgba(0,240,255,0.2)]'}`}>
          {/* Question Header */}
          <div className="flex justify-between items-center mb-6">
            <span className={`px-4 py-2 rounded-lg text-sm font-semibold ${
              theme === 'elegant' 
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                : 'bg-neon-blue bg-opacity-20 border border-neon-blue text-neon-blue'
            }`}>
              {question.category}
            </span>
            <span className={`text-sm ${theme === 'elegant' ? 'text-gray-600' : 'text-gray-400'}`}>
              Question {currentQuestion + 1} of {questions.length}
            </span>
          </div>

          {/* Question Text */}
          <h3 className={`text-xl font-semibold mb-6 ${theme === 'elegant' ? 'text-gray-800' : 'text-white'}`}>
            {question.question_text}
          </h3>

          {/* Options */}
          <div className="space-y-3">
            {['A', 'B', 'C', 'D'].map((option) => (
              <button
                key={option}
                onClick={() => handleAnswerSelect(option)}
                className={`w-full p-4 rounded-lg text-left transition-all duration-300 ${
                  selectedAnswer === option
                    ? (theme === 'elegant'
                        ? 'bg-blue-500 text-white border-2 border-blue-600 shadow-lg'
                        : 'bg-neon-blue bg-opacity-30 border-2 border-neon-blue text-white shadow-[0_0_15px_rgba(0,240,255,0.4)]')
                    : (theme === 'elegant'
                        ? 'bg-gray-50 hover:bg-gray-100 border-2 border-gray-200 text-gray-800'
                        : 'bg-gray-800 bg-opacity-50 hover:bg-opacity-70 border-2 border-gray-700 text-gray-300')
                }`}
              >
                <span className="font-semibold mr-3">{option}.</span>
                {question[`option_${option.toLowerCase()}`]}
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="mt-8 flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                theme === 'elegant'
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  : 'bg-gray-800 border border-gray-600 text-gray-300 hover:bg-gray-700'
              }`}
            >
              ← Previous
            </button>

            {currentQuestion === questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className={`px-8 py-3 rounded-lg font-bold transition-all duration-300 disabled:opacity-50 ${
                  theme === 'elegant'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-lg'
                    : 'bg-green-500 bg-opacity-20 border-2 border-green-500 text-green-400 hover:bg-opacity-30 shadow-[0_0_15px_rgba(0,255,0,0.3)]'
                }`}
              >
                {submitting ? 'Submitting...' : 'Submit Quiz'}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  theme === 'elegant'
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-neon-blue bg-opacity-20 border-2 border-neon-blue text-neon-blue hover:bg-opacity-30'
                }`}
              >
                Next →
              </button>
            )}
          </div>
        </div>

        {/* Question Grid */}
        <div className={`mt-6 p-6 rounded-xl ${theme === 'elegant' ? 'bg-white shadow-lg' : 'glass border border-gray-700'}`}>
          <h4 className={`text-sm font-semibold mb-3 ${theme === 'elegant' ? 'text-gray-700' : 'text-gray-300'}`}>
            Question Navigator
          </h4>
          <div className="grid grid-cols-10 gap-2">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`aspect-square rounded-lg text-sm font-semibold transition-all ${
                  index === currentQuestion
                    ? (theme === 'elegant' ? 'bg-blue-500 text-white' : 'bg-neon-blue text-gray-900')
                    : answers[questions[index].id] || questions[index].selected_answer
                    ? (theme === 'elegant' ? 'bg-green-100 text-green-700' : 'bg-green-500 bg-opacity-30 text-green-300 border border-green-500')
                    : (theme === 'elegant' ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-gray-800 text-gray-400 hover:bg-gray-700')
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

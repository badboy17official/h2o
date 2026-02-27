import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useQuizStore } from '../store/store';
import { questionsAPI, submissionsAPI } from '../services/api';

const SECTION_ORDER = ['C', 'Python', 'Java', 'SQL'];
const SECTION_LABELS = { C: 'Section 1: C', Python: 'Section 2: Python', Java: 'Section 3: Java', SQL: 'Section 4: SQL' };

export default function QuizPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    questions,
    currentQuestion,
    answers,
    timeRemaining,
    sections,
    currentSection,
    setQuestions,
    setCurrentQuestion,
    saveAnswer,
    decrementTime,
    setSections,
    completeSection: completeSectionInStore,
    submitQuiz: submitQuizToStore,
  } = useQuizStore();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completingSection, setCompletingSection] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [hasStarted, setHasStarted] = useState(false);

  // Group questions by section
  const sectionQuestions = useMemo(() => {
    const grouped = {};
    for (const s of SECTION_ORDER) grouped[s] = [];
    for (const q of questions) {
      if (grouped[q.section]) grouped[q.section].push(q);
    }
    return grouped;
  }, [questions]);

  // Questions for the current active section
  const currentSectionQs = useMemo(() => {
    return currentSection ? (sectionQuestions[currentSection] || []) : [];
  }, [sectionQuestions, currentSection]);

  // Index within the current section
  const sectionStartIndex = useMemo(() => {
    if (!currentSection) return 0;
    let start = 0;
    for (const s of SECTION_ORDER) {
      if (s === currentSection) break;
      start += (sectionQuestions[s] || []).length;
    }
    return start;
  }, [currentSection, sectionQuestions]);

  const localIndex = currentQuestion - sectionStartIndex;

  // Answered count for current section
  const sectionAnsweredCount = useMemo(() => {
    return currentSectionQs.filter(q => answers[q.id] || q.selected_answer).length;
  }, [currentSectionQs, answers, questions]);

  // All sections complete?
  const allSectionsComplete = useMemo(() => {
    return sections.length === 4 && sections.every(s => s.completed);
  }, [sections]);

  // Total answered across all questions
  const totalAnswered = useMemo(() => {
    return questions.filter(q => answers[q.id] || q.selected_answer).length;
  }, [questions, answers]);

  // Fetch questions on mount
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const statusResponse = await submissionsAPI.getStatus();
        if (statusResponse.data.submitted) {
          navigate('/result');
          return;
        }

        const response = await questionsAPI.getAll();
        setQuestions(response.data.questions);
        
        if (response.data.sections) {
          setSections(response.data.sections);
        }

        if (response.data.serverTimeRemaining !== undefined) {
          const { setTimeRemaining } = useQuizStore.getState();
          setTimeRemaining(response.data.serverTimeRemaining);
        }

        // Set currentQuestion to first question of the active section
        if (response.data.sections) {
          const activeSection = SECTION_ORDER.find(name => {
            const s = response.data.sections.find(sec => sec.name === name);
            return !s || !s.completed;
          });
          if (activeSection) {
            let startIdx = 0;
            for (const s of SECTION_ORDER) {
              if (s === activeSection) break;
              startIdx += response.data.questions.filter(q => q.section === s).length;
            }
            setCurrentQuestion(startIdx);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching questions:', error);
        alert('Failed to load questions');
      }
    };

    fetchQuestions();
  }, [setQuestions, setSections, navigate]);

  // Timer countdown
  useEffect(() => {
    if (!hasStarted || !questions.length) return;
    const timer = setInterval(() => { decrementTime(); }, 1000);
    return () => clearInterval(timer);
  }, [hasStarted, questions, decrementTime]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (timeRemaining === 0 && hasStarted) {
      handleSubmit(true);
    }
  }, [timeRemaining, hasStarted]);

  // Set selected answer from saved answers
  useEffect(() => {
    if (questions[currentQuestion]) {
      const questionId = questions[currentQuestion].id;
      setSelectedAnswer(answers[questionId] || questions[currentQuestion].selected_answer || null);
    }
  }, [currentQuestion, questions, answers]);

  // Prevent page refresh during quiz
  useEffect(() => {
    if (!hasStarted) return;
    const handleBeforeUnload = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasStarted]);

  const handleAnswerSelect = async (answer) => {
    setSelectedAnswer(answer);
    const questionId = questions[currentQuestion].id;
    saveAnswer(questionId, answer);
    try {
      await submissionsAPI.saveAnswer({ question_id: questionId, selected_answer: answer });
    } catch (error) {
      console.error('Error saving answer:', error);
      if (error.response?.data?.error) {
        alert(error.response.data.error);
      }
    }
  };

  const handleNext = () => {
    const maxIdx = sectionStartIndex + currentSectionQs.length - 1;
    if (currentQuestion < maxIdx) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > sectionStartIndex) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleCompleteSection = async () => {
    if (completingSection) return;
    
    const section = currentSection;
    if (!section) return;

    // Count answered using both local answers and server-saved answers
    const answered = currentSectionQs.filter(q => answers[q.id] || q.selected_answer).length;
    const total = currentSectionQs.length;
    
    if (answered < total) {
      alert(`Please answer all ${total} questions in ${section} before completing this section. (${answered}/${total} answered)`);
      return;
    }

    const userConfirmed = window.confirm(
      `Complete the ${section} section? Your answers will be locked and you'll move to the next section.`
    );
    if (!userConfirmed) return;

    setCompletingSection(true);
    try {
      const response = await submissionsAPI.completeSection({ section_name: section });
      completeSectionInStore(section);
      
      // Calculate next section start from fresh store state
      const nextSection = response.data.next_section;
      if (nextSection) {
        const allQs = useQuizStore.getState().questions;
        let nextStart = 0;
        for (const s of SECTION_ORDER) {
          if (s === nextSection) break;
          nextStart += allQs.filter(q => q.section === s).length;
        }
        setCurrentQuestion(nextStart);
      }
    } catch (error) {
      console.error('Error completing section:', error);
      const msg = error.response?.data?.error || 'Failed to complete section';
      alert(msg);
    } finally {
      setCompletingSection(false);
    }
  };

  const handleSubmit = async (force = false) => {
    if (submitting) return;
    
    if (!force && !allSectionsComplete) {
      alert('Complete all 4 sections before submitting.');
      return;
    }

    if (!force) {
      const confirmSubmit = window.confirm(
        'Are you sure you want to submit? You cannot change your answers after submission.'
      );
      if (!confirmSubmit) return;
    }

    setSubmitting(true);
    try {
      const timeTaken = (60 * 60) - timeRemaining;
      const response = await submissionsAPI.submitQuiz({ time_taken: timeTaken });
      submitQuizToStore(response.data.score);
      navigate('/result');
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert(error.response?.data?.error || 'Failed to submit quiz. Please try again.');
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
      <div className="min-h-screen bg-surface-dim flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 spinner-m3 mx-auto mb-4"></div>
          <p className="text-on-surface-variant text-sm">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-surface-dim flex items-center justify-center px-4">
        <div className="max-w-2xl w-full animate-slide-up">
          <div className="surface-1 rounded-3xl p-8 shadow-elevated-3">
            <h2 className="text-2xl font-bold mb-6 text-center text-on-surface">
              Welcome, {user?.team_name}!
            </h2>
          
            <div className="mb-8 space-y-4">
              <div className="p-5 rounded-2xl bg-primary-container border border-primary/15">
                <h3 className="font-semibold mb-3 text-primary text-sm">Quiz Instructions</h3>
                <ul className="list-disc list-inside space-y-2 text-on-surface-variant text-sm">
                  <li>You have 1 hour to complete {questions.length} questions</li>
                  <li>Questions are divided into <strong className="text-on-surface">4 sections</strong> in fixed order</li>
                  <li><strong className="text-on-surface">Section 1:</strong> C — 12 questions</li>
                  <li><strong className="text-on-surface">Section 2:</strong> Python — 12 questions</li>
                  <li><strong className="text-on-surface">Section 3:</strong> Java — 13 questions</li>
                  <li><strong className="text-on-surface">Section 4:</strong> SQL — 13 questions</li>
                  <li>You must complete each section before moving to the next</li>
                  <li>Once a section is completed, answers are locked</li>
                  <li>Your answers are auto-saved within the active section</li>
                  <li>Final submit is available after all 4 sections are done</li>
                  <li className="text-error font-medium">Do not refresh the page during the quiz!</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-secondary-container border border-secondary/15">
                <p className="text-sm text-on-surface-variant">
                  Total Questions: <span className="font-semibold text-secondary">{questions.length}</span>
                </p>
                <p className="text-sm text-on-surface-variant">
                  Time Limit: <span className="font-semibold text-secondary">1 hour</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => setHasStarted(true)}
              className="btn-primary w-full py-4 rounded-2xl font-semibold text-lg"
            >
              Start Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const isCurrentSectionComplete = sections.find(s => s.name === currentSection)?.completed;

  return (
    <div className="min-h-screen bg-surface-dim px-4 py-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-4">
        <div className="surface-1 p-4 rounded-2xl shadow-elevated-1 flex justify-between items-center">
          <div>
            <p className="font-semibold text-on-surface">{user?.team_name}</p>
            <p className="text-xs text-on-surface-variant">
              Total: {totalAnswered}/{questions.length} answered
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-on-surface-variant">Time Remaining</p>
            <p className={`text-2xl font-bold font-mono ${
              timeRemaining < 300 ? 'timer-warning timer-critical' : timeRemaining < 600 ? 'timer-warning' : 'text-primary'
            }`}>
              {formatTime(timeRemaining)}
            </p>
          </div>
        </div>
      </div>

      {/* Section Navigation Bar */}
      <div className="max-w-4xl mx-auto mb-4">
        <div className="surface-1 p-2 rounded-2xl shadow-elevated-1 flex gap-2">
          {SECTION_ORDER.map((sName, idx) => {
            const sec = sections.find(s => s.name === sName);
            const isActive = sName === currentSection;
            const isCompleted = sec?.completed;
            const isLocked = !isCompleted && !isActive;
            const sectionQs = sectionQuestions[sName] || [];
            const answeredInSection = sectionQs.filter(q => answers[q.id] || q.selected_answer).length;

            return (
              <button
                key={sName}
                disabled={isLocked}
                onClick={() => {
                  if (!isLocked && !isCompleted) {
                    let start = 0;
                    for (const s of SECTION_ORDER) {
                      if (s === sName) break;
                      start += (sectionQuestions[s] || []).length;
                    }
                    setCurrentQuestion(start);
                  }
                }}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 text-center border ${
                  isCompleted
                    ? 'section-complete text-success'
                    : isActive
                    ? 'section-active text-primary'
                    : 'section-locked text-on-surface-variant/40 cursor-not-allowed'
                }`}
              >
                <div>{sName}</div>
                <div className="text-[10px] opacity-70 mt-0.5">
                  {isCompleted ? '✓ Done' : `${answeredInSection}/${sectionQs.length}`}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section Header */}
      <div className="max-w-4xl mx-auto mb-4">
        <div className="surface-2 p-3 rounded-2xl flex justify-between items-center">
          <h3 className="font-semibold text-primary text-sm">
            {currentSection ? SECTION_LABELS[currentSection] : 'All Sections Complete'}
          </h3>
          <span className="text-xs font-medium text-on-surface-variant font-mono">
            {currentSection ? `${sectionAnsweredCount} / ${currentSectionQs.length} answered` : ''}
          </span>
        </div>
      </div>

      {/* All Complete — Show Submit */}
      {allSectionsComplete && (
        <div className="max-w-4xl mx-auto mb-6">
          <div className="surface-1 p-6 rounded-3xl text-center border border-success/20 shadow-glow-success">
            <p className="text-base font-semibold mb-4 text-success">
              🎉 All sections complete! You can now submit your quiz.
            </p>
            <button
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              className="btn-success px-10 py-4 rounded-2xl font-semibold text-lg disabled:opacity-50 disabled:hover:transform-none"
            >
              {submitting ? 'Submitting...' : '🚀 Submit Quiz'}
            </button>
          </div>
        </div>
      )}

      {/* Question Card */}
      {currentSection && question && (
        <div className="max-w-4xl mx-auto">
          <div className="surface-1 p-8 rounded-3xl shadow-elevated-2 animate-fade-in">
            {/* Question Header */}
            <div className="flex justify-between items-center mb-6">
              <span className="px-3 py-1.5 rounded-xl text-xs font-medium bg-primary-container border border-primary/15 text-primary">
                {question.category}
              </span>
              <span className="text-xs text-on-surface-variant font-mono">
                Question {localIndex + 1} of {currentSectionQs.length}
              </span>
            </div>

            {/* Question Text */}
            <h3 className="text-lg font-medium mb-6 text-on-surface leading-relaxed">
              {question.question_text}
            </h3>

            {/* Options */}
            <div className="space-y-3">
              {['A', 'B', 'C', 'D'].map((option) => (
                <button
                  key={option}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={isCurrentSectionComplete}
                  className={`w-full p-4 rounded-2xl text-left transition-all duration-200 border disabled:opacity-50 disabled:cursor-not-allowed ${
                    selectedAnswer === option
                      ? 'option-selected text-on-surface'
                      : 'bg-surface-container-high/50 border-outline-variant text-on-surface-variant hover:border-primary/30 hover:bg-primary-container'
                  }`}
                >
                  <span className="font-medium mr-3 text-primary">{option}.</span>
                  {question[`option_${option.toLowerCase()}`]}
                </button>
              ))}
            </div>

            {/* Navigation */}
            <div className="mt-8 flex justify-between items-center">
              <button
                onClick={handlePrevious}
                disabled={localIndex === 0}
                className="px-6 py-3 rounded-2xl font-medium transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed surface-2 text-on-surface-variant hover:text-primary"
              >
                ← Previous
              </button>

              {localIndex === currentSectionQs.length - 1 ? (
                <button
                  onClick={handleCompleteSection}
                  disabled={completingSection}
                  className={`px-8 py-3 rounded-2xl font-semibold transition-all duration-200 disabled:opacity-50 border ${
                    sectionAnsweredCount < currentSectionQs.length
                      ? 'border-outline-variant text-on-surface-variant/40 cursor-not-allowed bg-surface-container'
                      : 'btn-success'
                  }`}
                >
                  {completingSection ? 'Completing...' : sectionAnsweredCount < currentSectionQs.length ? `Answer all (${sectionAnsweredCount}/${currentSectionQs.length})` : `Complete ${currentSection} ✓`}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="btn-primary px-6 py-3 rounded-2xl font-medium"
                >
                  Next →
                </button>
              )}
            </div>
          </div>

          {/* Question Grid */}
          <div className="mt-4 p-5 rounded-2xl surface-1 shadow-elevated-1">
            <h4 className="text-xs font-medium mb-3 text-on-surface-variant">
              {currentSection} Questions
            </h4>
            <div className="grid grid-cols-10 gap-2">
              {currentSectionQs.map((q, idx) => {
                const globalIdx = sectionStartIndex + idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentQuestion(globalIdx)}
                    className={`aspect-square rounded-xl text-xs font-medium transition-all duration-200 border ${
                      globalIdx === currentQuestion
                        ? 'bg-primary/20 text-primary border-primary/40'
                        : answers[q.id] || q.selected_answer
                        ? 'bg-success/10 text-success border-success/30'
                        : 'bg-surface-container border-outline-variant text-on-surface-variant/50 hover:border-primary/20'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

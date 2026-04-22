import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2, ChevronRight, ChevronLeft, Flag, Trophy, Users } from 'lucide-react';
import StudentNavbar from '../../components/StudentNavbar';
import API from '../../services/api';
import toast from 'react-hot-toast';
import ConfirmationModal from '../../components/ConfirmationModal';

const TakeSpotTest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [finalScore, setFinalScore] = useState(null);
  const [startTime] = useState(Date.now());
  const [submissions, setSubmissions] = useState([]);

  // Modal state
  const [modal, setModal] = useState({ 
    isOpen: false, 
    title: '', 
    message: '', 
    onConfirm: () => {},
    type: 'info'
  });

  const openModal = (config) => setModal({ ...config, isOpen: true });
  const closeModal = () => setModal(prev => ({ ...prev, isOpen: false }));

  // Live leaderboard polling
  useEffect(() => {
    if (!test) return; // Don't check publishedAt here, just ID is fine
    
    const fetchSubmissions = async () => {
      try {
        const response = await API.get(`/tests/${id}/submissions`);
        if (response.data.success) {
          setSubmissions(response.data.submissions);
        }
      } catch (error) {
        console.error("Error fetching submissions:", error);
      }
    };

    fetchSubmissions();
    const interval = setInterval(fetchSubmissions, 3000); // Poll every 3s
    return () => clearInterval(interval);
  }, [id, test]);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const response = await API.get(`/tests/${id}`);
        if (response.data.success) {
          const testData = response.data.test;
          setTest(testData);
          if (testData.publishedAt) {
            const publishedTime = new Date(testData.publishedAt).getTime();
            const now = Date.now();
            const maxDurationMs = testData.duration * 60 * 1000;
            const elapsed = now - publishedTime;
            const remaining = maxDurationMs - elapsed;
            setTimeLeft(Math.max(0, Math.floor(remaining / 1000)));
          } else {
            setTimeLeft(testData.duration * 60);
          }
          // Initialize answers with null
          setAnswers(new Array(testData.questions.length).fill(null));
        }
      } catch (error) {
        console.error("Error fetching test:", error);
        toast.error("Failed to load test");
      } finally {
        setLoading(false);
      }
    };

    fetchTest();
  }, [id]);

  useEffect(() => {
    if (timeLeft === null) return;

    if (timeLeft === 0) {
      if (!isFinished && !isSubmitting) {
        handleAutoSubmit();
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isFinished, isSubmitting]);

  const handleOptionSelect = (optionIndex) => {
    if (isFinished) return;
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleAutoSubmit = () => {
    if (!isFinished) {
      toast.error("Time's up! Submitting automatically.", { duration: 4000 });
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting || isFinished) return;
    
    setIsSubmitting(true);
    const loadingToast = toast.loading("Syncing your answers...");
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);

    try {
      const formattedAnswers = answers.map((ans, idx) => ({
        questionIndex: idx,
        selectedOption: ans
      }));

      const response = await API.post('/tests/submit', {
        testId: id,
        answers: formattedAnswers,
        timeTaken
      });

      if (response.data.success) {
        setFinalScore(response.data);
        setIsFinished(true);
        toast.success("Exam successfully submitted!", { id: loadingToast });
      }
    } catch (error) {
      console.error("Error submitting test:", error);
      toast.error("Error submitting test. Please contact support.", { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmSubmit = () => {
    const unansweredCount = answers.filter(a => a === null).length;
    const message = unansweredCount > 0 
      ? `You have ${unansweredCount} unanswered questions. Are you sure you want to submit?`
      : "Are you sure you want to complete your test and submit your answers?";

    openModal({
      title: "Final Submission",
      message: message,
      type: "info",
      confirmText: "Yes, Submit",
      onConfirm: handleSubmit
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mb-4"></div>
      </div>
    );
  }

  const Leaderboard = () => (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl p-6 sticky top-28">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl relative">
            <Trophy className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
            </span>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Live Leaderboard</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{submissions.length} Students Completed</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
        {submissions.length > 0 ? submissions.map((sub, idx) => (
          <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 animate-in fade-in transition-all">
            <div className="flex items-center gap-3">
              <span className={`text-sm font-black w-5 ${idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-slate-400' : idx === 2 ? 'text-amber-600' : 'text-slate-400 dark:text-slate-600'}`}>
                {idx + 1}.
              </span>
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{sub.student?.name || 'Anonymous'}</p>
                <p className="text-xs text-slate-500 dark:text-slate-500">{sub.student?.indexNumber || ''}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-2 py-1 bg-green-100/50 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg text-xs font-bold whitespace-nowrap">
                {formatTime(sub.timeTaken)}
              </span>
            </div>
          </div>
        )) : (
          <div className="text-center py-10 px-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <Users className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No completions yet.<br/>Be the first!</p>
          </div>
        )}
      </div>
    </div>
  );

  const currentQuestion = test.questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <StudentNavbar />
      
      {/* Test Progress & Timer Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-16 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <div className="h-8 w-8 sm:h-10 sm:w-10 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg sm:rounded-xl flex items-center justify-center font-bold text-sm sm:text-base">
              {test.testType === 'mcq' ? currentQuestionIndex + 1 : <Flag className="h-4 w-4 sm:h-5 sm:w-5" />}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">{test.title}</h3>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
                {test.testType === 'mcq' ? `Question ${currentQuestionIndex + 1}/ ${test.questions.length}` : 'Resource'}
              </p>
            </div>
          </div>

          <div className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border-2 w-full sm:w-auto justify-center ${timeLeft < 60 ? 'border-red-200 bg-red-50 text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400' : 'border-indigo-100 bg-indigo-50 text-indigo-600 dark:border-indigo-900/50 dark:bg-indigo-900/20 dark:text-indigo-400'} transition-colors relative overflow-hidden group`}>
            <div className={`absolute inset-0 bg-white/20 w-1/2 -skew-x-12 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]`}></div>
            <Clock className={`h-4 w-4 sm:h-5 sm:w-5 ${timeLeft < 60 ? 'animate-pulse' : ''}`} />
            <span className="font-mono text-base sm:text-xl font-bold">{formatTime(timeLeft)}</span>
          </div>
        </div>
        
        {/* Progress Bar */}
        {test.testType === 'mcq' && (
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800">
            <div 
              className="h-full bg-indigo-600 transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + (isFinished ? 1 : 0)) / test.questions.length) * 100}%` }}
            ></div>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Main Content) */}
        <div className="lg:col-span-2">
          {isFinished ? (
            <div className="text-center animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl p-10 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-indigo-500"></div>
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="h-12 w-12" />
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
                  {test?.testType === 'image' ? 'Resource Viewed!' : 'Test Completed!'}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8">
                  {test?.testType === 'image' 
                    ? 'You have successfully viewed this resource material.' 
                    : 'Your assessment has been successfully submitted for review.'}
                </p>
                
                {test?.testType === 'mcq' && (
                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 mb-8 flex justify-around shadow-inner">
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Your Score</p>
                      <p className="text-4xl font-black text-indigo-600 dark:text-indigo-400 shadow-sm">{finalScore?.score} / {finalScore?.totalMarks}</p>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  {timeLeft > 0 && (
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-xl font-medium flex items-center justify-center gap-2">
                      <Clock className="h-5 w-5" />
                      <span>Test is still running for other students. Feel free to watch the live leaderboard!</span>
                    </div>
                  )}
                  <button
                    onClick={() => navigate('/student')}
                    className="w-full bg-slate-900 dark:bg-slate-800 text-white font-bold py-4 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors shadow-lg"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            </div>
          ) : test.testType === 'image' ? (
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{test.title}</h2>
                <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-2xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? 'Recording...' : 'Mark as Viewed'}
                </button>
              </div>
              
              <div className="p-4 bg-slate-900 flex justify-center">
                 <img 
                  src={test.testImage} 
                  alt={test.title} 
                  className="max-w-full h-auto shadow-xl rounded-xl"
                  onContextMenu={(e) => e.preventDefault()}
                />
              </div>
              
              {test.description && (
                <div className="p-8 bg-indigo-50/30 dark:bg-indigo-900/10">
                  <h4 className="text-xs font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-2">Instructions</h4>
                  <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{test.description}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl p-6 sm:p-12 animate-in fade-in">
                <span className="inline-block px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold mb-4 sm:mb-6 border border-indigo-100 dark:border-indigo-800 uppercase">
                  Multiple Choice
                </span>
                
                <h2 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white leading-snug mb-6 sm:mb-10">
                  {currentQuestion?.text}
                </h2>
|
                <div className="space-y-3 sm:space-y-4">
                  {currentQuestion?.options.map((option, idx) => (
                    <div 
                      key={idx}
                      onClick={() => handleOptionSelect(idx)}
                      className={`group flex items-center p-4 sm:p-5 rounded-xl sm:rounded-2xl border-2 cursor-pointer transition-all ${
                        answers[currentQuestionIndex] === idx 
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20 shadow-md transform -translate-y-0.5' 
                        : 'border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm mr-3 sm:mr-4 transition-colors shadow-sm flex-shrink-0 ${
                        answers[currentQuestionIndex] === idx 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-slate-100 dark:group-hover:bg-slate-700 border border-slate-200 dark:border-slate-600'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span className={`text-base sm:text-lg font-medium flex-1 ${answers[currentQuestionIndex] === idx ? 'text-indigo-900 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>
                        {option}
                      </span>
                      {answers[currentQuestionIndex] === idx && (
                        <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600 dark:text-indigo-400 ml-2" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pb-10">
                <button
                  onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="flex items-center gap-2 px-6 py-3 font-bold text-slate-600 dark:text-slate-400 disabled:opacity-30 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all shadow-sm"
                >
                  <ChevronLeft className="h-5 w-5" />
                  Previous
                </button>

                {currentQuestionIndex === test.questions.length - 1 ? (
                  <button
                    onClick={handleConfirmSubmit}
                    disabled={isSubmitting}
                    className="bg-indigo-600 text-white px-10 py-4 rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 hover:shadow-indigo-300 dark:hover:bg-indigo-500 transition-all flex items-center gap-2"
                  >
                    {isSubmitting ? 'Submitting...' : 'Complete Test'}
                    {!isSubmitting && <CheckCircle2 className="h-5 w-5" />}
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentQuestionIndex(prev => Math.min(test.questions.length - 1, prev + 1))}
                    className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-10 py-4 rounded-xl font-bold shadow-lg shadow-slate-200 dark:shadow-none hover:bg-slate-800 dark:hover:bg-slate-100 transition-all flex items-center gap-2"
                  >
                    Next Question
                    <ChevronRight className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (Leaderboard) */}
        <div className="lg:col-span-1">
          <Leaderboard />
        </div>
      </div>

      <ConfirmationModal 
          isOpen={modal.isOpen}
          onClose={closeModal}
          onConfirm={modal.onConfirm}
          title={modal.title}
          message={modal.message}
          type={modal.type}
          confirmText={modal.confirmText}
      />
    </div>
  );
};

export default TakeSpotTest;

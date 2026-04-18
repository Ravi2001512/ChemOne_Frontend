import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2, ChevronRight, ChevronLeft, Flag } from 'lucide-react';
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

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const response = await API.get(`/tests/${id}`);
        if (response.data.success) {
          setTest(response.data.test);
          setTimeLeft(response.data.test.duration * 60);
          // Initialize answers with null
          setAnswers(new Array(response.data.test.questions.length).fill(null));
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
    if (timeLeft === null || isFinished) return;

    if (timeLeft === 0) {
      handleAutoSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isFinished]);

  const handleOptionSelect = (optionIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleAutoSubmit = () => {
    toast.error("Time's up! Submitting automatically.", { duration: 4000 });
    handleSubmit();
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mb-4"></div>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="min-h-screen bg-slate-50">
        <StudentNavbar />
        <div className="max-w-xl mx-auto px-4 py-20 text-center">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-10">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">
              {test?.testType === 'image' ? 'Resource Viewed!' : 'Test Completed!'}
            </h2>
            <p className="text-slate-500 mb-8">
              {test?.testType === 'image' 
                ? 'You have successfully viewed this resource material.' 
                : 'Your assessment has been successfully submitted for review.'}
            </p>
            
            {test?.testType === 'mcq' && (
              <div className="bg-slate-50 rounded-2xl p-6 mb-8 flex justify-around">
                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Your Score</p>
                  <p className="text-4xl font-black text-indigo-600">{finalScore?.score} / {finalScore?.totalMarks}</p>
                </div>
              </div>
            )}

            <button
              onClick={() => navigate('/student')}
              className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle Image Type content
  if (test.testType === 'image') {
    return (
      <div className="min-h-screen bg-slate-50">
        <StudentNavbar />
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200">
                  <Flag className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">{test.title}</h2>
                  <p className="text-slate-500 text-sm font-medium">Resource Material</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className={`flex items-center gap-3 px-4 py-2 rounded-xl border-2 ${timeLeft < 60 ? 'border-red-200 bg-red-50 text-red-600' : 'border-indigo-100 bg-indigo-50 text-indigo-600'} transition-colors`}>
                  <Clock className="h-5 w-5" />
                  <span className="font-mono text-xl font-bold">{formatTime(timeLeft)}</span>
                </div>
                <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? 'Recording...' : 'Mark as Viewed'}
                </button>
              </div>
            </div>
            
            <div className="p-2 bg-slate-900 flex justify-center">
               <img 
                src={test.testImage} 
                alt={test.title} 
                className="max-w-full h-auto shadow-2xl rounded-xl"
                onContextMenu={(e) => e.preventDefault()} // Basic protection
              />
            </div>
            
            {test.description && (
              <div className="p-8 bg-indigo-50/30">
                <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-2">Instructor Instructions</h4>
                <p className="text-slate-700 font-medium leading-relaxed">{test.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = test.questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-slate-50">
      <StudentNavbar />
      
      {/* Test Progress & Timer Header */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
              {currentQuestionIndex + 1}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{test.title}</h3>
              <p className="text-xs text-slate-500">Question {currentQuestionIndex + 1} of {test.questions.length}</p>
            </div>
          </div>

          <div className={`flex items-center gap-3 px-4 py-2 rounded-xl border-2 ${timeLeft < 60 ? 'border-red-200 bg-red-50 text-red-600' : 'border-indigo-100 bg-indigo-50 text-indigo-600'} transition-colors`}>
            <Clock className="h-5 w-5" />
            <span className="font-mono text-xl font-bold">{formatTime(timeLeft)}</span>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-slate-100">
          <div 
            className="h-full bg-indigo-600 transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / test.questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 md:p-12 mb-8 animate-fade-in">
          <span className="inline-block px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs font-bold mb-6">
            MULTIPLE CHOICE QUESTION
          </span>
          
          <h2 className="text-2xl font-bold text-slate-900 leading-snug mb-10">
            {currentQuestion?.text}
          </h2>

          <div className="space-y-4">
            {currentQuestion?.options.map((option, idx) => (
              <div 
                key={idx}
                onClick={() => handleOptionSelect(idx)}
                className={`group flex items-center p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  answers[currentQuestionIndex] === idx 
                  ? 'border-indigo-600 bg-indigo-50/50 shadow-md transform -translate-y-0.5' 
                  : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mr-4 transition-colors ${
                  answers[currentQuestionIndex] === idx 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                }`}>
                  {String.fromCharCode(65 + idx)}
                </div>
                <span className={`text-lg font-medium ${answers[currentQuestionIndex] === idx ? 'text-indigo-900' : 'text-slate-700'}`}>
                  {option}
                </span>
                {answers[currentQuestionIndex] === idx && (
                  <CheckCircle2 className="h-6 w-6 text-indigo-600 ml-auto" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-2 px-6 py-3 font-bold text-slate-600 disabled:opacity-30 transition-opacity"
          >
            <ChevronLeft className="h-5 w-5" />
            Previous
          </button>

          {currentQuestionIndex === test.questions.length - 1 ? (
            <button
              onClick={handleConfirmSubmit}
              disabled={isSubmitting}
              className="bg-indigo-600 text-white px-10 py-4 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all flex items-center gap-2"
            >
              {isSubmitting ? 'Submitting...' : 'Complete Test'}
              {!isSubmitting && <CheckCircle2 className="h-5 w-5" />}
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestionIndex(prev => Math.min(test.questions.length - 1, prev + 1))}
              className="bg-slate-900 text-white px-10 py-4 rounded-xl font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all flex items-center gap-2"
            >
              Next Question
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>
      </main>

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

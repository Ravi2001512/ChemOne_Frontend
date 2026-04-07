import React, { useState } from 'react';
import { Plus, Trash2, Clock, BookOpen, Users, Save, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminNavbar from '../../components/AdminNavbar';
import API from '../../services/api';

const CreateSpotTest = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const [testDetails, setTestDetails] = useState({
    title: '',
    description: '',
    duration: '',
    batch: [],
  });

  const [questions, setQuestions] = useState([
    { id: 1, type: 'mcq', text: '', options: ['', '', '', ''], correctOption: 0, marks: 1 }
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(isEditMode);

  // Fetch test details if in edit mode
  React.useEffect(() => {
    if (isEditMode) {
      const fetchTest = async () => {
        try {
          const response = await API.get(`/tests/${id}`);
          if (response.data.success) {
            const test = response.data.test;
            setTestDetails({
              title: test.title,
              description: test.description || '',
              duration: test.duration,
              batch: test.batch,
            });
            // Ensure questions have numerical IDs for the UI key/removal logic
            setQuestions(test.questions.map((q, i) => ({
              ...q,
              id: q._id || Date.now() + i
            })));
          }
        } catch (error) {
          console.error("Error fetching test:", error);
          alert("Failed to fetch test data.");
        } finally {
          setLoading(false);
        }
      };
      fetchTest();
    }
  }, [id, isEditMode]);

  const handleTestDetailChange = (e) => {
    const { name, value } = e.target;
    setTestDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleBatchToggle = (batchValue) => {
    setTestDetails(prev => {
      const currentBatches = [...prev.batch];
      if (batchValue === 'all') {
        const isAllSelected = currentBatches.includes('all');
        return { ...prev, batch: isAllSelected ? [] : ['all'] };
      }
      
      const newBatches = currentBatches.filter(b => b !== 'all');
      if (newBatches.includes(batchValue)) {
        return { ...prev, batch: newBatches.filter(b => b !== batchValue) };
      } else {
        return { ...prev, batch: [...newBatches, batchValue] };
      }
    });
  };

  const addQuestion = () => {
    setQuestions(prev => [
      ...prev,
      { id: Date.now(), type: 'mcq', text: '', options: ['', '', '', ''], correctOption: 0, marks: 1 }
    ]);
  };

  const removeQuestion = (id) => {
    if (questions.length > 1) {
      setQuestions(prev => prev.filter(q => q.id !== id));
    }
  };

  const handleQuestionChange = (id, field, value) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === id) {
        return { ...q, [field]: value };
      }
      return q;
    }));
  };

  const handleOptionChange = (questionId, optionIndex, value) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === questionId) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!testDetails.title || !testDetails.duration || testDetails.batch.length === 0) {
      alert("Please fill in Title, Duration, and Select at least one Batch.");
      return;
    }

    if (questions.some(q => !q.text)) {
      alert("Please fill in all question texts.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Ensure numerical conversion for duration
      const finalData = {
        ...testDetails,
        duration: Number(testDetails.duration),
        questions: questions.map(q => ({
          ...q,
          marks: Number(q.marks)
        }))
      };

      let response;
      if (isEditMode) {
        response = await API.put(`/tests/${id}`, finalData);
      } else {
        response = await API.post('/tests/create', finalData);
      }

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          navigate('/admin');
        }, 2000);
      }
    } catch (error) {
      console.error("FULL ERROR OBJECT:", error);
      const errorMsg = error.response?.data?.message || error.message || "Failed to create test. Check console.";
      alert(`API Error: ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AdminNavbar />
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Dashboard
            </button>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {isEditMode ? 'Update Spot Test' : 'Create Spot Test'}
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              {isEditMode ? 'Modify your assessment details and questions.' : 'Design a quick assessment for your students.'}
            </p>
          </div>
          <div className="flex space-x-3">
            <button 
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`inline-flex items-center px-6 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : success ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Test
                </>
              )}
            </button>
          </div>
        </div>

        {success && (
          <div className="mb-6 rounded-md bg-green-50 p-4 border border-green-200 animate-in fade-in slide-in-from-top-2">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircle2 className="h-5 w-5 text-green-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Test successfully saved!</h3>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2 mb-8">
          <div className="px-4 py-6 sm:p-8">
            <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              
              <div className="sm:col-span-4">
                <label htmlFor="title" className="block text-sm font-medium leading-6 text-gray-900">
                  Test Title
                </label>
                <div className="mt-2 text-gray-700">
                  <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md bg-white">
                    <span className="flex select-none items-center pl-3 text-gray-400 sm:text-sm">
                      <BookOpen className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      value={testDetails.title}
                      onChange={handleTestDetailChange}
                      className="block flex-1 border-0 bg-transparent py-2.5 pl-2 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                      placeholder="e.g. Organic Chemistry Weekly Quiz"
                    />
                  </div>
                </div>
              </div>

              <div className="col-span-full">
                <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900">
                  Description / Instructions
                </label>
                <div className="mt-2 text-gray-700">
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={testDetails.description}
                    onChange={handleTestDetailChange}
                    className="block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="Enter instructions for the students..."
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="duration" className="block text-sm font-medium leading-6 text-gray-900">
                  Duration (Minutes)
                </label>
                <div className="mt-2 text-gray-700">
                  <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md bg-white">
                    <span className="flex select-none items-center pl-3 text-gray-400 sm:text-sm">
                      <Clock className="w-4 h-4" />
                    </span>
                    <input
                      type="number"
                      name="duration"
                      id="duration"
                      min="1"
                      value={testDetails.duration}
                      onChange={handleTestDetailChange}
                      className="block flex-1 border-0 bg-transparent py-2.5 pl-2 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                      placeholder="e.g. 15"
                    />
                  </div>
                </div>
              </div>

              <div className="col-span-full">
                <label className="block text-sm font-medium leading-6 text-gray-900 mb-2">
                  Target Batches
                </label>
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  {['2026', '2027', '2028', '2029', '2030', 'all'].map((b) => (
                    <label key={b} className="flex items-center gap-2 cursor-pointer group">
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          checked={testDetails.batch.includes(b)}
                          onChange={() => handleBatchToggle(b)}
                          className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 transition-all checked:border-indigo-600 checked:bg-indigo-600 focus:outline-none"
                        />
                        <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" stroke="currentColor" strokeWidth="1">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                          </svg>
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-600 capitalize">
                        {b === 'all' ? 'All Students' : `${b}`}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Questions</h2>
          <span className="inline-flex items-center rounded-md bg-indigo-50 px-2.5 py-1 text-sm font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
            Total Questions: {questions.length}
          </span>
        </div>

        <div className="space-y-6">
          {questions.map((q, index) => (
            <div key={q.id} className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl relative overflow-hidden transition-all duration-200 hover:shadow-md">
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <span className="flex items-center justify-center bg-indigo-100 text-indigo-700 w-8 h-8 rounded-full mr-3 text-sm">
                      {index + 1}
                    </span>
                    Question Setup
                  </h3>
                  <button
                    onClick={() => removeQuestion(q.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                    title="Remove Question"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6 mb-6">
                  <div className="sm:col-span-4">
                    <label className="block text-sm font-medium leading-6 text-gray-700 mb-2">Question Text</label>
                    <textarea
                      rows={2}
                      value={q.text}
                      onChange={(e) => handleQuestionChange(q.id, 'text', e.target.value)}
                      className="block w-full rounded-md border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      placeholder="What is the chemical formula for..."
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium leading-6 text-gray-700 mb-2">Marks</label>
                    <input
                      type="number"
                      min="1"
                      value={q.marks}
                      onChange={(e) => handleQuestionChange(q.id, 'marks', e.target.value)}
                      className="block w-full rounded-md border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                {q.type === 'mcq' && (
                  <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                    <label className="block text-sm font-medium leading-6 text-gray-900 mb-4">
                      Answer Options <span className="text-gray-500 font-normal ml-1">(Select the correct one)</span>
                    </label>
                    <div className="space-y-3">
                      {q.options.map((option, optIdx) => (
                        <div key={optIdx} className="flex items-center">
                          <input
                            type="radio"
                            name={`correct-option-${q.id}`}
                            checked={q.correctOption === optIdx}
                            onChange={() => handleQuestionChange(q.id, 'correctOption', optIdx)}
                            className="h-5 w-5 border-gray-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                          />
                          <div className="ml-3 flex-1">
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => handleOptionChange(q.id, optIdx, e.target.value)}
                              className={`block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ${q.correctOption === optIdx ? 'ring-indigo-500 bg-indigo-50/30' : 'ring-gray-300'} placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-all`}
                              placeholder={`Option ${optIdx + 1}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 mb-16">
          <button
            onClick={addQuestion}
            className="w-full relative block w-full rounded-xl border-2 border-dashed border-gray-300 p-8 text-center hover:border-indigo-500 hover:bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 group"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 group-hover:bg-indigo-200 transition-colors">
              <Plus className="h-6 w-6 text-indigo-600" />
            </div>
            <span className="mt-4 block text-sm font-semibold text-gray-900">Add another question</span>
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default CreateSpotTest;

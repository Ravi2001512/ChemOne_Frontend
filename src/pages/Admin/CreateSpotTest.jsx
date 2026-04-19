import React, { useState } from 'react';
import { Plus, Trash2, Clock, BookOpen, Users, Save, ArrowLeft, CheckCircle2, Image as ImageIcon, Upload, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminNavbar from '../../components/AdminNavbar';
import API from '../../services/api';
import toast from 'react-hot-toast';

const CreateSpotTest = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const [testDetails, setTestDetails] = useState({
    title: '',
    description: '',
    duration: '',
    batch: [],
    testType: 'mcq',
    testImage: null,
  });

  const [questions, setQuestions] = useState([
    { id: 1, type: 'mcq', text: '', options: ['', '', '', ''], correctOption: 0, marks: 1 }
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(isEditMode);
  const [selectedFile, setSelectedFile] = useState(null);

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
          toast.error("Failed to fetch test data.");
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setTestDetails(prev => ({ ...prev, testImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
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
      toast.error("Please fill in Title, Duration and select at least one Batch.");
      return;
    }

    if (testDetails.testType === 'image' && !testDetails.testImage) {
      toast.error("Please upload an image.");
      return;
    }

    if (testDetails.testType === 'mcq' && questions.some(q => !q.text)) {
      toast.error("Please fill in all question texts.");
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = testDetails.testImage;

      // Upload file if new one is selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append('image', selectedFile);
        const uploadRes = await API.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (uploadRes.data.success) {
          imageUrl = uploadRes.data.fileUrl;
        }
      }

      // Ensure numerical conversion for duration
      const finalData = {
        ...testDetails,
        testImage: imageUrl,
        duration: Number(testDetails.duration),
        questions: testDetails.testType === 'mcq'
          ? questions.map(q => ({ ...q, marks: Number(q.marks) }))
          : []
      };

      let response;
      if (isEditMode) {
        response = await API.put(`/tests/${id}`, finalData);
      } else {
        response = await API.post('/tests/create', finalData);
      }

      if (response.data.success) {
        toast.success(isEditMode ? "Test updated successfully!" : "Test created successfully!");
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          navigate('/admin');
        }, 2000);
      }
    } catch (error) {
      console.error("FULL ERROR OBJECT:", error);
      const errorMsg = error.response?.data?.message || error.message || "Failed to create test. Check console.";
      toast.error(`API Error: ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 dark:bg-slate-950">
      <AdminNavbar />
      <div className="py-8 px-4 sm:px-6 lg:px-8">
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
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {isEditMode ? 'Update Spot Test' : 'Create Spot Test'}
              </h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {isEditMode ? 'Modify your assessment details and questions.' : 'Design a quick assessment for your students.'}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm dark:shadow-none text-sm font-medium rounded-md text-gray-700 bg-slate-50 dark:bg-slate-800 dark:bg-slate-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`inline-flex items-center px-6 py-2 border border-transparent shadow-sm dark:shadow-none text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
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


          {/* Test Type Selection */}
          <div className="mb-8 grid grid-cols-2 gap-4">
            <button
              onClick={() => setTestDetails(prev => ({ ...prev, testType: 'mcq' }))}
              className={`flex items-center justify-center gap-3 p-5 rounded-3xl border-2 transition-all ${testDetails.testType === 'mcq'
                ? 'border-indigo-600 bg-indigo-50/50 shadow-md transform -translate-y-0.5'
                : 'border-slate-100 bg-white dark:bg-slate-900 hover:border-indigo-200'
                }`}
            >
              <div className={`p-2 rounded-xl ${testDetails.testType === 'mcq' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                <BookOpen className="h-6 w-6" />
              </div>
              <div className="text-left">
                <p className={`font-black uppercase tracking-widest text-[10px] ${testDetails.testType === 'mcq' ? 'text-indigo-600' : 'text-slate-400'}`}>Type A</p>
                <h3 className={`text-lg font-black ${testDetails.testType === 'mcq' ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>MCQ Assessment</h3>
              </div>
            </button>

            <button
              onClick={() => setTestDetails(prev => ({ ...prev, testType: 'image' }))}
              className={`flex items-center justify-center gap-3 p-5 rounded-3xl border-2 transition-all ${testDetails.testType === 'image'
                ? 'border-indigo-600 bg-indigo-50/50 shadow-md transform -translate-y-0.5'
                : 'border-slate-100 bg-white dark:bg-slate-900 hover:border-indigo-200'
                }`}
            >
              <div className={`p-2 rounded-xl ${testDetails.testType === 'image' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                <ImageIcon className="h-6 w-6" />
              </div>
              <div className="text-left">
                <p className={`font-black uppercase tracking-widest text-[10px] ${testDetails.testType === 'image' ? 'text-indigo-600' : 'text-slate-400'}`}>Type B</p>
                <h3 className={`text-lg font-black ${testDetails.testType === 'image' ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>Image Content</h3>
              </div>
            </button>
          </div>

          {/* Form Sections */}
          {testDetails.testType === 'mcq' ? (
            <>
              <div className="bg-white dark:bg-slate-900 dark:bg-slate-900 shadow-sm dark:shadow-none ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2 mb-8">
                <div className="px-4 py-6 sm:p-8">
                  <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">

                    <div className="sm:col-span-4">
                      <label htmlFor="title" className="block text-sm font-medium leading-6 text-slate-900 dark:text-white">
                        Test Title
                      </label>
                      <div className="mt-2 text-slate-700 dark:text-slate-300">
                        <div className="flex rounded-md shadow-sm dark:shadow-none ring-1 ring-inset ring-slate-300 dark:ring-slate-700 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md bg-white dark:bg-slate-900 dark:bg-slate-900">
                          <span className="flex select-none items-center pl-3 text-slate-400 sm:text-sm">
                            <BookOpen className="w-4 h-4" />
                          </span>
                          <input
                            type="text"
                            name="title"
                            id="title"
                            value={testDetails.title}
                            onChange={handleTestDetailChange}
                            className="block flex-1 border-0 bg-transparent py-2.5 pl-2 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-0 sm:text-sm sm:leading-6"
                            placeholder="e.g. Organic Chemistry Weekly Quiz"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="col-span-full">
                      <label htmlFor="description" className="block text-sm font-medium leading-6 text-slate-900 dark:text-white">
                        Description / Instructions
                      </label>
                      <div className="mt-2 text-slate-700">
                        <textarea
                          id="description"
                          name="description"
                          rows={3}
                          value={testDetails.description}
                          onChange={handleTestDetailChange}
                          className="block w-full rounded-md border-0 py-2.5 px-3 text-slate-900 dark:text-white shadow-sm dark:shadow-none ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 bg-white dark:bg-slate-900"
                          placeholder="Enter instructions for the students..."
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="duration" className="block text-sm font-medium leading-6 text-slate-900 dark:text-white">
                        Duration (Minutes)
                      </label>
                      <div className="mt-2 text-slate-700 dark:text-slate-300">
                        <div className="flex rounded-md shadow-sm dark:shadow-none ring-1 ring-inset ring-slate-300 dark:ring-slate-700 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md bg-white dark:bg-slate-900 dark:bg-slate-900">
                          <span className="flex select-none items-center pl-3 text-slate-400 sm:text-sm">
                            <Clock className="w-4 h-4" />
                          </span>
                          <input
                            type="number"
                            name="duration"
                            id="duration"
                            min="1"
                            value={testDetails.duration}
                            onChange={handleTestDetailChange}
                            className="block flex-1 border-0 bg-transparent py-2.5 pl-2 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-0 sm:text-sm sm:leading-6"
                            placeholder="e.g. 15"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="col-span-full">
                      <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-white mb-2">
                        Target Batches
                      </label>
                      <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200 dark:bg-slate-900">
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
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 capitalize">
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
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Questions Selection</h2>
                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black bg-indigo-50 text-indigo-700 tracking-wider">
                  Total: {questions.length} Questions
                </span>
              </div>

              <div className="space-y-6">
                {questions.map((q, index) => (
                  <div key={q.id} className="bg-white dark:bg-slate-900 shadow-xl shadow-slate-100 rounded-3xl border border-slate-100 transition-all duration-300 hover:border-indigo-100">
                    <div className="px-6 py-8">
                      <div className="flex justify-between items-start mb-8">
                        <div className="flex items-center gap-4">
                          <div className="bg-indigo-600 text-white w-10 h-10 rounded-2xl flex items-center justify-center font-black shadow-lg shadow-indigo-200">
                            {index + 1}
                          </div>
                          <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Question Setup</h3>
                        </div>
                        <button
                          onClick={() => removeQuestion(q.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6 mb-6">
                        <div className="sm:col-span-4">
                          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Question Prompt</label>
                          <textarea
                            rows={2}
                            value={q.text}
                            onChange={(e) => handleQuestionChange(q.id, 'text', e.target.value)}
                            className="block w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:text-white transition-all font-medium"
                            placeholder="What is the chemical formula for..."
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Marks Value</label>
                          <input
                            type="number"
                            min="1"
                            value={q.marks}
                            onChange={(e) => handleQuestionChange(q.id, 'marks', e.target.value)}
                            className="block w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:text-white transition-all font-black text-lg"
                          />
                        </div>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-950/50 rounded-3xl p-6 border border-slate-100">
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
                          Answer Options <span className="text-indigo-400 lowercase font-bold ml-1">(select the correct path)</span>
                        </label>
                        <div className="space-y-3">
                          {q.options.map((option, optIdx) => (
                            <div key={optIdx} className="flex items-center gap-3">
                              <input
                                type="radio"
                                name={`correct-option-${q.id}`}
                                checked={q.correctOption === optIdx}
                                onChange={() => handleQuestionChange(q.id, 'correctOption', optIdx)}
                                className="h-5 w-5 border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer transition-all"
                              />
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => handleOptionChange(q.id, optIdx, e.target.value)}
                                className={`block w-full px-4 py-3 rounded-xl border ${q.correctOption === optIdx ? 'border-indigo-600 bg-white dark:bg-slate-900 ring-4 ring-indigo-50 shadow-sm dark:shadow-none' : 'border-slate-200 bg-white dark:bg-slate-900'} text-slate-900 dark:text-white transition-all font-medium`}
                                placeholder={`Option ${optIdx + 1}`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={addQuestion}
                  className="w-full py-8 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 hover:border-indigo-400 hover:bg-indigo-50/50 hover:text-indigo-600 transition-all group bg-white dark:bg-slate-900"
                >
                  <div className="bg-slate-100 dark:bg-slate-800 text-slate-400 p-4 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-md">
                    <Plus className="w-8 h-8 font-black" />
                  </div>
                  <span className="text-lg font-black text-slate-600 dark:text-slate-400 group-hover:text-indigo-900">Add Next Question</span>
                </button>
              </div>
            </>
          ) : (
            /* Image Only Section */
            <div className="space-y-8 animate-fade-in">
              <div className="bg-white dark:bg-slate-900 shadow-xl shadow-slate-100 rounded-[2.5rem] border border-slate-100 p-10">
                <div className="grid grid-cols-1 gap-8">
                  <div>
                    <label htmlFor="title" className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Image Assessment Title</label>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      value={testDetails.title}
                      onChange={handleTestDetailChange}
                      className="block w-full px-6 py-4 rounded-2xl border border-slate-200 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:text-white transition-all font-bold text-lg"
                      placeholder="e.g. Periodic Table Reference / Laboratory Diagram"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label htmlFor="duration" className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Timer Duration (Minutes)</label>
                      <div className="relative">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                          type="number"
                          name="duration"
                          id="duration"
                          min="1"
                          value={testDetails.duration}
                          onChange={handleTestDetailChange}
                          className="block w-full pl-12 pr-6 py-4 rounded-2xl border border-slate-200 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:text-white transition-all font-black text-lg"
                          placeholder="e.g. 15"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Upload Resource Image</label>

                    {!testDetails.testImage ? (
                      <div className="relative border-4 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50 dark:bg-slate-950/50 p-20 text-center hover:border-indigo-300 transition-all group">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="flex flex-col items-center gap-4">
                          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-xl shadow-slate-200/50 text-slate-300 group-hover:text-indigo-600 transition-colors">
                            <Upload className="h-10 w-10" />
                          </div>
                          <div>
                            <p className="text-xl font-black text-slate-900 dark:text-white mb-1">Drag and drop test image</p>
                            <p className="text-slate-500 font-bold text-sm">PNG, JPG or WEBP up to 5MB</p>
                          </div>
                          <button className="mt-2 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 rounded-xl font-bold text-slate-600 dark:text-slate-400 shadow-sm dark:shadow-none pointer-events-none">
                            Browse Files
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="relative rounded-[2.5rem] overflow-hidden group border-2 border-indigo-100">
                        <img src={testDetails.testImage} alt="Assessment" className="w-full h-auto max-h-[500px] object-contain bg-slate-900" />
                        <div className="absolute top-4 right-4 animate-fade-in shadow-2xl">
                          <button
                            onClick={() => setTestDetails(prev => ({ ...prev, testImage: null }))}
                            className="bg-red-500/90 text-white p-3 rounded-2xl hover:bg-red-600 backdrop-blur-md transition-all"
                          >
                            <X className="h-6 w-6" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="col-span-full">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Target Student Batches</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                      {['2026', '2027', '2028', '2029', '2030', 'all'].map((b) => (
                        <button
                          key={b}
                          onClick={() => handleBatchToggle(b)}
                          className={`px-4 py-4 rounded-2xl border-2 font-black transition-all text-sm uppercase tracking-wider ${testDetails.batch.includes(b)
                            ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                            : 'border-slate-100 bg-white dark:bg-slate-900 text-slate-400 hover:border-indigo-100'
                            }`}
                        >
                          {b === 'all' ? 'All' : b}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateSpotTest;

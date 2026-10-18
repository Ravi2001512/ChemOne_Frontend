import React, { useState, useEffect, useMemo } from 'react';
import AdminNavbar from '../../components/AdminNavbar';
import API from '../../services/api';
import toast from 'react-hot-toast';
import {
  Video,
  Radio,
  Play,
  Copy,
  ExternalLink,
  Clock,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Plus,
  Share2,
  Search,
  Filter,
  Eye,
  FileText,
  Layers,
  RefreshCw,
  Tv,
  Check,
  ChevronRight,
  Info,
  Film,
  Upload,
  Lock,
  Unlock,
  ShieldCheck,
  Users,
  X
} from 'lucide-react';

// Utility to parse YouTube link and extract 11-char video ID
const extractYoutubeId = (url) => {
  if (!url) return '';
  const cleanUrl = url.trim();
  // Standard, shortened, embed, live, or raw ID match
  const regExp = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i;
  const match = cleanUrl.match(regExp);
  if (match && match[1]) {
    return match[1];
  }
  // If the user directly pasted an 11-character YouTube video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(cleanUrl)) {
    return cleanUrl;
  }
  return '';
}

const LiveClass = () => {
  // Data state
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active section view tab: 'all' | 'live' | 'recordings'
  const [activeTab, setActiveTab] = useState('all');

  // Live broadcast form state
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [description, setDescription] = useState('');
  const [batch, setBatch] = useState('All');
  const [status, setStatus] = useState('scheduled'); // 'live', 'scheduled', 'ended'
  const [materialsUrl, setMaterialsUrl] = useState('');
  const [allowChat, setAllowChat] = useState(true);

  // Recording Upload form state
  const [editingRecordingId, setEditingRecordingId] = useState(null);
  const [recTitle, setRecTitle] = useState('');
  const [recUrl, setRecUrl] = useState('');
  const [recDescription, setRecDescription] = useState('');
  const [recBatch, setRecBatch] = useState('All');
  const [recMaterialsUrl, setRecMaterialsUrl] = useState('');
  const [isSubmittingRec, setIsSubmittingRec] = useState(false);

  // Access & View Limit control state for Live Form
  const [liveIsRestricted, setLiveIsRestricted] = useState(false);
  const [liveAllowedStudents, setLiveAllowedStudents] = useState([]);
  const [liveMaxViews, setLiveMaxViews] = useState(3);

  // Access & View Limit control state for Recording Form
  const [recIsRestricted, setRecIsRestricted] = useState(false);
  const [recAllowedStudents, setRecAllowedStudents] = useState([]);
  const [recMaxViews, setRecMaxViews] = useState(3);

  // Students list for Access Control Limit
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Manage Access Modal state
  const [accessModalClass, setAccessModalClass] = useState(null);
  const [modalIsRestricted, setModalIsRestricted] = useState(false);
  const [modalSelectedStudents, setModalSelectedStudents] = useState([]);
  const [modalMaxViews, setModalMaxViews] = useState(3);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentBatchFilter, setStudentBatchFilter] = useState('all');
  const [manualIndexInput, setManualIndexInput] = useState('');
  const [savingAccess, setSavingAccess] = useState(false);
  const [resettingViews, setResettingViews] = useState(false);

  // Live Classes Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [batchFilter, setBatchFilter] = useState('all');

  // Recordings Filter & Search
  const [recSearchQuery, setRecSearchQuery] = useState('');
  const [recBatchFilter, setRecBatchFilter] = useState('all');

  // Preview Modal / Active preview
  const [previewClass, setPreviewClass] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Detected Video ID from current form input
  const currentVideoId = useMemo(() => extractYoutubeId(youtubeUrl), [youtubeUrl]);
  const currentRecVideoId = useMemo(() => extractYoutubeId(recUrl), [recUrl]);

  // Load classes from backend or fallback to localStorage
  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await API.get('/live-classes');
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setClasses(res.data);
        localStorage.setItem('chemone_live_classes', JSON.stringify(res.data));
      } else {
        // Fallback to local storage if empty
        const cached = localStorage.getItem('chemone_live_classes');
        const initial = cached ? JSON.parse(cached) : DEFAULT_CLASSES;
        setClasses(initial);
      }
    } catch (err) {
      console.warn('Backend live-classes API unavailable, utilizing local storage cache:', err.message);
      const cached = localStorage.getItem('chemone_live_classes');
      setClasses(cached ? JSON.parse(cached) : DEFAULT_CLASSES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  // Save to local storage on changes
  const saveLocalBackup = (updatedList) => {
    localStorage.setItem('chemone_live_classes', JSON.stringify(updatedList));
  };

  // Currently live class (if any)
  const activeLiveClass = useMemo(() => {
    return classes.find((c) => c.status === 'live');
  }, [classes]);

  // Reset form
  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setYoutubeUrl('');
    setDescription('');
    setBatch('All');
    setStatus('scheduled');
    setMaterialsUrl('');
    setAllowChat(true);
    setLiveIsRestricted(false);
    setLiveAllowedStudents([]);
    setLiveMaxViews(3);
  };

  // Populate form for editing
  const handleEdit = (cls) => {
    setEditingId(cls._id);
    setTitle(cls.title || '');
    setYoutubeUrl(cls.youtubeUrl || '');
    setDescription(cls.description || '');
    setBatch(cls.batch || 'All');
    setStatus(cls.status || 'scheduled');
    setMaterialsUrl(cls.materialsUrl || '');
    setAllowChat(cls.allowChat !== undefined ? cls.allowChat : true);
    setLiveIsRestricted(cls.isRestricted === true);
    setLiveAllowedStudents(Array.isArray(cls.allowedStudents) ? cls.allowedStudents : []);
    setLiveMaxViews(cls.maxViewsPerStudent !== undefined ? Number(cls.maxViewsPerStudent) : 3);

    // Scroll smoothly to form
    window.scrollTo({ top: 120, behavior: 'smooth' });
    toast.success('Loaded into editor');
  };

  // Handle Form Submit (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Please enter a class title');
      return;
    }

    if (!youtubeUrl.trim()) {
      toast.error('Please provide a YouTube URL or Video ID');
      return;
    }

    if (!currentVideoId) {
      toast.error('Could not detect a valid YouTube Video ID from the link. Please check the format.');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      title: title.trim(),
      youtubeUrl: youtubeUrl.trim(),
      videoId: currentVideoId,
      description: description.trim(),
      batch,
      status,
      materialsUrl: materialsUrl.trim(),
      allowChat,
      isRestricted: liveIsRestricted,
      allowedStudents: liveAllowedStudents,
      maxViewsPerStudent: Math.max(1, Number(liveMaxViews) || 3),
    };

    try {
      if (editingId) {
        // Try backend update
        let updatedItem = { ...payload, _id: editingId, updatedAt: new Date().toISOString() };
        try {
          const res = await API.put(`/live-classes/${editingId}`, payload);
          if (res.data) updatedItem = res.data;
        } catch (apiErr) {
          console.warn('Backend update failed, updating locally:', apiErr);
        }

        const updatedList = classes.map((c) => {
          if (c._id === editingId) return updatedItem;
          // If this class was set to live, auto-demote other live streams to ended
          if (payload.status === 'live' && c.status === 'live') {
            return { ...c, status: 'ended' };
          }
          return c;
        });

        setClasses(updatedList);
        saveLocalBackup(updatedList);
        toast.success('Live class updated successfully!');
      } else {
        // Create new
        let newItem = {
          ...payload,
          _id: 'lc_' + Date.now(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        try {
          const res = await API.post('/live-classes', payload);
          if (res.data) newItem = res.data;
        } catch (apiErr) {
          console.warn('Backend create failed, creating locally:', apiErr);
        }

        const updatedList = payload.status === 'live'
          ? [newItem, ...classes.map((c) => c.status === 'live' ? { ...c, status: 'ended' } : c)]
          : [newItem, ...classes];

        setClasses(updatedList);
        saveLocalBackup(updatedList);
        toast.success(payload.status === 'live' ? '🎉 Live class is now streaming!' : 'Scheduled class created!');
      }

      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save live class');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Live status directly
  const handleToggleStatus = async (cls, newStatus) => {
    try {
      try {
        await API.patch(`/live-classes/${cls._id}/status`, { status: newStatus });
      } catch (e) {
        console.warn('Backend status toggle failed, toggling locally:', e);
      }

      const updated = classes.map((item) => {
        if (item._id === cls._id) {
          return { ...item, status: newStatus };
        }
        if (newStatus === 'live' && item.status === 'live') {
          return { ...item, status: 'ended' };
        }
        return item;
      });

      setClasses(updated);
      saveLocalBackup(updated);

      if (newStatus === 'live') {
        toast.success('🔴 Class is now LIVE!');
      } else if (newStatus === 'ended') {
        toast('Stream ended and marked as completed.', { icon: '⏹️' });
      } else {
        toast.success('Class status updated');
      }
    } catch {
      toast.error('Failed to change status');
    }
  };

  // Delete class or recording
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this item?')) return;

    try {
      try {
        await API.delete(`/live-classes/${id}`);
      } catch (e) {
        console.warn('Backend delete failed, removing locally:', e);
      }

      const filtered = classes.filter((c) => c._id !== id);
      setClasses(filtered);
      saveLocalBackup(filtered);
      toast.success('Item removed successfully');
      if (editingId === id) resetForm();
      if (editingRecordingId === id) resetRecordingForm();
    } catch {
      toast.error('Failed to delete item');
    }
  };

  // Recording Form Functions
  const resetRecordingForm = () => {
    setEditingRecordingId(null);
    setRecTitle('');
    setRecUrl('');
    setRecDescription('');
    setRecBatch('All');
    setRecMaterialsUrl('');
    setRecIsRestricted(false);
    setRecAllowedStudents([]);
    setRecMaxViews(3);
  };

  const handleEditRecording = (cls) => {
    setEditingRecordingId(cls._id);
    setRecTitle(cls.title || '');
    setRecUrl(cls.youtubeUrl || '');
    setRecDescription(cls.description || '');
    setRecBatch(cls.batch || 'All');
    setRecMaterialsUrl(cls.materialsUrl || '');
    setRecIsRestricted(cls.isRestricted === true);
    setRecAllowedStudents(Array.isArray(cls.allowedStudents) ? cls.allowedStudents : []);
    setRecMaxViews(cls.maxViewsPerStudent !== undefined ? Number(cls.maxViewsPerStudent) : 3);

    // Switch tab if not visible and scroll into view
    setActiveTab((prev) => (prev === 'live' ? 'recordings' : prev));
    setTimeout(() => {
      document.getElementById('upload-recordings-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
    toast.success('Loaded recording into editor');
  };

  const handleSubmitRecording = async (e) => {
    e.preventDefault();

    if (!recTitle.trim()) {
      toast.error('Please enter a recording title');
      return;
    }

    if (!recUrl.trim()) {
      toast.error('Please enter a YouTube video URL or Video ID');
      return;
    }

    if (!currentRecVideoId) {
      toast.error('Could not detect a valid YouTube Video ID from the link. Please check the URL format.');
      return;
    }

    setIsSubmittingRec(true);

    const payload = {
      title: recTitle.trim(),
      youtubeUrl: recUrl.trim(),
      videoId: currentRecVideoId,
      description: recDescription.trim(),
      batch: recBatch,
      status: 'ended', // Treated as recorded replay for student access
      materialsUrl: recMaterialsUrl.trim(),
      allowChat: false,
      isRestricted: recIsRestricted,
      allowedStudents: recAllowedStudents,
      maxViewsPerStudent: Math.max(1, Number(recMaxViews) || 3),
    };

    try {
      if (editingRecordingId) {
        let updatedItem = { ...payload, _id: editingRecordingId, updatedAt: new Date().toISOString() };
        try {
          const res = await API.put(`/live-classes/${editingRecordingId}`, payload);
          if (res.data) updatedItem = res.data;
        } catch (apiErr) {
          console.warn('Backend update failed, updating locally:', apiErr);
        }

        const updatedList = classes.map((c) => (c._id === editingRecordingId ? updatedItem : c));
        setClasses(updatedList);
        saveLocalBackup(updatedList);
        toast.success('Class recording updated successfully!');
      } else {
        let newItem = {
          ...payload,
          _id: 'rec_' + Date.now(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        try {
          const res = await API.post('/live-classes', payload);
          if (res.data) newItem = res.data;
        } catch (apiErr) {
          console.warn('Backend create failed, creating locally:', apiErr);
        }

        const updatedList = [newItem, ...classes];
        setClasses(updatedList);
        saveLocalBackup(updatedList);
        toast.success('🎉 Recording link published! Students can now watch the replay.');
      }

      resetRecordingForm();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save recording');
    } finally {
      setIsSubmittingRec(false);
    }
  };

  // Copy student stream link
  const handleCopyLink = (cls) => {
    const studentUrl = `${window.location.origin}/student/live-classes?id=${cls._id || cls.videoId}`;
    navigator.clipboard.writeText(studentUrl);
    setCopiedId(cls._id);
    toast.success('Student Link copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Filtered live broadcasts list
  const filteredClasses = useMemo(() => {
    return classes.filter((cls) => {
      const matchesSearch =
        cls.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cls.batch?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || cls.status === statusFilter;
      const matchesBatch = batchFilter === 'all' || cls.batch === batchFilter;

      return matchesSearch && matchesStatus && matchesBatch;
    });
  }, [classes, searchQuery, statusFilter, batchFilter]);

  // Recordings list (status === 'ended')
  const recordingClasses = useMemo(() => {
    return classes.filter((cls) => cls.status === 'ended');
  }, [classes]);

  // Filtered recordings list
  const filteredRecordings = useMemo(() => {
    return recordingClasses.filter((cls) => {
      const matchesSearch =
        cls.title?.toLowerCase().includes(recSearchQuery.toLowerCase()) ||
        cls.description?.toLowerCase().includes(recSearchQuery.toLowerCase()) ||
        cls.batch?.toLowerCase().includes(recSearchQuery.toLowerCase());

      const matchesBatch = recBatchFilter === 'all' || cls.batch === recBatchFilter;

      return matchesSearch && matchesBatch;
    });
  }, [recordingClasses, recSearchQuery, recBatchFilter]);

  // Fetch registered students for access control
  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      const res = await API.get('/auth/students');
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setStudents(res.data);
        localStorage.setItem('chemone_cached_students', JSON.stringify(res.data));
        return;
      }
    } catch (err) {
      console.warn('Failed to load students list from backend:', err);
    } finally {
      setLoadingStudents(false);
    }

    const cached = localStorage.getItem('chemone_cached_students');
    if (cached) {
      try {
        setStudents(JSON.parse(cached));
      } catch (e) {}
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleOpenAccessModal = (targetClass) => {
    if (!targetClass) return;
    setAccessModalClass(targetClass);
    setModalIsRestricted(targetClass.isRestricted === true);
    setModalSelectedStudents(
      Array.isArray(targetClass.allowedStudents)
        ? targetClass.allowedStudents.map((s) => String(s).trim()).filter(Boolean)
        : []
    );
    setModalMaxViews(
      targetClass.maxViewsPerStudent !== undefined ? Number(targetClass.maxViewsPerStudent) : 3
    );
    setStudentSearch('');
    setStudentBatchFilter('all');
    setManualIndexInput('');
    if (students.length === 0) {
      fetchStudents();
    }
  };

  const toggleStudentSelection = (indexNumber) => {
    if (!indexNumber) return;
    const clean = String(indexNumber).trim();
    setModalSelectedStudents((prev) => {
      const exists = prev.some((idx) => idx.toLowerCase() === clean.toLowerCase());
      if (exists) {
        return prev.filter((idx) => idx.toLowerCase() !== clean.toLowerCase());
      } else {
        return [...prev, clean];
      }
    });
  };

  const handleSelectAllFiltered = (filteredList) => {
    if (!Array.isArray(filteredList)) return;
    const newIndices = filteredList
      .map((s) => (s.indexNumber ? String(s.indexNumber).trim() : null))
      .filter(Boolean);
    setModalSelectedStudents((prev) => {
      const combined = [...prev];
      newIndices.forEach((idx) => {
        if (!combined.some((item) => item.toLowerCase() === idx.toLowerCase())) {
          combined.push(idx);
        }
      });
      return combined;
    });
  };

  const handleDeselectAll = () => {
    setModalSelectedStudents([]);
  };

  const handleAddManualIndex = () => {
    if (!manualIndexInput.trim()) return;
    const clean = manualIndexInput.trim().toUpperCase();
    setModalSelectedStudents((prev) => {
      if (!prev.some((idx) => idx.toLowerCase() === clean.toLowerCase())) {
        toast.success(`Added index number ${clean}`);
        return [...prev, clean];
      } else {
        toast.error(`Index ${clean} is already selected`);
        return prev;
      }
    });
    setManualIndexInput('');
  };

  const handleSaveAccess = async () => {
    if (!accessModalClass) return;
    setSavingAccess(true);

    const cleanAllowed = Array.from(
      new Set(modalSelectedStudents.map((s) => String(s).trim()).filter(Boolean))
    );
    const validatedLimit = Math.max(1, Number(modalMaxViews) || 3);

    // Case 1: Draft Live class before saving
    if (accessModalClass.isDraftLive) {
      setLiveIsRestricted(modalIsRestricted);
      setLiveAllowedStudents(cleanAllowed);
      setLiveMaxViews(validatedLimit);
      toast.success(
        `Settings updated. View limit set to ${validatedLimit} views per student.`
      );
      setAccessModalClass(null);
      setSavingAccess(false);
      return;
    }

    // Case 2: Draft Recording before saving
    if (accessModalClass.isDraftRec) {
      setRecIsRestricted(modalIsRestricted);
      setRecAllowedStudents(cleanAllowed);
      setRecMaxViews(validatedLimit);
      toast.success(
        `Settings updated. View limit set to ${validatedLimit} views per student.`
      );
      setAccessModalClass(null);
      setSavingAccess(false);
      return;
    }

    // Case 3: Saved class in database / state
    const targetId = accessModalClass._id;
    try {
      const res = await API.patch(`/live-classes/${targetId}/access`, {
        isRestricted: modalIsRestricted,
        allowedStudents: cleanAllowed,
        maxViewsPerStudent: validatedLimit,
      });

      const updated = res.data || {
        ...accessModalClass,
        isRestricted: modalIsRestricted,
        allowedStudents: cleanAllowed,
        maxViewsPerStudent: validatedLimit,
      };

      const nextClasses = classes.map((c) => (c._id === targetId ? { ...c, ...updated } : c));
      setClasses(nextClasses);
      saveLocalBackup(nextClasses);

      if (editingId === targetId) {
        setLiveIsRestricted(modalIsRestricted);
        setLiveAllowedStudents(cleanAllowed);
        setLiveMaxViews(validatedLimit);
      }
      if (editingRecordingId === targetId) {
        setRecIsRestricted(modalIsRestricted);
        setRecAllowedStudents(cleanAllowed);
        setRecMaxViews(validatedLimit);
      }
      if (previewClass && previewClass._id === targetId) {
        setPreviewClass((prev) => ({
          ...prev,
          isRestricted: modalIsRestricted,
          allowedStudents: cleanAllowed,
          maxViewsPerStudent: validatedLimit,
        }));
      }

      toast.success(
        `Access & View Limit updated (${validatedLimit} views per student)`
      );
      setAccessModalClass(null);
    } catch (err) {
      console.warn('API update failed, updating local state:', err);
      const nextClasses = classes.map((c) =>
        c._id === targetId
          ? {
              ...c,
              isRestricted: modalIsRestricted,
              allowedStudents: cleanAllowed,
              maxViewsPerStudent: validatedLimit,
            }
          : c
      );
      setClasses(nextClasses);
      saveLocalBackup(nextClasses);

      if (editingId === targetId) {
        setLiveIsRestricted(modalIsRestricted);
        setLiveAllowedStudents(cleanAllowed);
        setLiveMaxViews(validatedLimit);
      }
      if (editingRecordingId === targetId) {
        setRecIsRestricted(modalIsRestricted);
        setRecAllowedStudents(cleanAllowed);
        setRecMaxViews(validatedLimit);
      }
      if (previewClass && previewClass._id === targetId) {
        setPreviewClass((prev) => ({
          ...prev,
          isRestricted: modalIsRestricted,
          allowedStudents: cleanAllowed,
          maxViewsPerStudent: validatedLimit,
        }));
      }

      toast.success('Access limits saved locally.');
      setAccessModalClass(null);
    } finally {
      setSavingAccess(false);
    }
  };

  const handleResetViews = async (classId, indexNumber = null) => {
    if (!classId) return;
    const confirmMsg = indexNumber
      ? `Reset views for student ${indexNumber}? They will get their views back.`
      : `Reset all student views for this lecture? All students will start with 0 views used.`;
    if (!window.confirm(confirmMsg)) return;

    setResettingViews(true);
    try {
      await API.post(`/live-classes/${classId}/reset-views`, { indexNumber });
      setClasses((prev) =>
        prev.map((c) => {
          if (c._id !== classId) return c;
          let newViews = Array.isArray(c.studentViews) ? [...c.studentViews] : [];
          if (indexNumber) {
            newViews = newViews.filter(
              (v) => String(v.indexNumber || '').toLowerCase().trim() !== String(indexNumber).toLowerCase().trim()
            );
          } else {
            newViews = [];
          }
          return { ...c, studentViews: newViews };
        })
      );
      if (accessModalClass && accessModalClass._id === classId) {
        setAccessModalClass((prev) => {
          if (!prev) return null;
          let newViews = Array.isArray(prev.studentViews) ? [...prev.studentViews] : [];
          if (indexNumber) {
            newViews = newViews.filter(
              (v) => String(v.indexNumber || '').toLowerCase().trim() !== String(indexNumber).toLowerCase().trim()
            );
          } else {
            newViews = [];
          }
          return { ...prev, studentViews: newViews };
        });
      }
      toast.success(indexNumber ? `Views reset for ${indexNumber}` : 'All student views reset successfully!');
    } catch (err) {
      console.warn('API reset failed:', err);
      toast.error('Failed to reset views');
    } finally {
      setResettingViews(false);
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter((stu) => {
      const idx = (stu.indexNumber || '').toLowerCase();
      const name = (stu.name || '').toLowerCase();
      const q = studentSearch.toLowerCase().trim();
      const matchesSearch = !q || idx.includes(q) || name.includes(q);
      const matchesBatch = studentBatchFilter === 'all' || stu.batch === studentBatchFilter;
      return matchesSearch && matchesBatch;
    });
  }, [students, studentSearch, studentBatchFilter]);

  const uniqueStudentBatches = useMemo(() => {
    const bSet = new Set();
    students.forEach((s) => {
      if (s.batch) bSet.add(s.batch);
    });
    return Array.from(bSet);
  }, [students]);

  return (
    <div className="min-h-screen bg-ink text-slate-100 pb-20 transition-colors duration-300">
      <AdminNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* ── HEADER BANNER ────────────────────────────────────────── */}
        <div className="relative rounded-2xl overflow-hidden mb-8 bg-gradient-to-r from-ink-lighter via-slate-900 to-ink-lighter border border-white/10 p-6 sm:p-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-acid/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono tracking-wider font-semibold bg-acid/10 text-acid border border-acid/30">
                  <Radio className="w-3.5 h-3.5 mr-1.5 animate-pulse text-acid" />
                  BROADCAST CONTROL
                </span>
                <span className="text-xs font-mono text-slate-400">
                  CHEMBRIDGE LIVE STUDIO
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bebas tracking-wider text-white">
                Live Classes & <span className="text-acid">YouTube Broadcast</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-400 max-w-2xl font-grotesk mt-1">
                Configure live streams, paste YouTube links, and broadcast interactive chemistry lessons seamlessly.
              </p>
            </div>

            {/* Quick stats badge */}
            <div className="flex flex-wrap items-center gap-3">
              <div
                onClick={() => setActiveTab('all')}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center min-w-[85px] cursor-pointer hover:bg-white/10 transition-colors"
                title="View All Content"
              >
                <div className="text-xs font-mono text-slate-400 uppercase">Total</div>
                <div className="text-xl font-bold font-mono text-white">{classes.length}</div>
              </div>
              <div
                onClick={() => setActiveTab('live')}
                className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-center min-w-[85px] cursor-pointer hover:bg-red-500/20 transition-colors"
                title="View Live Broadcasts"
              >
                <div className="text-xs font-mono text-red-400 uppercase flex items-center justify-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  Live Now
                </div>
                <div className="text-xl font-bold font-mono text-red-400">
                  {classes.filter((c) => c.status === 'live').length}
                </div>
              </div>
              <div
                onClick={() => setActiveTab('live')}
                className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 text-center min-w-[85px] cursor-pointer hover:bg-amber-500/20 transition-colors"
                title="View Upcoming Broadcasts"
              >
                <div className="text-xs font-mono text-amber-400 uppercase">Upcoming</div>
                <div className="text-xl font-bold font-mono text-amber-300">
                  {classes.filter((c) => c.status === 'scheduled').length}
                </div>
              </div>
              <div
                onClick={() => setActiveTab('recordings')}
                className="bg-purple-500/10 border border-purple-500/30 rounded-xl px-4 py-3 text-center min-w-[85px] cursor-pointer hover:bg-purple-500/20 transition-colors"
                title="View Uploaded Recordings"
              >
                <div className="text-xs font-mono text-purple-400 uppercase flex items-center justify-center gap-1">
                  <Film className="w-3.5 h-3.5 mr-1" />
                  Recordings
                </div>
                <div className="text-xl font-bold font-mono text-purple-300">
                  {recordingClasses.length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION SWITCHER TABS ─────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-ink-lighter border border-white/10 rounded-2xl p-2 shadow-lg">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all ${
                activeTab === 'all'
                  ? 'bg-acid text-black shadow-lg shadow-acid/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Layers className="w-4 h-4" />
              All Content ({classes.length})
            </button>

            <button
              onClick={() => setActiveTab('live')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all ${
                activeTab === 'live'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Radio className="w-4 h-4 text-red-400 animate-pulse" />
              Live Streams Studio ({classes.filter((c) => c.status !== 'ended').length})
            </button>

            <button
              onClick={() => setActiveTab('recordings')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all ${
                activeTab === 'recordings'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Film className="w-4 h-4 text-purple-300" />
              Upload & Manage Recordings ({recordingClasses.length})
            </button>
          </div>

          <div className="flex items-center gap-2 px-2">
            {activeTab !== 'recordings' && (
              <button
                onClick={() => {
                  setActiveTab('recordings');
                  setTimeout(() => {
                    document.getElementById('upload-recordings-section')?.scrollIntoView({ behavior: 'smooth' });
                  }, 50);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-mono hover:bg-purple-500/30 transition-all"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload Recording
              </button>
            )}
          </div>
        </div>

        {/* ── LIVE BROADCAST SECTION ────────────────────────────────── */}
        {(activeTab === 'all' || activeTab === 'live') && (
          <section className="mb-14">
            {/* Active Live Broadcast Hero (if any) */}
            {activeLiveClass && (
          <div className="mb-10 rounded-2xl border-2 border-red-500/40 bg-gradient-to-br from-red-950/20 via-ink-lighter to-ink-lighter p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-red-600 text-white font-mono text-xs font-bold tracking-widest px-4 py-1.5 rounded-bl-xl shadow-lg flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              BROADCASTING NOW TO STUDENTS
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Preview player */}
              <div className="lg:col-span-5 aspect-video rounded-xl overflow-hidden bg-black border border-white/10 shadow-inner relative group">
                {activeLiveClass.videoId ? (
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${activeLiveClass.videoId}?autoplay=0&rel=0`}
                    title={activeLiveClass.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500">
                    <Video className="w-12 h-12 mb-2 text-slate-600" />
                    <p className="text-sm font-mono">No Video Preview</p>
                  </div>
                )}
              </div>

              {/* Class Info & Quick Actions */}
              <div className="lg:col-span-7 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-red-500/20 text-red-300 border border-red-500/30">
                      LIVE STREAM
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-white/10 text-slate-300">
                      Batch: {activeLiveClass.batch}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold font-grotesk text-white mb-2">
                    {activeLiveClass.title}
                  </h2>
                  <p className="text-slate-400 text-sm line-clamp-2 mb-4 font-grotesk">
                    {activeLiveClass.description || 'Active live session in progress.'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/10">
                  <button
                    onClick={() => handleCopyLink(activeLiveClass)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-acid text-black font-semibold text-xs font-mono hover:bg-acid/90 transition-all shadow-lg shadow-acid/20"
                  >
                    {copiedId === activeLiveClass._id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    Copy Student Link
                  </button>

                  <button
                    onClick={() => handleOpenAccessModal(activeLiveClass)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 font-mono text-xs hover:bg-amber-500/30 transition-all border border-amber-500/30"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Manage Access & Views ({activeLiveClass.isRestricted ? `${activeLiveClass.allowedStudents?.length || 0} Allowed` : 'All'})
                  </button>

                  <a
                    href={activeLiveClass.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white font-mono text-xs hover:bg-white/15 transition-all border border-white/10"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open YouTube
                  </a>

                  <button
                    onClick={() => handleToggleStatus(activeLiveClass, 'ended')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 text-red-300 font-mono text-xs hover:bg-red-500/30 transition-all border border-red-500/40 ml-auto"
                  >
                    End Live Stream
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── MAIN CONTENT GRID: FORM & PREVIEW ───────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* LEFT: LIVE CLASS SETUP FORM (7 Cols) */}
          <div className="lg:col-span-7 bg-ink-lighter border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-center justify-between pb-5 mb-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-acid/10 border border-acid/30 flex items-center justify-center text-acid">
                  {editingId ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
                <div>
                  <h2 className="text-xl font-bold font-grotesk text-white">
                    {editingId ? 'Edit Live Session' : 'Create Live Broadcast'}
                  </h2>
                  <p className="text-xs text-slate-400 font-mono">
                    {editingId ? 'Update details of scheduled / live class' : 'Add YouTube link & schedule live session'}
                  </p>
                </div>
              </div>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs font-mono text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-white/5 border border-white/10"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 1. YouTube Link Input (Highlighted Hero Input) */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-red-950/20 to-black/40 border border-red-500/30">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-mono font-semibold uppercase tracking-wider text-red-300 flex items-center gap-2">
                    <Video className="w-4 h-4 text-red-400" />
                    YouTube Stream / Video Link <span className="text-red-400">*</span>
                  </label>

                  {/* Status Indicator */}
                  {currentVideoId ? (
                    <span className="inline-flex items-center text-[11px] font-mono font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      ID: {currentVideoId}
                    </span>
                  ) : youtubeUrl ? (
                    <span className="inline-flex items-center text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      <AlertCircle className="w-3.5 h-3.5 mr-1" />
                      Invalid Link
                    </span>
                  ) : null}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="e.g. https://www.youtube.com/watch?v=... or https://youtu.be/..."
                    className="w-full bg-ink/90 border border-white/15 rounded-xl px-4 py-3 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-all pr-24"
                    required
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const text = await navigator.clipboard.readText();
                        if (text) {
                          setYoutubeUrl(text);
                          toast.success('Pasted from clipboard!');
                        }
                      } catch {
                        toast.error('Unable to read clipboard');
                      }
                    }}
                    className="absolute right-2 top-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-mono transition-colors"
                  >
                    Paste
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-2 font-mono">
                  Supports standard YouTube videos, YouTube Live broadcast URLs, or embed links.
                </p>
              </div>

              {/* 2. Class Title */}
              <div>
                <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Live Class Title <span className="text-acid">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Inorganic Chemistry: d-Block Elements & Color Chemistry"
                  className="w-full bg-ink/70 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-acid focus:ring-1 focus:ring-acid font-grotesk transition-all"
                  required
                />
              </div>

              {/* 3. Broadcast Status */}
              <div>
                <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Broadcast Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus('live')}
                    className={`px-3 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wider uppercase border transition-all flex items-center justify-center gap-1.5 ${
                      status === 'live'
                        ? 'bg-red-500/20 text-red-400 border-red-500 shadow-lg shadow-red-500/20'
                        : 'bg-ink/50 text-slate-400 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${status === 'live' ? 'bg-red-500 animate-ping' : 'bg-slate-500'}`} />
                    Live Now
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus('scheduled')}
                    className={`px-3 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wider uppercase border transition-all flex items-center justify-center gap-1.5 ${
                      status === 'scheduled'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500 shadow-lg shadow-amber-500/20'
                        : 'bg-ink/50 text-slate-400 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    Upcoming
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus('ended')}
                    className={`px-3 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wider uppercase border transition-all flex items-center justify-center gap-1.5 ${
                      status === 'ended'
                        ? 'bg-slate-500/20 text-slate-200 border-slate-400'
                        : 'bg-ink/50 text-slate-400 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    Ended
                  </button>
                </div>
              </div>

              {/* 5. Class Description / Agenda */}
              <div>
                <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Session Description & Learning Goals
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Outline key concepts, required textbooks, equations or announcements for students..."
                  className="w-full bg-ink/70 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-acid font-grotesk transition-all"
                />
              </div>

              {/* 5. Handout PDF / Material Link */}
              <div className="pt-1">
                <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-acid" />
                  Handout / Study Material URL (Optional)
                </label>
                <input
                  type="url"
                  value={materialsUrl}
                  onChange={(e) => setMaterialsUrl(e.target.value)}
                  placeholder="https://drive.google.com/... or PDF link"
                  className="w-full bg-ink/70 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-acid transition-all"
                />
              </div>

              {/* 6. Access & View Limit Status & Configuration */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    liveIsRestricted ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-acid/15 text-acid border border-acid/30'
                  }`}>
                    {liveIsRestricted ? <Lock className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-xs font-mono font-bold text-white flex flex-wrap items-center gap-2">
                      <span>{liveIsRestricted ? 'Restricted Access' : 'Open to All Registered Students'}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold flex items-center gap-1">
                        <Eye className="w-3 h-3 text-cyan-400" />
                        Limit: {liveMaxViews >= 999 ? 'Unlimited' : `${liveMaxViews} Views/Student`}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {liveIsRestricted
                        ? `${liveAllowedStudents.length} student index numbers permitted to view`
                        : 'No student index restrictions applied'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenAccessModal({
                    _id: editingId || 'draft-live',
                    title: title || 'Live Broadcast',
                    isRestricted: liveIsRestricted,
                    allowedStudents: liveAllowedStudents,
                    maxViewsPerStudent: liveMaxViews,
                    isDraftLive: !editingId
                  })}
                  className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-mono text-xs border border-white/15 flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-acid" />
                  Manage Access & View Limit
                </button>
              </div>

              {/* 7. Action Buttons */}
              <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 py-3 px-6 rounded-xl font-mono text-sm uppercase tracking-wider font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${
                    status === 'live'
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-500/20'
                      : 'bg-acid hover:bg-acid/90 text-black shadow-acid/20'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Saving Broadcast...
                    </>
                  ) : editingId ? (
                    <>
                      <Check className="w-4 h-4" />
                      Update Live Class
                    </>
                  ) : status === 'live' ? (
                    <>
                      <Radio className="w-4 h-4 animate-pulse" />
                      Broadcast Live Now
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Schedule Live Class
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-3 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-slate-300 font-mono text-xs uppercase tracking-wider transition-colors"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT: INTERACTIVE LIVE STREAM PREVIEW & PLAYER (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Live Video Embed Preview Card */}
            <div className="bg-ink-lighter border border-white/10 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Tv className="w-4 h-4 text-acid" />
                  <h3 className="text-sm font-mono uppercase tracking-wider font-bold text-white">
                    Live Player Preview
                  </h3>
                </div>
                {currentVideoId && (
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Ready to Stream
                  </span>
                )}
              </div>

              {/* YouTube Iframe or Placeholder */}
              <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-white/10 relative shadow-inner">
                {currentVideoId ? (
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${currentVideoId}?rel=0`}
                    title="YouTube video player preview"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-gradient-to-br from-slate-950 to-ink">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 mb-3">
                      <Play className="w-8 h-8 ml-1 text-slate-600" />
                    </div>
                    <p className="text-sm font-mono text-slate-300 mb-1">Interactive Stream Preview</p>
                    <p className="text-xs text-slate-500 font-grotesk max-w-xs">
                      Enter a YouTube stream link or video ID in the form to test live playback.
                    </p>
                  </div>
                )}
              </div>

              {/* Manage Access & View Limit quick bar on video preview */}
              <div className="mt-3 p-3.5 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    liveIsRestricted ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {liveIsRestricted ? <Lock className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-xs font-mono font-bold text-white flex flex-wrap items-center gap-2">
                      <span>{liveIsRestricted ? 'Restricted Access Active' : 'Access Limit: All Students'}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold flex items-center gap-1">
                        <Eye className="w-3 h-3 text-cyan-400" />
                        Limit: {liveMaxViews >= 999 ? 'Unlimited' : `${liveMaxViews} Views`}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-grotesk">
                      {liveIsRestricted
                        ? `${liveAllowedStudents.length} student index numbers granted access`
                        : 'Every registered student can watch this stream'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenAccessModal({
                    _id: editingId || 'draft-live',
                    title: title || 'Live Broadcast',
                    isRestricted: liveIsRestricted,
                    allowedStudents: liveAllowedStudents,
                    maxViewsPerStudent: liveMaxViews,
                    isDraftLive: !editingId
                  })}
                  className="px-3.5 py-2 rounded-xl bg-acid text-black font-mono font-bold text-xs hover:bg-acid/90 transition-all shadow-md shadow-acid/20 flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Manage Access & Views
                </button>
              </div>

              {/* Video metadata snippet */}
              {currentVideoId && (
                <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Video ID:</span>
                    <span className="text-acid font-bold">{currentVideoId}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Embed URL:</span>
                    <a
                      href={`https://www.youtube.com/watch?v=${currentVideoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-300 hover:text-white flex items-center gap-1 underline"
                    >
                      Test in YouTube <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Tips & Admin Guidance Card */}
            <div className="bg-gradient-to-br from-ink-lighter to-slate-900 border border-white/10 rounded-2xl p-5">
              <h4 className="text-xs font-mono uppercase tracking-wider text-acid font-bold mb-3 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Live Broadcast Instructions
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-300 font-grotesk">
                <li className="flex items-start gap-2">
                  <span className="text-acid font-mono font-bold">1.</span>
                  <span>Start your live stream inside <strong>YouTube Studio</strong> or OBS.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-acid font-mono font-bold">2.</span>
                  <span>Copy the shareable YouTube live link and paste it into the field above.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-acid font-mono font-bold">3.</span>
                  <span>Select <strong>"Live Now"</strong> to immediately notify students on their portal dashboard.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-acid font-mono font-bold">4.</span>
                  <span>When done, switch status to <strong>"Ended"</strong> to archive the class for student revision.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── BROADCAST MANAGEMENT LIST ───────────────────────────── */}
        <div className="bg-ink-lighter border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl">
          {/* Header & Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-6 border-b border-white/10">
            <div>
              <h2 className="text-2xl font-bold font-bebas tracking-wide text-white">
                All Broadcasts & Live Classes ({filteredClasses.length})
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Manage upcoming scheduled sessions and past class archives
              </p>
            </div>

            {/* Filter toolbar */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative min-w-[200px]">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search classes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-ink border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-acid"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-ink border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-acid"
              >
                <option value="all">All Statuses</option>
                <option value="live">🔴 Live Now</option>
                <option value="scheduled">🟡 Scheduled</option>
                <option value="ended">⚪ Ended</option>
              </select>

              {/* Batch Filter */}
              <select
                value={batchFilter}
                onChange={(e) => setBatchFilter(e.target.value)}
                className="bg-ink border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-acid"
              >
                <option value="all">All Batches</option>
                <option value="2025 A/L Theory">2025 A/L Theory</option>
                <option value="2025 A/L Revision">2025 A/L Revision</option>
                <option value="2026 A/L Theory">2026 A/L Theory</option>
                <option value="2026 A/L Revision">2026 A/L Revision</option>
                <option value="Special Paper Class">Special Paper Class</option>
              </select>

              <button
                onClick={fetchClasses}
                title="Refresh classes list"
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Classes Table / Cards */}
          {loading && classes.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-acid" />
              <p className="font-mono text-sm">Loading broadcasts...</p>
            </div>
          ) : filteredClasses.length === 0 ? (
            <div className="py-16 text-center text-slate-500 bg-white/[0.02] rounded-xl border border-dashed border-white/10">
              <Video className="w-12 h-12 mx-auto mb-3 text-slate-600" />
              <p className="text-base font-semibold text-slate-300">No broadcasts found</p>
              <p className="text-xs font-mono text-slate-500 mt-1">
                Try adjusting your search criteria or create a new live broadcast using the form above.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClasses.map((cls) => {
                const vid = cls.videoId || extractYoutubeId(cls.youtubeUrl);
                const isLive = cls.status === 'live';
                const isScheduled = cls.status === 'scheduled';

                return (
                  <div
                    key={cls._id}
                    className={`rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden group ${
                      isLive
                        ? 'border-red-500/50 bg-gradient-to-b from-red-950/20 to-ink shadow-lg shadow-red-500/10'
                        : 'border-white/10 bg-ink hover:border-white/20 hover:shadow-xl'
                    }`}
                  >
                    <div>
                      {/* Thumbnail with overlay status */}
                      <div className="aspect-video w-full bg-black relative overflow-hidden">
                        {vid ? (
                          <img
                            src={`https://img.youtube.com/vi/${vid}/hqdefault.jpg`}
                            alt={cls.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600 bg-slate-900">
                            <Video className="w-10 h-10" />
                          </div>
                        )}

                        {/* Status badge on thumbnail */}
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          {isLive ? (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase bg-red-600 text-white shadow-lg flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                              LIVE
                            </span>
                          ) : isScheduled ? (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold tracking-wider uppercase bg-amber-500/90 text-black shadow-lg">
                              SCHEDULED
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-medium tracking-wider uppercase bg-slate-800/90 text-slate-300">
                              ENDED
                            </span>
                          )}
                        </div>

                        {/* Quick preview modal trigger */}
                        <button
                          onClick={() => setPreviewClass(cls)}
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-2 font-mono text-xs font-semibold backdrop-blur-xs"
                        >
                          <Play className="w-6 h-6 fill-white" />
                          Click to Preview
                        </button>
                      </div>

                      {/* Content details */}
                      <div className="p-5">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400">
                            Batch: {cls.batch}
                          </span>

                          {cls.isRestricted ? (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1 font-semibold">
                              <Lock className="w-2.5 h-2.5" /> {cls.allowedStudents?.length || 0} Allowed
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/10 flex items-center gap-1">
                              <Users className="w-2.5 h-2.5" /> All Students
                            </span>
                          )}

                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1 font-semibold">
                            <Eye className="w-2.5 h-2.5 text-cyan-400" /> Limit: {cls.maxViewsPerStudent !== undefined ? (cls.maxViewsPerStudent >= 999 ? 'Unlimited' : `${cls.maxViewsPerStudent} Views`) : '3 Views'}
                          </span>
                        </div>

                        <h3 className="font-bold text-white font-grotesk text-base line-clamp-2 mb-2 group-hover:text-acid transition-colors">
                          {cls.title}
                        </h3>

                        {cls.description && (
                          <p className="text-xs text-slate-400 font-grotesk line-clamp-2">
                            {cls.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Footer Controls */}
                    <div className="p-4 bg-white/[0.02] border-t border-white/5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {/* Live Toggle */}
                        {isLive ? (
                          <button
                            onClick={() => handleToggleStatus(cls, 'ended')}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-mono bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors"
                            title="End Live Stream"
                          >
                            End Live
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleStatus(cls, 'live')}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-mono bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors"
                            title="Go Live Now"
                          >
                            Go Live
                          </button>
                        )}

                        {/* Copy Link */}
                        <button
                          onClick={() => handleCopyLink(cls)}
                          title="Copy student link"
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                        >
                          {copiedId === cls._id ? <Check className="w-4 h-4 text-acid" /> : <Share2 className="w-4 h-4" />}
                        </button>

                        {/* YouTube */}
                        <a
                          href={cls.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open YouTube"
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        {/* Manage Access & View Limit Button */}
                        <button
                          onClick={() => handleOpenAccessModal(cls)}
                          title="Manage Student Access & View Limits"
                          className="px-2 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 text-xs font-mono flex items-center gap-1 transition-colors"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Access & Views</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(cls)}
                          title="Edit"
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-acid transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cls._id)}
                          title="Delete"
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    )}

    {/* ═══════════════════════════════════════════════════════════════ */}
    {/* ── SECTION: UPLOAD RECORDING LINKS & LECTURE ARCHIVE ────────── */}
    {/* ═══════════════════════════════════════════════════════════════ */}
    {(activeTab === 'all' || activeTab === 'recordings') && (
      <section id="upload-recordings-section" className="mb-14 scroll-mt-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/30">
                <Film className="w-3.5 h-3.5 mr-1.5 text-purple-400" />
                RECORDED REPLAY VAULT
              </span>
              <span className="text-xs font-mono text-slate-400">Class Lecture Library</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bebas tracking-wide text-white">
              Upload & Manage <span className="text-purple-400">Recording Links</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-grotesk mt-0.5">
              Upload YouTube or video recording links for past live sessions, revision replays, and exam solutions. Students can replay these at any time.
            </p>
          </div>

          <div className="bg-purple-950/20 border border-purple-500/20 rounded-xl px-4 py-2.5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-300">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-mono text-slate-400 uppercase">Total Recordings</div>
              <div className="text-lg font-bold font-mono text-purple-300">
                {recordingClasses.length} Available
              </div>
            </div>
          </div>
        </div>

        {/* Main Form & Preview Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          {/* Left: Upload Recording Form (7 Cols) */}
          <div className="lg:col-span-7 bg-ink-lighter border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-center justify-between pb-5 mb-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  {editingRecordingId ? <Edit3 className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-xl font-bold font-grotesk text-white">
                    {editingRecordingId ? 'Edit Recording Link' : 'Upload New Recording Link'}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    {editingRecordingId ? 'Update details of recorded lesson' : 'Publish YouTube replay URL for student access'}
                  </p>
                </div>
              </div>

              {editingRecordingId && (
                <button
                  type="button"
                  onClick={resetRecordingForm}
                  className="text-xs font-mono text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-white/5 border border-white/10"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleSubmitRecording} className="space-y-6">
              {/* Video URL Input */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/20 to-black/40 border border-purple-500/30">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-mono font-semibold uppercase tracking-wider text-purple-300 flex items-center gap-2">
                    <Film className="w-4 h-4 text-purple-400" />
                    Recording Video URL <span className="text-purple-400">*</span>
                  </label>

                  {currentRecVideoId ? (
                    <span className="inline-flex items-center text-[11px] font-mono font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      ID: {currentRecVideoId}
                    </span>
                  ) : recUrl ? (
                    <span className="inline-flex items-center text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      <AlertCircle className="w-3.5 h-3.5 mr-1" />
                      Invalid URL
                    </span>
                  ) : null}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={recUrl}
                    onChange={(e) => setRecUrl(e.target.value)}
                    placeholder="e.g. https://www.youtube.com/watch?v=... or https://youtu.be/..."
                    className="w-full bg-ink/90 border border-white/15 rounded-xl px-4 py-3 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all pr-24"
                    required
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const text = await navigator.clipboard.readText();
                        if (text) {
                          setRecUrl(text);
                          toast.success('Pasted from clipboard!');
                        }
                      } catch {
                        toast.error('Unable to read clipboard');
                      }
                    }}
                    className="absolute right-2 top-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-mono transition-colors"
                  >
                    Paste
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-2 font-mono">
                  Accepts standard YouTube links, unlisted class recordings, or embed video links.
                </p>
              </div>

              {/* Recording Title */}
              <div>
                <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Recording Title <span className="text-purple-400">*</span>
                </label>
                <input
                  type="text"
                  value={recTitle}
                  onChange={(e) => setRecTitle(e.target.value)}
                  placeholder="e.g. Equilibrium Constant Calculations & Le Chatelier Replay"
                  className="w-full bg-ink/70 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 font-grotesk transition-all"
                  required
                />
              </div>

              {/* Handout PDF */}
              <div>
                <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-purple-400" />
                  Handout / Notes PDF (Optional)
                </label>
                <input
                  type="url"
                  value={recMaterialsUrl}
                  onChange={(e) => setRecMaterialsUrl(e.target.value)}
                  placeholder="https://drive.google.com/... or PDF link"
                  className="w-full bg-ink/70 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 transition-all"
                />
              </div>

              {/* Recording Description */}
              <div>
                <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Lesson Notes & Concepts Covered
                </label>
                <textarea
                  rows={3}
                  value={recDescription}
                  onChange={(e) => setRecDescription(e.target.value)}
                  placeholder="Outline topics covered in this recording, recommended textbook references, or problem set questions..."
                  className="w-full bg-ink/70 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 font-grotesk transition-all"
                />
              </div>

              {/* Access & View Limit Status & Configuration */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    recIsRestricted ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  }`}>
                    {recIsRestricted ? <Lock className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-xs font-mono font-bold text-white flex flex-wrap items-center gap-2">
                      <span>{recIsRestricted ? 'Restricted Access Active' : 'Public to All Registered Students'}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold flex items-center gap-1">
                        <Eye className="w-3 h-3 text-cyan-400" />
                        Limit: {recMaxViews >= 999 ? 'Unlimited' : `${recMaxViews} Views/Student`}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-grotesk">
                      {recIsRestricted
                        ? `${recAllowedStudents.length} student index numbers granted access`
                        : 'Every registered student can replay this recording'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenAccessModal({
                    _id: editingRecordingId || 'draft-rec',
                    title: recTitle || 'Recording Lecture',
                    isRestricted: recIsRestricted,
                    allowedStudents: recAllowedStudents,
                    maxViewsPerStudent: recMaxViews,
                    isDraftRec: !editingRecordingId
                  })}
                  className="px-3.5 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-mono font-semibold transition-all flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Manage Access & View Limit
                </button>
              </div>

              {/* Submit Actions */}
              <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                <button
                  type="submit"
                  disabled={isSubmittingRec}
                  className="flex-1 py-3 px-6 rounded-xl font-mono text-sm uppercase tracking-wider font-bold transition-all shadow-lg flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/20"
                >
                  {isSubmittingRec ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Publishing Recording...
                    </>
                  ) : editingRecordingId ? (
                    <>
                      <Check className="w-4 h-4" />
                      Update Recording
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Publish Recording Link
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={resetRecordingForm}
                  className="px-5 py-3 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-slate-300 font-mono text-xs uppercase tracking-wider transition-colors"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>

          {/* Right: Live Preview Player & Admin Guide (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-ink-lighter border border-white/10 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Tv className="w-4 h-4 text-purple-400" />
                  <h4 className="text-sm font-mono uppercase tracking-wider font-bold text-white">
                    Recording Playback Preview
                  </h4>
                </div>
                {currentRecVideoId && (
                  <span className="text-xs font-mono text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                    Valid Stream
                  </span>
                )}
              </div>

              <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-white/10 relative shadow-inner">
                {currentRecVideoId ? (
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${currentRecVideoId}?rel=0`}
                    title="Recording Preview"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-gradient-to-br from-slate-950 to-ink">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 mb-3">
                      <Film className="w-8 h-8 text-purple-400/60" />
                    </div>
                    <p className="text-sm font-mono text-slate-300 mb-1">Recording Preview Player</p>
                    <p className="text-xs text-slate-500 font-grotesk max-w-xs">
                      Paste a recording link in the form to test video playback before publishing.
                    </p>
                  </div>
                )}
              </div>

              {currentRecVideoId && (
                <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Video ID:</span>
                    <span className="text-purple-300 font-bold">{currentRecVideoId}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">YouTube URL:</span>
                    <a
                      href={`https://www.youtube.com/watch?v=${currentRecVideoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-300 hover:text-white flex items-center gap-1 underline"
                    >
                      Open in YouTube <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Instructions Card */}
            <div className="bg-gradient-to-br from-ink-lighter to-slate-900 border border-white/10 rounded-2xl p-5">
              <h4 className="text-xs font-mono uppercase tracking-wider text-purple-400 font-bold mb-3 flex items-center gap-2">
                <Info className="w-4 h-4" />
                How Students Access Recordings
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-300 font-grotesk">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 font-mono font-bold">•</span>
                  <span>Published recordings immediately appear under <strong>Recorded Replays</strong> in the student theater portal.</span>
                </li>

                <li className="flex items-start gap-2">
                  <span className="text-purple-400 font-mono font-bold">•</span>
                  <span>Attach accompanying revision PDF handouts so students can follow along while rewatching.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Recordings Library List */}
        <div className="bg-ink-lighter border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-6 border-b border-white/10">
            <div>
              <h3 className="text-2xl font-bold font-bebas tracking-wide text-white">
                Recorded Lectures Vault ({filteredRecordings.length})
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                All published lecture video replays and exam solution recordings
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative min-w-[200px]">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search recordings..."
                  value={recSearchQuery}
                  onChange={(e) => setRecSearchQuery(e.target.value)}
                  className="w-full bg-ink border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                />
              </div>

              {/* Batch Filter */}
              <select
                value={recBatchFilter}
                onChange={(e) => setRecBatchFilter(e.target.value)}
                className="bg-ink border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-purple-400"
              >
                <option value="all">All Batches</option>
                <option value="2025 A/L Theory">2025 A/L Theory</option>
                <option value="2025 A/L Revision">2025 A/L Revision</option>
                <option value="2026 A/L Theory">2026 A/L Theory</option>
                <option value="2026 A/L Revision">2026 A/L Revision</option>
                <option value="Special Paper Class">Special Paper Class</option>
              </select>

              <button
                onClick={fetchClasses}
                title="Refresh recordings"
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {filteredRecordings.length === 0 ? (
            <div className="py-16 text-center text-slate-500 bg-white/[0.02] rounded-xl border border-dashed border-white/10">
              <Film className="w-12 h-12 mx-auto mb-3 text-slate-600" />
              <p className="text-base font-semibold text-slate-300">No recordings found</p>
              <p className="text-xs font-mono text-slate-500 mt-1">
                Upload your first class recording link using the form above.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecordings.map((cls) => {
                const vid = cls.videoId || extractYoutubeId(cls.youtubeUrl);

                return (
                  <div
                    key={cls._id}
                    className="rounded-2xl border border-white/10 bg-ink hover:border-purple-500/40 hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                  >
                    <div>
                      {/* Thumbnail */}
                      <div className="aspect-video w-full bg-black relative overflow-hidden">
                        {vid ? (
                          <img
                            src={`https://img.youtube.com/vi/${vid}/hqdefault.jpg`}
                            alt={cls.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600 bg-slate-900">
                            <Film className="w-10 h-10" />
                          </div>
                        )}

                        {/* Badge */}
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase bg-purple-600/90 text-white shadow-lg flex items-center gap-1.5">
                            <Film className="w-3 h-3" />
                            RECORDING
                          </span>
                        </div>

                        {/* Click to Preview Overlay */}
                        <button
                          onClick={() => setPreviewClass(cls)}
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-2 font-mono text-xs font-semibold backdrop-blur-xs"
                        >
                          <Play className="w-6 h-6 fill-white" />
                          Click to Preview
                        </button>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                            Batch: {cls.batch}
                          </span>
                          {cls.isRestricted ? (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1 font-semibold">
                              <Lock className="w-2.5 h-2.5" /> {cls.allowedStudents?.length || 0} Allowed
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/10 flex items-center gap-1">
                              <Users className="w-2.5 h-2.5" /> All Students
                            </span>
                          )}
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1 font-semibold">
                            <Eye className="w-2.5 h-2.5 text-cyan-400" /> Limit: {cls.maxViewsPerStudent !== undefined ? (cls.maxViewsPerStudent >= 999 ? 'Unlimited' : `${cls.maxViewsPerStudent} Views`) : '3 Views'}
                          </span>
                          {cls.materialsUrl && (
                            <a
                              href={cls.materialsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-300 hover:text-white flex items-center gap-1 underline"
                            >
                              <FileText className="w-3 h-3 text-purple-400" />
                              PDF Handout
                            </a>
                          )}
                        </div>

                        <h4 className="font-bold text-white font-grotesk text-base line-clamp-2 mb-2 group-hover:text-purple-300 transition-colors">
                          {cls.title}
                        </h4>

                        {cls.description && (
                          <p className="text-xs text-slate-400 font-grotesk line-clamp-2">
                            {cls.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Footer Controls */}
                    <div className="p-4 bg-white/[0.02] border-t border-white/5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {/* Copy Link */}
                        <button
                          onClick={() => handleCopyLink(cls)}
                          title="Copy student link"
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                        >
                          {copiedId === cls._id ? <Check className="w-4 h-4 text-purple-400" /> : <Share2 className="w-4 h-4" />}
                        </button>

                        {/* Open in YouTube */}
                        <a
                          href={cls.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open in YouTube"
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>

                        {/* Manage Access & View Limit Button */}
                        <button
                          onClick={() => handleOpenAccessModal(cls)}
                          title="Manage Student Access & View Limits"
                          className="px-2 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 text-xs font-mono flex items-center gap-1 transition-colors"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Access & Views</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditRecording(cls)}
                          title="Edit Recording"
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-purple-300 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cls._id)}
                          title="Delete Recording"
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    )}

    {/* ── PREVIEW MODAL ────────────────────────────────────────── */}
    {previewClass && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-ink border border-white/15 rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Tv className="w-5 h-5 text-acid" />
                  <h3 className="font-bold text-white text-base font-grotesk">
                    {previewClass.title}
                  </h3>
                </div>
                <button
                  onClick={() => setPreviewClass(null)}
                  className="text-slate-400 hover:text-white font-mono text-xs px-3 py-1 rounded-lg bg-white/5"
                >
                  Close [ESC]
                </button>
              </div>

              <div className="aspect-video w-full bg-black">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${previewClass.videoId || extractYoutubeId(previewClass.youtubeUrl)}?autoplay=1&rel=0`}
                  title={previewClass.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              <div className="p-5 flex items-center justify-between gap-4">
                <div className="text-xs font-mono text-slate-400">
                  Batch: <span className="text-white">{previewClass.batch}</span> | Status:{' '}
                  <span className="text-acid uppercase">
                    {previewClass.status === 'ended' ? 'RECORDED' : previewClass.status}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleOpenAccessModal(previewClass)}
                    className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 font-semibold text-xs font-mono flex items-center gap-1.5 transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Manage Access & Views
                  </button>

                  <button
                    onClick={() => handleCopyLink(previewClass)}
                    className="px-4 py-2 rounded-xl bg-acid text-black font-semibold text-xs font-mono flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy Student Link
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── MANAGE ACCESS MODAL ────────────────────────────────────── */}
        {accessModalClass && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-ink border border-white/15 rounded-2xl max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-acid/10 border border-acid/30 flex items-center justify-center text-acid">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg font-grotesk flex items-center gap-2">
                      Manage Access & View Limits
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase ${
                        accessModalClass.status === 'ended'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {accessModalClass.status === 'ended' ? 'Recording' : 'Live Stream'}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 font-mono truncate max-w-md">
                      {accessModalClass.title}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setAccessModalClass(null)}
                  className="text-slate-400 hover:text-white p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                {/* ── Student View Limit Setting (Default: 3, Admin can increase) ── */}
                <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
                        <Eye className="w-4 h-4 text-cyan-400" />
                        Student View Limit Per Video
                      </label>
                      <p className="text-xs text-slate-400 font-grotesk mt-0.5">
                        Students are restricted to 3 views by default. You can increase or remove this limit for this class.
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 self-start sm:self-auto">
                      <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                        Limit: {modalMaxViews >= 999 ? 'Unlimited' : `${modalMaxViews} Views`}
                      </span>
                    </div>
                  </div>

                  {/* Preset quick buttons & custom number input */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {[
                      { val: 3, label: '3 (Standard Default)' },
                      { val: 5, label: '5 Views' },
                      { val: 10, label: '10 Views' },
                      { val: 20, label: '20 Views' },
                      { val: 999, label: 'Unlimited' },
                    ].map((item) => (
                      <button
                        key={item.val}
                        type="button"
                        onClick={() => setModalMaxViews(item.val)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all font-semibold ${
                          modalMaxViews === item.val
                            ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20 font-bold'
                            : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}

                    {/* Custom view limit input */}
                    <div className="flex items-center gap-2 ml-auto">
                      <span className="text-xs font-mono text-slate-400">Custom Limit:</span>
                      <input
                        type="number"
                        min="1"
                        max="999"
                        value={modalMaxViews}
                        onChange={(e) => setModalMaxViews(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-20 bg-ink border border-white/20 rounded-lg px-2.5 py-1 text-xs font-mono text-white text-center focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  {/* Student View Tracker & Reset if any views have been recorded */}
                  {Array.isArray(accessModalClass.studentViews) && accessModalClass.studentViews.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          Tracked Students ({accessModalClass.studentViews.length}):
                        </span>
                        <button
                          type="button"
                          onClick={() => handleResetViews(accessModalClass._id)}
                          disabled={resettingViews}
                          className="text-[11px] text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1 transition-colors"
                        >
                          <RefreshCw className={`w-3 h-3 ${resettingViews ? 'animate-spin' : ''}`} />
                          Reset All Student Views
                        </button>
                      </div>

                      <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1">
                        {accessModalClass.studentViews.map((sv, idx) => {
                          const reached = sv.count >= modalMaxViews;
                          return (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-white/5 text-xs font-mono"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-200">{sv.indexNumber || 'Unknown'}</span>
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    reached
                                      ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                      : 'bg-cyan-500/10 text-cyan-300'
                                  }`}
                                >
                                  {sv.count}/{modalMaxViews >= 999 ? '∞' : modalMaxViews} views {reached ? '(LIMIT REACHED)' : ''}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleResetViews(accessModalClass._id, sv.indexNumber)}
                                className="text-[10px] text-amber-400 hover:text-amber-300 underline"
                              >
                                Reset Views
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Access Mode Selector */}
                <div>
                  <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-3">
                    Access Level Setting
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setModalIsRestricted(false)}
                      className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 ${
                        !modalIsRestricted
                          ? 'bg-acid/10 border-acid shadow-lg shadow-acid/10 ring-1 ring-acid'
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-grotesk font-bold text-white text-sm flex items-center gap-2">
                          <Users className="w-4 h-4 text-acid" />
                          All Registered Students
                        </span>
                        {!modalIsRestricted && (
                          <span className="w-2.5 h-2.5 rounded-full bg-acid shadow-sm shadow-acid" />
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-grotesk">
                        Public to all students. Any registered student account can watch this lecture.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setModalIsRestricted(true)}
                      className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 ${
                        modalIsRestricted
                          ? 'bg-amber-500/10 border-amber-500 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500'
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-grotesk font-bold text-white text-sm flex items-center gap-2">
                          <Lock className="w-4 h-4 text-amber-400" />
                          Restricted Access
                        </span>
                        {modalIsRestricted && (
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500" />
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-grotesk">
                        Only students with explicitly selected index numbers below will have access.
                      </p>
                    </button>
                  </div>
                </div>

                {/* When Restricted Access is Active: Show Student Index Numbers Selector */}
                {modalIsRestricted && (
                  <div className="space-y-4 pt-2 border-t border-white/10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold font-grotesk text-white flex items-center gap-2">
                          Select Permitted Student Index Numbers
                        </h4>
                        <p className="text-xs text-slate-400 font-mono">
                          Check each index number that should be allowed to watch
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {modalSelectedStudents.length} Selected
                        </span>
                        <button
                          type="button"
                          onClick={() => handleSelectAllFiltered(filteredStudents)}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-mono border border-white/10"
                        >
                          Select All
                        </button>
                        <button
                          type="button"
                          onClick={handleDeselectAll}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 text-xs font-mono border border-white/10"
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                    {/* Search & Batch Filters */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                        <input
                          type="text"
                          placeholder="Search by student index (e.g. STU-2025-) or name..."
                          value={studentSearch}
                          onChange={(e) => setStudentSearch(e.target.value)}
                          className="w-full bg-ink border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      {uniqueStudentBatches.length > 0 && (
                        <select
                          value={studentBatchFilter}
                          onChange={(e) => setStudentBatchFilter(e.target.value)}
                          className="bg-ink border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-amber-400"
                        >
                          <option value="all">All Batches</option>
                          {uniqueStudentBatches.map((b) => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                      )}
                    </div>

                    {/* Manual Index Input (for added flexibility) */}
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.02] border border-white/5">
                      <input
                        type="text"
                        placeholder="Or enter custom index number (e.g. STU-2025-0015)..."
                        value={manualIndexInput}
                        onChange={(e) => setManualIndexInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddManualIndex();
                          }
                        }}
                        className="flex-1 bg-transparent px-3 py-1.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddManualIndex}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 text-black font-mono font-bold text-xs hover:bg-amber-400 transition-all"
                      >
                        Add Index
                      </button>
                    </div>

                    {/* Student list */}
                    <div className="border border-white/10 rounded-xl bg-black/40 overflow-hidden">
                      <div className="max-h-60 overflow-y-auto divide-y divide-white/5">
                        {loadingStudents ? (
                          <div className="p-8 text-center text-slate-400 font-mono text-xs flex flex-col items-center justify-center gap-2">
                            <RefreshCw className="w-5 h-5 animate-spin text-amber-400" />
                            Loading registered students...
                          </div>
                        ) : filteredStudents.length === 0 ? (
                          <div className="p-8 text-center text-slate-400 font-mono text-xs">
                            {students.length === 0
                              ? 'No registered students found. You can add index numbers manually above.'
                              : 'No students match the search filter.'}
                          </div>
                        ) : (
                          filteredStudents.map((stu) => {
                            const idxNum = String(stu.indexNumber || (stu._id ? 'STU-' + stu._id.slice(-4).toUpperCase() : '')).trim();
                            const isChecked = modalSelectedStudents.some(
                              (i) => String(i).toLowerCase().trim() === idxNum.toLowerCase()
                            );

                            return (
                              <div
                                key={stu._id || idxNum}
                                onClick={() => toggleStudentSelection(idxNum)}
                                className={`p-3 flex items-center justify-between cursor-pointer transition-colors select-none ${
                                  isChecked
                                    ? 'bg-amber-500/15 hover:bg-amber-500/20 border-l-2 border-amber-400'
                                    : 'hover:bg-white/5'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    readOnly
                                    className="w-4 h-4 rounded text-amber-500 bg-ink border-white/20 focus:ring-amber-400 pointer-events-none"
                                  />
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono text-xs font-bold text-white bg-white/10 px-2 py-0.5 rounded border border-white/10">
                                        {idxNum || 'NO-INDEX'}
                                      </span>
                                      <span className="font-grotesk font-semibold text-xs text-slate-200">
                                        {stu.name}
                                      </span>
                                    </div>
                                    <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                                      {stu.batch || 'Batch Not Assigned'} • {stu.email}
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  {isChecked ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-300 font-semibold bg-amber-500/20 px-2 py-0.5 rounded">
                                      <Check className="w-3 h-3" /> Allowed
                                    </span>
                                  ) : (
                                    <span className="text-[11px] font-mono text-slate-500">
                                      No Access
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Selected Index Numbers Tags preview */}
                    {modalSelectedStudents.length > 0 && (
                      <div>
                        <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1.5">
                          Selected Index Numbers ({modalSelectedStudents.length}):
                        </label>
                        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 rounded-xl bg-white/[0.02] border border-white/5">
                          {modalSelectedStudents.map((idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-mono"
                            >
                              {idx}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleStudentSelection(idx);
                                }}
                                className="hover:text-white"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-white/10 flex items-center justify-between bg-white/[0.02]">
                <button
                  type="button"
                  onClick={() => setAccessModalClass(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-mono text-xs transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSaveAccess}
                  disabled={savingAccess}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2"
                >
                  {savingAccess ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Saving Settings...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Apply Access & View Limits
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default LiveClass;

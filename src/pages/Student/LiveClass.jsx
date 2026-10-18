import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import StudentNavbar from '../../components/StudentNavbar';
import API from '../../services/api';
import {
  Video,
  Radio,
  Play,
  Clock,
  FileText,
  Tv,
  Search,
  BookOpen,
  Film,
  Lock,
  ShieldCheck,
  Users,
  Eye
} from 'lucide-react';

const extractYoutubeId = (url) => {
  if (!url) return '';
  const cleanUrl = url.trim();
  const regExp = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i;
  const match = cleanUrl.match(regExp);
  if (match && match[1]) {
    return match[1];
  }
  if (/^[a-zA-Z0-9_-]{11}$/.test(cleanUrl)) {
    return cleanUrl;
  }
  return '';
};

const DEFAULT_CLASSES = [
  {
    _id: 'demo-1',
    title: 'Advanced Organic Chemistry - Reaction Mechanisms Masterclass',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    videoId: 'dQw4w9WgXcQ',
    description: 'In-depth breakdown of nucleophilic substitution (SN1/SN2) with past paper discussion.',
    batch: 'All',
    status: 'live',
    materialsUrl: 'https://example.com/handout.pdf',
    allowChat: true,
  },
  {
    _id: 'rec-demo-1',
    title: 'Thermochemistry & Hess Law Problem Solving - Class Recording',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    videoId: 'dQw4w9WgXcQ',
    description: 'Full lecture recording covering enthalpy changes, Born-Haber cycles, and exam numericals.',
    batch: '2025 A/L Theory',
    status: 'ended',
    materialsUrl: 'https://example.com/handout.pdf',
    allowChat: false,
  }
];

const StudentLiveClass = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const requestedId = searchParams.get('id');

  const token = sessionStorage.getItem('token');
  const currentUser = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem('user')) || null;
    } catch {
      return null;
    }
  }, []);

  // Security Verification: Only genuine website-registered students (or instructors) can view videos
  const isRegisteredStudent = Boolean(
    token &&
    token !== 'guest-token' &&
    currentUser &&
    (currentUser.role === 'student' || currentUser.role === 'instructor' || currentUser.role === 'admin')
  );

  // Automatically redirect unauthorized users / guests with direct link to login UI
  useEffect(() => {
    if (!isRegisteredStudent) {
      navigate('/login', {
        replace: true,
        state: {
          from: location.pathname + location.search,
          message: 'Please log in with your registered student account to view class videos.',
        },
      });
    }
  }, [isRegisteredStudent, navigate, location]);

  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryTab, setCategoryTab] = useState('all'); // 'all', 'live', 'recordings'

  // Fetch classes
  useEffect(() => {
    if (!isRegisteredStudent) return;

    const loadClasses = async () => {
      setLoading(true);
      try {
        const res = await API.get('/live-classes');
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          setClasses(res.data);
          selectInitial(res.data);
          return;
        }
      } catch (err) {
        if (err.response?.status === 401) {
          navigate('/login', {
            replace: true,
            state: {
              from: location.pathname + location.search,
              message: 'Session expired or unauthorized. Please log in with your registered student account.',
            },
          });
          return;
        }
      } finally {
        setLoading(false);
      }

      const cached = localStorage.getItem('chemone_live_classes');
      const data = cached ? JSON.parse(cached) : DEFAULT_CLASSES;
      setClasses(data);
      selectInitial(data);
    };

    const selectInitial = (list) => {
      if (!list || list.length === 0) return;
      if (requestedId) {
        const match = list.find((c) => c._id === requestedId || c.videoId === requestedId);
        if (match) {
          setSelectedClass(match);
          return;
        }
      }
      // Prioritize active live class, else first scheduled/recent
      const liveOne = list.find((c) => c.status === 'live');
      setSelectedClass(liveOne || list[0]);
    };

    loadClasses();
  }, [requestedId, isRegisteredStudent, navigate, location]);

  const activeVideoId = useMemo(() => {
    if (!isRegisteredStudent || !selectedClass) return '';
    return selectedClass.videoId || extractYoutubeId(selectedClass.youtubeUrl);
  }, [selectedClass, isRegisteredStudent]);

  const studentIndexNumber = currentUser?.indexNumber;
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'instructor';

  // Helper to verify if the student has access to a given class
  const checkHasAccess = (cls) => {
    if (!cls || !isRegisteredStudent) return false;
    if (isAdmin) return true;
    if (!cls.isRestricted) return true;
    if (!studentIndexNumber) return false;
    const allowed = Array.isArray(cls.allowedStudents) ? cls.allowedStudents : [];
    return allowed.some(
      (idx) => String(idx).toLowerCase().trim() === String(studentIndexNumber).toLowerCase().trim()
    );
  };

  const selectedHasAccess = useMemo(() => {
    return checkHasAccess(selectedClass);
  }, [selectedClass, studentIndexNumber, isAdmin, isRegisteredStudent]);

  // Helper to get views used by the current student for a given class
  const getViewsUsed = (cls) => {
    if (!cls || !studentIndexNumber) return 0;
    const views = Array.isArray(cls.studentViews) ? cls.studentViews : [];
    const lower = String(studentIndexNumber).toLowerCase().trim();
    const entry = views.find(
      (v) => v.indexNumber && String(v.indexNumber).toLowerCase().trim() === lower
    );
    return entry ? Number(entry.count || 0) : 0;
  };

  const maxViewsPerVideo = selectedClass?.maxViewsPerStudent ?? 3;
  const currentViewsUsed = useMemo(() => {
    if (isAdmin) return 0;
    return getViewsUsed(selectedClass);
  }, [selectedClass, studentIndexNumber, isAdmin]);

  const viewsRemaining = useMemo(() => {
    if (isAdmin) return maxViewsPerVideo;
    return Math.max(0, maxViewsPerVideo - currentViewsUsed);
  }, [maxViewsPerVideo, currentViewsUsed, isAdmin]);

  const isViewLimitReached = useMemo(() => {
    if (isAdmin) return false;
    return currentViewsUsed >= maxViewsPerVideo;
  }, [isAdmin, currentViewsUsed, maxViewsPerVideo]);

  // Record a view for the student when opening an authorized class
  useEffect(() => {
    if (!selectedClass || !selectedClass._id || isAdmin || !studentIndexNumber) return;
    if (!selectedHasAccess) return;
    if (currentViewsUsed >= maxViewsPerVideo) return;

    // Use sessionStorage to prevent multiple view counts within the same browser session
    const sessionKey = `chemone_view_session_${selectedClass._id}_${studentIndexNumber}`;
    const alreadyRecorded = sessionStorage.getItem(sessionKey);

    if (!alreadyRecorded) {
      sessionStorage.setItem(sessionKey, 'true');
      API.post(`/live-classes/${selectedClass._id}/view`, {
        action: 'record',
        indexNumber: studentIndexNumber,
      })
        .then((res) => {
          if (res.data && res.data.viewsUsed !== undefined) {
            const newCount = res.data.viewsUsed;
            setClasses((prevClasses) =>
              prevClasses.map((c) => {
                if (c._id !== selectedClass._id) return c;
                const existing = Array.isArray(c.studentViews) ? [...c.studentViews] : [];
                const lower = String(studentIndexNumber).toLowerCase().trim();
                const idx = existing.findIndex(
                  (v) => v.indexNumber && String(v.indexNumber).toLowerCase().trim() === lower
                );
                if (idx >= 0) {
                  existing[idx] = { ...existing[idx], count: newCount };
                } else {
                  existing.push({ indexNumber: studentIndexNumber, count: newCount });
                }
                return { ...c, studentViews: existing };
              })
            );
            setSelectedClass((prev) => {
              if (!prev || prev._id !== selectedClass._id) return prev;
              const existing = Array.isArray(prev.studentViews) ? [...prev.studentViews] : [];
              const lower = String(studentIndexNumber).toLowerCase().trim();
              const idx = existing.findIndex(
                (v) => v.indexNumber && String(v.indexNumber).toLowerCase().trim() === lower
              );
              if (idx >= 0) {
                existing[idx] = { ...existing[idx], count: newCount };
              } else {
                existing.push({ indexNumber: studentIndexNumber, count: newCount });
              }
              return { ...prev, studentViews: existing };
            });
          }
        })
        .catch((err) => {
          console.error('Error recording video view:', err);
        });
    }
  }, [selectedClass?._id, selectedHasAccess, studentIndexNumber, isAdmin]);

  const liveCount = useMemo(() => classes.filter((c) => c.status === 'live').length, [classes]);
  const upcomingCount = useMemo(() => classes.filter((c) => c.status === 'scheduled').length, [classes]);
  const recordingCount = useMemo(() => classes.filter((c) => c.status === 'ended').length, [classes]);

  const filteredClasses = useMemo(() => {
    return classes.filter((cls) => {
      const matchesSearch =
        cls.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cls.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cls.batch?.toLowerCase().includes(searchQuery.toLowerCase());

      if (categoryTab === 'live') {
        return matchesSearch && (cls.status === 'live' || cls.status === 'scheduled');
      }
      if (categoryTab === 'recordings') {
        return matchesSearch && cls.status === 'ended';
      }
      return matchesSearch;
    });
  }, [classes, searchQuery, categoryTab]);

  if (!isRegisteredStudent) {
    return (
      <div className="min-h-screen bg-ink flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-2 border-acid border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-mono text-sm text-slate-300">Redirecting to login...</p>
        <p className="font-mono text-xs text-slate-500 mt-1">Website registered student access required.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink text-slate-100 pb-20">
      <StudentNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Top Breadcrumb / Title & Quick Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold tracking-wider bg-red-500/20 text-red-400 border border-red-500/30">
                <Radio className="w-3 h-3 mr-1 animate-pulse" />
                LIVE STREAM THEATER
              </span>
              <span className="text-xs font-mono text-slate-400">ChemBridge Studio</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bebas tracking-wide text-white">
              Chemistry <span className="text-acid">Live Class & Recordings</span>
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Quick Stats Badges */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCategoryTab('live')}
                className={`px-3 py-1.5 rounded-xl border text-xs font-mono transition-all flex items-center gap-1.5 ${categoryTab === 'live'
                    ? 'bg-red-500/20 border-red-500/40 text-red-300'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
              >
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span>Live: {liveCount}</span>
              </button>

              <button
                onClick={() => setCategoryTab('recordings')}
                className={`px-3 py-1.5 rounded-xl border text-xs font-mono transition-all flex items-center gap-1.5 ${categoryTab === 'recordings'
                    ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
              >
                <Film className="w-3.5 h-3.5 text-purple-400" />
                <span>Recordings: {recordingCount}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── THEATER VIEW ────────────────────────────────────────── */}
        <div className="mb-10 p-4 sm:p-6 rounded-3xl bg-ink/40 border border-white/5 backdrop-blur-xs">
          {/* Main Video & Details */}
          <div>
            {/* Player Container - Pure Black & Isolated Above Background Video (zIndex: 9999) */}
            <div
              className="aspect-video w-full rounded-2xl overflow-hidden bg-black border-2 border-acid/40 shadow-[0_0_30px_rgba(163,255,60,0.25),0_0_60px_rgba(163,255,60,0.12)] relative"
              style={{ zIndex: 9999 }}
            >
              {loading && !selectedClass ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-black">
                  <div className="w-10 h-10 border-2 border-acid border-t-transparent rounded-full animate-spin mb-3" />
                  <p className="text-xs font-mono text-slate-400">Loading stream theater...</p>
                </div>
              ) : selectedClass && !selectedHasAccess ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-black border border-amber-500/20">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 shadow-xl shadow-amber-500/10">
                    <Lock className="w-8 h-8" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-2">
                    <Lock className="w-3 h-3" /> Access Limit Active
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold font-grotesk text-white mb-2 max-w-md">
                    Restricted Access Lecture
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 font-grotesk max-w-md mb-4 leading-relaxed">
                    {studentIndexNumber ? (
                      <>
                        Your student index number <span className="font-mono text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">{studentIndexNumber}</span> has not been authorized to stream this session.
                      </>
                    ) : (
                      <>
                        This class is restricted to specific enrolled students. Please log in with your student index number to verify access.
                      </>
                    )}
                  </p>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs font-mono text-slate-400 max-w-sm">
                    Only selected student index numbers can view this video. Please contact the administrator to request access.
                  </div>
                </div>
              ) : isViewLimitReached && activeVideoId ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-black border border-red-500/20">
                  <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-4 shadow-xl shadow-red-500/10">
                    <Eye className="w-8 h-8" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-red-500/20 text-red-300 border border-red-500/30 mb-2">
                    <Eye className="w-3 h-3" /> View Limit Reached
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold font-grotesk text-white mb-2 max-w-md">
                    Maximum Views Exhausted
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 font-grotesk max-w-md mb-4 leading-relaxed">
                    You have used all <span className="font-mono text-red-300 font-bold bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">{maxViewsPerVideo}</span> allowed views for this video lecture.
                    {studentIndexNumber && (
                      <> Student: <span className="font-mono text-slate-300 font-bold">{studentIndexNumber}</span></>
                    )}
                  </p>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs font-mono text-slate-400 max-w-sm">
                    Each student is limited to {maxViewsPerVideo} views per video. Please contact your instructor if you need additional access.
                  </div>
                </div>
              ) : activeVideoId ? (
                <iframe
                  className="w-full h-full bg-black"
                  style={{ background: '#000' }}
                  src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=1&rel=0&modestbranding=1`}
                  title={selectedClass?.title || 'Chemistry Live Class'}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-black">
                  <Tv className="w-16 h-16 text-slate-600 mb-3" />
                  <p className="text-lg font-bold text-white mb-1">No Broadcast Selected</p>
                  <p className="text-xs font-mono text-slate-400">
                    Select a class from the list below to begin watching.
                  </p>
                </div>
              )}
            </div>

            {/* Video Meta Info */}
            {selectedClass && (
              <div className="mt-5 p-6 rounded-2xl bg-ink-lighter border border-white/10 shadow-lg">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {selectedClass.status === 'live' ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-red-600 text-white shadow-lg shadow-red-500/20">
                        <span className="w-2 h-2 rounded-full bg-white animate-ping mr-1.5" />
                        LIVE NOW
                      </span>
                    ) : selectedClass.status === 'scheduled' ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-semibold tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        <Clock className="w-3 h-3 mr-1" />
                        UPCOMING
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-purple-600/20 text-purple-300 border border-purple-500/30">
                        <Film className="w-3.5 h-3.5 mr-1 text-purple-400" />
                        RECORDED REPLAY
                      </span>
                    )}

                    <span className="px-3 py-1 rounded-full text-xs font-mono bg-white/5 text-slate-300 border border-white/10">
                      Batch: {selectedClass.batch}
                    </span>

                    {selectedClass.isRestricted ? (
                      selectedHasAccess ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-semibold tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                          Access Granted {studentIndexNumber ? `(${studentIndexNumber})` : ''}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-semibold tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          <Lock className="w-3.5 h-3.5 mr-1" />
                          Restricted Access
                        </span>
                      )
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono text-slate-300 bg-white/5 border border-white/10">
                        <Users className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        All Registered Students
                      </span>
                    )}

                    {/* View Count Badge */}
                    {!isAdmin && studentIndexNumber && selectedHasAccess && (
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-semibold tracking-wider uppercase border ${
                        isViewLimitReached
                          ? 'bg-red-500/20 text-red-300 border-red-500/30'
                          : viewsRemaining === 1
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                      }`}>
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        Views: {currentViewsUsed}/{maxViewsPerVideo}
                      </span>
                    )}
                  </div>

                  {selectedHasAccess && selectedClass.materialsUrl && (
                    <a
                      href={selectedClass.materialsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-acid text-black font-semibold text-xs font-mono hover:bg-acid/90 transition-all shadow-md shadow-acid/20"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Download Handout PDF
                    </a>
                  )}
                </div>

                <h2 className="text-xl sm:text-2xl font-bold font-grotesk text-white mb-3">
                  {selectedClass.title}
                </h2>

                {selectedClass.description && (
                  <p className="text-sm text-slate-300 font-grotesk leading-relaxed mb-4 bg-white/[0.02] p-4 rounded-xl border border-white/5">
                    {selectedClass.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400 pt-3 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Mode:</span>
                    <span className={selectedClass.status === 'ended' ? 'text-purple-400 font-semibold' : 'text-acid font-semibold'}>
                      {selectedClass.status === 'ended' ? 'On-Demand Lecture Recording' : 'Interactive Broadcast'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── ALL SESSIONS & REPLAYS ──────────────────────────────── */}
        <div className="bg-ink-lighter border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 mb-6 border-b border-white/10">
            <div>
              <h2 className="text-2xl font-bold font-bebas tracking-wide text-white">
                Live Broadcasts & Lecture Recordings ({filteredClasses.length})
              </h2>
              <p className="text-xs font-mono text-slate-400">
                Join active live chemistry broadcasts or rewatch past recordings
              </p>
            </div>

            {/* Category tabs & Search Toolbar */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-ink border border-white/10 text-xs font-mono">
                <button
                  onClick={() => setCategoryTab('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${categoryTab === 'all'
                      ? 'bg-acid text-black font-bold'
                      : 'text-slate-400 hover:text-white'
                    }`}
                >
                  All ({classes.length})
                </button>
                <button
                  onClick={() => setCategoryTab('live')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${categoryTab === 'live'
                      ? 'bg-red-600 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                    }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                  Live ({liveCount + upcomingCount})
                </button>
                <button
                  onClick={() => setCategoryTab('recordings')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${categoryTab === 'recordings'
                      ? 'bg-purple-600 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                    }`}
                >
                  <Film className="w-3 h-3" />
                  Recordings ({recordingCount})
                </button>
              </div>

              <div className="relative min-w-[200px]">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search sessions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-ink border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-acid"
                />
              </div>
            </div>
          </div>

          {filteredClasses.length === 0 ? (
            <div className="py-16 text-center text-slate-500 bg-white/[0.02] rounded-xl border border-dashed border-white/10">
              <Video className="w-12 h-12 mx-auto mb-3 text-slate-600" />
              <p className="text-base font-semibold text-slate-300">No sessions found</p>
              <p className="text-xs font-mono text-slate-500 mt-1">
                Try switching categories or adjust your search filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClasses.map((cls) => {
                const vid = cls.videoId || extractYoutubeId(cls.youtubeUrl);
                const isSelected = selectedClass?._id === cls._id;
                const isLive = cls.status === 'live';
                const isRecording = cls.status === 'ended';
                const hasCardAccess = checkHasAccess(cls);

                return (
                  <div
                    key={cls._id}
                    onClick={() => {
                      setSelectedClass(cls);
                      window.scrollTo({ top: 60, behavior: 'smooth' });
                    }}
                    className={`rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer group flex flex-col justify-between ${isSelected
                        ? isRecording
                          ? 'border-purple-500 shadow-lg shadow-purple-500/20 bg-slate-900/80 ring-1 ring-purple-500'
                          : 'border-acid shadow-lg shadow-acid/10 bg-slate-900/80 ring-1 ring-acid'
                        : isLive
                          ? 'border-red-500/50 bg-ink hover:border-red-500'
                          : isRecording
                            ? 'border-white/10 bg-ink hover:border-purple-500/30 hover:shadow-xl'
                            : 'border-white/10 bg-ink hover:border-white/20 hover:shadow-xl'
                      }`}
                  >
                    <div>
                      {/* Thumbnail */}
                      <div className="aspect-video w-full bg-black relative overflow-hidden">
                        {vid ? (
                          <img
                            src={`https://img.youtube.com/vi/${vid}/hqdefault.jpg`}
                            alt={cls.title}
                            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${!hasCardAccess ? 'opacity-40 grayscale' : ''
                              }`}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600 bg-slate-900">
                            {isRecording ? <Film className="w-10 h-10" /> : <Video className="w-10 h-10" />}
                          </div>
                        )}

                        <div className="absolute top-3 left-3 flex items-center gap-1.5">
                          {isLive ? (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase bg-red-600 text-white shadow-lg flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                              LIVE
                            </span>
                          ) : cls.status === 'scheduled' ? (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold tracking-wider uppercase bg-amber-500 text-black shadow-lg">
                              UPCOMING
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase bg-purple-600/90 text-white shadow-lg flex items-center gap-1">
                              <Film className="w-3 h-3" />
                              RECORDING
                            </span>
                          )}
                        </div>

                        {/* Top-Right Access Indicator */}
                        <div className="absolute top-3 right-3">
                          {cls.isRestricted ? (
                            hasCardAccess ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-600/90 text-white shadow-lg flex items-center gap-1 backdrop-blur-xs">
                                <ShieldCheck className="w-3 h-3" /> ACCESS
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-600/90 text-white shadow-lg flex items-center gap-1 backdrop-blur-xs">
                                <Lock className="w-3 h-3" /> LOCKED
                              </span>
                            )
                          ) : null}
                        </div>

                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-2 font-mono text-xs font-semibold backdrop-blur-xs">
                          {hasCardAccess ? (
                            <>
                              <Play className="w-6 h-6 fill-white" />
                              {isRecording ? 'Play Recording' : 'Play Stream'}
                            </>
                          ) : (
                            <>
                              <Lock className="w-5 h-5 text-amber-400" />
                              <span className="text-amber-300">Restricted Access</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Details */}
                      <div className="p-4">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${isRecording
                              ? 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                              : 'bg-white/5 text-slate-400 border-white/10'
                            }`}>
                            Batch: {cls.batch}
                          </span>

                          {cls.isRestricted ? (
                            hasCardAccess ? (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
                                <ShieldCheck className="w-2.5 h-2.5" /> Access Granted
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1 font-semibold">
                                <Lock className="w-2.5 h-2.5" /> Restricted Access
                              </span>
                            )
                          ) : (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10 flex items-center gap-1">
                              <Users className="w-2.5 h-2.5" /> All Students
                            </span>
                          )}
                        </div>

                        <h3 className={`font-bold text-white font-grotesk text-sm line-clamp-2 mb-2 transition-colors ${isRecording ? 'group-hover:text-purple-300' : 'group-hover:text-acid'
                          }`}>
                          {cls.title}
                        </h3>

                        {cls.description && (
                          <p className="text-xs text-slate-400 font-grotesk line-clamp-2">
                            {cls.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="p-3 bg-white/[0.02] border-t border-white/5 flex items-center justify-between text-xs font-mono text-slate-400">
                      <span className={`flex items-center gap-1 font-semibold ${!hasCardAccess ? 'text-amber-400' : isRecording ? 'text-purple-400' : 'text-acid'
                        }`}>
                        {hasCardAccess ? (
                          <>
                            <Play className="w-3 h-3" /> {isRecording ? 'Watch Recording' : 'Watch Now'}
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3 text-amber-400" /> Access Locked
                          </>
                        )}
                      </span>
                      {hasCardAccess && cls.materialsUrl && (
                        <span className="flex items-center gap-1 text-slate-400">
                          <BookOpen className="w-3 h-3" /> Handout
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentLiveClass;

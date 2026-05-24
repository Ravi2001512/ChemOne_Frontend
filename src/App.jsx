import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import CreateSpotTest from "./pages/Admin/CreateSpotTest";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import StudentDashboard from "./pages/Student/StudentDashboard";
import ViewSpotTest from "./pages/Student/ViewSpotTest";
import TakeSpotTest from "./pages/Student/TakeSpotTest";
import Settings from "./pages/Settings";
import DailyWorksheet from "./pages/Admin/DailyWorksheet";
import ManageSpotTest from "./pages/Admin/ManageSpotTest";
import ManageDailyWorksheet from "./pages/Admin/ManageDailyWorksheet";
import ManageStudents from "./pages/Admin/ManageStudents";
import ManageResults from "./pages/Admin/ManageResults";
import Dailyworksheet from "./pages/Student/Dailyworksheet";
import ViewPhysicalResults from "./pages/Student/ViewPhysicalResults";
import ChatWithAI from "./pages/Admin/ChatWithAI";
import ManageKnowledge from "./pages/Admin/ManageKnowledge";
import ChatBot from "./pages/Student/ChatBot";
import About from "./pages/Student/About"
import Games from "./pages/Student/Games"
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import AutoLogout from "./components/AutoLogout";
import Qr from "./pages/Student/Qr";
import QRscanner from "./pages/Admin/QRscanner";

const AdminRoute = ({ children }) => {
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const token = sessionStorage.getItem('token');

  if (!token || user.role !== 'instructor') {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const StudentRoute = ({ children }) => {
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const token = sessionStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'instructor') {
    return <Navigate to="/admin" replace />;
  }
  return children;
};

const GuestRestrictRoute = ({ children }) => {
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  if (user.role === 'guest') {
    return <Navigate to="/student" replace />;
  }
  return children;
};

function App() {
  useEffect(() => {
    if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <BrowserRouter>
      <Analytics />
      <AutoLogout />
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/settings" element={<GuestRestrictRoute><Settings /></GuestRestrictRoute>} />

        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/signup" element={<AdminRoute><Signup /></AdminRoute>} />
        <Route path="/admin/chat-with-ai" element={<AdminRoute><ChatWithAI /></AdminRoute>} />
        <Route path="/admin/manage-knowledge" element={<AdminRoute><ManageKnowledge /></AdminRoute>} />
        <Route path="/admin/spot-test/create" element={<AdminRoute><CreateSpotTest /></AdminRoute>} />
        <Route path="/admin/spot-test/edit/:id" element={<AdminRoute><CreateSpotTest /></AdminRoute>} />
        <Route path="/admin/daily-worksheet" element={<AdminRoute><DailyWorksheet /></AdminRoute>} />
        <Route path="/admin/manage-spot-test" element={<AdminRoute><ManageSpotTest /></AdminRoute>} />
        <Route path="/admin/manage-daily-worksheet" element={<AdminRoute><ManageDailyWorksheet /></AdminRoute>} />
        <Route path="/admin/students" element={<AdminRoute><ManageStudents /></AdminRoute>} />
        <Route path="/admin/manage-results" element={<AdminRoute><ManageResults /></AdminRoute>} />
        <Route path="/admin/qr-scanner" element={<AdminRoute><QRscanner /></AdminRoute>} />

        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/student/spot-test" element={<ViewSpotTest />} />
        <Route path="/student/spot-test/:id" element={<TakeSpotTest />} />
        <Route path="/student/daily-worksheet" element={<Dailyworksheet />} />
        <Route path="/student/results" element={<ViewPhysicalResults />} />
        <Route path="/student/ai-chatbot" element={<GuestRestrictRoute><ChatBot /></GuestRestrictRoute>} />
        <Route path="/student/about" element={<About />} />
        <Route path="/student/games" element={<Games />} />
        <Route path="/student" element={<StudentRoute><StudentDashboard /></StudentRoute>} />
        <Route path="/student/spot-test" element={<StudentRoute><ViewSpotTest /></StudentRoute>} />
        <Route path="/student/spot-test/:id" element={<StudentRoute><TakeSpotTest /></StudentRoute>} />
        <Route path="/student/daily-worksheet" element={<StudentRoute><Dailyworksheet /></StudentRoute>} />
        <Route path="/student/results" element={<StudentRoute><ViewPhysicalResults /></StudentRoute>} />
        <Route path="/student/ai-chatbot" element={<StudentRoute><ChatBot /></StudentRoute>} />
        <Route path="/student/about" element={<StudentRoute><About /></StudentRoute>} />
        <Route path="/student/games" element={<StudentRoute><Games /></StudentRoute>} />
        <Route path="/student/qr" element={<StudentRoute><Qr /></StudentRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
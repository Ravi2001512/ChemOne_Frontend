import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import ChatBot from "./pages/Student/ChatBot";
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';

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
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/settings" element={<Settings />} />

        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/spot-test/create" element={<CreateSpotTest />} />
        <Route path="/admin/spot-test/edit/:id" element={<CreateSpotTest />} />
        <Route path="/admin/daily-worksheet" element={<DailyWorksheet />} />
        <Route path="/admin/manage-spot-test" element={<ManageSpotTest />} />
        <Route path="/admin/manage-daily-worksheet" element={<ManageDailyWorksheet />} />
        <Route path="/admin/students" element={<ManageStudents />} />
        <Route path="/admin/manage-results" element={<ManageResults />} />

        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/student/spot-test" element={<ViewSpotTest />} />
        <Route path="/student/spot-test/:id" element={<TakeSpotTest />} />
        <Route path="/student/daily-worksheet" element={<Dailyworksheet />} />
        <Route path="/student/results" element={<ViewPhysicalResults />} />
        <Route path="/student/ai-chatbot" element={<ChatBot />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
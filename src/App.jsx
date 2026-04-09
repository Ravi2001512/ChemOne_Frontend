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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/signup" replace />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Common Routes */}
        <Route path="/settings" element={<Settings />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/spot-test/create" element={<CreateSpotTest />} />
        <Route path="/admin/spot-test/edit/:id" element={<CreateSpotTest />} />
        <Route path="/admin/daily-worksheet" element={<DailyWorksheet />} />

        {/* Student Routes */}
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/student/spot-test" element={<ViewSpotTest />} />
        <Route path="/student/spot-test/:id" element={<TakeSpotTest />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
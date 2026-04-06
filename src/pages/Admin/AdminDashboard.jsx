import React from 'react';
import AdminNavbar from '../../components/AdminNavbar';

const AdminDashboard = () => {
  return (
    <>
      <AdminNavbar />
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl justify-center font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500 mb-4">
          Admin Dashboard
        </h1>
        <p className="text-gray-500 text-lg">Welcome back, Instructor! Use the top navigation bar to manage your institute.</p>
      </div>
    </>
  );
};

export default AdminDashboard;

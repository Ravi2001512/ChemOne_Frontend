import React from 'react';
import StudentNavbar from '../../components/StudentNavbar';

const ChatBot = () => {
    return (
        <div className="min-h-screen bg-blue-50 dark:bg-slate-900">
            <StudentNavbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:bg-gradient-to-r dark:from-indigo-600 dark:to-purple-600 dark:bg-clip-text dark:text-transparent">
                    Chatbot
                </h1>
            </main>
        </div>
    );
};

export default ChatBot;
import StudentNavbar from '../../components/StudentNavbar';

const AIChatbot = () => {
    return (
        <div className="min-h-screen bg-blue-50 dark:bg-black font-sans">
            <StudentNavbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 -mt-10 relative z-20">
                <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">
                    AI Chatbot
                </h1>
            </div>
        </div>
    );
}

export default AIChatbot;
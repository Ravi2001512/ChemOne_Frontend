import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

const ConfirmationModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title = "Confirm Action", 
    message = "Are you sure you want to proceed?", 
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = "danger" // danger, warning, info
}) => {
    if (!isOpen) return null;

    const colors = {
        danger: "bg-red-600 hover:bg-red-700 text-white",
        warning: "bg-amber-500 hover:bg-amber-600 text-white",
        info: "bg-indigo-600 hover:bg-indigo-700 text-white"
    };

    const iconColors = {
        danger: "text-red-600 bg-red-50",
        warning: "text-amber-600 bg-amber-50",
        info: "text-indigo-600 bg-indigo-50"
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
                onClick={onClose}
            ></div>
            
            <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className={`p-3 rounded-2xl ${iconColors[type]}`}>
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 dark:bg-slate-800 rounded-full transition-colors"
                        >
                            <X className="h-5 w-5 text-slate-400" />
                        </button>
                    </div>

                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                        {title}
                    </h3>
                    <p className="text-slate-500 font-medium leading-relaxed">
                        {message}
                    </p>
                </div>

                <div className="px-8 py-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 text-slate-600 dark:text-slate-400 font-bold rounded-2xl hover:bg-slate-100 dark:bg-slate-800 transition-all active:scale-95"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`flex-1 px-6 py-3.5 font-bold rounded-2xl transition-all active:scale-95 shadow-lg shadow-slate-200 ${colors[type]}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;

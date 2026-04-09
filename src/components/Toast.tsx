import { AlertCircle, CheckCircle2 } from "lucide-react";

export interface Notification {
    text: string;
    type: string;
}

export default function Toast({ notification }: { notification: Notification }) {
    return (
        <div className={`fixed top-20 right-8 px-6 py-4 rounded shadow-2xl flex items-center gap-4 animate-in slide-in-from-right duration-300 z-110 border-l-4 ${notification.type === 'error' ? 'bg-white text-red-600 border-red-500' :
            notification.type === 'success' ? 'bg-white text-emerald-600 border-emerald-500' :
                notification.type === 'warning' ? 'bg-white text-amber-500 border-amber-500' : 'bg-white text-slate-800 border-slate-400'
            }`}>
            {notification.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
            <p className="text-xs font-black uppercase tracking-widest">{notification.text}</p>
        </div>
    );
}
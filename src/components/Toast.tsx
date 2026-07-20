import { AlertCircle, CheckCircle2 } from "lucide-react";

export interface Notification {
    text: string;
    type: string;
}

export default function Toast({ notification }: { notification: Notification }) {
    return (
        <div className={`fixed top-20 right-8 px-6 py-4 flex items-center gap-4 z-110 mc-panel ${notification.type === 'error' ? 'text-mc-redstone' :
            notification.type === 'success' ? 'text-mc-grass' :
                notification.type === 'warning' ? 'text-mc-gold' : 'text-white'
            }`}>
            {notification.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
            <p className="text-[10px] font-minecraft mc-text-shadow uppercase">{notification.text}</p>
        </div>
    );
}
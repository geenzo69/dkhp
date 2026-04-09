"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import Toast, { Notification } from "@/components/Toast";

interface Log {
    id: number;
    time: string;
    message: string;
    type: string;
}

interface AppContextType {
    logs: Log[];
    addLog: (message: string, type?: "info" | "success" | "warning" | "error") => void;
    clearLogs: () => void;
    notify: (text: string, type?: "info" | "success" | "warning" | "error", duration?: number) => void;
    notification: Notification | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
    const [logs, setLogs] = useState<Log[]>([]);
    const [notification, setNotification] = useState<Notification | null>(null);

    const addLog = useCallback((message: string, type: "info" | "success" | "warning" | "error" = "info") => {
        const newLog: Log = {
            id: Date.now(),
            time: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            }),
            message,
            type,
        };
        setLogs((prev) => [newLog, ...prev]);
    }, []);

    const clearLogs = useCallback(() => {
        setLogs([]);
    }, []);

    const notify = useCallback((text: string, type: "info" | "success" | "warning" | "error" = "info", duration = 3000) => {
        setNotification({ text, type });
        setTimeout(() => {
            setNotification((prev) => (prev?.text === text ? null : prev));
        }, duration);
    }, []);

    return (
        <AppContext.Provider value={{ logs, addLog, clearLogs, notify, notification }}>
            {children}
            {notification && <Toast notification={notification} />}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error("useApp must be used within an AppProvider");
    }
    return context;
}

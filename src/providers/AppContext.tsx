"use client";

import {
    createContext,
    useCallback,
    useContext,
    useState,
} from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import Toast, { Notification } from "@/components/Toast";
import type { HocPhan, LopHocPhan } from "@/util/course";
import Course from "@/types/Course";

interface Log {
    id: number;
    time: string;
    message: string;
    type: string;
}

interface AppContextType {
    logs: Log[];
    courses: Course[];
    plannedCourses: { course: HocPhan; group: LopHocPhan }[];
    setCourses: Dispatch<
        SetStateAction<Course[]>
    >;
    setPlannedCourses: Dispatch<
        SetStateAction<{ course: HocPhan; group: LopHocPhan }[]>
    >;
    addLog: (message: string, type?: "info" | "success" | "warning" | "error") => void;
    clearLogs: () => void;
    notify: (text: string, type?: "info" | "success" | "warning" | "error", duration?: number) => void;
    notification: Notification | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
    const [logs, setLogs] = useState<Log[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [plannedCourses, setPlannedCourses] = useState<
        { course: HocPhan; group: LopHocPhan }[]
    >([]);
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
        <AppContext.Provider
            value={{
                logs,
                courses,
                plannedCourses,
                setCourses,
                setPlannedCourses,
                addLog,
                clearLogs,
                notify,
                notification,
            }}
        >
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

"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import Toast, { Notification } from "@/components/Toast";
import Course from "@/types/Course";
import LopHocPhan from "@/types/LopHocPhan";
import User from "@/types/User";
import getCurrentUser from "@/app/actions/getUser";
import getCourses from "@/app/actions/getCourses";

interface Log {
    id: number;
    time: string;
    message: string;
    type: string;
}

interface AppContextType {
    logs: Log[];
    courses: Course[];
    plannedCourses: { course: Course; group: LopHocPhan }[];
    setCourses: Dispatch<
        SetStateAction<Course[]>
    >;
    setPlannedCourses: Dispatch<
        SetStateAction<{ course: Course; group: LopHocPhan }[]>
    >;
    addLog: (message: string, type?: "info" | "success" | "warning" | "error") => void;
    clearLogs: () => void;
    notify: (text: string, type?: "info" | "success" | "warning" | "error", duration?: number) => void;
    notification: Notification | null;
    isLoadingCourses: boolean;
    refetchCourses: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
    const [logs, setLogs] = useState<Log[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [plannedCourses, setPlannedCourses] = useState<
        { course: Course; group: LopHocPhan }[]
    >([]);
    const [notification, setNotification] = useState<Notification | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isLoadingCourses, setIsLoadingCourses] = useState(true);

    useEffect(() => {
        getCurrentUser().then((res) => {
            if (res?.data) {
                setUser(res.data);
            } else {
                setIsLoadingCourses(false);
            }
        });
    }, []);

    useEffect(() => {
        if (!user || courses.length === 0 || isLoaded) return;

        const semesterId = `${user.sys_namhocht}_${user.sys_hockyht}`;
        const stored = localStorage.getItem(`dkhp_planned_${semesterId}`);
        if (stored) {
            try {
                const savedGroups = JSON.parse(stored);
                const initialPlanned: { course: Course; group: LopHocPhan }[] = [];

                Object.entries(savedGroups).forEach(([courseCode, group]) => {
                    const course = courses.find(
                        (c) => c.dkmh_tu_dien_hoc_phan_ma === courseCode
                    );
                    if (course) {
                        initialPlanned.push({ course, group: group as LopHocPhan });
                    }
                });

                setPlannedCourses(initialPlanned);
            } catch (e) {
                console.error("Error loading planned courses from localStorage", e);
            }
        }
        setIsLoaded(true);
    }, [courses, user, isLoaded]);

    useEffect(() => {
        if (!user || !isLoaded) return;

        const semesterId = `${user.sys_namhocht}_${user.sys_hockyht}`;
        const savedGroups: Record<string, LopHocPhan> = {};
        plannedCourses.forEach((p) => {
            savedGroups[p.course.dkmh_tu_dien_hoc_phan_ma] = p.group;
        });
        localStorage.setItem(`dkhp_planned_${semesterId}`, JSON.stringify(savedGroups));
    }, [plannedCourses, user, isLoaded]);

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

    const refetchCourses = useCallback(async () => {
        setIsLoadingCourses(true);
        try {
            const res = await getCourses();
            if (res?.data) {
                setCourses(res.data);
            } else if (res?.serverError) {
                notify(res.serverError, "error");
            } else if (res?.validationErrors) {
                const messages = Object.values(res.validationErrors)
                    .flatMap((err: any) =>
                        Array.isArray(err) ? err : err?._errors ?? []
                    )
                    .join(", ");
                notify(messages || "Validation error!", "error");
            } else {
                notify("Không thể tải danh sách học phần", "error");
            }
        } catch (e: any) {
            console.error("Error fetching courses:", e);
            notify(e.message || "Đã có lỗi xảy ra khi tải danh sách học phần", "error");
        } finally {
            setIsLoadingCourses(false);
        }
    }, [notify]);

    useEffect(() => {
        if (user) {
            refetchCourses();
        }
    }, [user, refetchCourses]);

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
                isLoadingCourses,
                refetchCourses,
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

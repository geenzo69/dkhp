"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import { useAction } from "next-safe-action/hooks";
import Toast, { Notification } from "@/components/Toast";
import Course from "@/types/Course";
import LopHocPhan from "@/types/LopHocPhan";
import User from "@/types/User";
import getCurrentUser from "@/app/actions/getUser";
import getCourses from "@/app/actions/getCourses";
import { usePathname } from "next/navigation";

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
    refetchCourses: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
    const pathname = usePathname();
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

    useEffect(() => {
        if (courses.length === 0 || plannedCourses.length === 0) return;

        setPlannedCourses((currentPlannedCourses) => {
            let hasUpdatedCourseData = false;

            const nextPlannedCourses = currentPlannedCourses.map((plannedCourse) => {
                const latestCourse = courses.find(
                    (course) =>
                        course.dkmh_tu_dien_hoc_phan_ma ===
                        plannedCourse.course.dkmh_tu_dien_hoc_phan_ma,
                );

                if (!latestCourse) {
                    return plannedCourse;
                }

                const latestGroup = latestCourse.data_nhom_hp.find(
                    (group) =>
                        group.dkmh_nhom_hoc_phan_ma ===
                        plannedCourse.group.dkmh_nhom_hoc_phan_ma ||
                        group.key === plannedCourse.group.key,
                );

                if (!latestGroup) {
                    return plannedCourse;
                }

                if (
                    latestCourse !== plannedCourse.course ||
                    latestGroup !== plannedCourse.group
                ) {
                    hasUpdatedCourseData = true;
                    return {
                        course: latestCourse,
                        group: latestGroup,
                    };
                }

                return plannedCourse;
            });

            return hasUpdatedCourseData ? nextPlannedCourses : currentPlannedCourses;
        });
    }, [courses, plannedCourses.length]);

    const addLog = (message: string, type: "info" | "success" | "warning" | "error" = "info") => {
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
    };

    const clearLogs = () => {
        setLogs([]);
    };

    const notify = (text: string, type: "info" | "success" | "warning" | "error" = "info", duration = 3000) => {
        setNotification({ text, type });
        setTimeout(() => {
            setNotification((prev) => (prev?.text === text ? null : prev));
        }, duration);
    };

    const { execute: executeGetCurrentUser } = useAction(getCurrentUser, {
        onError: ({ error }) => {
            notify(getActionErrorMessage(error), "error");
            setIsLoadingCourses(false);
        },
        onSuccess: ({ data }) => {
            if (data) {
                setUser(data);
            } else {
                setIsLoadingCourses(false);
            }
        },
    });

    const { execute: executeGetCourses } = useAction(getCourses, {
        onError: ({ error }) => {
            notify(getActionErrorMessage(error), "error");
            setIsLoadingCourses(false);
        },
        onSuccess: ({ data }) => {
            if (data) {
                setCourses(data);
            } else {
                notify("Không thể tải danh sách học phần", "error");
            }

            setIsLoadingCourses(false);
        },
    });

    const refetchCourses = () => {
        setIsLoadingCourses(true);
        executeGetCourses();
    };

    useEffect(() => {
        setIsLoadingCourses(true);
        executeGetCurrentUser();
    }, [pathname]);

    useEffect(() => {
        if (user) {
            refetchCourses();
        }
    }, [user]);

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

function getActionErrorMessage(error: any) {
    if (error.serverError) {
        return error.serverError;
    }

    if (error.validationErrors) {
        const messages = Object.values(error.validationErrors)
            .flatMap((err: any) =>
                Array.isArray(err) ? err : err?._errors ?? []
            )
            .join(", ");

        return messages || "Validation error!";
    }

    return "Đã có lỗi xảy ra";
}

"use client";

import { useEffect, useMemo, useState } from "react";
import jwt from "jsonwebtoken";
import { useCookies } from "next-client-cookies";
import { getUserInfo } from "@/util/authentication";
import {
    getCourses,
    HocPhan,
    LopHocPhan,
    registerCourses,
} from "@/util/course";
import { useApp } from "@/providers/AppContext";
import Header from "./Header";
import CourseList from "./CourseList";
import ResultSummary from "./ResultSummary";
import SystemLogs from "./SystemLogs";
import RegistrationModal from "./RegistrationModal";
import { BookOpen } from "lucide-react";
import User from "@/types/User";

interface DashboardProps {
    initialUser: User | null;
    initialCourses: HocPhan[] | null;
}

export default function Dashboard({
    initialUser,
    initialCourses,
}: DashboardProps) {
    const [user, setUser] = useState<User | null>(initialUser);
    const [isUserLoading, setIsUserLoading] = useState(!initialUser);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [showScheduleUI, setShowScheduleUI] = useState(false);
    const [scheduleTime, setScheduleTime] = useState("");
    const [courses, setCourses] = useState<HocPhan[] | null>(initialCourses);
    const [selectedCourseForModal, setSelectedCourseForModal] =
        useState<HocPhan | null>(null);

    const {
        addLog,
        notify,
        plannedCourses: registeredHP,
        setPlannedCourses: setRegisteredHP,
    } = useApp();
    const cookies = useCookies();

    useEffect(() => {
        (async () => {
            const authToken = cookies.get("auth_token");

            if (!authToken) {
                setIsUserLoading(false);
                setUser(null);
                setCourses(null);
                return;
            }

            // If we already have user and courses from SSR, just mark as loaded
            if (user && courses) {
                setIsUserLoading(false);
                return;
            }

            // Fallback for client-side navigation or if SSR failed
            setIsLoading(true);
            setIsUserLoading(true);
            try {
                const decoded = jwt.decode(authToken) as jwt.JwtPayload;
                const userInfo = await getUserInfo(decoded.user_info);
                if (!userInfo) {
                    notify("Không thể lấy thông tin người dùng!", "error");
                    setIsLoading(false);
                    return;
                }
                setUser(userInfo);

                const hp = await getCourses(
                    userInfo.sys_manguoidung,
                );
                if (!hp) {
                    notify(
                        "Đã có lỗi xảy ra khi cố lấy danh sách học phần!",
                        "error",
                    );
                } else {
                    setCourses(hp);
                }
            } catch (e) {
                console.error("Client fetch error:", e);
            } finally {
                setIsLoading(false);
                setIsUserLoading(false);
            }
        })();
    }, [cookies]); // Re-run if cookies change (e.g. after login)

    useEffect(() => {
        if (!user) return;

        const interval = setInterval(async () => {
            const authToken = cookies.get("auth_token");
            if (authToken) {
                const hp = await getCourses(user.sys_manguoidung);
                if (hp) {
                    setCourses(hp);
                }
            }
        }, 10000); // 10 seconds polling

        return () => clearInterval(interval);
    }, [user, cookies]);

    const handleOpenRegistrationModal = (course: HocPhan) => {
        if (
            registeredHP.some(
                (r) =>
                    r.course.dkmh_tu_dien_hoc_phan_ma ===
                    course.dkmh_tu_dien_hoc_phan_ma,
            )
        ) {
            notify("Bạn đã đăng ký học phần này rồi!", "warning");
            return;
        }
        setSelectedCourseForModal(course);
    };

    const handleConfirmRegistration = (group: LopHocPhan) => {
        if (!selectedCourseForModal) return;

        const conflict = registeredHP.find(
            (r) =>
                r.group.dkmh_tu_dien_lop_hoc_phan_tkb ===
                group.dkmh_tu_dien_lop_hoc_phan_tkb,
        );
        if (conflict) {
            addLog(
                `Trùng lịch: ${selectedCourseForModal.dkmh_tu_dien_hoc_phan_ten_vn} vs ${conflict.course.dkmh_tu_dien_hoc_phan_ten_vn}`,
                "error",
            );
            notify(
                `Lịch học đã bị trùng với môn ${conflict.course.dkmh_tu_dien_hoc_phan_ten_vn}!`,
                "error",
            );
            return;
        }

        setRegisteredHP([
            ...registeredHP,
            { course: selectedCourseForModal, group },
        ]);
        addLog(
            `Đã đăng ký: ${selectedCourseForModal.dkmh_tu_dien_hoc_phan_ten_vn} (Nhóm ${group.dkmh_nhom_hoc_phan_ma})`,
            "info",
        );
        notify(
            `Đã chọn học phần ${selectedCourseForModal.dkmh_tu_dien_hoc_phan_ten_vn} thành công!`,
            "success",
        );
        setSelectedCourseForModal(null);
    };

    const handleRemoveCourse = (courseMa: string) => {
        const removed = registeredHP.find(
            (r) => r.course.dkmh_tu_dien_hoc_phan_ma === courseMa,
        );
        setRegisteredHP(
            registeredHP.filter(
                (r) => r.course.dkmh_tu_dien_hoc_phan_ma !== courseMa,
            ),
        );
        addLog(
            `Đã gỡ: ${removed?.course.dkmh_tu_dien_hoc_phan_ten_vn}`,
            "warning",
        );
    };

    const handleConfirmAll = async () => {
        if (!user || registeredHP.length === 0) return;

        setIsLoading(true);
        addLog("Hệ thống: Đang gửi yêu cầu đăng ký học phần...", "info");

        const data = registeredHP.map((r) => ({
            dkmh_tu_dien_hoc_phan_ma: r.course.dkmh_tu_dien_hoc_phan_ma,
            dkmh_nhom_hoc_phan_ma: r.group.dkmh_nhom_hoc_phan_ma,
        }));

        const result = await registerCourses(user.sys_manguoidung, data);

        if (result.success) {
            addLog(`Hệ thống: ${result.msg}`, "success");
            notify(result.msg, "success");
            setRegisteredHP([]);
            const authToken = cookies.get("auth_token");
            if (authToken) {
                const hp = await getCourses(user.sys_manguoidung);
                if (hp) setCourses(hp);
            }
        } else {
            addLog(`Lỗi: ${result.msg}`, "error");
            notify(result.msg, "error");
        }
        setIsLoading(false);
    };

    const totalCredits = useMemo(() => {
        const currentCredits = registeredHP.reduce(
            (sum, r) => sum + r.course.dkmh_tu_dien_hoc_phan_so_tin_chi,
            0,
        );
        const apiCredits =
            courses
                ?.filter((c) => c.trang_thai_dang_ky === 1)
                .reduce(
                    (sum, c) => sum + c.dkmh_tu_dien_hoc_phan_so_tin_chi,
                    0,
                ) || 0;
        return currentCredits + apiCredits;
    }, [registeredHP, courses]);

    const allRegisteredCount = useMemo(() => {
        const apiCount =
            courses?.filter((c) => c.trang_thai_dang_ky === 1).length || 0;
        return registeredHP.length + apiCount;
    }, [registeredHP, courses]);

    return (
        <div className="min-h-screen bg-[#f1f4f6] text-slate-700 font-sans flex flex-col">
            <Header
                user={user}
                isUserLoading={isUserLoading}
                onLoginClick={() => {
                    window.location.href = "/login";
                }}
            />

            <div className="flex flex-1">
                <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
                    {isUserLoading ? (
                        <div className="flex flex-col items-center justify-center py-32 text-center max-w-2xl mx-auto animate-pulse">
                            <div className="w-20 h-20 bg-slate-100 rounded-2xl mb-8"></div>
                            <div className="h-8 w-64 bg-slate-100 rounded mb-4"></div>
                        </div>
                    ) : !user ? (
                        <div className="flex flex-col items-center justify-center py-32 text-center max-w-2xl mx-auto">
                            <div className="w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center text-[#3f6ad8] mb-8 rotate-3 mx-auto">
                                <BookOpen size={40} />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-800 mb-4 tracking-tight text-center">
                                Cổng Quản Lý Đào Tạo
                            </h2>
                            <p className="text-slate-500 mb-8 leading-relaxed text-center">
                                Hệ thống đăng ký học phần trực tuyến dành cho
                                sinh viên. Vui lòng đăng nhập để bắt đầu lựa
                                chọn các lớp học phần cho học kỳ mới.
                            </p>
                            <button
                                onClick={() => {
                                    window.location.href = "/login";
                                }}
                                className="bg-[#3f6ad8] text-white px-10 py-4 rounded font-bold uppercase tracking-widest text-xs shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-1 transition-all mx-auto block"
                            >
                                Truy cập ngay
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-in fade-in duration-500">
                            <CourseList
                                courses={courses}
                                isLoading={isLoading}
                                searchTerm={searchTerm}
                                setSearchTerm={setSearchTerm}
                                registeredHP={registeredHP}
                                onOpenModal={handleOpenRegistrationModal}
                                onRemoveCourse={handleRemoveCourse}
                            />

                            <div className="xl:col-span-4 space-y-6">
                                <ResultSummary
                                    isLoading={isLoading}
                                    allRegisteredCount={allRegisteredCount}
                                    totalCredits={totalCredits}
                                    courses={courses}
                                    registeredHP={registeredHP}
                                    onRemoveCourse={handleRemoveCourse}
                                    showScheduleUI={showScheduleUI}
                                    setShowScheduleUI={setShowScheduleUI}
                                    handleConfirmAll={handleConfirmAll}
                                    scheduleTime={scheduleTime}
                                    setScheduleTime={setScheduleTime}
                                />

                                <SystemLogs />
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {selectedCourseForModal && (
                <RegistrationModal
                    course={selectedCourseForModal}
                    onClose={() => setSelectedCourseForModal(null)}
                    onConfirm={handleConfirmRegistration}
                />
            )}
        </div>
    );
}

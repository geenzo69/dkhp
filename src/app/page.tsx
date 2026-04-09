"use client";

import {
    LogOut,
    BookOpen,
    User as UserIcon,
    Clock,
    Search,
    Trash2,
    Calendar,
    LogIn,
    History,
    Info,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Card from "./components/Card";
import Login, { UserInfo } from "./components/Login";
import Toast, { Notification } from "./components/Toast";
import jwt from "jsonwebtoken";
import { useCookies } from "next-client-cookies";
import { getUserInfo } from "./util/authentication";
import { getCourses, HocPhan, LopHocPhan, registerCourses } from "./util/course";
import * as cron from "./util/cron";
import RegistrationModal from "./components/RegistrationModal";

interface Log {
    id: number;
    time: string;
    message: string;
    type: string;
}

const MOCK_COURSES = [
    {
        id: "IT001",
        name: "Nhập môn lập trình",
        credits: 3,
        teacher: "TS. Nguyễn Văn A",
        schedule: "Thứ 2 (Tiết 1-3)",
        room: "A1.101",
        totalSlots: 50,
        registered: 42,
    },
    {
        id: "IT002",
        name: "Cấu trúc dữ liệu & Giải thuật",
        credits: 4,
        teacher: "ThS. Trần Thị B",
        schedule: "Thứ 4 (Tiết 6-9)",
        room: "B2.205",
        totalSlots: 40,
        registered: 35,
    },
    {
        id: "MATH01",
        name: "Toán cao cấp A1",
        credits: 3,
        teacher: "PGS. Lê Văn C",
        schedule: "Thứ 3 (Tiết 1-3)",
        room: "C1.302",
        totalSlots: 100,
        registered: 98,
    },
    {
        id: "ENG01",
        name: "Tiếng Anh chuyên ngành 1",
        credits: 2,
        teacher: "Ms. Emily White",
        schedule: "Thứ 6 (Tiết 7-8)",
        room: "D1.201",
        totalSlots: 30,
        registered: 15,
    },
    {
        id: "IT003",
        name: "Cơ sở dữ liệu",
        credits: 3,
        teacher: "TS. Phạm Minh D",
        schedule: "Thứ 5 (Tiết 1-3)",
        room: "A2.202",
        totalSlots: 60,
        registered: 58,
    },
    {
        id: "SOFT01",
        name: "Kỹ năng mềm",
        credits: 2,
        teacher: "ThS. Hoàng Anh",
        schedule: "Thứ 7 (Tiết 1-2)",
        room: "Online",
        totalSlots: 200,
        registered: 145,
    },
];

export default function Home() {
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [user, setUser] = useState<UserInfo | null>();
    const [logs, setLogs] = useState<Log[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [notification, setNotification] = useState<Notification | null>(null);
    const [showScheduleUI, setShowScheduleUI] = useState(false);
    const [scheduleTime, setScheduleTime] = useState("");
    const [cronJobs, setCronJobs] = useState<any[]>([]);
    const [courses, setCourses] = useState<HocPhan[] | null>(null);
    const [selectedCourseForModal, setSelectedCourseForModal] =
        useState<HocPhan | null>(null);
    const [registeredHP, setRegisteredHP] = useState<
        { course: HocPhan; group: LopHocPhan }[]
    >([]);

    const cookies = useCookies();

    useEffect(() => {
        (async () => {
            const authToken = cookies.get("auth_token");

            if (!authToken) return;

            setIsLoading(true);
            const decoded = jwt.decode(authToken) as jwt.JwtPayload;

            const userInfo = await getUserInfo(decoded.user_info);
            setUser(userInfo);

            const hp = await getCourses();

            if (!hp) {
                showNotify(
                    "Đã có lỗi xảy ra khi cố lấy danh sách học phần!",
                    "error",
                );
                setIsLoading(false);
                return;
            }

            setCourses(hp);

            // Fetch scheduled jobs
            const jobs = await cron.getAllJobs();
            if (userInfo) {
                setCronJobs(jobs.filter((j: any) => j.title.includes(userInfo.sys_hoten)));
            }
            
            setIsLoading(false);
        })();
    }, []);

    const addLog = (message: string, type = "info") => {
        const newLog = {
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

    const showNotify = (text: string, type = "info") => {
        setNotification({ text, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleOpenRegistrationModal = (course: HocPhan) => {
        if (
            registeredHP.some(
                (r) =>
                    r.course.dkmh_tu_dien_hoc_phan_ma ===
                    course.dkmh_tu_dien_hoc_phan_ma,
            )
        ) {
            showNotify("Bạn đã đăng ký học phần này rồi!", "warning");
            return;
        }
        setSelectedCourseForModal(course);
    };

    const handleConfirmRegistration = (group: LopHocPhan) => {
        if (!selectedCourseForModal) return;

        // Check for schedule conflicts
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
            showNotify(
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
        showNotify(
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
        if (registeredHP.length === 0) return;

        setIsLoading(true);
        addLog("Hệ thống: Đang gửi yêu cầu đăng ký học phần...", "info");

        const data = registeredHP.map((r) => ({
            dkmh_tu_dien_hoc_phan_ma: r.course.dkmh_tu_dien_hoc_phan_ma,
            dkmh_nhom_hoc_phan_ma: r.group.dkmh_nhom_hoc_phan_ma,
        }));

        const result = await registerCourses(data);

        if (result.success) {
            addLog(`Hệ thống: ${result.msg}`, "success");
            showNotify(result.msg, "success");
            setRegisteredHP([]); // Clear current session selection
            
            // Refresh courses list to show updated registration status
            const hp = await getCourses();
            if (hp) setCourses(hp);
        } else {
            addLog(`Lỗi: ${result.msg}`, "error");
            showNotify(result.msg, "error");
        }

        setIsLoading(false);
    };

    const handleScheduleRegistration = async () => {
        if (registeredHP.length === 0 || !scheduleTime) return;
        
        const authToken = cookies.get("auth_token");
        if (!authToken || !user) return;

        const decoded = jwt.decode(authToken) as jwt.JwtPayload;
        const expiryTime = (decoded.exp || 0) * 1000;
        const selectedTime = new Date(scheduleTime).getTime();

        if (selectedTime <= Date.now()) {
            showNotify("Thời gian lên lịch phải ở tương lai!", "error");
            return;
        }

        if (selectedTime >= expiryTime) {
            const expiryDate = new Date(expiryTime).toLocaleString();
            showNotify(`Token sẽ hết hạn vào ${expiryDate}. Vui lòng lên lịch trước thời gian này!`, "error");
            return;
        }

        setIsLoading(true);
        addLog(`Hệ thống: Đang lên lịch đăng ký cho ${user.sys_hoten}...`, "info");

        const data = registeredHP.map((r) => ({
            dkmh_tu_dien_hoc_phan_ma: r.course.dkmh_tu_dien_hoc_phan_ma,
            dkmh_nhom_hoc_phan_ma: r.group.dkmh_nhom_hoc_phan_ma,
        }));

        const result = await cron.create(authToken, user.sys_hoten, data, new Date(scheduleTime), window.location.origin);

        if (result.success) {
            addLog(`Hệ thống: ${result.msg}`, "success");
            showNotify(result.msg, "success");
            setShowScheduleUI(false);
            setRegisteredHP([]);
            
            // Refresh jobs
            const jobs = await cron.getAllJobs();
            setCronJobs(jobs.filter((j: any) => j.title.includes(user.sys_hoten)));
        } else {
            addLog(`Lỗi: ${result.msg}`, "error");
            showNotify(result.msg, "error");
        }

        setIsLoading(false);
    };

    const filteredCourses = courses
        ? courses.filter(
              (c) =>
                  c.dkmh_tu_dien_hoc_phan_ten_vn
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                  c.dkmh_tu_dien_hoc_phan_ma
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()),
          )
        : [];

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
            {/* ArchitectUI Header */}
            <header className="bg-white h-16 shadow-sm flex items-center justify-between px-6 z-30 sticky top-0 border-b">
                <div className="flex items-center gap-10">
                    <div className="flex items-center gap-2">
                        <span className="font-black text-xl tracking-tighter text-slate-800">
                            CTU<span className="text-[#3f6ad8]">DKHP</span>
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-bold leading-none">
                                    {user.sys_hoten}
                                </p>
                                <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">
                                    {user.sys_manguoidung}
                                </p>
                            </div>
                            <div className="relative group">
                                <button className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-[#3f6ad8] border-2 border-transparent group-hover:border-[#3f6ad8] transition-all">
                                    <UserIcon size={20} />
                                </button>
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded shadow-xl border hidden group-hover:block overflow-hidden">
                                    <button className="w-full px-4 py-3 text-left text-sm hover:bg-slate-50 flex items-center gap-2 text-red-500 font-medium">
                                        <LogOut size={16} /> Thoát hệ thống
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowLoginModal(true)}
                            className="bg-[#3f6ad8] hover:bg-[#3458b6] text-white px-5 py-2 rounded text-xs font-bold uppercase tracking-widest transition-all shadow-md active:scale-95"
                        >
                            Đăng nhập
                        </button>
                    )}
                </div>
            </header>

            <div className="flex flex-1">
                <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
                    {!user ? (
                        <div className="flex flex-col items-center justify-center py-32 text-center max-w-2xl mx-auto">
                            <div className="w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center text-[#3f6ad8] mb-8 rotate-3">
                                <BookOpen size={40} />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-800 mb-4 tracking-tight">
                                Cổng Quản Lý Đào Tạo
                            </h2>
                            <p className="text-slate-500 mb-8 leading-relaxed">
                                Hệ thống đăng ký học phần trực tuyến dành cho
                                sinh viên. Vui lòng đăng nhập để bắt đầu lựa
                                chọn các lớp học phần cho học kỳ mới.
                            </p>
                            <button
                                onClick={() => setShowLoginModal(true)}
                                className="bg-[#3f6ad8] text-white px-10 py-4 rounded font-bold uppercase tracking-widest text-xs shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-1 transition-all"
                            >
                                Truy cập ngay
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-in fade-in duration-500">
                            {/* Left Side: Registration Table */}
                            <div className="xl:col-span-8">
                                <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                                            Đăng ký học phần
                                        </h2>
                                    </div>
                                    <div className="relative">
                                        <Search
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                            size={16}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Tìm kiếm môn học..."
                                            className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded shadow-sm text-sm w-full md:w-64 focus:ring-2 focus:ring-[#3f6ad8] focus:border-transparent outline-none transition-all"
                                            value={searchTerm}
                                            onChange={(e) =>
                                                setSearchTerm(e.target.value)
                                            }
                                        />
                                    </div>
                                </div>

                                <Card
                                    title="Danh sách học phần mở"
                                    icon={Calendar}
                                >
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-slate-50 border-b">
                                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                        Học phần
                                                    </th>
                                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                        Chi tiết lịch
                                                    </th>
                                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                        Sĩ số
                                                    </th>
                                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">
                                                        Lựa chọn
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y relative">
                                                {isLoading ? (
                                                    Array.from({ length: 5 }).map((_, i) => (
                                                        <tr key={i} className="animate-pulse">
                                                            <td className="px-6 py-5">
                                                                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                                                                <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                                                            </td>
                                                            <td className="px-6 py-5">
                                                                <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
                                                                <div className="h-3 bg-slate-100 rounded w-1/3"></div>
                                                            </td>
                                                            <td className="px-6 py-5">
                                                                <div className="h-1.5 bg-slate-100 rounded-full w-24"></div>
                                                            </td>
                                                            <td className="px-6 py-5 text-right">
                                                                <div className="h-8 bg-slate-100 rounded w-20 ml-auto"></div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : filteredCourses.map(
                                                    (course) => {
                                                        const registration =
                                                            registeredHP.find(
                                                                (r) =>
                                                                    r.course
                                                                        .dkmh_tu_dien_hoc_phan_ma ===
                                                                    course.dkmh_tu_dien_hoc_phan_ma,
                                                            );
                                                        const isFromAPI =
                                                            course.trang_thai_dang_ky ===
                                                            1;
                                                        const active =
                                                            !!registration ||
                                                            isFromAPI;

                                                        // Summary info
                                                        const teacherName =
                                                            course.dkmh_tu_dien_giang_vien_ten_vn ||
                                                            "Đang cập nhật";

                                                        // Get the schedule to display
                                                        let displayTkb = "";
                                                        let displayGroup = "";
                                                        if (registration) {
                                                            displayTkb =
                                                                registration
                                                                    .group
                                                                    .dkmh_tu_dien_lop_hoc_phan_tkb;
                                                            displayGroup = `Nhóm ${registration.group.dkmh_nhom_hoc_phan_ma}`;
                                                        } else if (isFromAPI) {
                                                            displayTkb =
                                                                course.dkmh_tu_dien_lop_hoc_phan_tkb ||
                                                                "Đã đăng ký";
                                                            displayGroup = `Nhóm ${course.dkmh_nhom_hoc_phan_ma || "?"}`;
                                                        }

                                                        return (
                                                            <tr
                                                                key={course.key}
                                                                className={`hover:bg-slate-50/80 transition-colors ${active ? "bg-blue-50/30" : ""}`}
                                                            >
                                                                <td className="px-6 py-5">
                                                                    <div className="font-bold text-slate-700 text-sm leading-tight mb-1">
                                                                        {
                                                                            course.dkmh_tu_dien_hoc_phan_ten_vn
                                                                        }
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-[10px] font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 border">
                                                                            {
                                                                                course.dkmh_tu_dien_hoc_phan_ma
                                                                            }
                                                                        </span>
                                                                        <span className="text-[10px] font-bold text-[#3f6ad8] uppercase tracking-tighter">
                                                                            {
                                                                                course.dkmh_tu_dien_hoc_phan_so_tin_chi
                                                                            }{" "}
                                                                            Tín
                                                                            chỉ
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-5">
                                                                    {active ? (
                                                                        <>
                                                                            <div className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                                                                                <Clock
                                                                                    size={
                                                                                        12
                                                                                    }
                                                                                />{" "}
                                                                                {
                                                                                    displayTkb
                                                                                }
                                                                            </div>
                                                                            <div className="text-[10px] text-[#3f6ad8] mt-1 uppercase tracking-tighter font-bold">
                                                                                {
                                                                                    displayGroup
                                                                                }{" "}
                                                                                •{" "}
                                                                                {(() => {
                                                                                    const groupData = registration?.group || course.data_nhom_hp.find(g => g.dkmh_nhom_hoc_phan_ma === course.dkmh_nhom_hoc_phan_ma);
                                                                                    return groupData?.data?.[0]?.gv?.[0]?.dkmh_tu_dien_giang_vien_ten_vn || teacherName;
                                                                                })()}
                                                                            </div>
                                                                        </>
                                                                    ) : (
                                                                        <div className="text-[10px] text-slate-300 font-bold uppercase tracking-widest italic">
                                                                            Chưa
                                                                            chọn
                                                                            nhóm
                                                                        </div>
                                                                    )}
                                                                </td>
                                                                <td className="px-6 py-5">
                                                                    {active ? (
                                                                        <div className="flex items-center gap-3 animate-in fade-in duration-300">
                                                                            <div className="flex-1 w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                                                                {(() => {
                                                                                    const group = registration?.group || course.data_nhom_hp.find(g => g.dkmh_nhom_hoc_phan_ma === course.dkmh_nhom_hoc_phan_ma) || course.data_nhom_hp[0];
                                                                                    if (!group) return null;
                                                                                    const total = group.dkmh_tu_dien_lop_hoc_phan_si_so;
                                                                                    const remaining = group.dkmh_tu_dien_lop_hoc_phan_si_so_con_lai;
                                                                                    const percent = Math.min(100, Math.max(0, ((total - remaining) / total) * 100));
                                                                                    return (
                                                                                        <div
                                                                                            className={`h-full ${percent >= 90 ? "bg-red-500" : "bg-emerald-500"}`}
                                                                                            style={{ width: `${percent}%` }}
                                                                                        ></div>
                                                                                    );
                                                                                })()}
                                                                            </div>
                                                                            <span className="text-[10px] font-bold text-slate-500">
                                                                                {(() => {
                                                                                    const group = registration?.group || course.data_nhom_hp.find(g => g.dkmh_nhom_hoc_phan_ma === course.dkmh_nhom_hoc_phan_ma) || course.data_nhom_hp[0];
                                                                                    if (!group) return "0/0";
                                                                                    return `${group.dkmh_tu_dien_lop_hoc_phan_si_so - group.dkmh_tu_dien_lop_hoc_phan_si_so_con_lai}/${group.dkmh_tu_dien_lop_hoc_phan_si_so}`;
                                                                                })()}
                                                                            </span>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                                                                            {course.data_nhom_hp.length} nhóm mở
                                                                        </div>
                                                                    )}
                                                                </td>
                                                                <td className="px-6 py-5 text-right">
                                                                    <button
                                                                        disabled={
                                                                            active
                                                                        }
                                                                        onClick={() =>
                                                                            handleOpenRegistrationModal(
                                                                                course,
                                                                            )
                                                                        }
                                                                        className={`px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest transition-all ${
                                                                            isFromAPI
                                                                                ? "bg-slate-200 text-slate-500 cursor-not-allowed shadow-none"
                                                                                : registration
                                                                                  ? "bg-emerald-500 text-white shadow-emerald-100 shadow-lg"
                                                                                  : "border-2 border-[#3f6ad8] text-[#3f6ad8] hover:bg-[#3f6ad8] hover:text-white shadow-sm"
                                                                        }`}
                                                                    >
                                                                        {isFromAPI
                                                                            ? "Đã đăng ký"
                                                                            : registration
                                                                              ? "Đã chọn"
                                                                              : "Đăng ký"}
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    },
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>
                            </div>

                            <div className="xl:col-span-4 space-y-6">
                                <div className="bg-linear-to-br from-[#3f6ad8] to-[#2c4a96] rounded-xl p-6 text-white shadow-xl">
                                    <h3 className="text-xs font-bold uppercase tracking-widest opacity-80 mb-6">
                                        Kết quả tạm tính
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4 mb-8">
                                        <div className="bg-white/10 p-4 rounded-lg border border-white/10">
                                            {isLoading ? (
                                                <div className="h-8 w-12 bg-white/10 animate-pulse rounded mb-1"></div>
                                            ) : (
                                                <p className="text-2xl font-black">
                                                    {allRegisteredCount}
                                                </p>
                                            )}
                                            <p className="text-[10px] font-bold uppercase opacity-60">
                                                Môn học
                                            </p>
                                        </div>
                                        <div className="bg-white/10 p-4 rounded-lg border border-white/10">
                                            {isLoading ? (
                                                <div className="h-8 w-12 bg-white/10 animate-pulse rounded mb-1"></div>
                                            ) : (
                                                <p className="text-2xl font-black">
                                                    {totalCredits}
                                                </p>
                                            )}
                                            <p className="text-[10px] font-bold uppercase opacity-60">
                                                Tín chỉ
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-8 max-h-48 overflow-y-auto scrollbar-hide">
                                        {isLoading ? (
                                            Array.from({ length: 3 }).map((_, i) => (
                                                <div key={i} className="h-12 bg-white/5 animate-pulse rounded"></div>
                                            ))
                                        ) : (
                                            <>
                                                {/* API Registered Courses */}
                                                {courses
                                                    ?.filter(
                                                        (c) =>
                                                            c.trang_thai_dang_ky === 1,
                                                    )
                                                    .map((course) => (
                                                        <div
                                                            key={`api-${course.dkmh_tu_dien_hoc_phan_ma}`}
                                                            className="flex flex-col gap-1 bg-emerald-500/20 py-2 px-3 rounded text-[11px] border border-emerald-500/30"
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <span className="truncate font-bold text-emerald-100">
                                                                    {
                                                                        course.dkmh_tu_dien_hoc_phan_ten_vn
                                                                    }
                                                                </span>
                                                                <span className="text-[9px] bg-emerald-500 text-white px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">
                                                                    System
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-[10px] opacity-60 text-emerald-100">
                                                                <span className="font-bold">
                                                                    Nhóm{" "}
                                                                    {
                                                                        course.dkmh_nhom_hoc_phan_ma
                                                                    }
                                                                </span>
                                                                <span>•</span>
                                                                <span>
                                                                    {
                                                                        course.dkmh_tu_dien_hoc_phan_so_tin_chi
                                                                    }{" "}
                                                                    TC
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}

                                                {/* Current Session Registered Courses */}
                                                {registeredHP.map(
                                                    ({ course, group }) => {
                                                        return (
                                                            <div
                                                                key={
                                                                    course.dkmh_tu_dien_hoc_phan_ma
                                                                }
                                                                className="flex flex-col gap-1 bg-white/5 py-2 px-3 rounded text-[11px]"
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <span className="truncate font-bold text-white/90">
                                                                        {
                                                                            course.dkmh_tu_dien_hoc_phan_ten_vn
                                                                        }
                                                                    </span>
                                                                    <button
                                                                        onClick={() =>
                                                                            handleRemoveCourse(
                                                                                course.dkmh_tu_dien_hoc_phan_ma,
                                                                            )
                                                                        }
                                                                        className="text-white/40 hover:text-red-300 transition-colors"
                                                                    >
                                                                        <Trash2
                                                                            size={14}
                                                                        />
                                                                    </button>
                                                                </div>
                                                                <div className="flex items-center gap-2 text-[10px] opacity-60">
                                                                    <span className="bg-white/20 px-1 rounded font-bold">
                                                                        Nhóm{" "}
                                                                        {
                                                                            group.dkmh_nhom_hoc_phan_ma
                                                                        }
                                                                    </span>
                                                                    <span>•</span>
                                                                    <span>
                                                                        {
                                                                            course.dkmh_tu_dien_hoc_phan_so_tin_chi
                                                                        }{" "}
                                                                        TC
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        );
                                                    },
                                                )}
                                            </>
                                        )}
                                        {!isLoading && allRegisteredCount === 0 && (
                                            <p className="text-xs opacity-40 text-center py-4 italic">
                                                Chưa chọn môn học nào
                                            </p>
                                        )}
                                    </div>

                                    {registeredHP.length > 0 && (
                                        <div className="space-y-4">
                                            {!showScheduleUI ? (
                                                <div className="grid grid-cols-2 gap-3">
                                                    <button
                                                        onClick={handleConfirmAll}
                                                        className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-4 rounded shadow-lg shadow-emerald-900/20 transition-all uppercase text-[10px] tracking-wider active:scale-95"
                                                    >
                                                        Đăng ký ngay
                                                    </button>
                                                    <button
                                                        onClick={() => setShowScheduleUI(true)}
                                                        className="bg-amber-500 hover:bg-amber-400 text-white font-bold py-4 rounded shadow-lg shadow-amber-900/20 transition-all uppercase text-[10px] tracking-wider active:scale-95"
                                                    >
                                                        Lên lịch tự động
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="bg-white/5 p-4 rounded-lg border border-white/10 space-y-3 animate-in fade-in zoom-in-95 duration-200">
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">Chọn thời gian đăng ký</p>
                                                    <input 
                                                        type="datetime-local" 
                                                        value={scheduleTime}
                                                        onChange={(e) => setScheduleTime(e.target.value)}
                                                        className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-sm text-white focus:outline-hidden focus:border-white/40"
                                                    />
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <button
                                                            onClick={handleScheduleRegistration}
                                                            className="bg-amber-500 hover:bg-amber-400 text-white font-bold py-2.5 rounded text-[10px] uppercase tracking-wider"
                                                        >
                                                            Xác nhận lịch
                                                        </button>
                                                        <button
                                                            onClick={() => setShowScheduleUI(false)}
                                                            className="bg-white/10 hover:bg-white/20 text-white font-bold py-2.5 rounded text-[10px] uppercase tracking-wider"
                                                        >
                                                            Hủy
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Scheduled Jobs Section */}
                                {cronJobs.length > 0 && (
                                    <div className="bg-white rounded-xl p-5 shadow-sm border border-amber-100">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
                                                <Clock size={16} />
                                            </div>
                                            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-tight">Hẹn giờ đăng ký</h3>
                                        </div>
                                        <div className="space-y-3">
                                            {cronJobs.map((job: any) => (
                                                <div key={job.jobId} className="p-3 bg-amber-50/50 rounded-lg border border-amber-100 flex flex-col gap-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[11px] font-bold text-amber-700">Trạng thái: {job.enabled ? "Đang chờ" : "Tạm dừng"}</span>
                                                        <span className="text-[10px] bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded font-black uppercase">Schedule</span>
                                                    </div>
                                                    <div className="text-xs text-slate-600 font-medium">
                                                        Kích hoạt vào: {job.schedule.hours[0]}:{job.schedule.minutes[0]?.toString().padStart(2, '0')} ngày {job.schedule.mdays[0]}/{job.schedule.months[0]}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <Card
                                    title="Nhật ký hệ thống"
                                    icon={History}
                                    color="#f7b924"
                                >
                                    <div className="p-4 space-y-4 max-h-75 overflow-y-auto">
                                        {logs.length > 0 ? (
                                            logs.map((log) => (
                                                <div
                                                    key={log.id}
                                                    className="flex gap-3 text-xs leading-relaxed animate-in slide-in-from-left-2 duration-300"
                                                >
                                                    <span className="text-slate-400 font-mono shrink-0 font-bold">
                                                        [{log.time}]
                                                    </span>
                                                    <span
                                                        className={`font-semibold ${
                                                            log.type === "error"
                                                                ? "text-red-500"
                                                                : log.type ===
                                                                    "success"
                                                                  ? "text-emerald-600"
                                                                  : log.type ===
                                                                      "warning"
                                                                    ? "text-amber-500"
                                                                    : "text-[#3f6ad8]"
                                                        }`}
                                                    >
                                                        {log.message}
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-10">
                                                <Info
                                                    size={24}
                                                    className="mx-auto text-slate-200 mb-2"
                                                />
                                                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                                                    Chưa có hoạt động
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* ArchitectUI Styled Modal */}
            {showLoginModal && (
                <Login
                    setShowLoginModal={setShowLoginModal}
                    showNotify={showNotify}
                    addLog={addLog}
                    setUser={setUser}
                />
            )}

            {selectedCourseForModal && (
                <RegistrationModal
                    course={selectedCourseForModal}
                    onClose={() => setSelectedCourseForModal(null)}
                    onConfirm={handleConfirmRegistration}
                />
            )}

            {/* Global Toast */}
            {notification && <Toast notification={notification} />}
        </div>
    );
}

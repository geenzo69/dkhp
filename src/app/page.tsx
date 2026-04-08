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
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import Card from './components/Card';
import Login, { UserInfo } from './components/Login';
import Toast from './components/Toast';
import jwt from "jsonwebtoken";
import { useCookies } from 'next-client-cookies';
import { getUserInfo } from './util/authentication';

const MOCK_COURSES = [
    { id: 'IT001', name: 'Nhập môn lập trình', credits: 3, teacher: 'TS. Nguyễn Văn A', schedule: 'Thứ 2 (Tiết 1-3)', room: 'A1.101', totalSlots: 50, registered: 42 },
    { id: 'IT002', name: 'Cấu trúc dữ liệu & Giải thuật', credits: 4, teacher: 'ThS. Trần Thị B', schedule: 'Thứ 4 (Tiết 6-9)', room: 'B2.205', totalSlots: 40, registered: 35 },
    { id: 'MATH01', name: 'Toán cao cấp A1', credits: 3, teacher: 'PGS. Lê Văn C', schedule: 'Thứ 3 (Tiết 1-3)', room: 'C1.302', totalSlots: 100, registered: 98 },
    { id: 'ENG01', name: 'Tiếng Anh chuyên ngành 1', credits: 2, teacher: 'Ms. Emily White', schedule: 'Thứ 6 (Tiết 7-8)', room: 'D1.201', totalSlots: 30, registered: 15 },
    { id: 'IT003', name: 'Cơ sở dữ liệu', credits: 3, teacher: 'TS. Phạm Minh D', schedule: 'Thứ 5 (Tiết 1-3)', room: 'A2.202', totalSlots: 60, registered: 58 },
    { id: 'SOFT01', name: 'Kỹ năng mềm', credits: 2, teacher: 'ThS. Hoàng Anh', schedule: 'Thứ 7 (Tiết 1-2)', room: 'Online', totalSlots: 200, registered: 145 },
];

export default function Home() {
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [user, setUser] = useState<UserInfo | null>();
    const [registeredIds, setRegisteredIds] = useState([]);
    const [logs, setLogs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [notification, setNotification] = useState<Notification | null>(null);

    const cookies = useCookies();

    useEffect(() => {
        (async () => {
            const authToken = cookies.get("auth_token");

            if (!authToken) return;

            const decoded = jwt.decode(authToken) as jwt.JwtPayload;

            const userInfo = await getUserInfo(decoded.user_info);
            setUser(userInfo);
        })();
    }, []);

    const addLog = (message: string, type = 'info') => {
        const newLog = {
            id: Date.now(),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            message,
            type
        };
        setLogs(prev => [newLog, ...prev]);
    };

    const showNotify = (text: string, type = "info") => {
        setNotification({ text, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleSelectCourse = (course) => {
        if (registeredIds.includes(course.id)) return;
        const conflict = MOCK_COURSES.filter(c => registeredIds.includes(c.id)).find(c => c.schedule === course.schedule);
        if (conflict) {
            addLog(`Trùng lịch: ${course.name} vs ${conflict.name}`, 'error');
            showNotify(`Lịch học ${course.schedule} đã bị trùng!`, "error");
            return;
        }
        setRegisteredIds([...registeredIds, course.id]);
        addLog(`Đã chọn: ${course.name}`, 'info');
    };

    const handleRemoveCourse = (id) => {
        const course = MOCK_COURSES.find(c => c.id === id);
        setRegisteredIds(registeredIds.filter(courseId => courseId !== id));
        addLog(`Đã gỡ: ${course?.name}`, 'warning');
    };

    const handleConfirm = () => {
        addLog(`Hệ thống: Ghi nhận đăng ký ${registeredIds.length} môn học`, 'success');
        showNotify("Đã xác nhận đăng ký thành công!", "success");
    };

    const filteredCourses = MOCK_COURSES.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalCredits = useMemo(() =>
        MOCK_COURSES.filter(c => registeredIds.includes(c.id)).reduce((sum, c) => sum + c.credits, 0)
        , [registeredIds]);

    return (
        <div className="min-h-screen bg-[#f1f4f6] text-slate-700 font-sans flex flex-col">
            {/* ArchitectUI Header */}
            <header className="bg-white h-16 shadow-sm flex items-center justify-between px-6 z-30 sticky top-0 border-b">
                <div className="flex items-center gap-10">
                    <div className="flex items-center gap-2">
                        <span className="font-black text-xl tracking-tighter text-slate-800">CTU<span className="text-[#3f6ad8]">DKHP</span></span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-bold leading-none">{user.sys_hoten}</p>
                                <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">{user.sys_manguoidung}</p>
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
                        <button onClick={() => setShowLoginModal(true)} className="bg-[#3f6ad8] hover:bg-[#3458b6] text-white px-5 py-2 rounded text-xs font-bold uppercase tracking-widest transition-all shadow-md active:scale-95">
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
                            <h2 className="text-3xl font-bold text-slate-800 mb-4 tracking-tight">Cổng Quản Lý Đào Tạo</h2>
                            <p className="text-slate-500 mb-8 leading-relaxed">Hệ thống đăng ký học phần trực tuyến dành cho sinh viên. Vui lòng đăng nhập để bắt đầu lựa chọn các lớp học phần cho học kỳ mới.</p>
                            <button onClick={() => setShowLoginModal(true)} className="bg-[#3f6ad8] text-white px-10 py-4 rounded font-bold uppercase tracking-widest text-xs shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-1 transition-all">
                                Truy cập ngay
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-in fade-in duration-500">

                            {/* Left Side: Registration Table */}
                            <div className="xl:col-span-8">
                                <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Đăng ký học phần</h2>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Học kỳ 1 / 2024-2025</p>
                                    </div>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input
                                            type="text"
                                            placeholder="Tìm kiếm môn học..."
                                            className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded shadow-sm text-sm w-full md:w-64 focus:ring-2 focus:ring-[#3f6ad8] focus:border-transparent outline-none transition-all"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <Card title="Danh sách học phần mở" icon={Calendar}>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-slate-50 border-b">
                                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Học phần</th>
                                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Chi tiết lịch</th>
                                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sĩ số</th>
                                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Lựa chọn</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {filteredCourses.map(course => {
                                                    const active = registeredIds.includes(course.id);
                                                    const full = course.registered >= course.totalSlots;
                                                    return (
                                                        <tr key={course.id} className={`hover:bg-slate-50/80 transition-colors ${active ? 'bg-blue-50/30' : ''}`}>
                                                            <td className="px-6 py-5">
                                                                <div className="font-bold text-slate-700 text-sm leading-tight mb-1">{course.name}</div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[10px] font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 border">{course.id}</span>
                                                                    <span className="text-[10px] font-bold text-[#3f6ad8] uppercase tracking-tighter">{course.credits} Tín chỉ</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-5">
                                                                <div className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                                                                    <Clock size={12} /> {course.schedule}
                                                                </div>
                                                                <div className="text-[10px] text-slate-400 mt-1 italic uppercase tracking-tighter font-bold">Giảng viên: {course.teacher}</div>
                                                            </td>
                                                            <td className="px-6 py-5">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="flex-1 w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                                                        <div className={`h-full ${full ? 'bg-red-500' : 'bg-[#3f6ad8]'}`} style={{ width: `${(course.registered / course.totalSlots) * 100}%` }}></div>
                                                                    </div>
                                                                    <span className="text-[10px] font-bold text-slate-500">{course.registered}/{course.totalSlots}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-5 text-right">
                                                                <button
                                                                    disabled={active || full}
                                                                    onClick={() => handleSelectCourse(course)}
                                                                    className={`px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-emerald-500 text-white shadow-emerald-100 shadow-lg' :
                                                                        full ? 'bg-slate-100 text-slate-400 cursor-not-allowed border' :
                                                                            'border-2 border-[#3f6ad8] text-[#3f6ad8] hover:bg-[#3f6ad8] hover:text-white shadow-sm'
                                                                        }`}
                                                                >
                                                                    {active ? 'Đã chọn' : full ? 'Đã đầy' : 'Đăng ký'}
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>
                            </div>

                            <div className="xl:col-span-4 space-y-6">
                                <div className="bg-linear-to-br from-[#3f6ad8] to-[#2c4a96] rounded-xl p-6 text-white shadow-xl">
                                    <h3 className="text-xs font-bold uppercase tracking-widest opacity-80 mb-6">Kết quả tạm tính</h3>
                                    <div className="grid grid-cols-2 gap-4 mb-8">
                                        <div className="bg-white/10 p-4 rounded-lg border border-white/10">
                                            <p className="text-2xl font-black">{registeredIds.length}</p>
                                            <p className="text-[10px] font-bold uppercase opacity-60">Môn học</p>
                                        </div>
                                        <div className="bg-white/10 p-4 rounded-lg border border-white/10">
                                            <p className="text-2xl font-black">{totalCredits}</p>
                                            <p className="text-[10px] font-bold uppercase opacity-60">Tín chỉ</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-8 max-h-48 overflow-y-auto scrollbar-hide">
                                        {registeredIds.map(id => {
                                            const c = MOCK_COURSES.find(course => course.id === id);
                                            return (
                                                <div key={id} className="flex items-center justify-between text-xs bg-white/5 py-2 px-3 rounded">
                                                    <span className="truncate font-medium">{c.name}</span>
                                                    <button onClick={() => handleRemoveCourse(id)} className="text-white/40 hover:text-red-300 transition-colors">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                        {registeredIds.length === 0 && <p className="text-xs opacity-40 text-center py-4 italic">Chưa chọn môn học nào</p>}
                                    </div>

                                    {registeredIds.length > 0 && (
                                        <button onClick={handleConfirm} className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-4 rounded shadow-lg shadow-emerald-900/20 transition-all uppercase text-[11px] tracking-[0.2em] active:scale-95">
                                            Xác nhận đăng ký học
                                        </button>
                                    )}
                                </div>

                                <Card title="Nhật ký hệ thống" icon={History} color="#f7b924">
                                    <div className="p-4 space-y-4 max-h-75 overflow-y-auto">
                                        {logs.length > 0 ? logs.map(log => (
                                            <div key={log.id} className="flex gap-3 text-xs leading-relaxed animate-in slide-in-from-left-2 duration-300">
                                                <span className="text-slate-400 font-mono shrink-0 font-bold">[{log.time}]</span>
                                                <span className={`font-semibold ${log.type === 'error' ? 'text-red-500' :
                                                    log.type === 'success' ? 'text-emerald-600' :
                                                        log.type === 'warning' ? 'text-amber-500' : 'text-[#3f6ad8]'
                                                    }`}>
                                                    {log.message}
                                                </span>
                                            </div>
                                        )) : (
                                            <div className="text-center py-10">
                                                <Info size={24} className="mx-auto text-slate-200 mb-2" />
                                                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Chưa có hoạt động</p>
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
                <Login setShowLoginModal={setShowLoginModal} showNotify={showNotify} addLog={addLog} setUser={setUser} />
            )}

            {/* Global Toast */}
            {notification && (
                <Toast notification={notification} />
            )}
        </div>
    );
}

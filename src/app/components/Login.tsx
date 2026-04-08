import { User } from "lucide-react";
import { getUserInfo, login } from "../util/authentication";
import { useState } from "react";
import jwt from "jsonwebtoken";
import { useCookies } from "next-client-cookies";

export interface UserInfo {
    sys_manguoidung: string;
    sys_hoten: string;
    sys_malop: string;
    sys_hiendien: string | null;
    sys_mahedt: string;
    sys_khoahoc: number;
    sys_namhocvao: number;
    sys_manganh: string;
    sys_tennganh: string;
    sys_madonvi: string;
    sys_tendonvi: string;
    sys_namhocht: number;
    sys_hockyht: number;
    sys_sotuanhk: number;
    sys_hoatdongdaotao: string;
    sys_sohockydaotao: number;
    sys_tcmaxhockychinh: number;
    sys_tcmaxhockyhe: number;
    sys_tcmaxhockychinh_hockycuoi: number;
    sys_tcmaxhockyhe_hockycuoi: number;
    sys_sotinchidat: number;
    sys_ngaysinh: string;
    sys_gioitinh: string;
    sys_email: string;
    sys_makhoi: string;
    permission_level: number;
}

export default function Login({
    setShowLoginModal,
    addLog,
    showNotify,
    setUser
}: {
    setShowLoginModal: any,
    addLog: any,
    showNotify: any,
    setUser: any
}) {
    const [mssv, setMSSV] = useState("");
    const [password, setPassword] = useState("");

    const cookies = useCookies();

    const handleLogin = async () => {
        const token = await login({
            mssv, password
        });

        if (!token) {
            return showNotify("Sai mã số hoặc mật khẩu", "error");
        }

        const decoded = jwt.decode(token) as jwt.JwtPayload;

        cookies.set("auth_token", token, {
            expires: decoded.exp
        });

        const userInfo = await getUserInfo(decoded.user_info);
        setUser(userInfo);

        setShowLoginModal(false);
        addLog(`Đăng nhập thành công!`, 'success');
        showNotify("Chào mừng bạn trở lại!", "success");
    }

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-[#343a40]/60 backdrop-blur-[2px]" onClick={() => setShowLoginModal(false)}></div>
            <div className="relative bg-white w-full max-w-sm rounded shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border-t-8 border-[#3f6ad8]">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <div className="w-12 h-12 bg-blue-50 text-[#3f6ad8] rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-blue-100">
                            <User size={24} />
                        </div>
                        <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest">Đăng nhập</h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-1 italic">Hệ thống thông tin sinh viên</p>
                    </div>

                    <form className="space-y-5">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Mã số sinh viên</label>
                            <input
                                type="text" required autoFocus
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-[#3f6ad8] focus:border-transparent outline-none transition-all font-bold"
                                placeholder="Nhập MSSV..."
                                onChange={(e) => setMSSV(e.target.value.toUpperCase())}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Mật khẩu</label>
                            <input
                                type="password" required
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-[#3f6ad8] focus:border-transparent outline-none transition-all font-bold"
                                placeholder="••••••••"
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <button onClick={handleLogin} type="button" className="w-full bg-[#3f6ad8] hover:bg-[#3458b6] text-white font-black py-4 rounded transition-all shadow-lg shadow-blue-200 uppercase text-xs tracking-[0.2em] mt-4">
                            Đăng nhập
                        </button>
                    </form>
                </div>
                <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
                    <button onClick={() => setShowLoginModal(false)} className="text-[10px] font-black text-slate-400 hover:text-red-500 uppercase tracking-widest">Đóng</button>
                </div>
            </div>
        </div>
    );
}
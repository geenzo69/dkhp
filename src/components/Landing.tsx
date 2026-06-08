"use client";

export default function Landing() {
    return (
        <div className="flex flex-col items-center justify-center py-32 text-center max-w-2xl mx-auto">
            <img src="/logo.png" height={128} width={128} />
            <h2 className="text-3xl font-bold text-slate-800 mb-4 tracking-tight text-center">
                Đăng ký Học phần
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
    );
}
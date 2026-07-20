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
                className="mc-button text-white px-10 py-4 text-[10px] font-minecraft uppercase mc-text-shadow mx-auto block"
            >
                Truy cập ngay
            </button>
        </div>
    );
}
import Schedule from "./components/Schedule";
import Header from "@/components/Header";

export default async function Page() {
    return (
        <div className="min-h-screen bg-[#f1f4f6] text-slate-700 font-sans flex flex-col">
            <Header />
            <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
                <div className="mb-6 flex flex-col gap-2">
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                        Thời khóa biểu
                    </h1>
                    <p className="text-sm text-slate-500">
                        Tổng hợp các học phần đã đăng ký và những lớp đang chọn.
                    </p>
                </div>

                <Schedule />
            </main>
        </div>
    );
}

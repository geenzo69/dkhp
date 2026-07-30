import AutoRegister from "./components/AutoRegister";

export default async function Page() {
    return (
        <div className="min-h-screen bg-[#f1f4f6] text-slate-700 font-sans flex flex-col">
            <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
                <div className="mb-6 flex flex-col gap-2">
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                        Tự động đăng ký
                    </h1>
                    <p className="text-sm text-slate-500">
                        Màn hình hiển thị lịch hẹn đăng ký và các học phần đã được lưu.
                    </p>
                </div>

                <AutoRegister />
            </main>
        </div>
    );
}
import Schedule from "./components/Schedule";

export default async function Page() {
    return (
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
    );
}

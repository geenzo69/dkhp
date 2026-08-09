import CourseList from "@/components/CourseList";
import RegistrationSchedule from "@/components/RegistrationSchedule";
import ResultSummary from "@/components/ResultSummary";

export default function DKHP() {
    return (
        <div className="min-h-screen bg-[#f1f4f6] text-slate-700 font-sans flex flex-col">
            <div className="flex flex-1">
                <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-in fade-in duration-500">
                        <CourseList />

                        <div className="xl:col-span-4 space-y-6">
                            <ResultSummary />

                            <RegistrationSchedule />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

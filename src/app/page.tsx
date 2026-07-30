import MainContainer from "@/components/MainContainer";
import Header from "@/components/Header";

export default function Home() {
    return (
        <div className="min-h-screen bg-[#f1f4f6] text-slate-700 font-sans flex flex-col">
            <Header />
            <div className="flex flex-1">
                <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
                    <MainContainer />
                </main>
            </div>
        </div>
    );
}

import { getUser } from "@/util/authentication";
import { cookies } from "next/headers";
import Header from "@/components/Header";
import Landing from "@/components/Landing";
import CourseList from "@/components/CourseList";
import ResultSummary from "@/components/ResultSummary";
import SystemLogs from "@/components/SystemLogs";
import { logout } from "./login/actions/logout";
import { redirect } from "next/navigation";

export default async function Home() {
    let user;

    try {
        user = await getUser();
    } catch(err) {
        
    }

    return (
        <div className="min-h-screen bg-[#f1f4f6] text-slate-700 font-sans flex flex-col">
            <Header
                user={user}
            />

            <div className="flex flex-1">
                <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
                    {
                        !user ? <Landing /> : (
                            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-in fade-in duration-500">
                                <CourseList />
    
                                <div className="xl:col-span-4 space-y-6">
                                    <ResultSummary />
    
                                    <SystemLogs />
                                </div>
                            </div>
                        )
                    }

                </main>
            </div>
        </div>
    );
}

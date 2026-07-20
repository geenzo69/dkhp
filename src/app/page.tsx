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
        <div className="min-h-screen bg-mc-stone-dark text-white font-sans flex flex-col" style={{ backgroundImage: "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAYElEQVQ4y2NkYGD4z0AAMIIwH2BkYGDEp5iREU0zIx4DmDE0g8QZ0OQwYPMByEaYATBBkGEYgKwBZhCGNqgGMAyBGIAMxDAMYAQxDAEYgAzEMABkBmEYgAzEMAA0R6AbAAAsuA4/Pz45sQAAAABJRU5ErkJggg==')", backgroundSize: '64px', imageRendering: 'pixelated' }}>
            <Header
                user={user}
            />

            <div className="flex flex-1">
                <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
                    {
                        !user ? <Landing /> : (
                            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
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

import User from "@/types/User";
import { getUser } from "@/util/authentication";
import Landing from "./Landing";
import CourseList from "./CourseList";
import ResultSummary from "./ResultSummary";
import SystemLogs from "./SystemLogs";
import { Suspense } from "react";

export default function MainContainer() {
    return (
        <Suspense>
            <MainContainerContent />
        </Suspense>
    );
}

async function MainContainerContent() {
    let user: User | undefined;

    try {
        user = await getUser();
    } catch(err) {
        
    }

    return (
        !user ? <Landing /> : (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-in fade-in duration-500">
                <CourseList />

                <div className="xl:col-span-4 space-y-6">
                    <ResultSummary />

                    <SystemLogs />
                </div>
            </div>
        )
    )
}
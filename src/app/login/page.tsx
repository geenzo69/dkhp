import { Suspense } from "react";
import LoadingFallback from "@/components/LoadingFallback";
import LoginContainer from "./components/LoginContainer";

export default function Page() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <LoginContainer />
        </Suspense>
    );
}

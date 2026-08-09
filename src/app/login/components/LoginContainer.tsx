import User from "@/types/User";
import { getSavedUser, getUser } from "@/util/authentication";
import { redirect } from "next/navigation";
import LoginPage from "./LoginPage";

export default async function LoginContainer() {
    let user: User | undefined;
    
    try {
        user = await getSavedUser();
    } catch {
        user = undefined;
    }

    return <LoginPage user={user} />;
}

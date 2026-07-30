import User from "@/types/User";
import { getSavedUser, getUser } from "@/util/authentication";
import { redirect } from "next/navigation";
import LoginPage from "./LoginPage";

export default async function LoginContainer() {
    let authenticatedUser: User | undefined;
    let user: User | undefined;

    try {
        authenticatedUser = await getUser();
    } catch {
        authenticatedUser = undefined;
    }

    if (authenticatedUser) {
        redirect("/");
    }

    try {
        user = await getSavedUser();
    } catch {
        user = undefined;
    }

    return <LoginPage user={user} />;
}

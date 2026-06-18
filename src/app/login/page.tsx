import LoginPage from "./components/LoginPage";
import { getSavedUser } from "@/util/authentication";
import User from "@/types/User";

export default async function Page() {
    let user: User | undefined;

    try {
        user = await getSavedUser();
    } catch {
        user = undefined;
    }

    return <LoginPage user={user} />;
}

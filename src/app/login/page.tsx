import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LoginPage from "./components/LoginPage";

export default async function Page() {
    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value;

    if (authToken) {
        redirect("/");
    }

    return <LoginPage />;
}

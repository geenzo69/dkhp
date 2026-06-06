import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { getUserInfo } from "@/util/authentication";
import AutoRegisterPage from "./components/AutoRegisterPage";

export default async function Page() {
    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value;
    let initialUser = null;

    if (authToken) {
        try {
            const decoded = jwt.decode(authToken) as jwt.JwtPayload;
            if (decoded?.user_info) {
                initialUser = await getUserInfo(decoded.user_info);
            }
        } catch (error) {
            console.error("Error loading auto register page:", error);
        }
    }

    return <AutoRegisterPage initialUser={initialUser} />;
}

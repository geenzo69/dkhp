import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { getUserInfo } from "@/util/authentication";
import { getCourses } from "@/util/course";
import TkbPage from "./components/TkbPage";

export default async function Page() {
    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value;

    let initialUser = null;
    let initialCourses = null;

    if (authToken) {
        try {
            const decoded = jwt.decode(authToken) as jwt.JwtPayload;
            if (decoded?.user_info) {
                initialUser = await getUserInfo(decoded.user_info);
                if (initialUser) {
                    initialCourses = await getCourses(
                        initialUser.sys_manguoidung,
                    );
                }
            }
        } catch (error) {
            console.error("Error loading schedule page:", error);
        }
    }

    return (
        <TkbPage initialUser={initialUser} initialCourses={initialCourses} />
    );
}

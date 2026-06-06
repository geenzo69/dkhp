import Dashboard from "@/components/Dashboard";
import { getCourses } from "@/util/course";
import { getUserInfo } from "@/util/authentication";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export default async function Home() {
    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value;
    
    let initialUser = null;
    let initialCourses = null;

    if (authToken) {
        try {
            const decoded = jwt.decode(authToken) as jwt.JwtPayload;
            if (decoded && decoded.user_info) {
                initialUser = await getUserInfo(decoded.user_info);
                if (initialUser) {
                    initialCourses = await getCourses(initialUser.sys_manguoidung);
                }
            }
        } catch (e) {
            console.error("Error decoding token on server:", e);
        }
    }

    return (
        <Dashboard 
            initialUser={initialUser} 
            initialCourses={initialCourses} 
        />
    );
}

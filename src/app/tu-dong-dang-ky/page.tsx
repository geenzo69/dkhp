import { redirect } from "next/navigation";
import AutoRegisterPage from "./components/AutoRegisterPage";
import { getUser } from "@/util/authentication";

export default async function Page() {
    let user;

    try {
        user = await getUser();

        if (!user) {
            redirect("/login");
        }
    } catch(err) {
        redirect("/login");
    }

    return <AutoRegisterPage initialUser={user} />;
}

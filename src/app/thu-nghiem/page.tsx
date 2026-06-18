import ExperimentPage from "./components/ExperimentPage";
import { getUser } from "@/util/authentication";
import { redirect } from "next/navigation";

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

    return <ExperimentPage initialUser={user} />;
}

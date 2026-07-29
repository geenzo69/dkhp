import User from "@/types/User";
import { getUser } from "@/util/authentication";
import { Suspense } from "react";
import Navigation from "./Navigation";
import AccountProfile from "./AccountProfile";

export default function Header() {
    return (
        <Suspense>
            <HeaderContent />
        </Suspense>
    );
}

async function HeaderContent() {
    let user: User | undefined;

    try {
        user = await getUser();
    } catch(err) {
        
    }

    return (
        <header className="bg-white shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between px-4 md:px-6 z-30 sticky top-0 border-b">
            <div className="flex h-16 items-center justify-between gap-8">
                <div className="flex items-center gap-2">
                    <img src="/logo.png" height={32} width={32} />
                    <span className="font-black text-xl tracking-tighter text-[#3f6ad8]">
                        DKHP
                    </span>
                </div>

                <div className="flex lg:hidden">
                    <AccountProfile user={user} />
                </div>
            </div>

            {
                user && (
                    <Navigation />
                )
            }

            <div className="hidden lg:flex items-center gap-4">
                <AccountProfile user={user} />
            </div>
        </header>
    );
}
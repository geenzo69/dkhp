import User from "@/types/User";
import { getUser } from "@/util/authentication";
import { Suspense } from "react";
import Navigation from "./Navigation";
import AccountProfile from "./AccountProfile";
import { CalendarDays, Home, Zap } from "lucide-react";
import Link from "next/link";

export default function Header() {
	return (
		<Suspense fallback={<HeaderFallback />}>
			<HeaderContent />
		</Suspense>
	);
}

async function HeaderContent() {
	let user: User | undefined;

	try {
		user = await getUser();
	} catch (err) {}

	return (
		<header className="bg-white shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between px-4 md:px-6 z-30 sticky top-0 border-b">
			<div className="flex h-16 items-center justify-between gap-8 w-full lg:w-[200px] shrink-0">
				<div className="flex items-center gap-2">
					<img src="/logo.png" height={32} width={32} />
					<span className="font-black text-xl tracking-tighter text-[#3f6ad8]">
						DKHP
					</span>
				</div>

				<div className="flex lg:hidden items-center justify-end w-[100px] shrink-0">
					<AccountProfile user={user} />
				</div>
			</div>

			<div className="flex-1 flex justify-center pb-3 lg:pb-0 overflow-x-auto">
				<Navigation />
			</div>

			<div className="hidden lg:flex items-center justify-end w-[200px] shrink-0">
				<AccountProfile user={user} />
			</div>
		</header>
	);
}

function HeaderFallback() {
	const tabs = [
		{ href: "/", label: "Đăng ký học phần", icon: Home },
		{ href: "/tkb", label: "Thời khóa biểu", icon: CalendarDays },
		{ href: "/tu-dong-dang-ky", label: "Tự động đăng ký", icon: Zap }
	];

	return (
		<header className="bg-white shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between px-4 md:px-6 z-30 sticky top-0 border-b">
			<div className="flex h-16 items-center justify-between gap-8 w-full lg:w-[200px] shrink-0">
				<div className="flex items-center gap-2">
					<img src="/logo.png" height={32} width={32} />
					<span className="font-black text-xl tracking-tighter text-[#3f6ad8]">
						DKHP
					</span>
				</div>

				<div className="flex lg:hidden items-center justify-end w-[100px] shrink-0" />
			</div>

			<div className="flex-1 flex justify-center pb-3 lg:pb-0 overflow-x-auto">
				<nav className="flex gap-1 overflow-x-auto pb-3 lg:pb-0">
					{tabs.map((tab) => {
						const Icon = tab.icon;
						return (
							<Link
								key={tab.href}
								href={tab.href}
								className="flex h-10 shrink-0 items-center gap-2 rounded px-3 text-[10px] font-black uppercase tracking-wider text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all"
							>
								<Icon size={15} />
								<span>{tab.label}</span>
							</Link>
						);
					})}
				</nav>
			</div>

			<div className="hidden lg:flex items-center justify-end w-[200px] shrink-0" />
		</header>
	);
}

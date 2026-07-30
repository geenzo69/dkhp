import { getDKMHToken } from "@/util/authentication";
import User from "@/types/User";
import { CalendarClock, Info } from "lucide-react";
import Card from "./Card";
import { cacheLife, cacheTag } from "next/cache";
import { Suspense } from "react";
import RegistrationCountdown from "./RegistrationCountdown";

interface RegulationItem {
    rightData?: { value: string }[];
}

interface RegistrationTimeCell {
    title: string;
}

interface RegistrationRegulations {
    quyDinh?: RegulationItem[];
    thoiGianDangKy?: RegistrationTimeCell[][];
}

interface RegistrationTime {
    startTime: string;
    endTime: string;
}

export default async function RegistrationSchedule({ user }: { user: User }) {    
    return (
        <Suspense fallback={<RegistrationScheduleSkeleton />}>
            <RegistrationScheduleContent user={user} />
        </Suspense>
    );
}

function RegistrationScheduleSkeleton() {
    return (
        <Card title="Thời điểm đăng ký học phần" icon={CalendarClock} color="#3f6ad8">
            <div className="animate-pulse space-y-5 p-5">
                <div className="space-y-2">
                    <div className="h-3 w-24 rounded bg-slate-200" />
                    <div className="h-5 w-52 rounded bg-slate-200" />
                </div>
                <div className="space-y-2 border-t border-slate-100 pt-3">
                    <div className="h-3 w-20 rounded bg-slate-200" />
                    <div className="h-4 w-44 rounded bg-slate-200" />
                </div>
            </div>
        </Card>
    );
}

async function RegistrationScheduleContent({
    user
}: {
    user: User
}) {
    const registrationTime = await getRegistrationTime(user);

    return (
        <Card title="Thời điểm đăng ký học phần" icon={CalendarClock} color="#3f6ad8">
            <div className="p-5">
                {registrationTime ? (
                    <div className="space-y-4 text-left">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                Mở đăng ký
                            </p>
                            <p className="mt-1 text-base font-bold text-[#3f6ad8]">
                                {registrationTime.startTime}
                            </p>
                            <RegistrationCountdown startTime={registrationTime.startTime} />
                        </div>
                        <div className="border-t border-slate-100 pt-3">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                Kết thúc
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-600">
                                {registrationTime.endTime}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="py-5 text-center">
                        <Info size={24} className="mx-auto mb-2 text-slate-200" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            Chưa tìm thấy thời gian đăng ký
                        </p>
                    </div>
                )}
            </div>
        </Card>
    );
}

async function getRegistrationTime(user: User): Promise<RegistrationTime | undefined> {
    try {
        const dkmhToken = await getDKMHToken();
        if (!dkmhToken) return;

        const response = await fetch(
            "https://dkmhback.ctu.edu.vn/api/v1/dangkyhocphan/sinhvien/quydinhdangky",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${dkmhToken}`,
                }
            },
        );

        if (!response.ok) return;

        const result = await response.json() as { data?: RegistrationRegulations };
        const regulations = result.data;
        const group = findRegistrationGroup(regulations?.quyDinh, user.sys_tendonvi);

        if (!group) return;

        return findRegistrationTime(
            regulations?.thoiGianDangKy,
            user.sys_khoahoc,
            group,
        );
    } catch {
        return;
    }
}

function findRegistrationGroup(regulations: RegulationItem[] | undefined, unitName: string) {
    const normalizedUnitName = normalizeUnitName(unitName);

    for (const regulation of regulations ?? []) {
        for (const item of regulation.rightData ?? []) {
            const group = item.value.match(/nhóm\s*(\d+)/i)?.[1];
            if (group && normalizeUnitName(item.value).includes(normalizedUnitName)) {
                return group;
            }
        }
    }
}

function normalizeUnitName(value: string) {
    return value.toLowerCase().replace(/\s*&\s*/g, " & ").trim();
}

function findRegistrationTime(
    schedule: RegistrationTimeCell[][] | undefined,
    courseYear: number,
    group: string,
): RegistrationTime | undefined {
    let cohort = "";

    for (const row of schedule ?? []) {
        const titles = row.map((cell) => cell.title);
        const cohortTitle = titles.find((title) => /khóa\s+\d+/i.test(title));
        if (cohortTitle) cohort = cohortTitle;

        const rowGroup = titles.at(-1);
        if (rowGroup !== group || !matchesCohort(cohort, courseYear)) continue;

        const timeTitles = titles.filter((title) => !/khóa\s+\d+/i.test(title) && title !== rowGroup);
        if (timeTitles.length < 2) continue;

        return {
            startTime: timeTitles.at(-2)!,
            endTime: timeTitles.at(-1)!,
        };
    }
}

function matchesCohort(cohort: string, courseYear: number) {
    const cohortYear = Number(cohort.match(/khóa\s+(\d+)/i)?.[1]);
    if (!cohortYear) return false;

    return cohort.toLowerCase().includes("trở về trước")
        ? courseYear <= cohortYear
        : courseYear === cohortYear;
}

import { Client } from "@upstash/qstash";
import { unstable_cache, updateTag } from "next/cache";
import { getUser } from "./authentication";
import { decode, JwtPayload } from "jsonwebtoken";

const client = new Client({
    baseUrl: "https://qstash-eu-central-1.upstash.io",
    token: process.env.QSTASH_TOKEN,
  });

const scheduleTimeZone = "Asia/Ho_Chi_Minh";
  

const getSchedules = unstable_cache(async () => {
    const list = await client.schedules.list();

    return list;
}, [], {
    revalidate: 3600,
    tags: ["schedules"]
});

export async function getSchedule() {
    let user;

    try {
        user = await getUser();
    } catch(err) {
        return;
    }

    if (!user) {
        return;
    }

    const schedules = await getSchedules();

    return schedules.find((v) => v.label == user.sys_manguoidung);
}

export async function createSchedule(data: any) {
    const match = data.time.match(
        /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::\d{2})?$/
    );

    if (!match) {
        throw new Error("ISO datetime không hợp lệ");
    }

    const [, , month, day, hour, minute] = match;

    const { mssv } = decode(data.token) as JwtPayload;

    await client.schedules.create({
        destination: "https://dkhp.geenzo.dev/api/register",
        cron: `CRON_TZ=${scheduleTimeZone} ${Number(minute)} ${Number(hour)} ${Number(day)} ${Number(month)} *`,
        method: "POST",
        body: JSON.stringify({
            dkmh_tu_dien_hoat_dong_dao_tao_ma: "CQ",
            data
        }),
        label: mssv,
        headers: {
            "Content-Type": "application/json",
        }
    });

    updateTag("schedules");
}

export async function deleteSchedule() {
    let user;

    try {
        user = await getUser();
    } catch(err) {
        return;
    }

    if (!user) {
        return;
    }

    const schedule = await getSchedule();
    if (!schedule) {
        throw new Error("Không tìm thấy lịch hẹn để xóa");
    }

    await client.schedules.delete(schedule.scheduleId);
    updateTag("schedules");
}

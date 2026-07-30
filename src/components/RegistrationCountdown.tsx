"use client";

import { useEffect, useState } from "react";

interface Countdown {
    days: number;
    hours: number;
    minutes: number;
    hasStarted: boolean;
}

export default function RegistrationCountdown({ startTime }: { startTime: string }) {
    const [countdown, setCountdown] = useState<Countdown | undefined>();

    useEffect(() => {
        const updateCountdown = () => setCountdown(getCountdown(startTime));

        updateCountdown();
        const intervalId = window.setInterval(updateCountdown, 1_000);

        return () => window.clearInterval(intervalId);
    }, [startTime]);

    if (!countdown) return null;

    return (
        <p className={`mt-2 text-xs font-semibold ${countdown.hasStarted ? "text-emerald-600" : "text-amber-600"}`}>
            {countdown.hasStarted
                ? "Đã đến thời gian đăng ký học phần"
                : `Còn ${formatCountdown(countdown)} đến giờ đăng ký`}
        </p>
    );
}

function getCountdown(startTime: string): Countdown | undefined {
    const dateParts = startTime.match(/(\d{1,2}):(\d{2})\D+(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (!dateParts) return;

    const [, hours, minutes, day, month, year] = dateParts;
    const registrationDate = new Date(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hours),
        Number(minutes),
    );
    const remainingMilliseconds = registrationDate.getTime() - Date.now();

    if (remainingMilliseconds <= 0) {
        return { days: 0, hours: 0, minutes: 0, hasStarted: true };
    }

    const remainingMinutes = Math.floor(remainingMilliseconds / 60_000);
    return {
        days: Math.floor(remainingMinutes / 1_440),
        hours: Math.floor((remainingMinutes % 1_440) / 60),
        minutes: remainingMinutes % 60,
        hasStarted: false,
    };
}

function formatCountdown({ days, hours, minutes }: Countdown) {
    const parts = [];

    if (days > 0) parts.push(`${days} ngày`);
    if (hours > 0 || days > 0) parts.push(`${hours} giờ`);
    parts.push(`${minutes} phút`);

    return parts.join(" ");
}

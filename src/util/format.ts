import LopHocPhan from "@/types/LopHocPhan";

/**
 * PARSER RULE:
 * tkb: Weeks_Indices (e.g., 1-12_1;2;3;4;19;20;21;22)
 * Day = Math.floor((N - 1) / 13) + 2
 * Period = ((N - 1) % 13) + 1
 */

export function formatTkb(tkb: string | null | undefined): string {
    if (!tkb) return "Chưa có lịch";
    if (!tkb.includes("_")) return tkb;

    try {
        const segments = tkb.split(" ");
        const results: string[] = [];

        segments.forEach(segment => {
            if (!segment.includes("_")) return;
            const [weeks, indicesStr] = segment.split("_");
            const indices = indicesStr.split(";").map(n => parseInt(n)).filter(n => !isNaN(n)).sort((a,b) => a-b);
            
            if (indices.length === 0) return;

            const dayMap: Record<number, number[]> = {};
            indices.forEach(n => {
                const day = Math.floor((n - 1) / 13) + 2;
                const period = ((n - 1) % 13) + 1;
                if (!dayMap[day]) dayMap[day] = [];
                dayMap[day].push(period);
            });

            const dayDetails = Object.entries(dayMap).map(([dayNum, periods]) => {
                const dayLabel = dayNum === "8" ? "CN" : `T${dayNum}`;
                const start = Math.min(...periods);
                const end = Math.max(...periods);
                return `${dayLabel}(${start}-${end})`;
            });

            results.push(`T${weeks}: ${dayDetails.join(", ")}`);
        });

        return results.join(" | ");
    } catch (e) {
        console.error("Lỗi định dạng TKB:", e);
        return tkb;
    }
}

export function checkTkbConflict(tkb1: string | null | undefined, tkb2: string | null | undefined): boolean {
    if (!tkb1 || !tkb2) return false;

    const parseTkb = (tkb: string) => {
        const segments = tkb.split(" ");
        const slots: { index: number; weeks: string }[] = [];
        segments.forEach(segment => {
            const parts = segment.split("_");
            if (parts.length < 2) return;
            const [weeksStr, indicesStr] = parts;
            const indices = indicesStr.split(";").map(n => parseInt(n)).filter(n => !isNaN(n));
            indices.forEach(idx => {
                slots.push({ index: idx, weeks: weeksStr });
            });
        });
        return slots;
    };

    const getWeeksSet = (w: string): Set<number> => {
        const weeks = new Set<number>();
        if (/^\d+-\d+$/.test(w)) {
            const [start, end] = w.split("-").map(Number);
            for (let i = start; i <= end; i++) {
                weeks.add(i);
            }
            return weeks;
        }
        
        if (w.length > 5 && /^\d+$/.test(w) && w.length % 2 === 0) {
            for (let i = 0; i < w.length; i += 2) {
                const weekNum = parseInt(w.substring(i, i + 2), 10);
                if (!isNaN(weekNum)) {
                    weeks.add(weekNum);
                }
            }
            return weeks;
        }

        for (let i = 0; i < w.length; i++) {
            const char = w[i];
            if (char !== "-") {
                weeks.add(i + 1);
            }
        }
        return weeks;
    };

    const weeksOverlap = (w1: string, w2: string): boolean => {
        const set1 = getWeeksSet(w1);
        const set2 = getWeeksSet(w2);
        for (const wk of set1) {
            if (set2.has(wk)) return true;
        }
        return false;
    };

    const slots1 = parseTkb(tkb1);
    const slots2 = parseTkb(tkb2);

    for (const s1 of slots1) {
        for (const s2 of slots2) {
            if (s1.index === s2.index) {
                if (weeksOverlap(s1.weeks, s2.weeks)) {
                    return true;
                }
            }
        }
    }
    return false;
}

export function getCourseColor(courseCode: string) {
    let hash = 2166136261;
    for (let i = 0; i < courseCode.length; i++) {
        hash ^= courseCode.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    hash = hash >>> 0;

    const hue = hash % 360;
    const satVariance = (hash >>> 8) % 15;
    const lightVariance = (hash >>> 16) % 10;

    const baseSat = 60 + satVariance - 7;
    const baseLight = 45 + lightVariance - 5;

    return {
        softBg: `hsl(${hue}, 85%, 96%)`,
        softBorder: `hsl(${hue}, ${baseSat}%, 90%)`,
        softText: `hsl(${hue}, 85%, 25%)`,
        solidBg: `hsl(${hue}, ${baseSat}%, ${baseLight}%)`,
        solidBorder: `hsl(${hue}, ${baseSat}%, ${baseLight - 5}%)`,
        solidText: `#ffffff`,
        accent: `hsl(${hue}, 70%, 50%)`,
    };
}

export function parsePeriodsFromString(tietHoc: string | null | undefined): number[] {
    if (!tietHoc) return [];
    
    // If it contains a comma, parse as comma-separated list of numbers
    if (tietHoc.includes(",")) {
        return tietHoc.split(",").map(Number).filter(n => !isNaN(n));
    }
    
    // Otherwise, parse it as a 13-character positional string (e.g. "123----------" or "-----6789----")
    const periods: number[] = [];
    for (let i = 0; i < tietHoc.length; i++) {
        if (tietHoc[i] !== "-") {
            periods.push(i + 1);
        }
    }
    return periods;
}

export function checkGroupConflict(group1: LopHocPhan | null | undefined, group2: LopHocPhan | null | undefined): boolean {
    if (!group1 || !group2) return false;
    
    // Fallback to string-based check if data arrays are not present
    if (!group1.data || !group2.data) {
        return checkTkbConflict(group1.dkmh_tu_dien_lop_hoc_phan_tkb, group2.dkmh_tu_dien_lop_hoc_phan_tkb);
    }

    for (const slot1 of group1.data) {
        for (const slot2 of group2.data) {
            // 1. Check if same day of week (coerced to number)
            if (Number(slot1.dkmh_thu_trong_tuan_ma) !== Number(slot2.dkmh_thu_trong_tuan_ma)) {
                continue;
            }

            // 2. Check if overlapping periods
            const periods1 = parsePeriodsFromString(slot1.tiet_hoc);
            const periods2 = parsePeriodsFromString(slot2.tiet_hoc);
            const hasPeriodOverlap = periods1.some(p => periods2.includes(p));
            if (!hasPeriodOverlap) {
                continue;
            }

            // 3. Check if overlapping weeks (coerced elements to number)
            const rawWeeks1 = (slot1.tuan_hoc && slot1.tuan_hoc.length > 0) ? slot1.tuan_hoc : (group1.tuan_hoc || []);
            const rawWeeks2 = (slot2.tuan_hoc && slot2.tuan_hoc.length > 0) ? slot2.tuan_hoc : (group2.tuan_hoc || []);
            
            const weeks1 = rawWeeks1.map(Number);
            const weeks2 = rawWeeks2.map(Number);
            
            if (weeks1.length === 0 || weeks2.length === 0) {
                // If week info is missing, assume they overlap/conflict in weeks by default
                return true;
            }

            const hasWeekOverlap = weeks1.some(w => weeks2.includes(w));
            if (hasWeekOverlap) {
                return true;
            }
        }
    }
    return false;
}
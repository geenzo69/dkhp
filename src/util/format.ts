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

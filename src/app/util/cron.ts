export async function create(authToken: string, name: string, data: any, scheduleDate: Date, origin: string) {
    // Extract time components for cron-job.org schedule
    const minutes = [scheduleDate.getMinutes()];
    const hours = [scheduleDate.getHours()];
    const mdays = [scheduleDate.getDate()];
    const months = [scheduleDate.getMonth() + 1]; // cron-job.org uses 1-12
    const wdays = [-1]; // -1 for all weekdays, but we specify mday and month for a single run

    const res = await fetch("https://api.cron-job.org/jobs", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer PK7WWK290pwcqiwkY6bQpp0+OnOHjEzSFoMl/6EYjZA="
        },
        body: JSON.stringify({
            job: {
                url: `${origin}/api/register`,
                enabled: true,
                title: `Đăng ký học phần cho ${name}`,
                saveResponses: true,
                requestMethod: 1,
                extendedData: {
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        authToken: authToken,
                        data: data
                    }),
                },
                schedule: {
                    timezone: "Asia/Ho_Chi_Minh",
                    minutes: minutes,
                    hours: hours,
                    mdays: mdays,
                    months: months,
                    wdays: wdays
                }
            }
        })
    });

    const result = await res.json();
    if (!res.ok) {
        return { success: false, msg: result.message || "Không thể tạo lịch đăng ký" };
    }
    return { success: true, msg: "Đã lên lịch đăng ký thành công!" };
}

export async function getAllJobs() {
    const res = await fetch("https://api.cron-job.org/jobs", {
        method: "GET",
        headers: {
            Authorization: "Bearer PK7WWK290pwcqiwkY6bQpp0+OnOHjEzSFoMl/6EYjZA="
        }
    });

    if (!res.ok) return [];
    const result = await res.json();
    return result.jobs || [];
}
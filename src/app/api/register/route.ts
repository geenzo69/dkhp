import { generateToken, getToken } from "@/util/authentication";
import { decode, JwtPayload, verify } from "jsonwebtoken";
import { updateTag } from "next/cache";
import { NextResponse } from "next/server";
import { SMTPClient } from "emailjs";
import { revalidateTag } from "next/cache";

const secret = process.env.DKHP_SECRET || "";

const client = new SMTPClient({
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    host: "out.dnsexit.com",
    ssl: false,
    tls: true,
    port: 587
});

interface CourseResult {
    ma_hp: string;
    nhom_hp: string;
    trang_thai: string;
    ly_do?: string;
}

async function sendReportEmail(
    mssv: string,
    timeDisplay: string,
    detailedResults: CourseResult[],
    errorMsg?: string
) {
    const allSuccess = detailedResults.every(r => r.trang_thai === "success");
    const anySuccess = detailedResults.some(r => r.trang_thai === "success");

    let statusTitle = "ĐĂNG KÝ THÀNH CÔNG";
    let bg = "#ecfdf5";
    let border = "#10b981";
    let text = "#065f46";
    let subtext = "#047857";

    if (!allSuccess) {
        if (anySuccess) {
            statusTitle = "THÀNH CÔNG MỘT PHẦN";
            bg = "#fffbeb";
            border = "#f59e0b";
            text = "#92400e";
            subtext = "#b45309";
        } else {
            statusTitle = "ĐĂNG KÝ THẤT BẠI";
            bg = "#fef2f2";
            border = "#ef4444";
            text = "#991b1b";
            subtext = "#b91c1c";
        }
    }

    const toEmail = `${mssv}@student.ctu.edu.vn`;
    const subject = `[DKHP] Báo cáo tự động - MSSV ${mssv} (${statusTitle})`;

    const textVersion = `Xin chào sinh viên ${mssv}, Lịch hẹn tự động lúc ${timeDisplay} của bạn đã kết thúc. Trạng thái: ${statusTitle}.\n` +
        detailedResults.map(item => `- Môn ${item.ma_hp} (Nhóm ${item.nhom_hp}): ${item.trang_thai === "success" ? "Thành công" : "Thất bại: " + (item.ly_do || errorMsg || "Lỗi")}`).join("\n");

    const htmlContent = `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
  <div style="background: linear-gradient(135deg, #3f6ad8, #2c4a96); padding: 24px; text-align: center; color: white;">
    <h1 style="margin: 0; font-size: 20px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">DKHP CTU</h1>
    <p style="margin: 4px 0 0 0; opacity: 0.8; font-size: 12px;">Báo cáo kết quả đăng ký học phần tự động</p>
  </div>
  <div style="padding: 24px; background: #ffffff;">
    <p style="font-size: 14px; color: #475569; margin: 0 0 16px 0;">Xin chào sinh viên <strong>${mssv}</strong>,</p>
    
    <div style="padding: 16px; border-radius: 6px; margin-bottom: 24px; text-align: center; background: ${bg}; border: 1px solid ${border};">
      <h2 style="margin: 0; font-size: 18px; font-weight: 700; color: ${text};">
        ${statusTitle === "ĐĂNG KÝ THÀNH CÔNG" ? "🎉 ĐĂNG KÝ THÀNH CÔNG" : statusTitle === "THÀNH CÔNG MỘT PHẦN" ? "⚠️ THÀNH CÔNG MỘT PHẦN" : "❌ ĐĂNG KÝ THẤT BẠI"}
      </h2>
      <p style="margin: 8px 0 0 0; font-size: 13px; color: ${subtext};">
        Lịch hẹn tự động lúc <strong>${timeDisplay}</strong> đã được thực hiện.
      </p>
    </div>

    ${errorMsg && !anySuccess ? `
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 16px; margin-bottom: 24px;">
      <p style="margin: 0 0 4px 0; font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b;">Chi tiết lỗi hệ thống:</p>
      <p style="margin: 0; font-size: 13px; font-family: monospace; color: #ef4444; word-break: break-all;">${errorMsg}</p>
    </div>
    ` : ""}

    <h3 style="font-size: 14px; font-weight: 800; color: #334155; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px;">Chi tiết kết quả:</h3>
    <div style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin-bottom: 24px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;">
        <thead>
          <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
            <th style="padding: 12px 16px; font-weight: 700; color: #475569;">Mã môn</th>
            <th style="padding: 12px 16px; font-weight: 700; color: #475569;">Nhóm</th>
            <th style="padding: 12px 16px; font-weight: 700; color: #475569;">Trạng thái</th>
            <th style="padding: 12px 16px; font-weight: 700; color: #475569;">Chi tiết / Lý do</th>
          </tr>
        </thead>
        <tbody>
          ${detailedResults.map(item => {
            const ok = item.trang_thai === "success";
            return `
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 12px 16px; font-weight: 700; color: #1e293b;">${item.ma_hp}</td>
                <td style="padding: 12px 16px; color: #475569;"><span style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-family: monospace;">${item.nhom_hp}</span></td>
                <td style="padding: 12px 16px;">
                  <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase; 
                    background: ${ok ? "#d1fae5" : "#fee2e2"}; 
                    color: ${ok ? "#065f46" : "#991b1b"};">
                    ${ok ? "Thành công" : "Thất bại"}
                  </span>
                </td>
                <td style="padding: 12px 16px; color: ${ok ? "#059669" : "#dc2626"}; font-size: 12px;">
                  ${ok ? "Đăng ký thành công" : (item.ly_do || "Lỗi không xác định")}
                </td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    </div>

    <div style="border-top: 1px solid #f1f5f9; padding-top: 16px;">
      <p style="margin: 0; font-size: 12px; color: #94a3b8; text-align: center;">
        Đây là email tự động từ hệ thống DKHP. Vui lòng không trả lời email này.
      </p>
    </div>
  </div>
</div>
    `;

    return new Promise<void>((resolve, reject) => {
        client.send(
            {
                text: textVersion,
                from: "no-reply@dkhp.geenzo.dev",
                to: toEmail,
                subject: subject,
                attachment: [
                    { data: htmlContent, alternative: true }
                ]
            },
            (err, message) => {
                if (err) reject(err);
                else resolve();
            }
        );
    });
}

interface RegisterRequestBody {
    dkmh_tu_dien_hoat_dong_dao_tao_ma?: string;
    data?: {
        token?: string;
        data?: {
            dkmh_tu_dien_hoc_phan_ma: string;
            dkmh_nhom_hoc_phan_ma: string;
        }[];
        time?: string;
    };
}

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as RegisterRequestBody;
        const scheduleData = body.data;
        const authToken = scheduleData?.token;
        const registrationData = scheduleData?.data;

        if (!authToken || !registrationData?.length) {
            return NextResponse.json(
                { msg: "Thiếu thông tin đăng ký" },
                { status: 400 },
            );
        }

        const { dkmhToken, mssv } = await getValidDkmhToken(authToken);

        const res = await fetch(
            "https://dkmhback.ctu.edu.vn/api/v1/dangkyhocphan/sinhvien/dangkyhocphan",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${dkmhToken}`,
                },
                body: JSON.stringify({
                    dkmh_tu_dien_hoat_dong_dao_tao_ma:
                        body.dkmh_tu_dien_hoat_dong_dao_tao_ma || "CQ",
                    data: registrationData,
                }),
            },
        );

        const json = await res.json();
        const timeDisplay = scheduleData?.time 
            ? new Date(scheduleData.time).toLocaleString("vi-VN") 
            : new Date().toLocaleString("vi-VN");

        // Parse results course-by-course based on the data list structure
        const resultDataList = Array.isArray(json.data) ? json.data : [];
        const resultMap = new Map<string, { trang_thai: string; ly_do?: string }>();
        resultDataList.forEach((item: any) => {
            if (item?.dkmh_tu_dien_hoc_phan_ma) {
                resultMap.set(item.dkmh_tu_dien_hoc_phan_ma, {
                    trang_thai: item.trang_thai,
                    ly_do: item.ly_do
                });
            }
        });

        const detailedResults: CourseResult[] = registrationData.map((item) => {
            const resItem = resultMap.get(item.dkmh_tu_dien_hoc_phan_ma);
            return {
                ma_hp: item.dkmh_tu_dien_hoc_phan_ma,
                nhom_hp: item.dkmh_nhom_hoc_phan_ma,
                trang_thai: resItem?.trang_thai || "fail",
                ly_do: resItem?.ly_do
            };
        });

        if (!res.ok || json.msg !== "OK") {
            const errorMsg = json.msg || "Lỗi đăng ký học phần";
            const failedResults = detailedResults.map(r => ({
                ...r,
                trang_thai: r.trang_thai === "success" ? "success" : "fail",
                ly_do: r.ly_do || errorMsg
            }));
            try {
                await sendReportEmail(mssv, timeDisplay, failedResults, errorMsg);
            } catch (mailErr) {
                console.error("Lỗi gửi mail báo thất bại:", mailErr);
            }
            return NextResponse.json(json, { status: 500 });
        }

        revalidateTag(`COURSES/${mssv}`, {
            expire: 3600
        });

        try {
            await sendReportEmail(mssv, timeDisplay, detailedResults);
        } catch (mailErr) {
            console.error("Lỗi gửi mail báo thành công:", mailErr);
        }

        return NextResponse.json(json);
    } catch (error: any) {
        return NextResponse.json(
            { msg: error.message || "Lỗi máy chủ" },
            { status: 500 },
        );
    }
}

async function getValidDkmhToken(authToken: string) {
    const payload = verify(authToken, secret, {
        algorithms: ["HS256"],
        ignoreExpiration: true,
    }) as JwtPayload;

    if (
        typeof payload.mssv !== "string" ||
        typeof payload.password !== "string" ||
        typeof payload.token !== "string"
    ) {
        throw new Error("Token đăng ký không hợp lệ");
    }

    const mssv = payload.mssv;
    const password = Buffer.from(payload.password, "base64").toString("utf-8");

    if (isJwtPayloadValid(payload) && isDkmhTokenValid(payload.token)) {
        return {
            dkmhToken: payload.token,
            mssv,
        };
    }

    updateTag(`user/${mssv}/${password}`);
    const refreshedDkmhToken = await getToken(mssv, password);
    generateToken(mssv, password, refreshedDkmhToken);

    return {
        dkmhToken: refreshedDkmhToken,
        mssv,
    };
}

function isDkmhTokenValid(dkmhToken: string) {
    const decodedToken = decode(dkmhToken) as JwtPayload | null;

    return isJwtPayloadValid(decodedToken);
}

function isJwtPayloadValid(payload: JwtPayload | null) {
    if (!payload?.exp) {
        return false;
    }

    return Date.now() < payload.exp * 1000;
}

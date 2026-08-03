import User from "@/types/User";
import { SMTPClient } from "emailjs";
import { unstable_cache } from "next/cache";

const client = new SMTPClient({
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    host: "out.dnsexit.com",
    ssl: false,
    tls: true,
    port: 587
});

export interface CourseResult {
    ma_hp: string;
    nhom_hp: string;
    trang_thai: string;
    ly_do?: string;
}

function generateEmailHtml(
    user: User,
    timeDisplay: string,
    detailedResults: CourseResult[],
    statusTitle: string,
    bg: string,
    border: string,
    text: string,
    subtext: string,
    errorMsg?: string
) {
    const anySuccess = detailedResults.some(r => r.trang_thai === "success");

    return `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
  <div style="background: linear-gradient(135deg, #3f6ad8, #2c4a96); padding: 24px; text-align: center; color: white;">
    <h1 style="margin: 0; font-size: 20px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">DKHP CTU</h1>
    <p style="margin: 4px 0 0 0; opacity: 0.8; font-size: 12px;">Báo cáo kết quả đăng ký học phần tự động</p>
  </div>
  <div style="padding: 24px; background: #ffffff;">
    <p style="font-size: 14px; color: #475569; margin: 0 0 16px 0;">Xin chào sinh viên <strong>${user.sys_hoten}</strong>,</p>
    
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
}

export const sendReportEmail = unstable_cache(async function sendReportEmail(
    user: User,
    detailedResults: CourseResult[],
    errorMsg?: string,
) {
    const timeDisplay = new Date().toLocaleString("vi-VN");
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

    let toEmail = user.sys_email;

    const subject = `[DKHP] Báo cáo tự động`;

    const textVersion = `Xin chào sinh viên ${user.sys_hoten}, Lịch hẹn tự động lúc ${timeDisplay} của bạn đã kết thúc. Trạng thái: ${statusTitle}.\n` +
        detailedResults.map(item => `- Môn ${item.ma_hp} (Nhóm ${item.nhom_hp}): ${item.trang_thai === "success" ? "Thành công" : "Thất bại: " + (item.ly_do || errorMsg || "Lỗi")}`).join("\n");

    const htmlContent = generateEmailHtml(user, timeDisplay, detailedResults, statusTitle, bg, border, text, subtext, errorMsg);

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
                if (err) {
                    console.error("Gửi email thất bại cho MSSV:", user.sys_manguoidung, "Chi tiết lỗi:", err);
                    reject(err);
                } else {
                    resolve();
                }
            }
        );
    });
}, ["send-report-email"], {
    revalidate: 7200
});

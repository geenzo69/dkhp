"use server";
import zlib from "zlib";
import { UserInfo } from "../components/Login";

export async function login({ mssv, password }: {
    mssv: string;
    password: string;
}) {
    const begin = await fetch("https://ctuapi.ctu.edu.vn/ql/quanly/api/dangnhap/login", {
        body: JSON.stringify({
            action: "https://ctuapi.ctu.edu.vn/ql/quanly/api/dangnhap/login",
            token: "",
            ss_key: "",
            doituong: "sinhvien",
            params: {
              user: mssv,
              pass: password
            }
        }),
        method: "POST"
    });

    if (!begin.ok) {
        return null;
    }

    const beginJson = await begin.json();

    if (beginJson.msg != "OK") {
        return null;
    }

    const getToken = await fetch("https://ctuapi.ctu.edu.vn/ql/quanly/api/dangnhap/renewtokendkmh", {
        body: JSON.stringify({
            token: beginJson.data.token,
            ss_key: beginJson.data.ss_key
        }),
        method: "POST"
    });
    if (!getToken.ok) {
        return null;
    }

    const getTokenJson = await getToken.json();

    if (getTokenJson.msg != "OK") {
        return null;
    }

    return getTokenJson.data.token_dkmh;
}

export async function getUserInfo(input: string) {
    if (!input) return null;

    try {
      const cleanedInput = input.trim();
  
      const buffer = Buffer.from(cleanedInput, "base64");
  
      const decompressed = zlib.inflateSync(buffer);
  
      const result = JSON.parse(decompressed.toString("utf-8"));
  
      return result as UserInfo;
    } catch (error) {
      console.error("Lỗi giải nén UserInfo");
      return null;
    }
}
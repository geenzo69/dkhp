"use server";

import User from "@/types/User";
import zlib from "zlib";


export async function getUserInfo(input: string) {
    if (!input) return null;

    try {
      const cleanedInput = input.trim();
  
      const buffer = Buffer.from(cleanedInput, "base64");
  
      const decompressed = zlib.inflateSync(buffer);
  
      const result = JSON.parse(decompressed.toString("utf-8"));
  
      return result as User;
    } catch (error) {
      console.error("Lỗi giải nén UserInfo");
      return null;
    }
}

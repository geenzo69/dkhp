import User from "@/types/User";
import zlib from "zlib";
import { decode, JwtPayload, sign, verify } from "jsonwebtoken";
import { cookies } from "next/headers";
import { unstable_cache } from "next/cache";

const secret = process.env.DKHP_SECRET || "";
const authTokenCookieName = "auth_token";
const dkhpTokenCookieName = "dkhp_token";

export function generateToken(mssv: string, password: string, user?: User) {    
    const authToken = sign({
        mssv: mssv,
        password: Buffer.from(password).toString("base64"),
        user,
    }, secret, {
        expiresIn: "360d",
        algorithm: "HS256"
    });

    return authToken;
}

export async function setAuthCookie(
    mssv: string,
    password: string,
    token: string
) {
    const cookieStore = await cookies();
    const user = getUserFromDkhpToken(token);
    const authToken = generateToken(mssv, password, user);

    cookieStore.set(authTokenCookieName, authToken, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    });

    setDkhpTokenCookie(cookieStore, token);
}

function setDkhpTokenCookie(cookieStore: Awaited<ReturnType<typeof cookies>>, token: string) {
    cookieStore.set(dkhpTokenCookieName, token, {
        httpOnly: true,
        maxAge: 60 * 60 * 12,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    });
}

export async function getValidDkhpToken() {
    const cookieStore = await cookies();
    const dkhpToken = cookieStore.get(dkhpTokenCookieName)?.value;

    if (isDkhpTokenValid(dkhpToken)) {
        return dkhpToken;
    }

    const credentials = await getSavedCredentials();
    if (!credentials) return;

    const refreshedDkhpToken = await getToken(credentials.mssv, credentials.password);
    setDkhpTokenCookie(cookieStore, refreshedDkhpToken);

    return refreshedDkhpToken;
}

export async function getDkhpTokenStatus() {
    const dkhpToken = await getValidDkhpToken();
    const decodedToken = decode(dkhpToken || "") as JwtPayload | null;

    return {
        hasToken: isDkhpTokenValid(dkhpToken),
        expiresAt: decodedToken?.exp ? decodedToken.exp * 1000 : undefined,
        token: dkhpToken,
    };
}

function isDkhpTokenValid(dkhpToken?: string): dkhpToken is string {
    if (!dkhpToken) return false;

    const decodedToken = decode(dkhpToken) as JwtPayload | null;

    return !!decodedToken?.exp && Date.now() < decodedToken.exp * 1000;
}

function getUserFromDkhpToken(dkhpToken: string) {
    const decodedToken = decode(dkhpToken) as JwtPayload | null;

    if (!decodedToken?.user_info || typeof decodedToken.user_info !== "string") {
        return;
    }

    const cleanedInput = decodedToken.user_info.trim();
    const buffer = Buffer.from(cleanedInput, "base64");
    const decompressed = zlib.inflateSync(buffer);
    const result = JSON.parse(decompressed.toString("utf-8"));

    return result as User;
}

export function getDkhpUser(dkhpToken?: string) {
    if (!isDkhpTokenValid(dkhpToken)) return;

    return getUserFromDkhpToken(dkhpToken);
}

export async function getSavedCredentials() {
    const cookieStore = await cookies();
    const authToken = cookieStore.get(authTokenCookieName)?.value;

    if (!authToken) return;

    try {
        const payload = verify(authToken, secret, {
            algorithms: ["HS256"],
        }) as JwtPayload;

        if (
            typeof payload.mssv !== "string" ||
            typeof payload.password !== "string"
        ) {
            return;
        }

        return {
            mssv: payload.mssv,
            password: Buffer.from(payload.password, "base64").toString("utf-8"),
        };
    } catch {
        return;
    }
}

export async function getUser(authToken?: string) {
    let validAuthToken = authToken;

    if (!validAuthToken) {
        const cookieStore = await cookies();
        validAuthToken ||= cookieStore.get(authTokenCookieName)?.value;
    }

    if (!validAuthToken) return;

    try {
        const payload = verify(validAuthToken, secret, {
            algorithms: ["HS256"],
        }) as JwtPayload;

        if (payload.user && typeof payload.user === "object") {
            return payload.user as User;
        }

        if (typeof payload.mssv !== "string") return;

        return {
            sys_manguoidung: payload.mssv,
            sys_hoten: payload.mssv,
        } as User;
    } catch(err) {
        throw new Error("The token is dead!");
    }
}

export async function getToken(mssv: string, password: string) {
    return unstable_cache(async (mssv: string, password: string) => {
        if (!mssv?.trim() || !password) {
            throw new Error("MSSV hoặc mật khẩu sai");
        }
    
        mssv = mssv.trim();
    
        const warm = (o: string) =>
            fetch(o, { method: "HEAD" }).then(r => r.body?.cancel()).catch(() => {});
        warm("https://htql.ctu.edu.vn");
        warm("https://accounts.ctu.edu.vn");
        warm("https://dkmh.ctu.edu.vn");
    
        const jar = new Map<string, string>();
    
        const decode = (s: string) =>
            s.replace(/&amp;/g, "&")
                .replace(/&quot;/g, `"`)
                .replace(/&#34;/g, `"`)
                .replace(/&#039;/g, `'`)
                .replace(/&#39;/g, `'`)
                .replace(/&lt;/g, "<")
                .replace(/&gt;/g, ">");
    
        const f = async (url: string, init: RequestInit = {}) => {
            const cookie = [...jar].map(([k, v]) => `${k}=${v}`).join("; ");
    
            const res = await fetch(url, {
                ...init,
                redirect: "manual",
                headers: {
                    "User-Agent": "Mozilla/5.0 Chrome/120 Safari/537.36",
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                    "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8",
                    ...(cookie ? { Cookie: cookie } : {}),
                    ...(init.headers ?? {}),
                },
            });
    
            if (res.headers.get("Connection") == "Close") {
                throw new Error("Hệ thống không thể đăng nhập vào lúc này! (Dính Captcha)");
            }

            const h = res.headers as any;

            const setCookies: string[] =
                typeof h.getSetCookie === "function"
                    ? h.getSetCookie()
                    : res.headers.get("set-cookie")
                        ? [res.headers.get("set-cookie")!]
                        : [];
    
            for (const sc of setCookies) {
                const [pair, ...attrs] = sc.split(";");
                const i = pair.indexOf("=");
                if (i < 0) continue;
    
                const name = pair.slice(0, i).trim();
                const value = pair.slice(i + 1).trim();
                const attr = attrs.join(";").toLowerCase();
    
                if (attr.includes("max-age=0") || attr.includes("expires=thu, 01 jan 1970")) {
                    jar.delete(name);
                } else {
                    jar.set(name, value);
                }
            }
    
            return res;
        };
    
        const skip = (res: Response) => { res.body?.cancel(); return res; };
    
        const getForms = (html: string) => {
            html = html.replace(/<!--[\s\S]*?-->/g, "");
    
            return [...html.matchAll(/<form\b[^>]*>[\s\S]*?<\/form>/gi)].map(m => {
                const block = m[0];
                const formTag = block.match(/<form\b[^>]*>/i)?.[0] ?? "";
    
                const attr = (tag: string, name: string) =>
                    decode(tag.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, "i"))?.[1] ?? "");
    
                const inputs: Record<string, string> = {};
                for (const im of block.matchAll(/<input\b[^>]*>/gi)) {
                    const tag = im[0];
                    const name = attr(tag, "name");
                    if (name) inputs[name] = attr(tag, "value");
                }
    
                return {
                    name: attr(formTag, "name") || attr(formTag, "id"),
                    action: attr(formTag, "action"),
                    inputs,
                };
            }).filter(x => x.action);
        };
    
        const postForm = async (form: any, base: string, referer = base, readBody = true) => {
            const url = form.action.startsWith("http")
                ? form.action
                : new URL(form.action, base).href;
    
            const res = await f(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Origin": new URL(referer).origin,
                    "Referer": referer,
                },
                body: new URLSearchParams(form.inputs).toString(),
            });
    
            const html = readBody ? await res.text().catch(() => "") : (res.body?.cancel(), "");
            return { url, res, html };
        };

        const loc = (res: Response, base?: string) => {
            const location = res.headers.get("location");

            if (!location) throw new Error("MSSV hoặc mật khẩu sai");

            return base && !location.startsWith("http")
                ? new URL(location, base).href
                : location;
        };
    
        const form = (html: string, pick: (f: any) => boolean) => {
            const found = getForms(html).find(pick);
            if (!found) throw new Error("MSSV hoặc mật khẩu sai");
            return found;
        };
    
        const url1 = "https://htql.ctu.edu.vn/htql/detect_sso.php";
    
        let res = await f(url1);
        let url = loc(skip(res));
    
        res = await f(url, { headers: { Referer: url1 } });
        url = loc(skip(res));
    
        res = await f(url);
        skip(res);
    
        const loginUrl = url;
        const sessionDataKey = new URL(loginUrl).searchParams.get("sessionDataKey");
        if (!sessionDataKey) throw new Error("MSSV hoặc mật khẩu sai");
    
        res = await f("https://accounts.ctu.edu.vn/commonauth", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Origin": "https://accounts.ctu.edu.vn",
                "Referer": loginUrl,
            },
            body: new URLSearchParams({
                username: mssv,
                password,
                sessionDataKey,
                tocommonauth: "true",
            }).toString(),
        });
    
        url = loc(skip(res));
    
        res = await f(url, { headers: { Referer: loginUrl } });
        let html = await res.text();
    
        const samlForm1 = getForms(html).find(f => "SAMLResponse" in f.inputs);
        if (!samlForm1) throw new Error("MSSV hoặc mật khẩu sai");
    
        let posted = await postForm(samlForm1, url, url);
        html = posted.html;
        url = posted.url;
    
        const dkmhSsoForm = form(html, f =>
            f.action.includes("dkmh.ctu.edu.vn") &&
            f.action.includes("/htql/sinhvien/dang_nhap_sso.php")
        );
    
        posted = await postForm(dkmhSsoForm, url, url, false);
        res = posted.res;
    
        url = loc(res, url);
        res = await f(url, { headers: { Referer: posted.url } });
        html = await res.text();
    
        const samlForm2 = form(html, f => "SAMLResponse" in f.inputs);
    
        posted = await postForm(samlForm2, url, url);
        url = posted.url;
        html = posted.html;
    
        const hindexPath =
            html.match(/location\.href\s*=\s*["']([^"']+)["']/i)?.[1] ??
            html.match(/location\s*=\s*["']([^"']+)["']/i)?.[1];
    
        if (!hindexPath) throw new Error("MSSV hoặc mật khẩu sai");
    
        url = new URL(decode(hindexPath), posted.url).href;
        res = await f(url, { headers: { Referer: posted.url } });
        html = await res.text();
    
        const dkForm = form(html, f => f.name === "frmDuLieuDKindex");
    
        posted = await postForm(dkForm, url, url, false);
        res = posted.res;
    
        url = loc(res, url);
        res = await f(url, { headers: { Referer: posted.url } });
        url = loc(skip(res), url);
    
        res = await f(url, { headers: { Referer: posted.url } });
        html = await res.text();
    
        const samlForm3 = form(html, f => "SAMLResponse" in f.inputs);
    
        posted = await postForm(samlForm3, url, url, false);
        res = posted.res;
    
        url = loc(res, url);
        res = await f(url, { headers: { Referer: posted.url } });
        skip(res);
    
        const token = jar.get("access_token");
        if (!token) throw new Error("MSSV hoặc mật khẩu sai");
    
        return token;
    }, [], {
        revalidate: 3600,
        tags: [`user/${mssv}/${password}`]
    })(mssv, password);
}

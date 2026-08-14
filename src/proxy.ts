import { NextRequest, NextResponse } from "next/server";
import User from "./types/User";
import { getUser } from "./util/authentication";

export async function proxy(request: NextRequest) {
    let user: User | undefined;
    const authToken = request.cookies.get("auth_token")?.value;

    try {
        user = await getUser(authToken);
    } catch (err) {}

    if (request.nextUrl.pathname == "/") {
        if (user) {
            return NextResponse.rewrite(new URL('/dkhp', request.url));
        }
    }

    if (request.nextUrl.pathname == "/dkhp" || request.nextUrl.pathname == "/tkb" || request.nextUrl.pathname == "/tu-dong-dang-ky") {
        if (!user) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|logo.png|grayed.png|avatars|images|.*\\..*).*)",
    ],
};

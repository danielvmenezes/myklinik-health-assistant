import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;


    if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: "/admin/:path*",
};

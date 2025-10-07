import { NextResponse } from "next/server";

export function middleware(req) {
  const token = req.cookies.get("token")?.value || req.headers.get("authorization");

  // rotas que não precisam de login
  const publicRoutes = ["/login"];

  if (!token && !publicRoutes.includes(req.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

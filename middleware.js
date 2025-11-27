import { NextResponse } from "next/server";

export function middleware(req) {
  const token = req.cookies.get("token")?.value || null;
  const { pathname } = req.nextUrl;

  // Lista de rotas protegidas
  const protectedRoutes = [
    '/',
    '/users',
    '/users/new',
    '/tickets',
    '/tickets/new',
    '/reports'
  ];

  // Rotas públicas (não precisam de autenticação)
  const publicRoutes = [
    '/login',
    '/forgot-password',
    '/reset-password'
  ];

  // Verifica se a rota atual é protegida
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  // Verifica se a rota atual é pública
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  // Se é uma rota protegida e não tem token, redireciona para login
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Se tem token e está tentando acessar login ou forgot-password, redireciona para home
  if (token && (pathname === "/login" || pathname === "/forgot-password")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Para reset-password, permite acesso mesmo com token (usuário pode querer trocar senha)

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/users/:path*',
    '/tickets/:path*',
    '/reports/:path*',
    '/login',
    '/forgot-password',
    '/reset-password'
  ],
};

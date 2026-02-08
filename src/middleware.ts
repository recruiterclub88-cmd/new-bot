import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function isProtected(pathname: string): boolean {
  if (pathname.startsWith('/admin/dashboard')) return true;
  if (pathname.startsWith('/api/admin')) return true;
  return false;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!isProtected(pathname)) return NextResponse.next();

  const user = process.env.MY_ADMIN_USER || process.env.WEB_ADMIN_LOGIN || process.env.ADMIN_USER || 'recruiterclub88@gmail.com';
  const pass = process.env.MY_ADMIN_PASS || process.env.WEB_ADMIN_PASSWORD || process.env.ADMIN_PASS || 'Elitkamen88';

  const sessionCookie = req.cookies.get('admin_session')?.value;

  let authorized = false;

  if (sessionCookie) {
    try {
      const decoded = atob(sessionCookie);
      const [u, p] = decoded.split(':');
      if (u === user && p === pass) {
        authorized = true;
      }
    } catch (e) { }
  }

  if (authorized) return NextResponse.next();

  if (pathname.startsWith('/api/')) {
    return new NextResponse(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const url = req.nextUrl.clone();
  url.pathname = '/admin';
  return NextResponse.redirect(url);
}

export const config = { matcher: ['/admin/:path*', '/api/admin/:path*'] };

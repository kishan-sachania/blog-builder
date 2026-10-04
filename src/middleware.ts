import { NextRequest, NextResponse } from 'next/server';

const PROTECTED = ['/admin', '/studio'];

function redirectToLogin(req: NextRequest, pathname: string) {
  const url = new URL('/auth/login', req.url);
  url.searchParams.set('callbackUrl', pathname);
  const res = NextResponse.redirect(url);
  res.cookies.delete('accessToken');
  res.cookies.delete('refreshToken');
  return res;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const access = req.cookies.get('accessToken')?.value;
  const refresh = req.cookies.get('refreshToken')?.value;

  // Logged-in user away from login/register
  if ((pathname === '/auth/login' || pathname === '/auth/register') && access) {
    return NextResponse.redirect(new URL('/studio', req.url));
  }

  if (!PROTECTED.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  if (access) {
    return NextResponse.next();
  }

  if (!refresh) {
    return redirectToLogin(req, pathname);
  }

  // If access token is missing but refresh token is present, attempt refresh via internal fetch
  let setCookies: string[] = [];
  try {
    const refreshUrl = new URL('/api/auth/refresh', req.url).toString();
    const res = await fetch(refreshUrl, {
      method: 'POST',
      headers: {
        cookie: req.headers.get('cookie') || '',
      },
    });

    if (!res.ok) {
      return redirectToLogin(req, pathname);
    }

    const setCookieHeader = res.headers.get('set-cookie');
    if (setCookieHeader) {
      // Multiple set-cookie headers or comma/newline separated
      setCookies = [setCookieHeader];
    }
  } catch {
    return redirectToLogin(req, pathname);
  }

  const cookies = new Map(req.cookies.getAll().map((c) => [c.name, c.value]));
  setCookies.forEach((sc) => {
    const [name, ...v] = sc.split(';')[0].split('=');
    if (name) {
      cookies.set(name.trim(), v.join('='));
    }
  });

  const headers = new Headers(req.headers);
  headers.set('cookie', [...cookies].map(([k, v]) => `${k}=${v}`).join('; '));

  const next = NextResponse.next({ request: { headers } });
  setCookies.forEach((sc) => next.headers.append('set-cookie', sc));
  return next;
}

export const config = {
  matcher: ['/admin/:path*', '/studio/:path*', '/auth/login', '/auth/register'],
};
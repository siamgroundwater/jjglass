import { NextResponse, type NextRequest } from 'next/server';
import { languageConfig, localizedPath } from './lib/i18n';
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (pathname === `/${languageConfig.default}` || pathname.startsWith(`/${languageConfig.default}/`)) {
    return NextResponse.redirect(new URL(`${localizedPath(pathname, languageConfig.default)}${search}`, request.url), 308);
  }
  const destination = request.nextUrl.clone();
  destination.pathname = `/${languageConfig.default}${pathname === '/' ? '' : pathname}`;
  return NextResponse.rewrite(destination);
}
export const config = {
  matcher: ['/', '/th/:path*', '/products/:path*', '/wishlist', '/cart', '/checkout', '/brands', '/catalog', '/about', '/stores', '/contact', '/inspiration', '/studio']
};

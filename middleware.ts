import { NextResponse, type NextRequest } from 'next/server';
import { canUsePrivateApi } from '@/lib/app-mode.mjs';

export function middleware(request: NextRequest) {
  if (!canUsePrivateApi()) {
    return NextResponse.json(
      { success: false, error: 'Not found' },
      {
        status: 404,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};

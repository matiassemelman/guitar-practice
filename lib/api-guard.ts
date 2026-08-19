import { NextResponse } from 'next/server';
import { canUsePrivateApi } from '@/lib/app-mode.mjs';

export function rejectUnlessPrivateMode(): NextResponse | null {
  if (canUsePrivateApi()) {
    return null;
  }

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

export function withNoStore(response: NextResponse): NextResponse {
  response.headers.set('Cache-Control', 'no-store');
  return response;
}

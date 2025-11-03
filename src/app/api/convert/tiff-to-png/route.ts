// NOTE: This route is currently disabled due to Next.js webpack limitations with the 'canvas' package.
// The canvas package requires native bindings and doesn't work with Next.js bundling.
// If TIFF to PNG conversion is needed, consider:
// 1. Using a different image processing library compatible with Next.js
// 2. Moving the conversion to a separate Node.js service
// 3. Using client-side conversion with browser Canvas API

import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  return new Response(
    JSON.stringify({
      error: 'TIFF to PNG conversion is not available in this Next.js build.',
      message: 'The canvas package is not compatible with Next.js webpack bundling. Please use the /api/radar/latest endpoint instead.',
    }),
    {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    }
  );
}



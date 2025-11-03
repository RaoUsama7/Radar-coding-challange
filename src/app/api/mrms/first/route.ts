import { NextRequest, NextResponse } from 'next/server';

function ensureAbsolute(base: string, href: string): string {
  if (/^https?:\/\//i.test(href)) return href;
  const url = base.endsWith('/') ? base : base + '/';
  return url + href.replace(/^\/?/, '');
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const base = searchParams.get('base');
  if (!base) {
    return NextResponse.json({ error: 'Missing required query param: base' }, { status: 400 });
  }
  try {
    const res = await fetch(base, { cache: 'no-store' });
    if (!res.ok) {
      return NextResponse.json({ error: `Failed to list: ${base}`, status: res.status }, { status: 502 });
    }
    const html = await res.text();

    // Extract links in Apache-style index pages
    const matches = Array.from(html.matchAll(/href\s*=\s*"([^"]+)"/gi)).map(m => m[1]);
    // keep likely files (exclude parent directory and directories)
    const files = matches
      .filter(h => !h.match(/Parent Directory|\/?$/i))
      .filter(h => /\.(grib2|grb2|tif|tiff|png)(\.gz)?$/i.test(h));

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files found in directory' }, { status: 404 });
    }

    // "First" file = first link as presented in HTML
    const first = files[0];
    const absolute = ensureAbsolute(base, first);

    return NextResponse.json({ first: absolute }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to fetch directory' }, { status: 500 });
  }
}



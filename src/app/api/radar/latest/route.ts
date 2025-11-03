import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// MRMS RALA is a CONUS 1km grid. We assume approximate lat/lon bounds of CONUS mosaic.
// Bounds used here: [[24.0, -125.0], [50.0, -66.5]]
const DEFAULT_BOUNDS: [[number, number], [number, number]] = [[24, -125], [50, -66.5]];

// Candidate directories to probe for latest RALA product. We will try in order.
const CANDIDATE_SOURCES = [
  // NOAA MRMS public (Apache index pages)
  'https://mrms.ncep.noaa.gov/2D/RALA/',
  // AWS Public Dataset mirror (structure differs; may not list directly)
  'https://noaa-mrms-pds.s3.amazonaws.com/',
];

async function tryMrmsListing(base: string) {
  // Heuristic: if base ends with RALA/, read directory and find latest file ending with tif, grib2, or png
  const url = base.endsWith('/') ? base : base + '/';
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to list: ${url}`);
  const text = await res.text();
  // Very loose link extraction
  const hrefs = Array.from(text.matchAll(/href\s*=\s*"([^"]+)"/gi)).map(m => m[1]);
  const files = hrefs.filter(h => /RALA/i.test(h) || /Reflectivity/i.test(h));
  const candidates = hrefs.concat(files).filter(h => /(tif|tiff|grib2|png)(\.gz)?$/i.test(h));
  if (candidates.length === 0) throw new Error('No files found');
  // Sort descending by presence of timestamp in name
  candidates.sort((a, b) => b.localeCompare(a));
  const latest = candidates[0];
  let full = latest.startsWith('http') ? latest : url + latest.replace(/^\/?/, '');
  return full;
}

async function findLatestRalaUrl(): Promise<{ url: string; isGzip: boolean }> {
  // Try known patterns first on mrms base
  for (const base of CANDIDATE_SOURCES) {
    try {
      if (base.includes('RALA')) {
        const url = await tryMrmsListing(base);
        const isGzip = /\.gz$/i.test(url);
        return { url, isGzip };
      }
    } catch {}
  }

  // Fallback: explicit guesses for common filenames (best effort)
  const guessUrls = [
    'https://mrms.ncep.noaa.gov/data/2D/RALA/latest.tif',
    'https://mrms.ncep.noaa.gov/data/2D/RALA/latest.tif.gz',
    'https://mrms.ncep.noaa.gov/data/2D/RALA/latest.grib2.gz',
    'https://mrms.ncep.noaa.gov/data/2D/RALA/latest.png',
  ];
  for (const u of guessUrls) {
    try {
      const head = await fetch(u, { method: 'HEAD', cache: 'no-store' });
      if (head.ok) return { url: u, isGzip: /\.gz$/i.test(u) };
    } catch {}
  }
  throw new Error('Unable to locate latest MRMS RALA file');
}

export async function GET(req: NextRequest) {
  try {
    // Optional override: /api/radar/latest?base=https://mrms.ncep.noaa.gov/2D/ALASKA/BREF_1HR_MAX/
    const { searchParams } = new URL(req.url);
    const base = searchParams.get('base');

    if (base) {
      const url = await tryMrmsListing(base);
      return NextResponse.json({
        url,
        bounds: DEFAULT_BOUNDS,
        isGzip: /\.gz$/i.test(url),
      }, { headers: { 'Cache-Control': 'no-store' } });
    }

    const latest = await findLatestRalaUrl();
    return NextResponse.json({
      url: latest.url,
      bounds: DEFAULT_BOUNDS,
      isGzip: latest.isGzip,
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    return NextResponse.json({
      error: 'Failed to locate MRMS RALA product. Try again shortly.'
    }, { status: 502 });
  }
}



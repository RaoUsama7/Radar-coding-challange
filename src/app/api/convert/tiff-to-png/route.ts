import { NextRequest } from 'next/server';
import { gunzipSync } from 'fflate';
import { fromArrayBuffer } from 'geotiff';
import { createCanvas } from 'canvas';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function colorForDbz(v: number): [number, number, number, number] {
  if (!Number.isFinite(v) || v < 0) return [0, 0, 0, 0];
  const stops = [
    { v: 5, c: [4, 233, 231] },
    { v: 20, c: [1, 159, 244] },
    { v: 30, c: [3, 0, 244] },
    { v: 40, c: [2, 253, 2] },
    { v: 45, c: [1, 197, 1] },
    { v: 50, c: [0, 142, 0] },
    { v: 55, c: [253, 248, 2] },
    { v: 60, c: [229, 188, 0] },
    { v: 65, c: [253, 149, 0] },
    { v: 70, c: [253, 0, 0] },
    { v: 75, c: [153, 0, 0] }
  ] as const;
  let color: number[] = [0, 0, 0];
  for (let i = 0; i < stops.length; i++) {
    if (v <= stops[i].v) { color = stops[i].c as unknown as number[]; break; }
    if (i === stops.length - 1) color = stops[i].c as unknown as number[];
  }
  return [color[0], color[1], color[2], 220];
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');
  if (!url) {
    return new Response(JSON.stringify({ error: 'Missing url parameter' }), { status: 400 });
  }

  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return new Response(JSON.stringify({ error: `Failed to fetch: ${res.status}` }), { status: 502 });
    const ab = await res.arrayBuffer();
    const isGzip = /\.gz$/i.test(url);
    const raw = isGzip ? gunzipSync(new Uint8Array(ab)).buffer : ab;

    const tiff = await fromArrayBuffer(raw);
    const image = await tiff.getImage();
    const width = image.getWidth();
    const height = image.getHeight();
    const rasters = (await image.readRasters({ interleave: false })) as Float32Array | Uint16Array | Uint8Array | (Float32Array | Uint16Array | Uint8Array)[];

    // Determine single band
    let band: Float32Array | Uint16Array | Uint8Array;
    if (Array.isArray(rasters)) {
      band = rasters[0];
    } else {
      band = rasters;
    }

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    const img = ctx.createImageData(width, height);
    const data = img.data;
    for (let i = 0; i < band.length; i++) {
      const v = Number(band[i]);
      const [r, g, b, a] = colorForDbz(v);
      const j = i * 4;
      data[j] = r; data[j + 1] = g; data[j + 2] = b; data[j + 3] = a;
    }
    ctx.putImageData(img, 0, 0);
    const png = canvas.toBuffer('image/png');

    return new Response(png, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-store'
      }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Conversion failed' }), { status: 500 });
  }
}



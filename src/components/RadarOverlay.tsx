"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { fromArrayBuffer } from 'geotiff';
import { gunzipSync } from 'fflate';

type LatestMeta = {
  url: string;
  bounds: [[number, number], [number, number]]; // [[south, west], [north, east]]
  isGzip: boolean;
};

async function fetchLatestMeta(): Promise<LatestMeta> {
  const res = await fetch(`/api/radar/latest?ts=${Date.now()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load latest MRMS meta');
  return res.json();
}

async function fetchArrayBuffer(url: string): Promise<ArrayBuffer> {
  const bust = url.includes('?') ? `&ts=${Date.now()}` : `?ts=${Date.now()}`;
  const res = await fetch(url + bust, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch data: ${res.status}`);
  return await res.arrayBuffer();
}

export default function RadarOverlay() {
  const map = useMap();
  const overlayRef = useRef<L.ImageOverlay | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number>(0);

  const refreshIntervalMs = 2 * 60 * 1000; // ~2 minutes

  const boundsToLatLngBounds = (b: LatestMeta['bounds']) =>
    L.latLngBounds(L.latLng(b[0][0], b[0][1]), L.latLng(b[1][0], b[1][1]));

  useEffect(() => {
    let cancelled = false;

    async function loadAndRender() {
      try {
        const meta = await fetchLatestMeta();
        const arrayBuffer = await fetchArrayBuffer(meta.url);
        const raw = meta.isGzip ? gunzipSync(new Uint8Array(arrayBuffer)).buffer : arrayBuffer;

        // Attempt GeoTIFF decode; if fails, just display image as-is
        let blobUrl: string | null = null;
        try {
          const tiff = await fromArrayBuffer(raw);
          const image = await tiff.getImage();
          const width = image.getWidth();
          const height = image.getHeight();
          const rasters = (await image.readRasters({ interleave: true })) as Uint8Array | Uint16Array | Float32Array;

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('No canvas context');

          // Simple reflectivity color scale (dBZ). Adjust as needed.
          const toRGBA = (v: number) => {
            // Assume value in dBZ 0..75; NaN/noData mapped to transparent
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
            ];
            let color = [0, 0, 0];
            for (let i = 0; i < stops.length; i++) {
              if (v <= stops[i].v) { color = stops[i].c; break; }
              if (i === stops.length - 1) color = stops[i].c;
            }
            return [...color, 200];
          };

          const imgData = ctx.createImageData(width, height);
          const data = imgData.data;

          if (rasters instanceof Float32Array || rasters instanceof Uint16Array) {
            // Single-band float/uint16 assumed
            for (let i = 0; i < rasters.length; i++) {
              const [r, g, b, a] = toRGBA(Number(rasters[i]));
              const j = i * 4;
              data[j] = r; data[j + 1] = g; data[j + 2] = b; data[j + 3] = a;
            }
          } else {
            // If already RGB(A) interleaved, copy
            for (let i = 0, j = 0; i < data.length && j < rasters.length; i += 4, j += 4) {
              data[i] = rasters[j];
              data[i + 1] = rasters[j + 1] || rasters[j];
              data[i + 2] = rasters[j + 2] || rasters[j];
              data[i + 3] = rasters[j + 3] ?? 200;
            }
          }

          ctx.putImageData(imgData, 0, 0);
          blobUrl = canvas.toDataURL('image/png');
        } catch {
          // Fallback: assume the URL is a directly usable image
          blobUrl = meta.url;
        }

        if (cancelled) return;

        // Replace overlay
        const bounds = boundsToLatLngBounds(meta.bounds);
        const newOverlay = L.imageOverlay(blobUrl!, bounds, { opacity: 0.8, interactive: false, zIndex: 500 });
        if (overlayRef.current) {
          overlayRef.current.remove();
        }
        overlayRef.current = newOverlay.addTo(map);
        setLastUpdated(Date.now());
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      }
    }

    loadAndRender();
    const id = setInterval(loadAndRender, refreshIntervalMs);
    return () => { cancelled = true; clearInterval(id); };
  }, [map]);

  useEffect(() => {
    return () => {
      if (overlayRef.current) overlayRef.current.remove();
    };
  }, []);

  return null;
}



"use client";

import { useEffect, useRef, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

type RadarResponse = {
  message: string;
  imageBase64: string;
  bounds: [[number, number], [number, number]]; // [[south, west], [north, east]]
  timestamp: string;
};

async function fetchRadarData(): Promise<RadarResponse> {
  const res = await fetch(`/api/radar/latest?ts=${Date.now()}`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to load radar data: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export default function RadarOverlay() {
  const map = useMap();
  const overlayRef = useRef<L.ImageOverlay | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const refreshIntervalMs = 2 * 60 * 1000; // 2 minutes

  const boundsToLatLngBounds = (b: RadarResponse['bounds']) =>
    L.latLngBounds(L.latLng(b[0][0], b[0][1]), L.latLng(b[1][0], b[1][1]));

  // Format timestamp for display (HH:MM:SS)
  const formatTime = (date: Date | null): string => {
    if (!date) return '--:--:--';
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  useEffect(() => {
    let cancelled = false;

    async function loadAndRender() {
      try {
        console.log('Fetching radar data...');
        const data = await fetchRadarData();
        console.log('Radar data received:', {
          message: data.message,
          hasImageBase64: !!data.imageBase64,
          imageBase64Length: data.imageBase64?.length || 0,
          bounds: data.bounds,
          timestamp: data.timestamp,
        });
        
        if (cancelled) return;

        if (!data.imageBase64) {
          throw new Error('No imageBase64 data received from API');
        }

        // Convert base64 to data URI (SVG format)
        const dataUri = `data:image/svg+xml;base64,${data.imageBase64}`;
        console.log('Created data URI, length:', dataUri.length);

        // Convert bounds to Leaflet format
        const bounds = boundsToLatLngBounds(data.bounds);
        console.log('Bounds:', bounds);

        // Remove previous overlay
        if (overlayRef.current) {
          overlayRef.current.remove();
          overlayRef.current = null;
        }

        // Create and add new overlay
        console.log('Creating Leaflet image overlay...');
        const newOverlay = L.imageOverlay(dataUri, bounds, {
          opacity: 0.7,
          interactive: false,
          zIndex: 500,
        });

        overlayRef.current = newOverlay.addTo(map);
        console.log('Overlay added to map successfully');
        
        // Update timestamp
        setLastUpdated(new Date(data.timestamp));
      } catch (e) {
        console.error('Failed to load radar overlay:', e);
        if (e instanceof Error) {
          console.error('Error details:', {
            message: e.message,
            stack: e.stack,
          });
        }
        // On failure, keep current overlay as-is
      }
    }

    // Initial load
    loadAndRender();
    
    // Set up interval for auto-refresh
    const intervalId = setInterval(loadAndRender, refreshIntervalMs);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [map, refreshIntervalMs]);

  // Cleanup overlay on unmount
  useEffect(() => {
    return () => {
      if (overlayRef.current) {
        overlayRef.current.remove();
        overlayRef.current = null;
      }
    };
  }, []);

  // Create timestamp display control (only once)
  useEffect(() => {
    if (!map || containerRef.current) return;

    const TimestampControl = L.Control.extend({
      onAdd: function () {
        const div = L.DomUtil.create('div', 'radar-timestamp-control');
        div.innerHTML = `
          <div style="
            background: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 6px 12px;
            border-radius: 4px;
            font-family: system-ui, -apple-system, sans-serif;
            font-size: 12px;
            font-weight: 500;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          ">
            Last updated: <span id="radar-timestamp">${formatTime(lastUpdated)}</span>
          </div>
        `;
        L.DomEvent.disableClickPropagation(div);
        containerRef.current = div;
        return div;
      },
      onRemove: function () {
        containerRef.current = null;
      },
    });

    const timestampControl = new TimestampControl({ position: 'bottomright' });
    timestampControl.addTo(map);

    return () => {
      map.removeControl(timestampControl);
    };
  }, [map]); // Only depend on map, not lastUpdated

  // Update timestamp display when lastUpdated changes
  useEffect(() => {
    if (containerRef.current) {
      const span = containerRef.current.querySelector('#radar-timestamp');
      if (span) {
        span.textContent = formatTime(lastUpdated);
      }
    }
  }, [lastUpdated]);

  return null;
}

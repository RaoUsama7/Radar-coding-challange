"use client";

import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import dynamic from 'next/dynamic';

const RadarOverlay = dynamic(() => import('./RadarOverlay'), { ssr: false });

export default function Map() {
  return (
    <MapContainer center={[63, -160]} zoom={4} style={{ position: 'absolute', inset: 0 }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <RadarOverlay />
    </MapContainer>
  );
}



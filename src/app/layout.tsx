import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Weather Radar (MRMS RALA)',
  description: 'Live weather radar using MRMS Reflectivity at Lowest Altitude',
};

export default function RootLayout(
  { children }: { children: React.ReactNode }
) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}



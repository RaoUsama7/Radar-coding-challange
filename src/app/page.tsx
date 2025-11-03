"use client";

import dynamic from 'next/dynamic';
import styles from './page.module.css';
import { useEffect, useState } from 'react';

const Map = dynamic(() => import('../components/Map'), { ssr: false });

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1>MRMS RALA Weather Radar</h1>
        <p>Live reflectivity mosaic at lowest altitude. Updates every ~2 minutes.</p>
      </header>
      <section className={styles.mapSection}>{mounted ? <Map /> : null}</section>
      <footer className={styles.footer}>
        <span>Data source: MRMS (NOAA/NCEP)</span>
      </footer>
    </main>
  );
}



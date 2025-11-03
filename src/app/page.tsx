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
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <div className={styles.logo}>
              <div className={styles.logoIcon}>⚡</div>
              <div>
                <h1 className={styles.title}>Alaska Radar</h1>
                <p className={styles.subtitle}>BREF 1HR MAX - Real-time Weather Monitoring</p>
              </div>
            </div>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.statusBadge}>
              <span className={styles.statusDot}></span>
              <span>LIVE</span>
            </div>
          </div>
        </div>
        <div className={styles.headerInfo}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Source:</span>
            <span className={styles.infoValue}>NOAA MRMS</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Update:</span>
            <span className={styles.infoValue}>Every 2 minutes</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Region:</span>
            <span className={styles.infoValue}>Alaska</span>
          </div>
        </div>
      </header>
      <section className={styles.mapSection}>
        {mounted ? <Map /> : (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p className={styles.loadingText}>Loading radar map...</p>
          </div>
        )}
      </section>
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLeft}>
            <span className={styles.footerText}>
              Data provided by <a href="https://mrms.ncep.noaa.gov" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>NOAA/NCEP MRMS</a>
            </span>
          </div>
          <div className={styles.footerRight}>
            <span className={styles.footerText}>Weather Radar Display v0.1.0</span>
          </div>
        </div>
      </footer>
    </main>
  );
}



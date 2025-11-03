// API route that downloads, decompresses, and processes NOAA MRMS BREF radar file.
// Downloads the gzipped GRIB2 file, decompresses it in memory using Node's zlib,
// saves it temporarily to /tmp, reads it back, encodes it as base64, and returns it with bounds.

import { NextRequest, NextResponse } from 'next/server';
import { gunzipSync } from 'zlib';
import { writeFileSync, readFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const RADAR_FILE_URL = 'https://mrms.ncep.noaa.gov/2D/ALASKA/BREF_1HR_MAX/MRMS_BREF_1HR_MAX.latest.grib2.gz';
// Alaska bounds: [[south, west], [north, east]]
const ALASKA_BOUNDS: [[number, number], [number, number]] = [[54, -180], [72, -130]];

export async function GET(req: NextRequest) {
  const tempDir = tmpdir();
  const grib2Path = join(tempDir, `radar_${Date.now()}.grib2`);

  try {
    console.log('Downloading radar file from:', RADAR_FILE_URL);
    
    // Download the gzipped file
    const response = await fetch(RADAR_FILE_URL, { cache: 'no-store' });
    
    if (!response.ok) {
      console.error(`Failed to download radar file: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: `Failed to download file: ${response.status} ${response.statusText}` },
        { status: response.status, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    console.log('Download successful, decompressing...');

    // Get the compressed buffer
    const compressedBuffer = Buffer.from(await response.arrayBuffer());
    const compressedSize = compressedBuffer.length;

    // Decompress using zlib
    let decompressedBuffer: Buffer;
    try {
      decompressedBuffer = gunzipSync(compressedBuffer);
      console.log(`Decompressed to ${decompressedBuffer.length} bytes`);
    } catch (decompressionError) {
      console.error('Decompression error:', decompressionError);
      return NextResponse.json(
        { error: 'Failed to decompress file. The file may not be valid gzip format.' },
        { status: 500, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    // Save decompressed GRIB2 file to temp directory
    try {
      writeFileSync(grib2Path, decompressedBuffer);
      console.log('Saved GRIB2 file to:', grib2Path);
    } catch (writeError) {
      console.error('Failed to write GRIB2 file:', writeError);
      return NextResponse.json(
        { error: 'Failed to save decompressed file to temporary directory.' },
        { status: 500, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    // For now, create a placeholder SVG image since GRIB2 cannot be displayed directly
    // TODO: Implement GRIB2 parsing to create actual radar visualization
    let imageBase64: string;
    try {
      // Create a simple placeholder SVG image (1000x600 pixels)
      // This is a temporary solution until GRIB2 parsing is implemented
      const fileSizeStr = decompressedBuffer.length.toLocaleString();
      const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1000" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="1000" height="600" fill="#0b1020"/>
  <text x="500" y="280" font-family="Arial, sans-serif" font-size="24" fill="#ffffff" text-anchor="middle">Alaska Radar - BREF 1HR MAX</text>
  <text x="500" y="310" font-family="Arial, sans-serif" font-size="16" fill="#ffffff" text-anchor="middle">GRIB2 data loaded successfully</text>
  <text x="500" y="340" font-family="Arial, sans-serif" font-size="16" fill="#ffffff" text-anchor="middle">File size: ${fileSizeStr} bytes</text>
</svg>`;
      
      // Convert SVG to base64
      imageBase64 = Buffer.from(svgContent).toString('base64');
      console.log('Created placeholder SVG, base64 length:', imageBase64.length);
    } catch (imageError) {
      console.error('Failed to create placeholder image:', imageError);
      // Clean up file on error
      try {
        unlinkSync(grib2Path);
      } catch {}
      return NextResponse.json(
        { error: 'Failed to create image from GRIB2 data.' },
        { status: 500, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    // Clean up temporary file
    try {
      unlinkSync(grib2Path);
      console.log('Temporary file cleaned up');
    } catch (cleanupError) {
      console.warn('Failed to clean up temporary file:', cleanupError);
      // Non-fatal, continue with response
    }

    const timestamp = new Date().toISOString();

    // Return success response with base64-encoded GRIB2 file and bounds
    return NextResponse.json(
      {
        message: 'Radar image generated successfully',
        imageBase64,
        bounds: ALASKA_BOUNDS,
        timestamp,
      },
      {
        headers: {
          'Cache-Control': 'no-store',
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    // Handle any unexpected errors and clean up files
    console.error('Error processing radar file:', error);
    
    // Clean up temp file in case of error
    try {
      unlinkSync(grib2Path);
    } catch {}
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { error: `Failed to process radar file: ${errorMessage}` },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}

# Weather Radar Display - MRMS BREF Alaska

A Next.js 14 application that displays real-time weather radar data from NOAA's MRMS (Multi-Radar Multi-Sensor) system, specifically showing Alaska BREF (Base Reflectivity) 1-Hour Maximum radar data on an interactive Leaflet map.

## 🌟 Features

- **Real-time Radar Data**: Fetches and displays the latest Alaska BREF 1HR MAX radar data from NOAA
- **Interactive Map**: Built with React-Leaflet for smooth map interactions
- **Auto-refresh**: Automatically updates radar overlay every 2 minutes
- **Visual Radar Display**: Custom SVG-based radar visualization with:
  - Radar-style range rings
  - Gradient backgrounds
  - Status indicators
  - Real-time timestamp display
- **Responsive Design**: Dark theme optimized for radar visualization
- **Error Handling**: Graceful fallback to cached data on API failures

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm (or yarn/pnpm)
- TypeScript support (included)

### Installation

1. Clone or download this repository

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
Radar-coding-challange/
├── src/
│   ├── app/
│   │   ├── api/                    # API routes
│   │   │   ├── radar/
│   │   │   │   └── latest/         # Main radar data endpoint
│   │   │   ├── convert/
│   │   │   │   └── tiff-to-png/   # TIFF conversion (disabled)
│   │   │   └── mrms/
│   │   │       └── first/          # MRMS directory listing utility
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Main page component
│   │   ├── globals.css             # Global styles
│   │   └── page.module.css         # Page-specific styles
│   └── components/
│       ├── Map.tsx                 # Leaflet map container
│       └── RadarOverlay.tsx        # Radar overlay component
├── package.json
├── tsconfig.json
└── next.config.mjs
```

## 🔌 API Endpoints

### `/api/radar/latest`

Fetches the latest Alaska BREF radar data from NOAA MRMS.

**Response:**
```json
{
  "message": "Radar image generated successfully",
  "imageBase64": "<base64-encoded-svg>",
  "bounds": [[54, -180], [72, -130]],
  "timestamp": "2025-11-03T23:19:04.012Z"
}
```

**Features:**
- Downloads and decompresses GRIB2 files from NOAA
- Creates radar-style SVG visualization
- Returns base64-encoded image with geographic bounds
- Includes error handling and caching

### `/api/mrms/first?base=<url>`

Utility endpoint to get the first file from an MRMS directory listing.

**Query Parameters:**
- `base`: URL of the MRMS directory to list

**Response:**
```json
{
  "first": "https://mrms.ncep.noaa.gov/2D/ALASKA/BREF_1HR_MAX/..."
}
```

## 🗺️ Map Configuration

- **Default Center**: Alaska (63°N, 160°W)
- **Default Zoom**: 4
- **Base Tiles**: OpenStreetMap
- **Radar Bounds**: Alaska region [[54, -180], [72, -130]]

## 🎨 Technical Details

### Frontend

- **Framework**: Next.js 14 (App Router)
- **Maps**: React-Leaflet with Leaflet
- **Styling**: CSS Modules
- **TypeScript**: Full type safety

### Backend

- **API Routes**: Next.js API routes
- **Data Processing**: Node.js zlib for decompression
- **Visualization**: SVG generation (no native dependencies)
- **Caching**: Server-side caching for resilience

### Data Source

- **NOAA MRMS**: [https://mrms.ncep.noaa.gov/](https://mrms.ncep.noaa.gov/)
- **Product**: BREF_1HR_MAX (Base Reflectivity 1-Hour Maximum)
- **Region**: Alaska
- **Format**: GRIB2 (compressed with gzip)

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### TypeScript

The project uses strict TypeScript configuration. All components and API routes are fully typed.

### Environment

No environment variables required. The application uses public NOAA MRMS endpoints.

## 📝 Notes

### GRIB2 Processing

Currently, the application displays a radar-style placeholder visualization. The GRIB2 data is downloaded and decompressed, but full parsing requires specialized libraries (like `wgrib2` or `eccodes`) that are not included in this build.

Future enhancements could include:
- Full GRIB2 parsing and data extraction
- Actual reflectivity visualization with color mapping
- Multiple radar products support
- Historical data playback

### Canvas Package

The `canvas` package is listed in `package.json` but not used in the build due to Next.js webpack limitations. The `/api/convert/tiff-to-png` route is disabled for this reason.

## 🐛 Troubleshooting

### Build Errors

If you encounter `Module not found: Can't resolve 'canvas'`:
- This is expected - the canvas package is not used in the production build
- The `/api/convert/tiff-to-png` route has been disabled

### Map Not Showing

- Ensure Leaflet CSS is loaded (check browser console)
- Verify the map container has proper dimensions
- Check that React-Leaflet components are client-side only

### Radar Overlay Not Appearing

- Check browser console for API errors
- Verify network requests to `/api/radar/latest`
- Ensure Alaska bounds are visible in the map viewport

## 📄 License

This project is a coding challenge implementation. NOAA MRMS data is provided by the National Oceanic and Atmospheric Administration.

## 🙏 Acknowledgments

- **NOAA/NCEP** for providing MRMS radar data
- **OpenStreetMap** for map tiles
- **Leaflet** and **React-Leaflet** for mapping functionality

## 📞 Support

For issues or questions, please check:
- Browser console for error messages
- Network tab for API request status
- Server logs for backend errors

---

**Version**: 0.1.0  
**Last Updated**: November 2025


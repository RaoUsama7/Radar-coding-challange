/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mrms.ncep.noaa.gov'
      },
      {
        protocol: 'https',
        hostname: 'noaa-mrms-pds.s3.amazonaws.com'
      }
    ]
  }
};

export default nextConfig;



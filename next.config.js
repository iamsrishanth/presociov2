/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow JSON2VIDEO and Zernio CDN domains for video/image fetching
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'assets.json2video.com' },
    ],
  },
};

module.exports = nextConfig;

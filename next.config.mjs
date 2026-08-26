/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async rewrites() {
    return [
      { source: '/', destination: '/site.html' },
      { source: '/index.html', destination: '/site.html' },
    ];
  },
};

export default nextConfig;

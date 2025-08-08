/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'production' ? 'https://m4a-to-notes.productivity-tools.workers.dev/api/:path*' : 'http://localhost:8787/api/:path*',
      },
    ];
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // Frontend-specific API routes (handled by Next.js)
      // These routes should NOT be proxied to the Worker:
      // - /api/webhook (Paddle webhooks)
      // - /api/me/* (User-specific endpoints)
      
      // Proxy other API routes to Worker
      {
        source: '/api/transcribe',
        destination: process.env.NODE_ENV === 'production' ? 'https://m4a-to-notes.productivity-tools.workers.dev/api/transcribe' : 'http://localhost:8787/api/transcribe',
      },
      {
        source: '/api/uploads',
        destination: process.env.NODE_ENV === 'production' ? 'https://m4a-to-notes.productivity-tools.workers.dev/api/uploads' : 'http://localhost:8787/api/uploads',
      },
      {
        source: '/api/jobs',
        destination: process.env.NODE_ENV === 'production' ? 'https://m4a-to-notes.productivity-tools.workers.dev/api/jobs' : 'http://localhost:8787/api/jobs',
      },
      {
        source: '/api/jobs/',
        destination: process.env.NODE_ENV === 'production' ? 'https://m4a-to-notes.productivity-tools.workers.dev/api/jobs' : 'http://localhost:8787/api/jobs',
      },
      {
        source: '/api/jobs/:path*',
        destination: process.env.NODE_ENV === 'production' ? 'https://m4a-to-notes.productivity-tools.workers.dev/api/jobs/:path*' : 'http://localhost:8787/api/jobs/:path*',
      },
      {
        source: '/api/transcripts/:path*',
        destination: process.env.NODE_ENV === 'production' ? 'https://m4a-to-notes.productivity-tools.workers.dev/api/transcripts/:path*' : 'http://localhost:8787/api/transcripts/:path*',
      },
      {
        source: '/api/health',
        destination: process.env.NODE_ENV === 'production' ? 'https://m4a-to-notes.productivity-tools.workers.dev/api/health' : 'http://localhost:8787/api/health',
      },
      {
        source: '/api/debug/:path*',
        destination: process.env.NODE_ENV === 'production' ? 'https://m4a-to-notes.productivity-tools.workers.dev/api/debug/:path*' : 'http://localhost:8787/api/debug/:path*',
      },
      // Internal entitlements endpoints (for server-side calls)
      {
        source: '/api/entitlements/:path*',
        destination: process.env.NODE_ENV === 'production' ? 'https://m4a-to-notes.productivity-tools.workers.dev/api/entitlements/:path*' : 'http://localhost:8787/api/entitlements/:path*',
      },
      // Paddle subscription management endpoints
      {
        source: '/api/paddle/:path*',
        destination: process.env.NODE_ENV === 'production' ? 'https://m4a-to-notes.productivity-tools.workers.dev/api/paddle/:path*' : 'http://localhost:8787/api/paddle/:path*',
      },
      {
        source: '/ingest/static/:path*',
        destination: 'https://eu-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/ingest/:path*',
        destination: 'https://eu.i.posthog.com/:path*',
      },
    ];
  },
  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
};

export default nextConfig;

/** @type {import('next').NextConfig} */

// Clean environment-based configuration
const WORKER_BASE =
	process.env.NODE_ENV === "production"
		? "https://m4a-to-notes.productivity-tools.workers.dev/api"
		: "http://localhost:8787/api";

const nextConfig = {
	async rewrites() {
		return [
			// PostHog analytics proxying
			{
				source: "/ingest/static/:path*",
				destination: "https://eu-assets.i.posthog.com/static/:path*",
			},
			{
				source: "/ingest/:path*",
				destination: "https://eu.i.posthog.com/:path*",
			},

			// Worker API proxying - consolidated and clean
			// Local routes (/api/me/*, /api/webhook, /api/validate-purchase) handled by Next.js

			// Exact matches
			{
				source: "/api/upload-and-process",
				destination: `${WORKER_BASE}/upload-and-process`,
			},
			{ source: "/api/health", destination: `${WORKER_BASE}/health` },

			// Path matches
			{
				source: "/api/transcriptions/:path*",
				destination: `${WORKER_BASE}/transcriptions/:path*`,
			},
			{
				source: "/api/debug/:path*",
				destination: `${WORKER_BASE}/debug/:path*`,
			},
			{
				source: "/api/entitlements/:path*",
				destination: `${WORKER_BASE}/entitlements/:path*`,
			},
			{
				source: "/api/paddle/:path*",
				destination: `${WORKER_BASE}/paddle/:path*`,
			},
		];
	},
	skipTrailingSlashRedirect: true,
};

export default nextConfig;

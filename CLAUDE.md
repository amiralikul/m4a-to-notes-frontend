# CLAUDE.md



This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Available Commands

- `npm run dev` - Start development server with Turbopack (runs on http://localhost:3000)
- `npm run build` - Build production version
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Architecture Overview

**AudioScribe** is a Next.js 15 application for M4A audio file transcription using AI. The app uses the App Router architecture.

### Key Technologies
- **Frontend**: Next.js 15 with React 19, Tailwind CSS, shadcn/ui components
- **Authentication**: Clerk (@clerk/nextjs)
- **Payments**: Paddle billing system with React SDK
- **File Storage**: Cloudflare R2 (via presigned URLs)
- **Backend**: External API (Cloudflare Workers) proxied through Next.js rewrites

### API Architecture
The frontend proxies all `/api/*` requests to an external backend:
- **Development**: `http://localhost:8787/api/*`
- **Production**: `https://m4a-to-notes.productivity-tools.workers.dev/api/*`

This configuration is in `next.config.mjs` using rewrites.

### Core Components

#### FileUpload (`src/components/file-upload.jsx`)
Multi-step upload and transcription component:
1. Gets presigned upload URL from `/api/uploads`
2. Uploads file directly to R2 storage
3. Creates transcription job via `/api/jobs`
4. Polls job status every 2 seconds until completion
5. Downloads transcript from `/api/transcripts/{jobId}`

#### Authentication Setup (`src/app/layout.js`)
- Wraps app in ClerkProvider for authentication
- Header shows SignIn/SignUp buttons when signed out, UserButton when signed in
- Protected by Clerk middleware (`src/middleware.js`)

#### Paddle Integration
- `PaddleProvider` wraps app for payment processing
- `PaddleCheckout` component handles subscription purchases
- Pricing plans configured in `src/lib/pricing.js`
- Webhook handler at `/api/webhook/route.js` (signature verification currently disabled)

### File Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── api/webhook/        # Paddle webhook handler
│   ├── checkout/success/   # Post-payment success page
│   ├── demo/               # Demo page
│   └── layout.js           # Root layout with providers
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── file-upload.jsx     # Main upload component
│   ├── paddle-checkout.jsx # Payment checkout component
│   └── paddle-provider.jsx # Paddle context provider
├── lib/
│   ├── pricing.js          # Pricing plans configuration
│   └── utils.js            # Utility functions
└── middleware.js           # Clerk authentication middleware
```

### Key Features
- Drag-and-drop M4A file upload with 25MB limit
- Real-time transcription progress with polling
- Clerk authentication with modal sign-in/sign-up
- Paddle subscription billing (Free, Pro $19/mo, Business $49/mo)
- Download transcriptions as text files
- Responsive design with Tailwind CSS

### Environment Variables Expected
- `NEXT_PUBLIC_PADDLE_ENV` - Paddle environment (sandbox/production)
- `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` - Paddle client token
- `PADDLE_NOTIFICATION_WEBHOOK_SECRET` - Paddle webhook secret (optional)
- Clerk environment variables (handled by Clerk)

### Development Notes
- Uses Turbopack for faster dev builds (`--turbopack` flag)
- All API calls go through Next.js proxy to external backend
- File uploads bypass Next.js and go directly to R2 storage
- Job polling runs client-side with 10-minute timeout
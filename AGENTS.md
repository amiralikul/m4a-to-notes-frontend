# Agent Guidelines for AudioScribe

## Build/Lint/Test Commands
- `npm run dev` - Start development server with Turbopack (http://localhost:3000)
- `npm run build` - Build production version  
- `npm run lint` - Run ESLint linting
- No test framework configured - check with user before adding tests

## Code Style & Conventions
- **Framework**: Next.js 15 with App Router, React 19, TypeScript (strict: false)
- **Imports**: Use `@/` alias for src/ directory, absolute imports preferred
- **Components**: Use shadcn/ui components, follow existing patterns in components/ui/
- **Styling**: Tailwind CSS with consistent class ordering, use cn() utility for conditional classes
- **Types**: Mixed .tsx/.jsx files, TypeScript not strictly enforced but preferred for new code
- **Naming**: camelCase for variables/functions, PascalCase for components, kebab-case for files
- **State**: React hooks (useState, useCallback, useRef), no external state management
- **Error Handling**: Try-catch with user-friendly error messages, console.error for debugging
- **Auth**: Clerk provider integration, use authentication context throughout app
- **Payments**: Paddle integration with React SDK, follow existing checkout patterns

## Architecture Notes  
- API calls proxy to external backend via next.config.mjs rewrites
- File uploads go directly to R2 storage using presigned URLs
- Real-time updates via polling (not WebSocket)
- Responsive design with mobile-first approach using Tailwind breakpoints
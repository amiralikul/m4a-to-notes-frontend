/**
 * API configuration for internal server-side calls
 * Uses the same environment-based routing as Next.js rewrites
 */
export const API_CONFIG = {
  // Base URL for the backend Worker API
  WORKER_BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://m4a-to-notes.productivity-tools.workers.dev/api'
    : 'http://localhost:8787/api',
    
  // Internal API secret for server-to-server communication
  INTERNAL_SECRET: process.env.INTERNAL_API_SECRET,
  
  // Default headers for internal API calls
  getInternalHeaders() {
    return {
      'Content-Type': 'application/json',
      'X-Internal-Secret': this.INTERNAL_SECRET
    };
  },
  
  // Helper method to build Worker API URLs
  getWorkerUrl(endpoint) {
    return `${this.WORKER_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  }
};
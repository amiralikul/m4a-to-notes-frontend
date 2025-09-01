/**
 * Simple API configuration - matches next.config.mjs setup
 */

const WORKER_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://m4a-to-notes.productivity-tools.workers.dev/api'
  : 'http://localhost:8787/api';

export const API_CONFIG = {
  WORKER_BASE_URL: WORKER_BASE,
  INTERNAL_SECRET: process.env.INTERNAL_API_SECRET,
  
  getInternalHeaders() {
    return {
      'Content-Type': 'application/json',
      'X-Internal-Secret': this.INTERNAL_SECRET
    };
  },
  
  getWorkerUrl(endpoint) {
    return `${WORKER_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  }
};
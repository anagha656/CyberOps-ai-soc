# CyberOps frontend

React + TypeScript + Vite dashboard for the existing CyberOps FastAPI backend.

## Local development

```bash
npm install
npm run dev
```

The app reads `VITE_API_BASE_URL` (default: `https://cyberops-ai-soc.onrender.com`).

## Render Static Site

- Root directory: `frontend`
- Build command: `npm install && npm run build`
- Publish directory: `dist`
- Environment variable: `VITE_API_BASE_URL=https://cyberops-ai-soc.onrender.com`

SPA routing is handled by `public/_redirects`.

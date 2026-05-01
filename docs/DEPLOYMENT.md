# Deployment

The frontend and backend can be deployed separately.

## Recommended MVP Setup

- Frontend: Vercel, Netlify, Cloudflare Pages, or any static host.
- Backend: Render, Railway, Fly.io, Google Cloud Run, or any Node host.
- Storage: Cloudinary free tier for temporary image processing.

## Backend Environment

Set these on the backend host:

```bash
NODE_ENV=production
PORT=3000
CLIENT_ORIGIN=https://your-frontend-domain.com
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLOUDINARY_UPLOAD_FOLDER=streetfood-ai/uploads
GEMINI_MODEL=gemini-2.5-flash
GEMINI_API_KEY_1=...
GEMINI_API_KEY_2=...
GEMINI_API_KEY_3=...
GEMINI_API_KEY_4=...
MAX_UPLOAD_MB=10
MAX_GEMINI_RETRIES=4
```

Start command:

```bash
npm run start
```

## Frontend Environment

Set this on the frontend host:

```bash
VITE_API_URL=https://your-api-domain.com
```

Build command:

```bash
npm run build
```

Publish directory:

```text
dist
```

## Notes

- Do not commit `.env`.
- API keys must stay backend-only. Never create `VITE_GEMINI_*` variables.
- The current MVP does not need MongoDB.
- Database/storage limits are low-risk because analysis history is disabled and Cloudinary uploads are deleted after each request.
- If uploads remain in Cloudinary after an API crash, they will be in `CLOUDINARY_UPLOAD_FOLDER`; clean that folder from the Cloudinary dashboard or add a scheduled cleanup before production scale.

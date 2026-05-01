# Deployment

The frontend and backend can be deployed together on Vercel, or separately if needed.

## Recommended MVP Setup

- Frontend: Vercel static build from `dist`.
- Backend: Vercel Functions from the `api/` directory.
- Storage: Cloudinary free tier for temporary image processing.

This repo includes `vercel.json` with the Vite build command, `dist` output directory, and a 60-second function limit for image analysis.

## Vercel Environment

Set these in the Vercel project environment variables:

```bash
NODE_ENV=production
CLIENT_ORIGIN=https://your-project.vercel.app
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLOUDINARY_UPLOAD_FOLDER=streetfood-ai/uploads
GEMINI_MODEL=gemini-2.5-flash
GEMINI_API_KEY_1=...
GEMINI_API_KEY_2=...
GEMINI_API_KEY_3=...
GEMINI_API_KEY_4=...
MAX_UPLOAD_MB=4
MAX_GEMINI_RETRIES=4
```

For Vercel Functions, keep `MAX_UPLOAD_MB` at `4` or lower. The frontend resizes large mobile photos before upload so requests stay under the platform payload limit.

If frontend and API are deployed in the same Vercel project, do not set `VITE_API_URL`; the app will call `/api` on the current domain. If the API is hosted somewhere else, set:

```bash
VITE_API_URL=https://your-api-domain.com
```

## Deploy

From GitHub, import the repository in Vercel and set the environment variables above.

From CLI:

```bash
vercel
vercel --prod
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

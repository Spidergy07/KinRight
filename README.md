# Wai Korn

Wai Korn is a mobile-first MVP for travelers ordering Thai street food. Users set allergy/dietary preferences, upload or capture a food/menu photo, get a Gemini analysis, then generate Thai text and audio they can show to a vendor.

## Current Scope

- React + Vite + Tailwind frontend
- Express API for image analysis
- Gemini key rotation with `GEMINI_API_KEY_1` to `GEMINI_API_KEY_4`
- Temporary Cloudinary upload for image processing
- No database and no history storage in the MVP
- Uploaded images are deleted from Cloudinary after each analysis request finishes

## Requirements

- Node.js `>=20.19.0`
- npm
- Cloudinary account
- Gemini API key(s)

## Setup

```bash
npm install
cp .env.example .env
```

Fill `.env` with Cloudinary and Gemini credentials. Keep `.env` local only.

Run the API:

```bash
npm run dev:api
```

Run the web app in another terminal:

```bash
npm run dev
```

Open `http://localhost:5173`.

## Test On Phone

Make sure your phone and laptop are on the same Wi-Fi.

```bash
ipconfig getifaddr en0
npm run dev:api
npm run dev
```

Open `http://YOUR_LAN_IP:5173` on the phone. The frontend rewrites a localhost API URL to the same LAN host automatically for development.

## Useful Scripts

- `npm run dev` starts the Vite frontend on all network interfaces.
- `npm run dev:api` starts the API with Node watch mode.
- `npm run start` starts the API for production-style runtime.
- `npm run build` creates the frontend production build.
- `npm run check` builds the frontend and syntax-checks backend files.
- `npm run test:api` checks the API health and ephemeral history endpoints. The API must already be running.

## Environment Variables

| Name | Required | Notes |
| --- | --- | --- |
| `PORT` | No | API port. Defaults to `3000`. |
| `CLIENT_ORIGIN` | Yes in deploy | Comma-separated allowed frontend origins for CORS. |
| `VITE_API_URL` | Yes | Frontend API base URL. Use the deployed API URL in production. |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud name. |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key. |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret. Backend only. |
| `CLOUDINARY_UPLOAD_FOLDER` | No | Defaults to `streetfood-ai/uploads`. Cloudinary creates it automatically on first upload. |
| `GEMINI_MODEL` | No | Defaults to `gemini-2.5-flash`. |
| `GEMINI_API_KEY_1..4` | Yes | Add up to 4 keys for failover rotation. |
| `MAX_UPLOAD_MB` | No | Defaults to `10`. |
| `MAX_GEMINI_RETRIES` | No | Defaults to `4`, capped by available keys. |

## Project Structure

```text
App.jsx                     # Main React app
src/index.css               # Tailwind layers and shared UI utilities
server/index.js             # Express app and CORS
server/routes/analysis.js   # Upload/analyze endpoints
server/services/gemini.js   # Gemini request + key rotation
server/services/cloudinaryUpload.js
server/config/env.js
docs/                       # API, architecture, and deployment notes
```

Local screenshots and test uploads in the repo root are ignored. Put committed app assets under `src/assets/`.

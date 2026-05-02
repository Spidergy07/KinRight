# KinRight (กิน-ไร้ท์)

KinRight is a mobile-first MVP for travelers ordering Thai street food. The name plays on "Eat Right" and "กินไรดี": eat correctly, safely, and to your taste.

> 🚀 **This project is a proud submission for the SuperAI Engineer Season 6 Hackathon.**

## Current Scope

- React + Vite + Tailwind frontend
- Express API for image analysis, deployable as Vercel Functions
- Gemini key rotation with `GEMINI_API_KEY_1` to `GEMINI_API_KEY_5`
- Temporary Cloudinary upload for image processing
- No database and no history storage in the MVP
- Committed app images live in `src/assets/images/`; private test uploads live in ignored `local-images/`
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
| `VITE_API_URL` | Local dev | Frontend API base URL. Leave unset on same-project Vercel deploys so the app uses the current origin. |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud name. |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key. |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret. Backend only. |
| `CLOUDINARY_UPLOAD_FOLDER` | No | Defaults to `kinright/uploads`. Cloudinary creates it automatically on first upload. |
| `GEMINI_MODEL` | No | Defaults to `gemini-2.5-flash-lite` for the Gemini free-tier model used by this MVP. |
| `GEMINI_TTS_MODEL` | No | Defaults to `gemini-3.1-flash-tts-preview` for generated Thai order audio. |
| `GEMINI_TTS_VOICE` | No | Defaults to `Kore`. Used by Gemini TTS. |
| `GEMINI_API_KEY_1..5` | Yes | Add up to 5 keys for failover rotation. |
| `MAX_UPLOAD_MB` | No | Defaults to `4` to stay under Vercel Function upload limits. |
| `MAX_GEMINI_RETRIES` | No | Defaults to `1`, capped by available keys. Keep this low so one scan does not burn every key. |

## Project Structure

```text
App.jsx                       # Main React app
src/index.css                 # Tailwind layers and shared UI utilities
src/assets/images/            # Committed production image assets
local-images/                 # Ignored local screenshots and test uploads
api/                          # Vercel Function entrypoints
server/app.js                 # Express app and CORS
server/index.js               # Local API server listener
server/routes/analysis.js     # Upload/analyze endpoints
server/routes/tts.js          # Generated Thai order audio endpoint
server/services/gemini.js     # Gemini request + key rotation
server/services/cloudinaryUpload.js
server/config/env.js
docs/                         # API, architecture, and deployment notes
```

Local screenshots and test uploads are ignored under `local-images/`. Put committed app assets under `src/assets/images/`.

## Team members
* [**600284 ธนเดช**](https://github.com/Spidergy07) - The Scamper
* [**600515 ดนัยเดช**](https://github.com/nungsorb) - The Scamper
* [**602539 ภูรินทร์**](https://github.com/2005fpp) - KidDee
* [**605069 รชา**](https://github.com/FighterPaul) - KidDee
* [**606156 อดิสรณ์**](https://github.com/DarkTouiZ) - Machima

# Architecture

## Runtime Flow

1. The traveler sets allergies, dietary needs, and spice tolerance in the React app.
2. The traveler uploads or captures an image.
3. The frontend sends `multipart/form-data` to `POST /api/analyze`.
4. The API uploads the image to Cloudinary as temporary processing storage.
5. The API sends the original image buffer and profile to Gemini.
6. The API returns normalized JSON to the frontend.
7. The API deletes the Cloudinary image in a `finally` block.
8. The frontend displays risk flags, suggested dish, Thai order text, and Thai speech synthesis.

## Data Retention

This MVP is intentionally ephemeral.

- No MongoDB connection.
- No server-side history.
- No returned public image URL.
- Temporary Cloudinary upload is deleted after the request.
- Frontend order history is disabled.

If future versions need history, add it behind an explicit retention setting and document the privacy behavior before storing user images.

## Key Modules

- `server/app.js`: Express app, CORS, health endpoint, error handler.
- `server/index.js`: local Node listener for development and non-Vercel Node hosting.
- `api/`: Vercel Function entrypoints that reuse the Express app.
- `server/config/env.js`: environment parsing and non-secret config status.
- `server/routes/analysis.js`: upload validation, analysis response shape, cleanup.
- `server/services/cloudinaryUpload.js`: upload/delete helpers.
- `server/services/gemini.js`: prompt, request, JSON parsing, and key rotation.
- `App.jsx`: mobile-first traveler workflow.

## Gemini Key Rotation

`server/services/gemini.js` reads up to 4 keys from `GEMINI_API_KEY_1` to `GEMINI_API_KEY_4`.

The API rotates to another key on retryable statuses such as auth/quota/server errors. This is for failover and small demo continuity, not for bypassing provider limits.

## CORS

In development, private LAN origins are allowed so a phone can reach the laptop API. In production, set `CLIENT_ORIGIN` to the deployed frontend URL.

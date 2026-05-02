# API

Base URL in local development: `http://localhost:3000`.

## `GET /api/health`

Returns service and config status without exposing secrets.

```json
{
  "ok": true,
  "service": "kinright-api",
  "config": {
    "analysisHistory": false,
    "imageRetention": "deleted-after-analysis",
    "cloudinary": true,
    "geminiKeys": 4,
    "maxUploadMb": 4
  }
}
```

## `POST /api/analyze`

Analyzes a food, menu, or street stall image.

Request type: `multipart/form-data`

Fields:

- `image`: required image file.
- `profile`: optional JSON string with allergies, dietary preferences, and a free-text `instructions` field. The instruction is treated as the traveler safety prompt for the analysis.

Example:

```bash
curl -X POST http://localhost:3000/api/analyze \
  -F "image=@/path/to/photo.jpg" \
  -F 'profile={"allergies":{"peanut":true},"dietary":{"halal":true},"instructions":"แพ้กุ้ง และ ถั่ว กินเผ็ดไม่มาก"}'
```

Response:

```json
{
  "id": null,
  "imageUrl": null,
  "analysis": {
    "dishId": "padthai",
    "dishName": "Pad Thai",
    "thaiName": "ผัดไทย",
    "confidence": 0.91,
    "detectedText": [],
    "likelyIngredients": ["rice noodles", "egg", "peanut"],
    "allergyRisks": [
      {
        "name": "peanut",
        "confidence": 0.8,
        "reason": "Pad Thai commonly includes crushed peanuts."
      }
    ],
    "dietaryRisks": [],
    "suggestedQuestions": ["Does this contain peanuts?"],
    "thaiOrderSuggestion": "เอาผัดไทย ไม่ใส่ถั่ว",
    "englishSummary": "Pad Thai with possible peanut risk.",
    "safeToOrder": false
  },
  "meta": {
    "ephemeral": true,
    "storage": "cloudinary-auto-deleted",
    "model": "gemini-2.5-flash-lite",
    "geminiKeyIndex": 1,
    "geminiAttempts": 1
  }
}
```

The MVP does not persist analysis records. `id` and `imageUrl` are intentionally `null`.

## `POST /api/tts`

Generates Thai order audio from text using Gemini TTS.

Request type: `application/json`

Fields:

- `text`: required Thai order text, 300 characters or fewer.

Example:

```bash
curl -X POST http://localhost:3000/api/tts \
  -H "Content-Type: application/json" \
  -d '{"text":"เอาก๋วยเตี๋ยว บะหมี่ น้ำใส ไก่"}' \
  --output order.wav
```

Response:

- Content type: `audio/wav`
- Body: generated WAV audio.

The audio is generated on demand and is not stored by the API.

## `GET /api/analyses`

Compatibility endpoint. Returns an empty list because history is disabled.

```json
{
  "items": [],
  "ephemeral": true,
  "message": "Analysis history is disabled. Uploaded images are deleted after each request."
}
```

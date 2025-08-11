## WhatsApp Cloud API Starter (Node.js)

Minimal Express server for WhatsApp Cloud API: inbound webhook, verification, and outbound send.

### Prerequisites
- Node.js 18+ (tested on Node 22)
- A Meta (Facebook) app with WhatsApp set up
- WhatsApp Cloud API credentials:
  - Phone number ID
  - Permanent access token
  - A verify token (your arbitrary secret used for webhook verification)

### Setup
1. Clone or copy this folder.
2. Create `.env` from example:
   ```bash
   cp .env.example .env
   # Fill in values
   ```
3. Install dependencies (already done if generated here):
   ```bash
   npm install
   ```
4. Run:
   ```bash
   npm run dev
   # or
   npm start
   ```

### Endpoints
- GET `/health` — readiness info
- GET `/webhook` — webhook verification
  - Meta will call with `hub.mode`, `hub.verify_token`, and `hub.challenge`.
  - If `hub.verify_token` matches `META_WHATSAPP_VERIFY_TOKEN`, the server echoes the challenge.
- POST `/webhook` — receives messages
  - Echoes back text: "You said: <message>"
- POST `/send` — send a text message
  - Body: `{ "to": "15551234567", "body": "Hello!" }`

### Notes
- Expose your server publicly (e.g., with ngrok) to register the webhook in the Meta app dashboard.
- Base URL used: `https://graph.facebook.com/v20.0`.
- Phone numbers must be E.164 without plus, e.g., `15551234567`.
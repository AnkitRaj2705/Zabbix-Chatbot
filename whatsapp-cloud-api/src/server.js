require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const serverPort = parseInt(process.env.PORT || '3000', 10);
const metaAccessToken = process.env.META_WHATSAPP_TOKEN || '';
const phoneNumberId = process.env.META_WHATSAPP_PHONE_NUMBER_ID || '';
const verifyToken = process.env.META_WHATSAPP_VERIFY_TOKEN || '';

function getReadiness() {
  return {
    hasAccessToken: Boolean(metaAccessToken),
    hasPhoneNumberId: Boolean(phoneNumberId),
    hasVerifyToken: Boolean(verifyToken),
  };
}

function createAxiosClient() {
  const client = axios.create({
    baseURL: 'https://graph.facebook.com/v20.0',
    headers: {
      Authorization: `Bearer ${metaAccessToken}`,
      'Content-Type': 'application/json',
    },
    timeout: 20_000,
  });
  return client;
}

async function sendTextMessage(recipientPhoneE164, messageBody) {
  if (!metaAccessToken || !phoneNumberId) {
    const errorMessage = 'Missing META_WHATSAPP_TOKEN or META_WHATSAPP_PHONE_NUMBER_ID';
    throw new Error(errorMessage);
  }

  const http = createAxiosClient();
  const payload = {
    messaging_product: 'whatsapp',
    to: recipientPhoneE164,
    type: 'text',
    text: { body: messageBody },
  };

  const { data } = await http.post(`/${phoneNumberId}/messages`, payload);
  return data;
}

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', port: serverPort, readiness: getReadiness() });
});

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === verifyToken) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

app.post('/webhook', async (req, res) => {
  try {
    const update = req.body;

    if (update.object !== 'whatsapp_business_account') {
      return res.sendStatus(200);
    }

    const entries = update.entry || [];
    for (const entry of entries) {
      const changes = entry.changes || [];
      for (const change of changes) {
        const value = change.value || {};
        const messages = value.messages || [];
        for (const message of messages) {
          const from = message.from; // E.164 without plus e.g. 15551234567
          const type = message.type;

          if (type === 'text' && message.text && message.text.body) {
            const userText = message.text.body;
            const reply = `You said: ${userText}`;
            try {
              await sendTextMessage(from, reply);
            } catch (innerError) {
              console.error('Failed to send reply:', innerError?.response?.data || innerError.message);
            }
          }
        }
      }
    }

    return res.sendStatus(200);
  } catch (error) {
    console.error('Webhook processing error:', error?.response?.data || error.message);
    return res.sendStatus(200);
  }
});

app.post('/send', async (req, res) => {
  try {
    const { to, body } = req.body || {};
    if (!to || !body) {
      return res.status(400).json({ error: 'Missing required fields: to, body' });
    }

    const result = await sendTextMessage(to, body);
    return res.status(200).json({ success: true, result });
  } catch (error) {
    const details = error?.response?.data || { message: error.message };
    return res.status(500).json({ success: false, error: details });
  }
});

app.listen(serverPort, () => {
  const readiness = getReadiness();
  if (!readiness.hasAccessToken || !readiness.hasPhoneNumberId || !readiness.hasVerifyToken) {
    console.warn('Server started with missing environment variables. Readiness:', readiness);
  }
  console.log(`WhatsApp server listening on http://localhost:${serverPort}`);
});
import "server-only";
import crypto from "node:crypto";

const channelSecret = process.env.LINE_CHANNEL_SECRET;
const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;

export type LineWebhookEvent = {
  type: string;
  replyToken?: string;
  message?: {
    id: string;
    type: string;
    text?: string;
  };
  source?: {
    type: string;
    userId?: string;
  };
};

export type LineWebhookBody = {
  destination: string;
  events: LineWebhookEvent[];
};

// Verifies the `x-line-signature` header against the raw request body.
// Must run on the raw (unparsed) body — HMAC is computed over the exact bytes LINE sent.
export function verifyLineSignature(rawBody: string, signature: string | null): boolean {
  if (!channelSecret || !signature) return false;

  const expected = crypto
    .createHmac("sha256", channelSecret)
    .update(rawBody)
    .digest("base64");

  const expectedBuf = Buffer.from(expected);
  const signatureBuf = Buffer.from(signature);
  if (expectedBuf.length !== signatureBuf.length) return false;

  return crypto.timingSafeEqual(expectedBuf, signatureBuf);
}

export async function replyMessage(replyToken: string, text: string): Promise<void> {
  if (!channelAccessToken) {
    throw new Error("Missing LINE_CHANNEL_ACCESS_TOKEN env var");
  }

  const res = await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${channelAccessToken}`,
    },
    body: JSON.stringify({
      replyToken,
      messages: [{ type: "text", text }],
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`LINE reply API failed: ${res.status} ${errorBody}`);
  }
}

export async function pushMessage(to: string, text: string): Promise<void> {
  if (!channelAccessToken) {
    throw new Error("Missing LINE_CHANNEL_ACCESS_TOKEN env var");
  }

  const res = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${channelAccessToken}`,
    },
    body: JSON.stringify({
      to,
      messages: [{ type: "text", text }],
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`LINE push API failed: ${res.status} ${errorBody}`);
  }
}

export async function broadcastMessage(text: string): Promise<void> {
  if (!channelAccessToken) {
    throw new Error("Missing LINE_CHANNEL_ACCESS_TOKEN env var");
  }

  const res = await fetch("https://api.line.me/v2/bot/message/broadcast", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${channelAccessToken}`,
    },
    body: JSON.stringify({
      messages: [{ type: "text", text }],
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`LINE broadcast API failed: ${res.status} ${errorBody}`);
  }
}

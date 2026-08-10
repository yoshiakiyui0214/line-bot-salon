import { verifyLineSignature, replyMessage, pushMessage, type LineWebhookBody } from "@/lib/line";
import { answerFaqQuestion } from "@/lib/claude";
import { getActiveFaqs } from "@/lib/supabase/faq";
import { logConversation } from "@/lib/supabase/conversations";

const ownerUserIds = (process.env.LINE_OWNER_USER_ID ?? "")
  .split(",")
  .map((id) => id.trim())
  .filter(Boolean);

async function notifyOwnersOfLowConfidence(
  question: string,
  answer: string,
  askerUserId: string | undefined
): Promise<void> {
  if (ownerUserIds.length === 0) return;

  const text = [
    "【確信度: 低】お客様からの質問に自信を持って回答できませんでした。",
    `質問: ${question}`,
    `Botの回答: ${answer}`,
    `質問者ID: ${askerUserId ?? "不明"}`,
  ].join("\n");

  const results = await Promise.allSettled(
    ownerUserIds.map((ownerId) => pushMessage(ownerId, text))
  );

  results.forEach((result, index) => {
    if (result.status === "rejected") {
      console.error(
        `Failed to notify owner ${ownerUserIds[index]}:`,
        result.reason
      );
    }
  });
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-line-signature");

  if (!verifyLineSignature(rawBody, signature)) {
    return new Response("Invalid signature", { status: 401 });
  }

  const body: LineWebhookBody = JSON.parse(rawBody);

  await Promise.all(
    body.events.map(async (event) => {
      if (event.type !== "message" || event.message?.type !== "text" || !event.replyToken) {
        return;
      }

      const question = event.message.text ?? "";
      const lineUserId = event.source?.userId;

      if (lineUserId) {
        await logConversation({
          lineUserId,
          role: "user",
          message: question,
        }).catch((logError) => {
          console.error("Failed to log user message:", logError);
        });
      }

      try {
        const faqs = await getActiveFaqs();
        const { answer, confidence } = await answerFaqQuestion(question, faqs);
        await replyMessage(event.replyToken, answer);

        if (lineUserId) {
          await logConversation({
            lineUserId,
            role: "assistant",
            message: answer,
            metadata: { confidence },
          }).catch((logError) => {
            console.error("Failed to log assistant message:", logError);
          });
        }

        if (confidence === "低") {
          await notifyOwnersOfLowConfidence(
            question,
            answer,
            lineUserId
          ).catch((notifyError) => {
            console.error("Failed to notify owners:", notifyError);
          });
        }
      } catch (error) {
        console.error("Failed to answer FAQ question:", error);
        await replyMessage(
          event.replyToken,
          "申し訳ございません、現在回答できません。しばらくしてから再度お試しください。"
        ).catch((replyError) => {
          console.error("Failed to send fallback reply:", replyError);
        });
      }
    })
  );

  return new Response("OK", { status: 200 });
}

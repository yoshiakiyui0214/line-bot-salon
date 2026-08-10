import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { Tables } from "./supabase/types";

const client = new Anthropic();

type Faq = Pick<Tables<"faq">, "question" | "answer" | "category">;

function buildFaqContext(faqs: Faq[]): string {
  return faqs
    .map((faq) => {
      const category = faq.category ? `[${faq.category}] ` : "";
      return `${category}Q: ${faq.question}\nA: ${faq.answer}`;
    })
    .join("\n\n");
}

const SYSTEM_PROMPT = `あなたは美容室のLINE公式アカウントで、お客様からの質問に答えるアシスタントです。

以下のFAQに書かれている内容のみを根拠に、日本語で簡潔に回答してください。
FAQに答えが含まれていない質問については、絶対に推測や一般論で答えず、
「恐れ入りますが、その件については店舗に直接お問い合わせください」という趣旨で案内してください。

回答とあわせて、その回答に対する確信度を「高」「中」「低」のいずれかで判定してください。
- 高: 質問がFAQの内容と直接一致し、そのまま正確に回答できる
- 中: 関連するFAQはあるが、複数を組み合わせる必要がある、表現が質問と異なる、または多少の推測を要する
- 低: FAQに該当する情報がなく、店舗への問い合わせ案内で応じるしかない`;

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    confidence: { type: "string", enum: ["高", "中", "低"] },
    answer: { type: "string" },
  },
  required: ["confidence", "answer"],
  additionalProperties: false,
} as const;

export type Confidence = "高" | "中" | "低";

export type FaqAnswer = {
  answer: string;
  confidence: Confidence;
};

export async function answerFaqQuestion(
  question: string,
  faqs: Faq[]
): Promise<FaqAnswer> {
  const faqContext = buildFaqContext(faqs);

  const response = await client.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 1024,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
      {
        type: "text",
        text: `# FAQ一覧\n\n${faqContext}`,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: question }],
    output_config: {
      format: {
        type: "json_schema",
        schema: RESPONSE_SCHEMA,
      },
    },
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock) {
    throw new Error("Claude response contained no text block");
  }

  return JSON.parse(textBlock.text) as FaqAnswer;
}

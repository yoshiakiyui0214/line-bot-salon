import Link from "next/link";
import { notFound } from "next/navigation";
import { getConversationThread } from "@/lib/supabase/conversations";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getConfidence(metadata: unknown): string | null {
  if (
    metadata &&
    typeof metadata === "object" &&
    "confidence" in metadata &&
    typeof (metadata as { confidence: unknown }).confidence === "string"
  ) {
    return (metadata as { confidence: string }).confidence;
  }
  return null;
}

export default async function ConversationThreadPage({
  params,
}: {
  params: Promise<{ lineUserId: string }>;
}) {
  const { lineUserId } = await params;
  const messages = await getConversationThread(lineUserId);

  if (messages.length === 0) {
    notFound();
  }

  return (
    <div className="mx-auto flex min-h-full max-w-2xl flex-col gap-4 p-4">
      <Link href="/admin/conversations" className="text-sm underline">
        ← 一覧に戻る
      </Link>
      <div>
        <h1 className="text-xl font-semibold">会話ログ</h1>
        <p className="font-mono text-xs text-zinc-500">{lineUserId}</p>
      </div>

      <ul className="flex flex-col gap-3">
        {messages.map((message) => {
          const isAssistant = message.role === "assistant";
          const confidence = getConfidence(message.metadata);

          return (
            <li
              key={message.id}
              className={`flex ${isAssistant ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                  isAssistant
                    ? "bg-foreground text-background"
                    : "bg-black/[.05] dark:bg-white/[.08]"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.message}</p>
                <div className="mt-1 flex items-center gap-2 text-xs opacity-70">
                  <span>{formatTime(message.created_at)}</span>
                  {confidence && <span>確信度: {confidence}</span>}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

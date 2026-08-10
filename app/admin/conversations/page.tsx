import Link from "next/link";
import { getConversationThreads } from "@/lib/supabase/conversations";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminConversationsPage() {
  const threads = await getConversationThreads();

  return (
    <div className="mx-auto flex min-h-full max-w-2xl flex-col gap-4 p-4">
      <h1 className="text-xl font-semibold">会話ログ</h1>

      {threads.length === 0 ? (
        <p className="text-sm text-zinc-500">会話ログがまだありません。</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {threads.map((thread) => (
            <li key={thread.lineUserId}>
              <Link
                href={`/admin/conversations/${thread.lineUserId}`}
                className="flex flex-col gap-1 rounded-lg border border-black/[.08] p-4 dark:border-white/[.145]"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-mono text-xs text-zinc-500">
                    {thread.lineUserId}
                  </p>
                  <span className="shrink-0 text-xs text-zinc-500">
                    {formatDateTime(thread.lastCreatedAt)}
                  </span>
                </div>
                <p className="line-clamp-1 text-sm">
                  {thread.lastRole === "assistant" ? (
                    <span className="text-zinc-500">Bot: </span>
                  ) : null}
                  {thread.lastMessage}
                </p>
                <p className="text-xs text-zinc-500">{thread.messageCount}件</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

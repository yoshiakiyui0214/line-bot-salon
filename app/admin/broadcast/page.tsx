import { getBroadcasts } from "@/lib/supabase/broadcasts";
import { BroadcastForm } from "./BroadcastForm";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("ja-JP", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminBroadcastPage() {
  const broadcasts = await getBroadcasts();

  return (
    <div className="mx-auto flex min-h-full max-w-2xl flex-col gap-6 p-4">
      <div>
        <h1 className="text-xl font-semibold">お知らせ配信</h1>
        <p className="mt-1 text-sm text-zinc-500">
          入力した内容がLINE友だち全員に配信されます。
        </p>
      </div>

      <BroadcastForm />

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-zinc-500">配信履歴</h2>
        {broadcasts.length === 0 ? (
          <p className="text-sm text-zinc-500">配信履歴はまだありません。</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {broadcasts.map((broadcast) => (
              <li
                key={broadcast.id}
                className="flex flex-col gap-1 rounded-lg border border-black/[.08] p-4 dark:border-white/[.145]"
              >
                <p className="text-xs text-zinc-500">
                  {formatDateTime(broadcast.sent_at)}
                </p>
                <p className="whitespace-pre-wrap text-sm">
                  {broadcast.message}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

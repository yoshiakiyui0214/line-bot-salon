import Link from "next/link";
import { getAllFaqs } from "@/lib/supabase/faq";
import { DeleteFaqButton } from "./DeleteFaqButton";

export default async function AdminFaqListPage() {
  const faqs = await getAllFaqs();

  return (
    <div className="mx-auto flex min-h-full max-w-2xl flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">FAQ管理</h1>
        <Link
          href="/admin/new"
          className="shrink-0 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          + 新規追加
        </Link>
      </div>

      {faqs.length === 0 ? (
        <p className="text-sm text-zinc-500">FAQがまだ登録されていません。</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {faqs.map((faq) => (
            <li
              key={faq.id}
              className="flex flex-col gap-2 rounded-lg border border-black/[.08] p-4 dark:border-white/[.145]"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{faq.question}</p>
                  {faq.category && (
                    <span className="mt-1 inline-block rounded-full bg-black/[.05] px-2 py-0.5 text-xs text-zinc-600 dark:bg-white/[.08] dark:text-zinc-400">
                      {faq.category}
                    </span>
                  )}
                </div>
                {!faq.is_active && (
                  <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-400">
                    非公開
                  </span>
                )}
              </div>
              <p className="line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                {faq.answer}
              </p>
              <div className="mt-1 flex gap-4 text-sm">
                <Link
                  href={`/admin/${faq.id}/edit`}
                  className="font-medium underline"
                >
                  編集
                </Link>
                <DeleteFaqButton id={faq.id} question={faq.question} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

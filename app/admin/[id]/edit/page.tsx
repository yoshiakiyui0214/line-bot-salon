import Link from "next/link";
import { notFound } from "next/navigation";
import { FaqForm } from "../../FaqForm";
import { updateFaqAction } from "../../actions";
import { getFaqById } from "@/lib/supabase/faq";

export default async function EditFaqPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const faq = await getFaqById(id);

  if (!faq) {
    notFound();
  }

  const boundUpdateFaqAction = updateFaqAction.bind(null, id);

  return (
    <div className="mx-auto max-w-2xl p-4">
      <Link href="/admin" className="text-sm underline">
        ← 一覧に戻る
      </Link>
      <h1 className="mb-6 mt-2 text-xl font-semibold">FAQ編集</h1>
      <FaqForm
        action={boundUpdateFaqAction}
        defaultValues={faq}
        submitLabel="更新する"
      />
    </div>
  );
}

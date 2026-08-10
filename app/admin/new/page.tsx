import Link from "next/link";
import { FaqForm } from "../FaqForm";
import { createFaqAction } from "../actions";

export default function NewFaqPage() {
  return (
    <div className="mx-auto max-w-2xl p-4">
      <Link href="/admin" className="text-sm underline">
        ← 一覧に戻る
      </Link>
      <h1 className="mb-6 mt-2 text-xl font-semibold">FAQ新規追加</h1>
      <FaqForm action={createFaqAction} submitLabel="追加する" />
    </div>
  );
}

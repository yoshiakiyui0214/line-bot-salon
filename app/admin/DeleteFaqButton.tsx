"use client";

import { useTransition } from "react";
import { deleteFaqAction } from "./actions";

export function DeleteFaqButton({ id, question }: { id: string; question: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm(`「${question}」を削除しますか？この操作は取り消せません。`)) {
      return;
    }
    startTransition(() => {
      deleteFaqAction(id);
    });
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="font-medium text-red-600 underline disabled:opacity-50 dark:text-red-400"
    >
      {isPending ? "削除中..." : "削除"}
    </button>
  );
}

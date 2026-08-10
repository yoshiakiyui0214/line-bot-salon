"use client";

import { useTransition } from "react";
import { deleteMenuAction } from "./actions";

export function DeleteMenuButton({ id, name }: { id: string; name: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm(`「${name}」を削除しますか？この操作は取り消せません。`)) {
      return;
    }
    startTransition(() => {
      deleteMenuAction(id);
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

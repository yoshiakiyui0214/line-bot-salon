import Link from "next/link";
import { MenuForm } from "../MenuForm";
import { createMenuAction } from "../actions";

export default function NewMenuPage() {
  return (
    <div className="mx-auto max-w-2xl p-4">
      <Link href="/admin/menus" className="text-sm underline">
        ← 一覧に戻る
      </Link>
      <h1 className="mb-6 mt-2 text-xl font-semibold">メニュー新規追加</h1>
      <MenuForm action={createMenuAction} submitLabel="追加する" />
    </div>
  );
}

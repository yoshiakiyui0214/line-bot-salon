import Link from "next/link";
import { notFound } from "next/navigation";
import { MenuForm } from "../../MenuForm";
import { updateMenuAction } from "../../actions";
import { getMenuById } from "@/lib/supabase/menus";

export default async function EditMenuPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const menu = await getMenuById(id);

  if (!menu) {
    notFound();
  }

  const boundUpdateMenuAction = updateMenuAction.bind(null, id);

  return (
    <div className="mx-auto max-w-2xl p-4">
      <Link href="/admin/menus" className="text-sm underline">
        ← 一覧に戻る
      </Link>
      <h1 className="mb-6 mt-2 text-xl font-semibold">メニュー編集</h1>
      <MenuForm
        action={boundUpdateMenuAction}
        defaultValues={menu}
        submitLabel="更新する"
      />
    </div>
  );
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createMenu, updateMenu, deleteMenu } from "@/lib/supabase/menus";
import type { TablesInsert } from "@/lib/supabase/types";

function parseMenuForm(formData: FormData): TablesInsert<"menus"> {
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const priceRaw = String(formData.get("price") ?? "").trim();
  const durationRaw = String(formData.get("duration_minutes") ?? "").trim();
  const displayOrderRaw = String(formData.get("display_order") ?? "").trim();

  if (!name) {
    throw new Error("メニュー名は必須です");
  }
  if (!priceRaw || Number.isNaN(Number(priceRaw))) {
    throw new Error("価格は必須です");
  }
  if (!durationRaw || Number.isNaN(Number(durationRaw))) {
    throw new Error("所要時間は必須です");
  }

  return {
    name,
    category: category || null,
    description: description || null,
    price: Number(priceRaw),
    duration_minutes: Number(durationRaw),
    display_order: displayOrderRaw ? Number(displayOrderRaw) : null,
    is_active: formData.get("is_active") === "on",
  };
}

export async function createMenuAction(formData: FormData): Promise<void> {
  const input = parseMenuForm(formData);
  await createMenu(input);
  revalidatePath("/admin/menus");
  redirect("/admin/menus");
}

export async function updateMenuAction(
  id: string,
  formData: FormData
): Promise<void> {
  const input = parseMenuForm(formData);
  await updateMenu(id, input);
  revalidatePath("/admin/menus");
  redirect("/admin/menus");
}

export async function deleteMenuAction(id: string): Promise<void> {
  await deleteMenu(id);
  revalidatePath("/admin/menus");
}

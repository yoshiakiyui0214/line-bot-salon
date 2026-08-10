"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createFaq, updateFaq, deleteFaq } from "@/lib/supabase/faq";
import type { TablesInsert } from "@/lib/supabase/types";

function parseFaqForm(formData: FormData): TablesInsert<"faq"> {
  const question = String(formData.get("question") ?? "").trim();
  const answer = String(formData.get("answer") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const displayOrderRaw = String(formData.get("display_order") ?? "").trim();

  if (!question || !answer) {
    throw new Error("質問と回答は必須です");
  }

  return {
    question,
    answer,
    category: category || null,
    display_order: displayOrderRaw ? Number(displayOrderRaw) : null,
    is_active: formData.get("is_active") === "on",
  };
}

export async function createFaqAction(formData: FormData): Promise<void> {
  const input = parseFaqForm(formData);
  await createFaq(input);
  revalidatePath("/admin");
  redirect("/admin");
}

export async function updateFaqAction(
  id: string,
  formData: FormData
): Promise<void> {
  const input = parseFaqForm(formData);
  await updateFaq(id, input);
  revalidatePath("/admin");
  redirect("/admin");
}

export async function deleteFaqAction(id: string): Promise<void> {
  await deleteFaq(id);
  revalidatePath("/admin");
}

import "server-only";
import { supabaseAdmin } from "./admin";
import type { Tables, TablesInsert, TablesUpdate } from "./types";

export async function getActiveFaqs() {
  const { data, error } = await supabaseAdmin
    .from("faq")
    .select("question, answer, category")
    .eq("is_active", true)
    .order("display_order", { ascending: true, nullsFirst: false });

  if (error) {
    throw new Error(`Failed to fetch FAQs: ${error.message}`);
  }

  return data;
}

export async function getAllFaqs(): Promise<Tables<"faq">[]> {
  const { data, error } = await supabaseAdmin
    .from("faq")
    .select("*")
    .order("display_order", { ascending: true, nullsFirst: false });

  if (error) {
    throw new Error(`Failed to fetch FAQs: ${error.message}`);
  }

  return data;
}

export async function getFaqById(id: string): Promise<Tables<"faq"> | null> {
  const { data, error } = await supabaseAdmin
    .from("faq")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch FAQ: ${error.message}`);
  }

  return data;
}

export async function createFaq(input: TablesInsert<"faq">): Promise<void> {
  const { error } = await supabaseAdmin.from("faq").insert(input);

  if (error) {
    throw new Error(`Failed to create FAQ: ${error.message}`);
  }
}

export async function updateFaq(
  id: string,
  input: TablesUpdate<"faq">
): Promise<void> {
  const { error } = await supabaseAdmin
    .from("faq")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to update FAQ: ${error.message}`);
  }
}

export async function deleteFaq(id: string): Promise<void> {
  const { error } = await supabaseAdmin.from("faq").delete().eq("id", id);

  if (error) {
    throw new Error(`Failed to delete FAQ: ${error.message}`);
  }
}

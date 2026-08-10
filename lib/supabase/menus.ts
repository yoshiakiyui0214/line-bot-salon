import "server-only";
import { supabaseAdmin } from "./admin";
import type { Tables, TablesInsert, TablesUpdate } from "./types";

export async function getAllMenus(): Promise<Tables<"menus">[]> {
  const { data, error } = await supabaseAdmin
    .from("menus")
    .select("*")
    .order("display_order", { ascending: true, nullsFirst: false });

  if (error) {
    throw new Error(`Failed to fetch menus: ${error.message}`);
  }

  return data;
}

export async function getMenuById(id: string): Promise<Tables<"menus"> | null> {
  const { data, error } = await supabaseAdmin
    .from("menus")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch menu: ${error.message}`);
  }

  return data;
}

export async function createMenu(input: TablesInsert<"menus">): Promise<void> {
  const { error } = await supabaseAdmin.from("menus").insert(input);

  if (error) {
    throw new Error(`Failed to create menu: ${error.message}`);
  }
}

export async function updateMenu(
  id: string,
  input: TablesUpdate<"menus">
): Promise<void> {
  const { error } = await supabaseAdmin
    .from("menus")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to update menu: ${error.message}`);
  }
}

export async function deleteMenu(id: string): Promise<void> {
  const { error } = await supabaseAdmin.from("menus").delete().eq("id", id);

  if (error) {
    throw new Error(`Failed to delete menu: ${error.message}`);
  }
}

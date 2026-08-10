import "server-only";
import { supabaseAdmin } from "./admin";
import type { Tables } from "./types";

export async function logBroadcast(message: string): Promise<void> {
  const { error } = await supabaseAdmin.from("broadcasts").insert({ message });

  if (error) {
    throw new Error(`Failed to log broadcast: ${error.message}`);
  }
}

export async function getBroadcasts(): Promise<Tables<"broadcasts">[]> {
  const { data, error } = await supabaseAdmin
    .from("broadcasts")
    .select("*")
    .order("sent_at", { ascending: false })
    .limit(100);

  if (error) {
    throw new Error(`Failed to fetch broadcasts: ${error.message}`);
  }

  return data;
}

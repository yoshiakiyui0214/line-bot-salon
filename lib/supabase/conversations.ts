import "server-only";
import { supabaseAdmin } from "./admin";
import type { Tables, Json } from "./types";

const MAX_RECENT_CONVERSATIONS = 500;

export type ConversationRow = Tables<"conversations">;

export type ConversationThreadSummary = {
  lineUserId: string;
  lastMessage: string;
  lastRole: string;
  lastCreatedAt: string;
  messageCount: number;
};

export async function logConversation(input: {
  lineUserId: string;
  role: "user" | "assistant";
  message: string;
  metadata?: Json | null;
}): Promise<void> {
  const { error } = await supabaseAdmin.from("conversations").insert({
    line_user_id: input.lineUserId,
    role: input.role,
    message: input.message,
    metadata: input.metadata ?? null,
  });

  if (error) {
    throw new Error(`Failed to log conversation: ${error.message}`);
  }
}

// Groups the most recent conversations by asker. Limited to a recent window —
// fine for this scale of bot traffic; add pagination if volume grows.
export async function getConversationThreads(): Promise<
  ConversationThreadSummary[]
> {
  const { data, error } = await supabaseAdmin
    .from("conversations")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(MAX_RECENT_CONVERSATIONS);

  if (error) {
    throw new Error(`Failed to fetch conversations: ${error.message}`);
  }

  const threadsByUser = new Map<string, ConversationThreadSummary>();

  for (const row of data) {
    const existing = threadsByUser.get(row.line_user_id);
    if (existing) {
      existing.messageCount += 1;
    } else {
      threadsByUser.set(row.line_user_id, {
        lineUserId: row.line_user_id,
        lastMessage: row.message,
        lastRole: row.role,
        lastCreatedAt: row.created_at,
        messageCount: 1,
      });
    }
  }

  return Array.from(threadsByUser.values()).sort(
    (a, b) =>
      new Date(b.lastCreatedAt).getTime() - new Date(a.lastCreatedAt).getTime()
  );
}

export async function getConversationThread(
  lineUserId: string
): Promise<ConversationRow[]> {
  const { data, error } = await supabaseAdmin
    .from("conversations")
    .select("*")
    .eq("line_user_id", lineUserId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch conversation thread: ${error.message}`);
  }

  return data;
}

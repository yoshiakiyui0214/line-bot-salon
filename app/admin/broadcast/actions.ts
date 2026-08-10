"use server";

import { revalidatePath } from "next/cache";
import { broadcastMessage } from "@/lib/line";
import { logBroadcast } from "@/lib/supabase/broadcasts";

export type BroadcastActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

const MAX_MESSAGE_LENGTH = 5000;

export async function broadcastAction(
  _prevState: BroadcastActionState,
  formData: FormData
): Promise<BroadcastActionState> {
  const text = String(formData.get("text") ?? "").trim();

  if (!text) {
    return { status: "error", message: "メッセージを入力してください" };
  }
  if (text.length > MAX_MESSAGE_LENGTH) {
    return {
      status: "error",
      message: `メッセージは${MAX_MESSAGE_LENGTH}文字以内で入力してください`,
    };
  }

  try {
    await broadcastMessage(text);
  } catch (error) {
    console.error("Failed to broadcast message:", error);
    return {
      status: "error",
      message: "配信に失敗しました。しばらくしてから再度お試しください。",
    };
  }

  try {
    await logBroadcast(text);
  } catch (logError) {
    // Message was already sent successfully — a logging failure shouldn't
    // be reported to the operator as a broadcast failure.
    console.error("Failed to log broadcast:", logError);
  }

  revalidatePath("/admin/broadcast");
  return { status: "success", message: "配信が完了しました" };
}

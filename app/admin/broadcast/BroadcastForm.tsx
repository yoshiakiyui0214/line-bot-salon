"use client";

import { useActionState, useState } from "react";
import { broadcastAction, type BroadcastActionState } from "./actions";

const initialState: BroadcastActionState = { status: "idle" };

export function BroadcastForm() {
  const [step, setStep] = useState<"input" | "confirm">("input");
  const [text, setText] = useState("");
  const [state, formAction, isPending] = useActionState(
    broadcastAction,
    initialState
  );

  // Reset to the input step once a broadcast succeeds. Adjusted during
  // render (not an effect) per React's guidance for state derived from
  // a prop/state change — avoids the extra render an effect would cause.
  const [handledState, setHandledState] = useState(state);
  if (state !== handledState) {
    setHandledState(state);
    if (state.status === "success" && step !== "input") {
      setStep("input");
      setText("");
    }
  }

  if (step === "confirm") {
    return (
      <div className="flex flex-col gap-4">
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          友だち全員に配信されます。送信後は取り消せません。内容をよく確認してください。
        </p>
        <div className="whitespace-pre-wrap rounded-lg border border-black/[.08] p-4 text-sm dark:border-white/[.145]">
          {text}
        </div>

        {state.status === "error" && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {state.message}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setStep("input")}
            disabled={isPending}
            className="flex-1 rounded-full border border-black/[.08] px-5 py-3 text-base font-medium disabled:opacity-50 dark:border-white/[.145]"
          >
            戻る
          </button>
          <form action={formAction} className="flex-1">
            <input type="hidden" name="text" value={text} />
            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-full bg-red-600 px-5 py-3 text-base font-medium text-white disabled:opacity-50"
            >
              {isPending ? "配信中..." : "配信する"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={6}
        placeholder="配信するメッセージを入力してください"
        className="rounded-lg border border-black/[.08] px-3 py-2.5 text-base dark:border-white/[.145] dark:bg-black"
      />
      {state.status === "success" && (
        <p className="text-sm text-green-600 dark:text-green-400">
          {state.message}
        </p>
      )}
      <button
        type="button"
        onClick={() => text.trim() && setStep("confirm")}
        disabled={!text.trim()}
        className="rounded-full bg-foreground px-5 py-3 text-base font-medium text-background disabled:opacity-50"
      >
        確認画面へ
      </button>
    </div>
  );
}

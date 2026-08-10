import type { Tables } from "@/lib/supabase/types";

type FaqFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  defaultValues?: Pick<
    Tables<"faq">,
    "question" | "answer" | "category" | "display_order" | "is_active"
  >;
  submitLabel: string;
};

const inputClassName =
  "rounded-lg border border-black/[.08] px-3 py-2.5 text-base dark:border-white/[.145] dark:bg-black";

export function FaqForm({ action, defaultValues, submitLabel }: FaqFormProps) {
  return (
    <form action={action} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="question" className="text-sm font-medium">
          質問
        </label>
        <input
          id="question"
          name="question"
          type="text"
          required
          defaultValue={defaultValues?.question}
          className={inputClassName}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="answer" className="text-sm font-medium">
          回答
        </label>
        <textarea
          id="answer"
          name="answer"
          required
          rows={5}
          defaultValue={defaultValues?.answer}
          className={inputClassName}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="category" className="text-sm font-medium">
          カテゴリ（任意）
        </label>
        <input
          id="category"
          name="category"
          type="text"
          defaultValue={defaultValues?.category ?? ""}
          className={inputClassName}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="display_order" className="text-sm font-medium">
          表示順（任意・数字が小さいほど上に表示）
        </label>
        <input
          id="display_order"
          name="display_order"
          type="number"
          defaultValue={defaultValues?.display_order ?? undefined}
          className={inputClassName}
        />
      </div>

      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          name="is_active"
          defaultChecked={defaultValues?.is_active ?? true}
          className="h-5 w-5"
        />
        公開する
      </label>

      <button
        type="submit"
        className="mt-2 rounded-full bg-foreground px-5 py-3 text-base font-medium text-background"
      >
        {submitLabel}
      </button>
    </form>
  );
}

import type { Tables } from "@/lib/supabase/types";

type MenuFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  defaultValues?: Pick<
    Tables<"menus">,
    | "name"
    | "category"
    | "description"
    | "price"
    | "duration_minutes"
    | "display_order"
    | "is_active"
  >;
  submitLabel: string;
};

const inputClassName =
  "rounded-lg border border-black/[.08] px-3 py-2.5 text-base dark:border-white/[.145] dark:bg-black";

export function MenuForm({ action, defaultValues, submitLabel }: MenuFormProps) {
  return (
    <form action={action} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium">
          メニュー名
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={defaultValues?.name}
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
        <label htmlFor="description" className="text-sm font-medium">
          説明（任意）
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={defaultValues?.description ?? ""}
          className={inputClassName}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="price" className="text-sm font-medium">
            価格（円）
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min={0}
            required
            defaultValue={defaultValues?.price}
            className={inputClassName}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="duration_minutes" className="text-sm font-medium">
            所要時間（分）
          </label>
          <input
            id="duration_minutes"
            name="duration_minutes"
            type="number"
            min={1}
            required
            defaultValue={defaultValues?.duration_minutes}
            className={inputClassName}
          />
        </div>
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

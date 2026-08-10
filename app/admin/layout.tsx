import type { ReactNode } from "react";
import { AdminNav } from "./AdminNav";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full">
      <AdminNav />
      {children}
    </div>
  );
}

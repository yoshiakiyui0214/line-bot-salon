"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function tabClassName(active: boolean): string {
  return `whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium ${
    active
      ? "border-foreground text-foreground"
      : "border-transparent text-zinc-500"
  }`;
}

const tabs = [
  {
    href: "/admin",
    label: "FAQ管理",
    match: (path: string) =>
      !path.startsWith("/admin/menus") &&
      !path.startsWith("/admin/conversations") &&
      !path.startsWith("/admin/broadcast"),
  },
  {
    href: "/admin/menus",
    label: "メニュー・料金管理",
    match: (path: string) => path.startsWith("/admin/menus"),
  },
  {
    href: "/admin/conversations",
    label: "会話ログ",
    match: (path: string) => path.startsWith("/admin/conversations"),
  },
  {
    href: "/admin/broadcast",
    label: "お知らせ配信",
    match: (path: string) => path.startsWith("/admin/broadcast"),
  },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-black/[.08] px-4 dark:border-white/[.145]">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={tabClassName(tab.match(pathname))}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}

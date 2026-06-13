"use client";

import dynamic from "next/dynamic";
import type { EditorShellProps } from "@/components/editor-shell";

const EditorShellNoSsr = dynamic(
  () => import("@/components/editor-shell").then((mod) => mod.EditorShell),
  {
    ssr: false,
    loading: () => <main className="min-h-screen bg-[#ebe7dd]" />,
  },
);

export function EditorShellClient(props: EditorShellProps) {
  return <EditorShellNoSsr {...props} />;
}

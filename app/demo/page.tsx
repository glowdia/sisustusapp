import { EditorShellClient } from "@/components/editor-shell-client";
import { getPaintColors, getProducts } from "@/lib/csv";
import { moodboardPages } from "@/lib/mock-data";

export default async function DemoPage() {
  const [products, paintColors] = await Promise.all([getProducts(), getPaintColors()]);

  return <EditorShellClient products={products} paintColors={paintColors} pages={moodboardPages} />;
}

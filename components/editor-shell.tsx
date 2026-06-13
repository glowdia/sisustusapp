"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowLeft, Download, FileText, ImagePlus, Layers, Plus, Save, Search, Trash2, Type } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import type { Json } from "@/lib/supabase/database.types";
import type {
  CanvasColor,
  CanvasElement,
  CanvasElementBase,
  CanvasImage,
  CanvasText,
  MoodboardPage,
  PaintColor,
  PaintSurface,
  Product,
} from "@/lib/types";

const canvasSize = {
  width: 1190,
  height: 842,
};

const canvasPreviewScale = 0.56;

const MoodboardCanvas = dynamic(
  () => import("@/components/moodboard-canvas").then((mod) => mod.MoodboardCanvas),
  {
    ssr: false,
    loading: () => <div className="h-full w-full bg-[#fbfaf6]" />,
  },
);

export type EditorShellProps = {
  products: Product[];
  paintColors: PaintColor[];
  pages: MoodboardPage[];
  initialPageElements?: Record<string, CanvasElement[]>;
  initialSurfaceSelections?: PaintSurface[] | null;
  project?: {
    backHref?: string;
    clientName?: string | null;
    moodboardId?: string;
    pageIds?: string[];
    roomName?: string | null;
    storageKey?: string;
    title?: string | null;
  };
};

type PageElements = Record<string, CanvasElement[]>;
type CanvasElementPatch = Partial<CanvasElementBase> &
  Partial<Pick<CanvasText, "fill" | "fontSize" | "text">> &
  Partial<Pick<CanvasImage, "alt" | "src">> &
  Partial<Pick<CanvasColor, "code" | "hex" | "label" | "name">>;

const defaultStorageKey = "sisustusapp-local-moodboard-v2";
const defaultSurfaces: PaintSurface[] = [
  { id: "walls", label: "Seinät", colorId: null },
  { id: "ceiling", label: "Katto", colorId: null },
  { id: "floor", label: "Lattia", colorId: null },
  { id: "accent", label: "Tehosteseinä", colorId: null },
  { id: "trim", label: "Listat", colorId: null },
];

type SavedMoodboard = {
  activePageId: string;
  moodboardPages: MoodboardPage[];
  pageElements: PageElements;
  surfaceSelections: PaintSurface[];
};

function toEditorCanvasJson(elements: CanvasElement[], surfaceSelections: PaintSurface[]): Json {
  return {
    editorSchemaVersion: 1,
    elements,
    surfaceSelections,
  } as unknown as Json;
}

export function EditorShell({
  initialPageElements,
  initialSurfaceSelections,
  paintColors,
  pages,
  products,
  project,
}: EditorShellProps) {
  const storageKey = project?.storageKey ?? defaultStorageKey;
  const projectTitle = project?.title || "Testiolohuone";
  const clientName = project?.clientName || "Teppo Testiasiakas";
  const roomName = project?.roomName || "Olohuone";
  const initialActivePageId = pages.find((page) => !page.fixed)?.id ?? pages[0]?.id ?? "";
  const [moodboardPages, setMoodboardPages] = useState(pages);
  const [activePageId, setActivePageId] = useState(initialActivePageId);
  const [query, setQuery] = useState("");
  const [pageElements, setPageElements] = useState<PageElements>(
    initialPageElements ?? (initialActivePageId ? { [initialActivePageId]: [] } : {}),
  );
  const [savedPageIds, setSavedPageIds] = useState(() => new Set(project?.pageIds ?? []));
  const [surfaceSelections, setSurfaceSelections] = useState<PaintSurface[]>(
    initialSurfaceSelections ?? defaultSurfaces,
  );
  const [paintQuery, setPaintQuery] = useState("");
  const [saveStatus, setSaveStatus] = useState("Ei tallennettu");
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const activePage = moodboardPages.find((page) => page.id === activePageId) ?? moodboardPages[0];
  const showProductBank = !["cover", "designer_note", "floorplan"].includes(activePage.type);
  const activeCanvasElements = pageElements[activePage.id] ?? [];
  const productById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );
  const selectedElement = activeCanvasElements.find((item) => item.id === selectedElementId) ?? null;
  const selectedProduct =
    selectedElement?.type === "product" ? productById.get(selectedElement.productId) : null;
  const paintById = useMemo(
    () => new Map(paintColors.map((paintColor) => [paintColor.id, paintColor])),
    [paintColors],
  );

  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return products;
    }

    return products.filter((product) =>
      [product.name, product.category, product.color]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [products, query]);

  const filteredPaintColors = useMemo(() => {
    const normalized = paintQuery.trim().toLowerCase();
    const usableColors = paintColors.filter((color) => color.hex);

    if (!normalized) {
      return usableColors.slice(0, 80);
    }

    return usableColors
      .filter((color) => `${color.code} ${color.name}`.toLowerCase().includes(normalized))
      .slice(0, 80);
  }, [paintColors, paintQuery]);

  useEffect(() => {
    if (initialPageElements) {
      setSaveStatus("Ladattu Supabasesta");
      return;
    }

    try {
      const saved = window.localStorage.getItem(storageKey);
      if (!saved) {
        return;
      }

      const parsed = JSON.parse(saved) as SavedMoodboard;
      setMoodboardPages(parsed.moodboardPages);
      setPageElements(parsed.pageElements);
      setSurfaceSelections(parsed.surfaceSelections ?? defaultSurfaces);
      setActivePageId(parsed.activePageId);
      setSaveStatus("Palautettu paikallisesta tallennuksesta");
    } catch {
      setSaveStatus("Paikallista tallennusta ei voitu lukea");
    }
  }, [initialPageElements, storageKey]);

  function addProduct(product: Product) {
    const nextElementId = `canvas-product-${crypto.randomUUID()}`;
    const newProduct = {
      id: nextElementId,
      type: "product" as const,
      productId: product.id,
      x: 160 + activeCanvasElements.length * 34,
      y: 160 + activeCanvasElements.length * 24,
      width: 250,
      height: 180,
    };

    setPageElements((current) => ({
      ...current,
      [activePage.id]: [...(current[activePage.id] ?? []), newProduct],
    }));
    setSelectedElementId(nextElementId);
  }

  function addTextElement() {
    const nextElementId = `canvas-text-${crypto.randomUUID()}`;
    const newText: CanvasText = {
      id: nextElementId,
      type: "text",
      text: "Kirjoita teksti...",
      x: 190 + activeCanvasElements.length * 22,
      y: 210 + activeCanvasElements.length * 18,
      width: 320,
      height: 96,
      fontSize: 28,
      fill: "#242424",
    };

    setPageElements((current) => ({
      ...current,
      [activePage.id]: [...(current[activePage.id] ?? []), newText],
    }));
    setSelectedElementId(nextElementId);
  }

  async function addImageElement(file: File) {
    const nextElementId = `canvas-image-${crypto.randomUUID()}`;
    const imageUrl = await readFileAsDataUrl(file);
    const newImage: CanvasImage = {
      id: nextElementId,
      type: "image",
      src: imageUrl,
      alt: file.name,
      x: 220 + activeCanvasElements.length * 24,
      y: 220 + activeCanvasElements.length * 18,
      width: 320,
      height: 220,
    };

    setPageElements((current) => ({
      ...current,
      [activePage.id]: [...(current[activePage.id] ?? []), newImage],
    }));
    setSelectedElementId(nextElementId);
  }

  function updateCanvasElement(id: string, patch: CanvasElementPatch) {
    setPageElements((current) => ({
      ...current,
      [activePage.id]: (current[activePage.id] ?? []).map((item): CanvasElement => {
        if (item.id !== id) {
          return item;
        }

        const geometry = {
          height: patch.height ?? item.height,
          width: patch.width ?? item.width,
          x: patch.x ?? item.x,
          y: patch.y ?? item.y,
        };

        if (item.type === "text") {
          return {
            ...item,
            ...geometry,
            fill: patch.fill ?? item.fill,
            fontSize: patch.fontSize ?? item.fontSize,
            text: patch.text ?? item.text,
          };
        }

        if (item.type === "image") {
          return {
            ...item,
            ...geometry,
            alt: patch.alt ?? item.alt,
            src: patch.src ?? item.src,
          };
        }

        if (item.type === "color") {
          return {
            ...item,
            ...geometry,
            code: patch.code ?? item.code,
            hex: patch.hex ?? item.hex,
            label: patch.label ?? item.label,
            name: patch.name ?? item.name,
          };
        }

        return {
          ...item,
          ...geometry,
        };
      }),
    }));
  }

  function deleteSelectedElement() {
    if (!selectedElementId) {
      return;
    }

    deleteElement(selectedElementId);
  }

  function deleteElement(elementId: string) {
    setPageElements((current) => ({
      ...current,
      [activePage.id]: (current[activePage.id] ?? []).filter((item) => item.id !== elementId),
    }));
    setSelectedElementId((current) => (current === elementId ? null : current));
  }

  function addProductPage() {
    const productPageCount = moodboardPages.filter((page) => !page.fixed).length + 1;
    const pageId = `product-page-${crypto.randomUUID()}`;
    const nextPage: MoodboardPage = {
      id: pageId,
      title: `Huonekalut ja valaisimet ${productPageCount}`,
      type: "furniture_and_lighting",
      fixed: false,
    };

    setMoodboardPages((current) => {
      const floorplanIndex = current.findIndex((page) => page.type === "floorplan");
      if (floorplanIndex === -1) {
        return [...current, nextPage];
      }

      return [...current.slice(0, floorplanIndex), nextPage, ...current.slice(floorplanIndex)];
    });
    setPageElements((current) => ({
      ...current,
      [pageId]: [],
    }));
    setActivePageId(pageId);
    setSelectedElementId(null);
  }

  function saveLocally() {
    const payload: SavedMoodboard = {
      activePageId,
      moodboardPages,
      pageElements,
      surfaceSelections,
    };

    window.localStorage.setItem(storageKey, JSON.stringify(payload));
    setSaveStatus(`Tallennettu ${new Date().toLocaleTimeString("fi-FI", { hour: "2-digit", minute: "2-digit" })}`);
  }

  async function saveMoodboard() {
    if (!project?.moodboardId) {
      saveLocally();
      return;
    }

    setSaveStatus("Tallennetaan...");
    const supabase = createClient();
    const nextSavedPageIds = new Set(savedPageIds);
    const pageIdChanges = new Map<string, string>();

    for (const [index, page] of moodboardPages.entries()) {
      const canvasJson = toEditorCanvasJson(pageElements[page.id] ?? [], surfaceSelections);

      if (nextSavedPageIds.has(page.id)) {
        const { error } = await supabase
          .from("moodboard_pages")
          .update({
            canvas_json: canvasJson,
            fixed: page.fixed,
            page_type: page.type,
            schema_version: 1,
            sort_order: index + 1,
            title: page.title,
          })
          .eq("id", page.id);

        if (error) {
          setSaveStatus("Tallennus epäonnistui");
          return;
        }

        continue;
      }

      const { data, error } = await supabase
        .from("moodboard_pages")
        .insert({
          canvas_json: canvasJson,
          fixed: page.fixed,
          moodboard_id: project.moodboardId,
          page_type: page.type,
          schema_version: 1,
          sort_order: index + 1,
          title: page.title,
        })
        .select("id")
        .single();

      if (error || !data) {
        setSaveStatus("Tallennus epäonnistui");
        return;
      }

      pageIdChanges.set(page.id, data.id);
      nextSavedPageIds.add(data.id);
    }

    if (pageIdChanges.size > 0) {
      setMoodboardPages((current) =>
        current.map((page) => ({
          ...page,
          id: pageIdChanges.get(page.id) ?? page.id,
        })),
      );
      setPageElements((current) => {
        const next: PageElements = {};
        for (const [pageId, elements] of Object.entries(current)) {
          next[pageIdChanges.get(pageId) ?? pageId] = elements;
        }
        return next;
      });
      setActivePageId((current) => pageIdChanges.get(current) ?? current);
    }

    setSavedPageIds(nextSavedPageIds);
    setSaveStatus(`Tallennettu ${new Date().toLocaleTimeString("fi-FI", { hour: "2-digit", minute: "2-digit" })}`);
  }

  function updateSurfaceColor(surfaceId: string, colorId: string) {
    setSurfaceSelections((current) =>
      current.map((surface) =>
        surface.id === surfaceId
          ? {
              ...surface,
              colorId: colorId || null,
            }
          : surface,
      ),
    );
  }

  function addColorCardsToPage() {
    const selectedSurfaces = surfaceSelections
      .map((surface) => {
        const color = surface.colorId ? paintById.get(surface.colorId) : null;
        if (!color?.hex) {
          return null;
        }

        return {
          surface,
          color,
        };
      })
      .filter((item): item is { surface: PaintSurface; color: PaintColor & { hex: string } } => Boolean(item));

    const cards: CanvasColor[] = selectedSurfaces.map(({ color, surface }, index) => ({
      id: `canvas-color-${crypto.randomUUID()}`,
      type: "color",
      label: surface.label,
      code: color.code,
      name: color.name,
      hex: color.hex,
      x: 92 + (index % 3) * 250,
      y: 220 + Math.floor(index / 3) * 150,
      width: 210,
      height: 118,
    }));

    setPageElements((current) => ({
      ...current,
      [activePage.id]: [...(current[activePage.id] ?? []), ...cards],
    }));
    setSelectedElementId(cards.at(-1)?.id ?? null);
  }

  async function exportPdf() {
    const { jsPDF } = await import("jspdf");
    const pdf = new jsPDF({
      format: "a4",
      orientation: "landscape",
      unit: "pt",
    });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const scaleX = pageWidth / canvasSize.width;
    const scaleY = pageHeight / canvasSize.height;

    for (const [pageIndex, page] of moodboardPages.entries()) {
      if (pageIndex > 0) {
        pdf.addPage("a4", "landscape");
      }

      pdf.setFillColor("#fbfaf6");
      pdf.rect(0, 0, pageWidth, pageHeight, "F");
      pdf.setDrawColor("#d8d0c3");
      pdf.rect(54 * scaleX, 54 * scaleY, 1082 * scaleX, 734 * scaleY, "S");
      pdf.setTextColor("#242424");
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(24);
      pdf.text(page.title.toUpperCase(), 84 * scaleX, 98 * scaleY);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(12);
      pdf.setTextColor("#515151");
      pdf.text("Sisustussuunnitelman moodboard", 86 * scaleX, 130 * scaleY);

      const elements = pageElements[page.id] ?? [];
      for (const element of elements) {
        await drawElementToPdf(pdf, element, productById, scaleX, scaleY);
      }
    }

    pdf.save("sisustus-moodboard.pdf");
  }

  return (
    <main className="h-screen overflow-hidden bg-paper text-ink">
      <header className="flex min-h-16 items-center justify-between border-b border-mist bg-white px-6">
        <div className="flex items-center gap-4">
          {project?.backHref ? (
            <Link
              className="inline-flex h-10 items-center gap-2 rounded-md border border-mist bg-white px-3 text-sm font-medium shadow-sm"
              href={project.backHref}
            >
              <ArrowLeft size={17} />
              Projektit
            </Link>
          ) : null}
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-graphite">Sisustusapp</p>
            <h1 className="text-xl font-semibold">{projectTitle}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="mr-2 hidden text-right text-xs text-graphite lg:block">{saveStatus}</div>
          <button
            className="inline-flex h-10 items-center gap-2 rounded-md border border-mist bg-white px-3 text-sm font-medium shadow-sm"
            onClick={() => void saveMoodboard()}
          >
            <Save size={17} />
            Tallenna
          </button>
          <button
            className="inline-flex h-10 items-center gap-2 rounded-md bg-ink px-3 text-sm font-medium text-white shadow-sm"
            onClick={() => void exportPdf()}
          >
            <Download size={17} />
            Lataa PDF
          </button>
        </div>
      </header>

      <div className="grid h-[calc(100vh-64px)] grid-cols-[minmax(210px,1fr)_320px] xl:grid-cols-[280px_minmax(620px,1fr)_320px]">
        <aside className="hidden overflow-y-auto border-r border-mist bg-white p-4 xl:block">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Sivut</h2>
            <button
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-mist"
              onClick={addProductPage}
              title="Lisää tuotesivu"
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="space-y-2">
            {moodboardPages.map((page, index) => (
              <button
                className={`flex w-full items-center gap-3 rounded-md border px-3 py-3 text-left text-sm transition ${
                  page.id === activePage.id
                    ? "border-clay bg-[#fbf5ef]"
                    : "border-transparent hover:border-mist hover:bg-paper"
                }`}
                key={page.id}
                onClick={() => {
                  setActivePageId(page.id);
                  setSelectedElementId(null);
                }}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded bg-mist text-xs font-semibold">
                  {index + 1}
                </span>
                <span>
                  <span className="block font-medium">{page.title}</span>
                  <span className="text-xs text-graphite">{page.fixed ? "Valmis sivupohja" : "Vapaa tuotesivu"}</span>
                </span>
              </button>
            ))}
          </div>

          <div className="mt-8">
            <h2 className="mb-3 text-sm font-semibold">Projektin tiedot</h2>
            <dl className="space-y-2 rounded-md border border-mist bg-paper p-3 text-sm">
              <div>
                <dt className="text-xs text-graphite">Asiakas</dt>
                <dd className="font-medium">{clientName}</dd>
              </div>
              <div>
                <dt className="text-xs text-graphite">Kohde</dt>
                <dd className="font-medium">{roomName}</dd>
              </div>
            </dl>
          </div>
        </aside>

        <section className="flex min-w-0 flex-col overflow-hidden bg-[#ebe7dd]">
          <div className="flex h-14 items-center justify-between border-b border-mist bg-white px-5">
            <div className="flex items-center gap-2 text-sm text-graphite">
              <Layers size={17} />
              <span>{activePage.title}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-mist bg-white"
                onClick={addTextElement}
                title="Lisää teksti"
              >
                <Type size={16} />
              </button>
              <button
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-mist bg-white"
                onClick={() => imageInputRef.current?.click()}
                title="Lisää kuva"
              >
                <ImagePlus size={16} />
              </button>
              <input
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    addImageElement(file);
                  }
                  event.target.value = "";
                }}
                ref={imageInputRef}
                type="file"
              />
              <button className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-mist bg-white" title="PDF-esikatselu">
                <FileText size={16} />
              </button>
            </div>
          </div>

          <div className="flex flex-1 items-start justify-start overflow-auto p-8 xl:items-center xl:justify-center">
            <div
              className="rounded-sm bg-white shadow-panel"
              style={{
                width: canvasSize.width * canvasPreviewScale,
                height: canvasSize.height * canvasPreviewScale,
              }}
            >
              <div
                style={{
                  transform: `scale(${canvasPreviewScale})`,
                  transformOrigin: "top left",
                  width: canvasSize.width,
                  height: canvasSize.height,
                }}
              >
                <MoodboardCanvas
                  activePageTitle={activePage.title}
                  canvasElements={activeCanvasElements}
                  onCanvasClick={() => setSelectedElementId(null)}
                  onElementDelete={deleteElement}
                  onElementSelect={setSelectedElementId}
                  onElementUpdate={updateCanvasElement}
                  products={products}
                  selectedElementId={selectedElementId}
                />
              </div>
            </div>
          </div>
        </section>

        <aside className="flex min-h-0 flex-col border-l border-mist bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold">Työkalut</h2>
          <div className="mb-4 rounded-md border border-mist bg-paper p-3">
            <div className="mb-2 flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold">Valittu elementti</h3>
              <button
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-mist bg-white disabled:opacity-40"
                disabled={!selectedElementId}
                onClick={deleteSelectedElement}
                title="Poista valittu elementti"
              >
                <Trash2 size={15} />
              </button>
            </div>
            {selectedElement ? (
              <div className="space-y-3 text-xs text-graphite">
                {selectedElement.type === "product" && selectedProduct ? (
                  <p className="font-medium text-ink">{selectedProduct.name}</p>
                ) : null}
                {selectedElement.type === "image" ? <p className="font-medium text-ink">{selectedElement.alt}</p> : null}
                {selectedElement.type === "text" ? (
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-graphite">Teksti</span>
                    <textarea
                      className="min-h-24 w-full resize-none rounded-md border border-mist bg-white p-2 text-sm text-ink outline-none focus:border-clay"
                      onChange={(event) => updateCanvasElement(selectedElement.id, { text: event.target.value })}
                      value={selectedElement.text}
                    />
                  </label>
                ) : null}
                {selectedElement.type === "text" ? (
                  <div className="grid grid-cols-2 gap-2">
                    <label>
                      <span className="mb-1 block text-xs font-medium text-graphite">Fonttikoko</span>
                      <input
                        className="h-9 w-full rounded-md border border-mist bg-white px-2 text-sm text-ink outline-none focus:border-clay"
                        min={10}
                        max={80}
                        onChange={(event) =>
                          updateCanvasElement(selectedElement.id, { fontSize: Number(event.target.value) })
                        }
                        type="number"
                        value={selectedElement.fontSize}
                      />
                    </label>
                    <label>
                      <span className="mb-1 block text-xs font-medium text-graphite">Väri</span>
                      <input
                        className="h-9 w-full rounded-md border border-mist bg-white px-1"
                        onChange={(event) => updateCanvasElement(selectedElement.id, { fill: event.target.value })}
                        type="color"
                        value={selectedElement.fill}
                      />
                    </label>
                  </div>
                ) : null}
                <p>
                  Sijainti {Math.round(selectedElement.x)}, {Math.round(selectedElement.y)}
                </p>
                <p>
                  Koko {Math.round(selectedElement.width)} x {Math.round(selectedElement.height)}
                </p>
              </div>
            ) : (
              <p className="text-xs text-graphite">Valitse elementti canvasilta muokataksesi sitä.</p>
            )}
          </div>

          {activePage.type === "colors_and_surfaces" ? (
            <div className="mb-4 rounded-md border border-mist bg-paper p-3">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">Värit ja pinnat</h3>
                <button
                  className="inline-flex h-8 items-center rounded-md bg-ink px-3 text-xs font-medium text-white"
                  onClick={addColorCardsToPage}
                >
                  Lisää kortit
                </button>
              </div>
              <input
                className="mb-3 h-9 w-full rounded-md border border-mist bg-white px-2 text-sm outline-none focus:border-clay"
                onChange={(event) => setPaintQuery(event.target.value)}
                placeholder="Hae Tikkurila-väriä"
                value={paintQuery}
              />
              <div className="space-y-2">
                {surfaceSelections.map((surface) => (
                  <label className="grid grid-cols-[92px_1fr] items-center gap-2 text-xs" key={surface.id}>
                    <span className="font-medium text-graphite">{surface.label}</span>
                    <select
                      className="h-9 min-w-0 rounded-md border border-mist bg-white px-2 text-sm outline-none focus:border-clay"
                      onChange={(event) => updateSurfaceColor(surface.id, event.target.value)}
                      value={surface.colorId ?? ""}
                    >
                      <option value="">Valitse väri</option>
                      {filteredPaintColors.map((color) => (
                        <option key={color.id} value={color.id}>
                          {color.code} {color.name}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
            </div>
          ) : null}

          {showProductBank ? (
            <>
              <h2 className="mb-3 text-sm font-semibold">Tuotepankki</h2>
              <label className="mb-4 flex h-10 items-center gap-2 rounded-md border border-mist px-3 text-sm">
                <Search size={16} className="text-graphite" />
                <input
                  className="min-w-0 flex-1 border-0 bg-transparent outline-none"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Hae tuotetta"
                  value={query}
                />
              </label>

              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
                {filteredProducts.map((product, index) => (
                  <article className="rounded-md border border-mist bg-white p-3 shadow-sm" key={product.id}>
                    <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded bg-paper">
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        sizes="280px"
                        className="object-cover"
                        priority={index === 0}
                      />
                    </div>
                    <h3 className="text-sm font-semibold leading-snug">{product.name}</h3>
                    <p className="mt-1 text-xs text-graphite">{product.category}</p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold">{product.priceText}</span>
                      <button
                        className="inline-flex h-8 items-center rounded-md bg-ink px-3 text-xs font-medium text-white"
                        onClick={() => addProduct(product)}
                      >
                        Lisää
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : null}
        </aside>
      </div>
    </main>
  );
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(String(reader.result)));
    reader.addEventListener("error", () => reject(reader.error));
    reader.readAsDataURL(file);
  });
}

async function drawElementToPdf(
  pdf: import("jspdf").jsPDF,
  element: CanvasElement,
  productById: Map<string, Product>,
  scaleX: number,
  scaleY: number,
) {
  const x = element.x * scaleX;
  const y = element.y * scaleY;
  const width = element.width * scaleX;
  const height = element.height * scaleY;

  if (element.type === "text") {
    pdf.setTextColor(element.fill);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(Math.max(8, element.fontSize * scaleY));
    pdf.text(pdf.splitTextToSize(element.text, width), x, y + element.fontSize * scaleY);
    return;
  }

  if (element.type === "color") {
    pdf.setFillColor("#ffffff");
    pdf.rect(x, y, width, height, "F");
    pdf.setDrawColor("#ded8ce");
    pdf.rect(x, y, width, height, "S");
    pdf.setFillColor(element.hex);
    pdf.rect(x + 8, y + 8, width - 16, Math.max(24, height - 46), "F");
    pdf.setTextColor("#515151");
    pdf.setFontSize(9);
    pdf.text(element.label, x + 8, y + height - 26);
    pdf.setTextColor("#242424");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.text(`${element.code} ${element.name}`, x + 8, y + height - 12);
    return;
  }

  if (element.type === "image") {
    await tryAddImage(pdf, element.src, x, y, width, height);
    return;
  }

  const product = productById.get(element.productId);
  if (!product) {
    return;
  }

  pdf.setFillColor("#ffffff");
  pdf.rect(x - 8, y - 8, width + 16, height + 58, "F");
  await tryAddImage(pdf, product.imageUrl, x, y, width, height);
  pdf.setTextColor("#242424");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.text(pdf.splitTextToSize(product.name, width), x, y + height + 16);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor("#515151");
  pdf.text(`${product.priceText} | ${product.dimensionsText}`, x, y + height + 36, { maxWidth: width });
  if (product.productUrl) {
    pdf.link(x - 8, y - 8, width + 16, height + 58, { url: product.productUrl });
  }
}

async function tryAddImage(
  pdf: import("jspdf").jsPDF,
  src: string,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  try {
    const dataUrl = src.startsWith("data:") ? src : await imageUrlToDataUrl(src);
    const format = dataUrl.startsWith("data:image/png") ? "PNG" : "JPEG";
    pdf.addImage(dataUrl, format, x, y, width, height);
  } catch {
    pdf.setFillColor("#f0ede6");
    pdf.rect(x, y, width, height, "F");
    pdf.setTextColor("#77716a");
    pdf.setFontSize(9);
    pdf.text("Kuva ei saatavilla PDF-exportissa", x + 10, y + 22, { maxWidth: width - 20 });
  }
}

async function imageUrlToDataUrl(src: string) {
  const normalizedSrc = src.trim();
  const proxiedSrc = normalizedSrc.startsWith("http")
    ? `/_next/image?url=${encodeURIComponent(normalizedSrc)}&w=1200&q=85`
    : normalizedSrc;
  const response = await fetch(proxiedSrc);
  const blob = await response.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(String(reader.result)));
    reader.addEventListener("error", () => reject(reader.error));
    reader.readAsDataURL(blob);
  });
}

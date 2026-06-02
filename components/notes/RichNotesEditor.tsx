"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import ImageResize from "tiptap-extension-resize-image";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Columns,
  Download,
  Highlighter,
  ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Redo2,
  Rows,
  Strikethrough,
  Table2,
  Trash2,
  Underline as UnderlineIcon,
  Undo2,
  VideoIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";
import { exportElementToPdf } from "@/lib/export-notes-pdf";
import { FontSize } from "./font-size-extension";
import { Video } from "./video-extension";
import { ToolbarNativeSelect } from "./ToolbarNativeSelect";
import { OrderedListWithStyle, type ListStyleType } from "./extensions/ordered-list-styles";
import { TableInsertPanel } from "./TableInsertPanel";
import {
  BLOCK_STYLES,
  FONT_FAMILIES,
  FONT_SIZES,
  HIGHLIGHT_COLORS,
  TEXT_COLORS,
} from "./notes-toolbar-config";

const MAX_MEDIA_MB = 20;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("read failed"));
    reader.readAsDataURL(file);
  });
}

function syncToolbarFromEditor(editor: Editor) {
  let styleId = "p";
  if (editor.isActive("heading", { level: 1 })) styleId = "1";
  else if (editor.isActive("heading", { level: 2 })) styleId = "2";
  else if (editor.isActive("heading", { level: 3 })) styleId = "3";

  const ff = (editor.getAttributes("textStyle").fontFamily as string | undefined) ?? "";
  let fontId = "default";
  if (ff) {
    const hit = FONT_FAMILIES.find((f) => f.css && ff.includes(f.css.split(",")[0]!.replace(/"/g, "")));
    if (hit) fontId = hit.id;
  }

  const fs = (editor.getAttributes("textStyle").fontSize as string | undefined) ?? "";
  let sizeId = "16";
  const sizeHit = FONT_SIZES.find((s) => s.css === fs);
  if (sizeHit) sizeId = sizeHit.id;

  return { styleId, fontId, sizeId };
}

export type RichNotesEditorProps = {
  initialHtml: string;
  onHtmlChange: (html: string) => void;
  exportFileName: string;
  contentRef?: React.RefObject<HTMLDivElement | null>;
  isFullscreen?: boolean;
  editorKey?: string;
};

export function RichNotesEditor({
  initialHtml,
  onHtmlChange,
  exportFileName,
  contentRef,
  isFullscreen = false,
  editorKey,
}: RichNotesEditorProps) {
  const internalRef = useRef<HTMLDivElement>(null);
  const printRef = contentRef ?? internalRef;
  const seededKey = useRef<string | null>(null);
  const [tableDialogOpen, setTableDialogOpen] = useState(false);
  const [inTable, setInTable] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const [fontId, setFontId] = useState("default");
  const [sizeId, setSizeId] = useState("16");
  const [styleId, setStyleId] = useState("p");

  const refreshHistory = useCallback((ed: Editor) => {
    setCanUndo(ed.can().undo());
    setCanRedo(ed.can().redo());
    setInTable(ed.isActive("table"));
  }, []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        orderedList: false,
      }),
      OrderedListWithStyle,
      Underline,
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      Highlight.configure({ multicolor: true }),
      ImageResize.configure({ inline: false, allowBase64: true }),
      Video,
      Table.configure({ resizable: true, allowTableNodeSelection: true }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder: "Start typing your symposium notes…" }),
    ],
    content: initialHtml || "<p></p>",
    editorProps: {
      attributes: {
        class: "portal-notes-prose px-4 py-3 focus:outline-none",
        style: isFullscreen ? "min-height: calc(100vh - 220px)" : "min-height: 280px",
      },
    },
    onUpdate: ({ editor: ed }) => {
      onHtmlChange(ed.getHTML());
      const synced = syncToolbarFromEditor(ed);
      setFontId(synced.fontId);
      setSizeId(synced.sizeId);
      setStyleId(synced.styleId);
      refreshHistory(ed);
    },
    onSelectionUpdate: ({ editor: ed }) => {
      const synced = syncToolbarFromEditor(ed);
      setFontId(synced.fontId);
      setSizeId(synced.sizeId);
      setStyleId(synced.styleId);
      refreshHistory(ed);
    },
    onTransaction: ({ editor: ed }) => {
      refreshHistory(ed);
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (editorKey && seededKey.current === editorKey) return;
    if (editorKey) seededKey.current = editorKey;
    editor.commands.setContent(initialHtml || "<p></p>", { emitUpdate: false });
    const synced = syncToolbarFromEditor(editor);
    setFontId(synced.fontId);
    setSizeId(synced.sizeId);
    setStyleId(synced.styleId);
    refreshHistory(editor);
  }, [editor, initialHtml, editorKey, refreshHistory]);

  useEffect(() => {
    if (!editor) return;
    const minH = isFullscreen ? "calc(100vh - 220px)" : "280px";
    editor.setOptions({
      editorProps: {
        attributes: {
          class: "portal-notes-prose px-4 py-3 focus:outline-none",
          style: `min-height: ${minH}`,
        },
      },
    });
  }, [editor, isFullscreen]);

  const applyFontFamily = useCallback(
    (id: string) => {
      if (!editor) return;
      setFontId(id);
      const font = FONT_FAMILIES.find((f) => f.id === id);
      if (!font || id === "default") editor.chain().focus().unsetFontFamily().run();
      else editor.chain().focus().setFontFamily(font.css).run();
    },
    [editor],
  );

  const applyFontSize = useCallback(
    (id: string) => {
      if (!editor) return;
      setSizeId(id);
      const size = FONT_SIZES.find((s) => s.id === id);
      if (size) editor.chain().focus().setFontSize(size.css).run();
    },
    [editor],
  );

  const applyBlockStyle = useCallback(
    (id: string) => {
      if (!editor) return;
      setStyleId(id);
      if (id === "p") editor.chain().focus().setParagraph().run();
      else editor.chain().focus().toggleHeading({ level: Number(id) as 1 | 2 | 3 }).run();
    },
    [editor],
  );

  const applyListStyle = useCallback(
    (style: ListStyleType | "bullet") => {
      if (!editor) return;
      if (style === "bullet") {
        editor.chain().focus().toggleBulletList().run();
        return;
      }
      editor.chain().focus().toggleOrderedListWithStyle(style).run();
    },
    [editor],
  );

  const insertMedia = useCallback(
    (kind: "image" | "video") => {
      if (!editor) return;
      const input = document.createElement("input");
      input.type = "file";
      input.accept = kind === "image" ? "image/*" : "video/*";
      input.multiple = kind === "image";
      input.onchange = async () => {
        const files = input.files;
        if (!files?.length) return;
        for (const file of Array.from(files)) {
          if (file.size > MAX_MEDIA_MB * 1024 * 1024) {
            window.alert(`"${file.name}" is too large. Max ${MAX_MEDIA_MB} MB.`);
            continue;
          }
          try {
            const src = await readFileAsDataUrl(file);
            if (kind === "image") editor.chain().focus().setImage({ src }).run();
            else editor.chain().focus().setVideo({ src }).run();
          } catch {
            window.alert(`Could not add ${file.name}.`);
          }
        }
      };
      input.click();
    },
    [editor],
  );

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const exportPdf = useCallback(async () => {
    const el = printRef.current;
    if (!el) return;
    try {
      await exportElementToPdf(el, exportFileName);
    } catch {
      window.alert("Could not export PDF. Try again or shorten your notes.");
    }
  }, [exportFileName, printRef]);

  if (!editor) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        Loading editor…
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {inTable && (
        <div className="flex flex-wrap items-center gap-1 border-b border-border bg-blue/5 px-2 py-1.5 shrink-0">
          <span className="text-[10px] font-semibold uppercase text-muted-foreground mr-1">Table</span>
          <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={() => editor.chain().focus().addRowBefore().run()}>
            <Rows className="h-3 w-3 mr-1" /> Row above
          </Button>
          <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={() => editor.chain().focus().addRowAfter().run()}>
            Row below
          </Button>
          <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={() => editor.chain().focus().deleteRow().run()}>
            Del row
          </Button>
          <Separator orientation="vertical" className="h-5" />
          <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={() => editor.chain().focus().addColumnBefore().run()}>
            <Columns className="h-3 w-3 mr-1" /> Col left
          </Button>
          <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={() => editor.chain().focus().addColumnAfter().run()}>
            Col right
          </Button>
          <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={() => editor.chain().focus().deleteColumn().run()}>
            Del col
          </Button>
          <Button type="button" variant="ghost" size="sm" className="h-7 text-xs text-destructive" onClick={() => editor.chain().focus().deleteTable().run()}>
            <Trash2 className="h-3 w-3 mr-1" /> Delete table
          </Button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-secondary/30 px-2 py-2 shrink-0 max-h-[160px] overflow-y-auto overflow-x-hidden">
        <ToolbarNativeSelect aria-label="Font family" value={fontId} onChange={applyFontFamily} options={FONT_FAMILIES} className="w-[130px]" />
        <ToolbarNativeSelect aria-label="Font size" value={sizeId} onChange={applyFontSize} options={FONT_SIZES} className="w-[76px]" />
        <ToolbarNativeSelect aria-label="Paragraph style" value={styleId} onChange={applyBlockStyle} options={BLOCK_STYLES} className="w-[108px]" />

        <Separator orientation="vertical" className="mx-0.5 h-6" />

        <Toggle size="sm" pressed={editor.isActive("bold")} onPressedChange={() => editor.chain().focus().toggleBold().run()} aria-label="Bold">
          <Bold className="h-3.5 w-3.5" />
        </Toggle>
        <Toggle size="sm" pressed={editor.isActive("italic")} onPressedChange={() => editor.chain().focus().toggleItalic().run()} aria-label="Italic">
          <Italic className="h-3.5 w-3.5" />
        </Toggle>
        <Toggle size="sm" pressed={editor.isActive("underline")} onPressedChange={() => editor.chain().focus().toggleUnderline().run()} aria-label="Underline">
          <UnderlineIcon className="h-3.5 w-3.5" />
        </Toggle>
        <Toggle size="sm" pressed={editor.isActive("strike")} onPressedChange={() => editor.chain().focus().toggleStrike().run()} aria-label="Strikethrough">
          <Strikethrough className="h-3.5 w-3.5" />
        </Toggle>

        <Separator orientation="vertical" className="mx-0.5 h-6" />

        <div className="flex items-center gap-0.5 px-0.5">
          {TEXT_COLORS.map((c) => (
            <button key={c} type="button" title={`Text color ${c}`} className="h-5 w-5 rounded-full border border-border shrink-0 hover:scale-110" style={{ backgroundColor: c }} onClick={() => editor.chain().focus().setColor(c).run()} />
          ))}
          <input type="color" className="h-6 w-6 cursor-pointer rounded border-0 bg-transparent p-0" title="Custom text color" onChange={(e) => editor.chain().focus().setColor(e.target.value).run()} />
        </div>

        <Separator orientation="vertical" className="mx-0.5 h-6" />

        <Toggle size="sm" pressed={editor.isActive({ textAlign: "left" })} onPressedChange={() => editor.chain().focus().setTextAlign("left").run()}>
          <AlignLeft className="h-3.5 w-3.5" />
        </Toggle>
        <Toggle size="sm" pressed={editor.isActive({ textAlign: "center" })} onPressedChange={() => editor.chain().focus().setTextAlign("center").run()}>
          <AlignCenter className="h-3.5 w-3.5" />
        </Toggle>
        <Toggle size="sm" pressed={editor.isActive({ textAlign: "right" })} onPressedChange={() => editor.chain().focus().setTextAlign("right").run()}>
          <AlignRight className="h-3.5 w-3.5" />
        </Toggle>
        <Toggle size="sm" pressed={editor.isActive({ textAlign: "justify" })} onPressedChange={() => editor.chain().focus().setTextAlign("justify").run()}>
          <AlignJustify className="h-3.5 w-3.5" />
        </Toggle>

        <Separator orientation="vertical" className="mx-0.5 h-6" />

        <Toggle size="sm" pressed={editor.isActive("bulletList")} onPressedChange={() => applyListStyle("bullet")} aria-label="Bullet list" title="Bullet list">
          <List className="h-3.5 w-3.5" />
        </Toggle>
        <Toggle size="sm" pressed={editor.isActive("orderedList", { listStyleType: "decimal" })} onPressedChange={() => applyListStyle("decimal")} aria-label="Numbered list" title="1. 2. 3.">
          <ListOrdered className="h-3.5 w-3.5" />
        </Toggle>
        <Button type="button" variant={editor.isActive("orderedList", { listStyleType: "lower-alpha" }) ? "secondary" : "ghost"} size="sm" className="h-8 px-2 text-xs font-mono" onClick={() => applyListStyle("lower-alpha")} title="a. b. c.">
          a.
        </Button>
        <Button type="button" variant={editor.isActive("orderedList", { listStyleType: "upper-alpha" }) ? "secondary" : "ghost"} size="sm" className="h-8 px-2 text-xs font-mono" onClick={() => applyListStyle("upper-alpha")} title="A. B. C.">
          A.
        </Button>
        <Button type="button" variant={editor.isActive("orderedList", { listStyleType: "lower-roman" }) ? "secondary" : "ghost"} size="sm" className="h-8 px-2 text-xs font-mono" onClick={() => applyListStyle("lower-roman")} title="i. ii. iii.">
          i.
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal rule">
          <Minus className="h-3.5 w-3.5" />
        </Button>

        <Separator orientation="vertical" className="mx-0.5 h-6" />

        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" title="Insert table" onClick={() => setTableDialogOpen(true)}>
          <Table2 className="h-3.5 w-3.5" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" title="Insert photo(s)" onClick={() => insertMedia("image")}>
          <ImageIcon className="h-3.5 w-3.5" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" title="Insert video" onClick={() => insertMedia("video")}>
          <VideoIcon className="h-3.5 w-3.5" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" title="Insert link" onClick={setLink}>
          <Link2 className="h-3.5 w-3.5" />
        </Button>

        <Separator orientation="vertical" className="mx-0.5 h-6" />

        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" disabled={!canUndo} onClick={() => editor.chain().focus().undo().run()} title="Undo (Ctrl+Z)">
          <Undo2 className="h-3.5 w-3.5" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" disabled={!canRedo} onClick={() => editor.chain().focus().redo().run()} title="Redo (Ctrl+Y)">
          <Redo2 className="h-3.5 w-3.5" />
        </Button>

        <Button type="button" variant="outline" size="sm" className="h-8 ml-auto gap-1 text-xs shrink-0" onClick={exportPdf}>
          <Download className="h-3.5 w-3.5" />
          PDF
        </Button>
      </div>

      <TableInsertPanel
        open={tableDialogOpen}
        onOpenChange={setTableDialogOpen}
        onInsert={(rows, cols, withHeaderRow) => {
          editor.chain().focus().insertTable({ rows, cols, withHeaderRow }).run();
        }}
      />

      <div ref={printRef} className="flex-1 overflow-y-auto bg-white dark:bg-card min-h-0 portal-notes-editor-body">
        <EditorContent editor={editor} className="h-full [&_.ProseMirror]:min-h-full" />
      </div>
    </div>
  );
}

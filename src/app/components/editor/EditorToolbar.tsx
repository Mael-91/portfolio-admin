import React from "react";
import { Editor } from "@tiptap/react";

type EditorToolbarProps = {
  editor: Editor | null;
};

export function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) {
    return null;
  }

  function handleMouseDown(
    event: React.MouseEvent<HTMLButtonElement>,
    action: () => void
  ) {
    event.preventDefault();
    action();
  }

  function getButtonClass(isActive: boolean) {
    return [
      "inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-medium transition",
      isActive
        ? "bg-admin-accent text-white shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
        : "bg-white/[0.04] text-admin-text-soft hover:bg-white/[0.08] hover:text-white",
    ].join(" ");
  }

  return (
    <div className="flex flex-wrap gap-2 rounded-t-2xl border border-white/10 border-b-0 bg-white/[0.02] px-3 py-3">
      <button
        type="button"
        onMouseDown={(event) =>
          handleMouseDown(event, () =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          )
        }
        className={getButtonClass(editor.isActive("heading", { level: 1 }))}
      >
        H1
      </button>

      <button
        type="button"
        onMouseDown={(event) =>
          handleMouseDown(event, () =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          )
        }
        className={getButtonClass(editor.isActive("heading", { level: 2 }))}
      >
        H2
      </button>

      <button
        type="button"
        onMouseDown={(event) =>
          handleMouseDown(event, () =>
            editor.chain().focus().toggleBold().run()
          )
        }
        className={getButtonClass(editor.isActive("bold"))}
        aria-label="Gras"
        title="Gras"
      >
        <span className="font-bold">B</span>
      </button>

      <button
        type="button"
        onMouseDown={(event) =>
          handleMouseDown(event, () =>
            editor.chain().focus().toggleItalic().run()
          )
        }
        className={getButtonClass(editor.isActive("italic"))}
        aria-label="Italique"
        title="Italique"
      >
        <span className="italic">I</span>
      </button>

      <button
        type="button"
        onMouseDown={(event) =>
          handleMouseDown(event, () =>
            editor.chain().focus().toggleBulletList().run()
          )
        }
        className={getButtonClass(editor.isActive("bulletList"))}
        aria-label="Liste à puces"
        title="Liste à puces"
      >
        • Liste
      </button>

      <button
        type="button"
        onMouseDown={(event) =>
          handleMouseDown(event, () =>
            editor.chain().focus().setParagraph().run()
          )
        }
        className={getButtonClass(editor.isActive("paragraph"))}
      >
        Texte
      </button>
    </div>
  );
}
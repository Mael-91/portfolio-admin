import React from "react";
import { Editor } from "@tiptap/react";

type EditorToolbarProps = {
  editor: Editor | null;
  onPreview?: () => void;
};

export function EditorToolbar({ editor, onPreview }: EditorToolbarProps) {
  if (!editor) {
    return null;
  }

  const e = editor;

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
      "cursor-pointer",
      "active:scale-[0.96]",
      isActive
        ? "bg-admin-accent text-white shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
        : "bg-white/[0.04] text-admin-text-soft hover:bg-white/[0.08] hover:text-white",
    ].join(" ");
  }

  function handleSetLink(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();

    const previousUrl = e.getAttributes("link").href || "";
    const url = window.prompt("URL du lien", previousUrl);

    if (url === null) {
      return;
    }

    if (url.trim() === "") {
      e.chain().focus().unsetLink().run();
      return;
    }

    e.chain().focus().setLink({ href: url.trim() }).run();
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-t-2xl border border-white/10 border-b-0 bg-white/[0.02] px-3 py-3">
      <button
        type="button"
        onMouseDown={(event) =>
          handleMouseDown(event, () =>
            e.chain().focus().toggleHeading({ level: 1 }).run()
          )
        }
        className={getButtonClass(e.isActive("heading", { level: 1 }))}
      >
        H1
      </button>

      <button
        type="button"
        onMouseDown={(event) =>
          handleMouseDown(event, () =>
            e.chain().focus().toggleHeading({ level: 2 }).run()
          )
        }
        className={getButtonClass(e.isActive("heading", { level: 2 }))}
      >
        H2
      </button>

      <button
        type="button"
        onMouseDown={(event) =>
          handleMouseDown(event, () =>
            e.chain().focus().toggleBold().run()
          )
        }
        className={getButtonClass(e.isActive("bold"))}
        title="Gras"
      >
        <span className="font-bold">B</span>
      </button>

      <button
        type="button"
        onMouseDown={(event) =>
          handleMouseDown(event, () =>
            e.chain().focus().toggleItalic().run()
          )
        }
        className={getButtonClass(e.isActive("italic"))}
        title="Italique"
      >
        <span className="italic">I</span>
      </button>

      <button
        type="button"
        onMouseDown={(event) =>
          handleMouseDown(event, () =>
            e.chain().focus().toggleUnderline().run()
          )
        }
        className={getButtonClass(e.isActive("underline"))}
        title="Souligné"
      >
        <span className="underline">U</span>
      </button>

      <button
        type="button"
        onMouseDown={(event) =>
          handleMouseDown(event, () =>
            e.chain().focus().toggleBulletList().run()
          )
        }
        className={getButtonClass(e.isActive("bulletList"))}
        title="Liste à puces"
      >
        • Liste
      </button>

      <button
        type="button"
        onMouseDown={(event) =>
          handleMouseDown(event, () =>
            e.chain().focus().toggleOrderedList().run()
          )
        }
        className={getButtonClass(e.isActive("orderedList"))}
        title="Liste numérotée"
      >
        1. Liste
      </button>

      <button
        type="button"
        onMouseDown={(event) =>
          handleMouseDown(event, () =>
            e.chain().focus().toggleBlockquote().run()
          )
        }
        className={getButtonClass(e.isActive("blockquote"))}
        title="Citation"
      >
        “ ”
      </button>

      <button
        type="button"
        onMouseDown={(event) =>
          handleMouseDown(event, () =>
            e.chain().focus().setHorizontalRule().run()
          )
        }
        className={getButtonClass(false)}
        title="Séparateur"
      >
        ―
      </button>

      <button
        type="button"
        onMouseDown={handleSetLink}
        className={getButtonClass(e.isActive("link"))}
        title="Lien"
      >
        Lien
      </button>

      <button
        type="button"
        onMouseDown={(event) =>
          handleMouseDown(event, () =>
            e.chain().focus().setParagraph().run()
          )
        }
        className={getButtonClass(e.isActive("paragraph"))}
      >
        Texte
      </button>

      <div className="ml-auto">
        <button
          type="button"
          onMouseDown={(event) => {
            event.preventDefault();
            onPreview?.();
          }}
          className="inline-flex items-center justify-center rounded-lg bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/[0.12] cursor-pointer active:scale-[0.96]"
        >
          Aperçu
        </button>
      </div>
    </div>
  );
}
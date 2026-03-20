import { Editor } from "@tiptap/react";

type EditorToolbarProps = {
  editor: Editor | null;
};

export function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) {
    return null;
  }

  const btn =
    "rounded-lg bg-white/[0.04] px-3 py-1.5 text-xs text-white transition hover:bg-white/[0.1]";

  return (
    <div className="flex flex-wrap gap-2 rounded-t-2xl border border-white/10 border-b-0 px-3 py-3">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={btn}
      >
        H1
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={btn}
      >
        H2
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={btn}
      >
        <span className="font-bold">B</span>
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={btn}
      >
        <span className="italic">I</span>
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={btn}
      >
        • Liste
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().setParagraph().run()}
        className={btn}
      >
        Texte
      </button>
    </div>
  );
}
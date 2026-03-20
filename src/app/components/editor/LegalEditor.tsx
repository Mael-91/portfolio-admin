import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";
import { EditorToolbar } from "../editor/EditorToolbar";

type LegalEditorProps = {
  content: string;
  onChange: (html: string) => void;
};

export function LegalEditor({ content, onChange }: LegalEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "min-h-[420px] rounded-b-2xl border border-t-0 border-white/10 bg-white/[0.02] px-5 py-4 text-sm text-white outline-none prose prose-invert max-w-none focus:outline-none",
      },
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    const current = editor.getHTML();

    if (content !== current) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-lg shadow-black/10">
      <EditorToolbar editor={editor} />

      <div className="bg-white/[0.02]">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
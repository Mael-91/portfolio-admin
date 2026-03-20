import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

type BaseEditorProps = {
  content: string;
  onChange: (html: string) => void;
  className?: string;
};

export function BaseEditor({
  content,
  onChange,
  className,
}: BaseEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: `min-h-[300px] px-4 py-4 outline-none ${className ?? ""}`,
      },
    },
  });

  useEffect(() => {
    if (!editor) return;

    const current = editor.getHTML();

    if (content !== current) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return <EditorContent editor={editor} />;
}
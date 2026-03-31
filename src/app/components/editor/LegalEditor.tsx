import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { useEffect, useState } from "react";
import { EditorToolbar } from "../editor/EditorToolbar";
import { LegalPreviewModal } from "../legal/LegalPreviewModal";

type LegalEditorProps = {
  content: string;
  onChange: (html: string) => void;
};

export function LegalEditor({ content, onChange }: LegalEditorProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
      }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: [
          "ProseMirror",
          "min-h-[420px]",
          "rounded-b-2xl",
          "border",
          "border-t-0",
          "border-white/10",
          "bg-white/[0.02]",
          "px-5",
          "py-4",
          "text-sm",
          "text-white",
          "outline-none",
          "max-w-none",
          "focus:outline-none",
          "font-normal",
        ].join(" "),
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
    <>
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-lg shadow-black/10">
        <EditorToolbar
          editor={editor}
          onPreview={() => setIsPreviewOpen(true)}
        />

        <div className="bg-white/[0.02]">
          <EditorContent editor={editor} />
        </div>

        <style>{`
            .ProseMirror {
                font-weight: 400 !important;
                color: rgba(255,255,255,0.92);
            }

            .ProseMirror * {
                font-weight: inherit;
            }

            .ProseMirror p {
                margin: 0.75rem 0;
                font-weight: 400 !important;
                color: rgba(255,255,255,0.92);
            }

            .ProseMirror strong,
            .ProseMirror b {
                font-weight: 600 !important;
                color: #ffffff;
            }

            .ProseMirror em,
            .ProseMirror i {
                font-style: italic;
            }

            .ProseMirror u {
                text-decoration: underline;
            }

            .ProseMirror h1 {
                font-size: 1.875rem;
                line-height: 2.25rem;
                font-weight: 700 !important;
                margin-top: 1.5rem;
                margin-bottom: 0.75rem;
                color: #ffffff;
            }

            .ProseMirror h2 {
                font-size: 1.5rem;
                line-height: 2rem;
                font-weight: 700 !important;
                margin-top: 1.25rem;
                margin-bottom: 0.65rem;
                color: #ffffff;
            }

            .ProseMirror ul {
                list-style-type: disc;
                padding-left: 1.5rem;
                margin: 0.75rem 0;
            }

            .ProseMirror ol {
                list-style-type: decimal;
                padding-left: 1.5rem;
                margin: 0.75rem 0;
            }

            .ProseMirror li {
                margin: 0.25rem 0;
            }

            .ProseMirror blockquote {
                border-left: 3px solid rgba(255,255,255,0.25);
                padding-left: 1rem;
                margin: 1rem 0;
                color: rgba(255,255,255,0.75);
                font-style: italic;
            }

            .ProseMirror hr {
                border: none;
                border-top: 1px solid rgba(255,255,255,0.15);
                margin: 1.25rem 0;
            }

            .ProseMirror a {
                color: #7dd3fc;
                text-decoration: underline;
            }

            .ProseMirror:focus {
                outline: none;
            }

            .legal-preview {
                font-weight: 400;
                color: #0f172a;
            }

            .legal-preview strong,
            .legal-preview b {
                font-weight: 700 !important;
            }

            .legal-preview h1 {
                font-size: 2rem;
                line-height: 2.5rem;
                font-weight: 700;
                margin: 1.5rem 0 1rem;
            }

            .legal-preview h2 {
                font-size: 1.5rem;
                line-height: 2rem;
                font-weight: 700;
                margin: 1.25rem 0 0.75rem;
            }

            .legal-preview p {
                margin: 0.75rem 0;
                line-height: 1.75;
                font-weight: 400;
            }

            .legal-preview ul {
                list-style: disc;
                padding-left: 1.5rem;
                margin: 0.75rem 0;
            }

            .legal-preview ol {
                list-style: decimal;
                padding-left: 1.5rem;
                margin: 0.75rem 0;
            }

            .legal-preview blockquote {
                border-left: 3px solid #cbd5e1;
                padding-left: 1rem;
                color: #475569;
                font-style: italic;
                margin: 1rem 0;
            }

            .legal-preview hr {
                border: none;
                border-top: 1px solid #cbd5e1;
                margin: 1.25rem 0;
            }

            .legal-preview a {
                color: #2563eb;
                text-decoration: underline;
            }
        `}</style>
      </div>

      <LegalPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        html={editor.getHTML()}
      />
    </>
  );
}
import { EditorContent, useEditor } from '@tiptap/react'
import type React from 'react'
import { useEffect, useRef } from 'react'
import 'plyr/dist/plyr.css'
import 'katex/dist/katex.css'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/animations/shift-away.css'
import './index.less'
import { StarterKit } from './extensions/starter-kit'

export interface TiptapEditorProps {
  content?: string
  onChange?: (content: string) => void
  onUpdate?: (markdown: string) => void
  readOnly?: boolean
  className?: string
  placeholder?: string
}

export const TiptapEditor: React.FC<TiptapEditorProps> = ({
  content = '',
  onChange,
  onUpdate,
  readOnly = false,
  className = '',
  placeholder = 'Start writing...',
}) => {
  const initialContent = useRef(content)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // 禁用其他不需要的扩展
        details: false,
        detailsContent: false,
        detailsSummary: false,
        // table: false,
        // tableRow: false,
        // tableCell: false,
        // tableHeader: false,
        emoji: false,
        embed: false,
        image: false,
        audio: false,
        video: false,
        plantuml: false,
        mathBlock: false,
        mathInline: false,
        uploader: false,
        duplicateBlock: false,
      }),
    ],
    content: initialContent.current,
    editable: !readOnly,
    editorProps: {
      attributes: {
        class: `ProseMirror-editor ${className}`,
        'data-placeholder': placeholder,
      },
    },
    onCreate: ({ editor }) => {
      if (initialContent.current && (editor.storage as any).markdown) {
        const doc = (editor.storage as any).markdown.parse(initialContent.current)
        if (doc) {
          editor.commands.setContent(doc.toJSON())
        }
      }
    },
    onUpdate: ({ editor }) => {
      if ((editor.storage as any).markdown) {
        const markdown = (editor.storage as any).markdown.get()
        onUpdate?.(markdown)
        onChange?.(markdown)
      }
    },
  })

  useEffect(() => {
    if (editor && content !== initialContent.current) {
      const currentMarkdown = (editor.storage as any).markdown?.get()
      if (currentMarkdown !== content) {
        const doc = (editor.storage as any).markdown?.parse(content)
        if (doc) {
          editor.commands.setContent(doc.toJSON())
        }
      }
    }
  }, [content, editor])

  useEffect(() => {
    if (editor) {
      editor.setEditable(!readOnly)
    }
  }, [readOnly, editor])

  return (
    <div className="tiptap-editor-wrapper">
      <EditorContent editor={editor} />
    </div>
  )
}

export default TiptapEditor

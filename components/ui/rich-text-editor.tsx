'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Undo,
  Redo,
  Quote,
} from 'lucide-react'
import { Button } from './button'
import { useCallback } from 'react'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  disabled?: boolean
  minHeightClassName?: string
}

const RichTextEditor = ({
  content,
  onChange,
  disabled = false,
  minHeightClassName = "min-h-[320px]",
}: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline',
        },
      }),
    ],
    content,
    editable: !disabled,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  const setLink = useCallback(() => {
    if (!editor) return

    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)

    // cancelled
    if (url === null) {
      return
    }

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    // update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  if (!editor) {
    return null
  }

  return (
    <div className="border rounded-lg overflow-hidden border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-950">
      {/* Toolbar */}
      <div className="bg-slate-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 p-2 flex flex-wrap gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run() || disabled}
          className={editor.isActive('bold') ? 'bg-slate-200 dark:bg-zinc-700 text-slate-900 dark:text-zinc-100' : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800'}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run() || disabled}
          className={editor.isActive('italic') ? 'bg-slate-200 dark:bg-zinc-700 text-slate-900 dark:text-zinc-100' : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800'}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          disabled={!editor.can().chain().focus().toggleUnderline().run() || disabled}
          className={editor.isActive('underline') ? 'bg-slate-200 dark:bg-zinc-700 text-slate-900 dark:text-zinc-100' : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800'}
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-slate-300 dark:bg-zinc-700 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          disabled={disabled}
          className={editor.isActive('heading', { level: 1 }) ? 'bg-slate-200 dark:bg-zinc-700 text-slate-900 dark:text-zinc-100' : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800'}
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          disabled={disabled}
          className={editor.isActive('heading', { level: 2 }) ? 'bg-slate-200 dark:bg-zinc-700 text-slate-900 dark:text-zinc-100' : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800'}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          disabled={disabled}
          className={editor.isActive('heading', { level: 3 }) ? 'bg-slate-200 dark:bg-zinc-700 text-slate-900 dark:text-zinc-100' : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800'}
        >
          <Heading3 className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-slate-300 dark:bg-zinc-700 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          disabled={disabled}
          className={editor.isActive('bulletList') ? 'bg-slate-200 dark:bg-zinc-700 text-slate-900 dark:text-zinc-100' : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800'}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          disabled={disabled}
          className={editor.isActive('orderedList') ? 'bg-slate-200 dark:bg-zinc-700 text-slate-900 dark:text-zinc-100' : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800'}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          disabled={disabled}
          className={editor.isActive('blockquote') ? 'bg-slate-200 dark:bg-zinc-700 text-slate-900 dark:text-zinc-100' : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800'}
        >
          <Quote className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-slate-300 dark:bg-zinc-700 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={setLink}
          disabled={disabled}
          className={editor.isActive('link') ? 'bg-slate-200 dark:bg-zinc-700 text-slate-900 dark:text-zinc-100' : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800'}
        >
          <LinkIcon className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-slate-300 dark:bg-zinc-700 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run() || disabled}
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run() || disabled}
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor */}
      <EditorContent
        editor={editor}
        className={`prose prose-sm dark:prose-invert max-w-none p-4 ${minHeightClassName} focus:outline-none text-slate-800 dark:text-zinc-100`}
      />
    </div>
  )
}

export default RichTextEditor

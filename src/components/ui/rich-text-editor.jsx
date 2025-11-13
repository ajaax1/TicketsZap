"use client"

import * as React from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { TextStyle } from "@tiptap/extension-text-style"
import { Color } from "@tiptap/extension-color"
import TextAlign from "@tiptap/extension-text-align"
import UnderlineExtension from "@tiptap/extension-underline"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  List,
  ListOrdered,
  Undo,
  Redo,
  Palette
} from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const RichTextEditor = React.forwardRef(function RichTextEditor(
  { className, value, onChange, placeholder, rows = 5, error, ...props },
  ref
) {
  const [textColor, setTextColor] = React.useState("#000000")

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
      }),
      TextStyle,
      Color,
      UnderlineExtension,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange?.({
        target: {
          value: html,
        },
      })
    },
    editorProps: {
      attributes: {
        class: cn(
          "focus:outline-none px-3 py-2",
          "[&_p]:my-1 [&_p]:leading-relaxed",
          "[&_ul]:my-1 [&_ol]:my-1",
          "[&_li]:my-0"
        ),
        "data-placeholder": placeholder,
      },
    },
  })

  React.useImperativeHandle(ref, () => ({
    focus: () => editor?.commands.focus(),
    blur: () => editor?.commands.blur(),
  }))

  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "")
    }
  }, [value, editor])

  if (!editor) {
    return null
  }

  const handleColorChange = (color) => {
    setTextColor(color)
    editor.chain().focus().setColor(color).run()
  }

  const colors = [
    "#000000", "#FFFFFF", "#FF0000", "#00FF00", "#0000FF",
    "#FFFF00", "#FF00FF", "#00FFFF", "#808080", "#800000",
    "#008000", "#000080", "#808000", "#800080", "#008080",
    "#C0C0C0", "#FF8080", "#80FF80", "#8080FF", "#FF8080"
  ]

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap items-center gap-1 p-2 border rounded-md bg-muted/30">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn("h-8 w-8 p-0", editor.isActive("bold") && "bg-accent")}
          title="Negrito"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn("h-8 w-8 p-0", editor.isActive("italic") && "bg-accent")}
          title="Itálico"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={cn("h-8 w-8 p-0", editor.isActive("underline") && "bg-accent")}
          title="Sublinhado"
        >
          <Underline className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={cn("h-8 w-8 p-0", editor.isActive("strike") && "bg-accent")}
          title="Tachado"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        <div className="h-6 w-px bg-border mx-1" />
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn("h-8 w-8 p-0", editor.isActive("textStyle") && "bg-accent")}
              title="Cor do texto"
            >
              <Palette className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Cor do texto</label>
              <div className="grid grid-cols-10 gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleColorChange(color)}
                    className={cn(
                      "h-8 w-8 rounded border-2 transition-all hover:scale-110",
                      textColor === color ? "border-primary ring-2 ring-primary/20" : "border-border"
                    )}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 pt-2 border-t">
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="h-8 w-full cursor-pointer rounded border"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <div className="h-6 w-px bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={cn("h-8 w-8 p-0", editor.isActive({ textAlign: "left" }) && "bg-accent")}
          title="Alinhar à esquerda"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={cn("h-8 w-8 p-0", editor.isActive({ textAlign: "center" }) && "bg-accent")}
          title="Centralizar"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={cn("h-8 w-8 p-0", editor.isActive({ textAlign: "right" }) && "bg-accent")}
          title="Alinhar à direita"
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <div className="h-6 w-px bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn("h-8 w-8 p-0", editor.isActive("bulletList") && "bg-accent")}
          title="Lista com marcadores"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn("h-8 w-8 p-0", editor.isActive("orderedList") && "bg-accent")}
          title="Lista numerada"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <div className="h-6 w-px bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="h-8 w-8 p-0"
          title="Desfazer"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="h-8 w-8 p-0"
          title="Refazer"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>
      <div
        className={cn(
          "border rounded-md bg-transparent shadow-xs transition-[color,box-shadow]",
          "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
          error && "border-destructive ring-destructive/20",
          className
        )}
        style={{ minHeight: `${rows * 20 + 16}px` }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  )
})

RichTextEditor.displayName = "RichTextEditor"

export { RichTextEditor }

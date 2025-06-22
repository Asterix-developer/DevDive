"use client"

import type React from "react"

import { useEffect, useRef } from "react"

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language: string
}

export default function CodeEditor({ value, onChange, language }: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px"
    }
  }, [value])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Tab") {
      e.preventDefault()
      const textarea = e.target as HTMLTextAreaElement
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newValue = value.substring(0, start) + "  " + value.substring(end)
      onChange(newValue)

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2
      }, 0)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="bg-slate-900 px-4 py-2 border-b border-gray-700">
        <span className="text-gray-400 text-sm font-mono">Mission Code:</span>
      </div>
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full h-full bg-slate-900 text-gray-100 font-mono text-sm p-4 resize-none outline-none border-none"
          style={{ minHeight: "400px" }}
          spellCheck={false}
        />

        {/* Syntax highlighting overlay would go here in a real implementation */}
        <div className="absolute top-4 right-4 text-xs text-gray-500 font-mono">{language.toUpperCase()}</div>
      </div>
    </div>
  )
}

"use client"

import { useEffect, useRef, useState } from "react"
import Editor from "@monaco-editor/react"
import type { editor } from "monaco-editor"

interface MonacoCodeEditorProps {
  value: string
  onChange: (value: string) => void
  language: string
  height?: string
}

export default function MonacoCodeEditor({
  value,
  onChange,
  language = "javascript",
  height = "500px",
}: MonacoCodeEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isEditorReady, setIsEditorReady] = useState(false)

  // Suppress ResizeObserver errors
  useEffect(() => {
    const originalError = console.error
    console.error = (...args) => {
      if (
        typeof args[0] === "string" &&
        args[0].includes("ResizeObserver loop completed with undelivered notifications")
      ) {
        return
      }
      originalError(...args)
    }

    return () => {
      console.error = originalError
    }
  }, [])

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor
    setIsEditorReady(true)

    // Configure editor with debounced resize
    editor.updateOptions({
      fontSize: 14,
      fontFamily: "'Fira Code', 'Monaco', 'Menlo', monospace",
      lineNumbers: "on",
      roundedSelection: false,
      scrollBeyondLastLine: false,
      automaticLayout: true,
      minimap: { enabled: false },
      folding: true,
      lineDecorationsWidth: 10,
      lineNumbersMinChars: 3,
      renderLineHighlight: "line",
      selectionHighlight: false,
      occurrencesHighlight: "off",
      overviewRulerBorder: false,
      hideCursorInOverviewRuler: true,
      scrollbar: {
        vertical: "visible",
        horizontal: "visible",
        verticalScrollbarSize: 8,
        horizontalScrollbarSize: 8,
      },
    })

    // Debounced resize handler
    let resizeTimeout: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        try {
          editor.layout()
        } catch (error) {
          // Ignore layout errors
        }
      }, 100)
    }

    // Use ResizeObserver with error handling
    if (containerRef.current && window.ResizeObserver) {
      const resizeObserver = new ResizeObserver(() => {
        handleResize()
      })

      try {
        resizeObserver.observe(containerRef.current)
      } catch (error) {
        // Fallback to window resize
        window.addEventListener("resize", handleResize)
      }

      return () => {
        try {
          resizeObserver.disconnect()
        } catch (error) {
          // Ignore disconnect errors
        }
        window.removeEventListener("resize", handleResize)
        clearTimeout(resizeTimeout)
      }
    }
  }

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      onChange(value)
    }
  }

  useEffect(() => {
    // Configure Monaco themes and RxJS intellisense
    const configureMonaco = async () => {
      try {
        const monaco = await import("monaco-editor")

        // Define custom dark theme
        monaco.editor.defineTheme("rxjs-space", {
          base: "vs-dark",
          inherit: true,
          rules: [
            { token: "comment", foreground: "6A9955" },
            { token: "keyword", foreground: "569CD6" },
            { token: "string", foreground: "CE9178" },
            { token: "number", foreground: "B5CEA8" },
            { token: "regexp", foreground: "D16969" },
            { token: "operator", foreground: "D4D4D4" },
            { token: "namespace", foreground: "4EC9B0" },
            { token: "type", foreground: "4EC9B0" },
            { token: "struct", foreground: "4EC9B0" },
            { token: "class", foreground: "4EC9B0" },
            { token: "interface", foreground: "4EC9B0" },
            { token: "parameter", foreground: "9CDCFE" },
            { token: "variable", foreground: "9CDCFE" },
            { token: "property", foreground: "9CDCFE" },
            { token: "enumMember", foreground: "4FC1FF" },
            { token: "function", foreground: "DCDCAA" },
            { token: "member", foreground: "DCDCAA" },
          ],
          colors: {
            "editor.background": "#0F172A",
            "editor.foreground": "#E2E8F0",
            "editorLineNumber.foreground": "#475569",
            "editorLineNumber.activeForeground": "#06B6D4",
            "editor.selectionBackground": "#334155",
            "editor.lineHighlightBackground": "#1E293B",
            "editorCursor.foreground": "#06B6D4",
            "editor.findMatchBackground": "#515C6A",
            "editor.findMatchHighlightBackground": "#EA5906",
            "editorBracketMatch.background": "#515C6A",
            "editorBracketMatch.border": "#888888",
          },
        })

        // Add RxJS type definitions
        const rxjsTypes = `
          declare module 'rxjs' {
            export class Observable<T> {
              constructor(subscribe?: (observer: Observer<T>) => TeardownLogic);
              subscribe(observer?: Observer<T>): Subscription;
              subscribe(next: (value: T) => void): Subscription;
              pipe<A>(op1: OperatorFunction<T, A>): Observable<A>;
              pipe<A, B>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>): Observable<B>;
            }
            
            export interface Observer<T> {
              next: (value: T) => void;
              error: (err: any) => void;
              complete: () => void;
            }
            
            export interface Subscription {
              unsubscribe(): void;
            }
            
            export interface OperatorFunction<T, R> {
              (source: Observable<T>): Observable<R>;
            }
            
            export function of<T>(...values: T[]): Observable<T>;
            export function from<T>(input: ObservableInput<T>): Observable<T>;
            export function interval(period: number): Observable<number>;
            export function timer(dueTime: number): Observable<0>;
          }
          
          declare module 'rxjs/operators' {
            export function map<T, R>(project: (value: T) => R): OperatorFunction<T, R>;
            export function filter<T>(predicate: (value: T) => boolean): OperatorFunction<T, T>;
            export function take<T>(count: number): OperatorFunction<T, T>;
            export function debounceTime<T>(dueTime: number): OperatorFunction<T, T>;
            export function distinctUntilChanged<T>(): OperatorFunction<T, T>;
            export function switchMap<T, R>(project: (value: T) => Observable<R>): OperatorFunction<T, R>;
            export function mergeMap<T, R>(project: (value: T) => Observable<R>): OperatorFunction<T, R>;
            export function catchError<T, R>(selector: (err: any) => Observable<R>): OperatorFunction<T, T | R>;
          }
        `

        monaco.languages.typescript.javascriptDefaults.addExtraLib(rxjsTypes, "rxjs.d.ts")

        // Configure TypeScript compiler options
        monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
          target: monaco.languages.typescript.ScriptTarget.ES2020,
          allowNonTsExtensions: true,
          moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
          module: monaco.languages.typescript.ModuleKind.CommonJS,
          noEmit: true,
          esModuleInterop: true,
          jsx: monaco.languages.typescript.JsxEmit.React,
          reactNamespace: "React",
          allowJs: true,
          typeRoots: ["node_modules/@types"],
        })
      } catch (error) {
        console.warn("Failed to configure Monaco:", error)
      }
    }

    configureMonaco()
  }, [])

  return (
    <div ref={containerRef} className="h-full border border-gray-700 rounded-lg overflow-hidden flex flex-col">
      <div className="bg-slate-900 px-4 py-2 border-b border-gray-700 flex items-center justify-between flex-shrink-0">
        <span className="text-gray-400 text-sm font-mono">Mission Code</span>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={language}
          value={value}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          theme="rxjs-space"
          loading={
            <div className="flex items-center justify-center h-full">
              <div className="text-cyan-400">Loading editor...</div>
            </div>
          }
          options={{
            wordWrap: "on",
            automaticLayout: true,
            contextmenu: false,
            quickSuggestions: {
              other: true,
              comments: false,
              strings: false,
            },
          }}
        />
      </div>
    </div>
  )
}

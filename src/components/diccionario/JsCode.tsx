import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Resaltado simple sin dependencias: palabras clave JS. */
export function JsCode({ code, className }: { code: string; className?: string }) {
  const lines = code.split("\n");
  return (
    <pre
      className={cn(
        "overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-950 p-4 text-[13px] leading-relaxed text-zinc-100 dark:border-zinc-700",
        className,
      )}
    >
      <code>
        {lines.map((line, i) => (
          <div key={i} className="min-h-[1.25em]">
            {highlightLine(line)}
          </div>
        ))}
      </code>
    </pre>
  );
}

function highlightLine(line: string) {
  // Comentarios de línea
  const commentIdx = line.indexOf("//");
  if (commentIdx >= 0) {
    return (
      <>
        {tokenize(line.slice(0, commentIdx))}
        <span className="text-zinc-500">{line.slice(commentIdx)}</span>
      </>
    );
  }
  return tokenize(line);
}

function tokenize(src: string) {
  const re =
    /(\b(?:let|const|var|function|return|if|else|switch|case|default|for|while|break|new|typeof|true|false|null|document|console)\b)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(\b\d+(?:\.\d+)?\b)|([{}()[\];,.]=?|[<>]=?|[!=]=?=?|[+\-*/%])/g;
  const nodes: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(src))) {
    if (m.index > last) nodes.push(<span key={key++}>{src.slice(last, m.index)}</span>);
    if (m[1]) nodes.push(<span key={key++} className="text-violet-300">{m[1]}</span>);
    else if (m[2]) nodes.push(<span key={key++} className="text-emerald-300">{m[2]}</span>);
    else if (m[3]) nodes.push(<span key={key++} className="text-amber-300">{m[3]}</span>);
    else if (m[4]) nodes.push(<span key={key++} className="text-sky-300">{m[4]}</span>);
    last = m.index + m[0].length;
  }
  if (last < src.length) nodes.push(<span key={key++}>{src.slice(last)}</span>);
  return nodes;
}

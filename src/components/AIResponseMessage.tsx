import React, { useState } from "react";

interface AIResponseMessageProps {
  content: string;
  onNav?: (screen: any) => void;
  onElevate?: (competencyName: string) => void;
}

export function AIResponseMessage({ content, onNav, onElevate }: AIResponseMessageProps) {
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<number | null>(null);

  function copyToClipboard(text: string, idx: number) {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedCodeIdx(idx);
      setTimeout(() => setCopiedCodeIdx(null), 2000);
    }
  }

  // Split content by code blocks first
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3.5 text-xs text-gray-800 leading-relaxed font-sans selection:bg-orange-100">
      {parts.map((part, partIdx) => {
        if (part.startsWith("```") && part.endsWith("```")) {
          // Code Block
          const rawLines = part.slice(3, -3).trim().split("\n");
          const firstLine = rawLines[0]?.trim();
          const hasLang = firstLine && /^[a-zA-Z0-9_#-]+$/.test(firstLine);
          const lang = hasLang ? firstLine.toLowerCase() : "python";
          const codeBody = hasLang ? rawLines.slice(1).join("\n") : rawLines.join("\n");

          return (
            <div
              key={partIdx}
              className="rounded-2xl overflow-hidden border border-slate-800 bg-[#0B1528] text-slate-100 shadow-md my-3"
            >
              <div className="px-3.5 py-2 bg-[#060D1A] border-b border-slate-800/80 flex justify-between items-center text-[10px] font-mono">
                <span className="text-amber-400 font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="uppercase tracking-wider">{lang} SCRIPT</span>
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(codeBody, partIdx)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                >
                  <span>{copiedCodeIdx === partIdx ? "✓" : "📋"}</span>
                  <span>{copiedCodeIdx === partIdx ? "Copied" : "Copy Code"}</span>
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-[11px] font-mono text-emerald-300 leading-relaxed bg-[#0B1528] scrollbar-thin scrollbar-thumb-slate-700">
                <code>{codeBody}</code>
              </pre>
            </div>
          );
        }

        // Parse structured text, tables, and callouts
        return <StructuredContentBlock key={partIdx} text={part} onNav={onNav} onElevate={onElevate} />;
      })}
    </div>
  );
}

function StructuredContentBlock({
  text,
  onNav,
  onElevate,
}: {
  text: string;
  onNav?: (screen: any) => void;
  onElevate?: (competencyName: string) => void;
}) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let currentList: { type: "ol" | "ul"; items: string[] } | null = null;
  let currentTable: { headers: string[]; rows: string[][] } | null = null;

  function flushList() {
    if (!currentList) return;
    if (currentList.type === "ol") {
      elements.push(
        <div key={`ol-${elements.length}`} className="space-y-2.5 my-3">
          {currentList.items.map((item, i) => (
            <NumberedStepItem key={i} index={i + 1} text={item} onNav={onNav} onElevate={onElevate} />
          ))}
        </div>
      );
    } else {
      elements.push(
        <ul key={`ul-${elements.length}`} className="space-y-2 my-2.5 pl-1">
          {currentList.items.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-xs text-gray-700 leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A00] mt-1.5 shrink-0" />
              <span className="flex-1">{formatInline(item, onNav, onElevate)}</span>
            </li>
          ))}
        </ul>
      );
    }
    currentList = null;
  }

  function flushTable() {
    if (!currentTable) return;
    elements.push(
      <div key={`table-${elements.length}`} className="my-3 overflow-x-auto rounded-2xl border border-gray-200 shadow-2xs">
        <table className="w-full text-left text-xs border-collapse bg-white">
          <thead className="bg-gradient-to-r from-blue-50 to-indigo-50/50 border-b border-gray-200 text-[#0B3D66] font-bold">
            <tr>
              {currentTable.headers.map((h, hi) => (
                <th key={hi} className="p-3 text-[11px] font-extrabold uppercase tracking-wider">
                  {formatInline(h, onNav, onElevate)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentTable.rows.map((row, ri) => (
              <tr key={ri} className="hover:bg-blue-50/30 transition-colors">
                {row.map((cell, ci) => (
                  <td key={ci} className="p-3 text-[11px] text-gray-700">
                    {formatInline(cell, onNav, onElevate)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    currentTable = null;
  }

  function flushAll() {
    flushList();
    flushTable();
  }

  for (let idx = 0; idx < lines.length; idx++) {
    const rawLine = lines[idx];
    const line = rawLine.trim();

    if (!line) {
      flushAll();
      continue;
    }

    // Markdown Table Row: | Col 1 | Col 2 |
    if (line.startsWith("|") && line.endsWith("|")) {
      flushList();
      const cells = line
        .slice(1, -1)
        .split("|")
        .map((c) => c.trim());

      // Check if separator line (e.g. |---|---|)
      if (cells.every((c) => /^:?-+:?$/.test(c))) {
        continue;
      }

      if (!currentTable) {
        currentTable = { headers: cells, rows: [] };
      } else {
        currentTable.rows.push(cells);
      }
      continue;
    } else {
      flushTable();
    }

    // Heading 1 or 2: # Title or ## Title
    if (line.startsWith("# ") || line.startsWith("## ")) {
      flushAll();
      const title = line.replace(/^#{1,2}\s+/, "");
      elements.push(
        <div
          key={idx}
          className="bg-gradient-to-r from-blue-900 via-[#0B3D66] to-[#082e4f] text-white p-3.5 rounded-2xl my-3 shadow-sm flex items-center justify-between"
        >
          <h2 className="font-bold text-sm flex items-center gap-2 font-serif tracking-tight">
            <span>🏛️</span>
            <span>{formatInline(title, onNav, onElevate)}</span>
          </h2>
          <span className="text-[9px] uppercase font-extrabold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full shadow-2xs">
            Official Advisory
          </span>
        </div>
      );
      continue;
    }

    // Heading 3: ### Title
    if (line.startsWith("### ")) {
      flushAll();
      const title = line.replace(/^###\s+/, "");
      elements.push(
        <div
          key={idx}
          className="bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-white border-l-4 border-[#0B3D66] p-3 rounded-r-2xl my-2.5 flex items-center justify-between shadow-2xs"
        >
          <h3 className="font-bold text-xs sm:text-sm text-[#0B3D66] flex items-center gap-1.5 font-serif">
            {formatInline(title, onNav, onElevate)}
          </h3>
          <span className="text-[9px] uppercase font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full border border-blue-200">
            Guidance
          </span>
        </div>
      );
      continue;
    }

    // Heading 4: #### Title
    if (line.startsWith("#### ")) {
      flushAll();
      const title = line.replace(/^####\s+/, "");
      elements.push(
        <div key={idx} className="mt-3 mb-1.5 pb-1 border-b border-gray-200/70 flex items-center justify-between">
          <h4 className="font-bold text-xs text-[#0B3D66] uppercase tracking-wider flex items-center gap-1">
            {formatInline(title, onNav, onElevate)}
          </h4>
        </div>
      );
      continue;
    }

    // Blockquote: > text
    if (line.startsWith("> ")) {
      flushAll();
      const quoteText = line.replace(/^>\s+/, "");
      elements.push(
        <div key={idx} className="p-3.5 bg-amber-50/60 border-l-4 border-[#FF7A00] rounded-r-2xl text-xs text-amber-950 my-2.5 flex items-start gap-2.5 shadow-2xs">
          <span className="text-base shrink-0">💡</span>
          <div className="flex-1 font-medium leading-relaxed">{formatInline(quoteText, onNav, onElevate)}</div>
        </div>
      );
      continue;
    }

    // MCQ Option Format: - **A)** ... or - A) ...
    const mcqMatch = line.match(/^[-*•]\s*\*\*?([A-D])\)\*\*?\s*(.*)$/i);
    if (mcqMatch) {
      flushAll();
      const optLetter = mcqMatch[1].toUpperCase();
      const optText = mcqMatch[2];

      elements.push(
        <div
          key={idx}
          className="p-3 rounded-2xl border border-gray-200 bg-white hover:border-[#0B3D66] hover:bg-blue-50/40 transition-all text-xs text-gray-800 my-1.5 flex items-start gap-3 shadow-2xs cursor-pointer group"
        >
          <span className="w-6 h-6 rounded-full bg-[#0B3D66] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 group-hover:bg-[#FF7A00] transition-colors">
            {optLetter}
          </span>
          <span className="flex-1 leading-relaxed font-medium">{formatInline(optText, onNav, onElevate)}</span>
        </div>
      );
      continue;
    }

    // Math Formula line: $$ ... $$ or containing equation keywords
    if (
      line.startsWith("$$") ||
      (line.includes("=") && (line.includes("∑") || line.includes("MLT") || line.includes("GVA") || line.includes("Laspeyres") || line.includes("CPI") || line.includes("WPI") || line.includes("frac{")))
    ) {
      flushAll();
      elements.push(
        <div
          key={idx}
          className="p-3.5 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-blue-50/70 border border-blue-200/80 rounded-2xl text-xs font-serif text-[#0B3D66] my-2.5 text-center shadow-2xs"
        >
          <div className="text-[10px] uppercase font-sans font-extrabold text-blue-600 mb-1 tracking-wider">
            Official Mathematical Formula
          </div>
          <div className="font-mono text-[11px] sm:text-xs font-bold text-slate-900 bg-white/80 py-2 px-3 rounded-xl border border-blue-100 inline-block shadow-2xs">
            {formatInline(line.replace(/^\$\$|\$\$$/g, ""), onNav, onElevate)}
          </div>
        </div>
      );
      continue;
    }

    // Numbered list: 1. ...
    const olMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (olMatch) {
      if (!currentList || currentList.type !== "ol") {
        flushAll();
        currentList = { type: "ol", items: [] };
      }
      currentList.items.push(olMatch[2]);
      continue;
    }

    // Bullet list: - ... or * ...
    const ulMatch = line.match(/^[-*•]\s+(.*)$/);
    if (ulMatch) {
      if (!currentList || currentList.type !== "ul") {
        flushAll();
        currentList = { type: "ul", items: [] };
      }
      currentList.items.push(ulMatch[1]);
      continue;
    }

    // Regular paragraph line
    flushAll();
    elements.push(
      <p key={idx} className="leading-relaxed text-gray-800 text-xs">
        {formatInline(line, onNav, onElevate)}
      </p>
    );
  }

  flushAll();
  return <>{elements}</>;
}

function NumberedStepItem({
  index,
  text,
  onNav,
  onElevate,
}: {
  index: number;
  text: string;
  onNav?: (screen: any) => void;
  onElevate?: (competencyName: string) => void;
}) {
  const boldMatch = text.match(/\*\*(.*?)\*\*/);
  const title = boldMatch ? boldMatch[1] : null;
  const isGapItem = text.toLowerCase().includes("priority deficit") || text.toLowerCase().includes("target level") || text.toLowerCase().includes("skill gap");

  return (
    <div
      className={`p-3.5 rounded-2xl border transition-all ${
        isGapItem
          ? "bg-rose-50/50 border-rose-200 hover:border-rose-300 shadow-2xs"
          : "bg-white border-gray-200/90 shadow-2xs hover:border-blue-300"
      } flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
    >
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <span
          className={`w-6 h-6 rounded-full flex items-center justify-center font-extrabold text-[10px] shrink-0 mt-0.5 ${
            isGapItem ? "bg-rose-600 text-white shadow-xs" : "bg-[#0B3D66] text-white shadow-xs"
          }`}
        >
          {index}
        </span>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-gray-900 text-xs leading-snug">
            {title ? title : formatInline(text, onNav, onElevate)}
          </div>
          {title && (
            <div className="text-[11px] text-gray-600 mt-1 leading-relaxed">
              {formatInline(text.replace(/\*\*(.*?)\*\*/, "").replace(/^[\s—–:-]+/, ""), onNav, onElevate)}
            </div>
          )}
        </div>
      </div>

      {isGapItem && title && (
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto pt-1 sm:pt-0">
          {onElevate && (
            <button
              type="button"
              onClick={() => onElevate(title)}
              className="px-3 py-1 bg-[#FF7A00] hover:bg-[#e06a00] text-white font-bold text-[10px] rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1 active:scale-95"
            >
              <span>⚡ Elevate</span>
            </button>
          )}
          {onNav && (
            <button
              type="button"
              onClick={() => onNav("courses")}
              className="px-3 py-1 bg-[#0B3D66] hover:bg-[#082e4f] text-white font-bold text-[10px] rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1 active:scale-95"
            >
              <span>📚 Courses</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function formatInline(
  text: string,
  onNav?: (screen: any) => void,
  onElevate?: (competencyName: string) => void
): React.ReactNode {
  // Handles bold (**text**), italics (*text*), code (`code`), and math formulas ($formula$)
  const tokens = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`|\$.*?\$)/g);

  return (
    <>
      {tokens.map((token, i) => {
        if (token.startsWith("**") && token.endsWith("**")) {
          const boldText = token.slice(2, -2);
          return (
            <strong key={i} className="font-bold text-gray-900 font-sans">
              {boldText}
            </strong>
          );
        }
        if (token.startsWith("*") && token.endsWith("*")) {
          return (
            <span key={i} className="text-gray-600 italic">
              {token.slice(1, -1)}
            </span>
          );
        }
        if (token.startsWith("`") && token.endsWith("`")) {
          return (
            <code
              key={i}
              className="px-1.5 py-0.5 rounded-md bg-blue-50 font-mono text-[#0B3D66] font-bold text-[10px] border border-blue-200/70"
            >
              {token.slice(1, -1)}
            </code>
          );
        }
        if (token.startsWith("$") && token.endsWith("$") && token.length > 2) {
          return (
            <span
              key={i}
              className="px-1.5 py-0.5 rounded-md bg-amber-50 font-mono text-amber-950 font-bold text-[10px] border border-amber-200 mx-0.5"
            >
              {token.slice(1, -1)}
            </span>
          );
        }
        return token;
      })}
    </>
  );
}

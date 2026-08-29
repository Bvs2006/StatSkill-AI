import React, { useState } from "react";

interface AIResponseMessageProps {
  content: string;
  onNav?: (screen: any) => void;
  onElevate?: (competencyName: string) => void;
}

export function AIResponseMessage({ content, onNav, onElevate }: AIResponseMessageProps) {
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<number | null>(null);

  function copyToClipboard(text: string, idx: number) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedCodeIdx(idx);
      setTimeout(() => setCopiedCodeIdx(null), 2000);
    }
  }

  // Split content by code blocks first
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3 text-xs text-gray-800 leading-relaxed font-sans">
      {parts.map((part, partIdx) => {
        if (part.startsWith("```") && part.endsWith("```")) {
          // Code Block
          const lines = part.slice(3, -3).trim().split("\n");
          const lang = lines[0]?.match(/^[a-zA-Z0-9_-]+$/) ? lines[0] : "python";
          const codeBody = lang === lines[0] ? lines.slice(1).join("\n") : lines.join("\n");

          return (
            <div
              key={partIdx}
              className="rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-950 text-slate-100 shadow-md my-2"
            >
              <div className="px-3.5 py-2 bg-slate-900 border-b border-slate-800 flex justify-between items-center text-[10px] font-mono">
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  {lang.toUpperCase()} SCRIPT
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(codeBody, partIdx)}
                  className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer flex items-center gap-1"
                >
                  {copiedCodeIdx === partIdx ? "✓ Copied" : "📋 Copy Code"}
                </button>
              </div>
              <pre className="p-3.5 overflow-x-auto text-[11px] font-mono text-emerald-300 leading-relaxed bg-slate-950/90">
                <code>{codeBody}</code>
              </pre>
            </div>
          );
        }

        // Parse standard text blocks
        return <TextBlock key={partIdx} text={part} onNav={onNav} onElevate={onElevate} />;
      })}
    </div>
  );
}

function TextBlock({
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

  function flushList() {
    if (!currentList) return;
    if (currentList.type === "ol") {
      elements.push(
        <div key={elements.length} className="space-y-2 my-2.5">
          {currentList.items.map((item, i) => (
            <SkillGapOrNumberedItem key={i} index={i + 1} text={item} onNav={onNav} onElevate={onElevate} />
          ))}
        </div>
      );
    } else {
      elements.push(
        <ul key={elements.length} className="space-y-1.5 my-2 pl-2">
          {currentList.items.map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-[#0B3D66] font-bold mt-0.5">•</span>
              <span className="flex-1">{formatInline(item)}</span>
            </li>
          ))}
        </ul>
      );
    }
    currentList = null;
  }

  for (let idx = 0; idx < lines.length; idx++) {
    const rawLine = lines[idx];
    const line = rawLine.trim();

    if (!line) {
      flushList();
      continue;
    }

    // Heading 3: ### Title
    if (line.startsWith("### ")) {
      flushList();
      const title = line.replace(/^###\s+/, "");
      elements.push(
        <div
          key={idx}
          className="bg-gradient-to-r from-blue-50 to-indigo-50/40 border-l-4 border-[#0B3D66] p-3 rounded-r-2xl my-2 flex items-center justify-between"
        >
          <h3 className="font-bold text-sm text-[#0B3D66] flex items-center gap-1.5 font-serif">
            {formatInline(title)}
          </h3>
          <span className="text-[9px] uppercase font-extrabold bg-[#0B3D66] text-white px-2 py-0.5 rounded-full">
            AI Diagnostic
          </span>
        </div>
      );
      continue;
    }

    // Heading 4: #### Title
    if (line.startsWith("#### ")) {
      flushList();
      const title = line.replace(/^####\s+/, "");
      elements.push(
        <div key={idx} className="mt-3 mb-1.5 pb-1 border-b border-gray-100 flex items-center justify-between">
          <h4 className="font-bold text-xs text-[#0B3D66] uppercase tracking-wider flex items-center gap-1">
            {formatInline(title)}
          </h4>
        </div>
      );
      continue;
    }

    // Numbered list: 1. ...
    const olMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (olMatch) {
      if (!currentList || currentList.type !== "ol") {
        flushList();
        currentList = { type: "ol", items: [] };
      }
      currentList.items.push(olMatch[2]);
      continue;
    }

    // Bullet list: - ... or * ...
    const ulMatch = line.match(/^[-*•]\s+(.*)$/);
    if (ulMatch) {
      if (!currentList || currentList.type !== "ul") {
        flushList();
        currentList = { type: "ul", items: [] };
      }
      currentList.items.push(ulMatch[1]);
      continue;
    }

    // Metadata line (e.g. **Officer**: ... · **Cadre**: ...)
    if (line.startsWith("**Officer**") || line.startsWith("**Cadre**") || line.startsWith("**Competency**")) {
      flushList();
      elements.push(
        <div key={idx} className="p-2.5 bg-gray-50/80 rounded-xl border border-gray-200/70 text-[11px] text-gray-700 my-1.5 flex items-center flex-wrap gap-2">
          {formatInline(line)}
        </div>
      );
      continue;
    }

    // Callout / Action banner
    if (line.toLowerCase().includes("recommended action") || line.toLowerCase().includes("next step")) {
      flushList();
      elements.push(
        <div key={idx} className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-2xl text-[11px] text-amber-950 font-medium my-2 flex items-start gap-2">
          <span className="text-base">💡</span>
          <div className="flex-1">{formatInline(line)}</div>
        </div>
      );
      continue;
    }

    // Math formula line
    if (line.startsWith("$$") || line.includes("∑") || line.includes("Laspeyres") || line.includes("w_i") || line.includes("Y_st")) {
      flushList();
      elements.push(
        <div key={idx} className="p-3 bg-blue-50/60 border border-blue-100 rounded-2xl text-xs font-serif text-[#0B3D66] my-2 text-center shadow-2xs">
          {formatInline(line)}
        </div>
      );
      continue;
    }

    // Regular paragraph line
    flushList();
    elements.push(
      <p key={idx} className="leading-relaxed">
        {formatInline(line)}
      </p>
    );
  }

  flushList();
  return <>{elements}</>;
}

function SkillGapOrNumberedItem({
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
  // Extract skill name and deficit if in format: **Skill Name** — *Priority Deficit (Target Level X vs Current Level Y)*
  const boldMatch = text.match(/\*\*(.*?)\*\*/);
  const skillName = boldMatch ? boldMatch[1] : null;

  const isGapItem = text.toLowerCase().includes("priority deficit") || text.toLowerCase().includes("target level");

  return (
    <div className={`p-3 rounded-2xl border transition-all ${
      isGapItem
        ? "bg-rose-50/40 border-rose-100 hover:border-rose-300 shadow-2xs"
        : "bg-white border-gray-100 shadow-2xs"
    } flex flex-col sm:flex-row sm:items-center justify-between gap-2.5`}>
      <div className="flex items-start gap-2.5 flex-1 min-w-0">
        <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 ${
          isGapItem ? "bg-rose-500 text-white" : "bg-[#0B3D66] text-white"
        }`}>
          {index}
        </span>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-gray-900 text-xs truncate">
            {skillName ? skillName : formatInline(text)}
          </div>
          {skillName && (
            <div className="text-[11px] text-gray-600 mt-0.5">
              {formatInline(text.replace(/\*\*(.*?)\*\*/, "").replace(/^[\s—–-]+/, ""))}
            </div>
          )}
        </div>
      </div>

      {isGapItem && skillName && (
        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
          {onElevate && (
            <button
              type="button"
              onClick={() => onElevate(skillName)}
              className="px-2.5 py-1 bg-[#FF7A00] hover:bg-[#e06a00] text-white font-bold text-[10px] rounded-lg shadow-2xs transition-all cursor-pointer flex items-center gap-1"
            >
              <span>⚡ Elevate</span>
            </button>
          )}
          {onNav && (
            <button
              type="button"
              onClick={() => onNav("courses")}
              className="px-2.5 py-1 bg-[#0B3D66] hover:bg-[#082e4f] text-white font-bold text-[10px] rounded-lg shadow-2xs transition-all cursor-pointer"
            >
              <span>📖 Course</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function formatInline(text: string): React.ReactNode {
  // Handles bold (**text**), italics (*text*), code (`code`), and pills
  const tokens = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);

  return (
    <>
      {tokens.map((token, i) => {
        if (token.startsWith("**") && token.endsWith("**")) {
          return (
            <strong key={i} className="font-bold text-gray-900">
              {token.slice(2, -2)}
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
            <code key={i} className="px-1.5 py-0.5 rounded-md bg-gray-100 font-mono text-[#0B3D66] font-bold text-[10px] border border-gray-200">
              {token.slice(1, -1)}
            </code>
          );
        }
        return token;
      })}
    </>
  );
}

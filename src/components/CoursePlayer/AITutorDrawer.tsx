import React, { useState } from "react";
import { chatWithStatisticalAssistant } from "../../services/aiService";

interface AITutorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  courseTitle: string;
  topicTitle: string;
  activeSlideTitle?: string;
}

export function AITutorDrawer({
  isOpen,
  onClose,
  courseTitle,
  topicTitle,
  activeSlideTitle,
}: AITutorDrawerProps) {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([
    {
      role: "assistant",
      text: `Hello! I am your AI Lecture Tutor for **${topicTitle}**. Ask me any conceptual or practical question regarding this module.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function handleSend(textToSend?: string) {
    const text = (textToSend || input).trim();
    if (!text || loading) return;
    setInput("");
    setMessages((p) => [...p, { role: "user", text }]);
    setLoading(true);

    try {
      const reply = await chatWithStatisticalAssistant(
        messages.map((m) => ({ role: m.role, content: m.text })).concat([{ role: "user", content: text }]),
        {
          name: "Statistical Officer",
          designation: "Learner",
          department: "MoSPI",
          gaps: [topicTitle, activeSlideTitle || "General Methodology"],
        }
      );
      setMessages((p) => [...p, { role: "assistant", text: reply }]);
    } catch {
      setMessages((p) => [
        ...p,
        { role: "assistant", text: "Vectorized operations and survey weight formulas are detailed in the official MoSPI technical manual." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl border-l border-gray-200 flex flex-col animate-in slide-in-from-right">
      <div className="p-4 bg-[#0B3D66] text-white flex justify-between items-center">
        <div>
          <div className="text-[10px] uppercase font-bold text-amber-300">Contextual AI Tutor</div>
          <h3 className="text-xs font-bold truncate max-w-[280px]">{topicTitle}</h3>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs">
          ✕
        </button>
      </div>

      {/* Suggested In-Lecture Prompts */}
      <div className="p-3 bg-gray-50 border-b border-gray-100 flex flex-wrap gap-1.5 text-[11px]">
        {[
          "Explain this slide simply",
          "Give a real survey example",
          "Why is this formula used?",
        ].map((p) => (
          <button
            key={p}
            onClick={() => handleSend(p)}
            className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-gray-700 hover:border-[#0B3D66] hover:text-[#0B3D66] shadow-2xs"
          >
            💡 {p}
          </button>
        ))}
      </div>

      {/* Message Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50/50 text-xs">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-2xl max-w-[90%] leading-relaxed ${
              m.role === "user"
                ? "bg-[#0B3D66] text-white ml-auto rounded-br-none"
                : "bg-white text-gray-800 border border-gray-100 shadow-2xs mr-auto rounded-bl-none"
            }`}
          >
            {m.text}
          </div>
        ))}
        {loading && <div className="text-gray-400 text-xs italic">AI Tutor is reviewing official lecture context...</div>}
      </div>

      {/* Input Box */}
      <div className="p-3 border-t border-gray-100 bg-white flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask a question about this lecture..."
          className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#0B3D66]"
        />
        <button
          onClick={() => handleSend()}
          disabled={loading}
          className="px-4 py-2 bg-[#FF7A00] text-white text-xs font-bold rounded-xl hover:bg-[#e06a00]"
        >
          Ask
        </button>
      </div>
    </div>
  );
}

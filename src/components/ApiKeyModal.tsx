import { useState } from "react";
import { getGroqApiKey, setGroqApiKey, hasGroqApiKey } from "../services/aiService";
import { getSupabaseConfig, setSupabaseConfig } from "../services/storageService";

export function ApiKeyModal({
  isOpen,
  onClose,
  onSaved,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const [groqKey, setGroqKey] = useState(getGroqApiKey());
  const [sbConfig, setSbConfig] = useState(getSupabaseConfig());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; msg: string } | null>(null);

  if (!isOpen) return null;

  async function handleTestGroq() {
    if (!groqKey.trim()) {
      setTestResult({ success: false, msg: "Please enter a Groq API Key first." });
      return;
    }
    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqKey.trim()}`,
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b",
          messages: [{ role: "user", content: "ping" }],
          max_tokens: 5,
        }),
      });

      if (res.ok) {
        setTestResult({ success: true, msg: "✅ Groq Cloud Connection Successful! (GPT-OSS 120B / Qwen 3.8 Active)" });
      } else {
        const err = await res.json().catch(() => ({}));
        setTestResult({ success: false, msg: `❌ Authentication Failed: ${err?.error?.message || res.statusText}` });
      }
    } catch (e: any) {
      setTestResult({ success: false, msg: `❌ Network Error: ${e.message}` });
    } finally {
      setTesting(false);
    }
  }

  function handleSave() {
    setGroqApiKey(groqKey.trim());
    setSupabaseConfig(sbConfig.url.trim(), sbConfig.anonKey.trim());
    onSaved?.();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-xl w-full p-6 md:p-8 overflow-hidden relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 transition-colors p-1"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#0B3D66]/10 text-[#0B3D66] flex items-center justify-center text-xl font-bold">
            ⚡
          </div>
          <div>
            <h2 className="text-xl font-serif text-[#0B3D66] font-bold">AI Acceleration &amp; Cloud Settings</h2>
            <p className="text-xs text-gray-500">Configure AI Copilot Key and Multi-Device Cloud Sync</p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Built-in AI Intelligence Section */}
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <span>✓ National Statistical AI Assistant Active</span>
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[9px] px-2 py-0.5 rounded font-bold">
                PRE-CONFIGURED
              </span>
            </div>
            <p className="text-[11px] text-emerald-700 leading-relaxed">
              Assessment generation from training circulars, interactive slide decks, and statistical copilot reasoning are built directly into the platform. No external API keys are required.
            </p>
          </div>

          {/* Cloud Sync Section */}
          <div className="p-4 rounded-xl bg-blue-50/40 border border-blue-100">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-800">
                Multi-Device Cloud Database Sync (Optional)
              </label>
              <span className="text-[10px] text-gray-400">Browser storage active by default</span>
            </div>
            <div className="space-y-2">
              <input
                type="text"
                value={sbConfig.url}
                onChange={(e) => setSbConfig({ ...sbConfig, url: e.target.value })}
                placeholder="https://your-project.supabase.co"
                className="w-full px-3 py-2 text-xs font-mono border border-gray-200 rounded-lg focus:outline-none focus:border-[#0B3D66] bg-white"
              />
              <input
                type="password"
                value={sbConfig.anonKey}
                onChange={(e) => setSbConfig({ ...sbConfig, anonKey: e.target.value })}
                placeholder="Supabase Anon Key..."
                className="w-full px-3 py-2 text-xs font-mono border border-gray-200 rounded-lg focus:outline-none focus:border-[#0B3D66] bg-white"
              />
            </div>
          </div>

          {/* WebAssembly Virtual Labs note */}
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100 text-[11px] text-gray-600">
            <span className="text-base">🐍</span>
            <span>
              <strong>Pyodide &amp; SQLite WASM</strong> are enabled. Python and SQL labs run directly in your browser with zero server cost.
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-[#0B3D66] hover:bg-[#082e4f] rounded-xl shadow-sm transition-all flex items-center gap-2"
          >
            <span>Save Configuration</span>
            <span>✓</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function ApiKeyHeaderBadge({ onClick }: { onClick: () => void }) {
  const hasKey = hasGroqApiKey();
  return (
    <button
      onClick={onClick}
      title="View AI & Database Environment Configuration (.env)"
      className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-medium transition-all ${
        hasKey
          ? "bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200"
          : "bg-blue-50 text-[#0B3D66] border border-blue-200 hover:bg-blue-100"
      }`}
    >
      <span className="text-[10px]">{hasKey ? "🟢" : "⚡"}</span>
      <span>{hasKey ? "Groq AI Active (.env)" : "AI Engine (.env)"}</span>
    </button>
  );
}

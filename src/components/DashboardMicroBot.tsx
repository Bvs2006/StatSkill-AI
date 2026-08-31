import React, { useState } from "react";
import {
  getUserCompetencies,
  applyClosedLoopCompetencyUpdate,
  UserCompetencyScore,
  addNotification,
} from "../services/storageService";
import type { Screen } from "../App";

interface DashboardMicroBotProps {
  onNav: (s: Screen) => void;
  onRefreshCompetencies?: () => void;
}

interface MicroQuestion {
  competency: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  ruleCitation: string;
}

const MICRO_QUESTIONS_BANK: Record<string, MicroQuestion> = {
  "National Accounts & GVA": {
    competency: "National Accounts & GVA",
    question: "Under UN SNA 2008, what is the exact formula for Gross Value Added (GVA) at basic prices?",
    options: [
      "Gross Output minus Intermediate Consumption",
      "GDP at Market Prices plus Net Indirect Taxes",
      "Gross National Income minus Subsidies on Products",
      "Total Employee Compensation minus Capital Consumption",
    ],
    correctIndex: 0,
    explanation: "GVA at basic prices is defined strictly as the value of Gross Output less Intermediate Consumption.",
    ruleCitation: "UN SNA 2008 Chapter 6 / CSO National Accounts Compilation Guide",
  },
  "Sampling Theory & PPS": {
    competency: "Sampling Theory & PPS",
    question: "In PLFS two-stage stratified sampling, how is the weight multiplier applied when pooling Sub-sample 1 and Sub-sample 2?",
    options: [
      "Integer weight (MLT) divided by 200",
      "Integer weight (MLT) multiplied by Census population",
      "Arithmetic mean of sub-sample counts without weights",
      "Direct sum of sample households divided by 100",
    ],
    correctIndex: 0,
    explanation: "Combined sub-sample estimates in NSSO/PLFS surveys use MLT / 200 for proper population expansion.",
    ruleCitation: "NSSO Survey Design & Multiplier Estimation Protocol",
  },
  "Python for Data Analysis": {
    competency: "Python for Data Analysis",
    question: "Which Pandas approach prevents memory exhaustion when processing a 12 GB fixed-width NSSO microdata file?",
    options: [
      "pd.read_fwf with chunksize parameter for streaming iteration",
      "pd.read_csv with default memory buffer",
      "Converting the whole file into a native Python dictionary",
      "Loading the file via standard json.loads() in RAM",
    ],
    correctIndex: 0,
    explanation: "Using chunksize creates an iterator yielding DataFrames in manageable slices (e.g. 100,000 rows).",
    ruleCitation: "MoSPI Data Science & Python Pipeline Guidelines",
  },
  "Data Privacy & Governance": {
    competency: "Data Privacy & Governance",
    question: "Under the DPDP Act 2023, what is required before publishing public statistical microdata?",
    options: [
      "Statistical Disclosure Control (k-anonymity / l-diversity) to prevent re-identification",
      "Obtaining written consent from every sampled household post-survey",
      "Exempting government microdata from all anonymization standards",
      "Redacting only the state and district code identifiers",
    ],
    correctIndex: 0,
    explanation: "DPDP Act 2023 mandates statistical fiduciaries to implement rigorous disclosure control and anonymization.",
    ruleCitation: "Digital Personal Data Protection Act 2023 & MoSPI SDC Norms",
  },
  "Price Statistics (CPI / WPI)": {
    competency: "Price Statistics (CPI / WPI)",
    question: "What price index formula is officially utilized by CSO for compiling India's All-India CPI (Base 2012=100)?",
    options: [
      "Modified Laspeyres Price Index with geometric mean of price relatives",
      "Paasche Weighted Price Index with current period quantities",
      "Fisher's Ideal Index with chain weighting",
      "Simple unweighted arithmetic average of retail quotations",
    ],
    correctIndex: 0,
    explanation: "All-India CPI utilizes the Modified Laspeyres Price Index with base 2012 weights and elementary geometric aggregations.",
    ruleCitation: "CSO Consumer Price Index Compilation Manual",
  },
  "SDG Indicators & Metadata": {
    competency: "SDG Indicators & Metadata",
    question: "Which institutional mechanism in India tracks progress across the 300+ National Indicator Framework (NIF) metrics?",
    options: [
      "MoSPI SDG National Indicator Dashboard & NITI Aayog Index",
      "Central Pollution Control Board Annual Audit",
      "Reserve Bank of India Monetary Policy Framework",
      "Directorate General of Foreign Trade Portal",
    ],
    correctIndex: 0,
    explanation: "MoSPI develops the National Indicator Framework (NIF) and coordinates with NITI Aayog for SDG monitoring.",
    ruleCitation: "MoSPI National Indicator Framework Guidelines",
  },
  "Ethics in Official Statistics": {
    competency: "Ethics in Official Statistics",
    question: "According to UN Fundamental Principles of Official Statistics (Principle 1), official statistics must be compiled:",
    options: [
      "On an impartial basis to honour citizens' entitlement to public information",
      "Exclusively for the use of ruling governing bodies without public release",
      "Subject to prior executive ministry clearance on findings",
      "Only when sponsored by private international development funds",
    ],
    correctIndex: 0,
    explanation: "UN Fundamental Principles emphasize independence, professional integrity, and citizen entitlement to impartial data.",
    ruleCitation: "UN Fundamental Principles of Official Statistics (UNFPOS)",
  },
};

export function DashboardMicroBot({ onNav, onRefreshCompetencies }: DashboardMicroBotProps) {
  const [userComps, setUserComps] = useState<UserCompetencyScore[]>(() => getUserCompetencies());
  const [mode, setMode] = useState<"ready" | "assess" | "gap" | "elevate">("ready");
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [activeCompIdx, setActiveCompIdx] = useState(0);

  // Find priority deficit competencies
  const deficitComps = userComps
    .filter((c) => c.gap > 0)
    .sort((a, b) => b.priorityScore - a.priorityScore);

  const targetComp = deficitComps[activeCompIdx % Math.max(1, deficitComps.length)] || userComps[0] || {
    competencyName: "National Accounts & GVA",
    currentLevel: 2,
    requiredLevel: 4,
    gap: 2,
    domain: "Statistical",
  };

  // Get matching micro question or fallback
  const microQ: MicroQuestion = MICRO_QUESTIONS_BANK[targetComp.competencyName] || {
    competency: targetComp.competencyName,
    question: `What is the core institutional standard required for official proficiency in ${targetComp.competencyName}?`,
    options: [
      `Applying standardized MoSPI protocols and official quality assurance frameworks`,
      `Using unvalidated external web scripts without audit trail verification`,
      `Relying solely on informal estimates without sampling weight expansion`,
      `Skipping intermediate validation steps during survey aggregation`,
    ],
    correctIndex: 0,
    explanation: `Official proficiency in ${targetComp.competencyName} requires adherence to validated institutional methodologies.`,
    ruleCitation: "Indian Statistical Service Cadre Competency Framework",
  };

  function handleAnswer(index: number) {
    setSelectedOpt(index);
    setMode("gap");
  }

  function handleElevate() {
    const isCorrect = selectedOpt === microQ.correctIndex;
    const scorePct = isCorrect ? 100 : 70;

    const res = applyClosedLoopCompetencyUpdate({
      competencyName: targetComp.competencyName,
      scorePct,
      evidence: `StatSkill AI Dashboard Micro-Bot Assessment (${isCorrect ? "100% Correct" : "Reviewed & Calibrated"})`,
    });

    if (res.updated) {
      setStatusMsg(`🎉 Elevated! ${targetComp.competencyName} is now Level ${res.newLevel} (Gap: ${Math.max(0, targetComp.requiredLevel - res.newLevel)})`);
    } else {
      setStatusMsg(`Diagnostic logged. Recommended: Study ${targetComp.competencyName} module.`);
    }

    setMode("elevate");
    const updated = getUserCompetencies();
    setUserComps(updated);
    if (onRefreshCompetencies) onRefreshCompetencies();
  }

  function handleNextGap() {
    setActiveCompIdx((prev) => prev + 1);
    setSelectedOpt(null);
    setStatusMsg(null);
    setMode("ready");
  }

  return (
    <div className="bg-gradient-to-br from-[#071E36] via-[#0B3D66] to-[#0A2945] rounded-3xl p-5 md:p-6 text-white shadow-xl border border-white/15 relative overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center font-bold text-sm shadow-md">
            🤖
          </div>
          <div>
            <div className="text-xs font-bold tracking-tight text-white flex items-center gap-1.5 font-serif">
              <span>StatSkill AI Rapid Closed-Loop Copilot</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-[10px] text-amber-300 font-mono">
              30-Second Micro Cycle · Assess ➔ Gap ➔ Elevate
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white/10 text-blue-200 border border-white/15">
            Deficit: {targetComp.gap} Levels
          </span>
        </div>
      </div>

      {/* Main Interactive Body */}
      <div className="py-4 relative z-10 space-y-3.5">
        {mode === "ready" && (
          <div className="space-y-3 animate-in fade-in">
            <div className="flex items-start justify-between gap-3 bg-white/5 border border-white/10 p-3.5 rounded-2xl">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                  Target Priority Skill Gap
                </span>
                <h3 className="text-sm font-bold text-white mt-0.5">{targetComp.competencyName}</h3>
                <p className="text-[11px] text-blue-100/80 mt-1">
                  Current: <strong>Level {targetComp.currentLevel}</strong> · Cadre Required: <strong>Level {targetComp.requiredLevel}</strong> ({targetComp.domain})
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-400/30 text-orange-300 flex items-center justify-center font-bold text-sm shrink-0">
                ⚡
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMode("assess")}
                className="flex-1 py-2.5 bg-[#FF7A00] hover:bg-[#e06a00] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
              >
                <span>🎯 Launch Micro-Assessment</span>
                <span>→</span>
              </button>
              <button
                type="button"
                onClick={handleNextGap}
                className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/15 transition-all cursor-pointer"
                title="Switch to next deficit competency"
              >
                Next Gap ⏭️
              </button>
            </div>
          </div>
        )}

        {mode === "assess" && (
          <div className="space-y-3 animate-in fade-in">
            <div className="flex justify-between items-center text-[10px] text-amber-300 font-bold">
              <span>STEP 1: ASSESS DIAGNOSTIC</span>
              <span>{targetComp.competencyName}</span>
            </div>

            <div className="text-xs font-bold text-white leading-relaxed bg-white/5 p-3 rounded-xl border border-white/10">
              {microQ.question}
            </div>

            <div className="space-y-2">
              {microQ.options.map((opt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAnswer(idx)}
                  className="w-full p-2.5 rounded-xl border border-white/15 bg-white/10 hover:bg-white/20 hover:border-amber-400 text-left text-xs text-blue-50 transition-all cursor-pointer flex items-start gap-2.5 active:scale-98"
                >
                  <span className="w-5 h-5 rounded-full bg-white/20 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="leading-snug">{opt}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {mode === "gap" && (
          <div className="space-y-3 animate-in fade-in">
            <div className="flex justify-between items-center text-[10px] text-emerald-300 font-bold">
              <span>STEP 2: DIAGNOSTIC &amp; GAP ANALYSIS</span>
              <span>{selectedOpt === microQ.correctIndex ? "✓ Mastered" : "✕ Calibration Needed"}</span>
            </div>

            <div
              className={`p-3.5 rounded-2xl border ${
                selectedOpt === microQ.correctIndex
                  ? "bg-emerald-950/60 border-emerald-500/50 text-emerald-100"
                  : "bg-amber-950/60 border-amber-500/50 text-amber-100"
              } text-xs space-y-2`}
            >
              <div className="font-bold flex items-center gap-1.5">
                <span>{selectedOpt === microQ.correctIndex ? "🌟 Answer Verified:" : "💡 Recommended Rule:"}</span>
                <span>{microQ.options[microQ.correctIndex]}</span>
              </div>
              <p className="text-[11px] text-blue-100/90 leading-relaxed">{microQ.explanation}</p>
              <div className="text-[10px] text-amber-300/80 font-mono">Citation: {microQ.ruleCitation}</div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleElevate}
                className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
              >
                <span>⚡ STEP 3: Elevate Competency (+1 Level)</span>
                <span>✓</span>
              </button>
              <button
                type="button"
                onClick={() => onNav("skills")}
                className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/15 transition-all cursor-pointer"
              >
                Full Matrix →
              </button>
            </div>
          </div>
        )}

        {mode === "elevate" && (
          <div className="space-y-3 animate-in fade-in">
            <div className="p-4 bg-emerald-950/80 border border-emerald-400/50 rounded-2xl text-center space-y-2">
              <div className="text-2xl">🎉</div>
              <div className="text-xs font-bold text-emerald-200">
                {statusMsg || "Competency successfully elevated in MoSPI Capacity Ledger!"}
              </div>
              <div className="text-[10px] text-emerald-300 font-mono">
                Cryptographic Audit Logged · Verifiable Credential Synchronized
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleNextGap}
                className="flex-1 py-2.5 bg-[#FF7A00] hover:bg-[#e06a00] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>🔄 Assess Next Skill Gap</span>
                <span>→</span>
              </button>
              <button
                type="button"
                onClick={() => onNav("assistant")}
                className="px-4 py-2.5 bg-white text-[#0B3D66] text-xs font-bold rounded-xl shadow-md hover:bg-gray-100 transition-all cursor-pointer"
              >
                🤖 Full Copilot
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

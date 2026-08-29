import React, { useState, useEffect, useRef } from "react";
import { generateInteractiveSlideDeck, GeneratedSlideItem, hasGroqApiKey } from "../../services/aiService";
import type { AISlide } from "./AISlidePlayer";

export interface TranscriptItem {
  id: string;
  start_time: number;
  end_time: number;
  text: string;
}

interface YouTubePlayerProps {
  videoId: string;
  title: string;
  courseTitle?: string;
  category?: string;
  provider?: string;
  competency?: string;
  initialSlides?: AISlide[];
  transcripts?: TranscriptItem[];
  currentTime: number;
  onTimeUpdate: (seconds: number) => void;
}

// Fallback high-reliability educational video IDs for statistical topics
const DEFAULT_EDUCATIONAL_VIDEO_MAP: Record<string, string> = {
  python: "eWRfhZUzrAc",
  statistics: "d8uTB5XorBw",
  sampling: "_V8eKsto3Ug",
  sql: "HXV3zeRR3h4",
  machine_learning: "i_LwzRVP7bg",
  qgis: "kE628xce3A0",
  privacy: "2X_2IdaD3xQ",
  default: "d8uTB5XorBw",
};

export function YouTubePlayer({
  videoId,
  title,
  courseTitle = "Official Statistical Training",
  category = "Statistical Methodology",
  provider = "iGOT & NSSTA",
  competency = "Official Statistics",
  initialSlides = [],
  transcripts = [],
  currentTime,
  onTimeUpdate,
}: YouTubePlayerProps) {
  const [activeSec, setActiveSec] = useState(currentTime || 0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [playerMode, setPlayerMode] = useState<"embed" | "lecture_stream">("embed");
  const [transcriptSearch, setTranscriptSearch] = useState("");
  const [embedError, setEmbedError] = useState(false);

  // Slide Deck State
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isGeneratingSlides, setIsGeneratingSlides] = useState(false);
  const [slideSource, setSlideSource] = useState<"ai" | "mock">("mock");
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [isNarrationPlaying, setIsNarrationPlaying] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Generate initial fallback slides based on topic
  function buildDefaultSlideDeck(): GeneratedSlideItem[] {
    return [
      {
        id: 1,
        type: "title",
        title: title,
        subtitle: `${provider} · ${competency} Framework`,
        badge: "POLICY & MANDATE",
        summary: `Official capacity building module on ${title} designed for Indian Statistical Service & Directorate officers.`,
        content: [
          `Aligned with national standards and statutory guidelines for ${competency}`,
          "Standardized estimation pipelines, multiplier weights, and audit trails",
          "Verification benchmarks against administrative registers and control totals",
        ],
        narration: `Welcome officers. In this session on ${title}, we examine operational guidelines and computational accuracy for ${competency}.`,
      },
      {
        id: 2,
        type: "concepts",
        title: "Theoretical Principles & Statutory Definitions",
        subtitle: "Foundational classifications & regulatory mandates",
        badge: "CONCEPTS & SCOPE",
        concepts: [
          {
            term: "Primary Estimation Unit",
            def: "Standardized sampling or institutional entity defining the observation frame.",
          },
          {
            term: "Sampling Multiplier Weights",
            def: "Inverse selection probability (1/P_i) adjusted for sub-sample pooling.",
          },
          {
            term: "Statistical Disclosure Control",
            def: "Protection of respondent microdata privacy under DPDP Act 2023.",
          },
          {
            term: "Audit Trail Reproducibility",
            def: "Automated assertion logs ensuring zero discrepancy in state/national releases.",
          },
        ],
        narration: `Understanding these statutory classifications is fundamental before executing tabulations or policy evaluations.`,
      },
      {
        id: 3,
        type: "formula",
        title: "Methodological Formulas & Estimators",
        subtitle: "Mathematical identities and computational workflows",
        badge: "FORMULA & ESTIMATION",
        formula: {
          name: "Standard Weighted Estimator",
          latex: "θ_hat = Σ (W_i × Y_i) / Σ W_i",
          explanation: "Unbiased weighted mean estimator compensating for unequal selection probabilities across strata.",
        },
        points: [
          "Step 1: Ingest unit records and validate data types against schema dictionary",
          "Step 2: Apply appropriate multiplier divisor (Sub-sample 1 vs Sub-sample 2 vs Combined)",
          "Step 3: Calculate standard errors using Taylor series linearization or jackknife variance",
        ],
        narration: `The weighted estimator guarantees unbiased parameters across diverse population strata.`,
      },
      {
        id: 4,
        type: "case_study",
        title: "MoSPI Implementation & Field Operations",
        subtitle: "End-to-end workflow from field canvassing to executive release",
        badge: "CASE STUDY",
        steps: [
          { num: "01", title: "Field Ingestion & CAPI", desc: "Digital tablet capture with automated range and consistency assertions." },
          { num: "02", title: "State Scrutiny & Pooling", desc: "Reconciliation of Central and State sample allocations." },
          { num: "03", title: "Cabinet Briefing & Tables", desc: "Dissemination via MoSPI Portal and National Data Platform." },
        ],
        narration: `Here is the end-to-end data pipeline from CAPI field tablets to final quarterly bulletins.`,
      },
      {
        id: 5,
        type: "quiz",
        title: "Concept Check & Accreditation Question",
        subtitle: "Formative mastery evaluation for CPD credit",
        badge: "CONCEPT CHECK",
        question: `What is the primary requirement when computing aggregate estimates for ${title}?`,
        options: [
          "Applying normalized sampling weights and verifying variance estimators",
          "Discarding survey responses without documenting non-response factors",
          "Using arbitrary unweighted sample means across unequal strata",
          "Replacing official definitions with ad-hoc estimations",
        ],
        correctAnswer: 0,
        explanation: "MoSPI methodology strictly requires documented sampling multipliers and linearized standard error checks.",
        narration: `Please select the correct option to test your understanding of this topic.`,
      },
    ];
  }

  const [slideDeck, setSlideDeck] = useState<GeneratedSlideItem[]>(() => buildDefaultSlideDeck());

  // Update slide deck when topic title changes
  useEffect(() => {
    setSlideDeck(buildDefaultSlideDeck());
    setCurrentSlideIndex(0);
    setSelectedQuizAnswer(null);
    synthRef.current?.cancel();
    setIsNarrationPlaying(false);
  }, [title, courseTitle]);

  // Speech synthesis setup
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      synthRef.current?.cancel();
    };
  }, []);

  // Clean and resolve video ID
  const cleanId =
    videoId && videoId.trim().length > 3
      ? videoId.trim()
      : DEFAULT_EDUCATIONAL_VIDEO_MAP.default;

  // Track progress and advance slides synchronously if in stream mode
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setActiveSec((s) => {
          const next = s + playbackSpeed;
          onTimeUpdate(next);

          // Auto-advance slides periodically (every 18 seconds) in stream mode
          if (playerMode === "lecture_stream" && slideDeck.length > 0) {
            const calculatedSlideIdx = Math.floor((next % (slideDeck.length * 18)) / 18);
            if (calculatedSlideIdx !== currentSlideIndex && calculatedSlideIdx < slideDeck.length) {
              setCurrentSlideIndex(calculatedSlideIdx);
            }
          }

          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, playerMode, slideDeck.length, currentSlideIndex, onTimeUpdate]);

  function handleSeek(seconds: number) {
    setActiveSec(seconds);
    onTimeUpdate(seconds);
    if (slideDeck.length > 0) {
      const idx = Math.floor((seconds % (slideDeck.length * 18)) / 18);
      setCurrentSlideIndex(Math.min(slideDeck.length - 1, idx));
    }
  }

  function togglePlay() {
    setIsPlaying(!isPlaying);
  }

  // Generate dynamic slides with Groq AI
  async function handleGenerateGroqSlides() {
    setIsGeneratingSlides(true);
    synthRef.current?.cancel();
    setIsNarrationPlaying(false);

    try {
      const result = await generateInteractiveSlideDeck(
        courseTitle,
        title,
        category,
        provider,
        buildDefaultSlideDeck()
      );
      if (result && result.slides && result.slides.length > 0) {
        setSlideDeck(result.slides);
        setSlideSource(result.source);
        setCurrentSlideIndex(0);
        setSelectedQuizAnswer(null);
      }
    } catch (e) {
      console.warn("Groq slide generation error:", e);
    } finally {
      setIsGeneratingSlides(false);
    }
  }

  // Text-to-Speech narration
  function toggleNarration() {
    if (!synthRef.current) return;

    if (isNarrationPlaying) {
      synthRef.current.cancel();
      setIsNarrationPlaying(false);
    } else {
      synthRef.current.cancel();
      const currentSlide = slideDeck[currentSlideIndex];
      const textToSpeak = currentSlide
        ? currentSlide.narration || `${currentSlide.title}. ${currentSlide.summary || ""}`
        : `${title} official lecture.`;

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsNarrationPlaying(false);
      utterance.onerror = () => setIsNarrationPlaying(false);
      synthRef.current.speak(utterance);
      setIsNarrationPlaying(true);
    }
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const filteredTranscripts = transcripts.filter((t) =>
    transcriptSearch ? t.text.toLowerCase().includes(transcriptSearch.toLowerCase()) : true
  );

  const activeSlide = slideDeck[currentSlideIndex] || slideDeck[0];

  return (
    <div className="space-y-4">
      {/* Video Player Header & Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white rounded-2xl border border-gray-100 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
          <span className="text-xs font-bold text-gray-800 truncate max-w-[200px] sm:max-w-md">
            {title}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Mode Switcher */}
          <div className="flex bg-gray-100 p-0.5 rounded-xl text-[11px] font-bold">
            <button
              onClick={() => {
                setPlayerMode("embed");
                setEmbedError(false);
                synthRef.current?.cancel();
                setIsNarrationPlaying(false);
              }}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                playerMode === "embed"
                  ? "bg-white text-[#0B3D66] shadow-xs"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              🎥 YouTube Stream
            </button>
            <button
              onClick={() => setPlayerMode("lecture_stream")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                playerMode === "lecture_stream"
                  ? "bg-[#0B3D66] text-white shadow-xs"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              ⚡ Interactive Slide Stream
            </button>
          </div>

          {/* Watch Directly on YouTube Button */}
          <a
            href={`https://www.youtube.com/watch?v=${cleanId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 text-[11px] font-bold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl transition-colors inline-flex items-center gap-1 cursor-pointer"
            title="Open on YouTube in new tab"
          >
            <span>YouTube</span>
            <span className="text-[10px]">↗</span>
          </a>
        </div>
      </div>

      {/* Primary Video / Slide Stream Canvas Area */}
      <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-slate-950 shadow-xl border border-gray-200 group">
        {playerMode === "embed" && !embedError ? (
          <iframe
            src={`https://www.youtube.com/embed/${cleanId}?autoplay=0&rel=0&enablejsapi=1&origin=${
              typeof window !== "undefined" ? window.location.origin : ""
            }`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 w-full h-full border-0"
            onError={() => setEmbedError(true)}
          />
        ) : (
          /* Interactive Groq AI Slide Stream View */
          <div className="absolute inset-0 w-full h-full flex flex-col justify-between p-5 md:p-6 bg-gradient-to-br from-[#0B3D66] via-[#082E4F] to-[#041726] text-white select-none overflow-y-auto">
            {/* Top Slide Stream Header */}
            <div className="flex justify-between items-start gap-2 border-b border-white/10 pb-2.5">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    {activeSlide?.badge || "OFFICIAL CURRICULUM"}
                  </span>
                  <span className="text-[10px] text-gray-300 font-mono">
                    Slide {currentSlideIndex + 1} of {slideDeck.length}
                  </span>
                  {slideSource === "ai" && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      ✨ Groq LLaMA 3.3
                    </span>
                  )}
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                  {activeSlide?.title}
                </h3>
                {activeSlide?.subtitle && (
                  <p className="text-[11px] text-blue-200 line-clamp-1">{activeSlide.subtitle}</p>
                )}
              </div>

              {/* Action Buttons: Groq AI Generator & Voice */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={toggleNarration}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                    isNarrationPlaying
                      ? "bg-amber-400 text-gray-950 border-amber-400 shadow-xs animate-pulse"
                      : "bg-white/10 hover:bg-white/20 text-white border-white/20"
                  }`}
                  title="Play Voice Narration"
                >
                  <span>{isNarrationPlaying ? "⏸️" : "🔊"}</span>
                  <span className="hidden sm:inline">Voice</span>
                </button>

                <button
                  onClick={handleGenerateGroqSlides}
                  disabled={isGeneratingSlides}
                  className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-gradient-to-r from-[#FF7A00] to-amber-500 hover:from-[#E66E00] hover:to-amber-600 text-white border border-amber-400/40 shadow-xs transition-all cursor-pointer flex items-center gap-1 shrink-0 disabled:opacity-50"
                  title="Generate dynamic 5-slide deck using Groq AI"
                >
                  <span>{isGeneratingSlides ? "⚡" : "✨"}</span>
                  <span className="hidden md:inline">
                    {isGeneratingSlides ? "Generating..." : "Groq AI Deck"}
                  </span>
                </button>
              </div>
            </div>

            {/* Central Slide Content Area */}
            <div className="my-auto py-2 space-y-3 animate-in fade-in duration-200">
              {/* Type 1: Title / Overview */}
              {activeSlide?.type === "title" && (
                <div className="space-y-3 text-left">
                  {activeSlide.summary && (
                    <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 text-xs text-blue-100 leading-relaxed">
                      {activeSlide.summary}
                    </div>
                  )}
                  {activeSlide.content && (
                    <ul className="space-y-1.5 text-xs sm:text-sm text-gray-100">
                      {activeSlide.content.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-[#FF7A00] font-bold text-sm leading-none">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Type 2: Concepts */}
              {activeSlide?.type === "concepts" && activeSlide.concepts && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                  {activeSlide.concepts.map((c, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-white/10 rounded-xl border border-white/10 text-xs space-y-0.5"
                    >
                      <strong className="text-amber-300 font-bold text-[11px] block truncate">
                        {c.term}
                      </strong>
                      <p className="text-[11px] text-gray-200 leading-snug">{c.def}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Type 3: Formula */}
              {activeSlide?.type === "formula" && activeSlide.formula && (
                <div className="space-y-2 text-left">
                  <div className="p-3 bg-black/40 rounded-2xl border border-amber-400/30 space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-amber-300 font-mono">
                      <span>{activeSlide.formula.name}</span>
                      <span>LaTeX Identity</span>
                    </div>
                    <div className="text-sm md:text-base font-mono font-bold text-white text-center py-1 bg-white/5 rounded-xl">
                      {activeSlide.formula.latex}
                    </div>
                    <p className="text-[11px] text-gray-300">{activeSlide.formula.explanation}</p>
                  </div>
                  {activeSlide.points && (
                    <div className="space-y-1 text-[11px] text-gray-200">
                      {activeSlide.points.map((pt, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <span className="text-emerald-400 font-bold">✓</span>
                          <span>{pt}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Type 4: Case Study Steps */}
              {activeSlide?.type === "case_study" && activeSlide.steps && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-left">
                  {activeSlide.steps.map((st, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-white/10 rounded-xl border border-white/10 space-y-1"
                    >
                      <span className="text-base font-bold text-amber-400 font-mono block">
                        {st.num}
                      </span>
                      <h4 className="text-[11px] font-bold text-white leading-tight">{st.title}</h4>
                      <p className="text-[10px] text-gray-300 leading-snug">{st.desc}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Type 5: Concept Check Quiz */}
              {activeSlide?.type === "quiz" && (
                <div className="space-y-2 text-left">
                  <p className="text-xs sm:text-sm font-bold text-white">{activeSlide.question}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {(activeSlide.options || []).map((opt, idx) => {
                      const isChosen = selectedQuizAnswer === idx;
                      const isCorrect = idx === activeSlide.correctAnswer;
                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedQuizAnswer(idx)}
                          className={`p-2 rounded-xl text-left text-[11px] transition-all cursor-pointer border ${
                            selectedQuizAnswer !== null
                              ? isCorrect
                                ? "bg-emerald-600/80 border-emerald-400 text-white font-bold"
                                : isChosen
                                ? "bg-red-600/80 border-red-400 text-white"
                                : "bg-white/5 border-white/10 text-gray-300 opacity-60"
                              : "bg-white/10 hover:bg-white/20 border-white/15 text-white"
                          }`}
                        >
                          <span className="font-bold mr-1.5">
                            {String.fromCharCode(65 + idx)}.
                          </span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {selectedQuizAnswer !== null && activeSlide.explanation && (
                    <div className="p-2 bg-black/40 rounded-xl text-[10px] text-gray-200 border border-white/10">
                      <strong>Rationale:</strong> {activeSlide.explanation}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Scrubber & Slide Navigation Controls */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              {/* Progress Range */}
              <input
                type="range"
                min="0"
                max="1800"
                value={activeSec}
                onChange={(e) => handleSeek(Number(e.target.value))}
                className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#FF7A00]"
              />

              <div className="flex justify-between items-center text-xs">
                {/* Playback buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={togglePlay}
                    className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg font-bold transition-colors cursor-pointer"
                  >
                    {isPlaying ? "Pause ⏸" : "Play ▶"}
                  </button>

                  <span className="font-mono text-[11px] text-amber-300">
                    {formatTime(activeSec)}
                  </span>
                </div>

                {/* Slide Switcher Dots */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      const prev = Math.max(0, currentSlideIndex - 1);
                      setCurrentSlideIndex(prev);
                      setSelectedQuizAnswer(null);
                    }}
                    disabled={currentSlideIndex === 0}
                    className="px-2 py-0.5 bg-white/10 hover:bg-white/20 rounded text-[11px] font-bold disabled:opacity-30 cursor-pointer"
                  >
                    ←
                  </button>

                  {slideDeck.map((s, idx) => (
                    <button
                      key={s.id || idx}
                      onClick={() => {
                        setCurrentSlideIndex(idx);
                        setSelectedQuizAnswer(null);
                      }}
                      className={`w-5 h-5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        currentSlideIndex === idx
                          ? "bg-[#FF7A00] text-white shadow-xs scale-110"
                          : "bg-white/10 hover:bg-white/20 text-gray-300"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => {
                      const next = Math.min(slideDeck.length - 1, currentSlideIndex + 1);
                      setCurrentSlideIndex(next);
                      setSelectedQuizAnswer(null);
                    }}
                    disabled={currentSlideIndex === slideDeck.length - 1}
                    className="px-2 py-0.5 bg-white/10 hover:bg-white/20 rounded text-[11px] font-bold disabled:opacity-30 cursor-pointer"
                  >
                    →
                  </button>
                </div>

                {/* Speed Controls */}
                <div className="hidden sm:flex items-center gap-1">
                  <span className="text-[10px] text-gray-400">Speed:</span>
                  {[1, 1.25, 1.5].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setPlaybackSpeed(spd)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                        playbackSpeed === spd
                          ? "bg-[#FF7A00] text-white"
                          : "bg-white/10 text-gray-300 hover:bg-white/20"
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Video / Slide Quick Navigation Bar */}
      <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-2xs flex flex-wrap justify-between items-center gap-3 text-xs">
        <div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 uppercase">
            Official Course Lecture
          </span>
          <h4 className="font-bold text-gray-900 mt-1">{title}</h4>
          <p className="text-[11px] text-gray-500">
            Accredited by National Statistical Systems Training Academy (NSSTA) &amp; iGOT Karmayogi
          </p>
        </div>

        <div className="flex items-center gap-2">
          {playerMode === "embed" ? (
            <button
              onClick={() => setPlayerMode("lecture_stream")}
              className="px-3 py-1.5 text-xs font-bold text-[#0B3D66] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <span>⚡ Switch to Interactive Slide Stream</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setPlayerMode("embed");
                setEmbedError(false);
              }}
              className="px-3 py-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <span>🎥 Switch to YouTube Video</span>
            </button>
          )}
        </div>
      </div>

      {/* Synchronized Authorized Transcripts Accordion */}
      {transcripts.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-2 border-b border-gray-100 text-xs">
            <div>
              <strong className="text-[#0B3D66]">Authorized Video Transcripts &amp; Timecodes:</strong>
              <span className="text-[10px] text-gray-400 ml-2">
                Click any row to jump to that timestamp
              </span>
            </div>
            <input
              type="text"
              placeholder="Search transcript..."
              value={transcriptSearch}
              onChange={(e) => setTranscriptSearch(e.target.value)}
              className="px-2.5 py-1 text-xs border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-[#0B3D66] focus:outline-none"
            />
          </div>

          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {filteredTranscripts.map((t, idx) => {
              const isActive = activeSec >= t.start_time && activeSec < t.end_time;
              return (
                <div
                  key={t.id || idx}
                  onClick={() => handleSeek(t.start_time)}
                  className={`p-2.5 rounded-xl text-xs flex gap-3 transition-all cursor-pointer hover:scale-[1.005] ${
                    isActive
                      ? "bg-amber-50 border border-amber-300 text-amber-950 font-semibold shadow-2xs"
                      : "bg-gray-50/80 hover:bg-gray-100/80 text-gray-700 border border-transparent"
                  }`}
                >
                  <span
                    className={`font-mono text-[11px] font-bold shrink-0 px-1.5 py-0.5 rounded ${
                      isActive ? "bg-amber-200 text-amber-900" : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {formatTime(t.start_time)}
                  </span>
                  <span className="leading-snug flex-1">{t.text}</span>
                  {isActive && (
                    <span className="text-amber-600 text-xs font-bold shrink-0">● Playing</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

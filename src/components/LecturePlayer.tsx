import { useState, useEffect, useRef } from "react";
import { type CourseChapter, type TranscriptEntry } from "../services/courseContentData";
import {
  generateInteractiveSlideDeck,
  type GeneratedSlideItem,
  hasGroqApiKey,
} from "../services/aiService";

interface LecturePlayerProps {
  chapter: CourseChapter;
  courseTitle: string;
  provider: string;
  transcript: TranscriptEntry[];
  formulas?: { name: string; latex: string; explanation: string }[];
  onComplete?: () => void;
}

export function LecturePlayer({
  chapter,
  courseTitle,
  provider,
  transcript,
  formulas = [],
  onComplete,
}: LecturePlayerProps) {
  const [playerMode, setPlayerMode] = useState<"interactive" | "youtube">("interactive");
  const [isPlaying, setIsPlaying] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiSource, setAiSource] = useState<"groq" | "standard">("standard");
  const playerRef = useRef<HTMLDivElement>(null);

  // Generate baseline structured interactive slides per chapter
  const baseSlides: GeneratedSlideItem[] = [
    {
      id: 1,
      type: "title",
      title: chapter.title,
      subtitle: `${provider} Official Training Module · Chapter ${chapter.id}`,
      badge: "POLICY OVERVIEW",
      summary: chapter.summary,
      content: [
        `Mandatory training syllabus prescribed under the DIID Competency Framework.`,
        `Aligned with MoSPI operational guidelines and national accounting standards.`,
        `Estimated module study duration: ${chapter.duration} with interactive knowledge checks.`,
      ],
      narration: `Welcome to this official session on ${chapter.title}. This module is designed for officers to master ${chapter.summary}. Let us proceed through the key methodological principles.`,
    },
    {
      id: 2,
      type: "concepts",
      title: "Key Framework & Statutory Concepts",
      subtitle: "Core theoretical foundations & definitions",
      badge: "THEORETICAL FOUNDATION",
      concepts: [
        { term: "Primary Scope", def: "Delineates administrative boundaries and data flow architectures." },
        { term: "Standard Classification", def: "Uses NIC, NAPCS, and UNSD harmonized coding systems." },
        { term: "Quality Framework", def: "Strict adherence to UN Fundamental Principles of Official Statistics." },
        { term: "Data Governance", def: "Ensures compliance with DPDP Act 2023 and statistical secrecy." },
      ],
      narration: `In this section, we review the essential statutory and theoretical concepts. Notice the rigorous compliance with standardized classifications and quality assurance frameworks.`,
    },
    {
      id: 3,
      type: "formula",
      title: "Methodology & Mathematical Formulas",
      subtitle: "Official computational identities used in compilation",
      badge: "COMPUTATIONAL IDENTITY",
      formula: formulas[0] || {
        name: "Standard Statistical Parameter Estimator",
        latex: "Estimated Total Y = Sum of (Weight_i * Value_i)",
        explanation: "Applies survey multiplier weights to normalize sub-sample observations to total population.",
      },
      points: [
        "Step 1: Clean unit-level microdata and detect statistical outliers.",
        "Step 2: Apply calibrated post-stratification survey multipliers.",
        "Step 3: Compute aggregate indicators and sub-sample variance.",
      ],
      narration: `Here is the core computational formula used in this division. Always ensure weights are normalized before calculating aggregate totals.`,
    },
    {
      id: 4,
      type: "case_study",
      title: "Official Implementation & Case Study",
      subtitle: "Operational workflow across central and state directorates",
      badge: "CASE STUDY",
      steps: [
        { num: "01", title: "Fieldwork & Data Ingestion", desc: "Mobile CAPI tablet data capture with real-time validation checks." },
        { num: "02", title: "Scrutiny & Tabulation", desc: "Regional office automated scrutiny programs and multiplier weighting." },
        { num: "03", title: "National Dissemination", desc: "Pre-announced release calendar on MoSPI data portal." },
      ],
      narration: `Here is the official end-to-end implementation workflow, moving from field collection on CAPI tablets to national public dissemination.`,
    },
    {
      id: 5,
      type: "quiz",
      title: "Knowledge Check & Concept Mastery",
      subtitle: "Instant formative question for module accreditation",
      badge: "CONCEPT CHECK",
      question: `What is the primary objective of applying standardized ${chapter.title.split(" ")[0]} methodologies in official statistics?`,
      options: [
        "To ensure unbiased, reproducible, and internationally harmonized indicators",
        "To reduce the number of field investigators required for surveys",
        "To replace census enumeration with sample estimates completely",
        "To eliminate all data publication revision cycles",
      ],
      correctAnswer: 0,
      explanation: "Standardized official methodologies ensure unbiased estimation, statistical consistency, and international comparability across time.",
      narration: `Let us test your understanding with this quick formative concept check. Select the most appropriate option below.`,
    },
  ];

  const [activeSlides, setActiveSlides] = useState<GeneratedSlideItem[]>(baseSlides);

  // Update slides on chapter change
  useEffect(() => {
    setActiveSlides(baseSlides);
    setSlideIndex(0);
    setSelectedQuizOption(null);
    setQuizAnswered(false);
    setAiSource("standard");
  }, [chapter.id]);

  async function handleAiRegenerateSlides() {
    setIsAiGenerating(true);
    try {
      const { slides: newSlides, source } = await generateInteractiveSlideDeck(
        courseTitle,
        chapter.title,
        "Official Statistics & Governance",
        provider,
        baseSlides
      );
      setActiveSlides(newSlides);
      setAiSource(source === "groq" ? "groq" : "standard");
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiGenerating(false);
    }
  }

  const currentSlide = activeSlides[slideIndex] || activeSlides[0];

  // Browser Speech Synthesis (TTS) narration
  function speakNarration(text: string) {
    if (!speechEnabled || typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.lang = "en-IN";
    window.speechSynthesis.speak(utterance);
  }

  // Auto slide progression when playing
  useEffect(() => {
    let timer: any;
    if (isPlaying && playerMode === "interactive") {
      speakNarration(currentSlide.narration);
      timer = setTimeout(() => {
        if (slideIndex < activeSlides.length - 1) {
          setSlideIndex((prev) => prev + 1);
        } else {
          setIsPlaying(false);
          onComplete?.();
        }
      }, 9000);
    }
    return () => {
      clearTimeout(timer);
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isPlaying, slideIndex, playerMode, speechEnabled, activeSlides]);

  function handleNextSlide() {
    if (slideIndex < activeSlides.length - 1) {
      setSlideIndex((s) => s + 1);
      setSelectedQuizOption(null);
      setQuizAnswered(false);
    } else {
      onComplete?.();
    }
  }

  function handlePrevSlide() {
    if (slideIndex > 0) {
      setSlideIndex((s) => s - 1);
      setSelectedQuizOption(null);
      setQuizAnswered(false);
    }
  }

  function toggleSpeech() {
    if (!speechEnabled) {
      setSpeechEnabled(true);
      speakNarration(currentSlide.narration);
    } else {
      setSpeechEnabled(false);
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    }
  }

  function handleSelectOption(idx: number) {
    setSelectedQuizOption(idx);
    setQuizAnswered(true);
  }

  return (
    <div
      ref={playerRef}
      className={`bg-[#051C2C] rounded-3xl overflow-hidden shadow-2xl border border-gray-800 flex flex-col transition-all ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none" : ""
      }`}
    >
      {/* Top Header & Mode Switcher */}
      <div className="bg-[#0B253A] px-5 py-3 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-white/90 font-semibold truncate max-w-xs sm:max-w-md">
            {provider} · {chapter.title}
          </span>
          {aiSource === "groq" && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
              ✨ Groq Llama 3.3
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleAiRegenerateSlides}
            disabled={isAiGenerating}
            title="Generate deep dynamic slide deck via Groq Cloud AI"
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              aiSource === "groq"
                ? "bg-purple-600 text-white shadow-xs"
                : "bg-white/10 text-white/80 hover:bg-white/20"
            }`}
          >
            <span>{isAiGenerating ? "⚡ Generating..." : "✨ AI Enhance Deck (Groq)"}</span>
          </button>

          <button
            onClick={toggleSpeech}
            title={speechEnabled ? "Mute Voice Narration" : "Enable Audio Voice Narration"}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              speechEnabled
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "bg-white/5 text-white/50 hover:text-white"
            }`}
          >
            <span>{speechEnabled ? "🔊 Voice On" : "🔇 Voice Off"}</span>
          </button>

          <div className="flex bg-white/10 p-0.5 rounded-lg">
            <button
              onClick={() => setPlayerMode("interactive")}
              className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${
                playerMode === "interactive"
                  ? "bg-[#FF7A00] text-white shadow-xs"
                  : "text-white/70 hover:text-white"
              }`}
            >
              🎓 Interactive Slide Deck
            </button>
            <button
              onClick={() => setPlayerMode("youtube")}
              className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${
                playerMode === "youtube"
                  ? "bg-[#FF7A00] text-white shadow-xs"
                  : "text-white/70 hover:text-white"
              }`}
            >
              📺 YouTube Stream
            </button>
          </div>
        </div>
      </div>

      {/* Main Slide & Video Viewport */}
      <div className="relative aspect-video w-full bg-gradient-to-br from-[#0B3D66] via-[#092B48] to-[#041424] flex flex-col justify-between p-6 sm:p-8 text-white select-none overflow-y-auto">
        {playerMode === "youtube" ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${chapter.youtubeId}?autoplay=1&rel=0`}
            title={chapter.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full border-0"
          />
        ) : (
          <div className="flex flex-col justify-between h-full space-y-4">
            {/* Top Slide Meta */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-[#FF7A00] text-white font-mono text-[10px] font-bold tracking-wider">
                  {currentSlide.badge}
                </span>
                <span className="text-white/60 text-xs font-mono">
                  Slide {slideIndex + 1} of {activeSlides.length}
                </span>
              </div>
              <div className="text-[11px] text-white/50 font-mono hidden sm:block">
                {courseTitle}
              </div>
            </div>

            {/* Slide Body based on Type */}
            <div className="flex-1 flex flex-col justify-center my-auto max-w-3xl mx-auto w-full">
              {/* SLIDE TYPE 1: Title */}
              {currentSlide.type === "title" && (
                <div className="space-y-4 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-2xl mx-auto shadow-inner">
                    🇮🇳
                  </div>
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-wide leading-tight">
                    {currentSlide.title}
                  </h1>
                  <p className="text-xs sm:text-sm text-white/80 max-w-xl mx-auto leading-relaxed">
                    {currentSlide.summary}
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    {currentSlide.content?.map((c, i) => (
                      <span key={i} className="px-3 py-1 bg-white/5 rounded-lg border border-white/10 text-[11px] text-white/70">
                        ✓ {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* SLIDE TYPE 2: Concepts */}
              {currentSlide.type === "concepts" && (
                <div className="space-y-4">
                  <div className="text-center sm:text-left">
                    <h2 className="font-serif text-xl sm:text-2xl font-bold text-white mb-1">
                      {currentSlide.title}
                    </h2>
                    <p className="text-xs text-white/70">{currentSlide.subtitle}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {currentSlide.concepts?.map((c, i) => (
                      <div key={i} className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                        <div className="text-xs font-bold text-[#FF7A00]">{c.term}</div>
                        <div className="text-[11px] text-white/80 leading-relaxed">{c.def}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SLIDE TYPE 3: Formula */}
              {currentSlide.type === "formula" && (
                <div className="space-y-4">
                  <div className="text-center sm:text-left">
                    <h2 className="font-serif text-xl sm:text-2xl font-bold text-white mb-1">
                      {currentSlide.title}
                    </h2>
                    <p className="text-xs text-white/70">{currentSlide.subtitle}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/10 border border-white/20 space-y-2">
                    <div className="text-xs font-bold text-[#FF7A00]">{currentSlide.formula?.name}</div>
                    <div className="p-3 rounded-xl bg-[#051C2C] text-emerald-400 font-mono text-xs sm:text-sm border border-emerald-500/20 overflow-x-auto">
                      {currentSlide.formula?.latex}
                    </div>
                    <div className="text-[11px] text-white/80">{currentSlide.formula?.explanation}</div>
                  </div>
                  <div className="space-y-1 text-xs text-white/70">
                    {currentSlide.points?.map((p, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-[#FF7A00] font-bold">→</span>
                        <span>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SLIDE TYPE 4: Case Study */}
              {currentSlide.type === "case_study" && (
                <div className="space-y-4">
                  <div className="text-center sm:text-left">
                    <h2 className="font-serif text-xl sm:text-2xl font-bold text-white mb-1">
                      {currentSlide.title}
                    </h2>
                    <p className="text-xs text-white/70">{currentSlide.subtitle}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    {currentSlide.steps?.map((s, i) => (
                      <div key={i} className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                        <span className="text-lg font-serif font-bold text-[#FF7A00]">{s.num}</span>
                        <div className="text-xs font-bold text-white">{s.title}</div>
                        <div className="text-[10px] text-white/70 leading-relaxed">{s.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SLIDE TYPE 5: Concept Check Quiz */}
              {currentSlide.type === "quiz" && (
                <div className="space-y-4">
                  <div>
                    <h2 className="font-serif text-xl font-bold text-white mb-1">
                      {currentSlide.title}
                    </h2>
                    <p className="text-xs text-white/70 mb-3">{currentSlide.question}</p>
                  </div>

                  <div className="space-y-2">
                    {currentSlide.options?.map((opt, idx) => {
                      const selected = selectedQuizOption === idx;
                      const isCorrect = idx === currentSlide.correctAnswer;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectOption(idx)}
                          className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                            quizAnswered && isCorrect
                              ? "bg-emerald-900/60 border-emerald-400 text-emerald-100 font-semibold"
                              : quizAnswered && selected && !isCorrect
                              ? "bg-rose-900/60 border-rose-400 text-rose-100"
                              : selected
                              ? "bg-[#FF7A00] text-white font-semibold"
                              : "bg-white/5 hover:bg-white/10 border-white/10 text-white/90"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center text-[10px] font-bold shrink-0">
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span>{opt}</span>
                          </div>
                          {quizAnswered && isCorrect && <span>✓ Correct</span>}
                          {quizAnswered && selected && !isCorrect && <span>✗ Incorrect</span>}
                        </button>
                      );
                    })}
                  </div>

                  {quizAnswered && (
                    <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/30 text-xs text-emerald-200">
                      <strong>Explanation:</strong> {currentSlide.explanation}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Narration Closed Caption */}
            <div className="bg-black/60 backdrop-blur-sm rounded-xl p-2.5 border border-white/10 text-center mx-auto max-w-2xl w-full">
              <div className="text-[10px] text-white/90 italic font-mono">
                " {currentSlide.narration} "
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Slide Navigation Toolbar */}
      {playerMode === "interactive" && (
        <div className="bg-[#0B253A] px-5 py-3 border-t border-white/10 flex items-center justify-between text-white text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevSlide}
              disabled={slideIndex === 0}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 disabled:opacity-30 rounded-xl text-xs font-semibold transition-colors"
            >
              ← Previous Slide
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-4 py-1.5 bg-[#FF7A00] hover:bg-[#e06a00] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
            >
              <span>{isPlaying ? "❚❚ Pause Deck" : "▶ Auto-Play Deck"}</span>
            </button>
            <button
              onClick={handleNextSlide}
              className="px-4 py-1.5 bg-[#0B3D66] hover:bg-[#082e4f] border border-white/20 rounded-xl text-xs font-semibold transition-colors"
            >
              {slideIndex === activeSlides.length - 1 ? "Complete Chapter ✓" : "Next Slide →"}
            </button>
          </div>

          {/* Slide Indicator Dots */}
          <div className="flex items-center gap-1.5">
            {activeSlides.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => {
                  setSlideIndex(idx);
                  setSelectedQuizOption(null);
                  setQuizAnswered(false);
                }}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  idx === slideIndex
                    ? "bg-[#FF7A00] w-6"
                    : "bg-white/20 hover:bg-white/40"
                }`}
                title={`Jump to Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

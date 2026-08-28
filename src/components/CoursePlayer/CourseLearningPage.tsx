import React, { useState, useEffect } from "react";
import { LearningModeSwitcher, type LearningMode } from "./LearningModeSwitcher";
import { YouTubePlayer, type TranscriptItem } from "./YouTubePlayer";
import { AISlidePlayer, type AISlide, type LectureSegment } from "./AISlidePlayer";
import { TopicSidebar, type TopicItem } from "./TopicSidebar";
import { TopicQuizModal, type QuizQuestion } from "./TopicQuizModal";
import { AITutorDrawer } from "./AITutorDrawer";
import { CourseItem, applyClosedLoopCompetencyUpdate } from "../../services/storageService";

interface CourseLearningPageProps {
  course: CourseItem;
  onBack: () => void;
}

const DEFAULT_TOPICS: TopicItem[] = [
  {
    id: "top-101-1",
    title: "1. Introduction to Official Data Science with Python",
    sequence_order: 1,
    duration_minutes: 15,
    description: "Setting up Python 3.11 environment, NumPy arrays, and reproducible government statistical workflows.",
  },
  {
    id: "top-101-2",
    title: "2. Pandas DataFrames for NSSO Microdata Ingestion",
    sequence_order: 2,
    duration_minutes: 20,
    description: "Parsing fixed-width text files, handling missing codes, and cleaning million-row survey records.",
  },
  {
    id: "top-101-3",
    title: "3. Survey Multiplier Weighting & Stratification Math",
    sequence_order: 3,
    duration_minutes: 25,
    description: "Applying sub-sample multipliers, design weights, and estimating population totals with standard errors.",
  },
  {
    id: "top-101-4",
    title: "4. Statistical Visualizations with Matplotlib & Seaborn",
    sequence_order: 4,
    duration_minutes: 20,
    description: "Visualizing price distributions, Lorenz curves, and demographic pyramids for cabinet summaries.",
  },
  {
    id: "top-101-5",
    title: "5. Automated Report Generation & Export Pipelines",
    sequence_order: 5,
    duration_minutes: 20,
    description: "Building automated Python scripts to generate periodic quarterly statistical bulletins.",
  },
];

const DEFAULT_TRANSCRIPTS: Record<string, TranscriptItem[]> = {
  "top-101-1": [
    { id: "1", start_time: 0, end_time: 45, text: "Welcome to Python Data Science Foundations for Official Statistics." },
    { id: "2", start_time: 45, end_time: 110, text: "In official government statistics, computational integrity and reproducibility are paramount." },
    { id: "3", start_time: 110, end_time: 180, text: "NumPy arrays allow high-performance vectorized operations on survey indicators without slow Python loops." },
    { id: "4", start_time: 180, end_time: 260, text: "By mastering vectorized transformations, we ensure consistent estimation across state and district levels." },
  ],
};

const DEFAULT_SLIDES: Record<string, AISlide[]> = {
  "top-101-1": [
    {
      slide_number: 1,
      title: "Official Statistical Computing Architecture",
      key_points: [
        "Transition from manual spreadsheets to automated code pipelines",
        "High-performance vectorized NumPy operations for survey data",
        "Strict reproducibility and compliance with MoSPI standards",
      ],
      explanation: "Official statistical production requires automated data verification scripts that produce verifiable audit trails.",
      example: "Automating PLFS quarterly multiplier validation with vectorized array operations.",
    },
    {
      slide_number: 2,
      title: "Vectorized Computations & Imputation",
      key_points: [
        "Memory-efficient in-place arithmetic on survey weights",
        "Avoid Python for-loops on multi-million row census records",
        "Handling missing codes (e.g. 99, 999) using np.nan masking",
      ],
      explanation: "Vectorized computations execute in optimized C routines, completing nationwide survey aggregations in seconds.",
      example: "df['adj_weight'] = np.where(df['stratum'] == 1, df['weight'] * 1.05, df['weight'])",
    },
    {
      slide_number: 3,
      title: "Reproducibility & Quality Assurance",
      key_points: [
        "Deterministic random seeds for sample splits",
        "Automated assertion checks on control totals",
        "Standardized National Metadata Framework exports",
      ],
      explanation: "Ensuring any statistical officer can execute the same script and obtain identical published tables.",
      example: "assert df['population_weight'].sum() == published_census_benchmark",
    },
  ],
};

const DEFAULT_QUIZ_QUESTIONS: Record<string, QuizQuestion[]> = {
  "top-101-1": [
    {
      id: 1,
      question: "Why is vectorization preferred over standard Python for-loops for processing nationwide survey data?",
      options: [
        "It uses optimized C routines for orders-of-magnitude faster execution",
        "It eliminates the need for RAM memory",
        "It automatically corrects field survey entry errors",
        "It converts all text strings into encrypted integers",
      ],
      correct_answer_index: 0,
      explanation: "Vectorized operations in NumPy/Pandas leverage SIMD C instructions, avoiding Python interpreter overhead across millions of records.",
    },
    {
      id: 2,
      question: "Which NumPy function is standardly used to mask missing survey codes (e.g. 999) without losing data type integrity?",
      options: ["np.nan", "np.delete()", "np.zero()", "np.empty()"],
      correct_answer_index: 0,
      explanation: "np.nan represents floating-point Not-a-Number, allowing statistical aggregations to skip missing survey responses.",
    },
    {
      id: 3,
      question: "What is the primary benefit of deterministic random seeds in official survey simulation and bootstrapping?",
      options: [
        "Ensures identical reproducible sampling results across independent verifications",
        "Increases server execution speed by 50%",
        "Encrypts the survey responses against unauthorized access",
        "Compresses the dataset into gzip format automatically",
      ],
      correct_answer_index: 0,
      explanation: "Setting a deterministic seed ensures any external auditor or ministry committee reproduces exact identical sample draws.",
    },
  ],
};

export function CourseLearningPage({ course, onBack }: CourseLearningPageProps) {
  const [activeMode, setActiveMode] = useState<LearningMode>("youtube");
  const [currentTopicId, setCurrentTopicId] = useState<string>("top-101-1");
  const [completedTopicIds, setCompletedTopicIds] = useState<string[]>(["top-101-1", "top-101-2"]);
  const [currentVideoTime, setCurrentVideoTime] = useState<number>(120);
  const [currentSlide, setCurrentSlide] = useState<number>(1);
  const [quizOpen, setQuizOpen] = useState<boolean>(false);
  const [tutorOpen, setTutorOpen] = useState<boolean>(false);

  const topics = DEFAULT_TOPICS;
  const currentTopic = topics.find((t) => t.id === currentTopicId) || topics[0];
  const transcripts = DEFAULT_TRANSCRIPTS[currentTopicId] || DEFAULT_TRANSCRIPTS["top-101-1"];
  const slides = DEFAULT_SLIDES[currentTopicId] || DEFAULT_SLIDES["top-101-1"];
  const quizQuestions = DEFAULT_QUIZ_QUESTIONS[currentTopicId] || DEFAULT_QUIZ_QUESTIONS["top-101-1"];

  const progressPct = Math.round((completedTopicIds.length / topics.length) * 100);

  function handleModeChange(newMode: LearningMode) {
    setActiveMode(newMode);
  }

  function handleTopicQuizSubmit(answers: number[]) {
    if (!completedTopicIds.includes(currentTopicId)) {
      const updated = [...completedTopicIds, currentTopicId];
      setCompletedTopicIds(updated);

      // Trigger closed-loop competency update
      applyClosedLoopCompetencyUpdate({
        competencyName: course.primaryCompetency,
        scorePct: 100,
        evidence: `Completed Topic: ${currentTopic.title} (${course.provider})`,
      });
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-white p-4 rounded-3xl border border-gray-100 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-xs cursor-pointer"
          >
            ←
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800">
                {course.provider} Karmayogi
              </span>
              <span className="text-[10px] text-gray-400 font-mono">Accredited Curricula</span>
            </div>
            <h1 className="text-sm md:text-base font-bold text-[#0B3D66] mt-0.5 truncate max-w-md">
              {course.title}
            </h1>
          </div>
        </div>

        {/* Action Buttons & Mode Switcher */}
        <div className="flex items-center gap-2.5">
          <LearningModeSwitcher
            activeMode={activeMode}
            onModeChange={handleModeChange}
          />

          <button
            onClick={() => setTutorOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-[#0B3D66] border border-blue-200 rounded-xl text-xs font-bold hover:bg-blue-100 cursor-pointer"
          >
            <span>💬</span>
            <span className="hidden sm:inline">Ask AI Tutor</span>
          </button>
        </div>
      </div>

      {/* Main Learning Grid (Sidebar + Active Player) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Topic Sidebar */}
        <div className="lg:col-span-4 h-full">
          <TopicSidebar
            topics={topics}
            currentTopicId={currentTopicId}
            completedTopicIds={completedTopicIds}
            onSelectTopic={(tId) => {
              setCurrentTopicId(tId);
              setCurrentSlide(1);
            }}
            overallProgressPct={progressPct}
          />
        </div>

        {/* Player Canvas */}
        <div className="lg:col-span-8 space-y-4">
          {activeMode === "youtube" ? (
            <YouTubePlayer
              videoId="r-uOLxNrNk8"
              title={currentTopic.title}
              transcripts={transcripts}
              currentTime={currentVideoTime}
              onTimeUpdate={(sec) => setCurrentVideoTime(sec)}
            />
          ) : (
            <AISlidePlayer
              slides={slides}
              currentSlide={currentSlide}
              onSlideChange={(sNum) => setCurrentSlide(sNum)}
              onCompleteTopic={() => setQuizOpen(true)}
            />
          )}

          {/* Post-Lecture Knowledge Check CTA */}
          <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-200 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF7A00]">
                Accreditation Step
              </span>
              <h4 className="text-xs font-bold text-gray-900 mt-0.5">
                Ready to verify understanding for {currentTopic.title}?
              </h4>
            </div>
            <button
              onClick={() => setQuizOpen(true)}
              className="px-4 py-2 bg-[#FF7A00] hover:bg-[#e06a00] text-white text-xs font-bold rounded-xl shadow-md cursor-pointer shrink-0"
            >
              Take Topic Quiz (3 MCQs) →
            </button>
          </div>
        </div>
      </div>

      {/* Modals & Drawers */}
      <TopicQuizModal
        isOpen={quizOpen}
        topicTitle={currentTopic.title}
        questions={quizQuestions}
        onClose={() => setQuizOpen(false)}
        onSubmit={handleTopicQuizSubmit}
      />

      <AITutorDrawer
        isOpen={tutorOpen}
        onClose={() => setTutorOpen(false)}
        courseTitle={course.title}
        topicTitle={currentTopic.title}
        activeSlideTitle={slides[currentSlide - 1]?.title}
      />
    </div>
  );
}

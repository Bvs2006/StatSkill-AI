import React, { useState, useEffect } from "react";
import { LearningModeSwitcher, type LearningMode } from "./LearningModeSwitcher";
import { YouTubePlayer, type TranscriptItem } from "./YouTubePlayer";
import { AISlidePlayer, type AISlide } from "./AISlidePlayer";
import { TopicSidebar, type TopicItem } from "./TopicSidebar";
import { TopicQuizModal, type QuizQuestion } from "./TopicQuizModal";
import { AITutorDrawer } from "./AITutorDrawer";
import { CourseItem, applyClosedLoopCompetencyUpdate, issueDigitalCredential } from "../../services/storageService";
import { getRichCourseDetail } from "../../services/courseContentData";

interface CourseLearningPageProps {
  course: CourseItem;
  onBack: () => void;
}

export function CourseLearningPage({ course, onBack }: CourseLearningPageProps) {
  const [activeMode, setActiveMode] = useState<LearningMode>("youtube");
  const [currentVideoTime, setCurrentVideoTime] = useState<number>(0);
  const [currentSlide, setCurrentSlide] = useState<number>(1);
  const [quizOpen, setQuizOpen] = useState<boolean>(false);
  const [tutorOpen, setTutorOpen] = useState<boolean>(false);

  // Load rich course detail for the specific course
  const richDetail = getRichCourseDetail(course.id, course.title);

  // Convert rich chapters to TopicItem[]
  const topics: TopicItem[] = (richDetail.chapters && richDetail.chapters.length > 0)
    ? richDetail.chapters.map((ch, idx) => ({
        id: `${course.id}-ch-${ch.id}`,
        title: ch.title,
        sequence_order: idx + 1,
        duration_minutes: parseInt(ch.duration) || 20,
        description: ch.summary,
      }))
    : [
        {
          id: `${course.id}-ch-1`,
          title: `1. Foundations of ${course.title}`,
          sequence_order: 1,
          duration_minutes: 20,
          description: "Core fundamental principles and methodological framework.",
        },
      ];

  const [currentTopicId, setCurrentTopicId] = useState<string>(topics[0]?.id || `${course.id}-ch-1`);
  const [completedTopicIds, setCompletedTopicIds] = useState<string[]>([topics[0]?.id || `${course.id}-ch-1`]);

  // Sync currentTopicId when course changes
  useEffect(() => {
    if (topics[0]?.id) {
      setCurrentTopicId(topics[0].id);
      setCompletedTopicIds([topics[0].id]);
      setCurrentSlide(1);
      setCurrentVideoTime(0);
    }
  }, [course.id]);

  const currentTopicIndex = Math.max(0, topics.findIndex((t) => t.id === currentTopicId));
  const currentTopic = topics[currentTopicIndex] || topics[0];
  const activeChapter = richDetail.chapters[currentTopicIndex] || richDetail.chapters[0];
  const activeYoutubeId = activeChapter?.youtubeId || richDetail.youtubeId || "d8uTB5XorBw";

  // Dynamic transcripts from richDetail
  const transcripts: TranscriptItem[] = (richDetail.transcript && richDetail.transcript.length > 0)
    ? richDetail.transcript.map((t, idx) => {
        const parts = t.time.split(":");
        const startSec = (parseInt(parts[0]) || 0) * 60 + (parseInt(parts[1]) || 0);
        return {
          id: String(idx + 1),
          start_time: startSec,
          end_time: startSec + 45,
          text: `[${t.speaker}] ${t.text}`,
        };
      })
    : [
        { id: "1", start_time: 0, end_time: 40, text: `Welcome to the official session on ${currentTopic.title}.` },
        { id: "2", start_time: 40, end_time: 90, text: `In this module we explore standardized MoSPI frameworks for ${course.primaryCompetency}.` },
      ];

  // Dynamic slides for the active chapter
  const slides: AISlide[] = [
    {
      slide_number: 1,
      title: activeChapter ? activeChapter.title : currentTopic.title,
      key_points: richDetail.keyTakeaways || [
        "Core concepts and regulatory guidelines under MoSPI frameworks",
        "Standardized calculation methodology and data flows",
        "Implementation and audit compliance protocols",
      ],
      explanation: activeChapter ? activeChapter.summary : `Comprehensive analysis of ${currentTopic.title} for statistical officers.`,
      example: richDetail.formulas && richDetail.formulas[0]
        ? `${richDetail.formulas[0].name}: ${richDetail.formulas[0].latex}`
        : "Standard operational procedure in state and national directorates.",
    },
    {
      slide_number: 2,
      title: "Methodological Derive & Formula Standards",
      key_points: (richDetail.formulas || []).map((f) => `${f.name}: ${f.explanation}`),
      explanation: richDetail.formulas && richDetail.formulas[0] ? richDetail.formulas[0].explanation : "Statistical estimation methodology.",
      example: richDetail.formulas && richDetail.formulas[0] ? richDetail.formulas[0].latex : "Y_hat = sum(W_i * Y_i)",
    },
    {
      slide_number: 3,
      title: "Practical Case Studies & Governance Quality",
      key_points: [
        "Verification against administrative control totals and benchmark registers",
        "Strict adherence to official NSSTA and iGOT evaluation standards",
        "Integration into quarterly MoSPI bulletins and executive dashboards",
      ],
      explanation: "Ensuring high accuracy, reproducibility, and compliance in national statistical operations.",
      example: "Automated assertion checks and cross-validation pipelines.",
    },
  ];

  // Dynamic quiz questions for the active chapter
  const quizQuestions: QuizQuestion[] = [
    {
      id: 1,
      question: `What is the primary methodological objective of ${currentTopic.title}?`,
      options: [
        `Ensure standardized, unbiased estimation and audit compliance under ${course.primaryCompetency}`,
        "Eliminate all data collection requirements from field offices",
        "Replace government databases with unverified public web sources",
        "Generate random baseline numbers for immediate publication",
      ],
      correct_answer_index: 0,
      explanation: `Standardized official methodologies ensure computational consistency and statutory compliance across central and state directorates.`,
    },
    {
      id: 2,
      question: `In the context of ${course.title}, what guarantees data reliability?`,
      options: [
        "Rigorous formula adherence, sampling multiplier weights, and validation checks",
        "Discarding all outlier survey responses without documentation",
        "Manual subjective estimation by local field staff",
        "Limiting survey sample sizes to single digits",
      ],
      correct_answer_index: 0,
      explanation: `MoSPI standards mandate explicit multiplier weights, documented formula implementations, and multi-tier quality checks.`,
    },
    {
      id: 3,
      question: `How are competencies in ${course.primaryCompetency} verified for official accreditation?`,
      options: [
        "Through verified modular assessments, virtual labs, and closed-loop competency evaluations",
        "By attending without taking interactive quizzes or labs",
        "By submitting unverified manual logs without digital signatures",
        "Competencies are fixed at recruitment and cannot be upgraded",
      ],
      correct_answer_index: 0,
      explanation: `StatSkill AI applies closed-loop competency updates and cryptographic W3C verifiable credentials upon demonstrated mastery.`,
    },
  ];

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

      // If all topics are completed, automatically issue the verifiable credential!
      if (updated.length >= topics.length) {
        issueDigitalCredential({
          title: course.title,
          issuer: course.provider === "NSSTA" ? "NSSTA" : "iGOT Karmayogi",
          competencyPillars: [course.primaryCompetency, course.category],
          scorePct: 95,
          cpdHours: parseInt(course.duration) || 12,
        });
      }
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
        {/* Player Canvas (Top on Mobile, Right on Desktop) */}
        <div className="order-1 lg:order-2 lg:col-span-8 space-y-4">
          {activeMode === "youtube" ? (
            <YouTubePlayer
              videoId={activeYoutubeId}
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

        {/* Topic Sidebar (Below on Mobile, Left on Desktop) */}
        <div className="order-2 lg:order-1 lg:col-span-4 h-full">
          <TopicSidebar
            topics={topics}
            currentTopicId={currentTopicId}
            completedTopicIds={completedTopicIds}
            onSelectTopic={(tId) => {
              setCurrentTopicId(tId);
              setCurrentSlide(1);
              setCurrentVideoTime(0);
            }}
            overallProgressPct={progressPct}
          />
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
        activeSlideContent={
          slides[currentSlide - 1]
            ? {
                key_points: slides[currentSlide - 1]?.key_points,
                explanation: slides[currentSlide - 1]?.explanation,
                example: slides[currentSlide - 1]?.example,
              }
            : undefined
        }
      />
    </div>
  );
}

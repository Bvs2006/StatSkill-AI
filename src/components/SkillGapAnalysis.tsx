import React, { useState, useMemo } from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  Legend,
} from "recharts";
import {
  UserCompetencyScore,
  CompetencyDomain,
  CompetencyDefinition,
  CourseItem,
  QuizItem,
  JobRoleDefinition,
  OfficerProfile,
  getUserCompetencies,
  saveUserCompetencies,
  getProfile,
  getCourses,
  getQuizzes,
  DEFAULT_JOB_ROLES,
  DEFAULT_COMPETENCIES_CATALOGUE,
} from "../services/storageService";
import type { Screen } from "../App";

interface SkillGapAnalysisProps {
  onNav: (s: Screen) => void;
  onOpenCourse?: (c: CourseItem) => void;
}

// MoSPI Proficiency Level Rubric Descriptions
export const PROFICIENCY_LEVEL_RUBRICS: Record<
  number,
  { name: string; tag: string; desc: string; color: string }
> = {
  1: {
    name: "Level 1: Awareness",
    tag: "Novice",
    desc: "Recognizes foundational terminology, concepts, and standard MoSPI survey guidelines.",
    color: "bg-slate-100 text-slate-700 border-slate-200",
  },
  2: {
    name: "Level 2: Working Knowledge",
    tag: "Basic",
    desc: "Executes routine data tasks, basic queries, and standardized calculations with supervisory guidance.",
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
  3: {
    name: "Level 3: Autonomous Practitioner",
    tag: "Intermediate",
    desc: "Performs full survey cycles, advanced analytics, and data validation independently without supervision.",
    color: "bg-amber-50 text-amber-800 border-amber-200",
  },
  4: {
    name: "Level 4: Advanced Specialist",
    tag: "Advanced",
    desc: "Resolves statistical anomalies, optimizes survey algorithms, and trains subordinate cadre personnel.",
    color: "bg-purple-50 text-purple-800 border-purple-200",
  },
  5: {
    name: "Level 5: Cadre Expert & Standard Setter",
    tag: "Expert",
    desc: "Authors national methodology guidelines, represents India at UN statistical bodies, and designs ministry frameworks.",
    color: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
};

export const DOMAIN_METADATA: Record<
  CompetencyDomain,
  { icon: string; bg: string; text: string; border: string; accent: string }
> = {
  Statistical: {
    icon: "📈",
    bg: "bg-blue-50/80",
    text: "text-blue-900",
    border: "border-blue-200",
    accent: "#0B3D66",
  },
  Technical: {
    icon: "💻",
    bg: "bg-orange-50/80",
    text: "text-orange-900",
    border: "border-orange-200",
    accent: "#FF7A00",
  },
  "Digital Governance": {
    icon: "🏛️",
    bg: "bg-emerald-50/80",
    text: "text-emerald-900",
    border: "border-emerald-200",
    accent: "#10B981",
  },
  Behavioural: {
    icon: "🤝",
    bg: "bg-purple-50/80",
    text: "text-purple-900",
    border: "border-purple-200",
    accent: "#8B5CF6",
  },
};

export function SkillGapAnalysis({ onNav, onOpenCourse }: SkillGapAnalysisProps) {
  const profile: OfficerProfile = getProfile();
  const allCourses: CourseItem[] = getCourses();
  const allQuizzes: QuizItem[] = getQuizzes();

  // State
  const [competencies, setCompetencies] = useState<UserCompetencyScore[]>(() =>
    getUserCompetencies()
  );
  const [selectedRole, setSelectedRole] = useState<JobRoleDefinition>(() => {
    return (
      DEFAULT_JOB_ROLES.find(
        (r) =>
          r.id === profile.jobRoleId ||
          (profile.cadreGrade && r.cadreGrade === profile.cadreGrade) ||
          (profile.department && r.department.toLowerCase().includes(profile.department.toLowerCase()))
      ) ||
      (profile.cadreGrade === "JAG" || profile.cadreGrade === "SAG" || profile.cadreGrade === "HAG"
        ? DEFAULT_JOB_ROLES[2]
        : profile.cadreGrade === "SSO" || profile.cadreGrade === "JSO"
        ? DEFAULT_JOB_ROLES[1]
        : DEFAULT_JOB_ROLES[0])
    );
  });
  const [viewMode, setViewMode] = useState<"matrix" | "table" | "analytics" | "rubric">("matrix");
  const [domainFilter, setDomainFilter] = useState<string>("ALL");
  const [gapFilter, setGapFilter] = useState<"ALL" | "GAPS_ONLY" | "HIGH_PRIORITY" | "MET">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"priority" | "gap" | "name" | "current">("priority");
  const [sortDirection, setSortDirection] = useState<"desc" | "asc">("desc");

  // Selected skill modal / deep dive
  const [activeSkillModal, setActiveSkillModal] = useState<UserCompetencyScore | null>(null);

  // Formula explainer collapse
  const [showFormulaDetails, setShowFormulaDetails] = useState(false);

  // Simulation mode
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedLevels, setSimulatedLevels] = useState<Record<string, number>>({});

  // Recalculate competencies when role or simulated levels change
  const computedCompetencies = useMemo(() => {
    return competencies.map((comp) => {
      const def = DEFAULT_COMPETENCIES_CATALOGUE.find(
        (d) => d.name === comp.competencyName
      );
      const reqFromRole = selectedRole.requiredCompetencies[comp.competencyName] ?? 3;
      const currentLevel = isSimulating && simulatedLevels[comp.competencyName] !== undefined
        ? simulatedLevels[comp.competencyName]
        : comp.currentLevel;

      const gap = Math.max(0, reqFromRole - currentLevel);

      // Formula breakdown
      const gapNormalized = (gap / 5) * 100;
      const reqNormalized = (reqFromRole / 5) * 100;
      const deptPriority = def?.departmentPriority ?? 4;
      const futureDemand = def?.futureDemandScore ?? 4;
      const deptNormalized = (deptPriority / 5) * 100;
      const futureNormalized = (futureDemand / 5) * 100;
      const careerRelevance = gap > 0 ? 90 : 40;

      const priorityScore = Math.round(
        0.35 * gapNormalized +
        0.25 * reqNormalized +
        0.20 * deptNormalized +
        0.10 * futureNormalized +
        0.10 * careerRelevance
      );

      let priorityLevel: "High" | "Medium" | "Low" | "None" = "None";
      if (gap >= 2 || priorityScore >= 70) priorityLevel = "High";
      else if (gap === 1 || priorityScore >= 50) priorityLevel = "Medium";
      else if (priorityScore >= 30) priorityLevel = "Low";

      return {
        ...comp,
        currentLevel,
        requiredLevel: reqFromRole,
        gap,
        priorityScore,
        priorityLevel,
      };
    });
  }, [competencies, selectedRole, isSimulating, simulatedLevels]);

  // Overall Cadre Alignment Score (e.g. Current points / Total Required Points * 100)
  const totalRequired = computedCompetencies.reduce((acc, c) => acc + c.requiredLevel, 0);
  const totalCurrentCapped = computedCompetencies.reduce(
    (acc, c) => acc + Math.min(c.currentLevel, c.requiredLevel),
    0
  );
  const alignmentPct = totalRequired > 0 ? Math.round((totalCurrentCapped / totalRequired) * 100) : 0;

  // Counts
  const criticalGapsCount = computedCompetencies.filter((c) => c.gap >= 2).length;
  const moderateGapsCount = computedCompetencies.filter((c) => c.gap === 1).length;
  const benchmarkMetCount = computedCompetencies.filter((c) => c.gap === 0).length;
  const totalGapsCount = criticalGapsCount + moderateGapsCount;

  // Filtered and Sorted list
  const processedCompetencies = useMemo(() => {
    let list = [...computedCompetencies];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.competencyName.toLowerCase().includes(q) ||
          c.domain.toLowerCase().includes(q) ||
          (DEFAULT_COMPETENCIES_CATALOGUE.find((d) => d.name === c.competencyName)?.description || "")
            .toLowerCase()
            .includes(q)
      );
    }

    // Domain filter
    if (domainFilter !== "ALL") {
      list = list.filter((c) => c.domain === domainFilter);
    }

    // Gap filter
    if (gapFilter === "GAPS_ONLY") {
      list = list.filter((c) => c.gap > 0);
    } else if (gapFilter === "HIGH_PRIORITY") {
      list = list.filter((c) => c.priorityLevel === "High" && c.gap > 0);
    } else if (gapFilter === "MET") {
      list = list.filter((c) => c.gap === 0);
    }

    // Sorting
    list.sort((a, b) => {
      let diff = 0;
      if (sortBy === "priority") {
        diff = b.priorityScore - a.priorityScore;
      } else if (sortBy === "gap") {
        diff = b.gap - a.gap;
      } else if (sortBy === "current") {
        diff = b.currentLevel - a.currentLevel;
      } else if (sortBy === "name") {
        diff = a.competencyName.localeCompare(b.competencyName);
      }
      return sortDirection === "desc" ? diff : -diff;
    });

    return list;
  }, [computedCompetencies, searchQuery, domainFilter, gapFilter, sortBy, sortDirection]);

  // Radar Data for Analytics View
  const domains: CompetencyDomain[] = [
    "Statistical",
    "Technical",
    "Digital Governance",
    "Behavioural",
  ];

  const radarData = domains.map((d) => {
    const items = computedCompetencies.filter((c) => c.domain === d);
    const avgCurrent =
      items.length > 0
        ? items.reduce((acc, c) => acc + c.currentLevel, 0) / items.length
        : 0;
    const avgReq =
      items.length > 0
        ? items.reduce((acc, c) => acc + c.requiredLevel, 0) / items.length
        : 0;
    return {
      domain: d,
      Current: Number(avgCurrent.toFixed(1)),
      Required: Number(avgReq.toFixed(1)),
      gap: Number(Math.max(0, avgReq - avgCurrent).toFixed(1)),
    };
  });

  // Domain summary statistics
  const domainSummaries = domains.map((d) => {
    const items = computedCompetencies.filter((c) => c.domain === d);
    const totalGaps = items.filter((c) => c.gap > 0).length;
    const highGaps = items.filter((c) => c.priorityLevel === "High" && c.gap > 0).length;
    const avgScore =
      items.length > 0
        ? Math.round(
            (items.reduce((acc, c) => acc + c.currentLevel, 0) / (items.length * 5)) * 100
          )
        : 0;
    return {
      domain: d,
      itemsCount: items.length,
      totalGaps,
      highGaps,
      avgScore,
      meta: DOMAIN_METADATA[d],
    };
  });

  // Handlers for simulation
  const handleSimulateChange = (compName: string, delta: number) => {
    const current =
      simulatedLevels[compName] !== undefined
        ? simulatedLevels[compName]
        : computedCompetencies.find((c) => c.competencyName === compName)?.currentLevel ?? 2;
    const newLevel = Math.max(1, Math.min(5, current + delta));
    setSimulatedLevels((prev) => ({
      ...prev,
      [compName]: newLevel,
    }));
  };

  const handleSaveSimulation = () => {
    const updated = competencies.map((c) => {
      if (simulatedLevels[c.competencyName] !== undefined) {
        return {
          ...c,
          currentLevel: simulatedLevels[c.competencyName],
          gap: Math.max(0, c.requiredLevel - simulatedLevels[c.competencyName]),
        };
      }
      return c;
    });
    saveUserCompetencies(updated);
    setCompetencies(updated);
    setIsSimulating(false);
    setSimulatedLevels({});
  };

  const handleResetSimulation = () => {
    setSimulatedLevels({});
    setIsSimulating(false);
  };

  // Find matching remedial courses & quizzes for modal
  const getRemedialCourses = (compName: string) => {
    return allCourses.filter(
      (c) =>
        c.primaryCompetency === compName ||
        c.competenciesCovered?.includes(compName)
    );
  };

  const getRemedialQuizzes = (compName: string) => {
    return allQuizzes.filter((q) => q.competency === compName);
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12">
      {/* ──────────────────────────────────────────────
          1. HEADER & CADRE BENCHMARK HERO CARD
         ────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-[#0B3D66] via-[#104875] to-[#1864A6] rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-white/10 relative overflow-hidden">
        {/* Subtle decorative background circles */}
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-40 -bottom-20 w-64 h-64 bg-[#FF7A00]/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-amber-400/20 text-amber-200 border border-amber-300/30 flex items-center gap-1.5">
                <span>🏛️</span> MoSPI Competency Framework 2026
              </span>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/10 text-white/90 border border-white/15">
                Cadre: {profile.cadre} ({profile.cadreGrade})
              </span>
              <span className="text-[10px] font-semibold text-emerald-300 flex items-center gap-1 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Cadre Calibration Active
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif tracking-tight text-white">
              Skill Gap & Cadre Competency Diagnosis
            </h1>

            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              Understand exactly where your current capabilities stand against official MoSPI role benchmarks. Use this transparent diagnostic to discover priority deficits and follow tailored learning pathways.
            </p>

            {/* Cadre Role Target Selector */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <span className="text-xs font-bold text-amber-200 flex items-center gap-1.5 shrink-0">
                <span>🎯</span> Benchmarking Against Role:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {DEFAULT_JOB_ROLES.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      selectedRole.id === role.id
                        ? "bg-[#FF7A00] text-white shadow-md shadow-orange-500/30 scale-102"
                        : "bg-white/10 text-white/80 hover:bg-white/20 border border-white/15"
                    }`}
                  >
                    <span>{role.title}</span>
                    <span className="text-[9px] opacity-80 font-normal">({role.cadreGrade})</span>
                    {selectedRole.id === role.id && <span>✓</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Alignment Meter & Summary Card */}
          <div className="bg-black/30 backdrop-blur-md rounded-2xl p-5 border border-white/15 flex flex-col sm:flex-row lg:flex-col items-center justify-center gap-4 shrink-0 min-w-[260px]">
            <div className="relative flex items-center justify-center">
              <svg className="w-28 h-28 transform -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r="46"
                  stroke="currentColor"
                  strokeWidth="9"
                  className="text-white/15"
                  fill="transparent"
                />
                <circle
                  cx="56"
                  cy="56"
                  r="46"
                  stroke="currentColor"
                  strokeWidth="9"
                  strokeDasharray={289}
                  strokeDashoffset={289 - (289 * alignmentPct) / 100}
                  strokeLinecap="round"
                  className="text-[#FF7A00] transition-all duration-1000 ease-out"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-bold font-serif text-white">{alignmentPct}%</span>
                <span className="text-[9px] uppercase tracking-wider text-amber-200 font-bold">
                  Cadre Match
                </span>
              </div>
            </div>

            <div className="text-center sm:text-left lg:text-center space-y-1">
              <div className="text-xs font-bold text-white">
                {alignmentPct >= 80 ? "Role Benchmark Qualified 🌟" : "Skill Bridging Required ⚠️"}
              </div>
              <div className="text-[11px] text-blue-200">
                {totalGapsCount === 0
                  ? "All 19 competencies meet or exceed role requirements."
                  : `${totalGapsCount} skill deficits identified (${criticalGapsCount} critical).`}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Diagnostic Metric Badges */}
        <div className="mt-6 pt-5 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-400/30 flex items-center justify-center text-lg font-bold">
              🚨
            </div>
            <div>
              <div className="text-lg font-bold text-white leading-tight">{criticalGapsCount}</div>
              <div className="text-[10px] text-rose-200 font-medium">Critical Deficits (≥2 Lvl)</div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center justify-center text-lg font-bold">
              ⚠️
            </div>
            <div>
              <div className="text-lg font-bold text-white leading-tight">{moderateGapsCount}</div>
              <div className="text-[10px] text-amber-200 font-medium">Moderate Gaps (1 Lvl)</div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center text-lg font-bold">
              ✅
            </div>
            <div>
              <div className="text-lg font-bold text-white leading-tight">{benchmarkMetCount}</div>
              <div className="text-[10px] text-emerald-200 font-medium">Benchmarks Fulfilled</div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center justify-center text-lg font-bold">
              📚
            </div>
            <div>
              <div className="text-lg font-bold text-white leading-tight">
                {computedCompetencies.length}
              </div>
              <div className="text-[10px] text-blue-200 font-medium">Total Assessed Skills</div>
            </div>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────
          2. EXPLANATION ACCORDION & PRIORITY FORMULA HELPER
         ────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 text-[#FF7A00] flex items-center justify-center text-xl font-bold shrink-0">
              💡
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#0B3D66]">
                How StatSkill AI Calculates Skill Gaps & Priorities
              </h2>
              <p className="text-xs text-gray-500">
                Transparent 5-factor weighted algorithm adhering to National Training Policy standards.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFormulaDetails(!showFormulaDetails)}
              className="px-3.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#0B3D66] text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
            >
              <span>{showFormulaDetails ? "Hide Calculation Details ▲" : "Explain The Math ▼"}</span>
            </button>
            <button
              onClick={() => {
                if (isSimulating) {
                  handleResetSimulation();
                } else {
                  setIsSimulating(true);
                }
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                isSimulating
                  ? "bg-purple-600 text-white shadow-md"
                  : "bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200"
              }`}
            >
              <span>🧪</span>
              <span>{isSimulating ? "Exit Simulation" : "Try 'What-If' Simulator"}</span>
            </button>
          </div>
        </div>

        {/* Expandable Explanation Area */}
        {showFormulaDetails && (
          <div className="mt-5 pt-4 border-t border-gray-100 space-y-4 animate-in fade-in duration-200">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70">
              <div className="text-xs font-bold text-gray-800 uppercase tracking-wide mb-2 flex items-center gap-2">
                <span>📐 Official Priority Formula:</span>
                <code className="bg-white px-2 py-0.5 rounded border border-gray-200 text-[#0B3D66] font-mono text-[11px]">
                  Priority Score = 0.35 × Gap + 0.25 × RoleReq + 0.20 × DeptPriority + 0.10 × FutureDemand + 0.10 × Career
                </code>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Rather than treating all missing skills equally, the AI prioritizes training modules based on government operational urgency, departmental milestones (e.g. National Accounts rebasing, PLFS release), and career elevation requirements.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                <div className="flex items-center justify-between font-bold text-rose-900">
                  <span>🎯 Gap Depth</span>
                  <span className="text-[10px] bg-rose-200 px-1.5 py-0.5 rounded">35% Weight</span>
                </div>
                <p className="text-[11px] text-rose-800">
                  Raw deficit between current evaluated level and cadre requirement.
                </p>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
                <div className="flex items-center justify-between font-bold text-blue-900">
                  <span>💼 Cadre Mandate</span>
                  <span className="text-[10px] bg-blue-200 px-1.5 py-0.5 rounded">25% Weight</span>
                </div>
                <p className="text-[11px] text-blue-800">
                  Core competencies required for daily official cadre duties and postings.
                </p>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                <div className="flex items-center justify-between font-bold text-amber-900">
                  <span>🏛️ Dept Priority</span>
                  <span className="text-[10px] bg-amber-200 px-1.5 py-0.5 rounded">20% Weight</span>
                </div>
                <p className="text-[11px] text-amber-800">
                  High-priority national initiatives (e.g. Digital Data Collection, DPDP compliance).
                </p>
              </div>

              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl space-y-1">
                <div className="flex items-center justify-between font-bold text-purple-900">
                  <span>🚀 Future Demand</span>
                  <span className="text-[10px] bg-purple-200 px-1.5 py-0.5 rounded">10% Weight</span>
                </div>
                <p className="text-[11px] text-purple-800">
                  Emerging skills like AI/ML anomaly detection and Cloud GIS analytics.
                </p>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                <div className="flex items-center justify-between font-bold text-emerald-900">
                  <span>📈 Career Growth</span>
                  <span className="text-[10px] bg-emerald-200 px-1.5 py-0.5 rounded">10% Weight</span>
                </div>
                <p className="text-[11px] text-emerald-800">
                  Skills that unlock promotion to Senior Statistical Officer (JAG/SAG).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Simulation Banner if active */}
        {isSimulating && (
          <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🧪</span>
              <div>
                <div className="text-xs font-bold text-purple-900">
                  Simulation Mode Active ("What-If" Planning)
                </div>
                <div className="text-[11px] text-purple-700">
                  Adjust skill levels below to preview how completing training elevates your Cadre Match Score.
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleResetSimulation}
                className="px-3 py-1.5 bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 text-xs font-bold rounded-xl cursor-pointer"
              >
                Reset
              </button>
              <button
                onClick={handleSaveSimulation}
                className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                Save as Assessed Level
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ──────────────────────────────────────────────
          3. VIEW CONTROLS & FILTER BAR
         ────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs font-bold overflow-x-auto shrink-0">
          <button
            onClick={() => setViewMode("matrix")}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === "matrix"
                ? "bg-[#0B3D66] text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <span>🗂️</span>
            <span>Matrix Cards</span>
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === "table"
                ? "bg-[#0B3D66] text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <span>📋</span>
            <span>Comparison Table</span>
          </button>
          <button
            onClick={() => setViewMode("analytics")}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === "analytics"
                ? "bg-[#0B3D66] text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <span>🕸️</span>
            <span>Radar & Analytics</span>
          </button>
          <button
            onClick={() => setViewMode("rubric")}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === "rubric"
                ? "bg-[#0B3D66] text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <span>📖</span>
            <span>Level Rubric Guide</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Search competency or domain..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-[#0B3D66] focus:outline-hidden transition-all"
            />
            <span className="absolute left-2.5 top-2 text-gray-400 text-xs">🔍</span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1.5 text-gray-400 hover:text-gray-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Gap Status Filter */}
          <select
            value={gapFilter}
            onChange={(e) => setGapFilter(e.target.value as any)}
            className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 cursor-pointer focus:outline-hidden"
          >
            <option value="ALL">All Gaps ({computedCompetencies.length})</option>
            <option value="GAPS_ONLY">Active Deficits ({totalGapsCount})</option>
            <option value="HIGH_PRIORITY">High Priority ({criticalGapsCount})</option>
            <option value="MET">Benchmark Met ({benchmarkMetCount})</option>
          </select>

          {/* Domain Filter */}
          <select
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
            className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 cursor-pointer focus:outline-hidden"
          >
            <option value="ALL">All 4 Domains</option>
            {domains.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ──────────────────────────────────────────────
          4. MAIN VIEW RENDERER
         ────────────────────────────────────────────── */}

      {/* ─── VIEW 1: MATRIX CARDS VIEW ─── */}
      {viewMode === "matrix" && (
        <div className="space-y-6">
          {domains
            .filter((d) => domainFilter === "ALL" || domainFilter === d)
            .map((domainName) => {
              const domainComps = processedCompetencies.filter((c) => c.domain === domainName);
              if (domainComps.length === 0) return null;

              const meta = DOMAIN_METADATA[domainName];

              return (
                <div key={domainName} className="space-y-3">
                  {/* Domain Subheader */}
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{meta.icon}</span>
                      <h3 className="text-base font-bold text-[#0B3D66] font-serif">
                        {domainName} Competencies
                      </h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.bg} ${meta.text} border ${meta.border}`}>
                        {domainComps.length} Skills
                      </span>
                    </div>

                    <span className="text-xs text-gray-400">
                      Target Role: <strong>{selectedRole.title}</strong>
                    </span>
                  </div>

                  {/* Competency Card Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {domainComps.map((comp) => {
                      const def = DEFAULT_COMPETENCIES_CATALOGUE.find(
                        (d) => d.name === comp.competencyName
                      );
                      const hasGap = comp.gap > 0;
                      const isCritical = comp.gap >= 2;

                      return (
                        <div
                          key={comp.competencyId}
                          className={`bg-white rounded-3xl p-5 border transition-all hover:shadow-md flex flex-col justify-between space-y-4 relative ${
                            hasGap
                              ? isCritical
                                ? "border-rose-200 hover:border-rose-300 shadow-2xs"
                                : "border-amber-200 hover:border-amber-300 shadow-2xs"
                              : "border-gray-100 hover:border-emerald-200 shadow-2xs"
                          }`}
                        >
                          {/* Top Card Info */}
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <span
                                className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                                  comp.priorityLevel === "High"
                                    ? "bg-rose-100 text-rose-800 border border-rose-200"
                                    : comp.priorityLevel === "Medium"
                                    ? "bg-amber-100 text-amber-900 border border-amber-200"
                                    : "bg-slate-100 text-slate-700 border border-slate-200"
                                }`}
                              >
                                {comp.priorityLevel} Priority ({comp.priorityScore} pts)
                              </span>

                              <span
                                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                                  hasGap
                                    ? isCritical
                                      ? "bg-rose-50 text-rose-700 border border-rose-200 font-extrabold"
                                      : "bg-amber-50 text-amber-800 border border-amber-200 font-bold"
                                    : "bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold"
                                }`}
                              >
                                {hasGap ? (
                                  <>
                                    <span>−{comp.gap}</span>
                                    <span>Level Gap</span>
                                  </>
                                ) : (
                                  <>
                                    <span>✓</span>
                                    <span>Met</span>
                                  </>
                                )}
                              </span>
                            </div>

                            <h4 className="text-sm font-bold text-[#0B3D66] line-clamp-1">
                              {comp.competencyName}
                            </h4>
                            <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 min-h-[32px]">
                              {def?.description || "MoSPI official competency definition."}
                            </p>
                          </div>

                          {/* 5-Step Visual Level Tracker */}
                          <div className="space-y-1.5 bg-gray-50/80 p-3 rounded-2xl border border-gray-100">
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="font-bold text-gray-700 flex items-center gap-1">
                                <span className="text-gray-400">Current:</span> Level {comp.currentLevel}/5
                              </span>
                              <span className="font-bold text-gray-500 flex items-center gap-1">
                                <span className="text-gray-400">Required:</span> Level {comp.requiredLevel}/5
                              </span>
                            </div>

                            {/* 5 Segmented Step Bars */}
                            <div className="grid grid-cols-5 gap-1.5 py-0.5">
                              {[1, 2, 3, 4, 5].map((lvl) => {
                                const isCurrentAchieved = lvl <= comp.currentLevel;
                                const isRequiredGap = lvl > comp.currentLevel && lvl <= comp.requiredLevel;

                                return (
                                  <div
                                    key={lvl}
                                    className={`h-2 rounded-full transition-all ${
                                      isCurrentAchieved
                                        ? "bg-emerald-500 shadow-2xs"
                                        : isRequiredGap
                                        ? "bg-rose-400 animate-pulse"
                                        : "bg-gray-200"
                                    }`}
                                    title={`Level ${lvl}: ${
                                      isCurrentAchieved
                                        ? "Acquired"
                                        : isRequiredGap
                                        ? "Gap Needed"
                                        : "Above Benchmark"
                                    }`}
                                  />
                                );
                              })}
                            </div>

                            {/* Simulation Stepper Controls if in Simulation Mode */}
                            {isSimulating && (
                              <div className="pt-2 flex items-center justify-between border-t border-gray-200/60 mt-1">
                                <span className="text-[10px] font-bold text-purple-700">Simulate:</span>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => handleSimulateChange(comp.competencyName, -1)}
                                    disabled={comp.currentLevel <= 1}
                                    className="w-6 h-6 rounded-md bg-purple-100 text-purple-800 font-bold hover:bg-purple-200 disabled:opacity-30 text-xs flex items-center justify-center cursor-pointer"
                                  >
                                    −
                                  </button>
                                  <span className="text-xs font-bold text-purple-900 px-1">
                                    L{comp.currentLevel}
                                  </span>
                                  <button
                                    onClick={() => handleSimulateChange(comp.competencyName, 1)}
                                    disabled={comp.currentLevel >= 5}
                                    className="w-6 h-6 rounded-md bg-purple-100 text-purple-800 font-bold hover:bg-purple-200 disabled:opacity-30 text-xs flex items-center justify-center cursor-pointer"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 pt-1 border-t border-gray-50">
                            <button
                              onClick={() => setActiveSkillModal(comp)}
                              className="flex-1 py-2 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#0B3D66] text-xs font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1"
                            >
                              <span>ℹ️ Why Gap?</span>
                            </button>

                            {hasGap ? (
                              <button
                                onClick={() => {
                                  const matching = getRemedialCourses(comp.competencyName);
                                  if (matching.length > 0 && onOpenCourse) {
                                    onOpenCourse(matching[0]);
                                    onNav("course_detail");
                                  } else {
                                    onNav("courses");
                                  }
                                }}
                                className="flex-1 py-2 px-3 rounded-xl bg-[#0B3D66] hover:bg-[#082e4f] text-white text-xs font-bold transition-all text-center shadow-2xs cursor-pointer flex items-center justify-center gap-1"
                              >
                                <span>Bridge Gap →</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => setActiveSkillModal(comp)}
                                className="flex-1 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-all text-center border border-emerald-200 cursor-pointer flex items-center justify-center gap-1"
                              >
                                <span>Proficient ✓</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* ─── VIEW 2: COMPARISON TABLE VIEW ─── */}
      {viewMode === "table" && (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-2xs space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-base font-bold text-[#0B3D66] font-serif">
                Cadre Competency Matrix Table
              </h3>
              <p className="text-xs text-gray-400">
                Click column headers to sort by Priority Score, Gap Depth, or Level.
              </p>
            </div>
            <span className="text-xs text-gray-500 font-semibold">
              Showing {processedCompetencies.length} of {computedCompetencies.length} Competencies
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                  <th
                    onClick={() => {
                      if (sortBy === "name") setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                      else {
                        setSortBy("name");
                        setSortDirection("asc");
                      }
                    }}
                    className="pb-3 cursor-pointer hover:text-gray-700"
                  >
                    Competency & Domain {sortBy === "name" ? (sortDirection === "asc" ? "↑" : "↓") : ""}
                  </th>
                  <th
                    onClick={() => {
                      if (sortBy === "current") setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                      else {
                        setSortBy("current");
                        setSortDirection("desc");
                      }
                    }}
                    className="pb-3 text-center cursor-pointer hover:text-gray-700"
                  >
                    Current Level {sortBy === "current" ? (sortDirection === "asc" ? "↑" : "↓") : ""}
                  </th>
                  <th className="pb-3 text-center">Required Target</th>
                  <th
                    onClick={() => {
                      if (sortBy === "gap") setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                      else {
                        setSortBy("gap");
                        setSortDirection("desc");
                      }
                    }}
                    className="pb-3 text-center cursor-pointer hover:text-gray-700"
                  >
                    Skill Gap {sortBy === "gap" ? (sortDirection === "asc" ? "↑" : "↓") : ""}
                  </th>
                  <th
                    onClick={() => {
                      if (sortBy === "priority") setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                      else {
                        setSortBy("priority");
                        setSortDirection("desc");
                      }
                    }}
                    className="pb-3 text-center cursor-pointer hover:text-gray-700"
                  >
                    Priority Score {sortBy === "priority" ? (sortDirection === "asc" ? "↑" : "↓") : ""}
                  </th>
                  <th className="pb-3 text-center">Visual Progress</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-700">
                {processedCompetencies.map((comp) => {
                  const hasGap = comp.gap > 0;
                  const isCritical = comp.gap >= 2;

                  return (
                    <tr
                      key={comp.competencyId}
                      className="hover:bg-blue-50/30 transition-colors group"
                    >
                      {/* Competency & Domain */}
                      <td className="py-3.5 pr-3">
                        <div className="font-bold text-[#0B3D66] text-xs">
                          {comp.competencyName}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                              DOMAIN_METADATA[comp.domain].bg
                            } ${DOMAIN_METADATA[comp.domain].text}`}
                          >
                            {comp.domain}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            Evidence: {comp.evidenceSource.slice(0, 24)}...
                          </span>
                        </div>
                      </td>

                      {/* Current Level */}
                      <td className="py-3.5 text-center">
                        <span className="font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md">
                          L{comp.currentLevel} / 5
                        </span>
                      </td>

                      {/* Required Level */}
                      <td className="py-3.5 text-center">
                        <span className="font-semibold text-gray-600 bg-blue-50 text-blue-900 px-2 py-0.5 rounded-md">
                          L{comp.requiredLevel} / 5
                        </span>
                      </td>

                      {/* Skill Gap */}
                      <td className="py-3.5 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full font-bold text-[10px] inline-flex items-center gap-1 ${
                            hasGap
                              ? isCritical
                                ? "bg-rose-100 text-rose-800 border border-rose-200"
                                : "bg-amber-100 text-amber-800 border border-amber-200"
                              : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          }`}
                        >
                          {hasGap ? `−${comp.gap} Deficit` : "0 (Fulfilled)"}
                        </span>
                      </td>

                      {/* Priority Score */}
                      <td className="py-3.5 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              comp.priorityLevel === "High"
                                ? "bg-rose-500"
                                : comp.priorityLevel === "Medium"
                                ? "bg-amber-500"
                                : "bg-slate-400"
                            }`}
                          />
                          <span className="font-bold text-gray-800">{comp.priorityScore}</span>
                          <span className="text-[10px] text-gray-400">({comp.priorityLevel})</span>
                        </div>
                      </td>

                      {/* Visual Progress Bar */}
                      <td className="py-3.5 px-3 min-w-[140px]">
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden flex">
                          <div
                            className="bg-emerald-500 h-full transition-all"
                            style={{ width: `${(comp.currentLevel / 5) * 100}%` }}
                          />
                          {hasGap && (
                            <div
                              className="bg-rose-400 h-full transition-all opacity-80"
                              style={{ width: `${(comp.gap / 5) * 100}%` }}
                            />
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => setActiveSkillModal(comp)}
                          className="text-xs text-[#0B3D66] font-bold hover:underline cursor-pointer"
                        >
                          Why Gap?
                        </button>
                        {hasGap && (
                          <button
                            onClick={() => {
                              const matching = getRemedialCourses(comp.competencyName);
                              if (matching.length > 0 && onOpenCourse) {
                                onOpenCourse(matching[0]);
                                onNav("course_detail");
                              } else {
                                onNav("courses");
                              }
                            }}
                            className="px-2.5 py-1 bg-[#0B3D66] hover:bg-[#082e4f] text-white font-bold rounded-lg text-[11px] transition-all cursor-pointer inline-flex items-center gap-1"
                          >
                            <span>Remediate →</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── VIEW 3: RADAR & CADRE GAP ANALYTICS VIEW ─── */}
      {viewMode === "analytics" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Domain Radar Comparison */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[#0B3D66] font-serif">
                    Cadre Domain Competency Radar
                  </h3>
                  <span className="text-[10px] bg-blue-50 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                    Target: {selectedRole.title}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Compares average evaluated officer score (orange) against MoSPI cadre benchmark (blue).
                </p>

                <div className="h-72 w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis
                        dataKey="domain"
                        tick={{ fontSize: 11, fill: "#0B3D66", fontWeight: "bold" }}
                      />
                      <Radar
                        name="Cadre Benchmark"
                        dataKey="Required"
                        stroke="#0B3D66"
                        fill="#0B3D66"
                        fillOpacity={0.2}
                      />
                      <Radar
                        name="Officer Current"
                        dataKey="Current"
                        stroke="#FF7A00"
                        fill="#FF7A00"
                        fillOpacity={0.4}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
                      />
                      <Tooltip
                        formatter={(val: any) => [`Level ${val} / 5`, ""]}
                        contentStyle={{
                          borderRadius: "12px",
                          border: "1px solid #e2e8f0",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                          fontSize: "12px",
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                {radarData.map((r) => (
                  <div key={r.domain} className="p-2 rounded-xl bg-gray-50">
                    <div className="text-[10px] font-bold text-gray-500 truncate">{r.domain}</div>
                    <div className="font-bold text-[#0B3D66] mt-0.5">
                      L{r.Current} <span className="text-gray-400 font-normal">/ L{r.Required}</span>
                    </div>
                    <div
                      className={`text-[9px] font-bold mt-0.5 ${
                        r.gap > 0 ? "text-rose-600" : "text-emerald-600"
                      }`}
                    >
                      {r.gap > 0 ? `−${r.gap} Deficit` : "Fulfilled ✓"}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gap Distribution by Domain Bar Chart */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[#0B3D66] font-serif">
                    Domain Skill Gaps Breakdown
                  </h3>
                  <span className="text-[10px] bg-rose-50 text-rose-800 font-bold px-2 py-0.5 rounded-full">
                    {totalGapsCount} Active Deficits
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Identifies which specific competency pillars require immediate training intervention.
                </p>

                <div className="h-72 w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={domainSummaries}
                      margin={{ top: 20, right: 20, left: -20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis
                        dataKey="domain"
                        tick={{ fontSize: 10, fill: "#64748b" }}
                        interval={0}
                      />
                      <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "12px",
                          border: "1px solid #e2e8f0",
                          fontSize: "12px",
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: "11px" }} />
                      <Bar dataKey="totalGaps" name="Total Skill Gaps" fill="#FF7A00" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="highGaps" name="High Priority (≥2 Lvl)" fill="#E11D48" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span>Domain with highest urgency: <strong>Technical (Python, AI/ML, GIS)</strong></span>
                <button
                  onClick={() => {
                    setDomainFilter("Technical");
                    setViewMode("matrix");
                  }}
                  className="text-xs text-[#FF7A00] font-bold hover:underline cursor-pointer"
                >
                  View Technical Deficits →
                </button>
              </div>
            </div>
          </div>

          {/* Domain Health Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {domainSummaries.map((ds) => (
              <div
                key={ds.domain}
                className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{ds.meta.icon}</span>
                    <span className="font-bold text-xs text-[#0B3D66]">{ds.domain}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ds.meta.bg} ${ds.meta.text}`}>
                    {ds.itemsCount} Skills
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-gray-500">Proficiency Index</span>
                    <span className="text-gray-900">{ds.avgScore}%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all"
                      style={{ width: `${ds.avgScore}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                  <span className="text-gray-500">
                    Deficits: <strong className="text-rose-600">{ds.totalGaps}</strong>
                  </span>
                  <button
                    onClick={() => {
                      setDomainFilter(ds.domain);
                      setViewMode("matrix");
                    }}
                    className="text-[#0B3D66] font-bold hover:underline cursor-pointer"
                  >
                    Filter Domain →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── VIEW 4: LEVEL RUBRIC GUIDE ─── */}
      {viewMode === "rubric" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-2xs space-y-6">
          <div>
            <h3 className="text-xl font-bold text-[#0B3D66] font-serif">
              National Training Framework: 5-Level Competency Rubric
            </h3>
            <p className="text-xs text-gray-500 mt-1 max-w-3xl leading-relaxed">
              Every statistical officer in the Indian Statistical Service (ISS) and Subordinate Statistical Service (SSS) is benchmarked against this 5-stage competency hierarchy.
            </p>
          </div>

          <div className="space-y-4">
            {[5, 4, 3, 2, 1].map((lvl) => {
              const rubric = PROFICIENCY_LEVEL_RUBRICS[lvl];
              const skillsAtThisLevel = computedCompetencies.filter((c) => c.currentLevel === lvl);

              return (
                <div
                  key={lvl}
                  className={`p-5 rounded-2xl border transition-all ${rubric.color} flex flex-col md:flex-row md:items-start justify-between gap-4`}
                >
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-white/90 font-extrabold text-sm flex items-center justify-center shadow-2xs">
                        L{lvl}
                      </span>
                      <h4 className="text-sm font-bold tracking-tight">{rubric.name}</h4>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white/80 border border-current/20">
                        {rubric.tag}
                      </span>
                    </div>
                    <p className="text-xs opacity-90 leading-relaxed">{rubric.desc}</p>
                  </div>

                  <div className="shrink-0 bg-white/80 p-3 rounded-xl border border-current/15 min-w-[200px]">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                      Your Current Skills ({skillsAtThisLevel.length})
                    </div>
                    <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                      {skillsAtThisLevel.length > 0 ? (
                        skillsAtThisLevel.map((s) => (
                          <span
                            key={s.competencyId}
                            className="text-[10px] font-semibold bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-800 truncate max-w-[180px]"
                            title={s.competencyName}
                          >
                            {s.competencyName}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-gray-400 italic">None at this level</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────
          5. WHY IS THIS A GAP? INTERACTIVE MODAL & REMEDIATION PLAN
         ────────────────────────────────────────────── */}
      {activeSkillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl border border-gray-100">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-gray-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      DOMAIN_METADATA[activeSkillModal.domain].bg
                    } ${DOMAIN_METADATA[activeSkillModal.domain].text}`}
                  >
                    {activeSkillModal.domain} Domain
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      activeSkillModal.gap > 0
                        ? "bg-rose-100 text-rose-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {activeSkillModal.gap > 0
                      ? `−${activeSkillModal.gap} Level Deficit`
                      : "Benchmark Met ✓"}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#0B3D66] font-serif mt-1">
                  {activeSkillModal.competencyName}
                </h3>
              </div>

              <button
                onClick={() => setActiveSkillModal(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 font-bold flex items-center justify-center transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Visual Level Ladder Comparison */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="text-xs font-bold text-[#0B3D66] uppercase tracking-wider">
                Competency Level Comparison
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white rounded-xl border border-gray-200 space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">
                    Your Evaluated Level
                  </span>
                  <div className="text-base font-bold text-gray-900">
                    Level {activeSkillModal.currentLevel} / 5
                  </div>
                  <div className="text-[11px] text-gray-600 font-medium">
                    {PROFICIENCY_LEVEL_RUBRICS[activeSkillModal.currentLevel]?.name}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1">
                    Evidence: <em>{activeSkillModal.evidenceSource}</em>
                  </div>
                </div>

                <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 space-y-1">
                  <span className="text-[10px] font-bold text-blue-700 uppercase">
                    Target Role Benchmark ({selectedRole.title})
                  </span>
                  <div className="text-base font-bold text-[#0B3D66]">
                    Level {activeSkillModal.requiredLevel} / 5
                  </div>
                  <div className="text-[11px] text-blue-800 font-medium">
                    {PROFICIENCY_LEVEL_RUBRICS[activeSkillModal.requiredLevel]?.name}
                  </div>
                  <div className="text-[10px] text-blue-600 mt-1">
                    Mandated for Cadre Grade {selectedRole.cadreGrade}
                  </div>
                </div>
              </div>
            </div>

            {/* Explainable 5-Factor Priority Math Breakdown */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-[#0B3D66]">Priority Score Breakdown</span>
                <span className="text-[#FF7A00] font-extrabold">
                  {activeSkillModal.priorityScore} / 100 ({activeSkillModal.priorityLevel} Priority)
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-gray-600 bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                <div className="flex justify-between items-center">
                  <span>• Skill Gap Depth (35% weight):</span>
                  <span className="font-bold text-gray-900">
                    {Math.round((activeSkillModal.gap / 5) * 35)} pts
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>• Role Requirement Criticality (25% weight):</span>
                  <span className="font-bold text-gray-900">
                    {Math.round((activeSkillModal.requiredLevel / 5) * 25)} pts
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>• MoSPI Department Strategic Priority (20% weight):</span>
                  <span className="font-bold text-gray-900">
                    {Math.round(
                      ((DEFAULT_COMPETENCIES_CATALOGUE.find(
                        (d) => d.name === activeSkillModal.competencyName
                      )?.departmentPriority ?? 4) /
                        5) *
                        20
                    )}{" "}
                    pts
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>• Future Demand & Statistical Roadmap (10% weight):</span>
                  <span className="font-bold text-gray-900">
                    {Math.round(
                      ((DEFAULT_COMPETENCIES_CATALOGUE.find(
                        (d) => d.name === activeSkillModal.competencyName
                      )?.futureDemandScore ?? 4) /
                        5) *
                        10
                    )}{" "}
                    pts
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>• Career Elevation Factor (10% weight):</span>
                  <span className="font-bold text-gray-900">
                    {activeSkillModal.gap > 0 ? 9 : 4} pts
                  </span>
                </div>
              </div>
            </div>

            {/* Remedial Courses & Quizzes to Bridge the Gap */}
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <div className="text-xs font-bold text-[#0B3D66] uppercase tracking-wider flex items-center justify-between">
                <span>🎓 Recommended Remediation Pathways</span>
                <span className="text-[10px] text-gray-400 font-normal">
                  Accredited iGOT & NSSTA Modules
                </span>
              </div>

              {/* Matched Courses */}
              <div className="space-y-2">
                {getRemedialCourses(activeSkillModal.competencyName).map((course) => (
                  <div
                    key={course.id}
                    className="p-3.5 bg-blue-50/50 hover:bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-between gap-3 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-extrabold px-2 py-0.2 rounded bg-[#0B3D66] text-white">
                          {course.provider}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700">
                          {course.duration}
                        </span>
                      </div>
                      <h5 className="text-xs font-bold text-gray-900">{course.title}</h5>
                    </div>

                    <button
                      onClick={() => {
                        setActiveSkillModal(null);
                        if (onOpenCourse) onOpenCourse(course);
                        onNav("course_detail");
                      }}
                      className="px-3 py-1.5 bg-[#FF7A00] hover:bg-[#e06a00] text-white text-xs font-bold rounded-xl shadow-xs shrink-0 cursor-pointer"
                    >
                      Start Course →
                    </button>
                  </div>
                ))}

                {getRemedialCourses(activeSkillModal.competencyName).length === 0 && (
                  <div className="p-3 bg-gray-50 text-gray-500 rounded-xl text-xs italic text-center">
                    Universal MoSPI Foundation course available in Courses Catalogue.
                  </div>
                )}
              </div>

              {/* Diagnostic Quiz Shortcut */}
              <div className="p-3.5 bg-purple-50/60 border border-purple-100 rounded-2xl flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] font-bold text-purple-700 uppercase">
                    Diagnostic Testing
                  </div>
                  <div className="text-xs font-bold text-purple-950">
                    Take {activeSkillModal.competencyName} Assessment Quiz
                  </div>
                </div>
                <button
                  onClick={() => {
                    setActiveSkillModal(null);
                    onNav("quizzes");
                  }}
                  className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl cursor-pointer text-xs font-bold"
                >
                  Take Quiz ✍️
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <button
                onClick={() => {
                  setActiveSkillModal(null);
                  onNav("assistant");
                }}
                className="text-xs text-[#0B3D66] font-bold hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>🤖 Ask AI Copilot to Explain this Topic</span>
              </button>

              <button
                onClick={() => setActiveSkillModal(null)}
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default SkillGapAnalysis;

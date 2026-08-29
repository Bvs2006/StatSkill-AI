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
  CourseItem,
  QuizItem,
  CompetencyUpdateLog,
  OfficerProfile,
  getUserCompetencies,
  saveUserCompetencies,
  getProfile,
  getCourses,
  getQuizzes,
  getCompetencyAuditLogs,
  logCompetencyUpdate,
  DEFAULT_COMPETENCIES_CATALOGUE,
} from "../services/storageService";
import { PROFICIENCY_LEVEL_RUBRICS, DOMAIN_METADATA } from "./SkillGapAnalysis";
import type { Screen } from "../App";

interface MySkillsPortfolioProps {
  onNav: (s: Screen) => void;
  onOpenCourse?: (c: CourseItem) => void;
}

export function MySkillsPortfolio({ onNav, onOpenCourse }: MySkillsPortfolioProps) {
  const profile: OfficerProfile = getProfile();
  const allCourses: CourseItem[] = getCourses();
  const allQuizzes: QuizItem[] = getQuizzes();

  // State
  const [competencies, setCompetencies] = useState<UserCompetencyScore[]>(() =>
    getUserCompetencies()
  );
  const [auditLogs, setAuditLogs] = useState<CompetencyUpdateLog[]>(() =>
    getCompetencyAuditLogs()
  );
  const [domainFilter, setDomainFilter] = useState<string>("ALL");
  const [levelFilter, setLevelFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "ladder" | "radar" | "audit">("cards");
  const [selectedSkill, setSelectedSkill] = useState<UserCompetencyScore | null>(null);

  // Self-appraisal / quick calibrate state inside modal
  const [calibratingLevel, setCalibratingLevel] = useState<number | null>(null);
  const [calibrationReason, setCalibrationReason] = useState("");
  const [calibrationSuccess, setCalibrationSuccess] = useState(false);

  // Aggregate statistics
  const totalCompetencies = competencies.length;
  const avgLevel =
    totalCompetencies > 0
      ? (competencies.reduce((acc, c) => acc + c.currentLevel, 0) / totalCompetencies).toFixed(1)
      : "0.0";
  const overallPct =
    totalCompetencies > 0
      ? Math.round(
          (competencies.reduce((acc, c) => acc + c.currentLevel, 0) / (totalCompetencies * 5)) * 100
        )
      : 0;

  // Level counts
  const levelCounts: Record<number, number> = {
    5: competencies.filter((c) => c.currentLevel === 5).length,
    4: competencies.filter((c) => c.currentLevel === 4).length,
    3: competencies.filter((c) => c.currentLevel === 3).length,
    2: competencies.filter((c) => c.currentLevel === 2).length,
    1: competencies.filter((c) => c.currentLevel === 1).length,
  };

  const domains: CompetencyDomain[] = [
    "Statistical",
    "Technical",
    "Digital Governance",
    "Behavioural",
  ];

  // Domain Breakdown Stats
  const domainStats = useMemo(() => {
    return domains.map((d) => {
      const items = competencies.filter((c) => c.domain === d);
      const avg =
        items.length > 0
          ? items.reduce((acc, c) => acc + c.currentLevel, 0) / items.length
          : 0;
      const pct = items.length > 0 ? Math.round((avg / 5) * 100) : 0;
      const mastered = items.filter((c) => c.currentLevel >= 4).length;
      return {
        domain: d,
        count: items.length,
        avg: Number(avg.toFixed(1)),
        pct,
        mastered,
        meta: DOMAIN_METADATA[d],
      };
    });
  }, [competencies]);

  // Filtered competencies
  const filteredCompetencies = useMemo(() => {
    let list = [...competencies];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.competencyName.toLowerCase().includes(q) ||
          c.domain.toLowerCase().includes(q) ||
          c.evidenceSource.toLowerCase().includes(q) ||
          (DEFAULT_COMPETENCIES_CATALOGUE.find((d) => d.name === c.competencyName)?.description || "")
            .toLowerCase()
            .includes(q)
      );
    }

    if (domainFilter !== "ALL") {
      list = list.filter((c) => c.domain === domainFilter);
    }

    if (levelFilter !== "ALL") {
      const lvl = parseInt(levelFilter, 10);
      list = list.filter((c) => c.currentLevel === lvl);
    }

    return list;
  }, [competencies, searchQuery, domainFilter, levelFilter]);

  // Radar Data
  const radarData = domainStats.map((ds) => {
    const items = competencies.filter((c) => c.domain === ds.domain);
    const avgReq =
      items.length > 0
        ? items.reduce((acc, c) => acc + c.requiredLevel, 0) / items.length
        : 0;
    return {
      domain: ds.domain,
      Current: ds.avg,
      Required: Number(avgReq.toFixed(1)),
    };
  });

  // Handle self calibration save
  const handleSaveCalibration = () => {
    if (!selectedSkill || calibratingLevel === null) return;
    const oldLevel = selectedSkill.currentLevel;
    const newLevel = calibratingLevel;

    const updated = competencies.map((c) => {
      if (c.competencyId === selectedSkill.competencyId) {
        return {
          ...c,
          currentLevel: newLevel,
          gap: Math.max(0, c.requiredLevel - newLevel),
          lastAssessedDate: new Date().toISOString().slice(0, 10),
          evidenceSource: calibrationReason
            ? `Self-Appraisal: ${calibrationReason}`
            : "Officer Self-Assessment Update",
        };
      }
      return c;
    });

    saveUserCompetencies(updated);
    setCompetencies(updated);

    // Add audit log
    const log: CompetencyUpdateLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      competencyName: selectedSkill.competencyName,
      oldLevel,
      newLevel,
      evidence: calibrationReason
        ? `Self-Appraisal: ${calibrationReason}`
        : "Officer Competency Calibration",
      sourceType: "Direct Assessment",
    };
    logCompetencyUpdate(log);
    setAuditLogs(getCompetencyAuditLogs());

    setCalibrationSuccess(true);
    setTimeout(() => {
      setCalibrationSuccess(false);
      setSelectedSkill(null);
      setCalibratingLevel(null);
      setCalibrationReason("");
    }, 1200);
  };

  const getRemedialCourses = (compName: string) => {
    return allCourses.filter(
      (c) =>
        c.primaryCompetency === compName ||
        c.competenciesCovered?.includes(compName)
    );
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12">
      {/* ──────────────────────────────────────────────
          1. EXECUTIVE MASTER COMPETENCY PORTFOLIO HERO
         ────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-[#0B3D66] via-[#104875] to-[#1864A6] rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-white/10 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-60 -bottom-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-300/30 flex items-center gap-1.5">
                <span>🎖️</span> Official MoSPI Competency Passport
              </span>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/10 text-white/90 border border-white/15">
                Cadre: {profile.cadre} ({profile.cadreGrade})
              </span>
              <span className="text-[10px] font-medium text-amber-200 bg-amber-950/40 border border-amber-500/30 px-2.5 py-1 rounded-full">
                ID: {profile.employeeId}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif tracking-tight text-white">
              My Competency & Skills Portfolio
            </h1>

            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              Your comprehensive repository of verified official capabilities across Statistical, Technical, Digital Governance, and Behavioural domains. Track your professional evolution and elevate competencies.
            </p>

            {/* Quick Action Navigation Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => onNav("assessment")}
                className="px-4 py-2 bg-[#FF7A00] hover:bg-[#e06a00] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>✍️ Take Diagnostic Test</span>
              </button>
              <button
                onClick={() => onNav("skill_gaps")}
                className="px-4 py-2 bg-white/15 hover:bg-white/25 text-white border border-white/20 text-xs font-bold rounded-xl backdrop-blur-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>⚖️ Cadre Gap Diagnosis</span>
              </button>
              <button
                onClick={() => onNav("certificates")}
                className="px-4 py-2 bg-white text-[#0B3D66] hover:bg-gray-100 text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>📜 Verifiable Certificates</span>
              </button>
            </div>
          </div>

          {/* Aggregate Maturity Index Card */}
          <div className="bg-black/30 backdrop-blur-md rounded-2xl p-5 border border-white/15 flex flex-col items-center justify-center gap-3 shrink-0 min-w-[240px] text-center">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold font-serif text-white">{avgLevel}</span>
              <span className="text-sm font-semibold text-blue-200">/ 5.0</span>
            </div>
            <div className="space-y-1">
              <div className="text-xs font-bold text-amber-200 uppercase tracking-wider">
                Competency Maturity Index
              </div>
              <div className="text-[11px] text-blue-100">
                {overallPct}% Aggregate Mastery across {totalCompetencies} Pillars
              </div>
            </div>
            {/* Mini Visual Level Distribution Bar */}
            <div className="w-full pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-white/80">
              <span>L5 Expert: <strong>{levelCounts[5]}</strong></span>
              <span>•</span>
              <span>L4 Adv: <strong>{levelCounts[4]}</strong></span>
              <span>•</span>
              <span>L3 Prac: <strong>{levelCounts[3]}</strong></span>
            </div>
          </div>
        </div>

        {/* 4 Domain Pillar Overview Cards */}
        <div className="mt-6 pt-5 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {domainStats.map((ds) => (
            <div
              key={ds.domain}
              className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10 flex flex-col justify-between space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-lg">{ds.meta.icon}</span>
                <span className="text-[10px] font-bold text-white/90 bg-white/15 px-2 py-0.5 rounded">
                  {ds.pct}% Index
                </span>
              </div>
              <div>
                <div className="text-xs font-bold text-white truncate">{ds.domain}</div>
                <div className="text-[10px] text-blue-200 mt-0.5">
                  Avg Level <strong>L{ds.avg}</strong> · {ds.mastered} Mastered
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ──────────────────────────────────────────────
          2. VIEW CONTROLS & FILTER BAR
         ────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
        {/* Mode Switcher */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs font-bold overflow-x-auto shrink-0">
          <button
            onClick={() => setViewMode("cards")}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === "cards"
                ? "bg-[#0B3D66] text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <span>🗂️</span>
            <span>Skill Cards</span>
          </button>
          <button
            onClick={() => setViewMode("ladder")}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === "ladder"
                ? "bg-[#0B3D66] text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <span>🏔️</span>
            <span>Proficiency Ladder</span>
          </button>
          <button
            onClick={() => setViewMode("radar")}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === "radar"
                ? "bg-[#0B3D66] text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <span>🕸️</span>
            <span>Radar & Growth</span>
          </button>
          <button
            onClick={() => setViewMode("audit")}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === "audit"
                ? "bg-[#0B3D66] text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <span>📜</span>
            <span>Audit History ({auditLogs.length})</span>
          </button>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-60">
            <input
              type="text"
              placeholder="Search skills, tools, topics..."
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

          {/* Level Filter */}
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 cursor-pointer focus:outline-hidden"
          >
            <option value="ALL">All Levels</option>
            <option value="5">Level 5 (Expert)</option>
            <option value="4">Level 4 (Advanced)</option>
            <option value="3">Level 3 (Practitioner)</option>
            <option value="2">Level 2 (Basic)</option>
            <option value="1">Level 1 (Awareness)</option>
          </select>

          {/* Domain Filter */}
          <select
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
            className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 cursor-pointer focus:outline-hidden"
          >
            <option value="ALL">All Domains</option>
            {domains.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ──────────────────────────────────────────────
          3. MAIN CONTENT VIEWS
         ────────────────────────────────────────────── */}

      {/* ─── VIEW 1: DETAILED SKILL CARDS ─── */}
      {viewMode === "cards" && (
        <div className="space-y-6">
          {domains
            .filter((d) => domainFilter === "ALL" || domainFilter === d)
            .map((domainName) => {
              const domainComps = filteredCompetencies.filter((c) => c.domain === domainName);
              if (domainComps.length === 0) return null;

              const meta = DOMAIN_METADATA[domainName];

              return (
                <div key={domainName} className="space-y-3">
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {domainComps.map((comp) => {
                      const rubric = PROFICIENCY_LEVEL_RUBRICS[comp.currentLevel];
                      const def = DEFAULT_COMPETENCIES_CATALOGUE.find(
                        (d) => d.name === comp.competencyName
                      );

                      return (
                        <div
                          key={comp.competencyId}
                          onClick={() => setSelectedSkill(comp)}
                          className="bg-white rounded-3xl p-5 border border-gray-100 shadow-2xs hover:shadow-md hover:border-blue-200 transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
                        >
                          <div>
                            {/* Card Top */}
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <span
                                className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${rubric.color}`}
                              >
                                Level {comp.currentLevel} · {rubric.tag}
                              </span>

                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  comp.gap > 0
                                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                }`}
                              >
                                {comp.gap > 0 ? `−${comp.gap} Deficit` : "Target Met ✓"}
                              </span>
                            </div>

                            <h4 className="text-sm font-bold text-[#0B3D66] group-hover:text-[#FF7A00] transition-colors">
                              {comp.competencyName}
                            </h4>
                            <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 min-h-[32px]">
                              {def?.description || rubric.desc}
                            </p>
                          </div>

                          {/* 5-Step Visual Level Meter */}
                          <div className="space-y-1.5 bg-gray-50/80 p-3 rounded-2xl border border-gray-100">
                            <div className="flex justify-between items-center text-[10px] font-semibold text-gray-600">
                              <span>Proficiency: {rubric.name}</span>
                              <span className="font-bold text-gray-900">{comp.currentLevel} / 5</span>
                            </div>

                            <div className="grid grid-cols-5 gap-1.5 py-0.5">
                              {[1, 2, 3, 4, 5].map((lvl) => {
                                const isAcquired = lvl <= comp.currentLevel;
                                return (
                                  <div
                                    key={lvl}
                                    className={`h-2 rounded-full transition-all ${
                                      isAcquired
                                        ? comp.currentLevel >= 4
                                          ? "bg-emerald-500 shadow-2xs"
                                          : comp.currentLevel === 3
                                          ? "bg-blue-600"
                                          : "bg-amber-400"
                                        : "bg-gray-200"
                                    }`}
                                  />
                                );
                              })}
                            </div>
                          </div>

                          {/* Footer Evidence & Action */}
                          <div className="pt-2 border-t border-gray-50 flex items-center justify-between text-[10px] text-gray-400">
                            <span className="truncate max-w-[170px]" title={comp.evidenceSource}>
                              📜 {comp.evidenceSource}
                            </span>
                            <span className="text-[#0B3D66] font-bold group-hover:underline flex items-center gap-0.5">
                              Details →
                            </span>
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

      {/* ─── VIEW 2: PROFICIENCY LADDER (PYRAMID) ─── */}
      {viewMode === "ladder" && (
        <div className="space-y-4">
          {[5, 4, 3, 2, 1].map((lvl) => {
            const rubric = PROFICIENCY_LEVEL_RUBRICS[lvl];
            const skillsAtLevel = filteredCompetencies.filter((c) => c.currentLevel === lvl);

            return (
              <div
                key={lvl}
                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-2xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl font-bold text-sm flex items-center justify-center ${rubric.color}`}
                    >
                      L{lvl}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#0B3D66] flex items-center gap-2">
                        <span>{rubric.name}</span>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.2 rounded-full bg-gray-100 text-gray-700">
                          {rubric.tag}
                        </span>
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">{rubric.desc}</p>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-gray-700 bg-gray-50 px-3 py-1 rounded-xl border border-gray-100 shrink-0">
                    {skillsAtLevel.length} Skills Acquired
                  </span>
                </div>

                {/* Grid of skills at this level */}
                {skillsAtLevel.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {skillsAtLevel.map((skill) => (
                      <div
                        key={skill.competencyId}
                        onClick={() => setSelectedSkill(skill)}
                        className="p-3.5 rounded-2xl bg-gray-50/70 hover:bg-blue-50/50 border border-gray-100 hover:border-blue-200 transition-all cursor-pointer flex items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                DOMAIN_METADATA[skill.domain].bg
                              } ${DOMAIN_METADATA[skill.domain].text}`}
                            >
                              {skill.domain}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {skill.lastAssessedDate}
                            </span>
                          </div>
                          <h5 className="text-xs font-bold text-gray-900">{skill.competencyName}</h5>
                        </div>

                        <span className="text-xs text-gray-400 hover:text-[#0B3D66]">→</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-2xl text-xs text-gray-400 italic text-center">
                    No competencies currently assessed at Level {lvl}.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ─── VIEW 3: RADAR & GROWTH ANALYTICS ─── */}
      {viewMode === "radar" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-[#0B3D66] font-serif">
                Cadre Competency Radar
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Visualizes current evaluated domain averages vs official cadre benchmarks.
              </p>
            </div>

            <div className="h-72 w-full">
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
                    name="Current Proficiency"
                    dataKey="Current"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.4}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                  <Tooltip
                    formatter={(val: any) => [`Level ${val} / 5`, ""]}
                    contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-[#0B3D66] font-serif">
                Domain Mastery Distribution
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Overall score percentage achieved across the 4 key statistical pillars.
              </p>

              <div className="space-y-4 mt-6">
                {domainStats.map((ds) => (
                  <div key={ds.domain} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="flex items-center gap-1.5 text-gray-800">
                        <span>{ds.meta.icon}</span>
                        <span>{ds.domain}</span>
                      </span>
                      <span className="text-[#0B3D66]">
                        L{ds.avg}/5 <span className="text-gray-400 font-normal">({ds.pct}%)</span>
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all"
                        style={{ width: `${ds.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="text-gray-500">Fastest pathway to elevate index:</span>
              <button
                onClick={() => onNav("skill_gaps")}
                className="text-[#FF7A00] font-bold hover:underline cursor-pointer"
              >
                View Targeted Gap Modules →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── VIEW 4: VERIFIED AUDIT LOGS ─── */}
      {viewMode === "audit" && (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#0B3D66] font-serif">
                MoSPI Capacity Ledger Audit Trail
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Every competency calibration and assessment result is securely logged to the official ledger.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
              Ledger Synchronized ✓
            </span>
          </div>

          <div className="divide-y divide-gray-100 text-xs">
            {auditLogs.length > 0 ? (
              auditLogs.map((log) => (
                <div key={log.id} className="py-3.5 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#0B3D66]">{log.competencyName}</span>
                      <span className="text-[10px] font-extrabold px-2 py-0.2 rounded-full bg-blue-100 text-blue-800">
                        L{log.oldLevel} → L{log.newLevel}
                      </span>
                      <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.2 rounded">
                        {log.sourceType}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-600">
                      Evidence: <em>{log.evidence}</em>
                    </div>
                  </div>

                  <span className="text-[10px] text-gray-400 shrink-0 font-mono">
                    {new Date(log.timestamp).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-gray-400 italic">
                No closed-loop competency changes recorded yet. Complete a quiz or assessment to log your first verified upgrade!
              </div>
            )}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────
          4. SKILL DETAIL & SELF-CALIBRATION MODAL
         ────────────────────────────────────────────── */}
      {selectedSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-5 shadow-2xl border border-gray-100">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-gray-100 pb-4">
              <div>
                <span
                  className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                    DOMAIN_METADATA[selectedSkill.domain].bg
                  } ${DOMAIN_METADATA[selectedSkill.domain].text}`}
                >
                  {selectedSkill.domain} Domain
                </span>
                <h3 className="text-lg font-bold text-[#0B3D66] font-serif mt-1">
                  {selectedSkill.competencyName}
                </h3>
              </div>

              <button
                onClick={() => {
                  setSelectedSkill(null);
                  setCalibratingLevel(null);
                  setCalibrationReason("");
                }}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 font-bold flex items-center justify-center transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Level & Rubric */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-700">
                  Current Level: <strong>Level {selectedSkill.currentLevel} / 5</strong>
                </span>
                <span className="text-[10px] font-bold text-gray-400">
                  Required: Level {selectedSkill.requiredLevel}
                </span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                {PROFICIENCY_LEVEL_RUBRICS[selectedSkill.currentLevel]?.desc}
              </p>
              <div className="text-[10px] text-gray-400 pt-1 border-t border-gray-200/60 flex justify-between">
                <span>Evaluated via: {selectedSkill.evidenceSource}</span>
                <span>Date: {selectedSkill.lastAssessedDate}</span>
              </div>
            </div>

            {/* Calibration / Self Appraisal Section */}
            <div className="space-y-3 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
              <div className="text-xs font-bold text-[#0B3D66] flex items-center justify-between">
                <span>🔄 Self-Calibrate Competency Level</span>
                <span className="text-[10px] text-blue-700 font-normal">Audit-Logged</span>
              </div>

              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setCalibratingLevel(lvl)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      (calibratingLevel ?? selectedSkill.currentLevel) === lvl
                        ? "bg-[#0B3D66] text-white shadow-xs"
                        : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                    }`}
                  >
                    L{lvl}
                  </button>
                ))}
              </div>

              {calibratingLevel !== null && calibratingLevel !== selectedSkill.currentLevel && (
                <div className="space-y-2 pt-2 animate-in fade-in">
                  <input
                    type="text"
                    placeholder="Reason for calibration (e.g. Completed PLFS fieldwork or training)..."
                    value={calibrationReason}
                    onChange={(e) => setCalibrationReason(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs focus:border-[#0B3D66] focus:outline-hidden"
                  />
                  <button
                    onClick={handleSaveCalibration}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                  >
                    Save Verified Update to MoSPI Ledger →
                  </button>
                </div>
              )}

              {calibrationSuccess && (
                <div className="text-xs font-bold text-emerald-700 text-center animate-in fade-in">
                  ✓ Competency upgraded & written to MoSPI Ledger!
                </div>
              )}
            </div>

            {/* Matched Remediation Pathways */}
            <div className="space-y-2.5 pt-1">
              <div className="text-xs font-bold text-[#0B3D66] uppercase tracking-wider">
                Remedial Courses & Assessments
              </div>

              {getRemedialCourses(selectedSkill.competencyName).map((c) => (
                <div
                  key={c.id}
                  className="p-3 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 bg-[#0B3D66] text-white rounded">
                      {c.provider}
                    </span>
                    <h5 className="font-bold text-gray-800 mt-0.5">{c.title}</h5>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedSkill(null);
                      if (onOpenCourse) onOpenCourse(c);
                      onNav("course_detail");
                    }}
                    className="px-3 py-1.5 bg-[#FF7A00] text-white font-bold rounded-lg text-xs shrink-0 cursor-pointer"
                  >
                    Start Course →
                  </button>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <button
                onClick={() => {
                  setSelectedSkill(null);
                  onNav("assistant");
                }}
                className="text-xs text-[#0B3D66] font-bold hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>🤖 Ask AI Copilot to Coach on this Skill</span>
              </button>

              <button
                onClick={() => {
                  setSelectedSkill(null);
                  setCalibratingLevel(null);
                  setCalibrationReason("");
                }}
                className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl cursor-pointer"
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

export default MySkillsPortfolio;

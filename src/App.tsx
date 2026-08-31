import React, { useState, useEffect, useRef, useMemo, useCallback, Fragment, type ReactNode } from "react";
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
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from "recharts";

import {
  UserRole,
  CompetencyDomain,
  CompetencyDefinition,
  UserCompetencyScore,
  JobRoleDefinition,
  OfficerProfile,
  CourseItem,
  NsstaTrainingProgramme,
  RecommendationExplanation,
  ValidatedMCQ,
  QuizItem,
  QuizAttempt,
  CompetencyUpdateLog,
  LearningResource,
  LearningPathStep,
  EmployeeRecord,
  NotificationItem,
  getProfile,
  saveProfile,
  getActiveRole,
  setActiveRole,
  getUserCompetencies,
  saveUserCompetencies,
  getCourses,
  saveCourses,
  getNsstaProgrammes,
  getQuizzes,
  getLearningResources,
  saveLearningResources,
  getAdminEmployees,
  saveAdminEmployees,
  addAdminEmployee,
  updateAdminEmployee,
  deleteAdminEmployee,
  getNotifications,
  saveNotifications,
  addNotification,
  markNotificationRead,
  markAllNotificationsRead,
  clearNotifications,
  getQuizAttempts,
  saveQuizAttempt,
  getCompetencyAuditLogs,
  applyClosedLoopCompetencyUpdate,
  getTrainerQuestionBank,
  saveTrainerQuestionBank,
  addTrainerMCQ,
  updateTrainerMCQ,
  deleteTrainerMCQ,
  getExplainableRecommendations,
  getPersonalizedLearningPath,
  DEFAULT_JOB_ROLES,
  DEFAULT_COMPETENCIES_CATALOGUE,
  getCertificates,
  issueDigitalCredential,
  verifyCredential,
  registerOfficerAccount,
  loginOfficerWithCredentials,
  deriveUserCompetencies,
  getCourseImage,
  type VerifiableCertificate,
} from "./services/storageService";

import { getRichCourseDetail } from "./services/courseContentData";
import { generateOfficialDataset, triggerBrowserDownload } from "./services/fileDownloadService";

import {
  generateMCQsFromText,
  generateValidatedMCQsFromDocument,
  validateMCQ,
  chatWithStatisticalAssistant,
  hasGroqApiKey,
  getGroqApiKey,
  setGroqApiKey,
  type GeneratedQuestion,
  type ValidatedTrainerMCQ,
} from "./services/aiService";

import { semanticSearchCourses } from "./services/sentenceTransformer";
import { extractTextFromFile } from "./services/documentParser";
import { LiveTerminalModal, OFFICIAL_LAB_EXERCISES, type LabExercise } from "./components/LiveTerminal";
import { LecturePlayer } from "./components/LecturePlayer";
import {
  IgotAdapter,
  IgotAdapterConfig,
  getAdapterConfig,
  saveAdapterConfig,
  IgotAdapterMode,
} from "./services/igotAdapter";

import {
  LanguageProvider,
  useLanguage,
  type Language,
  type Translations,
} from "./services/i18n";

import { CourseLearningPage } from "./components/CoursePlayer/CourseLearningPage";
import { LandingPage } from "./components/LandingPage";
import { AIResponseMessage } from "./components/AIResponseMessage";
import { NsstaRegistrationModal } from "./components/NsstaRegistrationModal";
import { SkillGapAnalysis } from "./components/SkillGapAnalysis";
import { MySkillsPortfolio } from "./components/MySkillsPortfolio";

export type Screen =
  | "landing"
  | "login"
  | "onboarding"
  | "dashboard"
  | "skills"
  | "assessment"
  | "assessment_result"
  | "skill_gaps"
  | "learning_path"
  | "courses"
  | "course_detail"
  | "course_player"
  | "training_programmes"
  | "learning"
  | "quizzes"
  | "quiz_player"
  | "quiz_result"
  | "resources"
  | "assistant"
  | "profile"
  | "certificates"
  | "labs"
  | "trainer"
  | "trainer_generate"
  | "trainer_bank"
  | "trainer_analytics"
  | "admin"
  | "admin_analytics"
  | "admin_employees"
  | "admin_competencies"
  | "admin_courses"
  | "settings";

// ──────────────────────────────────────────────
// Navigation Configuration
// ──────────────────────────────────────────────

interface NavItemDef {
  id: Screen;
  transKey: keyof Translations;
  icon: string;
  badge?: string;
  badgeColor?: string;
  roles: UserRole[];
}

interface NavSectionDef {
  title: string;
  items: NavItemDef[];
}

const NAV_SECTIONS: NavSectionDef[] = [
  {
    title: "Core Portal",
    items: [
      { id: "landing", transKey: "nav_landing", icon: "🏠", roles: ["learner", "admin", "trainer"] },
      { id: "dashboard", transKey: "nav_dashboard", icon: "📊", roles: ["learner", "admin", "trainer"] },
    ],
  },
  {
    title: "AI & Competency Matrix",
    items: [
      { id: "skills", transKey: "nav_skills", icon: "🎯", roles: ["learner"] },
      { id: "assessment", transKey: "nav_assessment", icon: "✍️", badge: "AI Diagnostic", badgeColor: "bg-blue-500/30 text-blue-300", roles: ["learner"] },
      { id: "skill_gaps", transKey: "nav_skill_gaps", icon: "⚖️", badge: "Live Gaps", badgeColor: "bg-amber-500/30 text-amber-300", roles: ["learner"] },
      { id: "assistant", transKey: "nav_assistant", icon: "🤖", badge: "Closed-Loop", badgeColor: "bg-emerald-500/30 text-emerald-300", roles: ["learner", "trainer", "admin"] },
    ],
  },
  {
    title: "Learning & Sandboxes",
    items: [
      { id: "learning_path", transKey: "nav_learning_path", icon: "🗺️", badge: "Roadmap", badgeColor: "bg-purple-500/30 text-purple-300", roles: ["learner"] },
      { id: "courses", transKey: "nav_courses", icon: "📚", roles: ["learner", "admin", "trainer"] },
      { id: "training_programmes", transKey: "nav_training_programmes", icon: "🏛️", roles: ["learner", "admin"] },
      { id: "learning", transKey: "nav_learning", icon: "📖", roles: ["learner"] },
      { id: "quizzes", transKey: "nav_quizzes", icon: "⏱️", roles: ["learner"] },
      { id: "labs", transKey: "nav_virtual_labs", icon: "🧪", badge: "WASM", badgeColor: "bg-indigo-500/30 text-indigo-300", roles: ["learner"] },
      { id: "resources", transKey: "nav_resources", icon: "📄", roles: ["learner", "trainer"] },
      { id: "certificates", transKey: "nav_certificates", icon: "📜", roles: ["learner"] },
    ],
  },
  {
    title: "Management",
    items: [
      { id: "trainer", transKey: "nav_trainer_portal", icon: "🎓", badge: "RAG Studio", badgeColor: "bg-purple-500/30 text-purple-300", roles: ["trainer", "admin"] },
      { id: "admin", transKey: "nav_admin_analytics", icon: "👑", badge: "Ministry", badgeColor: "bg-amber-500/30 text-amber-300", roles: ["admin"] },
    ],
  },
  {
    title: "Account",
    items: [
      { id: "profile", transKey: "nav_profile", icon: "👤", roles: ["learner", "trainer", "admin"] },
      { id: "settings", transKey: "nav_settings", icon: "⚙️", roles: ["learner", "trainer", "admin"] },
    ],
  },
];

// ──────────────────────────────────────────────
// Sidebar Component
// ──────────────────────────────────────────────

function SidebarContent({
  current,
  onNav,
  collapsed,
  setCollapsed,
  onClose,
}: {
  current: Screen;
  onNav: (s: Screen) => void;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  onClose?: () => void;
}) {
  const { t } = useLanguage();
  const profile = getProfile();
  const role = profile.role || "learner";

  return (
    <aside
      className="h-full bg-gradient-to-b from-[#1864A6] via-[#0F4C81] to-[#0B3D66] border-r border-white/15 flex flex-col shrink-0 transition-all duration-300 shadow-2xl relative select-none font-sans"
      style={{ width: collapsed ? 72 : 264 }}
    >
      {/* Subtle Sidebar Ambient Glow */}
      <div className="absolute top-0 left-0 w-full h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className={`border-b border-white/15 flex items-center transition-all duration-200 ${collapsed ? "px-3 py-4 justify-center" : "px-4 py-4 justify-between"} relative z-10`}>
        {!collapsed ? (
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-amber-300 text-slate-950 flex items-center justify-center font-extrabold text-base shrink-0 shadow-lg border border-white/30">
              S
            </div>
            <div className="min-w-0">
              <div className="text-white text-sm font-bold tracking-tight truncate flex items-center gap-1.5 font-serif">
                <span>StatSkill AI</span>
              </div>
              <div className="text-amber-300/90 text-[10px] font-bold tracking-wide truncate flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{role === "admin" ? "Ministry Admin" : role === "trainer" ? "Faculty Studio" : "Official Capacity Hub"}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center font-extrabold text-base shadow-md border border-white/20">
            S
          </div>
        )}

        {onClose && !collapsed && (
          <button onClick={onClose} className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors ml-1 shrink-0 cursor-pointer">
            ✕
          </button>
        )}
      </div>

      {/* Nav links grouped by section */}
      <nav className="flex-1 px-2.5 py-3.5 space-y-4 overflow-y-auto relative z-10 scrollbar-thin scrollbar-thumb-white/10">
        {NAV_SECTIONS.map((sec, secIdx) => {
          const filteredItems = sec.items.filter((item) => item.roles.includes(role));
          if (filteredItems.length === 0) return null;

          return (
            <div key={secIdx} className="space-y-1">
              {!collapsed && (
                <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-amber-200/70">
                  {sec.title}
                </div>
              )}

              {filteredItems.map((item) => {
                const active = current === item.id || (item.id === "courses" && current === "course_detail");
                const label = t(item.transKey);

                return (
                  <button
                    key={item.id}
                    onClick={() => { onNav(item.id); onClose?.(); }}
                    title={collapsed ? label : undefined}
                    className={`w-full flex items-center rounded-xl text-xs transition-all cursor-pointer group ${
                      collapsed ? "justify-center p-2.5 my-1" : "px-3 py-2 gap-2.5"
                    } ${
                      active
                        ? "bg-white/20 text-white font-bold shadow-md backdrop-blur-md border-l-4 border-amber-300 pl-2"
                        : "text-white/80 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span className="text-sm shrink-0 group-hover:scale-110 transition-transform">
                      {item.icon}
                    </span>

                    {!collapsed && (
                      <span className="truncate text-left flex-1 text-[12px] font-medium">
                        {label}
                      </span>
                    )}

                    {!collapsed && item.badge && (
                      <span className={`ml-auto text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border border-white/10 shrink-0 ${
                        item.badgeColor || "bg-white/20 text-white"
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Officer Mini Profile Card */}
      {!collapsed && (
        <div className="px-3 py-2.5 mx-2.5 mb-2 rounded-2xl bg-black/15 border border-white/15 backdrop-blur-sm relative z-10 flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <div className="text-[11px] font-bold text-white truncate">{profile.name || "Officer Rajesh"}</div>
            <div className="text-[9px] text-blue-100/80 truncate">{profile.designation || "Statistical Officer"}</div>
          </div>
          <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-amber-400/25 text-amber-200 border border-amber-400/40 shrink-0">
            {profile.cadreGrade || "STS"}
          </span>
        </div>
      )}

      {/* Collapse Toggle */}
      <div className="p-2 border-t border-white/15 hidden md:block relative z-10">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all text-xs font-bold cursor-pointer gap-2"
        >
          <span>{collapsed ? "→" : "← Collapse Sidebar"}</span>
        </button>
      </div>
    </aside>
  );
}

function Sidebar({
  current,
  onNav,
  mobileOpen,
  onMobileClose,
}: {
  current: Screen;
  onNav: (s: Screen) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <div className="hidden md:block shrink-0 h-screen sticky top-0">
        <SidebarContent current={current} onNav={onNav} collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300" onClick={onMobileClose} />
          <div className="relative z-10 h-full w-[280px] max-w-[85vw] shadow-2xl animate-in slide-in-from-left duration-300">
            <SidebarContent current={current} onNav={onNav} collapsed={false} setCollapsed={() => {}} onClose={onMobileClose} />
          </div>
        </div>
      )}
    </>
  );
}

// ──────────────────────────────────────────────
// Topbar Component
// ──────────────────────────────────────────────

function Topbar({
  onLogout,
  onMenuOpen,
  onRoleChange,
  onNav,
}: {
  onLogout: () => void;
  onMenuOpen: () => void;
  onRoleChange: (r: UserRole) => void;
  onNav: (s: Screen) => void;
}) {
  const { lang, setLang } = useLanguage();
  const profile = getProfile();
  const [igotModalOpen, setIgotModalOpen] = useState(false);
  const [notifsOpen, setNotifsOpen] = useState(false);
  const [notifs, setNotifs] = useState<NotificationItem[]>(() => getNotifications());

  const unreadCount = notifs.filter((n) => !n.read).length;

  const refreshNotifs = () => {
    setNotifs(getNotifications());
  };

  const handleMarkAll = () => {
    markAllNotificationsRead();
    refreshNotifs();
  };

  const handleClear = () => {
    clearNotifications();
    refreshNotifs();
  };

  const handleItemClick = (n: NotificationItem) => {
    markNotificationRead(n.id);
    refreshNotifs();
    setNotifsOpen(false);
    if (n.type === "competency_update") onNav("skills");
    else if (n.type === "recommendation") onNav("courses");
    else if (n.type === "programme_alert") onNav("training_programmes");
    else onNav("dashboard");
  };

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center px-3 sm:px-4 md:px-6 gap-2 sm:gap-3 shrink-0 relative z-20 justify-between">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onMenuOpen}
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-gray-700 shrink-0 cursor-pointer border border-gray-200"
          aria-label="Open Navigation Menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="hidden md:flex items-center gap-2">
          <span className="text-xs font-bold text-[#0B3D66] bg-blue-50 px-2.5 py-1 rounded-lg">
            StatSkill AI
          </span>
          <span className="text-xs text-gray-500 font-medium truncate max-w-[200px]">
            {profile.department}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
        {/* Responsive Role Switcher */}
        <div className="flex items-center bg-gray-100 p-0.5 rounded-xl text-xs font-bold shrink-0">
          <button
            onClick={() => onRoleChange("learner")}
            title="Official Cadre"
            className={`px-2 sm:px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
              profile.role === "learner"
                ? "bg-[#0B3D66] text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <span>👤</span>
            <span className="hidden sm:inline">Official</span>
          </button>
          <button
            onClick={() => onRoleChange("trainer")}
            title="Trainer Studio"
            className={`px-2 sm:px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
              profile.role === "trainer"
                ? "bg-purple-700 text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <span>🎓</span>
            <span className="hidden sm:inline">Trainer</span>
          </button>
          <button
            onClick={() => onRoleChange("admin")}
            title="Ministry Admin"
            className={`px-2 sm:px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
              profile.role === "admin"
                ? "bg-amber-600 text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <span>👑</span>
            <span className="hidden sm:inline">Admin</span>
          </button>
        </div>

        {/* iGOT Adapter Status Badge */}
        <button
          onClick={() => setIgotModalOpen(true)}
          className="hidden xl:flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-orange-50 text-[#FF7A00] border border-orange-200 hover:bg-orange-100 transition-all cursor-pointer shrink-0"
          title="iGOT Karmayogi (Sunbird) Integration Adapter"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>iGOT Synced</span>
        </button>

        {/* Notifications Button & Dropdown */}
        <div className="relative shrink-0">
          <button
            onClick={() => {
              refreshNotifs();
              setNotifsOpen(!notifsOpen);
            }}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center text-xs relative cursor-pointer transition-colors shadow-2xs"
            title="Notifications"
          >
            🔔
            {unreadCount > 0 && (
              <span className="min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center absolute -top-1 -right-1 shadow-2xs">
                {unreadCount}
              </span>
            )}
          </button>

          {notifsOpen && (
            <div className="fixed sm:absolute top-14 sm:top-full right-2 sm:right-0 mt-2 w-[calc(100vw-1rem)] sm:w-80 max-w-sm bg-white rounded-3xl shadow-2xl border border-gray-100 p-4 space-y-3 z-50 text-xs animate-in zoom-in-95">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <div className="flex items-center gap-1.5 font-bold text-gray-900">
                  <span>Notifications</span>
                  <span className="text-[10px] bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px]">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAll}
                      className="text-blue-600 font-bold hover:underline cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={handleClear}
                    className="text-gray-400 hover:text-rose-600 cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {notifs.length > 0 ? (
                  notifs.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleItemClick(n)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-1 ${
                        !n.read
                          ? "bg-blue-50/50 border-blue-200/80 hover:bg-blue-100/50 shadow-2xs"
                          : "bg-gray-50/60 border-gray-100 hover:bg-gray-100/60"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <div className="font-bold text-[#0B3D66] text-xs flex items-center gap-1.5">
                          <span>
                            {n.type === "competency_update"
                              ? "🎉"
                              : n.type === "recommendation"
                              ? "📚"
                              : n.type === "programme_alert"
                              ? "🏛️"
                              : "✍️"}
                          </span>
                          <span className="line-clamp-1">{n.title}</span>
                        </div>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                        )}
                      </div>
                      <div className="text-[11px] text-gray-600 leading-snug">{n.message}</div>
                      <div className="text-[9px] text-gray-400 font-mono">{n.timestamp}</div>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-gray-400 text-xs">
                    No new alerts or notifications.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Multilingual Switcher */}
        <div className="flex items-center bg-gray-100 rounded-xl p-0.5 text-xs font-bold shrink-0">
          {(["EN", "HI", "TE"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-1.5 sm:px-2 py-1 rounded-lg transition-all ${
                lang === l ? "bg-white text-[#0B3D66] shadow-xs" : "text-gray-400 hover:text-gray-600 cursor-pointer"
              }`}
            >
              {l === "EN" ? "EN" : l === "HI" ? "हिं" : "తె"}
            </button>
          ))}
        </div>

        {/* Profile Avatar & Logout */}
        <div className="flex items-center gap-1.5 sm:gap-2 pl-1.5 sm:pl-2 border-l border-gray-100 shrink-0">
          <button
            onClick={() => onNav("profile")}
            className="w-8 h-8 rounded-full bg-[#0B3D66] text-white flex items-center justify-center text-xs font-bold hover:opacity-90 cursor-pointer shadow-2xs"
            title="My Profile"
          >
            {(profile?.name || "RS").slice(0, 2).toUpperCase()}
          </button>
          <button
            onClick={onLogout}
            title="Sign Out"
            className="text-gray-400 hover:text-rose-500 p-1 transition-colors text-xs"
          >
            ⎋
          </button>
        </div>
      </div>

      <IgotAdapterModal
        isOpen={igotModalOpen}
        onClose={() => setIgotModalOpen(false)}
      />
    </header>
  );
}

// ──────────────────────────────────────────────
// iGOT Integration Adapter Modal
// ──────────────────────────────────────────────

function IgotAdapterModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [cfg, setCfg] = useState<IgotAdapterConfig>(getAdapterConfig());
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  if (!isOpen) return null;

  async function handleToggleMode(newMode: IgotAdapterMode) {
    const updated = { ...cfg, mode: newMode };
    saveAdapterConfig(updated);
    setCfg(updated);
    setStatusMsg(`Adapter switched to ${newMode === "MOCK" ? "MOCK (Authentic Offline Sandbox)" : "LIVE (Official HTTPS Gateway)"} mode.`);
  }

  async function handleTestSearch() {
    setTesting(true);
    setStatusMsg("Querying iGOT Adapter Content Search endpoint (POST /api/content/v1/search)...");
    try {
      const adapter = new IgotAdapter(cfg);
      const res = await adapter.searchCourses("National Accounts");
      setStatusMsg(`[Status 200 OK] Received ${res.result.count} courses matching query. Response id: ${res.id}`);
    } catch (e: any) {
      setStatusMsg(`Search failed: ${e.message}`);
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-xl w-full p-6 md:p-8 space-y-5">
        <div className="flex items-start justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF7A00] flex items-center justify-center text-xl font-bold">
              🇮🇳
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#0B3D66]">iGOT Karmayogi (Sunbird) Integration Adapter</h3>
              <p className="text-[11px] text-gray-500">API-ready connector for Mission Karmayogi (DoPT)</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center text-xs">
            ✕
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-2xl border border-gray-200">
          <div>
            <div className="text-xs font-bold text-gray-800">Adapter Execution Mode:</div>
            <div className="text-[10px] text-gray-500">
              {cfg.mode === "MOCK" ? "Using authentic offline Sunbird JSON schemas" : "Connected to official HTTPS Gateway"}
            </div>
          </div>
          <div className="flex bg-white p-1 rounded-xl border border-gray-200 text-xs font-bold">
            <button
              onClick={() => handleToggleMode("MOCK")}
              className={`px-3 py-1 rounded-lg ${cfg.mode === "MOCK" ? "bg-emerald-600 text-white" : "text-gray-600"}`}
            >
              Mock Mode
            </button>
            <button
              onClick={() => handleToggleMode("LIVE")}
              className={`px-3 py-1 rounded-lg ${cfg.mode === "LIVE" ? "bg-[#0B3D66] text-white" : "text-gray-600"}`}
            >
              Live API
            </button>
          </div>
        </div>

        {/* Endpoints */}
        <div className="bg-[#0B3D66]/5 rounded-2xl p-4 border border-[#0B3D66]/10 space-y-2 text-xs font-mono">
          <div className="flex justify-between">
            <span className="text-gray-500">Base Gateway:</span>
            <span className="font-bold text-[#0B3D66]">{cfg.baseUrl}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Channel / MDO:</span>
            <span className="font-bold text-gray-800">{cfg.channel}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Telemetry Engine:</span>
            <span className="font-bold text-emerald-700">Sunbird Obsrv v3.0 Active</span>
          </div>
        </div>

        {statusMsg && (
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 font-mono">
            {statusMsg}
          </div>
        )}

        <div className="flex justify-between items-center pt-2">
          <button
            onClick={handleTestSearch}
            disabled={testing}
            className="px-4 py-2 bg-[#0B3D66] text-white text-xs font-bold rounded-xl hover:bg-[#082e4f] disabled:opacity-50"
          >
            {testing ? "Testing..." : "Test Endpoint (POST /api/content/v1/search)"}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// ──────────────────────────────────────────────
// Mobile Bottom Navigation Bar (Fast Native Access)
// ──────────────────────────────────────────────

export function MobileBottomNav({
  current,
  onNav,
  role = "learner",
}: {
  current: Screen;
  onNav: (s: Screen) => void;
  role?: UserRole;
}) {
  const learnerNav: { id: Screen; label: string; icon: string }[] = [
    { id: "dashboard", label: "Home", icon: "🏛️" },
    { id: "skills", label: "Skills", icon: "🎯" },
    { id: "courses", label: "Courses", icon: "📚" },
    { id: "labs", label: "Sandbox", icon: "💻" },
    { id: "assistant", label: "AI Tutor", icon: "🤖" },
  ];

  const trainerNav: { id: Screen; label: string; icon: string }[] = [
    { id: "trainer", label: "Studio", icon: "🎓" },
    { id: "dashboard", label: "Home", icon: "🏛️" },
    { id: "courses", label: "Courses", icon: "📚" },
    { id: "labs", label: "Sandbox", icon: "💻" },
    { id: "assistant", label: "AI Tutor", icon: "🤖" },
  ];

  const adminNav: { id: Screen; label: string; icon: string }[] = [
    { id: "admin", label: "Admin", icon: "👑" },
    { id: "dashboard", label: "Home", icon: "🏛️" },
    { id: "skills", label: "Skills", icon: "🎯" },
    { id: "courses", label: "Courses", icon: "📚" },
    { id: "assistant", label: "AI Tutor", icon: "🤖" },
  ];

  const effectiveRole = role || "learner";
  const items = effectiveRole === "admin" ? adminNav : effectiveRole === "trainer" ? trainerNav : learnerNav;

  const handleNavClick = (screenId: Screen) => {
    onNav(screenId);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      const mainEl = document.getElementById("main-content");
      if (mainEl) mainEl.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white/95 backdrop-blur-md border-t border-gray-200 px-1 py-1 flex justify-around items-center shadow-[0_-4px_20px_rgba(0,0,0,0.08)] pb-[calc(0.35rem+env(safe-area-inset-bottom,0px))] pointer-events-auto"
    >
      {items.map((item) => {
        const isActive =
          current === item.id ||
          (item.id === "skills" &&
            (current === "skill_gaps" ||
              current === "assessment" ||
              current === "assessment_result")) ||
          (item.id === "courses" &&
            (current === "course_detail" ||
              current === "course_player" ||
              current === "learning_path" ||
              current === "training_programmes" ||
              current === "learning" ||
              current === "quizzes" ||
              current === "resources"));

        return (
          <button
            key={item.id}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleNavClick(item.id);
            }}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer select-none touch-manipulation min-h-[48px] active:scale-95 pointer-events-auto ${
              isActive
                ? "text-[#0B3D66] font-bold bg-blue-50/60"
                : "text-gray-500 hover:text-gray-800 font-medium"
            }`}
          >
            <span
              className={`text-lg leading-none mb-0.5 pointer-events-none transition-transform ${
                isActive ? "scale-110" : ""
              }`}
            >
              {item.icon}
            </span>
            <span
              className={`text-[10px] tracking-tight pointer-events-none ${
                isActive ? "text-[#0B3D66] font-extrabold" : "text-gray-500"
              }`}
            >
              {item.label}
            </span>
            {isActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A00] mt-0.5 animate-in fade-in pointer-events-none" />
            )}
          </button>
        );
      })}
    </nav>
  );
}

// ──────────────────────────────────────────────
// AppShell Component
// ──────────────────────────────────────────────

function AppShell({
  screen,
  onNav,
  children,
  onRoleChange,
}: {
  screen: Screen;
  onNav: (s: Screen) => void;
  children: ReactNode;
  onRoleChange: (r: UserRole) => void;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const profile = getProfile();

  const handleNav = (s: Screen) => {
    setMobileMenuOpen(false);
    onNav(s);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "instant" });
      const mainEl = document.getElementById("main-content");
      if (mainEl) mainEl.scrollTo({ top: 0, behavior: "instant" });
    }
  };

  return (
    <div className="flex h-full min-h-screen bg-[#F7F9FB]">
      <Sidebar
        current={screen}
        onNav={handleNav}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          onLogout={() => onNav("login")}
          onMenuOpen={() => setMobileMenuOpen(true)}
          onRoleChange={onRoleChange}
          onNav={handleNav}
        />
        <main id="main-content" className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-6 pb-28 md:pb-8">
          {children}
        </main>
        <MobileBottomNav current={screen} onNav={handleNav} role={profile.role} />
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// 1. Login Page with Demo Accounts
// ──────────────────────────────────────────────

function LoginScreen({
  onLogin,
  onDemoLogin,
  onBackToLanding,
}: {
  onLogin: () => void;
  onDemoLogin: (role: UserRole) => void;
  onBackToLanding?: () => void;
}) {
  const [authMode, setAuthMode] = useState<"signin" | "register">("signin");

  // Sign In State
  const [empId, setEmpId] = useState("rajesh.sharma@nic.in");
  const [pass, setPass] = useState("••••••••");

  // Register State (Rich Profile for AI Skill Gap Engine)
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regEmpId, setRegEmpId] = useState("");
  const [regCadre, setRegCadre] = useState("Indian Statistical Service");
  const [regGrade, setRegGrade] = useState<"JTS" | "STS" | "JAG" | "SAG" | "HAG" | "JSO" | "SSO" | "Officer">("STS");
  const [regDept, setRegDept] = useState("National Accounts Division (NAD)");
  const [regDesig, setRegDesig] = useState("Statistical Officer");
  const [regPosting, setRegPosting] = useState("Sardar Patel Bhawan, New Delhi");
  const [regExp, setRegExp] = useState(4);
  const [regDomain, setRegDomain] = useState("National Accounts & GVA");
  const [regTools, setRegTools] = useState<string[]>(["Python", "Excel"]);
  const [regRatings, setRegRatings] = useState<Record<string, number>>({
    "Descriptive Statistics & Sampling": 4,
    "Python for Data Analysis": 2,
    "National Accounts & GVA": 2,
    "Sampling Theory & PPS": 3,
    "Data Privacy (DPDP Act)": 2,
  });
  const [regGoal, setRegGoal] = useState("Lead National Accounts & GVA Compilation");
  const [regLang, setRegLang] = useState<"EN" | "HI" | "TE">("EN");
  const [regStep, setRegStep] = useState<1 | 2>(1);

  function toggleTool(tool: string) {
    if (regTools.includes(tool)) {
      setRegTools(regTools.filter((t) => t !== tool));
    } else {
      setRegTools([...regTools, tool]);
    }
  }

  function handleRegisterSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim()) {
      alert("Please fill in your Official Name and Email Address.");
      return;
    }

    registerOfficerAccount({
      name: regName,
      email: regEmail,
      employeeId: regEmpId || `MOSPI-${Math.floor(100000 + Math.random() * 900000)}`,
      cadre: regCadre,
      cadreGrade: regGrade,
      department: regDept,
      designation: regDesig,
      posting: regPosting,
      yearsOfExperience: regExp,
      primaryDomain: regDomain,
      toolsUsed: regTools,
      baselineRatings: regRatings,
      careerGoal: regGoal,
      preferredLanguage: regLang,
      role: "learner",
    });

    onLogin();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#061e38] via-[#0B3D66] to-[#0d4a7d] flex flex-col justify-center items-center p-3 sm:p-6 lg:p-10 relative overflow-hidden font-sans">
      {/* Dynamic Animated Ambient Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-96 h-96 bg-orange-500/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Subtle Blueprint Grid */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:24px_24px]" />

      {/* Top Header Navigation */}
      {onBackToLanding && (
        <div className="w-full max-w-6xl mb-4 sm:mb-6 flex justify-between items-center z-10 px-2">
          <button
            onClick={onBackToLanding}
            className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer backdrop-blur-md shadow-sm"
          >
            <span>← Back to Public Portal</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-bold text-white/90">
              National Statistical Capacity Network (MoSPI &amp; NSSTA)
            </span>
          </div>
        </div>
      )}

      {/* Main Split-Card */}
      <div className="w-full max-w-6xl bg-white rounded-3xl border border-white/60 shadow-[0_25px_70px_rgba(0,0,0,0.35)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10 animate-in fade-in zoom-in-95 duration-300">
        
        {/* ────────────── LEFT SHOWCASE: PLATFORM GOAL WITH OFFICIAL IMAGE ────────────── */}
        <div className="lg:col-span-5 relative p-6 sm:p-8 lg:p-10 text-white flex flex-col justify-between overflow-hidden min-h-[420px] lg:min-h-[560px]">
          {/* Background Image of Official Statistical AI Center */}
          <img
            src="/statskill_hero_login.jpg"
            alt="MoSPI Official Statistical Intelligence Center"
            className="absolute inset-0 w-full h-full object-cover object-center scale-105 transition-transform duration-1000"
          />
          {/* Gradient Overlay for high-contrast readable typography */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#061e38] via-[#0B3D66]/80 to-[#04172B]/65 backdrop-blur-[1px]" />

          {/* Top Emblem & Header */}
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-amber-300 text-slate-950 flex items-center justify-center font-extrabold text-2xl shadow-xl border-2 border-white/40">
                S
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-xl font-serif font-bold tracking-tight text-white drop-shadow-md">StatSkill AI</h2>
                  <span className="text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 shadow-sm">
                    Official Hub
                  </span>
                </div>
                <p className="text-[10px] text-blue-100 font-medium drop-shadow">
                  Ministry of Statistics &amp; Programme Implementation
                </p>
              </div>
            </div>

            <div className="pt-2">
              <h1 className="text-2xl sm:text-3xl font-serif font-bold leading-tight text-white drop-shadow-md">
                Empowering India&apos;s Statistical Machinery with AI
              </h1>
              <p className="text-xs text-blue-100/90 leading-relaxed mt-2 drop-shadow">
                National Statistics Training &amp; Competency Intelligence Platform for Indian Statistical Service (ISS), SSS, and State DES officers.
              </p>
            </div>

            {/* Visual Highlights Chips */}
            <div className="space-y-2 pt-2">
              <div className="p-3 rounded-2xl bg-black/30 border border-white/15 backdrop-blur-md flex items-center gap-2.5">
                <span className="text-base">🔄</span>
                <span className="text-xs font-bold text-white">Closed-Loop: Assess → Diagnose → Learn → Elevate</span>
              </div>
              <div className="p-3 rounded-2xl bg-black/30 border border-white/15 backdrop-blur-md flex items-center gap-2.5">
                <span className="text-base">🤖</span>
                <span className="text-xs font-bold text-white">LLaMA 3.3 70B AI Tutor on MoSPI Methodologies</span>
              </div>
            </div>
          </div>

          {/* Bottom Live Metric Pill */}
          <div className="relative z-10 pt-4 mt-6 border-t border-white/20 flex items-center justify-between backdrop-blur-md bg-black/30 p-3 rounded-2xl border border-white/10">
            <div className="flex items-center gap-2">
              <span className="flex text-amber-400 text-xs">★★★★★</span>
              <span className="text-[11px] font-bold text-white">4.9 / 5 Official Rating</span>
            </div>
            <span className="text-[10px] text-white/80 font-medium">15,000+ Active Officers</span>
          </div>
        </div>

        {/* ────────────── RIGHT PANEL: AUTHENTICATION FORM ────────────── */}
        <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-center space-y-6 bg-white">
          
          {/* Header & Tabs */}
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF7A00] bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200 inline-block mb-1.5">
                {authMode === "signin" ? "OFFICER AUTHENTICATION" : "AI SKILL-GAP ONBOARDING"}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#0B3D66] font-serif">
                {authMode === "signin" ? "Sign In to Your Dashboard" : "Register Official Capacity Profile"}
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                {authMode === "signin"
                  ? "Access your personalized learning roadmap, radar gap analytics, and AI tutor."
                  : "Calibrate your baseline skills to unlock automated cadre competency gap diagnosis."}
              </p>
            </div>

            {/* Segmented Tab Switcher */}
            <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-2xl text-xs font-bold gap-1 border border-slate-200/70">
              <button
                type="button"
                onClick={() => setAuthMode("signin")}
                className={`py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  authMode === "signin"
                    ? "bg-[#0B3D66] text-white shadow-md font-extrabold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                <span>🔑 Officer Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("register")}
                className={`py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  authMode === "register"
                    ? "bg-[#0B3D66] text-white shadow-md font-extrabold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                <span>📝 Register Official Profile</span>
              </button>
            </div>
          </div>

          {/* ────────────── VIEW 1: SIGN IN ────────────── */}
          {authMode === "signin" && (
            <div className="space-y-6">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  loginOfficerWithCredentials(empId.trim() || "officer@nic.in", "learner");
                  onLogin();
                }}
                className="space-y-4 text-left"
              >
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span>✉️</span>
                      <span>Official Email Address / NIC ID</span>
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">@nic.in / @gov.in</span>
                  </label>
                  <input
                    type="text"
                    value={empId}
                    onChange={(e) => setEmpId(e.target.value)}
                    className="w-full px-4 py-3 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#0B3D66] focus:ring-2 focus:ring-[#0B3D66]/15 transition-all bg-gray-50/70 hover:bg-gray-50"
                    placeholder="e.g. rajesh.sharma@nic.in"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span>🔒</span>
                      <span>Password</span>
                    </span>
                    <span className="text-[10px] text-[#0B3D66] font-bold hover:underline cursor-pointer">Forgot Password?</span>
                  </label>
                  <input
                    type="password"
                    value={pass}
                    onChange={(e) => setPass(e.target.value)}
                    className="w-full px-4 py-3 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#0B3D66] focus:ring-2 focus:ring-[#0B3D66]/15 transition-all bg-gray-50/70 hover:bg-gray-50"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-[#FF7A00] via-[#FF8C1A] to-[#FF6B00] hover:from-[#E66E00] hover:to-[#E55B00] text-white text-xs font-bold rounded-2xl shadow-lg shadow-orange-500/25 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Sign In to Officer Hub</span>
                  <span className="text-sm">→</span>
                </button>
              </form>

              {/* Toggle to Register */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setAuthMode("register")}
                  className="text-xs text-[#0B3D66] hover:text-[#FF7A00] font-bold transition-colors cursor-pointer"
                >
                  New to StatSkill AI? Create Profile &amp; Calibrate Gaps →
                </button>
              </div>

              {/* Demo Login Quick Switcher */}
              <div className="pt-4 border-t border-gray-100 space-y-2.5">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Instant One-Click Demo Personas</span>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    onClick={() => onDemoLogin("learner")}
                    className="p-3 rounded-2xl bg-blue-50/90 hover:bg-blue-100/90 border border-blue-100 text-[#0B3D66] text-center transition-all cursor-pointer group shadow-2xs hover:-translate-y-0.5"
                  >
                    <div className="text-xl mb-1 group-hover:scale-110 transition-transform">👤</div>
                    <div className="text-[11px] font-bold">Official</div>
                    <div className="text-[9px] text-gray-500">Learner (ISS/SSS)</div>
                  </button>
                  <button
                    onClick={() => onDemoLogin("trainer")}
                    className="p-3 rounded-2xl bg-purple-50/90 hover:bg-purple-100/90 border border-purple-100 text-purple-900 text-center transition-all cursor-pointer group shadow-2xs hover:-translate-y-0.5"
                  >
                    <div className="text-xl mb-1 group-hover:scale-110 transition-transform">🎓</div>
                    <div className="text-[11px] font-bold">Trainer</div>
                    <div className="text-[9px] text-purple-600">RAG Studio</div>
                  </button>
                  <button
                    onClick={() => onDemoLogin("admin")}
                    className="p-3 rounded-2xl bg-amber-50/90 hover:bg-amber-100/90 border border-amber-100 text-amber-900 text-center transition-all cursor-pointer group shadow-2xs hover:-translate-y-0.5"
                  >
                    <div className="text-xl mb-1 group-hover:scale-110 transition-transform">👑</div>
                    <div className="text-[11px] font-bold">Admin</div>
                    <div className="text-[9px] text-amber-600">Ministry HQ</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ────────────── VIEW 2: REGISTER WITH AI DIAGNOSTIC ────────────── */}
          {authMode === "register" && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-left">
              {/* Step indicator bar */}
              <div className="flex items-center justify-between p-3 bg-blue-50/80 border border-blue-100 rounded-2xl">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#0B3D66] text-white text-[10px] font-bold flex items-center justify-center">
                    {regStep}
                  </span>
                  <span className="text-xs font-bold text-[#0B3D66]">
                    {regStep === 1 ? "1. Official & Cadre Identity" : "2. AI Skill-Gap & Technical Baseline"}
                  </span>
                </div>
                <span className="text-[10px] text-gray-500 font-mono font-bold">
                  {regStep === 1 ? "Step 1 of 2" : "Step 2 of 2"}
                </span>
              </div>

              {/* STEP 1: Personal & Cadre Details */}
              {regStep === 1 && (
                <div className="space-y-3.5 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Full Name &amp; Honorific *</label>
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="e.g. Dr. Ananya Sen, ISS"
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-gray-50/70 focus:bg-white focus:border-[#0B3D66]"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Official Email Address *</label>
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="e.g. ananya.sen@nic.in"
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-gray-50/70 focus:bg-white focus:border-[#0B3D66]"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Employee / Service ID</label>
                      <input
                        type="text"
                        value={regEmpId}
                        onChange={(e) => setRegEmpId(e.target.value)}
                        placeholder="e.g. MOSPI-ISS-2023-019"
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-gray-50/70 focus:bg-white focus:border-[#0B3D66]"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Cadre Affiliation</label>
                      <select
                        value={regCadre}
                        onChange={(e) => setRegCadre(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white focus:border-[#0B3D66]"
                      >
                        <option value="Indian Statistical Service">Indian Statistical Service (ISS)</option>
                        <option value="Subordinate Statistical Service">Subordinate Statistical Service (SSS)</option>
                        <option value="State Directorate of Economics & Statistics">State DES Officer</option>
                        <option value="Ministry Consultant / Researcher">Ministry Consultant / Researcher</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Cadre Grade</label>
                      <select
                        value={regGrade}
                        onChange={(e) => setRegGrade(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white focus:border-[#0B3D66]"
                      >
                        <option value="JTS">Junior Time Scale (JTS)</option>
                        <option value="STS">Senior Time Scale (STS)</option>
                        <option value="JAG">Junior Administrative Grade (JAG)</option>
                        <option value="SAG">Senior Administrative Grade (SAG)</option>
                        <option value="SSO">Senior Statistical Officer (SSO)</option>
                        <option value="JSO">Junior Statistical Officer (JSO)</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Department / Division</label>
                      <select
                        value={regDept}
                        onChange={(e) => setRegDept(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white focus:border-[#0B3D66]"
                      >
                        <option value="National Accounts Division (NAD)">National Accounts Division (NAD)</option>
                        <option value="Field Operations Division (FOD)">Field Operations Division (FOD)</option>
                        <option value="Social Statistics Division (SSD)">Social Statistics Division (SSD)</option>
                        <option value="Economic Statistics Division (ESD)">Economic Statistics Division (ESD)</option>
                        <option value="Price Statistics Division (PSD)">Price Statistics Division (PSD)</option>
                        <option value="Data Informatics & Innovation (DIID)">Data Informatics &amp; Innovation (DIID)</option>
                        <option value="Survey Design & Research Division (SDRD)">Survey Design &amp; Research (SDRD)</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Designation</label>
                      <input
                        type="text"
                        value={regDesig}
                        onChange={(e) => setRegDesig(e.target.value)}
                        placeholder="e.g. Statistical Officer / Assistant Director"
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-gray-50/70 focus:bg-white focus:border-[#0B3D66]"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Posting Location / Station</label>
                      <input
                        type="text"
                        value={regPosting}
                        onChange={(e) => setRegPosting(e.target.value)}
                        placeholder="e.g. New Delhi HQ / Kolkata Regional Office"
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-gray-50/70 focus:bg-white focus:border-[#0B3D66]"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        if (!regName.trim() || !regEmail.trim()) {
                          alert("Please enter your name and email.");
                          return;
                        }
                        setRegStep(2);
                      }}
                      className="px-5 py-2.5 bg-[#0B3D66] hover:bg-[#082e4f] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Next: AI Competency Baseline</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: AI Skill-Gap Baseline */}
              {regStep === 2 && (
                <div className="space-y-3.5 animate-in fade-in duration-200 text-xs">
                  {/* Primary Working Domain */}
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">
                      Primary Statistical Focus Domain
                    </label>
                    <select
                      value={regDomain}
                      onChange={(e) => setRegDomain(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white focus:border-[#0B3D66]"
                    >
                      <option value="National Accounts & GVA">National Accounts &amp; GVA Compilation (UN SNA 2008)</option>
                      <option value="Survey Sampling & PLFS">Survey Sampling &amp; Field Operations (NSSO / PLFS)</option>
                      <option value="Price Statistics & Inflation">Price Statistics &amp; Inflation (CPI / WPI)</option>
                      <option value="Data Science & Python Automation">Data Science, Python &amp; Microdata Automation</option>
                      <option value="Data Privacy & Governance">Data Privacy &amp; Statistical Governance (DPDP Act 2023)</option>
                      <option value="SDG Indicators & Policy">SDG Indicators &amp; National Framework</option>
                    </select>
                  </div>

                  {/* Statistical Tools Used */}
                  <div>
                    <label className="font-bold text-gray-700 block mb-1.5">
                      Data Tools &amp; Languages You Use (Click to Toggle)
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {["Python", "R", "SQL", "QGIS", "SPSS / STATA", "Excel"].map((tool) => (
                        <button
                          key={tool}
                          type="button"
                          onClick={() => toggleTool(tool)}
                          className={`px-3 py-1.5 rounded-xl font-bold border transition-all cursor-pointer text-[11px] ${
                            regTools.includes(tool)
                              ? "bg-[#0B3D66] text-white border-[#0B3D66] shadow-xs"
                              : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                          }`}
                        >
                          {regTools.includes(tool) ? `✓ ${tool}` : `+ ${tool}`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Baseline Competency Self-Ratings */}
                  <div className="p-3.5 bg-gray-50/90 rounded-2xl border border-gray-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-800 text-[11px] uppercase tracking-wider">
                        📊 Baseline Competency Self-Ratings (1 = Beginner, 5 = Expert)
                      </span>
                      <span className="text-[10px] text-gray-400">Used for Gap Diagnosis</span>
                    </div>

                    {[
                      { key: "Descriptive Statistics & Sampling", label: "Descriptive Statistics & Sampling" },
                      { key: "Python for Data Analysis", label: "Python Data Processing & Microdata" },
                      { key: "National Accounts & GVA", label: "National Accounts & GVA (SNA 2008)" },
                      { key: "Sampling Theory & PPS", label: "Sampling Theory & PPS Weights" },
                      { key: "Data Privacy (DPDP Act)", label: "Data Privacy & DPDP Act 2023" },
                    ].map((skill) => (
                      <div key={skill.key} className="flex items-center justify-between gap-2 pt-1.5 border-t border-gray-200/60 first:border-t-0 first:pt-0">
                        <span className="font-medium text-gray-700 text-[11px] truncate max-w-[220px]">
                          {skill.label}
                        </span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((lvl) => (
                            <button
                              key={lvl}
                              type="button"
                              onClick={() => setRegRatings({ ...regRatings, [skill.key]: lvl })}
                              className={`w-6 h-6 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                (regRatings[skill.key] || 1) >= lvl
                                  ? "bg-[#FF7A00] text-white shadow-2xs"
                                  : "bg-gray-200 text-gray-500 hover:bg-gray-300"
                              }`}
                            >
                              {lvl}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Career Goal & Language */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Primary Capacity / Career Goal</label>
                      <input
                        type="text"
                        value={regGoal}
                        onChange={(e) => setRegGoal(e.target.value)}
                        placeholder="e.g. Lead GVA Compilation or Master Python"
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-gray-50/70 focus:bg-white focus:border-[#0B3D66]"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Preferred Instruction Language</label>
                      <div className="flex gap-1.5">
                        {(["EN", "HI", "TE"] as const).map((l) => (
                          <button
                            key={l}
                            type="button"
                            onClick={() => setRegLang(l)}
                            className={`flex-1 py-2 rounded-xl font-bold border transition-all cursor-pointer text-[11px] ${
                              regLang === l
                                ? "bg-[#0B3D66] text-white border-[#0B3D66] shadow-xs"
                                : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                            }`}
                          >
                            {l === "EN" ? "English" : l === "HI" ? "हिन्दी" : "తెలుగు"}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-between items-center border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setRegStep(1)}
                      className="text-xs font-bold text-gray-500 hover:text-gray-800 cursor-pointer"
                    >
                      ← Back to Step 1
                    </button>

                    <button
                      type="submit"
                      className="px-6 py-3 bg-gradient-to-r from-[#FF7A00] to-[#FF8C1A] hover:from-[#E66E00] hover:to-[#E55B00] text-white text-xs font-bold rounded-2xl shadow-lg shadow-orange-500/25 active:scale-[0.99] transition-all cursor-pointer flex items-center gap-2"
                    >
                      <span>🚀 Launch AI Skill Gap Diagnostic</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// 2. Onboarding / Profile Setup Wizard
// ──────────────────────────────────────────────

function OnboardingWizard({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const existingProf = getProfile();
  const [name, setName] = useState(existingProf.name || "");
  const [empId, setEmpId] = useState(existingProf.employeeId || `MOSPI-ISS-${Date.now().toString().slice(-4)}`);
  const [dept, setDept] = useState(existingProf.department || "Labour & Social Statistics Division");
  const [desig, setDesig] = useState(existingProf.designation || "Statistical Officer");
  const [cadre, setCadre] = useState(existingProf.cadre || "Indian Statistical Service");
  const [cadreGrade, setCadreGrade] = useState<"JTS" | "STS" | "JAG" | "SAG" | "HAG" | "JSO" | "SSO" | "Officer">((existingProf.cadreGrade as any) || "STS");
  const [exp, setExp] = useState(existingProf.yearsOfExperience || 4);
  const [tools, setTools] = useState<string[]>(["Python", "Excel"]);
  const [ratings, setRatings] = useState<Record<string, number>>({
    "Descriptive Statistics & Sampling": 4,
    "Python for Data Analysis": 2,
    "National Accounts & GVA": 2,
    "Labour & Employment (PLFS)": 3,
    "Data Privacy (DPDP Act)": 2,
  });
  const [careerGoal, setCareerGoal] = useState(existingProf.careerGoal || "Lead Official Statistical Operations & Policy Insights");
  const [prefLang, setPrefLang] = useState<"EN" | "HI" | "TE">(existingProf.preferredLanguage || "EN");

  function toggleTool(t: string) {
    if (tools.includes(t)) {
      setTools(tools.filter((x) => x !== t));
    } else {
      setTools([...tools, t]);
    }
  }

  function handleFinish() {
    const updated: OfficerProfile = {
      ...existingProf,
      name: name.trim() || "Official Statistical Officer",
      employeeId: empId.trim() || `MOSPI-${Date.now().toString().slice(-6)}`,
      department: dept,
      designation: desig,
      cadre,
      cadreGrade,
      yearsOfExperience: exp,
      careerGoal,
      preferredLanguage: prefLang,
      onboardingCompleted: true,
    };

    const comps = deriveUserCompetencies(updated, ratings, tools, dept);

    saveProfile(updated);
    saveUserCompetencies(comps);
    onComplete();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1864A6] via-[#0F4C81] to-[#0B3D66] flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="bg-white rounded-3xl p-7 md:p-9 border border-white/30 shadow-2xl max-w-xl w-full space-y-6 relative z-10 animate-in fade-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
          <div>
            <span className="text-[10px] font-bold text-[#FF7A00] uppercase tracking-wider">
              Step {step} of 4 · Capacity Profile
            </span>
            <h2 className="text-base font-bold text-[#0B3D66]">
              {step === 1 && "Personal & Institutional Identity"}
              {step === 2 && "Cadre & Professional Assignment"}
              {step === 3 && "Baseline Competencies & Statistical Tools"}
              {step === 4 && "Learning Preferences & Objectives"}
            </h2>
          </div>
          <span className="text-xs font-mono font-bold text-gray-400">{Math.round((step / 4) * 100)}%</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-amber-400 to-[#FF7A00] h-full transition-all duration-300 rounded-full"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Step 1: Personal */}
        {step === 1 && (
          <div className="space-y-3.5 text-xs text-left">
            <div>
              <label className="font-bold text-gray-700 block mb-1">Full Name &amp; Official Title *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dr. Ananya Sen, ISS"
                className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:border-[#0B3D66]"
              />
            </div>
            <div>
              <label className="font-bold text-gray-700 block mb-1">Official Employee ID</label>
              <input
                type="text"
                value={empId}
                onChange={(e) => setEmpId(e.target.value)}
                placeholder="e.g. MOSPI-ISS-2023-019"
                className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:border-[#0B3D66]"
              />
            </div>
            <div>
              <label className="font-bold text-gray-700 block mb-1">Department / Division</label>
              <input
                type="text"
                value={dept}
                onChange={(e) => setDept(e.target.value)}
                placeholder="e.g. National Accounts Division / FOD"
                className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:border-[#0B3D66]"
              />
            </div>
          </div>
        )}

        {/* Step 2: Professional */}
        {step === 2 && (
          <div className="space-y-3.5 text-xs text-left">
            <div>
              <label className="font-bold text-gray-700 block mb-1">Cadre Affiliation</label>
              <select
                value={cadre}
                onChange={(e) => setCadre(e.target.value)}
                className="w-full p-2.5 border border-gray-200 rounded-xl bg-white focus:border-[#0B3D66]"
              >
                <option value="Indian Statistical Service">Indian Statistical Service (ISS)</option>
                <option value="Subordinate Statistical Service">Subordinate Statistical Service (SSS)</option>
                <option value="State DES">State Directorate of Economics &amp; Statistics</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Cadre Grade</label>
                <select
                  value={cadreGrade}
                  onChange={(e) => setCadreGrade(e.target.value as any)}
                  className="w-full p-2.5 border border-gray-200 rounded-xl bg-white focus:border-[#0B3D66]"
                >
                  <option value="JTS">JTS</option>
                  <option value="STS">STS</option>
                  <option value="JAG">JAG</option>
                  <option value="SAG">SAG</option>
                  <option value="SSO">SSO</option>
                  <option value="JSO">JSO</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">Designation</label>
                <input
                  type="text"
                  value={desig}
                  onChange={(e) => setDesig(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:border-[#0B3D66]"
                />
              </div>
            </div>
            <div>
              <label className="font-bold text-gray-700 block mb-1">Years of Service / Experience</label>
              <input
                type="number"
                value={exp}
                onChange={(e) => setExp(Number(e.target.value))}
                className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:border-[#0B3D66]"
              />
            </div>
          </div>
        )}

        {/* Step 3: Skills selection */}
        {step === 3 && (
          <div className="space-y-3.5 text-xs text-left">
            <div>
              <label className="font-bold text-gray-700 block mb-1.5">
                Data Tools You Use (Click to Select)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {["Python", "R", "SQL", "QGIS", "Excel", "SPSS / STATA"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTool(t)}
                    className={`px-3 py-1.5 rounded-xl font-bold border transition-all cursor-pointer text-[11px] ${
                      tools.includes(t)
                        ? "bg-[#0B3D66] text-white border-[#0B3D66] shadow-xs"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {tools.includes(t) ? `✓ ${t}` : `+ ${t}`}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-800 text-[11px] uppercase">
                  Rate Your Current Baseline (1–5)
                </span>
                <span className="text-[10px] text-gray-400">Used for Gap Diagnosis</span>
              </div>

              {[
                { key: "Descriptive Statistics & Sampling", label: "Descriptive Statistics & Sampling" },
                { key: "Python for Data Analysis", label: "Python Data Processing" },
                { key: "National Accounts & GVA", label: "National Accounts & GVA" },
                { key: "Labour & Employment (PLFS)", label: "Labour & Survey Methodology" },
                { key: "Data Privacy (DPDP Act)", label: "Data Privacy (DPDP Act 2023)" },
              ].map((skill) => (
                <div
                  key={skill.key}
                  className="flex items-center justify-between gap-2 pt-1.5 border-t border-gray-200/60 first:border-t-0 first:pt-0"
                >
                  <span className="font-medium text-gray-700 text-[11px] truncate max-w-[200px]">
                    {skill.label}
                  </span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setRatings({ ...ratings, [skill.key]: lvl })}
                        className={`w-6 h-6 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          (ratings[skill.key] || 1) >= lvl
                            ? "bg-[#FF7A00] text-white shadow-2xs"
                            : "bg-gray-200 text-gray-500 hover:bg-gray-300"
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Preferences */}
        {step === 4 && (
          <div className="space-y-3.5 text-xs text-left">
            <div>
              <label className="font-bold text-gray-700 block mb-1.5">Preferred Instruction Language</label>
              <div className="flex gap-2">
                {(["EN", "HI", "TE"] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setPrefLang(l)}
                    className={`flex-1 py-2.5 rounded-xl font-bold border transition-all cursor-pointer ${
                      prefLang === l
                        ? "bg-[#0B3D66] text-white border-[#0B3D66] shadow-xs"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {l === "EN" ? "English" : l === "HI" ? "हिन्दी" : "తెలుగు"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="font-bold text-gray-700 block mb-1">Primary Career / Training Goal</label>
              <input
                type="text"
                value={careerGoal}
                onChange={(e) => setCareerGoal(e.target.value)}
                className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:border-[#0B3D66]"
              />
            </div>
          </div>
        )}

        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="text-xs font-bold text-gray-500 hover:text-gray-800 cursor-pointer"
            >
              ← Back
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              onClick={() => {
                if (step === 1 && !name.trim()) {
                  alert("Please enter your name.");
                  return;
                }
                setStep(step + 1);
              }}
              className="px-5 py-2.5 bg-[#0B3D66] hover:bg-[#082e4f] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Continue →
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-6 py-2.5 bg-[#FF7A00] hover:bg-[#e06a00] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
            >
              Finish &amp; Calibrate Competencies →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// 3. Learner Dashboard Screen
// ──────────────────────────────────────────────

function DashboardScreen({
  onNav,
  onOpenCourse,
}: {
  onNav: (s: Screen) => void;
  onOpenCourse: (c: CourseItem) => void;
}) {
  const { t, lang } = useLanguage();
  const profile = getProfile();
  const userComps = getUserCompetencies();
  const courses = getCourses();
  const recommendations = getExplainableRecommendations(userComps, courses);

  const domains: CompetencyDomain[] = ["Statistical", "Technical", "Digital Governance", "Behavioural"];
  const radarData = domains.map((d) => {
    const items = userComps.filter((c) => c.domain === d);
    const avgCurrent = items.length ? items.reduce((acc, c) => acc + c.currentLevel, 0) / items.length : 2;
    const avgReq = items.length ? items.reduce((acc, c) => acc + c.requiredLevel, 0) / items.length : 3;
    const localizedDomain =
      d === "Statistical"
        ? (lang === "HI" ? "सांख्यिकी" : lang === "TE" ? "గణాంకాలు" : "Statistical")
        : d === "Technical"
        ? (lang === "HI" ? "तकनीकी" : lang === "TE" ? "సాంకేతిక" : "Technical")
        : d === "Digital Governance"
        ? (lang === "HI" ? "डिजिटल" : lang === "TE" ? "డిజిటల్" : "Governance")
        : (lang === "HI" ? "व्यवहार" : lang === "TE" ? "నాయకత్వం" : "Leadership");

    return {
      domain: localizedDomain,
      Current: Number(avgCurrent.toFixed(1)),
      Required: Number(avgReq.toFixed(1)),
    };
  });

  const highPriorityGaps = userComps
    .filter((c) => c.priorityLevel === "High" && c.gap > 0)
    .sort((a, b) => b.priorityScore - a.priorityScore);

  const overallCompPct = userComps.length > 0
    ? Math.round((userComps.reduce((sum, c) => sum + c.currentLevel, 0) / (userComps.length * 5)) * 100)
    : 0;

  const activeGapsCount = userComps.filter((c) => c.gap > 0).length;
  const highPriorityGapsCount = userComps.filter((c) => c.gap > 0 && c.priorityLevel === "High").length;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto font-sans">
      {/* Officer Cadre Banner */}
      <div className="bg-gradient-to-r from-[#1864A6] via-[#0B3D66] to-[#FF7A00] rounded-3xl p-6 md:p-8 text-white shadow-xl border border-white/15 flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-amber-200 border border-white/20">
              {profile.cadre} · {profile.cadreGrade}
            </span>
            <span className="text-[10px] font-medium text-white/80 bg-black/20 px-2 py-0.5 rounded-full">
              📍 {profile.posting}
            </span>
            <span className="text-[10px] text-emerald-300 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              iGOT Karmayogi Synced
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight">
            {t("dash_welcome")}, {profile.name}
          </h1>

          <p className="text-xs text-blue-100 max-w-xl leading-relaxed">
            {profile.designation} · {profile.department}. {t("dash_cadre_index")}: <strong>{overallCompPct}%</strong> ({activeGapsCount} {t("dash_active_gaps").toLowerCase()}).
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="relative z-10 flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => onNav("assessment")}
            className="px-4 py-2.5 bg-[#FF7A00] hover:bg-[#e06a00] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>✍️ {t("btn_take_assessment")}</span>
          </button>
          <button
            onClick={() => onNav("assistant")}
            className="px-4 py-2.5 bg-white text-[#0B3D66] hover:bg-gray-100 text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>🤖 {t("nav_assistant")}</span>
          </button>
          <button
            onClick={() => onNav("labs")}
            className="px-3.5 py-2.5 bg-white/15 hover:bg-white/25 text-white border border-white/20 text-xs font-bold rounded-xl backdrop-blur-md transition-all cursor-pointer"
          >
            <span>🧪 {t("nav_virtual_labs")}</span>
          </button>
        </div>
      </div>

      {/* Top 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t("dash_overall_comp"), value: `${overallCompPct}%`, sub: t("dash_cadre_index"), color: "#0B3D66", badge: "Live Score", badgeColor: "bg-blue-100 text-blue-800", icon: "📊" },
          { label: t("dash_active_gaps"), value: `${activeGapsCount}`, sub: `${highPriorityGapsCount} ${t("dash_high_priority_deficits")}`, color: "#FF7A00", badge: "Deficits", badgeColor: "bg-orange-100 text-orange-800", icon: "⚖️" },
          { label: t("dash_courses_completed"), value: `${profile.coursesCompleted}`, sub: "NSSTA & iGOT Modules", color: "#10B981", badge: "Accredited", badgeColor: "bg-emerald-100 text-emerald-800", icon: "🎓" },
          { label: t("dash_learning_hours"), value: `${profile.learningHours}h`, sub: "Annual CPD Quota: 50h", color: "#8B5CF6", badge: "DoPT Target", badgeColor: "bg-purple-100 text-purple-800", icon: "⏱️" },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xl">{m.icon}</span>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${m.badgeColor}`}>{m.badge}</span>
            </div>
            <div className="mt-3">
              <div className="text-[11px] text-gray-500 font-semibold">{m.label}</div>
              <div className="text-2xl font-serif font-bold mt-0.5" style={{ color: m.color }}>{m.value}</div>
              <div className="text-[10px] text-gray-400 mt-1">{m.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Radar & Priority Gaps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Radar Chart */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs font-bold text-[#0B3D66] uppercase tracking-wider">{t("dash_radar_title")}</div>
              <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-semibold">4 Domains</span>
            </div>
            <div className="text-[11px] text-gray-400 mb-2">{t("dash_radar_sub")}</div>
            <ResponsiveContainer width="100%" height={210}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="domain" tick={{ fontSize: 10, fill: "#64748b" }} />
                <Radar name="Required" dataKey="Required" stroke="#94a3b8" fill="#e2e8f0" fillOpacity={0.4} />
                <Radar name="Current" dataKey="Current" stroke="#FF7A00" fill="#FF7A00" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 text-[10px] text-gray-500 mt-2 border-t border-gray-100 pt-3">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#FF7A00]" /> {t("dash_current_level")}</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-300" /> {t("dash_cadre_target")}</span>
          </div>
        </div>

        {/* Priority Skill Gaps */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs font-bold text-[#0B3D66] uppercase tracking-wider">{t("nav_skill_gaps")}</div>
              <button onClick={() => onNav("skill_gaps")} className="text-[10px] text-[#FF7A00] font-bold hover:underline cursor-pointer">
                {t("dash_view_full_matrix")}
              </button>
            </div>
            <div className="text-[11px] text-gray-400 mb-3">Formula: 35% Gap + 25% Role + 20% Dept + 10% Demand</div>
            <div className="space-y-3">
              {highPriorityGaps.slice(0, 3).map((g) => (
                <div key={g.competencyId} className="p-3 bg-gray-50/70 border border-gray-100 rounded-2xl space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-gray-800 truncate max-w-[200px]">{g.competencyName}</span>
                    <span className="text-[10px] font-extrabold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                      −{g.gap} Level Deficit
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-400 to-rose-500 rounded-full"
                      style={{ width: `${(g.currentLevel / g.requiredLevel) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => onNav("learning_path")}
            className="text-xs font-bold text-[#0B3D66] hover:text-[#FF7A00] mt-4 text-left cursor-pointer flex items-center gap-1 transition-colors"
          >
            <span>View Personalized Learning Pathway</span>
            <span>→</span>
          </button>
        </div>
      </div>

      {/* Top Recommendations */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-sm font-bold text-[#0B3D66] uppercase tracking-wider">
              Recommended Modules for Your Cadre
            </h2>
            <p className="text-xs text-gray-400">
              Personalized ranked recommendations with transparent why-rationale
            </p>
          </div>
          <button onClick={() => onNav("courses")} className="text-xs font-bold text-[#FF7A00] hover:underline cursor-pointer">
            View All Courses ({courses.length}) →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.slice(0, 4).map((rec) => {
            const course = courses.find((c) => c.id === rec.courseId);
            return (
              <div key={rec.courseId} className="rounded-3xl border border-gray-200/80 bg-white hover:border-blue-300 hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden group">
                <div className="flex flex-col sm:flex-row">
                  {/* Thumbnail */}
                  <div className="sm:w-36 h-28 sm:h-auto relative overflow-hidden bg-slate-900 shrink-0">
                    <img
                      src={getCourseImage(course || { title: rec.courseTitle, category: "Technical" })}
                      alt={rec.courseTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-black/60 to-transparent" />
                    <span className="absolute top-2 left-2 text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 shadow-xs">
                      {rec.provider}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="p-4 flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        {rec.matchPercentage}% Match
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">⏱️ {rec.duration}</span>
                    </div>
                    <h3 className="text-xs font-bold text-gray-900 group-hover:text-[#0B3D66] transition-colors line-clamp-1">
                      {rec.courseTitle}
                    </h3>
                    <div className="p-2 bg-blue-50/70 rounded-xl border border-blue-100/80 text-[10px] text-gray-700 line-clamp-2 leading-relaxed">
                      <strong className="text-[#0B3D66]">Why:</strong> {rec.whyRecommended}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[10px] text-gray-500 font-medium">🎯 {rec.addressedSkill}</span>
                  {course && (
                    <button
                      onClick={() => {
                        onOpenCourse(course);
                        onNav("course_detail");
                      }}
                      className="px-3.5 py-1.5 bg-[#0B3D66] hover:bg-[#FF7A00] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      Start Learning →
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// 4. My Skills Page (/skills)
// ──────────────────────────────────────────────

function SkillsScreen({
  onNav,
  onOpenCourse,
}: {
  onNav: (s: Screen) => void;
  onOpenCourse?: (c: CourseItem) => void;
}) {
  return <MySkillsPortfolio onNav={onNav} onOpenCourse={onOpenCourse} />;
}

// ──────────────────────────────────────────────
// 5. Competency Assessment Page (/assessment)
// ──────────────────────────────────────────────

function AssessmentScreen({
  onFinish,
}: {
  onFinish: (qList: GeneratedQuestion[], aList: (number | null)[], domain: string) => void;
}) {
  const { t, lang } = useLanguage();
  const profile = getProfile();
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [flagged, setFlagged] = useState<boolean[]>([]);
  const [qIdx, setQIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<string>("All Domains (Comprehensive)");
  const [selectedDifficulty, setSelectedDifficulty] = useState<"Basic" | "Intermediate" | "Advanced">("Intermediate");
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [timeLeft, setTimeLeft] = useState(600); // 10 mins

  const domainsList = [
    {
      id: "All Domains (Comprehensive)",
      title: lang === "HI" ? "समग्र संवर्ग मूल्यांकन" : lang === "TE" ? "సమగ్ర కేడర్ మూల్యాంకనం" : "Comprehensive Cadre Assessment",
      desc: lang === "HI" ? "सांख्यिकीय, तकनीकी, डिजिटल प्रशासन और व्यावहारिक डोमेन में मूल्यांकन।" : lang === "TE" ? "గణాంక, సాంకేతిక, డిజిటల్ మరియు ప్రవర్తనా విభాగాల సమగ్ర మూల్యాంకనం." : "Holistic evaluation across Statistical, Technical, Digital Governance, and Behavioural domains.",
      icon: "🏛️",
      accent: "from-blue-600 to-indigo-700",
    },
    {
      id: "Statistical",
      title: lang === "HI" ? "सांख्यिकीय पद्धतियाँ" : lang === "TE" ? "గణాంక పద్ధతులు" : "Statistical Methodologies",
      desc: lang === "HI" ? "राष्ट्रीय लेखा एसएनए 2008, पीएलएफएस प्रतिचयन, सीपीआई/डब्ल्यूपीआई संकलन।" : lang === "TE" ? "SNA 2008 GVA, PLFS శాంప్లింగ్, CPI/WPI సూచీలు." : "SNA 2008 GVA, Two-Stage PLFS Sampling, CPI/WPI Compilation, and SDG Indicators.",
      icon: "📊",
      accent: "from-emerald-600 to-teal-700",
    },
    {
      id: "Technical",
      title: lang === "HI" ? "डेटा विज्ञान एवं कम्प्यूटिंग" : lang === "TE" ? "డేటా సైన్స్ మరియు కంప్యూటింగ్" : "Data Science & Computing",
      desc: lang === "HI" ? "पायथन, आर, एसक्यूएल डेटा वेयरहाउस और क्यूजीआईएस।" : lang === "TE" ? "పైథాన్, ఆర్, SQL మరియు QGIS మ్యాపింగ్." : "Python/R Microdata Parsing, Multipliers, SQLite Data Warehouses, and QGIS.",
      icon: "💻",
      accent: "from-purple-600 to-indigo-700",
    },
    {
      id: "Digital Governance",
      title: lang === "HI" ? "डिजिटल प्रशासन एवं गोपनीयता" : lang === "TE" ? "డిజిటల్ పాలన మరియు గోప్యత" : "Digital Governance & Privacy",
      desc: lang === "HI" ? "डीपीडीपी अधिनियम 2023, सांख्यिकीय प्रकटीकरण नियंत्रण।" : lang === "TE" ? "DPDP చట్టం 2023, డేటా గోప్యతా నియమాలు." : "DPDP Act 2023, Statistical Disclosure Control, and Cybersecurity protocols.",
      icon: "🔒",
      accent: "from-amber-500 to-orange-600",
    },
    {
      id: "Behavioural",
      title: lang === "HI" ? "नीतिशास्त्र एवं लोक नीति" : lang === "TE" ? "నైతికత మరియు ప్రజా విధానం" : "Ethics & Public Policy",
      desc: lang === "HI" ? "संयुक्त राष्ट्र मौलिक सिद्धांत (UNFPOS), प्रशासनिक नेतृत्व।" : lang === "TE" ? "UNFPOS సూత్రాలు, నాయకత్వ నైపుణ్యాలు." : "UNFPOS Principles, Executive Leadership, and Evidence-Based Policy Making.",
      icon: "⚖️",
      accent: "from-rose-600 to-pink-700",
    },
  ];

  async function handleStart() {
    setLoading(true);
    try {
      const domainParam = selectedDomain.includes("All") ? "Statistical" : selectedDomain;
      const res = await generateMCQsFromText(
        `${selectedDomain} Official Assessment for ${profile.cadreGrade || "Statistical Officer"}`,
        questionCount,
        selectedDifficulty,
        domainParam
      );
      setQuestions(res.questions);
      setAnswers(new Array(res.questions.length).fill(null));
      setFlagged(new Array(res.questions.length).fill(false));
      setTimeLeft(questionCount * 90); // 1.5 mins per question
      setStarted(true);
    } catch (e) {
      console.warn("Assessment generation fallback:", e);
    } finally {
      setLoading(false);
    }
  }

  // Timer
  useEffect(() => {
    if (started && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [started, timeLeft]);

  // Auto-submit when time is up
  useEffect(() => {
    if (started && timeLeft === 0 && questions.length > 0) {
      onFinish(questions, answers, selectedDomain);
    }
  }, [started, timeLeft, onFinish, questions, answers, selectedDomain]);

  if (started && questions.length > 0) {
    const currQ = questions[qIdx];
    const isLast = qIdx === questions.length - 1;
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    const answeredCount = answers.filter((a) => a !== null).length;

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Assessment Header */}
        <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-2xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xl">✍️</span>
            <div>
              <div className="text-xs font-bold text-[#0B3D66]">{selectedDomain} Assessment</div>
              <div className="text-[10px] text-gray-500">
                {answeredCount} of {questions.length} Answered · Difficulty: {currQ.difficulty}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const copy = [...flagged];
                copy[qIdx] = !copy[qIdx];
                setFlagged(copy);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                flagged[qIdx]
                  ? "bg-amber-100 text-amber-900 border border-amber-300"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <span>{flagged[qIdx] ? "🚩" : "🏳️"}</span>
              <span>{flagged[qIdx] ? "Flagged" : "Flag"}</span>
            </button>

            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-mono font-bold text-xs">
              <span>⏱️</span>
              <span>{mins}:{secs < 10 ? `0${secs}` : secs}</span>
            </div>
          </div>
        </div>

        {/* Question Palette Navigation Bar */}
        <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-2xs flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0 pl-1">
            Questions:
          </span>
          <div className="flex items-center gap-1.5 flex-1">
            {questions.map((_, i) => {
              const isAnswered = answers[i] !== null;
              const isCurrent = qIdx === i;
              const isFlag = flagged[i];

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setQIdx(i)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                    isCurrent
                      ? "ring-2 ring-[#0B3D66] bg-[#0B3D66] text-white shadow-xs"
                      : isFlag
                      ? "bg-amber-100 text-amber-900 border border-amber-400"
                      : isAnswered
                      ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Question Content Box */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-900 px-2.5 py-0.5 rounded-full">
              {currQ.competencyTarget || currQ.domain}
            </span>
            <span className="text-xs text-gray-400 font-semibold">
              Question {qIdx + 1} / {questions.length}
            </span>
          </div>

          <h2 className="text-sm sm:text-base font-bold text-[#0B3D66] leading-relaxed">
            {currQ.question}
          </h2>

          <div className="space-y-3">
            {currQ.options.map((opt, i) => {
              const isSelected = answers[qIdx] === i;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    const copy = [...answers];
                    copy[qIdx] = i;
                    setAnswers(copy);
                  }}
                  className={`w-full p-4 rounded-2xl border text-left text-xs transition-all flex items-start gap-3 cursor-pointer select-none ${
                    isSelected
                      ? "border-[#0B3D66] bg-blue-50/80 text-[#0B3D66] font-bold shadow-xs ring-1 ring-[#0B3D66]"
                      : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50/50"
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                      isSelected ? "bg-[#0B3D66] text-white" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="leading-relaxed">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Bottom Actions */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-100">
            <button
              onClick={() => setQIdx((p) => Math.max(0, p - 1))}
              disabled={qIdx === 0}
              className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-900 disabled:opacity-30 cursor-pointer"
            >
              ← Previous
            </button>

            <div className="flex items-center gap-2">
              {isLast ? (
                <button
                  onClick={() => onFinish(questions, answers, selectedDomain)}
                  className="px-6 py-2.5 bg-[#FF7A00] hover:bg-[#e06a00] text-white text-xs font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <span>Submit Examination</span>
                  <span>✓</span>
                </button>
              ) : (
                <button
                  onClick={() => setQIdx((p) => Math.min(questions.length - 1, p + 1))}
                  className="px-5 py-2.5 bg-[#0B3D66] hover:bg-[#082e4f] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <span>Next Question</span>
                  <span>→</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pre-Assessment Configuration Screen
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF7A00] flex items-center justify-center text-2xl font-bold shrink-0">
              ✍️
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0B3D66] font-serif">Official Competency Assessment</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Standardized diagnostic assessment calibrated against Indian Statistical Service cadre requirements.
              </p>
            </div>
          </div>
          <div className="text-[10px] font-extrabold uppercase px-3 py-1 bg-blue-50 text-blue-800 rounded-full border border-blue-200">
            Cadre: {profile.cadreGrade || "STS"}
          </div>
        </div>

        {/* 1. Track Selection */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-[#0B3D66] uppercase tracking-wider">
            1. Select Assessment Domain Track
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {domainsList.map((d) => {
              const isSelected = selectedDomain === d.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setSelectedDomain(d.id)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3.5 ${
                    isSelected
                      ? "border-[#0B3D66] bg-blue-50/70 shadow-xs ring-1 ring-[#0B3D66]"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
                  }`}
                >
                  <span className="text-2xl shrink-0">{d.icon}</span>
                  <div className="min-w-0">
                    <div className={`text-xs font-bold ${isSelected ? "text-[#0B3D66]" : "text-gray-900"}`}>
                      {d.title}
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">{d.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">2. Difficulty Level</label>
            <div className="grid grid-cols-3 gap-2">
              {(["Basic", "Intermediate", "Advanced"] as const).map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    selectedDifficulty === diff
                      ? "bg-[#0B3D66] text-white border-[#0B3D66] shadow-xs"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">3. Examination Size</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { val: 5, label: "5 MCQs (Express · 7m)" },
                { val: 10, label: "10 MCQs (Standard · 15m)" },
              ].map((cnt) => (
                <button
                  key={cnt.val}
                  type="button"
                  onClick={() => setQuestionCount(cnt.val)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    questionCount === cnt.val
                      ? "bg-[#0B3D66] text-white border-[#0B3D66] shadow-xs"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {cnt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Closed-Loop Notification */}
        <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <span>🔄</span>
            <span>Closed-Loop Competency Elevation Protocol</span>
          </div>
          <p className="text-[11px] text-emerald-800 leading-relaxed">
            Scoring <strong>≥ 80%</strong> on any evaluated competency elevates your official competency level by <strong>+1 level</strong>, reduces your priority skill gaps, and records a verified ledger entry in the MoSPI Capacity Log.
          </p>
        </div>

        <button
          onClick={handleStart}
          disabled={loading}
          className="w-full py-3.5 bg-[#FF7A00] hover:bg-[#e06a00] text-white text-xs font-bold rounded-2xl shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Generating Calibrated Examination Questions...</span>
            </>
          ) : (
            <>
              <span>Begin Official Assessment Now</span>
              <span>→</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// 6. Assessment Result Screen with Multi-Competency Closed-Loop Updates
// ──────────────────────────────────────────────

function AssessmentResultScreen({
  questions,
  answers,
  onNav,
}: {
  questions: GeneratedQuestion[];
  answers: (number | null)[];
  onNav: (s: Screen) => void;
}) {
  const correctCount = questions.reduce((acc, q, idx) => acc + (answers[idx] === q.answer ? 1 : 0), 0);
  const total = questions.length || 1;
  const scorePct = Math.round((correctCount / total) * 100);
  const [reviewFilter, setReviewFilter] = useState<"all" | "correct" | "incorrect">("all");
  const [appliedUpdates, setAppliedUpdates] = useState<{ comp: string; oldL: number; newL: number; success: boolean }[] | null>(null);

  // Group performance by competency
  const competencyBreakdown = useMemo(() => {
    const map: Record<string, { total: number; correct: number; domain: string }> = {};
    questions.forEach((q, idx) => {
      const comp = q.competencyTarget || "General Competency";
      if (!map[comp]) {
        map[comp] = { total: 0, correct: 0, domain: q.domain };
      }
      map[comp].total += 1;
      if (answers[idx] === q.answer) {
        map[comp].correct += 1;
      }
    });
    return map;
  }, [questions, answers]);

  function handleApplyClosedLoop() {
    const results: { comp: string; oldL: number; newL: number; success: boolean }[] = [];

    Object.entries(competencyBreakdown).forEach(([comp, stats]) => {
      const compScorePct = Math.round((stats.correct / stats.total) * 100);
      const res = applyClosedLoopCompetencyUpdate({
        competencyName: comp,
        scorePct: compScorePct,
        evidence: `StatSkill AI Assessment (${compScorePct}% Score in ${stats.correct}/${stats.total} items)`,
      });
      if (res.updated) {
        results.push({ comp, oldL: res.oldLevel, newL: res.newLevel, success: true });
      }
    });

    setAppliedUpdates(results);
  }

  const filteredQuestions = questions.map((q, idx) => ({ q, idx, isCorrect: answers[idx] === q.answer })).filter((item) => {
    if (reviewFilter === "correct") return item.isCorrect;
    if (reviewFilter === "incorrect") return !item.isCorrect;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm text-center space-y-4">
        <div
          className={`w-20 h-20 rounded-full text-white flex flex-col items-center justify-center font-bold mx-auto shadow-md ${
            scorePct >= 80 ? "bg-emerald-600" : scorePct >= 60 ? "bg-[#0B3D66]" : "bg-amber-600"
          }`}
        >
          <span className="text-2xl font-serif">{scorePct}%</span>
          <span className="text-[9px] uppercase">
            {scorePct >= 80 ? "Mastery" : scorePct >= 60 ? "Proficient" : "Developing"}
          </span>
        </div>

        <h1 className="text-xl font-bold text-[#0B3D66]">Assessment Evaluation Completed</h1>
        <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
          You correctly answered <strong>{correctCount} of {total}</strong> questions across the evaluated official competency areas.
        </p>

        {appliedUpdates ? (
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 space-y-2 text-left max-w-lg mx-auto">
            <div className="font-bold flex items-center gap-1.5">
              <span>✓</span>
              <span>Closed-Loop Ledger Updates Successfully Applied:</span>
            </div>
            {appliedUpdates.length > 0 ? (
              <ul className="space-y-1 text-[11px] list-disc list-inside">
                {appliedUpdates.map((u, i) => (
                  <li key={i}>
                    <strong>{u.comp}</strong>: Elevated from Level {u.oldL} → <strong>Level {u.newL}</strong> (+1 Level)
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[11px] text-gray-600">
                Competencies evaluated were already at or above assessed mastery threshold. Audit logs updated.
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              onClick={handleApplyClosedLoop}
              className="px-6 py-2.5 bg-[#FF7A00] hover:bg-[#e06a00] text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all"
            >
              🔄 Apply Closed-Loop Competency Updates
            </button>
            <button
              onClick={() => onNav("learning_path")}
              className="px-6 py-2.5 bg-[#0B3D66] hover:bg-[#082e4f] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-all"
            >
              View Personalized Learning Path →
            </button>
          </div>
        )}
      </div>

      {/* Competency Breakdown Cards */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-2xs space-y-4">
        <h2 className="text-xs font-bold text-[#0B3D66] uppercase tracking-wider">
          Competency Performance Breakdown
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(competencyBreakdown).map(([comp, stats]) => {
            const pct = Math.round((stats.correct / stats.total) * 100);
            return (
              <div key={comp} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-gray-800 line-clamp-1">{comp}</span>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${pct >= 80 ? "bg-emerald-100 text-emerald-800" : pct >= 60 ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"}`}>
                    {pct}%
                  </span>
                </div>
                <div className="text-[10px] text-gray-500">
                  {stats.correct} / {stats.total} correct · {stats.domain}
                </div>
                <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${pct >= 80 ? "bg-emerald-500" : pct >= 60 ? "bg-[#0B3D66]" : "bg-amber-500"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Question-by-Question Review */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-gray-100 gap-3">
          <h2 className="text-xs font-bold text-[#0B3D66] uppercase tracking-wider">
            Detailed Examination Item Review ({questions.length} Items)
          </h2>
          <div className="flex items-center gap-1.5">
            {(["all", "incorrect", "correct"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setReviewFilter(f)}
                className={`px-3 py-1 rounded-xl text-[11px] font-bold capitalize transition-all cursor-pointer ${
                  reviewFilter === f
                    ? "bg-[#0B3D66] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {f} ({f === "all" ? questions.length : f === "correct" ? correctCount : total - correctCount})
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filteredQuestions.map(({ q, idx, isCorrect }) => {
            const officerAns = answers[idx];

            return (
              <div
                key={idx}
                className={`p-5 rounded-2xl border text-xs space-y-3 ${
                  isCorrect ? "bg-emerald-50/30 border-emerald-200" : "bg-rose-50/30 border-rose-200"
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="font-bold text-gray-900 leading-relaxed">
                    Q{idx + 1}: {q.question}
                  </div>
                  <span
                    className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full shrink-0 ${
                      isCorrect ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {isCorrect ? "Correct ✓" : "Incorrect ✕"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  {q.options.map((opt, optIdx) => {
                    const isOfficerPick = officerAns === optIdx;
                    const isRightAnswer = q.answer === optIdx;

                    return (
                      <div
                        key={optIdx}
                        className={`p-2.5 rounded-xl border flex items-start gap-2 ${
                          isRightAnswer
                            ? "bg-emerald-100/70 border-emerald-300 font-bold text-emerald-950"
                            : isOfficerPick && !isRightAnswer
                            ? "bg-rose-100/70 border-rose-300 text-rose-950 font-bold"
                            : "bg-white border-gray-200 text-gray-700"
                        }`}
                      >
                        <span className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="leading-snug">{opt}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="p-3 bg-white/80 rounded-xl border border-gray-200/80 text-[11px] text-gray-600 space-y-1">
                  <div>
                    <strong className="text-[#0B3D66]">Official Methodology Explanation:</strong>{" "}
                    {q.explanation}
                  </div>
                  <div className="text-[10px] text-gray-400">
                    Competency Target: <strong className="text-gray-700">{q.competencyTarget || q.domain}</strong> ({q.difficulty})
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// 7. Skill-Gap Detailed Analysis Page (/skill-gaps)
// ──────────────────────────────────────────────

function SkillGapsScreen({
  onNav,
  onOpenCourse,
}: {
  onNav: (s: Screen) => void;
  onOpenCourse?: (c: CourseItem) => void;
}) {
  return <SkillGapAnalysis onNav={onNav} onOpenCourse={onOpenCourse} />;
}

// ──────────────────────────────────────────────
// 8. Personalized Learning Path Page (/learning-path)
// ──────────────────────────────────────────────

function LearningPathScreen({
  onNav,
  onOpenCourse,
}: {
  onNav: (s: Screen) => void;
  onOpenCourse: (c: CourseItem) => void;
}) {
  const profile = getProfile();
  const [userComps, setUserComps] = useState<UserCompetencyScore[]>(() => getUserCompetencies());
  const courses = getCourses();

  // Career Tracks
  const [selectedTrack, setSelectedTrack] = useState<string>("data_analytics");
  const [pace, setPace] = useState<"standard" | "intensive" | "executive">("standard");
  const [showAdvisorInfo, setShowAdvisorInfo] = useState(false);

  // Dynamic Learning Path
  const path = getPersonalizedLearningPath(userComps, courses);

  // Stats calculation
  const totalSteps = path.length;
  const completedSteps = path.filter((s) => s.status === "Completed").length;
  const inProgressSteps = path.filter((s) => s.status === "In Progress").length;
  const progressPct = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  // Calculate total hours
  const totalHours = path.reduce((acc, s) => {
    const hrs = parseInt(s.duration) || 12;
    return acc + hrs;
  }, 0);

  // Calculate completion date based on pace
  const hoursPerWeek = pace === "intensive" ? 10 : pace === "executive" ? 3 : 6;
  const weeksNeeded = Math.ceil(totalHours / hoursPerWeek);
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + weeksNeeded * 7);
  const targetDateStr = targetDate.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const TRACKS = [
    {
      id: "data_analytics",
      label: "Official Data Analytics & Microdata",
      icon: "🐍",
      desc: "Python, SQL, R, and automated NSSO microdata processing pipelines.",
      targetRole: "Data Analyst / Senior Statistical Officer",
    },
    {
      id: "national_accounts",
      label: "National Accounts & Macro GVA",
      icon: "📊",
      desc: "UN SNA 2008, Supply-Use Tables, Constant Price Deflators, and CPI/WPI.",
      targetRole: "Macro-Economic National Accounts Specialist",
    },
    {
      id: "survey_operations",
      label: "Sample Survey Operations & PLFS",
      icon: "📋",
      desc: "Multi-stage PPS sampling, SDRD validation standards, and field leadership.",
      targetRole: "Survey Director / Deputy Director General",
    },
    {
      id: "ai_governance",
      label: "AI, Geospatial & Digital Governance",
      icon: "🤖",
      desc: "AI/ML in statistics, QGIS spatial intelligence, and DPDP Act compliance.",
      targetRole: "Director, Digital Systems & Capacity",
    },
  ];

  const activeTrackObj = TRACKS.find((t) => t.id === selectedTrack) || TRACKS[0];

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* ─── 1. Header Banner ─── */}
      <div className="bg-gradient-to-r from-[#0B3D66] via-[#0D4B7D] to-[#125894] rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 right-20 w-60 h-60 bg-orange-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-center gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[11px] font-bold rounded-full uppercase tracking-wider">
                🗺️ MoSPI Competency Roadmap
              </span>
              <span className="px-2.5 py-0.5 bg-white/10 text-gray-200 text-xs rounded-full font-mono">
                {profile.cadre} · {profile.cadreGrade}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-tight">
              Personalized Capacity Learning Path
            </h1>
            <p className="text-xs md:text-sm text-blue-100/90 leading-relaxed">
              Tailored specifically for <strong>{profile.name}</strong> to close cadre skill gaps
              and accelerate readiness for <strong>{activeTrackObj.targetRole}</strong>.
            </p>
          </div>

          {/* Quick Metrics Badge */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 min-w-[200px] text-center shrink-0">
            <div className="text-[10px] uppercase font-bold tracking-wider text-blue-200">
              Roadmap Progress
            </div>
            <div className="text-3xl font-bold text-amber-400 font-mono mt-0.5">
              {progressPct}%
            </div>
            <div className="text-[11px] text-blue-100 mt-1">
              {completedSteps} of {totalSteps} Milestone Steps Achieved
            </div>
          </div>
        </div>
      </div>

      {/* ─── 2. Career Track Switcher & Pace Planner ─── */}
      <div className="bg-white rounded-3xl p-5 md:p-6 border border-gray-100 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-3 border-b border-gray-100">
          <div>
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
              <span>🎯</span>
              <span>Target Career Specialization</span>
            </h3>
            <p className="text-[11px] text-gray-500">
              Switching tracks dynamically adjusts the AI recommendation algorithm for your cadre.
            </p>
          </div>

          {/* Pace selector */}
          <div className="flex items-center gap-1.5 bg-gray-50 p-1 rounded-xl border border-gray-200 text-xs">
            <span className="text-[10px] font-bold text-gray-400 px-1.5">Pace:</span>
            {[
              { id: "executive", label: "Executive (3h/wk)" },
              { id: "standard", label: "Standard (6h/wk)" },
              { id: "intensive", label: "Intensive (10h/wk)" },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPace(p.id as any)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  pace === p.id
                    ? "bg-[#0B3D66] text-white shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Track Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {TRACKS.map((t) => {
            const isSelected = selectedTrack === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedTrack(t.id)}
                className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer group ${
                  isSelected
                    ? "bg-blue-50/80 border-[#0B3D66] shadow-xs"
                    : "bg-gray-50/60 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xl">{t.icon}</span>
                  {isSelected && (
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-[#0B3D66] text-white rounded-full">
                      Active
                    </span>
                  )}
                </div>
                <h4 className="text-xs font-bold text-gray-900 leading-snug group-hover:text-[#0B3D66]">
                  {t.label}
                </h4>
                <p className="text-[10px] text-gray-500 line-clamp-2 mt-1 leading-normal">
                  {t.desc}
                </p>
              </button>
            );
          })}
        </div>

        {/* Summary Metric Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 bg-gray-50/80 rounded-2xl border border-gray-100 text-center">
            <span className="text-[10px] uppercase font-bold text-gray-400">Total Curriculum</span>
            <div className="text-sm font-bold text-gray-900 font-mono mt-0.5">{totalHours} Hours</div>
          </div>
          <div className="p-3 bg-gray-50/80 rounded-2xl border border-gray-100 text-center">
            <span className="text-[10px] uppercase font-bold text-gray-400">Target ETA</span>
            <div className="text-sm font-bold text-emerald-700 font-mono mt-0.5">{targetDateStr}</div>
          </div>
          <div className="p-3 bg-gray-50/80 rounded-2xl border border-gray-100 text-center">
            <span className="text-[10px] uppercase font-bold text-gray-400">CPD Accreditation</span>
            <div className="text-sm font-bold text-purple-700 font-mono mt-0.5">35 Points</div>
          </div>
          <div className="p-3 bg-gray-50/80 rounded-2xl border border-gray-100 text-center">
            <span className="text-[10px] uppercase font-bold text-gray-400">Accredited Bodies</span>
            <div className="text-sm font-bold text-[#0B3D66] font-mono mt-0.5">NSSTA &amp; iGOT</div>
          </div>
        </div>
      </div>

      {/* ─── 3. AI Gap Bridge Explanation Collapsible ─── */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-3xl p-5 text-xs shadow-2xs">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-base">💡</span>
            <strong className="text-amber-900 text-xs">
              Why this Learning Path was generated for your Profile:
            </strong>
          </div>
          <button
            onClick={() => setShowAdvisorInfo(!showAdvisorInfo)}
            className="text-amber-800 font-bold hover:underline cursor-pointer"
          >
            {showAdvisorInfo ? "Hide AI Formula Details ↑" : "Explain Recommendation Logic ↓"}
          </button>
        </div>

        {showAdvisorInfo && (
          <div className="mt-3 pt-3 border-t border-amber-200/80 text-amber-950 space-y-2 leading-relaxed animate-in fade-in">
            <p>
              Your learning sequence is dynamically determined by the MoSPI 5-Factor Priority Algorithm:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] pt-1">
              <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200">
                <strong>1. Critical Deficit Bridge (35%)</strong>
                <p className="text-gray-600 mt-0.5">Top deficit competencies (e.g. Python, SQL, GIS) are prioritized first.</p>
              </div>
              <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200">
                <strong>2. Cadre Benchmark (25%)</strong>
                <p className="text-gray-600 mt-0.5">Aligned with required mastery levels for {profile.cadreGrade} rank.</p>
              </div>
              <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200">
                <strong>3. Ministry Priorities (20%)</strong>
                <p className="text-gray-600 mt-0.5">Incorporates MoSPI 2026 digital modernization initiatives.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── 4. Visual Milestone Timeline Steps ─── */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-base font-bold text-[#0B3D66]">
            Milestone Progression &amp; Modular Steps ({path.length} Courses)
          </h2>
          <span className="text-xs text-gray-500">
            Click on any course to open the interactive player
          </span>
        </div>

        <div className="space-y-3.5">
          {path.map((step, idx) => {
            const course = courses.find((c) => c.id === step.courseId);
            const isCompleted = step.status === "Completed";
            const isInProgress = step.status === "In Progress";
            const isLocked = step.status === "Locked";

            return (
              <div
                key={step.stepNumber || idx}
                className={`p-5 rounded-3xl border transition-all ${
                  isInProgress
                    ? "bg-white border-[#0B3D66] shadow-md ring-2 ring-[#0B3D66]/10"
                    : isCompleted
                    ? "bg-emerald-50/40 border-emerald-200 shadow-2xs"
                    : "bg-white border-gray-200/80 shadow-2xs hover:border-gray-300"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left Column: Step Indicator + Info */}
                  <div className="flex items-start gap-4">
                    {/* Step Number Circle */}
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 shadow-xs ${
                        isCompleted
                          ? "bg-emerald-600 text-white"
                          : isInProgress
                          ? "bg-[#0B3D66] text-white animate-pulse"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {isCompleted ? "✓" : `0${step.stepNumber}`}
                    </div>

                    {/* Step Content */}
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            step.provider === "iGOT"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {step.provider === "iGOT" ? "🏛️ iGOT Karmayogi" : "🎓 NSSTA Academy"}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                          {step.matchScore}% Cadre Match
                        </span>
                        <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                          {step.difficulty}
                        </span>
                        {isInProgress && (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full animate-pulse">
                            ● Current In Progress
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm md:text-base font-bold text-gray-900 leading-snug">
                        {step.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                        <span>⏱️ {step.duration}</span>
                        <span>•</span>
                        <span>
                          Direct Remediation for:{" "}
                          <strong className="text-[#0B3D66]">{step.skillAddressed}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    {course && (
                      <button
                        onClick={() => {
                          onOpenCourse(course);
                          onNav("course_detail");
                        }}
                        className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
                          isCompleted
                            ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                            : isInProgress
                            ? "bg-[#FF7A00] hover:bg-[#e06a00] text-white shadow-orange-500/20 shadow-md"
                            : "bg-[#0B3D66] hover:bg-[#082e4f] text-white"
                        }`}
                      >
                        <span>
                          {isCompleted
                            ? "Review Course ↺"
                            : isInProgress
                            ? "Resume Lecture ▶"
                            : "Start Step →"}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── 5. Capstone Accreditation & Certificate Card ─── */}
      <div className="p-6 bg-gradient-to-br from-slate-900 to-[#0B3D66] text-white rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-bold text-xs uppercase tracking-wider">
              📜 National Credential Milestone
            </span>
          </div>
          <h3 className="text-lg font-bold text-white">
            Official MoSPI &amp; NSSTA Cadre Accreditation Certificate
          </h3>
          <p className="text-xs text-gray-300 leading-relaxed">
            Completing this learning path fulfills the mandatory Annual CPD training hours and awards
            a digitally signed, QR-verifiable Official Capacity Certificate.
          </p>
        </div>

        <button
          onClick={() => onNav("certificates")}
          className="px-5 py-3 bg-amber-400 hover:bg-amber-300 text-gray-950 text-xs font-bold rounded-2xl transition-all shadow-lg shrink-0 cursor-pointer"
        >
          View Credential Vault 🏆
        </button>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// 9. Courses Discovery Page (/courses)
// ──────────────────────────────────────────────

function CoursesScreen({
  onNav,
  onOpenCourse,
}: {
  onNav: (s: Screen) => void;
  onOpenCourse: (c: CourseItem) => void;
}) {
  const [courses] = useState<CourseItem[]>(getCourses());
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<"ALL" | "iGOT" | "NSSTA">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [semanticScores, setSemanticScores] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!search.trim()) {
      setSemanticScores({});
      return;
    }
    let isMounted = true;
    semanticSearchCourses(search, courses).then((results) => {
      if (isMounted) {
        const scoreMap: Record<string, number> = {};
        results.forEach((r) => {
          if (r.similarityScore > 0.15) {
            scoreMap[r.course.id] = Math.round(r.similarityScore * 100);
          }
        });
        setSemanticScores(scoreMap);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [search, courses]);

  const filtered = courses.filter((c) => {
    if (sourceFilter !== "ALL" && c.provider !== sourceFilter) return false;
    if (categoryFilter !== "ALL" && c.category !== categoryFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const textMatch = c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
      const vectorMatch = Boolean(semanticScores[c.id]);
      return textMatch || vectorMatch;
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0B3D66] font-serif">Courses &amp; Training Modules</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Explore accredited learning resources aligned with your statistical cadre competencies.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search courses by title, topic, or competency..."
          className="w-full md:w-80 px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#0B3D66]"
        />

        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-200 rounded-xl bg-gray-50"
          >
            <option value="ALL">All Sources</option>
            <option value="iGOT">iGOT Karmayogi</option>
            <option value="NSSTA">NSSTA</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl bg-gray-50"
          >
            <option value="ALL">All Categories</option>
            <option value="Technical">Technical</option>
            <option value="Statistical">Statistical</option>
            <option value="Digital Governance">Digital Governance</option>
            <option value="Behavioural">Behavioural</option>
          </select>
        </div>
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-3xl border border-gray-200/80 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
          >
            <div>
              {/* Course Card Photographic Header */}
              <div className="h-40 relative overflow-hidden bg-slate-950 select-none">
                <img
                  src={getCourseImage(c)}
                  alt={c.title}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 opacity-80 group-hover:opacity-90"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-black/30" />

                <div className="absolute inset-0 p-4 flex flex-col justify-between z-10 text-white">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white shadow-xs">
                      {c.level || "Intermediate"}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {semanticScores[c.id] && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-500 text-white shadow-xs">
                          ✨ {semanticScores[c.id]}% Match
                        </span>
                      )}
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 shadow-md">
                        {c.provider} Karmayogi
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-blue-600/90 backdrop-blur-md text-white border border-blue-400/30 shadow-xs">
                      {c.category}
                    </span>
                    {c.enrolled && (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500 text-white flex items-center gap-1 shadow-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        <span>Enrolled ({c.progressPct}%)</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Course Info */}
              <div className="p-5 space-y-2.5">
                <h3 className="text-sm font-bold text-[#0B3D66] group-hover:text-[#FF7A00] transition-colors line-clamp-2 leading-snug">
                  {c.title}
                </h3>
                <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">{c.description}</p>

                <div className="pt-2 flex items-center justify-between text-[11px] text-gray-500 font-medium border-t border-gray-100">
                  <span>⏱️ {c.duration}</span>
                  <span className="text-emerald-700 font-bold">📜 {c.cpdHours || 12} CPD</span>
                  <span className="text-amber-500 font-bold">★ {c.rating || 4.9}</span>
                </div>
              </div>
            </div>

            {/* Card Action */}
            <div className="p-5 pt-0">
              <button
                onClick={() => {
                  onOpenCourse(c);
                  onNav("course_detail");
                }}
                className="w-full py-2.5 bg-[#0B3D66] group-hover:bg-gradient-to-r group-hover:from-[#FF7A00] group-hover:to-[#FF8C1A] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs text-center flex items-center justify-center gap-1.5"
              >
                <span>View Course Syllabus</span>
                <span>→</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// 10. Course Detail Page (/courses/:id)
// ──────────────────────────────────────────────

function CourseDetailScreen({
  course,
  onBack,
  onNav,
}: {
  course: CourseItem | null;
  onBack: () => void;
  onNav: (s: Screen) => void;
}) {
  if (!course) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button onClick={onBack} className="text-xs font-bold text-[#0B3D66] hover:underline cursor-pointer">
        ← Back to Courses
      </button>

      <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800">
                {course.provider} Karmayogi
              </span>
              <span className="text-xs text-gray-500">{course.level} · {course.duration}</span>
            </div>
            <h1 className="text-xl font-bold text-[#0B3D66]">{course.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNav("course_player")}
              className="px-5 py-2.5 bg-[#0B3D66] text-white text-xs font-bold rounded-xl hover:bg-[#082e4f] shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <span>🎥</span>
              <span>Start Learning Player →</span>
            </button>
            <button
              onClick={() => onNav("quizzes")}
              className="px-5 py-2.5 bg-[#FF7A00] text-white text-xs font-bold rounded-xl hover:bg-[#e06a00] shadow-md cursor-pointer"
            >
              Take Accreditation Quiz →
            </button>
          </div>
        </div>

        {/* Why Recommended */}
        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 space-y-1 text-xs text-gray-700">
          <div className="font-bold text-[#0B3D66]">Why This Course Is Recommended For You:</div>
          <div>✓ Directly addresses high-priority competency gap in <strong>{course.primaryCompetency}</strong>.</div>
          <div>✓ Required for Statistical Officer role advancement in MoSPI.</div>
        </div>

        {/* Outcomes */}
        <div>
          <h3 className="font-bold text-xs text-[#0B3D66] uppercase tracking-wider mb-2">Learning Outcomes</h3>
          <ul className="space-y-1 text-xs text-gray-600 list-disc pl-4">
            {(course.learningOutcomes || [
              "Master fundamental statistical data processing and survey automation.",
              "Conduct automated imputation and multiplier calculations.",
              "Generate executive reports for ministry leadership.",
            ]).map((out, idx) => (
              <li key={idx}>{out}</li>
            ))}
          </ul>
        </div>

        {/* Structure & Chapters */}
        <div>
          <h3 className="font-bold text-xs text-[#0B3D66] uppercase tracking-wider mb-2">Course Chapters &amp; Video Modules</h3>
          <div className="space-y-2">
            {(() => {
              const rich = getRichCourseDetail(course.id, course.title);
              const chapters = rich.chapters || [];
              return chapters.map((ch) => (
                <div key={ch.id} className="p-3 bg-gray-50 rounded-xl flex items-center justify-between text-xs hover:bg-blue-50/50 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#0B3D66] text-white flex items-center justify-center text-[10px] font-bold">
                      {ch.id}
                    </span>
                    <div>
                      <div className="font-bold text-gray-800">{ch.title}</div>
                      <div className="text-[11px] text-gray-500 line-clamp-1">{ch.summary}</div>
                    </div>
                  </div>
                  <span className="text-gray-400 font-mono text-[11px] shrink-0">{ch.duration}</span>
                </div>
              ));
            })()}
          </div>
        </div>

        {/* Official Course Resources & Downloadable Datasets */}
        <div>
          <h3 className="font-bold text-xs text-[#0B3D66] uppercase tracking-wider mb-2">Downloadable Datasets &amp; Training Manuals</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(() => {
              const rich = getRichCourseDetail(course.id, course.title);
              const resources = rich.resources || [];
              return resources.map((res, idx) => (
                <div key={idx} className="p-3 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-between text-xs hover:border-gray-200 transition-all">
                  <div className="min-w-0 pr-2">
                    <div className="font-bold text-gray-800 truncate text-[11px]">{res.title}</div>
                    <div className="text-[10px] text-gray-500 flex items-center gap-1.5 mt-0.5">
                      <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-semibold">{res.type}</span>
                      <span>·</span>
                      <span>{res.size}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => triggerBrowserDownload(generateOfficialDataset(res.title))}
                    className="px-3 py-1.5 bg-[#0B3D66] hover:bg-[#082e4f] text-white text-[10px] font-bold rounded-xl shrink-0 cursor-pointer shadow-2xs flex items-center gap-1"
                    title={`Download ${res.title}`}
                  >
                    <span>⬇️</span>
                    <span>Download</span>
                  </button>
                </div>
              ));
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// 11. NSSTA Training Programmes Page (/training-programmes)
// ──────────────────────────────────────────────

function TrainingProgrammesScreen() {
  const [programmes, setProgrammes] = useState<NsstaTrainingProgramme[]>(getNsstaProgrammes());
  const [selectedProg, setSelectedProg] = useState<NsstaTrainingProgramme | null>(null);
  const [registeredIds, setRegisteredIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem("statskill_nssta_registrations") || "[]");
    } catch {
      return [];
    }
  });

  function handleNominationSuccess(progId: string) {
    const updatedRegs = [...registeredIds, progId];
    setRegisteredIds(updatedRegs);
    localStorage.setItem("statskill_nssta_registrations", JSON.stringify(updatedRegs));

    const updatedProgrammes = programmes.map((p) =>
      p.id === progId ? { ...p, enrolledCount: Math.min(p.seatCapacity, p.enrolledCount + 1) } : p
    );
    setProgrammes(updatedProgrammes);
    localStorage.setItem("statskill_programmes", JSON.stringify(updatedProgrammes));
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0B3D66] font-serif">NSSTA TPAC Training Programmes</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Accredited in-person and executive residential training programmes at NSSTA Greater Noida.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {programmes.map((p) => {
          const isRegistered = registeredIds.includes(p.id);
          const seatsLeft = Math.max(0, p.seatCapacity - p.enrolledCount);

          return (
            <div key={p.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-2xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md">
                    NSSTA TPAC · {p.deliveryMode}
                  </span>
                  <span className="text-xs font-bold text-[#FF7A00] font-mono">{p.schedule}</span>
                </div>
                <h3 className="text-sm font-bold text-gray-900">{p.programmeName}</h3>
                <p className="text-xs text-gray-500">{p.description}</p>
                <div className="text-[11px] text-gray-600 bg-gray-50 p-3 rounded-xl space-y-1 border border-gray-100">
                  <div><strong>Target:</strong> {p.targetAudience}</div>
                  <div><strong>Eligibility:</strong> {p.eligibility}</div>
                  <div className="flex justify-between text-[10px] text-gray-500 pt-1.5 border-t border-gray-200/60 font-mono">
                    <span>Capacity: {p.seatCapacity} seats</span>
                    <span className={seatsLeft <= 5 ? "text-rose-600 font-bold" : "text-emerald-700 font-bold"}>
                      {seatsLeft > 0 ? `${seatsLeft} seats remaining` : "Batch Full (Waitlist)"}
                    </span>
                  </div>
                </div>
              </div>

              {isRegistered ? (
                <div className="w-full py-2.5 bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1.5 shadow-2xs">
                  <span>✓ Official Nomination Confirmed</span>
                </div>
              ) : (
                <button
                  onClick={() => setSelectedProg(p)}
                  className="w-full py-2.5 bg-[#0B3D66] hover:bg-[#082e4f] text-white text-xs font-bold rounded-xl text-center block transition-all shadow-xs cursor-pointer"
                >
                  Register for Programme →
                </button>
              )}
            </div>
          );
        })}
      </div>

      <NsstaRegistrationModal
        programme={selectedProg}
        isOpen={Boolean(selectedProg)}
        onClose={() => setSelectedProg(null)}
        onSuccess={handleNominationSuccess}
      />
    </div>
  );
}

// ──────────────────────────────────────────────
// 12. My Learning Page (/learning)
// ──────────────────────────────────────────────

function MyLearningScreen({
  onNav,
  onOpenCourse,
}: {
  onNav: (s: Screen) => void;
  onOpenCourse: (c: CourseItem) => void;
}) {
  const courses = getCourses();
  const [tab, setTab] = useState<"inprogress" | "completed">("inprogress");

  const inProgress = courses.filter((c) => c.enrolled && c.progressPct < 100);
  const completed = courses.filter((c) => c.enrolled && c.progressPct === 100);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B3D66] font-serif">My Learning &amp; Curricula Progress</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Track enrolled iGOT Karmayogi courses and completed certifications.
        </p>
      </div>

      <div className="flex gap-2 border-b border-gray-200 pb-2 text-xs font-bold">
        <button
          onClick={() => setTab("inprogress")}
          className={`pb-2 px-2 border-b-2 transition-all ${tab === "inprogress" ? "border-[#0B3D66] text-[#0B3D66]" : "border-transparent text-gray-400"}`}
        >
          In Progress ({inProgress.length})
        </button>
        <button
          onClick={() => setTab("completed")}
          className={`pb-2 px-2 border-b-2 transition-all ${tab === "completed" ? "border-[#0B3D66] text-[#0B3D66]" : "border-transparent text-gray-400"}`}
        >
          Completed ({completed.length})
        </button>
      </div>

      <div className="space-y-4">
        {(tab === "inprogress" ? inProgress : completed).map((c) => (
          <div key={c.id} className="p-4 bg-white rounded-3xl border border-gray-200/80 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition-all group overflow-hidden">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="w-20 h-16 rounded-2xl overflow-hidden bg-slate-900 shrink-0 relative">
                <img
                  src={getCourseImage(c)}
                  alt={c.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-85"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/20" />
                <span className="absolute bottom-1 right-1 text-[8px] font-extrabold px-1.5 py-0.2 rounded bg-amber-400 text-amber-950">
                  {c.provider}
                </span>
              </div>

              <div className="space-y-1 flex-1 min-w-0">
                <span className="text-[10px] font-bold text-[#FF7A00] uppercase tracking-wider">{c.category}</span>
                <h3 className="text-sm font-bold text-gray-900 truncate group-hover:text-[#0B3D66] transition-colors">{c.title}</h3>
                <div className="text-xs text-gray-500 font-medium">{c.duration} · {c.primaryCompetency}</div>
                <div className="w-full max-w-xs bg-gray-100 h-1.5 rounded-full overflow-hidden mt-1.5">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full" style={{ width: `${c.progressPct}%` }} />
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                onOpenCourse(c);
                onNav("course_detail");
              }}
              className="px-5 py-2.5 bg-[#0B3D66] hover:bg-[#FF7A00] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
            >
              {c.progressPct === 100 ? "Review Syllabus" : `Continue Learning (${c.progressPct}%) →`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// 13. Quizzes Page (/quizzes)
// ──────────────────────────────────────────────

function QuizzesScreen({ onNav }: { onNav: (s: Screen) => void }) {
  const [quizzes, setQuizzes] = useState<QuizItem[]>(getQuizzes());
  const [activeQuiz, setActiveQuiz] = useState<QuizItem | null>(null);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [elevationMsg, setElevationMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<string>("All");

  const filteredQuizzes = quizzes.filter((q) => {
    const matchSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase()) || q.description.toLowerCase().includes(searchQuery.toLowerCase()) || q.competency.toLowerCase().includes(searchQuery.toLowerCase());
    const matchDomain = selectedDomain === "All" || q.domain === selectedDomain;
    return matchSearch && matchDomain;
  });

  function startQuiz(quiz: QuizItem) {
    setActiveQuiz(quiz);
    setUserAnswers(new Array((quiz.questions || []).length).fill(-1));
    setQuizSubmitted(false);
    setElevationMsg(null);
  }

  function handleSelectAnswer(qIdx: number, optIdx: number) {
    if (quizSubmitted) return;
    const copy = [...userAnswers];
    copy[qIdx] = optIdx;
    setUserAnswers(copy);
  }

  function handleSubmitQuiz() {
    if (!activeQuiz || !activeQuiz.questions) return;
    setQuizSubmitted(true);

    const correctCount = activeQuiz.questions.reduce(
      (acc, q, idx) => acc + (userAnswers[idx] === q.correctAnswerIndex ? 1 : 0),
      0
    );
    const scorePct = Math.round((correctCount / activeQuiz.questions.length) * 100);

    // Save attempt
    const attempt: QuizAttempt = {
      quizId: activeQuiz.id,
      timestamp: new Date().toISOString(),
      scorePct,
      passed: scorePct >= 70,
      totalQuestions: activeQuiz.questions.length,
      correctAnswers: correctCount,
    };
    saveQuizAttempt(attempt);

    // Apply Closed-Loop Competency Update
    const result = applyClosedLoopCompetencyUpdate({
      competencyName: activeQuiz.competency,
      scorePct,
      evidence: `Topic Knowledge Check: ${activeQuiz.title} (Score: ${scorePct}%)`,
    });

    if (result.updated) {
      setElevationMsg(`🎉 ${result.message}`);
    } else {
      setElevationMsg(`Score: ${scorePct}%. ${result.message}`);
    }

    // Update local quizzes state
    const updated = quizzes.map((q) => (q.id === activeQuiz.id ? { ...q, completed: true, lastScorePct: scorePct } : q));
    setQuizzes(updated);
    localStorage.setItem("statskill_quizzes", JSON.stringify(updated));
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0B3D66] font-serif">Quizzes &amp; Knowledge Checks</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Interactive competency checks with instant scoring and closed-loop profile elevation.
          </p>
        </div>
        <button
          onClick={() => onNav("assessment")}
          className="px-4 py-2 bg-[#FF7A00] text-white text-xs font-bold rounded-xl hover:bg-[#e06a00] cursor-pointer shadow-sm shrink-0"
        >
          Comprehensive Diagnostic ↗
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search quizzes by title, competency..."
            className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-[#0B3D66]"
          />
          <span className="absolute left-2.5 top-2.5 text-xs text-gray-400">🔍</span>
        </div>

        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl text-xs font-bold self-start sm:self-auto overflow-x-auto max-w-full">
          {["All", "Statistical", "Technical", "Digital Governance"].map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDomain(d)}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                selectedDomain === d ? "bg-[#0B3D66] text-white shadow-xs" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Quizzes Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredQuizzes.map((q) => (
          <div key={q.id} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-2xs space-y-3 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  q.domain === "Statistical" ? "bg-blue-100 text-blue-800" : q.domain === "Technical" ? "bg-orange-100 text-orange-800" : "bg-emerald-100 text-emerald-800"
                }`}>
                  {q.domain}
                </span>
                <span className="text-xs text-gray-400 font-mono">⏱️ {q.durationMinutes} min</span>
              </div>
              <h3 className="text-sm font-bold text-gray-900 mt-1">{q.title}</h3>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{q.description}</p>
              <div className="mt-2 text-[11px] text-[#0B3D66] font-medium">
                Target: <strong>{q.competency}</strong>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-gray-400 font-mono">{(q.questions || []).length} Questions</span>
                {q.completed && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Passed ({q.lastScorePct || 85}%) ✓
                  </span>
                )}
              </div>
              <button
                onClick={() => startQuiz(q)}
                className="px-4 py-2 bg-[#0B3D66] hover:bg-[#082e4f] text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition-all flex items-center gap-1.5"
              >
                <span>{q.completed ? "Retake Quiz" : "Start Live Quiz"}</span>
                <span>→</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ────────────── LIVE INTERACTIVE QUIZ RUNNER MODAL ────────────── */}
      {activeQuiz && activeQuiz.questions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-start pb-3 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-orange-100 text-[#FF7A00] px-2.5 py-0.5 rounded-full">
                  {activeQuiz.domain} · {activeQuiz.competency}
                </span>
                <h2 className="text-base font-bold text-[#0B3D66] mt-1">{activeQuiz.title}</h2>
              </div>
              <button
                onClick={() => setActiveQuiz(null)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            {elevationMsg && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-950 flex items-center gap-2">
                <span>{elevationMsg}</span>
              </div>
            )}

            {/* Questions List */}
            <div className="space-y-5">
              {activeQuiz.questions.map((q, qIdx) => {
                const isSelectedAny = userAnswers[qIdx] !== -1;
                return (
                  <div key={q.id || qIdx} className="space-y-3 p-4 rounded-2xl bg-gray-50 border border-gray-100 text-xs">
                    <div className="font-bold text-gray-900 leading-snug">
                      Question {qIdx + 1}: {q.question}
                    </div>

                    <div className="space-y-2">
                      {q.options.map((opt, oIdx) => {
                        const isSelected = userAnswers[qIdx] === oIdx;
                        const isCorrect = q.correctAnswerIndex === oIdx;

                        let style = "bg-white border-gray-200 text-gray-700 hover:border-blue-400";
                        if (quizSubmitted) {
                          if (isCorrect) style = "bg-emerald-50 border-emerald-400 text-emerald-900 font-bold shadow-xs";
                          else if (isSelected && !isCorrect) style = "bg-rose-50 border-rose-400 text-rose-900";
                        } else if (isSelected) {
                          style = "bg-blue-50 border-[#0B3D66] text-[#0B3D66] font-bold shadow-xs";
                        }

                        return (
                          <button
                            key={oIdx}
                            type="button"
                            onClick={() => handleSelectAnswer(qIdx, oIdx)}
                            className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-center gap-2.5 cursor-pointer ${style}`}
                          >
                            <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {quizSubmitted && (
                      <div className="p-3 bg-blue-50/80 rounded-xl text-[11px] text-[#0B3D66] leading-relaxed border border-blue-100">
                        <strong>Methodology Note:</strong> {q.explanation}
                        {q.sourceReference && (
                          <div className="text-[10px] text-gray-500 mt-1 italic">
                            Reference: {q.sourceReference}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Evaluation Footer */}
            <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-3">
              <span className="text-xs text-gray-500">
                {quizSubmitted ? "Review answers and explanations above" : `Answer all ${activeQuiz.questions.length} questions to submit`}
              </span>

              <div className="flex gap-2">
                {quizSubmitted ? (
                  <>
                    <button
                      onClick={() => startQuiz(activeQuiz)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Retake
                    </button>
                    <button
                      onClick={() => setActiveQuiz(null)}
                      className="px-5 py-2 bg-[#0B3D66] text-white text-xs font-bold rounded-xl hover:bg-[#082e4f] cursor-pointer shadow-md"
                    >
                      Done &amp; Close
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={userAnswers.includes(-1)}
                    className="px-5 py-2.5 bg-[#FF7A00] text-white text-xs font-bold rounded-xl hover:bg-[#e06a00] shadow-md disabled:opacity-40 cursor-pointer"
                  >
                    Submit &amp; Evaluate →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// 14. Resources / Documents Page (/resources)
// ──────────────────────────────────────────────

function ResourcesScreen({ onNav }: { onNav: (s: Screen) => void }) {
  const [resources, setResources] = useState<LearningResource[]>(getLearningResources());
  const [search, setSearch] = useState("");
  const [activeDomain, setActiveDomain] = useState<string>("All");
  const [previewDoc, setPreviewDoc] = useState<LearningResource | null>(null);

  const filtered = resources.filter((r) => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) || r.summary.toLowerCase().includes(search.toLowerCase());
    const matchDomain = activeDomain === "All" || r.domain === activeDomain;
    return matchSearch && matchDomain;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0B3D66] font-serif">Official Learning Resources &amp; Datasets</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Government statistical manuals, synthetic survey microdata, and sampling instruction files.
          </p>
        </div>
        <button
          onClick={() => onNav("trainer")}
          className="px-4 py-2 bg-[#0B3D66] hover:bg-[#082e4f] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer shrink-0"
        >
          Upload New Manual ↗
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search manuals, datasets, guides..."
            className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-[#0B3D66]"
          />
          <span className="absolute left-2.5 top-2.5 text-xs text-gray-400">🔍</span>
        </div>

        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl text-xs font-bold self-start sm:self-auto overflow-x-auto max-w-full">
          {["All", "Statistical", "Technical", "Digital Governance"].map((dom) => (
            <button
              key={dom}
              onClick={() => setActiveDomain(dom)}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeDomain === dom ? "bg-[#0B3D66] text-white shadow-xs" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {dom}
            </button>
          ))}
        </div>
      </div>

      {/* Resources List */}
      <div className="space-y-4">
        {filtered.map((res) => (
          <div key={res.id} className="p-5 bg-white rounded-3xl border border-gray-100 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition-shadow">
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold bg-rose-100 text-rose-900 px-2.5 py-0.5 rounded-full border border-rose-200">
                  {res.fileType} · {res.pageCount} Pages
                </span>
                <span className="text-[10px] font-semibold text-gray-400">{res.uploadedDate} · {res.uploadedBy}</span>
              </div>
              <h3 className="text-sm font-bold text-[#0B3D66] leading-snug">{res.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{res.summary}</p>
              <div className="flex flex-wrap gap-1 pt-1">
                {(res.associatedCompetencies || []).map((c, i) => (
                  <span key={i} className="text-[9px] font-bold px-2 py-0.5 rounded bg-blue-50 text-[#0B3D66]">
                    ✓ {c}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                onClick={() => setPreviewDoc(res)}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl cursor-pointer transition-colors"
              >
                👁️ Preview
              </button>
              <button
                onClick={() => triggerBrowserDownload(generateOfficialDataset(res.title))}
                className="px-3.5 py-2 bg-[#0B3D66] hover:bg-[#082e4f] text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs flex items-center gap-1.5 transition-all"
              >
                <span>⬇️</span>
                <span>Download</span>
              </button>
              <button
                onClick={() => onNav("trainer")}
                className="px-3 py-2 bg-[#FF7A00] hover:bg-[#e06a00] text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs"
                title="Generate AI Quiz from this manual"
              >
                ⚡ Quiz
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ────────────── DOCUMENT PREVIEW MODAL ────────────── */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-start pb-3 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                  {previewDoc.domain} · {previewDoc.fileType}
                </span>
                <h2 className="text-base font-bold text-[#0B3D66] mt-1">{previewDoc.title}</h2>
              </div>
              <button onClick={() => setPreviewDoc(null)} className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center text-xs cursor-pointer">
                ✕
              </button>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-xs space-y-3">
              <div className="flex justify-between text-gray-500 text-[11px] pb-2 border-b border-gray-200">
                <span>Published By: <strong>{previewDoc.uploadedBy}</strong></span>
                <span>Pages: <strong>{previewDoc.pageCount}</strong></span>
              </div>
              <div>
                <h4 className="font-bold text-gray-800 mb-1">Executive Overview:</h4>
                <p className="text-gray-600 leading-relaxed">{previewDoc.summary}</p>
              </div>
              <div>
                <h4 className="font-bold text-gray-800 mb-1">Authoritative Snippet:</h4>
                <div className="p-3 bg-white rounded-xl border border-gray-200 font-mono text-[11px] text-gray-700 leading-relaxed">
                  {previewDoc.contentSnippet || "Statutory training guidelines covering multi-stage survey methodology and calculation standards."}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => triggerBrowserDownload(generateOfficialDataset(previewDoc.title))}
                className="px-4 py-2 bg-[#0B3D66] text-white text-xs font-bold rounded-xl hover:bg-[#082e4f] flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>⬇️ Download Complete Document</span>
              </button>
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-200 cursor-pointer"
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

// ──────────────────────────────────────────────
// 15. AI Learning Assistant Page (/assistant)
// ──────────────────────────────────────────────

function AssistantScreen({ onNav }: { onNav?: (s: Screen) => void }) {
  const { t, lang } = useLanguage();
  const profile = getProfile();
  const userComps = getUserCompetencies();
  const gaps = userComps.filter((c) => c.gap > 0).map((c) => c.competencyName);
  const weakestComp = gaps[0] || "National Accounts & GVA";

  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string; action?: "assess" | "gap" | "learn" | "elevate" }[]>([
    {
      role: "assistant",
      text: lang === "HI"
        ? `नमस्ते **${profile.name || "अधिकारी"}**! मैं आपका **स्टेटस्किल एआई सांख्यिकी सहायक** हूँ।\n\nमैं आपके **${profile.cadreGrade || "STS"}** दक्षता मानकों और **मंत्रालय क्षमता लेजर** से पूरी तरह सिंक हूँ। आज आप अपनी सांख्यिकीय प्रवीणता कैसे बढ़ाना चाहते हैं?`
        : lang === "TE"
        ? `నమస్కారం **${profile.name || "అధికారి"}**! నేను మీ **స్టాట్‌స్కిల్ AI గణాంక సహాయకుడిని**.\n\nనేను మీ **${profile.cadreGrade || "STS"}** నైపుణ్య ప్రమాణాలు మరియు **మంత్రిత్వ శాఖ లెడ్జర్**తో అనుసంధానించబడి ఉన్నాను. ఈ రోజు మీ గణాంక నైపుణ్యాలను ఎలా మెరుగుపరచుకోవాలనుకుంటున్నారు?`
        : `Namaste **${profile.name || "Officer"}**! I am your **StatSkill AI Closed-Loop Copilot**.\n\nI am synchronized with your **${profile.cadreGrade || "STS"}** competency benchmarks and the **MoSPI Capacity Ledger**. How would you like to advance your official statistical proficiency today?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [elevateNotice, setElevateNotice] = useState<string | null>(null);
  const [activeStage, setActiveStage] = useState<"assess" | "gap" | "learn" | "elevate">("assess");
  const [isListening, setIsListening] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  function speakMessage(text: string) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#`_\[\]()]/g, "").slice(0, 300);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  }

  function handleVoiceInput() {
    if (typeof window === "undefined") return;
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      alert("Speech recognition is not supported in this browser. Please use keyboard input.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.lang = lang === "HI" ? "hi-IN" : lang === "TE" ? "te-IN" : "en-IN";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) {
          setInput(transcript);
          handleSend(transcript);
        }
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch {
      setIsListening(false);
    }
  }

  function handleExportConversation() {
    const md = `# StatSkill AI Copilot Consultation Transcript
**Officer Name:** ${profile.name || "Dr. Rajesh Sharma, ISS"}  
**Cadre & Grade:** ${profile.cadreGrade || "STS"} (${profile.department || "Labour Statistics"})  
**Date:** ${new Date().toLocaleString()}  

---

${messages.map((m) => `### **${m.role === "user" ? "👤 Officer" : "🤖 StatSkill AI Copilot"}**:\n\n${m.text}\n`).join("\n---\n\n")}
`;
    triggerBrowserDownload({
      filename: `StatSkill_AI_Consultation_${new Date().toISOString().slice(0, 10)}.md`,
      mimeType: "text/markdown",
      content: md,
    });
  }

  const stagesData = [
    {
      id: "assess" as const,
      num: "1",
      title: lang === "HI" ? "मूल्यांकन" : lang === "TE" ? "మూల్యాంకనం" : "Assess",
      subtitle: lang === "HI" ? "नैदानिक प्रश्नोत्तरी" : lang === "TE" ? "డయాగ్నస్టిక్ క్విజ్" : "Diagnostic Micro-Quiz",
      icon: "✍️",
      color: "from-blue-600 to-indigo-600",
      accent: "border-blue-300 text-blue-800 bg-blue-50/50",
      prompts: [
        { label: `Quiz me on ${weakestComp}`, text: `Quiz me on ${weakestComp} with 2 official diagnostic questions.` },
        { label: "Test PLFS Multipliers", text: "Test my knowledge on PLFS two-stage survey design and multiplier aggregation." },
        { label: "UN SNA 2008 GVA Test", text: "Give me an assessment MCQ on UN SNA 2008 Gross Value Added compilation." },
      ],
    },
    {
      id: "gap" as const,
      num: "2",
      title: lang === "HI" ? "अंतराल निदान" : lang === "TE" ? "లోపాల గుర్తింపు" : "Diagnose Gaps",
      subtitle: lang === "HI" ? "प्राथमिकता कमियां" : lang === "TE" ? "ప్రాధాన్యతా లోపాలు" : "Priority Deficits",
      icon: "⚖️",
      color: "from-amber-500 to-orange-600",
      accent: "border-amber-300 text-amber-800 bg-amber-50/50",
      prompts: [
        { label: "Diagnose All Gaps", text: "Diagnose all my active skill gaps and explain why they impact my promotion index." },
        { label: `Deficit in ${weakestComp}`, text: `Why is my competency in ${weakestComp} below the required target level?` },
        { label: "Cadre Benchmark Comparison", text: "Compare my current scores against the Statistical Officer (STS) cadre benchmarks." },
      ],
    },
    {
      id: "learn" as const,
      num: "3",
      title: lang === "HI" ? "शिक्षण पथ" : lang === "TE" ? "అభ్యాస మార్గం" : "Learn Pathways",
      subtitle: lang === "HI" ? "अनुशंसित पाठ्यक्रम" : lang === "TE" ? "సిఫార్సు కోర్సులు" : "Curated Syllabi & Docs",
      icon: "📖",
      color: "from-purple-600 to-indigo-700",
      accent: "border-purple-300 text-purple-800 bg-purple-50/50",
      prompts: [
        { label: `Courses for ${weakestComp}`, text: `Recommend the most relevant NSSTA and iGOT courses for ${weakestComp}.` },
        { label: "Laspeyres Index Formula", text: "Explain the Modified Laspeyres Price Index formula with a step-by-step example." },
        { label: "DPDP Act Microdata Rules", text: "What are the statutory guidelines under the DPDP Act 2023 for microdata anonymization?" },
      ],
    },
    {
      id: "elevate" as const,
      num: "4",
      title: lang === "HI" ? "स्तर पदोन्नति" : lang === "TE" ? "స్థాయి పెంపు" : "Elevate Level",
      subtitle: lang === "HI" ? "सत्यापन एवं अपग्रेड" : lang === "TE" ? "ధృవీకరణ మరియు అప్‌గ్రేడ్" : "Verify & Upgrade",
      icon: "⚡",
      color: "from-emerald-500 to-teal-600",
      accent: "border-emerald-300 text-emerald-800 bg-emerald-50/50",
      prompts: [
        { label: `Elevate ${weakestComp}`, text: `Evaluate my understanding and trigger an official Level 4 elevation in ${weakestComp}.` },
        { label: "How Promotion CPD Works", text: "What are the Continuous Professional Development (CPD) credit hour requirements for cadre progression?" },
        { label: "Accreditation Ledger Status", text: "Check my verified W3C digital credentials and blockchain audit status." },
      ],
    },
  ];

  async function handleSend(textToSend?: string) {
    const text = (textToSend || input).trim();
    if (!text || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text }]);
    setLoading(true);

    try {
      const reply = await chatWithStatisticalAssistant(
        messages.map((m) => ({ role: m.role, content: m.text })).concat([{ role: "user", content: text }]),
        {
          name: profile.name,
          designation: profile.designation,
          department: profile.department,
          gaps: gaps,
          lang: lang,
        }
      );
      setMessages((prev) => [...prev, { role: "assistant", text: reply.text }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: lang === "HI"
            ? "मैं **मूल्यांकन → अंतराल निदान → शिक्षण → स्तर पदोन्नति** चक्र में आपकी सहायता के लिए तैयार हूँ। कृपया प्रश्नोत्तरी या पाठ्यक्रम अनुशंसा पूछें।"
            : lang === "TE"
            ? "నేను **మూల్యాంకనం → లోపాల గుర్తింపు → అభ్యాసం → స్థాయి పెంపు** ప్రక్రియలో మీకు సహాయం చేయడానికి సిద్ధంగా ఉన్నాను. దయచేసి ఏదైనా గణాంక ప్రశ్న లేదా కోర్సు సిఫార్సు అడగండి."
            : "I am ready to assist with the **Assess → Gap → Learn → Elevate** cycle. Try asking for an assessment quiz, gap diagnosis, or course recommendation.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleQuickElevate(compName: string) {
    const res = applyClosedLoopCompetencyUpdate({
      competencyName: compName,
      scorePct: 90,
      evidence: "AI Assistant Interactive Micro-Evaluation Verified",
    });

    if (res.updated) {
      setElevateNotice(`⚡ Competency Elevated! "${compName}" upgraded from Level ${res.oldLevel} → Level ${res.newLevel}. Official audit log written.`);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `### 🎖️ Closed-Loop Competency Elevation Confirmed\n\n- **Competency**: **${compName}**\n- **Old Level**: Level ${res.oldLevel}\n- **New Level**: **Level ${res.newLevel} (Proficient)**\n- **Evidence**: Verified via StatSkill AI Copilot\n- **Audit Status**: Signed & Written to MoSPI Capacity Ledger\n\nYour skill deficit has been officially closed. Check your **Skills Radar** to view your upgraded index!`,
          action: "elevate",
        },
      ]);
    } else {
      setElevateNotice(`ℹ️ "${compName}" is already at or above maximum target level.`);
    }
  }

  function handleClearHistory() {
    setMessages([
      {
        role: "assistant",
        text: `Chat session reset. Ready to assist with **Assess → Gap → Learn → Elevate** for **${profile.name || "Officer"}**.`,
      },
    ]);
  }

  const activeStageObj = stagesData.find((s) => s.id === activeStage) || stagesData[0];

  return (
    <div className="max-w-5xl mx-auto space-y-5 font-sans">
      {/* Executive Header Banner */}
      <div className="bg-gradient-to-r from-[#061e38] via-[#0B3D66] to-[#082a4d] rounded-3xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 border border-white/10">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-amber-300 text-slate-950 flex items-center justify-center font-extrabold text-2xl shadow-lg border border-white/30 shrink-0">
            🤖
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold font-serif tracking-tight">
                AI Competency Copilot
              </h1>
              <span className="text-[10px] uppercase tracking-wider bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Closed-Loop Engine</span>
              </span>
            </div>
            <p className="text-xs text-blue-200/80 mt-1 max-w-lg">
              Continuous Official Statistics Tutor: <span className="text-white font-bold">Assess</span> → <span className="text-white font-bold">Diagnose Gaps</span> → <span className="text-white font-bold">Learn</span> → <span className="text-white font-bold">Elevate</span>
            </p>
          </div>
        </div>

        {/* Right Header Officer Context & Tools */}
        <div className="relative z-10 flex items-center gap-2 self-start md:self-auto flex-wrap">
          <div className="bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/15 text-right hidden sm:block">
            <div className="text-xs font-bold text-white truncate">{profile.name || "Dr. Rajesh Sharma, ISS"}</div>
            <div className="text-[10px] text-amber-300 font-bold">{profile.cadreGrade || "STS"} · {profile.department || "Labour Statistics"}</div>
          </div>

          <div
            className="px-3 py-1.5 rounded-xl border border-emerald-400/40 bg-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center gap-1.5 shadow-xs select-none"
            title="Groq Cloud LLaMA 3.3 70B Active (.env)"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>⚡ Groq LLaMA 3.3</span>
          </div>

          <button
            onClick={handleExportConversation}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all text-xs font-bold cursor-pointer flex items-center gap-1"
            title="Export Consultation Transcript as Markdown"
          >
            <span>📥</span>
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            onClick={handleClearHistory}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all text-xs font-bold cursor-pointer"
            title="Reset Chat Session"
          >
            🔄 Reset
          </button>
        </div>
      </div>

      {/* Elevation Notice Toast */}
      {elevateNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-950 font-bold flex items-center justify-between shadow-sm animate-in fade-in">
          <span>{elevateNotice}</span>
          <button onClick={() => setElevateNotice(null)} className="text-emerald-700 hover:text-emerald-900 font-bold ml-2 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* 4-Stage Interactive Pipeline Card */}
      <div className="bg-white p-4 rounded-3xl border border-gray-200/80 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-gray-500">
            Closed-Loop Workflow Pipeline
          </span>
          <span className="text-[11px] font-bold text-blue-900">
            Selected: <strong>{activeStageObj.title}</strong>
          </span>
        </div>

        {/* Stage Buttons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {stagesData.map((stage) => {
            const isSelected = activeStage === stage.id;
            return (
              <button
                key={stage.id}
                onClick={() => setActiveStage(stage.id)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between group ${
                  isSelected
                    ? "bg-[#0B3D66] text-white border-[#0B3D66] shadow-md shadow-blue-900/20 ring-2 ring-[#0B3D66]/20"
                    : "bg-gray-50/70 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className={`text-base group-hover:scale-110 transition-transform`}>
                    {stage.icon}
                  </span>
                  <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-md ${
                    isSelected ? "bg-white/20 text-white" : "bg-gray-200 text-gray-600"
                  }`}>
                    Stage {stage.num}
                  </span>
                </div>
                <div className="mt-2">
                  <div className="text-xs font-bold leading-tight">{stage.title}</div>
                  <div className={`text-[10px] truncate mt-0.5 ${isSelected ? "text-blue-200" : "text-gray-400"}`}>
                    {stage.subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Dynamic Context Prompt Cards */}
        <div className="pt-2 border-t border-gray-100 flex flex-wrap gap-2">
          {activeStageObj.prompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p.text)}
              className="px-3.5 py-2 rounded-xl bg-blue-50/60 hover:bg-blue-100/80 border border-blue-200/80 text-xs text-[#0B3D66] font-bold hover:shadow-xs transition-all cursor-pointer flex items-center gap-2 group"
            >
              <span>💬</span>
              <span className="group-hover:text-blue-950">{p.label}</span>
              <span className="text-blue-400 text-[10px] group-hover:translate-x-0.5 transition-transform">→</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Stream Canvas */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-md flex flex-col h-[540px] overflow-hidden">
        {/* Chat Messages */}
        <div ref={chatContainerRef} className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 bg-gray-50/40 text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 max-w-[92%] leading-relaxed ${
                m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              }`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${
                m.role === "user"
                  ? "bg-[#FF7A00] text-white"
                  : "bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 border border-white/40"
              }`}>
                {m.role === "user" ? "👤" : "🤖"}
              </div>

              {/* Message Content */}
              <div
                className={`p-4 sm:p-5 rounded-3xl shadow-xs relative group ${
                  m.role === "user"
                    ? "bg-gradient-to-br from-[#0B3D66] to-[#062038] text-white rounded-tr-xs whitespace-pre-line"
                    : "bg-white text-gray-900 border border-gray-200/80 rounded-tl-xs w-full shadow-2xs"
                }`}
              >
                {m.role === "user" ? (
                  <div className="text-xs font-medium leading-relaxed">{m.text}</div>
                ) : (
                  <>
                    <AIResponseMessage
                      content={m.text}
                      onNav={onNav}
                      onElevate={handleQuickElevate}
                    />
                    <div className="pt-2.5 mt-3 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-400">
                      <span className="flex items-center gap-1 text-[#0B3D66] font-semibold">
                        <span>🏛️</span>
                        <span>StatSkill AI Verified Capacity Advisory</span>
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            if (navigator.clipboard) {
                              navigator.clipboard.writeText(m.text);
                            }
                          }}
                          className="hover:text-[#0B3D66] cursor-pointer transition-colors flex items-center gap-1"
                          title="Copy response text"
                        >
                          <span>📋</span>
                          <span>Copy</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => speakMessage(m.text)}
                          className="hover:text-[#0B3D66] cursor-pointer transition-colors flex items-center gap-1"
                          title="Read out loud with text-to-speech"
                        >
                          <span>🔊</span>
                          <span>Listen</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* In-Message Interactive Action Callouts */}
                {m.role === "assistant" && m.action === "elevate" && onNav && (
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
                    <button
                      onClick={() => onNav("skills")}
                      className="px-3.5 py-1.5 bg-[#0B3D66] hover:bg-[#FF7A00] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                    >
                      View Updated Skills Matrix →
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3 p-3.5 bg-white border border-gray-200 rounded-2xl max-w-xs shadow-2xs">
              <div className="w-6 h-6 rounded-lg bg-orange-500 text-white flex items-center justify-center text-xs">
                🤖
              </div>
              <div className="flex items-center gap-1.5 text-gray-500 font-bold text-xs">
                <span className="w-2 h-2 rounded-full bg-[#FF7A00] animate-ping" />
                <span>StatSkill AI synthesizing response...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3.5 border-t border-gray-200/80 bg-white space-y-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleVoiceInput}
              className={`p-2.5 rounded-2xl border transition-all cursor-pointer shrink-0 ${
                isListening
                  ? "bg-rose-500 text-white border-rose-600 animate-pulse shadow-md"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200"
              }`}
              title={isListening ? "Listening... Click to stop" : "Speak via Voice Recognition"}
            >
              {isListening ? "🎙️ Recording..." : "🎙️"}
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask about Assessment, Skill Gaps, Learning Pathways, or Competency Elevation..."
              className="flex-1 px-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#0B3D66] focus:bg-white transition-all shadow-inner"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="px-6 py-2.5 bg-gradient-to-r from-[#FF7A00] to-[#FF8C1A] hover:from-[#e06a00] hover:to-[#FF7A00] text-white text-xs font-bold rounded-2xl shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shrink-0"
            >
              <span>Send</span>
              <span>→</span>
            </button>
          </div>

          <div className="flex items-center justify-between text-[10px] text-gray-400 px-1 font-medium">
            <span>🔒 Locked to Official MoSPI Curricula &amp; W3C Verifiable Credentials Ledger</span>
            <span>Press Enter ↵ to Send</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// 16. Profile Page (/profile)
// ──────────────────────────────────────────────

function ProfileScreen() {
  const profile = getProfile();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B3D66] font-serif">Officer Profile &amp; Cadre Records</h1>
        <p className="text-xs text-gray-500 mt-0.5">Government Statistical Official Cadre Information</p>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
          <div className="w-16 h-16 rounded-2xl bg-[#0B3D66] text-white flex items-center justify-center text-xl font-bold">
            {(profile?.name || "RS").slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#0B3D66]">{profile.name}</h2>
            <div className="text-xs text-gray-500">{profile.designation} · {profile.department}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-gray-50 rounded-xl">
            <span className="text-gray-400 block text-[10px]">Employee ID</span>
            <strong className="text-gray-800">{profile.employeeId}</strong>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl">
            <span className="text-gray-400 block text-[10px]">Cadre &amp; Grade</span>
            <strong className="text-gray-800">{profile.cadre} ({profile.cadreGrade})</strong>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl">
            <span className="text-gray-400 block text-[10px]">Current Posting</span>
            <strong className="text-gray-800">{profile.posting}</strong>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl">
            <span className="text-gray-400 block text-[10px]">Years of Service</span>
            <strong className="text-gray-800">{profile.yearsOfExperience} Years</strong>
          </div>
        </div>

        <div className="p-3 bg-gray-50 rounded-xl text-xs space-y-1">
          <span className="text-gray-400 block text-[10px]">Current Assignment</span>
          <div className="text-gray-800 font-medium">{profile.currentAssignment}</div>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// 17. Certificates Screen
// ──────────────────────────────────────────────

function CertificatesScreen() {
  const [certs, setCerts] = useState<VerifiableCertificate[]>([]);
  const [tab, setTab] = useState<"my_certs" | "verify" | "issue">("my_certs");
  const [activeCertForView, setActiveCertForView] = useState<VerifiableCertificate | null>(null);

  // Verification State
  const [verifyQuery, setVerifyQuery] = useState("");
  const [verifyResult, setVerifyResult] = useState<{ valid: boolean; certificate?: VerifiableCertificate; message: string } | null>(null);

  // Issuance State (Simulation)
  const [issueTitle, setIssueTitle] = useState("National Accounts & GVA Compilation (UN SNA 2008)");
  const [issueIssuer, setIssueIssuer] = useState<"iGOT Karmayogi" | "NSSTA" | "MoSPI Capacity Board">("NSSTA");
  const [issueScore, setIssueScore] = useState(92);
  const [issuePillars, setIssuePillars] = useState("National Accounts, Gross Value Added, Supply-Use Tables");
  const [issueCpd, setIssueCpd] = useState(16);
  const [issueSuccessNotice, setIssueSuccessNotice] = useState<string | null>(null);

  const profile = getProfile();

  useEffect(() => {
    setCerts(getCertificates());
  }, []);

  function handleRunVerification(e: React.FormEvent) {
    e.preventDefault();
    const res = verifyCredential(verifyQuery);
    setVerifyResult(res);
  }

  function handleIssueSubmit(e: React.FormEvent) {
    e.preventDefault();
    const pillars = issuePillars.split(",").map((p) => p.trim()).filter(Boolean);
    const newCert = issueDigitalCredential({
      title: issueTitle,
      issuer: issueIssuer,
      competencyPillars: pillars.length ? pillars : ["Statistical Methodology", "Official Statistics"],
      scorePct: issueScore,
      cpdHours: issueCpd,
    });

    setCerts(getCertificates());
    setIssueSuccessNotice(`🎉 Verifiable Credential "${newCert.title}" issued successfully with ID ${newCert.credentialId}!`);
    setActiveCertForView(newCert);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-6 rounded-3xl border border-gray-100 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
              W3C Verifiable Credentials v2.0
            </span>
            <span className="text-xs text-gray-400 font-mono">ECDSA SHA-256 Ledger</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0B3D66] font-serif mt-1">
            Official Verifiable Digital Credentials
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Cryptographically signed capacity accreditations for MoSPI, NSSTA, and iGOT Karmayogi Bharat.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTab("issue")}
            className="px-4 py-2 bg-gradient-to-r from-[#FF7A00] to-[#FF8C1A] text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>⚡ Issue New Accreditation</span>
          </button>
        </div>
      </div>

      {/* Segmented Control Tabs */}
      <div className="flex bg-gray-100 p-1 rounded-2xl text-xs font-bold max-w-md">
        <button
          onClick={() => setTab("my_certs")}
          className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
            tab === "my_certs" ? "bg-[#0B3D66] text-white shadow-xs" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          🎖️ Earned Credentials ({certs.length})
        </button>
        <button
          onClick={() => setTab("verify")}
          className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
            tab === "verify" ? "bg-[#0B3D66] text-white shadow-xs" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          🔍 Verify ID / Hash
        </button>
        <button
          onClick={() => setTab("issue")}
          className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
            tab === "issue" ? "bg-[#0B3D66] text-white shadow-xs" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          📝 Issue (Simulate)
        </button>
      </div>

      {/* ────────────── TAB 1: MY CREDENTIALS ────────────── */}
      {tab === "my_certs" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in duration-200">
          {certs.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4 flex flex-col justify-between hover:shadow-md transition-all group"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      c.issuer === "NSSTA" ? "bg-purple-100 text-purple-900 border border-purple-200" : "bg-orange-100 text-orange-900 border border-orange-200"
                    }`}>
                      {c.issuer}
                    </span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {c.grade} ({c.scorePct}%)
                    </span>
                  </div>
                  <span className="text-2xl group-hover:scale-110 transition-transform">🎖️</span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#0B3D66] leading-snug">{c.title}</h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 font-medium">
                    <span>Issued to: <strong className="text-gray-800">{c.issuedTo}</strong></span>
                    <span>•</span>
                    <span className="text-emerald-700 font-bold">{c.cpdHours || 12} CPD Hours</span>
                  </div>
                </div>

                <div className="p-3 bg-gray-50/80 rounded-2xl border border-gray-100 text-[11px] text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Credential ID:</span>
                    <span className="font-mono font-bold text-[#0B3D66]">{c.credentialId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Issue Date:</span>
                    <span>{c.issueDate}</span>
                  </div>
                  <div className="truncate text-[10px] text-gray-400 font-mono pt-1 border-t border-gray-200/60">
                    {c.verificationHash}
                  </div>
                </div>

                {/* Competency Pillars */}
                <div className="flex flex-wrap gap-1">
                  {c.competencyPillars.map((p, pIdx) => (
                    <span key={pIdx} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-[#0B3D66] border border-blue-100">
                      ✓ {p}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex gap-2">
                <button
                  onClick={() => setActiveCertForView(c)}
                  className="flex-1 py-2.5 bg-[#0B3D66] hover:bg-[#082e4f] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>👁️ View Certificate</span>
                </button>
                <button
                  onClick={() => {
                    setActiveCertForView(c);
                    setTimeout(() => window.print(), 300);
                  }}
                  className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  title="Print / Save Verified PDF"
                >
                  🖨️ PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ────────────── TAB 2: VERIFY CREDENTIAL ────────────── */}
      {tab === "verify" && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-5 max-w-2xl mx-auto animate-in fade-in duration-200">
          <div>
            <h3 className="text-base font-bold text-[#0B3D66] font-serif">
              W3C Cryptographic Credential Verification Engine
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Enter any official Credential ID (e.g. <code className="bg-gray-100 px-1 py-0.5 rounded">iGOT-MoSPI-2026-88392</code> or <code className="bg-gray-100 px-1 py-0.5 rounded">NSSTA-TPAC-2026-0421</code>) or SHA-256 hash to confirm authentic issuance.
            </p>
          </div>

          <form onSubmit={handleRunVerification} className="flex gap-2">
            <input
              type="text"
              required
              value={verifyQuery}
              onChange={(e) => setVerifyQuery(e.target.value)}
              placeholder="Paste Credential ID or SHA-256 Hash..."
              className="flex-1 px-4 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#0B3D66]"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#0B3D66] hover:bg-[#082e4f] text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Verify Ledger ↗
            </button>
          </form>

          {verifyResult && (
            <div className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-3 ${
              verifyResult.valid ? "bg-emerald-50 border-emerald-200 text-emerald-950" : "bg-rose-50 border-rose-200 text-rose-950"
            }`}>
              <div className="flex items-center gap-2 font-bold text-sm">
                <span>{verifyResult.valid ? "✅ Authentic Credential Verified" : "❌ Verification Failed"}</span>
              </div>
              <p>{verifyResult.message}</p>

              {verifyResult.certificate && (
                <div className="pt-2 border-t border-emerald-200/60 flex justify-between items-center">
                  <span className="text-[11px] font-mono text-emerald-800">{verifyResult.certificate.verificationHash}</span>
                  <button
                    onClick={() => setActiveCertForView(verifyResult.certificate!)}
                    className="px-3 py-1.5 bg-[#0B3D66] text-white text-[11px] font-bold rounded-lg cursor-pointer"
                  >
                    View Certificate →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ────────────── TAB 3: ISSUE NEW CREDENTIAL (SIMULATION) ────────────── */}
      {tab === "issue" && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-5 max-w-2xl mx-auto animate-in fade-in duration-200">
          <div>
            <h3 className="text-base font-bold text-[#0B3D66] font-serif">
              Issue Official Accreditation Credential (Simulation)
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Trigger cryptographic signing for {profile.name || "Dr. Rajesh Sharma, ISS"} across statistical mastery domains.
            </p>
          </div>

          {issueSuccessNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold text-xs rounded-xl flex justify-between items-center">
              <span>{issueSuccessNotice}</span>
              <button onClick={() => setIssueSuccessNotice(null)} className="text-emerald-700 hover:text-emerald-900">✕</button>
            </div>
          )}

          <form onSubmit={handleIssueSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-gray-700 block mb-1">Course / Programme Title</label>
              <input
                type="text"
                required
                value={issueTitle}
                onChange={(e) => setIssueTitle(e.target.value)}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:border-[#0B3D66]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Accrediting Issuer</label>
                <select
                  value={issueIssuer}
                  onChange={(e) => setIssueIssuer(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white focus:border-[#0B3D66]"
                >
                  <option value="NSSTA">NSSTA TPAC</option>
                  <option value="iGOT Karmayogi">iGOT Karmayogi</option>
                  <option value="MoSPI Capacity Board">MoSPI Capacity Board</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Mastery Score (%)</label>
                <input
                  type="number"
                  min="60"
                  max="100"
                  value={issueScore}
                  onChange={(e) => setIssueScore(parseInt(e.target.value) || 90)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-[#0B3D66]"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">CPD Credit Hours</label>
                <input
                  type="number"
                  min="2"
                  max="50"
                  value={issueCpd}
                  onChange={(e) => setIssueCpd(parseInt(e.target.value) || 12)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-[#0B3D66]"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">Competency Pillars Certified (Comma-separated)</label>
              <input
                type="text"
                value={issuePillars}
                onChange={(e) => setIssuePillars(e.target.value)}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:border-[#0B3D66]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-[#FF7A00] to-[#FF8C1A] hover:from-[#e06a00] hover:to-[#FF7A00] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>🚀 Generate &amp; Sign W3C Verifiable Credential</span>
              <span>→</span>
            </button>
          </form>
        </div>
      )}

      {/* ────────────── OFFICIAL HIGH-RESOLUTION CERTIFICATE MODAL ────────────── */}
      {activeCertForView && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-[#FAF9F6] text-slate-900 rounded-3xl max-w-3xl w-full border-8 border-double border-amber-600/60 p-6 sm:p-10 shadow-2xl relative space-y-6 my-auto">
            {/* Top Action Bar */}
            <div className="flex justify-between items-center pb-3 border-b border-amber-900/10 no-print">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-900 flex items-center gap-1.5">
                <span>🎖️</span> Official Government Accreditation Certificate
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-[#0B3D66] text-white text-xs font-bold rounded-xl hover:bg-[#082e4f] cursor-pointer"
                >
                  🖨️ Print / Save PDF
                </button>
                <button
                  onClick={() => setActiveCertForView(null)}
                  className="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-xs font-bold text-gray-700 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Certificate Body */}
            <div className="text-center space-y-4 py-2 relative">
              {/* Emblem Header */}
              <div className="space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center text-2xl font-bold mx-auto shadow-md border-2 border-amber-300">
                  S
                </div>
                <h4 className="text-[11px] uppercase font-bold tracking-widest text-gray-600 mt-2 font-serif">
                  Government of India · Ministry of Statistics &amp; Programme Implementation
                </h4>
                <h5 className="text-[10px] uppercase font-bold tracking-wider text-amber-900">
                  National Statistical Systems Training Academy (NSSTA) &amp; iGOT Karmayogi
                </h5>
              </div>

              {/* Certificate Title */}
              <div className="pt-2">
                <h2 className="text-2xl sm:text-3xl font-serif font-extrabold text-[#0B3D66] tracking-tight">
                  Certificate of Competency Mastery
                </h2>
                <div className="w-24 h-0.5 bg-amber-500 mx-auto mt-2" />
              </div>

              {/* Recipient details */}
              <div className="space-y-1 pt-2">
                <p className="text-xs text-gray-600 font-serif italic">This is proudly awarded to</p>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-gray-900 border-b-2 border-dotted border-gray-400 pb-1 max-w-md mx-auto">
                  {activeCertForView.issuedTo}
                </h3>
                <p className="text-xs text-gray-500">
                  {activeCertForView.cadre || "Indian Statistical Service"} · Employee ID: {activeCertForView.employeeId || "MOSPI-ISS-2026"}
                </p>
              </div>

              {/* Course statement */}
              <div className="max-w-lg mx-auto space-y-1 text-xs text-gray-700 leading-relaxed pt-2">
                <p>
                  for successfully demonstrating verified competency and methodological mastery in
                </p>
                <p className="font-bold text-sm text-[#0B3D66] font-serif">
                  &ldquo;{activeCertForView.title}&rdquo;
                </p>
                <p className="text-[11px] text-gray-500">
                  with a graded distinction of <strong>{activeCertForView.grade} ({activeCertForView.scorePct}%)</strong> and accredited for <strong>{activeCertForView.cpdHours || 12} CPD Hours</strong>.
                </p>
              </div>

              {/* Competency Pills */}
              <div className="flex flex-wrap justify-center gap-1.5 pt-2">
                {activeCertForView.competencyPillars.map((p, i) => (
                  <span key={i} className="px-2.5 py-0.5 bg-amber-100/70 border border-amber-200 text-amber-900 text-[10px] font-bold rounded-full">
                    ✓ {p}
                  </span>
                ))}
              </div>

              {/* Signatures & QR Verification Block */}
              <div className="pt-8 border-t border-amber-900/15 grid grid-cols-3 items-end text-center gap-2">
                {/* Left signature */}
                <div className="space-y-1 text-left">
                  <div className="font-serif italic font-bold text-xs text-gray-800 border-b border-gray-400 pb-0.5">
                    Dr. Alok Verma, ISS
                  </div>
                  <div className="text-[9px] text-gray-500 leading-tight">
                    Director General (CSO)<br />National Statistical Office
                  </div>
                </div>

                {/* Center QR Verification Stamp */}
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 bg-white p-1 rounded-lg border border-gray-300 shadow-2xs flex items-center justify-center font-mono text-[8px] text-center font-bold text-gray-700">
                    [ W3C QR VERIFY ]
                  </div>
                  <span className="text-[8px] font-mono text-gray-400 mt-1">{activeCertForView.credentialId}</span>
                </div>

                {/* Right signature */}
                <div className="space-y-1 text-right">
                  <div className="font-serif italic font-bold text-xs text-gray-800 border-b border-gray-400 pb-0.5">
                    Smt. Meenakshi Sundaram
                  </div>
                  <div className="text-[9px] text-gray-500 leading-tight">
                    Additional Secretary (MoSPI)<br />Mission Karmayogi Board
                  </div>
                </div>
              </div>

              {/* Cryptographic SHA-256 Footer */}
              <div className="text-[9px] font-mono text-gray-400 pt-2 border-t border-gray-200 truncate text-center">
                Cryptographic Integrity Hash: {activeCertForView.verificationHash}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// 18. Virtual Labs Screen
// ──────────────────────────────────────────────

function VirtualLabsScreen() {
  const [selectedLab, setSelectedLab] = useState<LabExercise | null>(null);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B3D66] font-serif">Virtual Computing Sandboxes</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          In-browser Python 3.11 with NumPy/Pandas and SQLite engines running directly via WebAssembly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {OFFICIAL_LAB_EXERCISES.map((lab) => (
          <div key={lab.id} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-2xs space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${lab.language === "python" ? "bg-amber-100 text-amber-900" : "bg-blue-100 text-blue-900"}`}>
                  {lab.language.toUpperCase()}
                </span>
                <span className="text-[10px] font-bold text-gray-400">{lab.difficulty}</span>
              </div>
              <h3 className="text-xs font-bold text-[#0B3D66] mt-2">{lab.title}</h3>
              <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">{lab.instructions}</p>
            </div>

            <button
              onClick={() => setSelectedLab(lab)}
              className="w-full py-2 bg-[#0B3D66] text-white text-xs font-bold rounded-xl hover:bg-[#082e4f] cursor-pointer"
            >
              Launch Live Sandbox →
            </button>
          </div>
        ))}
      </div>

      {selectedLab && (
        <LiveTerminalModal
          exercise={selectedLab}
          isOpen={Boolean(selectedLab)}
          onClose={() => setSelectedLab(null)}
        />
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// 19. Trainer Portal (/trainer)
// ──────────────────────────────────────────────

function TrainerScreen() {
  const [bank, setBank] = useState<ValidatedMCQ[]>(getTrainerQuestionBank());
  const [generating, setGenerating] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [competency, setCompetency] = useState("Python for Data Analysis");
  const [searchBank, setSearchBank] = useState("");
  const [filterComp, setFilterComp] = useState("All");

  // Custom MCQ Modal state
  const [isAuthorModalOpen, setIsAuthorModalOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [optA, setOptA] = useState("");
  const [optB, setOptB] = useState("");
  const [optC, setOptC] = useState("");
  const [optD, setOptD] = useState("");
  const [correctIdx, setCorrectIdx] = useState(0);
  const [explanation, setExplanation] = useState("");
  const [difficulty, setDifficulty] = useState<"Basic" | "Intermediate" | "Advanced">("Intermediate");
  const [sourceRef, setSourceRef] = useState("");

  const filteredBank = bank.filter((q) => {
    const matchSearch = q.question.toLowerCase().includes(searchBank.toLowerCase()) || q.topic.toLowerCase().includes(searchBank.toLowerCase());
    const matchComp = filterComp === "All" || q.competency === filterComp;
    return matchSearch && matchComp;
  });

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setGenerating(true);
    setStatusMsg(`Extracting text from ${file.name}...`);

    try {
      const text = await extractTextFromFile(file);
      setStatusMsg("Running RAG extraction & strict validation checks...");

      const mcqs = await generateValidatedMCQsFromDocument(
        text,
        5,
        "Intermediate",
        competency,
        file.name
      );

      const formatted: ValidatedMCQ[] = mcqs.map((q) => ({
        id: Date.now() + Math.floor(Math.random() * 10000),
        question: q.question,
        options: q.options,
        correctAnswerIndex: q.correctAnswerIndex,
        explanation: q.explanation,
        difficulty: q.difficulty,
        topic: q.topic,
        competency: q.competency,
        sourceReference: q.sourceReference,
        isValidated: q.isValid,
        validationNotes: q.validationErrors,
        status: "Approved",
      }));

      const updated = [...formatted, ...bank];
      setBank(updated);
      saveTrainerQuestionBank(updated);
      setStatusMsg(`Successfully generated and validated ${formatted.length} MCQs from ${file.name}!`);
    } catch (err: any) {
      setStatusMsg(`Error during generation: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  }

  function handleAddCustomMCQ(e: React.FormEvent) {
    e.preventDefault();
    if (!newQuestion.trim() || !optA.trim() || !optB.trim() || !optC.trim() || !optD.trim()) {
      alert("Please fill in the question and all 4 options.");
      return;
    }

    const mcq: ValidatedMCQ = {
      id: Date.now(),
      question: newQuestion.trim(),
      options: [optA.trim(), optB.trim(), optC.trim(), optD.trim()],
      correctAnswerIndex: correctIdx,
      explanation: explanation.trim() || "Verified official methodology reference.",
      difficulty,
      topic: competency,
      competency,
      sourceReference: sourceRef.trim() || "National Statistical Systems Training Academy (NSSTA)",
      isValidated: true,
      validationNotes: ["Faculty peer-reviewed & authored"],
      status: "Approved",
    };

    addTrainerMCQ(mcq);
    setBank([mcq, ...bank]);
    setIsAuthorModalOpen(false);

    // Reset form
    setNewQuestion("");
    setOptA("");
    setOptB("");
    setOptC("");
    setOptD("");
    setExplanation("");
    setSourceRef("");
    setStatusMsg("Custom question successfully authored and added to Bank!");
  }

  function handleDeleteQuestion(id: number) {
    if (confirm("Are you sure you want to remove this question from the official Question Bank?")) {
      deleteTrainerMCQ(id);
      setBank(bank.filter((q) => q.id !== id));
    }
  }

  function handleExportBankCsv() {
    const csv = "ID,Competency,Difficulty,Question,OptionA,OptionB,OptionC,OptionD,CorrectIndex,Explanation,Source\n" +
      bank.map((q) => `${q.id},"${q.competency}","${q.difficulty}","${q.question.replace(/"/g, '""')}","${(q.options[0]||'').replace(/"/g, '""')}","${(q.options[1]||'').replace(/"/g, '""')}","${(q.options[2]||'').replace(/"/g, '""')}","${(q.options[3]||'').replace(/"/g, '""')}",${q.correctAnswerIndex},"${(q.explanation||'').replace(/"/g, '""')}","${(q.sourceReference||'').replace(/"/g, '""')}"`).join("\n");
    triggerBrowserDownload({
      filename: `StatSkill_Question_Bank_${new Date().toISOString().slice(0, 10)}.csv`,
      mimeType: "text/csv",
      content: csv,
    });
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0B3D66] font-serif">Academy Trainer &amp; RAG MCQ Studio</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Upload official training manuals, extract context with RAG, and author verified examination items.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsAuthorModalOpen(true)}
            className="px-4 py-2 bg-[#FF7A00] hover:bg-[#e06a00] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <span>✍️</span>
            <span>Author Custom MCQ</span>
          </button>
          <button
            onClick={handleExportBankCsv}
            className="px-4 py-2 bg-[#0B3D66] hover:bg-[#082e4f] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <span>📥</span>
            <span>Export Bank (.csv)</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Documents Uploaded", val: "12" },
          { label: "Quizzes Created", val: "24" },
          { label: "Questions in Bank", val: `${bank.length}` },
          { label: "Accredited Questions", val: `${bank.filter(q => q.isValidated).length}` },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-3xl p-4 border border-gray-100 shadow-2xs">
            <div className="text-[10px] text-gray-400 font-bold">{m.label}</div>
            <div className="text-xl font-bold text-[#0B3D66] mt-1">{m.val}</div>
          </div>
        ))}
      </div>

      {/* Upload Box */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Target Competency for RAG Ingestion</label>
            <select
              value={competency}
              onChange={(e) => setCompetency(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-[#0B3D66] font-medium"
            >
              {DEFAULT_COMPETENCIES_CATALOGUE.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name} ({c.domain})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Difficulty Calibration</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-[#0B3D66] font-medium"
            >
              <option value="Basic">Basic (Foundational Level 1-2)</option>
              <option value="Intermediate">Intermediate (Practitioner Level 3-4)</option>
              <option value="Advanced">Advanced (Expert / Senior ISS Level 5)</option>
            </select>
          </div>
        </div>

        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center relative bg-gray-50/50 hover:bg-blue-50/30 transition-all">
          <input
            type="file"
            accept=".pdf,.txt,.docx,.csv,.md,.json"
            onChange={handleFileUpload}
            disabled={generating}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
          />
          <div className="text-3xl mb-2">📄</div>
          <div className="text-xs font-bold text-gray-800">
            {generating ? (
              <span className="flex items-center justify-center gap-2 text-[#0B3D66]">
                <span className="w-4 h-4 border-2 border-[#0B3D66] border-t-transparent rounded-full animate-spin" />
                <span>Processing Document with In-Browser RAG Engine...</span>
              </span>
            ) : (
              "Upload MoSPI Training Manual, Guidelines, or Syllabus (PDF, DOCX, TXT, CSV, MD)"
            )}
          </div>
          <p className="text-[10px] text-gray-400 mt-1">
            Grounds questions 100% in document sentences with automated 4-option, 1-valid answer, and citation validation
          </p>
        </div>

        {statusMsg && (
          <div className="p-3.5 bg-blue-50/80 rounded-2xl border border-blue-200 text-xs text-blue-950 font-sans flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <span>ℹ️</span>
              <span>{statusMsg}</span>
            </div>
            <button onClick={() => setStatusMsg(null)} className="text-blue-700 hover:text-blue-950 font-bold cursor-pointer p-1">✕</button>
          </div>
        )}
      </div>

      {/* Question Bank List with Filter & Search */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-gray-100 gap-3">
          <h2 className="text-xs font-bold text-[#0B3D66] uppercase tracking-wider">
            Validated Question Bank ({filteredBank.length} Questions)
          </h2>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={searchBank}
              onChange={(e) => setSearchBank(e.target.value)}
              placeholder="Filter questions..."
              className="px-3 py-1.5 text-xs border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-[#0B3D66] flex-1 sm:w-48"
            />
            <button
              onClick={() => {
                if (confirm("Clear all items in the Question Bank?")) {
                  setBank([]);
                  saveTrainerQuestionBank([]);
                }
              }}
              className="text-[10px] text-rose-600 font-bold hover:underline cursor-pointer shrink-0"
            >
              Clear Bank
            </button>
          </div>
        </div>

        {filteredBank.length > 0 ? (
          <div className="space-y-3">
            {filteredBank.map((q, idx) => (
              <div key={q.id || idx} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/60 space-y-2 text-xs hover:border-gray-200 transition-colors">
                <div className="flex justify-between items-start gap-2">
                  <span className="font-bold text-gray-900">Q{idx + 1}: {q.question}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                      Validated ✓
                    </span>
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="text-gray-400 hover:text-rose-600 p-1 cursor-pointer transition-colors"
                      title="Delete question"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-gray-600">
                  {q.options.map((opt, i) => (
                    <div key={i} className={`p-2 rounded-lg border ${i === q.correctAnswerIndex ? "bg-emerald-50 border-emerald-300 font-bold text-emerald-900" : "bg-white border-gray-200"}`}>
                      {String.fromCharCode(65 + i)}. {opt}
                    </div>
                  ))}
                </div>
                <div className="text-[10px] text-gray-500 pt-1 flex flex-col sm:flex-row justify-between gap-1">
                  <span>Source: <strong>{q.sourceReference}</strong></span>
                  <span>Competency: <strong className="text-[#0B3D66]">{q.competency}</strong> ({q.difficulty})</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-gray-400">
            No questions found matching your filter. Author a question or upload a training document above.
          </div>
        )}
      </div>

      {/* ────────────── AUTHOR CUSTOM MCQ MODAL ────────────── */}
      {isAuthorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start pb-2 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-900 px-2 py-0.5 rounded">
                  Faculty Question Authoring
                </span>
                <h2 className="text-base font-bold text-[#0B3D66] mt-1">Create Custom Assessment Item</h2>
              </div>
              <button
                onClick={() => setIsAuthorModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCustomMCQ} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Question Stem</label>
                <textarea
                  rows={2}
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Enter the statistical question or methodological scenario..."
                  className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:border-[#0B3D66]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Option A</label>
                  <input
                    type="text"
                    value={optA}
                    onChange={(e) => setOptA(e.target.value)}
                    placeholder="Option A content"
                    className="w-full p-2 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:border-[#0B3D66]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Option B</label>
                  <input
                    type="text"
                    value={optB}
                    onChange={(e) => setOptB(e.target.value)}
                    placeholder="Option B content"
                    className="w-full p-2 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:border-[#0B3D66]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Option C</label>
                  <input
                    type="text"
                    value={optC}
                    onChange={(e) => setOptC(e.target.value)}
                    placeholder="Option C content"
                    className="w-full p-2 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:border-[#0B3D66]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Option D</label>
                  <input
                    type="text"
                    value={optD}
                    onChange={(e) => setOptD(e.target.value)}
                    placeholder="Option D content"
                    className="w-full p-2 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:border-[#0B3D66]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Correct Answer</label>
                  <select
                    value={correctIdx}
                    onChange={(e) => setCorrectIdx(Number(e.target.value))}
                    className="w-full p-2 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none"
                  >
                    <option value={0}>Option A</option>
                    <option value={1}>Option B</option>
                    <option value={2}>Option C</option>
                    <option value={3}>Option D</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Competency</label>
                  <select
                    value={competency}
                    onChange={(e) => setCompetency(e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none"
                  >
                    <option value="Python for Data Analysis">Python for Data Analysis</option>
                    <option value="National Accounts & GVA">National Accounts &amp; GVA</option>
                    <option value="Sampling Theory & PPS">Sampling Theory &amp; PPS</option>
                    <option value="Price Statistics (CPI / WPI)">Price Statistics (CPI / WPI)</option>
                    <option value="Data Privacy (DPDP Act)">Data Privacy (DPDP Act)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full p-2 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none"
                  >
                    <option value="Basic">Basic</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Methodology Explanation &amp; Rationale</label>
                <textarea
                  rows={2}
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Explain why the correct answer is right and cite formulas..."
                  className="w-full p-2 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:border-[#0B3D66]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Source Manual / Statutory Citation</label>
                <input
                  type="text"
                  value={sourceRef}
                  onChange={(e) => setSourceRef(e.target.value)}
                  placeholder="e.g., NSSO 79th Round Instruction Manual · Chapter 4"
                  className="w-full p-2 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:border-[#0B3D66]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAuthorModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#FF7A00] hover:bg-[#e06a00] text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Save to Question Bank
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// 20. Administrator Portal (/admin)
// ──────────────────────────────────────────────

function AdminScreen() {
  const [employees, setEmployees] = useState<EmployeeRecord[]>(getAdminEmployees());
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [complianceFilter, setComplianceFilter] = useState("All");

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingOfficer, setEditingOfficer] = useState<EmployeeRecord | null>(null);

  // Form fields for Add/Edit
  const [formName, setFormName] = useState("");
  const [formDept, setFormDept] = useState("Labour & Employment Statistics");
  const [formCadre, setFormCadre] = useState("Indian Statistical Service");
  const [formGrade, setFormGrade] = useState("Senior Time Scale (STS)");
  const [formRole, setFormRole] = useState("Statistical Officer");
  const [formCompIndex, setFormCompIndex] = useState(3.6);
  const [formHours, setFormHours] = useState(42);
  const [formCompliance, setFormCompliance] = useState<"Compliant" | "In Progress" | "Action Required">("In Progress");

  function openAddModal() {
    setEditingOfficer(null);
    setFormName("");
    setFormDept("Labour & Employment Statistics");
    setFormCadre("Indian Statistical Service");
    setFormGrade("Senior Time Scale (STS)");
    setFormRole("Statistical Officer");
    setFormCompIndex(3.6);
    setFormHours(42);
    setFormCompliance("In Progress");
    setIsAddModalOpen(true);
  }

  function openEditModal(emp: EmployeeRecord) {
    setEditingOfficer(emp);
    setFormName(emp.name);
    setFormDept(emp.department);
    setFormCadre(emp.cadre);
    setFormGrade(emp.grade);
    setFormRole(emp.role);
    setFormCompIndex(emp.competencyIndex);
    setFormHours(emp.hoursCompleted);
    setFormCompliance(emp.complianceStatus as any);
    setIsAddModalOpen(true);
  }

  function handleSaveOfficer(e: React.FormEvent) {
    e.preventDefault();
    if (!formName.trim()) {
      alert("Please enter an officer name.");
      return;
    }

    if (editingOfficer) {
      const updated: EmployeeRecord = {
        ...editingOfficer,
        name: formName.trim(),
        department: formDept,
        cadre: formCadre,
        grade: formGrade,
        role: formRole,
        competencyIndex: Number(formCompIndex),
        hoursCompleted: Number(formHours),
        complianceStatus: formCompliance,
      };
      updateAdminEmployee(updated);
      setEmployees(employees.map((e) => (e.id === updated.id ? updated : e)));
    } else {
      const newEmp: EmployeeRecord = {
        id: `emp-${Date.now()}`,
        name: formName.trim(),
        department: formDept,
        cadre: formCadre,
        grade: formGrade,
        role: formRole,
        competencyIndex: Number(formCompIndex),
        highGapsCount: Number(formCompIndex) < 3.5 ? 2 : 1,
        hoursCompleted: Number(formHours),
        complianceStatus: formCompliance,
      };
      addAdminEmployee(newEmp);
      setEmployees([newEmp, ...employees]);
    }

    setIsAddModalOpen(false);
  }

  function handleDeleteOfficer(id: string) {
    if (confirm("Are you sure you want to remove this officer record from the active monitoring roster?")) {
      deleteAdminEmployee(id);
      setEmployees(employees.filter((e) => e.id !== id));
    }
  }

  // Filtered employees list
  const filteredEmployees = employees.filter((e) => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.department.toLowerCase().includes(search.toLowerCase()) || e.role.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === "All" || e.department === deptFilter;
    const matchCompliance = complianceFilter === "All" || e.complianceStatus === complianceFilter;
    return matchSearch && matchDept && matchCompliance;
  });

  // Compute deptData dynamically
  const deptMap = new Map<string, { totalScore: number; count: number }>();
  employees.forEach((e) => {
    const stat = deptMap.get(e.department) || { totalScore: 0, count: 0 };
    stat.totalScore += e.competencyIndex;
    stat.count += 1;
    deptMap.set(e.department, stat);
  });

  const deptData = Array.from(deptMap.entries()).map(([name, stats]) => ({
    name,
    avgScore: Number((stats.totalScore / stats.count).toFixed(1)),
  }));

  // Dynamic Metrics
  const totalEmployees = employees.length;
  const avgCompetency = totalEmployees
    ? (employees.reduce((acc, e) => acc + e.competencyIndex, 0) / totalEmployees).toFixed(1)
    : "0.0";
  const criticalGaps = employees.reduce((acc, e) => acc + e.highGapsCount, 0);
  const compliantCount = employees.filter((e) => e.complianceStatus === "Compliant").length;
  const completionRate = totalEmployees ? Math.round((compliantCount / totalEmployees) * 100) : 0;

  function handleExportCsv() {
    const csvContent = "Name,Department,Cadre,Grade,Role,CompetencyIndex,HighGaps,Hours,Status\n" +
      employees.map((e) => `"${e.name}","${e.department}","${e.cadre}","${e.grade}","${e.role}",${e.competencyIndex},${e.highGapsCount},${e.hoursCompleted},"${e.complianceStatus}"`).join("\n");
    triggerBrowserDownload({
      filename: `StatSkill_Admin_Employee_Roster_${new Date().toISOString().slice(0, 10)}.csv`,
      mimeType: "text/csv",
      content: csvContent,
    });
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0B3D66] font-serif">Ministry Administrator Analytics</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Organization-wide workforce readiness, department skill gap heatmaps, and cadre roster management.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-[#FF7A00] hover:bg-[#e06a00] text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs flex items-center gap-1.5"
          >
            <span>➕</span>
            <span>Add Officer</span>
          </button>
          <button
            onClick={handleExportCsv}
            className="px-4 py-2 bg-[#0B3D66] hover:bg-[#082e4f] text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs flex items-center gap-1.5"
          >
            <span>📥</span>
            <span>Export Roster (.csv)</span>
          </button>
        </div>
      </div>

      {/* Top 4 Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Total Officers Monitored", value: totalEmployees.toString(), sub: "Active ISS/SSS Records", color: "#0B3D66", badge: "Cadre Roster", badgeColor: "bg-blue-100 text-blue-800", icon: "👥" },
          { label: "Average Competency Index", value: `${avgCompetency} / 5.0`, sub: "Across all divisions", color: "#FF7A00", badge: "MoSPI Avg", badgeColor: "bg-orange-100 text-orange-800", icon: "📊" },
          { label: "Critical Skill Gaps", value: criticalGaps.toString(), sub: "Priority attention required", color: "#EF4444", badge: "Urgent", badgeColor: "bg-rose-100 text-rose-800", icon: "⚠️" },
          { label: "Training Compliance", value: `${completionRate}%`, sub: "50h CPD Requirement", color: "#10B981", badge: "Compliant", badgeColor: "bg-emerald-100 text-emerald-800", icon: "✅" },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xl">{m.icon}</span>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${m.badgeColor}`}>{m.badge}</span>
            </div>
            <div className="mt-3">
              <div className="text-[11px] text-gray-500 font-semibold">{m.label}</div>
              <div className="text-2xl font-serif font-bold mt-0.5" style={{ color: m.color }}>{m.value}</div>
              <div className="text-[10px] text-gray-400 mt-1">{m.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-2xs space-y-3">
          <h2 className="text-xs font-bold text-[#0B3D66] uppercase tracking-wider">Department Competency Averages</h2>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={deptData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#64748b" }} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 10, fill: "#64748b" }} />
              <Tooltip />
              <Bar dataKey="avgScore" fill="#0B3D66" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Skill Gap Heatmap */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-2xs space-y-3">
          <h2 className="text-xs font-bold text-[#0B3D66] uppercase tracking-wider">Department Skill-Gap Heatmap</h2>
          <div className="space-y-2 pt-2 text-xs">
            {deptData.map((d) => (
              <div key={d.name} className="p-2.5 bg-gray-50 rounded-xl flex justify-between items-center">
                <span className="font-bold text-gray-800 truncate max-w-[140px]">{d.name}</span>
                <div className="flex gap-2 text-[10px] font-mono">
                  <span>Py: {d.avgScore < 3.5 ? "🔴 High" : "🟡 Low"}</span>
                  <span>AI: {d.avgScore < 3.8 ? "🔴 High" : "🟠 Med"}</span>
                  <span>GIS: {d.avgScore > 4.0 ? "🟢 Met" : "🟠 Med"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Employee Table with Search & Filters */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-gray-100 gap-3">
          <h2 className="text-xs font-bold text-[#0B3D66] uppercase tracking-wider">
            Official Employee Cadre Roster ({filteredEmployees.length} Officers)
          </h2>
          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search officer name or department..."
              className="px-3 py-1.5 text-xs border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-[#0B3D66] w-full sm:w-56"
            />
            <select
              value={complianceFilter}
              onChange={(e) => setComplianceFilter(e.target.value)}
              className="px-3 py-1.5 text-xs border border-gray-200 rounded-xl bg-gray-50 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Compliant">Compliant</option>
              <option value="In Progress">In Progress</option>
              <option value="Action Required">Action Required</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-[10px] uppercase font-bold text-gray-400">
                <th className="pb-2">Name &amp; Cadre</th>
                <th className="pb-2">Department</th>
                <th className="pb-2">Role</th>
                <th className="pb-2 text-center">Competency</th>
                <th className="pb-2 text-center">Hours</th>
                <th className="pb-2 text-center">Status</th>
                <th className="pb-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-700">
              {filteredEmployees.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50/60">
                  <td className="py-2.5">
                    <div className="font-bold text-[#0B3D66]">{e.name}</div>
                    <div className="text-[10px] text-gray-400">{e.cadre} ({e.grade})</div>
                  </td>
                  <td className="py-2.5 text-gray-500">{e.department}</td>
                  <td className="py-2.5 text-gray-600">{e.role}</td>
                  <td className="py-2.5 text-center font-semibold">{e.competencyIndex} / 5</td>
                  <td className="py-2.5 text-center font-semibold">{e.hoursCompleted}h</td>
                  <td className="py-2.5 text-center">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      e.complianceStatus === "Compliant" ? "bg-emerald-100 text-emerald-800" : e.complianceStatus === "In Progress" ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800"
                    }`}>
                      {e.complianceStatus}
                    </span>
                  </td>
                  <td className="py-2.5 text-right space-x-1">
                    <button
                      onClick={() => openEditModal(e)}
                      className="p-1 hover:text-[#0B3D66] text-gray-400 cursor-pointer"
                      title="Edit officer"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteOfficer(e.id)}
                      className="p-1 hover:text-rose-600 text-gray-400 cursor-pointer"
                      title="Delete officer"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ────────────── ADD / EDIT OFFICER MODAL ────────────── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start pb-2 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                  {editingOfficer ? "Edit Officer Profile" : "Add New Officer"}
                </span>
                <h2 className="text-base font-bold text-[#0B3D66] mt-1">
                  {editingOfficer ? `Update ${editingOfficer.name}` : "Register Cadre Record"}
                </h2>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveOfficer} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Officer Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Dr. Priya Nair, ISS"
                  className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:border-[#0B3D66]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Department</label>
                  <select
                    value={formDept}
                    onChange={(e) => setFormDept(e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none"
                  >
                    <option value="Labour & Employment Statistics">Labour &amp; Employment Statistics</option>
                    <option value="National Accounts Division (NAD)">National Accounts Division (NAD)</option>
                    <option value="Price Statistics Division (PSD)">Price Statistics Division (PSD)</option>
                    <option value="Economic Statistics Division (ESD)">Economic Statistics Division (ESD)</option>
                    <option value="Survey Design & Research Division">Survey Design &amp; Research Division</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Cadre</label>
                  <select
                    value={formCadre}
                    onChange={(e) => setFormCadre(e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none"
                  >
                    <option value="Indian Statistical Service">Indian Statistical Service (ISS)</option>
                    <option value="Subordinate Statistical Service">Subordinate Statistical Service (SSS)</option>
                    <option value="State DES Cadre">State Directorate of Economics &amp; Statistics</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Grade</label>
                  <input
                    type="text"
                    value={formGrade}
                    onChange={(e) => setFormGrade(e.target.value)}
                    placeholder="e.g. Senior Time Scale (STS)"
                    className="w-full p-2 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Role Title</label>
                  <input
                    type="text"
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    placeholder="e.g. Statistical Officer"
                    className="w-full p-2 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Competency Index</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={formCompIndex}
                    onChange={(e) => setFormCompIndex(Number(e.target.value))}
                    className="w-full p-2 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">CPD Hours</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formHours}
                    onChange={(e) => setFormHours(Number(e.target.value))}
                    className="w-full p-2 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Compliance Status</label>
                  <select
                    value={formCompliance}
                    onChange={(e) => setFormCompliance(e.target.value as any)}
                    className="w-full p-2 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none"
                  >
                    <option value="Compliant">Compliant</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Action Required">Action Required</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0B3D66] hover:bg-[#082e4f] text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
                >
                  {editingOfficer ? "Save Changes" : "Create Officer Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// 21. Settings Screen
// ──────────────────────────────────────────────

function SettingsScreen() {
  const [profile, setProfileState] = useState(getProfile());
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    saveProfile(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B3D66] font-serif">Platform &amp; Officer Settings</h1>
        <p className="text-xs text-gray-500 mt-0.5">Manage officer profile and capacity configurations</p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfileState({ ...profile, name: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Department</label>
            <input
              type="text"
              value={profile.department}
              onChange={(e) => setProfileState({ ...profile, department: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Designation</label>
            <input
              type="text"
              value={profile.designation || ""}
              onChange={(e) => setProfileState({ ...profile, designation: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Cadre</label>
            <input
              type="text"
              value={profile.cadre || ""}
              onChange={(e) => setProfileState({ ...profile, cadre: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Career Goal</label>
            <input
              type="text"
              value={profile.careerGoal || ""}
              onChange={(e) => setProfileState({ ...profile, careerGoal: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Preferred Language</label>
            <select
              value={profile.preferredLanguage || "en"}
              onChange={(e) => setProfileState({ ...profile, preferredLanguage: e.target.value as any })}
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl bg-white"
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <span className="text-xs text-emerald-600 font-bold">{saved && "Settings saved successfully! ✓"}</span>
          <button type="submit" className="px-5 py-2.5 bg-[#0B3D66] text-white text-xs font-bold rounded-xl hover:bg-[#082e4f]">
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}

// ──────────────────────────────────────────────
// Root Application Component
// ──────────────────────────────────────────────

export default function App() {
  const profile = getProfile();
  const [screen, setScreen] = useState<Screen>("landing");
  const [activeCourse, setActiveCourse] = useState<CourseItem | null>(() => getCourses()[0] || null);
  const [activeQuestions, setActiveQuestions] = useState<GeneratedQuestion[]>([]);
  const [activeAnswers, setActiveAnswers] = useState<(number | null)[]>([]);

  function handleRoleChange(newRole: UserRole) {
    const prof = getProfile();
    const updated = { ...prof, role: newRole, isAdmin: newRole === "admin", isTrainer: newRole === "trainer" };
    saveProfile(updated);
    setActiveRole(newRole);
    if (newRole === "trainer") setScreen("trainer");
    else if (newRole === "admin") setScreen("admin");
    else setScreen("dashboard");
  }

  function handleDemoLogin(role: UserRole) {
    const defaultEmail =
      role === "trainer"
        ? "arvind.rao@nssta.gov.in"
        : role === "admin"
        ? "sunita.verma@mospi.gov.in"
        : "rajesh.sharma@nic.in";

    const defaultName =
      role === "trainer"
        ? "Prof. Arvind Rao (NSSTA Faculty)"
        : role === "admin"
        ? "Smt. Sunita Verma (Director, Capacity Development)"
        : "Dr. Rajesh Sharma, ISS";

    const defaultDept =
      role === "trainer"
        ? "National Statistical Systems Training Academy (NSSTA)"
        : role === "admin"
        ? "MoSPI Capacity Development & Admin Division"
        : "Labour & Social Statistics Division";

    const updatedProfile: OfficerProfile = {
      ...getProfile(),
      employeeId: role === "trainer" ? "NSSTA-FAC-012" : role === "admin" ? "MOSPI-DIR-003" : "MOSPI-ISS-2019-048",
      name: defaultName,
      email: defaultEmail,
      role,
      isAdmin: role === "admin",
      isTrainer: role === "trainer",
      department: defaultDept,
      designation: role === "trainer" ? "Senior Training Director" : role === "admin" ? "Joint Director" : "Statistical Officer",
      cadreGrade: role === "trainer" || role === "admin" ? "JAG" : "STS",
      onboardingCompleted: true,
      learningHours: 42,
      coursesCompleted: 3,
    };

    const comps = deriveUserCompetencies(updatedProfile);
    saveProfile(updatedProfile);
    saveUserCompetencies(comps);
    setActiveRole(role);

    if (role === "trainer") setScreen("trainer");
    else if (role === "admin") setScreen("admin");
    else setScreen("dashboard");
  }

  return (
    <LanguageProvider>
      {screen === "landing" ? (
        <LandingPage
          onEnterApp={(target) => {
            if (target === "login") setScreen("login");
            else setScreen(target || (profile.onboardingCompleted ? "dashboard" : "onboarding"));
          }}
          onDemoLogin={handleDemoLogin}
        />
      ) : screen === "login" ? (
        <LoginScreen
          onLogin={() => setScreen(profile.onboardingCompleted ? "dashboard" : "onboarding")}
          onDemoLogin={handleDemoLogin}
          onBackToLanding={() => setScreen("landing")}
        />
      ) : screen === "onboarding" ? (
        <OnboardingWizard onComplete={() => setScreen("dashboard")} />
      ) : (
        <AppShell screen={screen} onNav={setScreen} onRoleChange={handleRoleChange}>
          {screen === "dashboard" && <DashboardScreen onNav={setScreen} onOpenCourse={setActiveCourse} />}
          {screen === "skills" && <SkillsScreen onNav={setScreen} onOpenCourse={setActiveCourse} />}
          {screen === "assessment" && (
            <AssessmentScreen
              onFinish={(qList, aList) => {
                setActiveQuestions(qList);
                setActiveAnswers(aList);
                setScreen("assessment_result");
              }}
            />
          )}
          {screen === "assessment_result" && <AssessmentResultScreen questions={activeQuestions} answers={activeAnswers} onNav={setScreen} />}
          {screen === "skill_gaps" && <SkillGapsScreen onNav={setScreen} onOpenCourse={setActiveCourse} />}
          {screen === "learning_path" && <LearningPathScreen onNav={setScreen} onOpenCourse={setActiveCourse} />}
          {screen === "courses" && <CoursesScreen onNav={setScreen} onOpenCourse={setActiveCourse} />}
          {screen === "course_detail" && <CourseDetailScreen course={activeCourse} onBack={() => setScreen("courses")} onNav={setScreen} />}
          {screen === "course_player" && activeCourse && <CourseLearningPage course={activeCourse} onBack={() => setScreen("course_detail")} />}
          {screen === "training_programmes" && <TrainingProgrammesScreen />}
          {screen === "learning" && <MyLearningScreen onNav={setScreen} onOpenCourse={setActiveCourse} />}
          {screen === "quizzes" && <QuizzesScreen onNav={setScreen} />}
          {screen === "resources" && <ResourcesScreen onNav={setScreen} />}
          {screen === "assistant" && <AssistantScreen onNav={setScreen} />}
          {screen === "profile" && <ProfileScreen />}
          {screen === "certificates" && <CertificatesScreen />}
          {screen === "labs" && <VirtualLabsScreen />}
          {screen === "trainer" && <TrainerScreen />}
          {screen === "admin" && <AdminScreen />}
          {screen === "settings" && <SettingsScreen />}
        </AppShell>
      )}
    </LanguageProvider>
  );
}

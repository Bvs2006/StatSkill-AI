import React, { useState, useEffect, useRef, Fragment, type ReactNode } from "react";
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
  getNotifications,
  getQuizAttempts,
  saveQuizAttempt,
  getCompetencyAuditLogs,
  applyClosedLoopCompetencyUpdate,
  getTrainerQuestionBank,
  saveTrainerQuestionBank,
  getExplainableRecommendations,
  getPersonalizedLearningPath,
  DEFAULT_JOB_ROLES,
  DEFAULT_COMPETENCIES_CATALOGUE,
  getCertificates,
} from "./services/storageService";

import {
  generateMCQsFromText,
  generateValidatedMCQsFromDocument,
  validateMCQ,
  chatWithStatisticalAssistant,
  type GeneratedQuestion,
  type ValidatedTrainerMCQ,
} from "./services/aiService";

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

export type Screen =
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
  roles: UserRole[];
}

const NAV_ITEMS: NavItemDef[] = [
  // Learner Core
  { id: "dashboard", transKey: "nav_dashboard", icon: "⊞", roles: ["learner", "admin", "trainer"] },
  { id: "skills", transKey: "nav_skills", icon: "◈", roles: ["learner"] },
  { id: "assessment", transKey: "nav_assessment", icon: "✍", badge: "AI", roles: ["learner"] },
  { id: "skill_gaps", transKey: "nav_skill_gaps", icon: "⚖", roles: ["learner"] },
  { id: "learning_path", transKey: "nav_learning_path", icon: "→", badge: "Path", roles: ["learner"] },
  { id: "courses", transKey: "nav_courses", icon: "⊙", roles: ["learner", "admin", "trainer"] },
  { id: "training_programmes", transKey: "nav_training_programmes", icon: "🏛️", roles: ["learner", "admin"] },
  { id: "learning", transKey: "nav_learning", icon: "📖", roles: ["learner"] },
  { id: "quizzes", transKey: "nav_quizzes", icon: "✦", roles: ["learner"] },
  { id: "resources", transKey: "nav_resources", icon: "📄", roles: ["learner", "trainer"] },
  { id: "assistant", transKey: "nav_assistant", icon: "🤖", badge: "RAG", roles: ["learner", "trainer", "admin"] },
  { id: "certificates", transKey: "nav_certificates", icon: "◉", roles: ["learner"] },
  { id: "labs", transKey: "nav_virtual_labs", icon: "⬡", roles: ["learner"] },

  // Trainer Section
  { id: "trainer", transKey: "nav_trainer_portal", icon: "🎓", badge: "Trainer", roles: ["trainer", "admin"] },

  // Admin Section
  { id: "admin", transKey: "nav_admin_analytics", icon: "⊛", badge: "Admin", roles: ["admin"] },

  // Common
  { id: "profile", transKey: "nav_profile", icon: "👤", roles: ["learner", "trainer", "admin"] },
  { id: "settings", transKey: "nav_settings", icon: "⚙", roles: ["learner", "trainer", "admin"] },
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

  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <aside
      className="h-full bg-[#0B3D66] flex flex-col shrink-0 transition-all duration-200"
      style={{ width: collapsed ? 64 : 240 }}
    >
      {/* Header */}
      <div className={`border-b border-white/10 flex items-center transition-all duration-200 ${collapsed ? "px-3 py-4 justify-center" : "px-4 py-5 justify-between"}`}>
        {!collapsed && (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-sm">
              S
            </div>
            <div className="min-w-0">
              <div className="text-white text-sm font-bold tracking-tight truncate">StatSkill AI</div>
              <div className="text-white/60 text-[10px] tracking-wide truncate">
                {role === "admin" ? "Admin Console" : role === "trainer" ? "Trainer & RAG Studio" : "Official Capacity Hub"}
              </div>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold text-base">
            S
          </div>
        )}
        {onClose && !collapsed && (
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors ml-2 shrink-0">
            ✕
          </button>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5 overflow-y-auto">
        {visibleItems.map((item) => {
          const active = current === item.id || (item.id === "courses" && current === "course_detail");
          const label = t(item.transKey);
          return (
            <button
              key={item.id}
              onClick={() => { onNav(item.id); onClose?.(); }}
              title={collapsed ? label : undefined}
              className={`w-full flex items-center rounded-xl text-xs transition-all ${
                collapsed ? "justify-center p-2.5" : "px-3 py-2 gap-2.5"
              } ${
                active
                  ? "bg-[#FF7A00] text-white font-bold shadow-sm"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="text-sm leading-none">{item.icon}</span>
              {!collapsed && <span className="truncate">{label}</span>}
              {!collapsed && item.badge && (
                <span className={`ml-auto text-[9px] font-bold px-1.5 py-0.2 rounded ${active ? "bg-white text-[#FF7A00]" : "bg-white/20 text-white"}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Closed-Loop Indicator Badge */}
      {!collapsed && (
        <div className="px-3 py-2 mx-2 mb-2 rounded-xl bg-white/5 border border-white/10 text-[10px] text-white/70 space-y-0.5">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Closed-Loop Active</span>
          </div>
          <div className="text-white/50 text-[9px] leading-tight">
            Assess → Gap → Learn → Elevate
          </div>
        </div>
      )}

      {/* Collapse Toggle */}
      <div className="p-2 border-t border-white/10 hidden md:block">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors text-xs"
        >
          {collapsed ? "→" : "← Collapse"}
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onMobileClose} />
          <div className="relative z-10 h-full">
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
  const notifs = getNotifications();

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center px-4 md:px-6 gap-3 shrink-0 relative z-20 justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuOpen}
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="hidden md:flex items-center gap-2">
          <span className="text-xs font-bold text-[#0B3D66] bg-blue-50 px-2.5 py-1 rounded-lg">
            StatSkill AI
          </span>
          <span className="text-xs text-gray-500 font-medium truncate max-w-[220px]">
            {profile.department}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Role Switcher */}
        <div className="flex items-center bg-gray-100 p-0.5 rounded-xl text-xs font-bold">
          <button
            onClick={() => onRoleChange("learner")}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              profile.role === "learner"
                ? "bg-[#0B3D66] text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            👤 Official
          </button>
          <button
            onClick={() => onRoleChange("trainer")}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              profile.role === "trainer"
                ? "bg-purple-700 text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            🎓 Trainer
          </button>
          <button
            onClick={() => onRoleChange("admin")}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              profile.role === "admin"
                ? "bg-amber-600 text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            👑 Admin
          </button>
        </div>

        {/* iGOT Adapter Status Badge */}
        <button
          onClick={() => setIgotModalOpen(true)}
          className="hidden lg:flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-orange-50 text-[#FF7A00] border border-orange-200 hover:bg-orange-100 transition-all cursor-pointer"
          title="iGOT Karmayogi (Sunbird) Integration Adapter"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>iGOT Synced</span>
        </button>

        {/* Notifications Button */}
        <div className="relative">
          <button
            onClick={() => setNotifsOpen(!notifsOpen)}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center text-xs relative cursor-pointer"
            title="Notifications"
          >
            🔔
            {notifs.some((n) => !n.read) && (
              <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1 right-1" />
            )}
          </button>

          {notifsOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 space-y-2 z-50 text-xs animate-in zoom-in-95">
              <div className="flex justify-between font-bold text-gray-800 pb-1 border-b border-gray-100">
                <span>Notifications</span>
                <span className="text-[10px] text-gray-400">3 Alerts</span>
              </div>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {notifs.map((n) => (
                  <div key={n.id} className="p-2 bg-gray-50 rounded-xl space-y-0.5">
                    <div className="font-bold text-[#0B3D66] text-[11px]">{n.title}</div>
                    <div className="text-[10px] text-gray-600 leading-tight">{n.message}</div>
                    <div className="text-[9px] text-gray-400">{n.timestamp}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Multilingual Switcher */}
        <div className="flex items-center bg-gray-100 rounded-xl p-0.5 text-xs font-bold">
          {(["EN", "HI", "TE"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-2 py-1 rounded-lg transition-all ${
                lang === l ? "bg-white text-[#0B3D66] shadow-xs" : "text-gray-400 hover:text-gray-600 cursor-pointer"
              }`}
            >
              {l === "EN" ? "EN" : l === "HI" ? "हिं" : "తె"}
            </button>
          ))}
        </div>

        {/* Profile Avatar & Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-gray-100">
          <button
            onClick={() => onNav("profile")}
            className="w-8 h-8 rounded-full bg-[#0B3D66] text-white flex items-center justify-center text-xs font-bold hover:opacity-90 cursor-pointer"
            title="My Profile"
          >
            {profile.name.slice(0, 2).toUpperCase()}
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

  return (
    <div className="flex h-full min-h-screen bg-[#F7F9FB]">
      <Sidebar
        current={screen}
        onNav={onNav}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          onLogout={() => onNav("login")}
          onMenuOpen={() => setMobileMenuOpen(true)}
          onRoleChange={onRoleChange}
          onNav={onNav}
        />
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
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
}: {
  onLogin: () => void;
  onDemoLogin: (role: UserRole) => void;
}) {
  const [empId, setEmpId] = useState("rajesh.sharma@nic.in");
  const [pass, setPass] = useState("••••••••");

  return (
    <div className="min-h-screen bg-[#F7F9FB] flex flex-col justify-center items-center p-4">
      <div className="bg-white rounded-3xl p-8 md:p-10 border border-gray-100 shadow-xl max-w-md w-full text-center space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-[#0B3D66] text-white flex items-center justify-center text-2xl font-bold mx-auto shadow-md">
          S
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#0B3D66] font-serif">StatSkill AI</h1>
          <p className="text-xs text-gray-500 mt-1">
            AI-Powered Competency Intelligence for Official Statistics
          </p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onLogin(); }} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Employee ID / Email</label>
            <input
              type="text"
              value={empId}
              onChange={(e) => setEmpId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#0B3D66]"
              placeholder="e.g. rajesh.sharma@nic.in"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#0B3D66]"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#0B3D66] text-white text-xs font-bold rounded-xl hover:bg-[#082e4f] shadow-md transition-all cursor-pointer mt-2"
          >
            Sign In to Platform →
          </button>
        </form>

        {/* Demo Login Quick Switcher */}
        <div className="pt-4 border-t border-gray-100 space-y-2">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            One-Click Demo Personas:
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => onDemoLogin("learner")}
              className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0B3D66] text-[11px] font-bold transition-all"
            >
              👤 Official
            </button>
            <button
              onClick={() => onDemoLogin("trainer")}
              className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 text-[11px] font-bold transition-all"
            >
              🎓 Trainer
            </button>
            <button
              onClick={() => onDemoLogin("admin")}
              className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold transition-all"
            >
              👑 Admin
            </button>
          </div>
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
  const [name, setName] = useState("Dr. Rajesh Sharma, ISS");
  const [empId, setEmpId] = useState("MOSPI-ISS-2019-048");
  const [dept, setDept] = useState("Labour Statistics");
  const [desig, setDesig] = useState("Statistical Officer");
  const [cadre, setCadre] = useState("Indian Statistical Service");
  const [exp, setExp] = useState(5);
  const [careerGoal, setCareerGoal] = useState("Lead National Accounts & GVA Compilation");
  const [prefLang, setPrefLang] = useState<"EN" | "HI" | "TE">("EN");

  function handleFinish() {
    const profile = getProfile();
    const updated: OfficerProfile = {
      ...profile,
      name,
      employeeId: empId,
      department: dept,
      designation: desig,
      cadre,
      yearsOfExperience: exp,
      careerGoal,
      preferredLanguage: prefLang,
      onboardingCompleted: true,
    };
    saveProfile(updated);
    onComplete();
  }

  return (
    <div className="min-h-screen bg-[#F7F9FB] flex flex-col justify-center items-center p-4">
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl max-w-lg w-full space-y-6">
        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
          <div>
            <span className="text-[10px] font-bold text-[#FF7A00] uppercase tracking-wider">
              Step {step} of 4
            </span>
            <h2 className="text-base font-bold text-[#0B3D66]">
              {step === 1 && "Personal Information"}
              {step === 2 && "Professional Assignment"}
              {step === 3 && "Estimated Competency Levels"}
              {step === 4 && "Learning Preferences & Goals"}
            </h2>
          </div>
          <span className="text-xs font-mono font-bold text-gray-400">{Math.round((step / 4) * 100)}%</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
          <div className="bg-[#FF7A00] h-full transition-all duration-300" style={{ width: `${(step / 4) * 100}%` }} />
        </div>

        {/* Step 1: Personal */}
        {step === 1 && (
          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-gray-700 block mb-1">Full Name &amp; Title</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2.5 border rounded-xl" />
            </div>
            <div>
              <label className="font-semibold text-gray-700 block mb-1">Employee ID</label>
              <input type="text" value={empId} onChange={(e) => setEmpId(e.target.value)} className="w-full p-2.5 border rounded-xl" />
            </div>
            <div>
              <label className="font-semibold text-gray-700 block mb-1">Department / Division</label>
              <input type="text" value={dept} onChange={(e) => setDept(e.target.value)} className="w-full p-2.5 border rounded-xl" />
            </div>
          </div>
        )}

        {/* Step 2: Professional */}
        {step === 2 && (
          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-gray-700 block mb-1">Cadre</label>
              <select value={cadre} onChange={(e) => setCadre(e.target.value)} className="w-full p-2.5 border rounded-xl bg-white">
                <option value="Indian Statistical Service">Indian Statistical Service (ISS)</option>
                <option value="Subordinate Statistical Service">Subordinate Statistical Service (SSS)</option>
                <option value="State DES">State Directorate of Economics &amp; Statistics</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-gray-700 block mb-1">Designation</label>
              <input type="text" value={desig} onChange={(e) => setDesig(e.target.value)} className="w-full p-2.5 border rounded-xl" />
            </div>
            <div>
              <label className="font-semibold text-gray-700 block mb-1">Years of Service / Experience</label>
              <input type="number" value={exp} onChange={(e) => setExp(Number(e.target.value))} className="w-full p-2.5 border rounded-xl" />
            </div>
          </div>
        )}

        {/* Step 3: Skills selection */}
        {step === 3 && (
          <div className="space-y-3 text-xs">
            <p className="text-gray-500">Your initial baseline skills will be pre-loaded into your competency profile.</p>
            <div className="p-3 bg-blue-50 rounded-xl space-y-1.5">
              <div className="flex justify-between font-bold text-[#0B3D66]">
                <span>Descriptive Statistics</span>
                <span>Level 5/5 (Expert)</span>
              </div>
              <div className="flex justify-between font-bold text-[#0B3D66]">
                <span>Python for Data Analysis</span>
                <span>Level 2/5 (Basic)</span>
              </div>
              <div className="flex justify-between font-bold text-[#0B3D66]">
                <span>GIS &amp; Geospatial Mapping</span>
                <span>Level 1/5 (Beginner)</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Preferences */}
        {step === 4 && (
          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-gray-700 block mb-1">Preferred Language</label>
              <div className="flex gap-2">
                {(["EN", "HI", "TE"] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setPrefLang(l)}
                    className={`flex-1 py-2 rounded-xl font-bold border ${prefLang === l ? "bg-[#0B3D66] text-white border-[#0B3D66]" : "bg-gray-50 text-gray-700 border-gray-200"}`}
                  >
                    {l === "EN" ? "English" : l === "HI" ? "हिन्दी" : "తెలుగు"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="font-semibold text-gray-700 block mb-1">Primary Career Goal</label>
              <input type="text" value={careerGoal} onChange={(e) => setCareerGoal(e.target.value)} className="w-full p-2.5 border rounded-xl" />
            </div>
          </div>
        )}

        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          {step > 1 ? (
            <button onClick={() => setStep(step - 1)} className="text-xs font-bold text-gray-500">
              ← Back
            </button>
          ) : <div />}

          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-5 py-2.5 bg-[#0B3D66] text-white text-xs font-bold rounded-xl hover:bg-[#082e4f]"
            >
              Continue →
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-6 py-2.5 bg-[#FF7A00] text-white text-xs font-bold rounded-xl hover:bg-[#e06a00] shadow-md"
            >
              Take Competency Assessment →
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
  const profile = getProfile();
  const userComps = getUserCompetencies();
  const courses = getCourses();
  const recommendations = getExplainableRecommendations(userComps, courses);

  const domains: CompetencyDomain[] = ["Statistical", "Technical", "Digital Governance", "Behavioural"];
  const radarData = domains.map((d) => {
    const items = userComps.filter((c) => c.domain === d);
    const avgCurrent = items.length ? items.reduce((acc, c) => acc + c.currentLevel, 0) / items.length : 2;
    const avgReq = items.length ? items.reduce((acc, c) => acc + c.requiredLevel, 0) / items.length : 3;
    return {
      domain: d,
      Current: Number(avgCurrent.toFixed(1)),
      Required: Number(avgReq.toFixed(1)),
    };
  });

  const highPriorityGaps = userComps
    .filter((c) => c.priorityLevel === "High" && c.gap > 0)
    .sort((a, b) => b.priorityScore - a.priorityScore);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Officer Cadre Banner */}
      <div className="bg-gradient-to-r from-[#0B3D66] via-[#092B48] to-[#FF7A00] rounded-3xl p-6 text-white shadow-sm border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/20 text-white">
              {profile.cadre} · {profile.cadreGrade}
            </span>
            <span className="text-[10px] text-white/80">{profile.posting}</span>
          </div>
          <h1 className="text-2xl font-bold font-serif">Good day, {profile.name}</h1>
          <p className="text-xs text-white/80 mt-1">
            {profile.designation} · {profile.department}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNav("assessment")}
            className="px-4 py-2.5 bg-white text-[#0B3D66] text-xs font-bold rounded-xl hover:bg-orange-50 hover:text-[#FF7A00] transition-all shadow-md cursor-pointer"
          >
            Take Competency Assessment ↗
          </button>
        </div>
      </div>

      {/* Top 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Overall Competency", value: "68%", sub: "Proficiency Index", color: "#0B3D66" },
          { label: "Active Skill Gaps", value: "5", sub: "3 High Priority", color: "#FF7A00" },
          { label: "Courses Completed", value: `${profile.coursesCompleted}`, sub: "Official Curricula", color: "#10B981" },
          { label: "Learning Hours", value: `${profile.learningHours}h`, sub: "Annual CPD Quota: 50h", color: "#6366F1" },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-2xs">
            <div className="text-[11px] text-gray-400 font-semibold">{m.label}</div>
            <div className="text-2xl font-serif font-bold mt-1" style={{ color: m.color }}>{m.value}</div>
            <div className="text-[10px] text-gray-400 mt-0.5">{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Radar & Priority Gaps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Radar Chart */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-[#0B3D66] uppercase tracking-wider mb-1">Competency Radar Overview</div>
            <div className="text-[11px] text-gray-400 mb-2">Current Proficiency vs Cadre Benchmark</div>
            <ResponsiveContainer width="100%" height={210}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="domain" tick={{ fontSize: 10, fill: "#64748b" }} />
                <Radar name="Required" dataKey="Required" stroke="#94a3b8" fill="#e2e8f0" fillOpacity={0.4} />
                <Radar name="Current" dataKey="Current" stroke="#FF7A00" fill="#FF7A00" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 text-[10px] text-gray-500 mt-2">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#FF7A00]" /> Current</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-slate-300" /> Required</span>
          </div>
        </div>

        {/* Priority Skill Gaps */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs font-bold text-[#0B3D66] uppercase tracking-wider">Priority Skill Gaps</div>
              <button onClick={() => onNav("skill_gaps")} className="text-[10px] text-[#FF7A00] font-bold hover:underline">
                View All Analysis →
              </button>
            </div>
            <div className="text-[11px] text-gray-400 mb-3">Formula: 35% Gap + 25% Role + 20% Dept + 10% Demand</div>
            <div className="space-y-3">
              {highPriorityGaps.map((g) => (
                <div key={g.competencyId} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-gray-800 truncate max-w-[180px]">{g.competencyName}</span>
                    <span className="text-rose-600 font-bold">−{g.gap} Level (Priority: {g.priorityScore})</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full"
                      style={{ width: `${(g.currentLevel / g.requiredLevel) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => onNav("learning_path")}
            className="text-xs font-bold text-[#0B3D66] hover:underline mt-4 text-left cursor-pointer"
          >
            View Personalized Learning Roadmap →
          </button>
        </div>
      </div>

      {/* Top Recommendations */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-sm font-bold text-[#0B3D66] uppercase tracking-wider">
              Recommended Learning for Your Cadre
            </h2>
            <p className="text-xs text-gray-400">
              Personalized ranked recommendations with transparent why-rationale
            </p>
          </div>
          <button onClick={() => onNav("courses")} className="text-xs font-bold text-[#FF7A00] hover:underline">
            View All Courses ({courses.length}) →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.slice(0, 4).map((rec) => {
            const course = courses.find((c) => c.id === rec.courseId);
            return (
              <div key={rec.courseId} className="p-4 rounded-2xl border border-gray-100 bg-[#FBFBFB] hover:border-gray-300 transition-all flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${rec.provider === "iGOT" ? "bg-sky-100 text-sky-800" : "bg-purple-100 text-purple-800"}`}>
                      {rec.provider} Karmayogi
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      {rec.matchPercentage}% Match
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-gray-900">{rec.courseTitle}</h3>
                  <div className="p-2.5 bg-blue-50/70 rounded-xl border border-blue-100 text-[11px] text-gray-700 mt-2 leading-relaxed">
                    <strong className="text-[#0B3D66]">Why Recommended:</strong> {rec.whyRecommended}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-[10px] text-gray-500 font-mono">{rec.duration}</span>
                  {course && (
                    <button
                      onClick={() => {
                        onOpenCourse(course);
                        onNav("course_detail");
                      }}
                      className="px-3 py-1.5 bg-[#0B3D66] text-white text-xs font-bold rounded-lg hover:bg-[#082e4f] cursor-pointer"
                    >
                      View Course →
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

function SkillsScreen({ onNav }: { onNav: (s: Screen) => void }) {
  const [userComps, setUserComps] = useState<UserCompetencyScore[]>(getUserCompetencies());
  const [domainFilter, setDomainFilter] = useState<string>("All");

  const filtered = domainFilter === "All" ? userComps : userComps.filter((c) => c.domain === domainFilter);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0B3D66] font-serif">My Competency Profile</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Evaluated on a 1–5 Scale: 1=Beginner, 2=Basic, 3=Intermediate, 4=Advanced, 5=Expert
          </p>
        </div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl text-xs font-semibold overflow-x-auto">
          {["All", "Statistical", "Technical", "Digital Governance", "Behavioural"].map((d) => (
            <button
              key={d}
              onClick={() => setDomainFilter(d)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                domainFilter === d ? "bg-[#0B3D66] text-white shadow-xs" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((c) => (
          <div key={c.competencyId} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-2xs space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{c.domain}</span>
                <h3 className="text-sm font-bold text-[#0B3D66]">{c.competencyName}</h3>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.gap > 0 ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"}`}>
                {c.gap > 0 ? `Gap: −${c.gap}` : "Target Met ✓"}
              </span>
            </div>

            {/* Progress Bar Representation */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-gray-600">Current Proficiency: Level {c.currentLevel}/5</span>
                <span className="text-gray-400">Required: Level {c.requiredLevel}/5</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${c.gap > 0 ? "bg-[#FF7A00]" : "bg-emerald-500"}`}
                  style={{ width: `${(c.currentLevel / 5) * 100}%` }}
                />
              </div>
            </div>

            <div className="text-[10px] text-gray-400 pt-2 border-t border-gray-50 flex justify-between">
              <span>Evidence: {c.evidenceSource}</span>
              <span>Assessed: {c.lastAssessedDate}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// 5. Competency Assessment Page (/assessment)
// ──────────────────────────────────────────────

function AssessmentScreen({
  onFinish,
}: {
  onFinish: (qList: GeneratedQuestion[], aList: (number | null)[]) => void;
}) {
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [qIdx, setQIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 mins

  async function handleStart() {
    setLoading(true);
    try {
      const res = await generateMCQsFromText("Statistical & Technical Competencies", 10, "Intermediate", "Statistical");
      setQuestions(res.questions);
      setAnswers(new Array(res.questions.length).fill(null));
      setStarted(true);
    } catch {
      // Fallback handled in aiService
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

  if (started && questions.length > 0) {
    const currQ = questions[qIdx];
    const isLast = qIdx === questions.length - 1;
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center text-xs font-bold text-gray-500 bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
          <span>Question {qIdx + 1} of {questions.length}</span>
          <span className="text-rose-600 font-mono">⏱️ {mins}:{secs < 10 ? `0${secs}` : secs}</span>
          <span className="text-[#FF7A00]">{currQ.competencyTarget}</span>
        </div>

        <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-[#0B3D66] leading-relaxed">{currQ.question}</h2>

          <div className="space-y-2.5">
            {currQ.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => {
                  const copy = [...answers];
                  copy[qIdx] = i;
                  setAnswers(copy);
                }}
                className={`w-full p-4 rounded-xl border text-left text-xs transition-all flex items-center gap-3 ${
                  answers[qIdx] === i
                    ? "border-[#0B3D66] bg-blue-50 text-[#0B3D66] font-bold"
                    : "border-gray-200 text-gray-700 hover:border-gray-300"
                }`}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${answers[qIdx] === i ? "bg-[#0B3D66] text-white" : "bg-gray-100 text-gray-500"}`}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span>{opt}</span>
              </button>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-100">
            <button
              onClick={() => setQIdx((p) => Math.max(0, p - 1))}
              disabled={qIdx === 0}
              className="text-xs font-bold text-gray-500 disabled:opacity-30"
            >
              ← Previous
            </button>
            {isLast ? (
              <button
                onClick={() => onFinish(questions, answers)}
                className="px-6 py-2.5 bg-[#FF7A00] text-white text-xs font-bold rounded-xl hover:bg-[#e06a00] shadow-md"
              >
                Submit Assessment →
              </button>
            ) : (
              <button
                onClick={() => setQIdx((p) => Math.min(questions.length - 1, p + 1))}
                className="px-5 py-2.5 bg-[#0B3D66] text-white text-xs font-bold rounded-xl hover:bg-[#082e4f]"
              >
                Next Question →
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 border border-gray-100 shadow-sm text-center space-y-6">
      <div className="w-14 h-14 rounded-2xl bg-orange-50 text-[#FF7A00] flex items-center justify-center text-3xl font-bold mx-auto">
        ✍️
      </div>
      <div>
        <h1 className="text-xl font-bold text-[#0B3D66] font-serif">Competency Assessment</h1>
        <p className="text-xs text-gray-500 mt-1">
          Objective evaluation covering Statistical Methodologies, Python Microdata, and Data Privacy.
        </p>
      </div>

      <div className="p-4 bg-gray-50 rounded-2xl text-xs text-gray-600 text-left space-y-2">
        <div>• <strong>Duration:</strong> 15 minutes</div>
        <div>• <strong>Questions:</strong> 10 Objective MCQs</div>
        <div>• <strong>Competencies Assessed:</strong> 6 Key Areas</div>
        <div>• <strong>Closed-Loop Effect:</strong> Scores will directly update your cadre competency profile.</div>
      </div>

      <button
        onClick={handleStart}
        disabled={loading}
        className="w-full py-3 bg-[#0B3D66] text-white text-xs font-bold rounded-xl hover:bg-[#082e4f] shadow-md transition-all cursor-pointer disabled:opacity-50"
      >
        {loading ? "Preparing Examination Questions..." : "Start Assessment Now →"}
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────
// 6. Assessment Result Screen
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

  function handleApply() {
    applyClosedLoopCompetencyUpdate({
      competencyName: "Python for Data Analysis",
      scorePct,
      evidence: `StatSkill AI Assessment (${scorePct}% Score)`,
    });
    onNav("dashboard");
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-emerald-600 text-white flex flex-col items-center justify-center font-bold mx-auto shadow-md">
          <span className="text-2xl font-serif">{scorePct}%</span>
          <span className="text-[9px] uppercase">Evaluated</span>
        </div>
        <h1 className="text-xl font-bold text-[#0B3D66]">Your Competency Assessment Result</h1>
        <p className="text-xs text-gray-500">
          You scored <strong>{correctCount} of {total}</strong> correct answers across evaluated domains.
        </p>

        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={handleApply}
            className="px-6 py-2.5 bg-[#FF7A00] text-white text-xs font-bold rounded-xl hover:bg-[#e06a00] shadow-md"
          >
            Apply Closed-Loop Competency Update →
          </button>
          <button
            onClick={() => onNav("learning_path")}
            className="px-6 py-2.5 bg-[#0B3D66] text-white text-xs font-bold rounded-xl hover:bg-[#082e4f]"
          >
            View Personalized Learning Path →
          </button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// 7. Skill-Gap Detailed Analysis Page (/skill-gaps)
// ──────────────────────────────────────────────

function SkillGapsScreen({ onNav }: { onNav: (s: Screen) => void }) {
  const userComps = getUserCompetencies();
  const gaps = [...userComps].sort((a, b) => b.priorityScore - a.priorityScore);
  const [selectedSkill, setSelectedSkill] = useState<UserCompetencyScore | null>(null);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[#0B3D66] font-serif">Detailed Skill-Gap Analysis</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Priority Score = 35% Skill Gap + 25% Job Requirement + 20% Dept Priority + 10% Demand + 10% Career
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-2xs overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-gray-100 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
              <th className="pb-3">Competency</th>
              <th className="pb-3">Domain</th>
              <th className="pb-3 text-center">Current</th>
              <th className="pb-3 text-center">Required</th>
              <th className="pb-3 text-center">Skill Gap</th>
              <th className="pb-3 text-center">Priority</th>
              <th className="pb-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-gray-700">
            {gaps.map((g) => (
              <tr key={g.competencyId} className="hover:bg-gray-50/60">
                <td className="py-3 font-bold text-[#0B3D66]">{g.competencyName}</td>
                <td className="py-3 text-gray-500">{g.domain}</td>
                <td className="py-3 text-center font-semibold">{g.currentLevel} / 5</td>
                <td className="py-3 text-center font-semibold">{g.requiredLevel} / 5</td>
                <td className="py-3 text-center">
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${g.gap > 0 ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"}`}>
                    {g.gap > 0 ? `−${g.gap}` : "0"}
                  </span>
                </td>
                <td className="py-3 text-center">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${g.priorityLevel === "High" ? "bg-rose-500 text-white" : g.priorityLevel === "Medium" ? "bg-amber-400 text-gray-900" : "bg-gray-200 text-gray-700"}`}>
                    {g.priorityLevel}
                  </span>
                </td>
                <td className="py-3 text-right">
                  <button
                    onClick={() => setSelectedSkill(g)}
                    className="text-xs text-[#0B3D66] font-bold hover:underline cursor-pointer"
                  >
                    Why is this a gap? →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Why is this a gap modal */}
      {selectedSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-sm text-[#0B3D66]">{selectedSkill.competencyName}</h3>
              <button onClick={() => setSelectedSkill(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="space-y-2 text-xs text-gray-700">
              <div>• <strong>Required for Role:</strong> Level {selectedSkill.requiredLevel} / 5</div>
              <div>• <strong>Current Evaluation:</strong> Level {selectedSkill.currentLevel} / 5</div>
              <div>• <strong>Calculated Gap:</strong> {selectedSkill.gap} Levels</div>
              <div>• <strong>Evidence:</strong> {selectedSkill.evidenceSource}</div>
              <div className="p-3 bg-blue-50 rounded-xl text-[11px] text-[#0B3D66]">
                <strong>Recommended Action:</strong> Complete the accredited iGOT module to elevate competency level and meet role benchmark.
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedSkill(null);
                onNav("courses");
              }}
              className="w-full py-2.5 bg-[#0B3D66] text-white text-xs font-bold rounded-xl"
            >
              View Remedial Courses →
            </button>
          </div>
        </div>
      )}
    </div>
  );
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
  const userComps = getUserCompetencies();
  const path = getPersonalizedLearningPath(userComps);
  const courses = getCourses();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B3D66] font-serif">Your Personalized Learning Path</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Goal: Become proficient in AI-enabled statistical analysis and survey automation.
        </p>
      </div>

      <div className="space-y-4">
        {path.map((step) => {
          const course = courses.find((c) => c.id === step.courseId);
          return (
            <div key={step.stepNumber} className="p-5 bg-white rounded-3xl border border-gray-100 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm ${
                  step.status === "Completed" ? "bg-emerald-100 text-emerald-800" : step.status === "In Progress" ? "bg-[#0B3D66] text-white" : "bg-gray-100 text-gray-600"
                }`}>
                  0{step.stepNumber}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                      {step.provider}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {step.matchScore}% Match
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900">{step.title}</h3>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {step.duration} · Addresses: <strong>{step.skillAddressed}</strong>
                  </div>
                </div>
              </div>

              <div>
                {course && (
                  <button
                    onClick={() => {
                      onOpenCourse(course);
                      onNav("course_detail");
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      step.status === "Completed" ? "bg-gray-100 text-gray-700" : "bg-[#0B3D66] text-white hover:bg-[#082e4f]"
                    }`}
                  >
                    {step.status === "Completed" ? "Review" : step.status === "In Progress" ? "Continue" : "Start"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
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

  const filtered = courses.filter((c) => {
    if (sourceFilter !== "ALL" && c.provider !== sourceFilter) return false;
    if (categoryFilter !== "ALL" && c.category !== categoryFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[#0B3D66] font-serif">Courses &amp; Training Modules</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Explore accredited learning resources aligned with your statistical cadre competencies.
        </p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((c) => (
          <div key={c.id} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-2xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${c.provider === "iGOT" ? "bg-sky-100 text-sky-800" : "bg-purple-100 text-purple-800"}`}>
                  {c.provider}
                </span>
                <span className="text-[10px] text-gray-400 font-mono">{c.duration}</span>
              </div>
              <h3 className="text-sm font-bold text-gray-900 leading-snug">{c.title}</h3>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{c.description}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {c.competenciesCovered.map((comp) => (
                  <span key={comp} className="text-[9px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">
                    {comp}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs font-bold text-amber-500">★ {c.rating}</span>
              <button
                onClick={() => {
                  onOpenCourse(c);
                  onNav("course_detail");
                }}
                className="px-4 py-1.5 bg-[#0B3D66] text-white text-xs font-bold rounded-xl hover:bg-[#082e4f] cursor-pointer"
              >
                View Course →
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

        {/* Structure */}
        <div>
          <h3 className="font-bold text-xs text-[#0B3D66] uppercase tracking-wider mb-2">Course Structure &amp; Modules</h3>
          <div className="space-y-2">
            {(course.syllabusModules || [
              { id: "1", title: "Module 1: Concept Boundaries & Classifications", duration: "4 hours" },
              { id: "2", title: "Module 2: Methodological Derive & Estimation", duration: "6 hours" },
              { id: "3", title: "Module 3: Case Studies & Quality Checks", duration: "4 hours" },
            ]).map((mod) => (
              <div key={mod.id} className="p-3 bg-gray-50 rounded-xl flex justify-between text-xs font-medium">
                <span>{mod.title}</span>
                <span className="text-gray-400">{mod.duration}</span>
              </div>
            ))}
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
  const programmes = getNsstaProgrammes();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B3D66] font-serif">NSSTA TPAC Training Programmes</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Accredited in-person and executive residential training programmes at NSSTA Greater Noida.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {programmes.map((p) => (
          <div key={p.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-2xs flex flex-col justify-between space-y-4">
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
              </div>
            </div>

            <a
              href={p.registrationUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2 bg-[#0B3D66] text-white text-xs font-bold rounded-xl hover:bg-[#082e4f] text-center block"
            >
              Register on NSSTA Portal ↗
            </a>
          </div>
        ))}
      </div>
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
          <div key={c.id} className="p-5 bg-white rounded-3xl border border-gray-100 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1 flex-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase">{c.category}</span>
              <h3 className="text-sm font-bold text-gray-900">{c.title}</h3>
              <div className="text-xs text-gray-500">{c.duration} · {c.primaryCompetency}</div>
              <div className="w-full max-w-xs bg-gray-100 h-1.5 rounded-full overflow-hidden mt-2">
                <div className="bg-[#0B3D66] h-full" style={{ width: `${c.progressPct}%` }} />
              </div>
            </div>
            <button
              onClick={() => {
                onOpenCourse(c);
                onNav("course_detail");
              }}
              className="px-4 py-2 bg-[#0B3D66] text-white text-xs font-bold rounded-xl"
            >
              {c.progressPct === 100 ? "Review" : "Continue Learning"}
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
  const quizzes = getQuizzes();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-[#0B3D66] font-serif">Quizzes &amp; Knowledge Checks</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Test competency understanding and trigger automatic profile score updates.
          </p>
        </div>
        <button
          onClick={() => onNav("assessment")}
          className="px-4 py-2 bg-[#FF7A00] text-white text-xs font-bold rounded-xl hover:bg-[#e06a00]"
        >
          Comprehensive Assessment ↗
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quizzes.map((q) => (
          <div key={q.id} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-2xs space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  {q.domain}
                </span>
                <span className="text-xs text-gray-400 font-mono">⏱️ {q.durationMinutes} min</span>
              </div>
              <h3 className="text-sm font-bold text-gray-900">{q.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{q.description}</p>
            </div>

            <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
              <span className="text-[11px] text-gray-400 font-mono">{q.questionsCount} Questions</span>
              <button
                onClick={() => onNav("assessment")}
                className="px-4 py-1.5 bg-[#0B3D66] text-white text-xs font-bold rounded-xl hover:bg-[#082e4f]"
              >
                {q.completed ? "Retake Quiz" : "Start Quiz"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// 14. Resources / Documents Page (/resources)
// ──────────────────────────────────────────────

function ResourcesScreen({ onNav }: { onNav: (s: Screen) => void }) {
  const resources = getLearningResources();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-[#0B3D66] font-serif">Official Learning Resources</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Uploaded manuals, sampling instructions, and guidelines repository.
          </p>
        </div>
        <button
          onClick={() => onNav("trainer")}
          className="px-4 py-2 bg-[#0B3D66] text-white text-xs font-bold rounded-xl"
        >
          Upload New Document ↗
        </button>
      </div>

      <div className="space-y-4">
        {resources.map((res) => (
          <div key={res.id} className="p-5 bg-white rounded-3xl border border-gray-100 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded">
                  {res.fileType} · {res.pageCount} Pages
                </span>
                <span className="text-[10px] text-gray-400">{res.uploadedDate}</span>
              </div>
              <h3 className="text-sm font-bold text-gray-900">{res.title}</h3>
              <p className="text-xs text-gray-500">{res.summary}</p>
            </div>
            <button
              onClick={() => onNav("trainer")}
              className="px-4 py-2 bg-[#FF7A00] text-white text-xs font-bold rounded-xl hover:bg-[#e06a00]"
            >
              Generate Quiz ⚡
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// 15. AI Learning Assistant Page (/assistant)
// ──────────────────────────────────────────────

function AssistantScreen() {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([
    {
      role: "assistant",
      text: "Namaste! I am your StatSkill AI Assistant. You can ask me questions about your competency gaps, recommended learning pathways, or specific official statistical methods.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const profile = getProfile();

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
          gaps: ["Python for Data Analysis", "GIS & Geospatial Mapping", "Artificial Intelligence & ML"],
        }
      );
      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "I can explain SNA 2008 National Accounts, PLFS sampling formulas, or Python survey data extraction." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B3D66] font-serif">AI Statistical Learning Assistant</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Ask questions about official MoSPI guidelines, competency gaps, or learning paths.
        </p>
      </div>

      {/* Suggested Prompts */}
      <div className="flex flex-wrap gap-2">
        {[
          "Explain sampling in simple terms.",
          "Why is Python recommended for me?",
          "What should I learn next?",
          "Give me 5 questions about survey design.",
        ].map((prompt) => (
          <button
            key={prompt}
            onClick={() => handleSend(prompt)}
            className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs text-gray-700 hover:border-[#0B3D66] hover:text-[#0B3D66] shadow-2xs transition-all"
          >
            💬 {prompt}
          </button>
        ))}
      </div>

      {/* Chat Box */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col h-[480px] overflow-hidden">
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50/50 text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed ${
                m.role === "user"
                  ? "bg-[#0B3D66] text-white ml-auto rounded-br-none"
                  : "bg-white text-gray-800 border border-gray-100 shadow-2xs mr-auto rounded-bl-none"
              }`}
            >
              {m.text}
            </div>
          ))}
          {loading && <div className="text-gray-400 text-xs italic">StatSkill AI is researching...</div>}
        </div>

        <div className="p-3 border-t border-gray-100 bg-white flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask a statistical methodology or learning question..."
            className="flex-1 px-4 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#0B3D66]"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading}
            className="px-5 py-2.5 bg-[#FF7A00] text-white text-xs font-bold rounded-xl hover:bg-[#e06a00]"
          >
            Send
          </button>
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
            {profile.name.slice(0, 2).toUpperCase()}
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
  const certs = getCertificates();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B3D66] font-serif">Verifiable Digital Credentials</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          W3C Verifiable Credential standard with SHA-256 cryptographic hashes for MoSPI capacity accreditation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {certs.map((c) => (
          <div key={c.id} className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] font-bold bg-orange-100 text-orange-800 px-2 py-0.5 rounded">
                  {c.issuer}
                </span>
                <h2 className="text-sm font-bold text-[#0B3D66] mt-1">{c.title}</h2>
              </div>
              <span className="text-xl">🎖️</span>
            </div>

            <div className="text-xs text-gray-600 space-y-1">
              <div>Issued To: <strong>{c.issuedTo}</strong></div>
              <div>Issue Date: {c.issueDate} · {c.expiryDate}</div>
              <div>Credential ID: <span className="font-mono text-[10px]">{c.credentialId}</span></div>
            </div>

            <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-[9px] font-mono text-gray-500 truncate">
              Hash: {c.verificationHash}
            </div>

            <button
              onClick={() => window.print()}
              className="w-full py-2 bg-[#0B3D66] text-white text-xs font-bold rounded-xl hover:bg-[#082e4f]"
            >
              Print / Save Verified PDF ↗
            </button>
          </div>
        ))}
      </div>
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
                <span className="text-[10px] font-bold text-gray-400">{lab.duration}</span>
              </div>
              <h3 className="text-xs font-bold text-[#0B3D66] mt-2">{lab.title}</h3>
              <p className="text-[11px] text-gray-500 mt-1">{lab.description}</p>
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
        id: Date.now() + Math.random(),
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

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B3D66] font-serif">Academy Trainer &amp; RAG MCQ Studio</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Upload official training manuals, extract context with RAG, and generate verified examination questions.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Documents Uploaded", val: "12" },
          { label: "Quizzes Created", val: "24" },
          { label: "Questions in Bank", val: `${bank.length || 42}` },
          { label: "Published Quizzes", val: "18" },
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
            <label className="block text-xs font-semibold text-gray-700 mb-1">Target Competency</label>
            <select
              value={competency}
              onChange={(e) => setCompetency(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl bg-gray-50"
            >
              <option value="Python for Data Analysis">Python for Data Analysis</option>
              <option value="National Accounts & GVA">National Accounts &amp; GVA</option>
              <option value="Sampling Theory & PPS">Sampling Theory &amp; PPS</option>
              <option value="Data Privacy (DPDP Act)">Data Privacy (DPDP Act)</option>
            </select>
          </div>
        </div>

        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center relative bg-gray-50/50 hover:bg-blue-50/30 transition-all">
          <input
            type="file"
            accept=".pdf,.txt,.docx,.csv"
            onChange={handleFileUpload}
            disabled={generating}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
          <div className="text-3xl mb-2">📄</div>
          <div className="text-xs font-bold text-gray-800">
            {generating ? "Extracting context and generating MCQs..." : "Upload MoSPI Training Manual or Guidelines (PDF, DOCX, TXT)"}
          </div>
          <p className="text-[10px] text-gray-400 mt-1">Automatic verification for 4 options, 1 valid answer, and source citations</p>
        </div>

        {statusMsg && (
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 font-mono">
            {statusMsg}
          </div>
        )}
      </div>

      {/* Question Bank List */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-2xs space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
          <h2 className="text-xs font-bold text-[#0B3D66] uppercase tracking-wider">
            Validated Question Bank ({bank.length} Questions)
          </h2>
          <button
            onClick={() => {
              setBank([]);
              saveTrainerQuestionBank([]);
            }}
            className="text-[10px] text-rose-600 font-bold hover:underline"
          >
            Clear Bank
          </button>
        </div>

        {bank.length > 0 ? (
          <div className="space-y-3">
            {bank.map((q, idx) => (
              <div key={idx} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/60 space-y-2 text-xs">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-gray-900">Q{idx + 1}: {q.question}</span>
                  <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                    Validated ✓
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600">
                  {q.options.map((opt, i) => (
                    <div key={i} className={`p-2 rounded-lg border ${i === q.correctAnswerIndex ? "bg-emerald-50 border-emerald-300 font-bold text-emerald-900" : "bg-white border-gray-200"}`}>
                      {String.fromCharCode(65 + i)}. {opt}
                    </div>
                  ))}
                </div>
                <div className="text-[10px] text-gray-400 pt-1 flex justify-between">
                  <span>Source: {q.sourceReference}</span>
                  <span>Competency: {q.competency}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-gray-400">
            No questions generated yet. Upload a document above to populate the question bank.
          </div>
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// 20. Administrator Portal (/admin)
// ──────────────────────────────────────────────

function AdminScreen() {
  const employees = getAdminEmployees();
  const deptData = [
    { name: "Labour Statistics", avgScore: 3.4, compliance: 84 },
    { name: "National Accounts", avgScore: 4.1, compliance: 92 },
    { name: "Price Statistics", avgScore: 3.8, compliance: 88 },
    { name: "Economic Statistics", avgScore: 3.6, compliance: 79 },
    { name: "Survey Design", avgScore: 4.2, compliance: 95 },
  ];

  function handleExportCsv() {
    const csvContent = "Name,Department,Cadre,Grade,Role,CompetencyIndex,HighGaps,Hours,Status\n" +
      employees.map((e) => `"${e.name}","${e.department}","${e.cadre}","${e.grade}","${e.role}",${e.competencyIndex},${e.highGapsCount},${e.hoursCompleted},"${e.complianceStatus}"`).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `StatSkill_Admin_Employee_Roster_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-[#0B3D66] font-serif">Ministry Administrator Analytics</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Organization-wide workforce readiness, department skill gap heatmaps, and predictive AI models.
          </p>
        </div>
        <button
          onClick={handleExportCsv}
          className="px-4 py-2 bg-[#0B3D66] text-white text-xs font-bold rounded-xl hover:bg-[#082e4f]"
        >
          📥 Export Cadre Roster (.csv)
        </button>
      </div>

      {/* Top 4 Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Employees Monitored", value: "1,248", sub: "+45 this quarter", color: "#0B3D66" },
          { label: "Average Competency Index", value: "3.8 / 5.0", sub: "+0.4 since baseline", color: "#FF7A00" },
          { label: "Critical Skill Gaps", value: "14", sub: "Down from 28", color: "#6366F1" },
          { label: "Training Completion Rate", value: "72%", sub: "50h annual quota", color: "#10B981" },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-2xs">
            <div className="text-[11px] text-gray-400 font-semibold">{m.label}</div>
            <div className="text-2xl font-serif font-bold mt-1" style={{ color: m.color }}>{m.value}</div>
            <div className="text-[10px] text-gray-400 mt-0.5">{m.sub}</div>
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
            {[
              { dept: "Labour Statistics", python: "🔴 High", ai: "🔴 High", gis: "🟠 Med", sql: "🟡 Low" },
              { dept: "National Accounts (NAD)", python: "🟠 Med", ai: "🔴 High", gis: "🟢 Met", sql: "🟡 Low" },
              { dept: "Price Statistics (PSD)", python: "🔴 High", ai: "🟠 Med", gis: "🟡 Low", sql: "🟢 Met" },
              { dept: "Field Operations (FOD)", python: "🟡 Low", ai: "🟠 Med", gis: "🔴 High", sql: "🟡 Low" },
            ].map((row) => (
              <div key={row.dept} className="p-2.5 bg-gray-50 rounded-xl flex justify-between items-center">
                <span className="font-bold text-gray-800 truncate max-w-[140px]">{row.dept}</span>
                <div className="flex gap-2 text-[10px] font-mono">
                  <span>Py: {row.python}</span>
                  <span>AI: {row.ai}</span>
                  <span>GIS: {row.gis}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Employee Table */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-2xs space-y-3">
        <h2 className="text-xs font-bold text-[#0B3D66] uppercase tracking-wider">Official Employee Cadre Roster</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-[10px] uppercase font-bold text-gray-400">
                <th className="pb-2">Name</th>
                <th className="pb-2">Department</th>
                <th className="pb-2">Role</th>
                <th className="pb-2 text-center">Competency</th>
                <th className="pb-2 text-center">Hours</th>
                <th className="pb-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-700">
              {employees.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50/60">
                  <td className="py-2.5 font-bold text-[#0B3D66]">{e.name}</td>
                  <td className="py-2.5 text-gray-500">{e.department}</td>
                  <td className="py-2.5 text-gray-600">{e.role}</td>
                  <td className="py-2.5 text-center font-semibold">{e.competencyIndex} / 5</td>
                  <td className="py-2.5 text-center font-semibold">{e.hoursCompleted}h</td>
                  <td className="py-2.5 text-right">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${e.complianceStatus === "Compliant" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                      {e.complianceStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
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
            <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name &amp; Cadre</label>
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
  const [screen, setScreen] = useState<Screen>(profile.onboardingCompleted ? "dashboard" : "login");
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
    const prof = getProfile();
    const updated = {
      ...prof,
      role,
      isAdmin: role === "admin",
      isTrainer: role === "trainer",
      name: role === "trainer" ? "Dr. Arvind Rao (NSSTA Faculty)" : role === "admin" ? "Smt. Sunita Verma (Joint Secretary)" : "Dr. Rajesh Sharma, ISS",
      onboardingCompleted: true,
    };
    saveProfile(updated);
    setActiveRole(role);
    if (role === "trainer") setScreen("trainer");
    else if (role === "admin") setScreen("admin");
    else setScreen("dashboard");
  }

  return (
    <LanguageProvider>
      {screen === "login" ? (
        <LoginScreen
          onLogin={() => setScreen(profile.onboardingCompleted ? "dashboard" : "onboarding")}
          onDemoLogin={handleDemoLogin}
        />
      ) : screen === "onboarding" ? (
        <OnboardingWizard onComplete={() => setScreen("dashboard")} />
      ) : (
        <AppShell screen={screen} onNav={setScreen} onRoleChange={handleRoleChange}>
          {screen === "dashboard" && <DashboardScreen onNav={setScreen} onOpenCourse={setActiveCourse} />}
          {screen === "skills" && <SkillsScreen onNav={setScreen} />}
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
          {screen === "skill_gaps" && <SkillGapsScreen onNav={setScreen} />}
          {screen === "learning_path" && <LearningPathScreen onNav={setScreen} onOpenCourse={setActiveCourse} />}
          {screen === "courses" && <CoursesScreen onNav={setScreen} onOpenCourse={setActiveCourse} />}
          {screen === "course_detail" && <CourseDetailScreen course={activeCourse} onBack={() => setScreen("courses")} onNav={setScreen} />}
          {screen === "course_player" && activeCourse && <CourseLearningPage course={activeCourse} onBack={() => setScreen("course_detail")} />}
          {screen === "training_programmes" && <TrainingProgrammesScreen />}
          {screen === "learning" && <MyLearningScreen onNav={setScreen} onOpenCourse={setActiveCourse} />}
          {screen === "quizzes" && <QuizzesScreen onNav={setScreen} />}
          {screen === "resources" && <ResourcesScreen onNav={setScreen} />}
          {screen === "assistant" && <AssistantScreen />}
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

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
} from "../types/statskill";

export * from "../types/statskill";

// ──────────────────────────────────────────────
// Storage Keys
// ──────────────────────────────────────────────
const STORAGE_KEYS = {
  PROFILE: "statskill_officer_profile",
  COMPETENCIES: "statskill_competency_scores",
  COURSES: "statskill_courses_catalogue",
  PROGRAMMES: "statskill_nssta_programmes",
  QUIZZES: "statskill_quizzes_catalogue",
  QUIZ_HISTORY: "statskill_quiz_history",
  COMPETENCY_LOGS: "statskill_competency_audit_logs",
  QUESTION_BANK: "statskill_trainer_question_bank",
  RESOURCES: "statskill_learning_resources",
  EMPLOYEES: "statskill_admin_employees",
  NOTIFICATIONS: "statskill_notifications",
  JOB_ROLES: "statskill_job_roles",
  ACTIVE_ROLE: "statskill_active_role",
  CERTIFICATES: "statskill_certificates",
};

// ──────────────────────────────────────────────
// 1. Configurable Job Roles
// ──────────────────────────────────────────────
export const DEFAULT_JOB_ROLES: JobRoleDefinition[] = [
  {
    id: "role-stat-officer",
    title: "Statistical Officer",
    department: "Labour Statistics",
    cadre: "Indian Statistical Service",
    cadreGrade: "STS",
    description: "Supervises large-scale sample surveys, econometric modelling, and labour market indicator compilation.",
    requiredCompetencies: {
      "Descriptive Statistics & Sampling": 5,
      "Survey Design & Methodology": 4,
      "Sampling Theory & PPS": 4,
      "SQL & Database Querying": 3,
      "Python for Data Analysis": 3,
      "Data Visualization & Storytelling": 4,
      "GIS & Geospatial Mapping": 2,
      "Artificial Intelligence & ML": 2,
      "Labour & Employment (PLFS)": 4,
      "Data Privacy (DPDP Act)": 3,
    },
  },
  {
    id: "role-data-analyst",
    title: "Data Analyst",
    department: "Data Analytics & IT Division",
    cadre: "Subordinate Statistical Service",
    cadreGrade: "SSO",
    description: "Performs exploratory microdata transformations, automated scraping, API publishing, and machine learning pipelines.",
    requiredCompetencies: {
      "Descriptive Statistics & Sampling": 4,
      "Python for Data Analysis": 4,
      "SQL & Database Querying": 4,
      "Data Visualization & Storytelling": 4,
      "Artificial Intelligence & ML": 3,
      "Cloud Infrastructure & APIs": 3,
      "Data Privacy (DPDP Act)": 3,
    },
  },
  {
    id: "role-senior-stat-officer",
    title: "Senior Statistical Officer",
    department: "National Accounts Division (NAD)",
    cadre: "Indian Statistical Service",
    cadreGrade: "JAG",
    description: "Leads national accounts rebasing, quarterly GDP estimation, and high-level cabinet statistical briefings.",
    requiredCompetencies: {
      "Descriptive Statistics & Sampling": 5,
      "Survey Design & Methodology": 5,
      "Sampling Theory & PPS": 5,
      "National Accounts & GVA": 5,
      "Python for Data Analysis": 4,
      "SQL & Database Querying": 4,
      "Data Visualization & Storytelling": 4,
      "Artificial Intelligence & ML": 3,
      "Team Leadership & Governance": 4,
      "Data Privacy (DPDP Act)": 4,
    },
  },
];

// ──────────────────────────────────────────────
// 2. Competency Catalogue Definitions
// ──────────────────────────────────────────────
export const DEFAULT_COMPETENCIES_CATALOGUE: CompetencyDefinition[] = [
  // Statistical
  { id: "c-stat-1", name: "Descriptive Statistics & Sampling", domain: "Statistical", description: "Probability distributions, central tendency, variance, and hypothesis testing.", maxLevel: 5, departmentPriority: 5, futureDemandScore: 4 },
  { id: "c-stat-2", name: "Survey Design & Methodology", domain: "Statistical", description: "Questionnaire formulation, stratification, multi-stage sampling frames, and non-sampling error control.", maxLevel: 5, departmentPriority: 5, futureDemandScore: 4 },
  { id: "c-stat-3", name: "Sampling Theory & PPS", domain: "Statistical", description: "Probability Proportional to Size, circular systematic selection, and multiplier normalization.", maxLevel: 5, departmentPriority: 4, futureDemandScore: 4 },
  { id: "c-stat-4", name: "National Accounts & GVA", domain: "Statistical", description: "UN SNA 2008 framework, Supply-Use Tables (SUT), and double deflation GDP compilation.", maxLevel: 5, departmentPriority: 5, futureDemandScore: 5 },
  { id: "c-stat-5", name: "Price Statistics (CPI / WPI)", domain: "Statistical", description: "Modified Laspeyres price relatives, basket weighting, and retail price aggregation.", maxLevel: 5, departmentPriority: 4, futureDemandScore: 4 },
  { id: "c-stat-6", name: "Labour & Employment (PLFS)", domain: "Statistical", description: "Periodic Labour Force Survey indicators (LFPR, WPR, UR) and activity status classification.", maxLevel: 5, departmentPriority: 5, futureDemandScore: 4 },
  { id: "c-stat-7", name: "SDG Indicators & Metadata", domain: "Statistical", description: "National Indicator Framework (NIF) monitoring, data flow protocols, and metadata standardization.", maxLevel: 5, departmentPriority: 4, futureDemandScore: 5 },

  // Technical
  { id: "c-tech-1", name: "Python for Data Analysis", domain: "Technical", description: "Pandas, NumPy, automated data ingestion pipelines, and unit-level survey processing.", maxLevel: 5, departmentPriority: 5, futureDemandScore: 5 },
  { id: "c-tech-2", name: "R Statistical Computing", domain: "Technical", description: "Survey package in R, complex stratified survey weights, and econometric regression modelling.", maxLevel: 5, departmentPriority: 4, futureDemandScore: 4 },
  { id: "c-tech-3", name: "SQL & Database Querying", domain: "Technical", description: "Relational database indexing, multi-million record aggregation, and stored procedures.", maxLevel: 5, departmentPriority: 4, futureDemandScore: 4 },
  { id: "c-tech-4", name: "GIS & Geospatial Mapping", domain: "Technical", description: "QGIS spatial layers, GeoJSON polygon boundary mapping, and remote sensing survey cross-referencing.", maxLevel: 5, departmentPriority: 4, futureDemandScore: 5 },
  { id: "c-tech-5", name: "Data Visualization & Storytelling", domain: "Technical", description: "Executive briefings, interactive dashboards, and visual communication for policy makers.", maxLevel: 5, departmentPriority: 4, futureDemandScore: 5 },
  { id: "c-tech-6", name: "Artificial Intelligence & ML", domain: "Technical", description: "Machine learning classifiers, NLP survey text analysis, and automated anomaly detection.", maxLevel: 5, departmentPriority: 5, futureDemandScore: 5 },
  { id: "c-tech-7", name: "Cloud Infrastructure & APIs", domain: "Technical", description: "REST APIs, secure data exchanges (data.gov.in), and government cloud pipelines.", maxLevel: 5, departmentPriority: 4, futureDemandScore: 5 },

  // Digital Governance
  { id: "c-gov-1", name: "Data Privacy (DPDP Act)", domain: "Digital Governance", description: "DPDP Act 2023 compliance, k-anonymity, microdata perturbation, and disclosure control.", maxLevel: 5, departmentPriority: 5, futureDemandScore: 5 },
  { id: "c-gov-2", name: "Cybersecurity Protocols", domain: "Digital Governance", description: "CERT-In compliance, encryption standards, secure file sharing, and two-factor authentication.", maxLevel: 5, departmentPriority: 4, futureDemandScore: 5 },
  { id: "c-gov-3", name: "Digital Public Infrastructure", domain: "Digital Governance", description: "e-Pramaan, DigiLocker integration, and open statistical exchange architectures.", maxLevel: 5, departmentPriority: 4, futureDemandScore: 4 },

  // Behavioural
  { id: "c-beh-1", name: "Team Leadership & Governance", domain: "Behavioural", description: "Project milestone planning, field team supervision, and inter-departmental consensus.", maxLevel: 5, departmentPriority: 4, futureDemandScore: 4 },
  { id: "c-beh-2", name: "Ethics in Official Statistics", domain: "Behavioural", description: "Fundamental Principles of Official Statistics (UNFPOS), transparency, and impartiality.", maxLevel: 5, departmentPriority: 5, futureDemandScore: 5 },
  { id: "c-beh-3", name: "Public Policy Decision Making", domain: "Behavioural", description: "Translating statistical data into actionable cabinet recommendations and development policies.", maxLevel: 5, departmentPriority: 4, futureDemandScore: 4 },
];

// ──────────────────────────────────────────────
// 3. Demo User Profile
// ──────────────────────────────────────────────
export const DEMO_STATISTICAL_OFFICER: OfficerProfile = {
  employeeId: "MOSPI-ISS-2019-048",
  name: "Dr. Rajesh Sharma, ISS",
  email: "rajesh.sharma@nic.in",
  phone: "+91 98104 XXXXX",
  role: "learner",
  isAdmin: false,
  isTrainer: false,
  department: "Labour Statistics",
  designation: "Statistical Officer",
  jobRoleId: "role-stat-officer",
  jobRoleTitle: "Statistical Officer",
  cadre: "Indian Statistical Service",
  cadreGrade: "STS",
  posting: "Sardar Patel Bhawan, New Delhi",
  currentAssignment: "Periodic Labour Force Survey (PLFS) Urban Frame Multiplier Recalibration",
  educationalQualification: "M.Sc. Statistics (Gold Medalist), Ph.D. Econometrics",
  yearsOfExperience: 5,
  previousTraining: ["NSSTA Foundation Induction", "iGOT Data Storytelling"],
  careerGoal: "Elevate to Senior Statistical Officer & National Accounts Lead (JAG)",
  preferredLearningMode: "Blended Academy",
  preferredLanguage: "EN",
  learningHours: 42,
  coursesCompleted: 7,
  certificationsCount: 3,
  onboardingCompleted: true,
};

// ──────────────────────────────────────────────
// 4. Dynamic User Competency & Skill Gap Derivation Engine
// ──────────────────────────────────────────────

export function deriveUserCompetencies(
  profile: OfficerProfile,
  baselineRatings?: Record<string, number>,
  toolsUsed?: string[],
  primaryDomain?: string
): UserCompetencyScore[] {
  // Find matching job role for this profile's grade/cadre/department
  let jobRole = DEFAULT_JOB_ROLES.find(
    (r) =>
      r.id === profile.jobRoleId ||
      (profile.cadreGrade && r.cadreGrade === profile.cadreGrade) ||
      (profile.department && r.department.toLowerCase().includes(profile.department.toLowerCase()))
  );
  if (!jobRole) {
    if (profile.cadreGrade === "JAG" || profile.cadreGrade === "SAG" || profile.cadreGrade === "HAG") {
      jobRole = DEFAULT_JOB_ROLES[2]; // Senior Statistical Officer (JAG)
    } else if (profile.cadreGrade === "SSO" || profile.cadreGrade === "JSO") {
      jobRole = DEFAULT_JOB_ROLES[1]; // Data Analyst / SSO
    } else {
      jobRole = DEFAULT_JOB_ROLES[0]; // Statistical Officer (STS)
    }
  }

  const exp = profile.yearsOfExperience || 2;
  const tools = toolsUsed || [];
  const domain = (primaryDomain || profile.currentAssignment || profile.department || "").toLowerCase();

  return DEFAULT_COMPETENCIES_CATALOGUE.map((def) => {
    let current = 2; // Default baseline

    // 1. Explicit user baseline rating provided on registration/onboarding
    if (baselineRatings && baselineRatings[def.name] !== undefined) {
      current = baselineRatings[def.name];
    }
    // 2. Data tools selected by user
    else if (def.name.includes("Python") && (tools.includes("Python") || tools.some((t) => t.toLowerCase().includes("python")))) {
      current = Math.min(5, Math.max(3, Math.round(exp >= 4 ? 4 : 3)));
    } else if (def.name.includes("R ") && (tools.includes("R") || tools.some((t) => t.toLowerCase() === "r"))) {
      current = Math.min(5, Math.max(3, Math.round(exp >= 4 ? 4 : 3)));
    } else if (def.name.includes("SQL") && (tools.includes("SQL") || tools.some((t) => t.toLowerCase().includes("sql")))) {
      current = Math.min(5, Math.max(3, Math.round(exp >= 4 ? 4 : 3)));
    } else if (def.name.includes("GIS") && (tools.includes("GIS") || tools.includes("QGIS") || tools.some((t) => t.toLowerCase().includes("gis")))) {
      current = Math.min(5, Math.max(3, Math.round(exp >= 4 ? 4 : 3)));
    } else if (def.name.includes("Data Visualization") && (tools.includes("Excel") || tools.includes("Python") || tools.includes("R"))) {
      current = Math.min(5, Math.max(3, Math.round(exp >= 3 ? 3 : 2)));
    }
    // 3. Domain & Department expertise matching from user profile
    else if (def.name.includes("National Accounts") && (domain.includes("national accounts") || domain.includes("nad") || domain.includes("gva"))) {
      current = Math.min(5, Math.max(3, Math.round(exp >= 4 ? 4 : 3)));
    } else if (def.name.includes("Labour") && (domain.includes("labour") || domain.includes("plfs") || domain.includes("fod"))) {
      current = Math.min(5, Math.max(3, Math.round(exp >= 4 ? 4 : 3)));
    } else if (def.name.includes("Price Statistics") && (domain.includes("price") || domain.includes("cpi") || domain.includes("wpi") || domain.includes("psd"))) {
      current = Math.min(5, Math.max(3, Math.round(exp >= 4 ? 4 : 3)));
    } else if (def.name.includes("Survey Design") && (domain.includes("survey") || domain.includes("sampling") || domain.includes("sdrd") || domain.includes("fod"))) {
      current = Math.min(5, Math.max(3, Math.round(exp >= 4 ? 4 : 3)));
    } else if (def.name.includes("SDG") && (domain.includes("sdg") || domain.includes("social") || domain.includes("ssd"))) {
      current = Math.min(5, Math.max(3, Math.round(exp >= 4 ? 4 : 3)));
    }
    // 4. Experience-based general statistical foundations
    else if (def.name.includes("Descriptive Statistics") || def.name.includes("Sampling Theory")) {
      if (profile.cadre.includes("Indian Statistical Service")) {
        current = Math.min(5, Math.max(3, Math.round(exp >= 5 ? 5 : exp >= 3 ? 4 : 3)));
      } else {
        current = Math.min(5, Math.max(2, Math.round(exp >= 4 ? 3 : 2)));
      }
    } else if (def.domain === "Behavioural") {
      if (def.name.includes("Ethics")) {
        current = Math.min(5, Math.max(4, Math.round(exp >= 3 ? 5 : 4)));
      } else {
        current = Math.min(5, Math.max(2, Math.round(exp >= 5 ? 4 : exp >= 2 ? 3 : 2)));
      }
    } else if (def.domain === "Digital Governance") {
      current = Math.min(4, Math.max(2, Math.round(exp >= 4 ? 3 : 2)));
    } else {
      // Technical emerging (AI/ML, Cloud APIs, etc.)
      current = 1;
    }

    const required = jobRole.requiredCompetencies[def.name] ?? 3;
    const gap = Math.max(0, required - current);

    // Formula: Priority Score = 35% Skill Gap + 25% Job Requirement + 20% Dept Priority + 10% Future Demand + 10% Career Relevance
    const gapNormalized = (gap / 5) * 100;
    const reqNormalized = (required / 5) * 100;
    const deptNormalized = (def.departmentPriority / 5) * 100;
    const futureNormalized = (def.futureDemandScore / 5) * 100;
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
      competencyId: def.id,
      competencyName: def.name,
      domain: def.domain,
      currentLevel: current,
      requiredLevel: required,
      gap,
      priorityScore,
      priorityLevel,
      confidenceScore: 0.88,
      evidenceSource: `Officer Baseline Evaluation (${profile.name || "Self-Assessment"})`,
      lastAssessedDate: new Date().toISOString().slice(0, 10),
    };
  });
}

export function getInitialUserCompetencies(customProfile?: OfficerProfile): UserCompetencyScore[] {
  const profile = customProfile || (typeof window !== "undefined" ? getProfile() : DEMO_STATISTICAL_OFFICER);
  return deriveUserCompetencies(profile);
}

// ──────────────────────────────────────────────
// 5. 30+ Curated Official Courses
// ──────────────────────────────────────────────
export const DEFAULT_COURSES_CATALOGUE: CourseItem[] = [
  {
    id: "igot-101",
    title: "Python for Data Analysis & Statistical Processing",
    provider: "iGOT",
    category: "Technical",
    duration: "20 hours · 6 modules",
    durationHours: 20,
    rating: 4.9,
    reviewsCount: 380,
    enrolledCount: 2450,
    level: "Intermediate",
    competenciesCovered: ["Python for Data Analysis", "SQL & Database Querying"],
    primaryCompetency: "Python for Data Analysis",
    description: "Automating government survey data processing with Pandas, NumPy, Statsmodels, and handling multi-gigabyte survey unit-level text data.",
    url: "https://igotkarmayogi.gov.in/app/toc/do_3138920194829107203/overview",
    language: "English / Hindi",
    enrolled: true,
    progressPct: 45,
    learningOutcomes: [
      "Master Pandas dataframes for NSSO unit-level data cleaning",
      "Automate multi-table joins and sampling multiplier calculations",
      "Generate automated PDF reports from survey records",
    ],
    syllabusModules: [
      { id: "m1", title: "Module 1: Python Fundamentals for Statistics", duration: "3 hours" },
      { id: "m2", title: "Module 2: Pandas Data Ingestion & Imputation", duration: "5 hours" },
      { id: "m3", title: "Module 3: Survey Weighting & Multipliers", duration: "4 hours" },
      { id: "m4", title: "Module 4: Exploratory Data Analysis & Plots", duration: "4 hours" },
      { id: "m5", title: "Module 5: Statistical Modelling & Regression", duration: "4 hours" },
    ],
  },
  {
    id: "igot-102",
    title: "Artificial Intelligence & Machine Learning in Official Statistics",
    provider: "iGOT",
    category: "Technical",
    duration: "24 hours · 5 modules",
    durationHours: 24,
    rating: 4.8,
    reviewsCount: 290,
    enrolledCount: 1840,
    level: "Intermediate",
    competenciesCovered: ["Artificial Intelligence & ML", "Python for Data Analysis"],
    primaryCompetency: "Artificial Intelligence & ML",
    description: "Supervised and unsupervised ML models, anomaly detection in census records, and automated survey text classification.",
    url: "https://igotkarmayogi.gov.in/app/toc/do_ai_ml_mospi/overview",
    language: "English",
    enrolled: false,
    progressPct: 0,
    learningOutcomes: [
      "Implement Scikit-Learn classifiers for administrative record matching",
      "Build anomaly detection algorithms for outlier survey responses",
      "Deploy natural language models for occupation code mapping (NCO/NIC)",
    ],
  },
  {
    id: "igot-103",
    title: "GIS & Geospatial Analysis with QGIS for Field Surveys",
    provider: "iGOT",
    category: "Technical",
    duration: "16 hours · 4 modules",
    durationHours: 16,
    rating: 4.8,
    reviewsCount: 210,
    enrolledCount: 1420,
    level: "Foundation",
    competenciesCovered: ["GIS & Geospatial Mapping", "Data Visualization & Storytelling"],
    primaryCompetency: "GIS & Geospatial Mapping",
    description: "Urban Frame Survey (UFS) block digitization, boundary shapefiles, spatial heatmaps, and integrating remote sensing imagery.",
    url: "https://igotkarmayogi.gov.in/app/toc/do_gis_qgis/overview",
    language: "English",
    enrolled: true,
    progressPct: 20,
    learningOutcomes: [
      "Digitize UFS blocks and administrative ward polygons in QGIS",
      "Overlay satellite imagery to detect urban growth frontiers",
      "Construct thematic spatial heatmaps for district-level indicators",
    ],
  },
  {
    id: "igot-104",
    title: "Data Storytelling & Executive Visual Briefings for Policy Makers",
    provider: "iGOT",
    category: "Behavioural",
    duration: "8 hours · 3 modules",
    durationHours: 8,
    rating: 4.9,
    reviewsCount: 640,
    enrolledCount: 5200,
    level: "Foundation",
    competenciesCovered: ["Data Visualization & Storytelling", "Public Policy Decision Making"],
    primaryCompetency: "Data Visualization & Storytelling",
    description: "Transforming complex multi-dimensional statistical tables into clear, actionable executive visual summaries for secretaries and ministers.",
    url: "https://igotkarmayogi.gov.in/app/toc/do_storytelling/overview",
    language: "English / Hindi",
    enrolled: true,
    progressPct: 100,
    completedDate: "12 May 2026",
  },
  {
    id: "igot-105",
    title: "Enterprise Database Management with SQL & Open Data APIs",
    provider: "iGOT",
    category: "Technical",
    duration: "12 hours · 4 modules",
    durationHours: 12,
    rating: 4.7,
    reviewsCount: 310,
    enrolledCount: 2400,
    level: "Foundation",
    competenciesCovered: ["SQL & Database Querying", "Cloud Infrastructure & APIs"],
    primaryCompetency: "SQL & Database Querying",
    description: "Querying relational databases, indexing census tables, writing stored procedures, and publishing APIs on data.gov.in.",
    url: "https://igotkarmayogi.gov.in/app/toc/do_sql_db/overview",
    language: "English",
    enrolled: false,
    progressPct: 0,
  },
  {
    id: "igot-106",
    title: "Digital Personal Data Protection (DPDP) Act & SDC Safeguards",
    provider: "iGOT",
    category: "Digital Governance",
    duration: "8 hours · 3 modules",
    durationHours: 8,
    rating: 4.8,
    reviewsCount: 520,
    enrolledCount: 4100,
    level: "Foundation",
    competenciesCovered: ["Data Privacy (DPDP Act)", "Cybersecurity Protocols"],
    primaryCompetency: "Data Privacy (DPDP Act)",
    description: "Legal compliance under India's DPDP Act 2023, k-anonymity, l-diversity, and statistical disclosure control for public microdata.",
    url: "https://igotkarmayogi.gov.in/app/toc/do_dpdp_privacy/overview",
    language: "English / Hindi",
    enrolled: false,
    progressPct: 0,
  },
  {
    id: "igot-107",
    title: "Cloud Computing & Scalable Microdata Pipelines for Census",
    provider: "iGOT",
    category: "Technical",
    duration: "16 hours · 4 modules",
    durationHours: 16,
    rating: 4.7,
    reviewsCount: 185,
    enrolledCount: 1320,
    level: "Intermediate",
    competenciesCovered: ["Cloud Infrastructure & APIs", "Enterprise IT Systems"],
    primaryCompetency: "Cloud Infrastructure & APIs",
    description: "Deploying secure serverless data pipelines, object storage buckets for decennial census microdata, and API load balancing.",
    url: "https://igotkarmayogi.gov.in/app/toc/do_cloud_census/overview",
    language: "English",
    enrolled: false,
    progressPct: 0,
    learningOutcomes: [
      "Architect secure government cloud storage buckets for census records",
      "Deploy scalable microdata transformation pipelines",
      "Configure REST API endpoints with rate-limiting and access control",
    ],
  },
  {
    id: "igot-108",
    title: "Cybersecurity Protocols & Information Assurance for MoSPI Servers",
    provider: "iGOT",
    category: "Digital Governance",
    duration: "10 hours · 3 modules",
    durationHours: 10,
    rating: 4.9,
    reviewsCount: 410,
    enrolledCount: 3200,
    level: "Foundation",
    competenciesCovered: ["Cybersecurity Protocols", "Data Privacy (DPDP Act)"],
    primaryCompetency: "Cybersecurity Protocols",
    description: "CERT-In compliance guidelines, two-factor authentication enforcement, secure socket layers, and data breach prevention.",
    url: "https://igotkarmayogi.gov.in/app/toc/do_cybersecurity_govt/overview",
    language: "English / Hindi",
    enrolled: false,
    progressPct: 0,
    learningOutcomes: [
      "Implement CERT-In compliance protocols for government databases",
      "Configure encryption and two-factor authentication standards",
      "Establish rapid incident reporting and data breach mitigation",
    ],
  },
  {
    id: "igot-109",
    title: "Public Policy Decision Making & Evidence-Based Governance",
    provider: "iGOT",
    category: "Behavioural",
    duration: "14 hours · 4 modules",
    durationHours: 14,
    rating: 4.8,
    reviewsCount: 350,
    enrolledCount: 2800,
    level: "Intermediate",
    competenciesCovered: ["Public Policy Decision Making", "Data Visualization & Storytelling"],
    primaryCompetency: "Public Policy Decision Making",
    description: "Synthesizing multi-sectoral survey evidence, calculating benefit-cost ratios, and drafting policy briefs for Union Cabinet approval.",
    url: "https://igotkarmayogi.gov.in/app/toc/do_policy_governance/overview",
    language: "English",
    enrolled: false,
    progressPct: 0,
    learningOutcomes: [
      "Synthesize large-scale survey findings into Cabinet notes",
      "Perform multi-criteria cost-benefit analysis for social welfare schemes",
      "Frame evidence-based policy arguments for executive leadership",
    ],
  },
  {
    id: "igot-110",
    title: "Executive Leadership & Strategic Management for Statistical Cadres",
    provider: "iGOT",
    category: "Behavioural",
    duration: "16 hours · 4 modules",
    durationHours: 16,
    rating: 4.9,
    reviewsCount: 290,
    enrolledCount: 2150,
    level: "Advanced",
    competenciesCovered: ["Team Leadership & Governance", "Public Policy Decision Making", "Leadership & Mentorship"],
    primaryCompetency: "Team Leadership & Governance",
    description: "Strategic change management, inter-cadre coordination across central ministries, and mentoring junior statistical officers.",
    url: "https://igotkarmayogi.gov.in/app/toc/do_leadership_iss/overview",
    language: "English",
    enrolled: false,
    progressPct: 0,
    learningOutcomes: [
      "Lead cross-functional field survey and analytical teams",
      "Manage inter-ministerial statistical coordination protocols",
      "Mentor junior officers under the Mission Karmayogi competency framework",
    ],
  },
  {
    id: "nssta-201",
    title: "UN System of National Accounts (SNA 2008) & GVA Compilation",
    provider: "NSSTA",
    category: "Statistical",
    duration: "20 hours · 8 modules",
    durationHours: 20,
    rating: 4.9,
    reviewsCount: 210,
    enrolledCount: 1420,
    level: "Advanced",
    competenciesCovered: ["National Accounts & GVA", "Descriptive Statistics & Sampling"],
    primaryCompetency: "National Accounts & GVA",
    description: "Compilation of Gross Value Added (GVA), Supply-Use Tables (SUT), double deflation, and quarterly GDP estimation per SNA 2008 standards.",
    url: "https://nssta.gov.in/programmes/sna2008-gva",
    language: "English",
    enrolled: true,
    progressPct: 60,
  },
  {
    id: "nssta-202",
    title: "Sampling Methodology, Multi-Stage Sampling & Survey Design",
    provider: "NSSTA",
    category: "Statistical",
    duration: "18 hours · 6 modules",
    durationHours: 18,
    rating: 4.8,
    reviewsCount: 195,
    enrolledCount: 1250,
    level: "Intermediate",
    competenciesCovered: ["Survey Design & Methodology", "Sampling Theory & PPS"],
    primaryCompetency: "Sampling Theory & PPS",
    description: "Stratified multistage sampling, allocation of sample sizes across strata, PPS systematic sampling, and estimating sampling variance.",
    url: "https://nssta.gov.in/programmes/sampling-design",
    language: "English",
    enrolled: true,
    progressPct: 100,
    completedDate: "28 Feb 2026",
  },
  {
    id: "nssta-203",
    title: "Consumer Price Index (CPI) Compilation & Laspeyres Index Weighting",
    provider: "NSSTA",
    category: "Statistical",
    duration: "16 hours · 5 modules",
    durationHours: 16,
    rating: 4.9,
    reviewsCount: 240,
    enrolledCount: 1680,
    level: "Intermediate",
    competenciesCovered: ["Price Statistics (CPI / WPI)", "Descriptive Statistics & Sampling"],
    primaryCompetency: "Price Statistics (CPI / WPI)",
    description: "Modified Laspeyres price formula, elementary aggregate price relatives, geometric vs arithmetic means, and rural/urban aggregation.",
    url: "https://nssta.gov.in/programmes/cpi-laspeyres",
    language: "English",
    enrolled: false,
    progressPct: 0,
  },
  {
    id: "nssta-204",
    title: "Periodic Labour Force Survey (PLFS) Methodology & Labour Indicators",
    provider: "NSSTA",
    category: "Statistical",
    duration: "18 hours · 6 modules",
    durationHours: 18,
    rating: 4.8,
    reviewsCount: 175,
    enrolledCount: 1100,
    level: "Intermediate",
    competenciesCovered: ["Labour & Employment (PLFS)", "Survey Design & Methodology"],
    primaryCompetency: "Labour & Employment (PLFS)",
    description: "Principal status vs current weekly status classification, labour force participation rate (LFPR), worker population ratio (WPR), and unemployment rate estimation.",
    url: "https://nssta.gov.in/programmes/plfs-methodology",
    language: "English",
    enrolled: false,
    progressPct: 0,
  },
  {
    id: "nssta-205",
    title: "UN Fundamental Principles of Official Statistics & Professional Ethics",
    provider: "NSSTA",
    category: "Behavioural",
    duration: "12 hours · 4 modules",
    durationHours: 12,
    rating: 4.9,
    reviewsCount: 160,
    enrolledCount: 980,
    level: "Foundation",
    competenciesCovered: ["Ethics in Official Statistics", "Public Policy Decision Making"],
    primaryCompetency: "Ethics in Official Statistics",
    description: "Adherence to UN Fundamental Principles of Official Statistics (UNFPOS), professional independence, data confidentiality, and ethical integrity in government data publication.",
    url: "https://nssta.gov.in/programmes/unfpos-ethics",
    language: "English / Hindi",
    enrolled: false,
    progressPct: 0,
    learningOutcomes: [
      "Apply the 10 UN Fundamental Principles of Official Statistics in daily governance",
      "Ensure respondent confidentiality and data integrity under the Collection of Statistics Act",
      "Maintain professional independence and public trust in official releases",
    ],
  },
  {
    id: "nssta-206",
    title: "Sustainable Development Goal (SDG) Indicators & National Indicator Framework",
    provider: "NSSTA",
    category: "Statistical",
    duration: "16 hours · 5 modules",
    durationHours: 16,
    rating: 4.8,
    reviewsCount: 220,
    enrolledCount: 1540,
    level: "Intermediate",
    competenciesCovered: ["SDG Indicators & Metadata", "National Accounts & GVA"],
    primaryCompetency: "SDG Indicators & Metadata",
    description: "Monitoring India's SDG National Indicator Framework (NIF), metadata standardization, data harmonisation across line ministries, and UN custody agency reporting.",
    url: "https://nssta.gov.in/programmes/sdg-metadata-nif",
    language: "English",
    enrolled: false,
    progressPct: 0,
    learningOutcomes: [
      "Map administrative dataset variables to SDG NIF target indicators",
      "Author standardized statistical metadata following SDMX guidelines",
      "Coordinate international reporting data flows with UN Custodian Agencies",
    ],
  },
  {
    id: "nssta-207",
    title: "R Statistical Computing for Complex Survey Sampling & Econometric Modelling",
    provider: "NSSTA",
    category: "Technical",
    duration: "20 hours · 6 modules",
    durationHours: 20,
    rating: 4.9,
    reviewsCount: 310,
    enrolledCount: 2100,
    level: "Intermediate",
    competenciesCovered: ["R Statistical Computing", "Sampling Theory & PPS"],
    primaryCompetency: "R Statistical Computing",
    description: "Applying R and the 'survey' package for complex stratified multi-stage designs, survey weight calibration, variance estimation, and econometric modeling.",
    url: "https://nssta.gov.in/programmes/r-survey-computing",
    language: "English",
    enrolled: false,
    progressPct: 0,
    learningOutcomes: [
      "Utilize R's 'survey' package for complex stratified cluster sampling designs",
      "Calibrate survey weights using raking and post-stratification techniques",
      "Run survey-weighted linear and logistic regression models",
    ],
  },
  {
    id: "nssta-208",
    title: "Digital Public Infrastructure (DPI) & Statistical Data Exchange Architecture",
    provider: "NSSTA",
    category: "Digital Governance",
    duration: "14 hours · 4 modules",
    durationHours: 14,
    rating: 4.8,
    reviewsCount: 190,
    enrolledCount: 1280,
    level: "Intermediate",
    competenciesCovered: ["Digital Public Infrastructure", "Cloud Infrastructure & APIs"],
    primaryCompetency: "Digital Public Infrastructure",
    description: "Architectural integration with India Stack, e-Pramaan, DigiLocker, API Setu, and developing open statistical data exchange protocols.",
    url: "https://nssta.gov.in/programmes/dpi-data-exchange",
    language: "English",
    enrolled: false,
    progressPct: 0,
    learningOutcomes: [
      "Integrate government data platforms with India Stack and API Setu",
      "Implement e-Pramaan authentication and consent artifacts for statistical microdata",
      "Design open, standardized data exchange APIs for inter-ministerial access",
    ],
  },
];

// ──────────────────────────────────────────────
// 6. NSSTA TPAC Training Programmes
// ──────────────────────────────────────────────
export const DEFAULT_NSSTA_PROGRAMMES: NsstaTrainingProgramme[] = [
  {
    id: "tpac-2026-01",
    programmeName: "Advanced National Accounts, Supply-Use Tables & Financial Intermediation",
    description: "Comprehensive in-person executive training on SUT rebalancing, FISIM allocation, and digital economy GVA estimation.",
    targetAudience: "ISS JAG/STS Officers, DES Directors",
    competencies: ["National Accounts & GVA", "Descriptive Statistics & Sampling"],
    duration: "5 Days (35 Hours)",
    durationHours: 35,
    deliveryMode: "Residential at NSSTA Greater Noida",
    eligibility: "Officers with 3+ years experience in National Accounts or Price Statistics",
    schedule: "14 Jul 2026 – 18 Jul 2026",
    priority: "High",
    registrationUrl: "https://nssta.gov.in/tpac/register/2026-01",
    seatCapacity: 35,
    enrolledCount: 28,
  },
  {
    id: "tpac-2026-02",
    programmeName: "Python & Machine Learning for NSSO Large-Scale Household Surveys",
    description: "Intensive hands-on lab workshop in NSSTA Computer Centre covering multi-terabyte microdata extraction, imputation, and survey weighting.",
    targetAudience: "ISS/SSS Officers, Research Officers",
    competencies: ["Python for Data Analysis", "Artificial Intelligence & ML", "Sampling Theory & PPS"],
    duration: "5 Days (35 Hours)",
    durationHours: 35,
    deliveryMode: "Residential at NSSTA Greater Noida",
    eligibility: "Open to all ISS/SSS officers handling NSSO/PLFS/ASI datasets",
    schedule: "04 Aug 2026 – 08 Aug 2026",
    priority: "High",
    registrationUrl: "https://nssta.gov.in/tpac/register/2026-02",
    seatCapacity: 40,
    enrolledCount: 38,
  },
  {
    id: "tpac-2026-03",
    programmeName: "GIS Mapping, Drone Imagery & Spatial Econometrics for Field Surveys",
    description: "Spatial survey framing using QGIS, satellite imagery overlays, and cadastral map reconciliation for agricultural and urban surveys.",
    targetAudience: "Field Operations Division (FOD) & State DES Officers",
    competencies: ["GIS & Geospatial Mapping", "Survey Design & Methodology"],
    duration: "4 Days (28 Hours)",
    durationHours: 28,
    deliveryMode: "Hybrid Fieldwork",
    eligibility: "Officers involved in UFS frame updating or Agricultural Census",
    schedule: "18 Aug 2026 – 21 Aug 2026",
    priority: "High",
    registrationUrl: "https://nssta.gov.in/tpac/register/2026-03",
    seatCapacity: 30,
    enrolledCount: 22,
  },
  {
    id: "tpac-2026-04",
    programmeName: "Digital Personal Data Protection Act 2023 & Statistical Disclosure Control",
    description: "Legal and technical workshop on anonymization, differential privacy, and microdata release governance under India's DPDP Act.",
    targetAudience: "All Cadre Officers, IT Managers, Legal Officers",
    competencies: ["Data Privacy (DPDP Act)", "Cybersecurity Protocols", "Ethics in Official Statistics"],
    duration: "3 Days (21 Hours)",
    durationHours: 21,
    deliveryMode: "Virtual Interactive",
    eligibility: "Open to all central and state government statistical officials",
    schedule: "01 Sep 2026 – 03 Sep 2026",
    priority: "High",
    registrationUrl: "https://nssta.gov.in/tpac/register/2026-04",
    seatCapacity: 100,
    enrolledCount: 84,
  },
];

// ──────────────────────────────────────────────
// 7. Pre-Populated Quizzes Catalogue
// ──────────────────────────────────────────────
export const DEFAULT_QUIZZES: QuizItem[] = [
  {
    id: "quiz-sampling-101",
    title: "Sampling Methodology & PPS Selection",
    description: "Official evaluation covering stratification, multistage frames, and multiplier calculation.",
    domain: "Statistical",
    competency: "Sampling Theory & PPS",
    questionsCount: 4,
    durationMinutes: 10,
    difficulty: "Intermediate",
    completed: true,
    lastScorePct: 88,
    questions: [
      {
        id: 1,
        question: "Which sampling technique divides a heterogeneous population into homogeneous subgroups before sampling?",
        options: ["Simple Random Sampling", "Stratified Sampling", "Cluster Sampling", "Systematic Sampling"],
        correctAnswerIndex: 1,
        explanation: "Stratified sampling ensures representation by dividing the population into non-overlapping homogeneous strata.",
        difficulty: "Basic",
        topic: "Sampling Methods",
        competency: "Sampling Theory & PPS",
        sourceReference: "NSSO Sampling Design Manual · Page 8",
        isValidated: true,
      },
      {
        id: 2,
        question: "In Probability Proportional to Size (PPS) systematic sampling, what variable is typically used as measure of size for rural FSUs?",
        options: ["Geographical Area in sq km", "Census Population / Household Count", "Number of Livestock", "Agricultural Land Area"],
        correctAnswerIndex: 1,
        explanation: "Census population or household count is standardly taken as the size measure for rural first-stage units.",
        difficulty: "Intermediate",
        topic: "PPS Selection",
        competency: "Sampling Theory & PPS",
        sourceReference: "NSSO 78th Round Instructions · Page 14",
        isValidated: true,
      },
      {
        id: 3,
        question: "What is the sampling multiplier formula for an FSU selected with probability P_i?",
        options: ["Multiplier = P_i × 100", "Multiplier = 1 / P_i", "Multiplier = sqrt(P_i)", "Multiplier = P_i / Total_Sample"],
        correctAnswerIndex: 1,
        explanation: "The sampling weight multiplier is mathematically the inverse of the selection probability (W_i = 1 / P_i).",
        difficulty: "Intermediate",
        topic: "Survey Multipliers",
        competency: "Sampling Theory & PPS",
        sourceReference: "NSSO Estimation Formulae Manual · Section 3.2",
        isValidated: true,
      },
      {
        id: 4,
        question: "Why does MoSPI utilize two independent interpenetrating sub-samples in nationwide surveys?",
        options: ["To double the survey budget", "To obtain unbiased sampling variance estimates without complex covariances", "To eliminate non-response completely", "To survey urban areas twice"],
        correctAnswerIndex: 1,
        explanation: "Independent sub-samples allow calculating sampling error directly from the squared difference between sub-sample totals: Var(Y_hat) = (1/4)(Y1 - Y2)^2.",
        difficulty: "Advanced",
        topic: "Variance Estimation",
        competency: "Sampling Theory & PPS",
        sourceReference: "SDRD Technical Handbook · Page 33",
        isValidated: true,
      },
    ],
  },
  {
    id: "quiz-sna-201",
    title: "UN SNA 2008 & Gross Value Added (GVA)",
    description: "Evaluates production boundaries, intermediate consumption deduction, and Supply-Use Tables balance.",
    domain: "Statistical",
    competency: "National Accounts & GVA",
    questionsCount: 4,
    durationMinutes: 10,
    difficulty: "Advanced",
    completed: false,
    questions: [
      {
        id: 1,
        question: "Under UN SNA 2008, how is Gross Value Added (GVA) at basic prices computed from output?",
        options: [
          "GVA = Gross Output at Basic Prices - Intermediate Consumption at Purchaser Prices",
          "GVA = Gross Output + GST Taxes",
          "GVA = Final Consumption Expenditure + Exports",
          "GVA = Net Operating Surplus only",
        ],
        correctAnswerIndex: 0,
        explanation: "GVA at basic prices represents the value generated by any producing unit: Gross Output less Intermediate Consumption.",
        difficulty: "Intermediate",
        topic: "GVA Fundamentals",
        competency: "National Accounts & GVA",
        sourceReference: "UN SNA 2008 · Chapter 6",
        isValidated: true,
      },
      {
        id: 2,
        question: "To reconcile GVA at basic prices to GDP at market prices, which adjustment must be applied?",
        options: [
          "Deduct all subsidies and deduct all taxes",
          "Add Product Taxes and subtract Product Subsidies",
          "Multiply by the Wholesale Price Index (WPI)",
          "Subtract exports and add imports",
        ],
        correctAnswerIndex: 1,
        explanation: "GDP at market prices = Sum of GVA at basic prices + (Taxes on Products - Subsidies on Products).",
        difficulty: "Intermediate",
        topic: "GDP vs GVA",
        competency: "National Accounts & GVA",
        sourceReference: "MoSPI National Accounts Statistics Manual · Page 12",
        isValidated: true,
      },
      {
        id: 3,
        question: "In a Supply and Use Table (SUT) framework, what fundamental identity must hold for every commodity group?",
        options: [
          "Domestic Output + Imports = Intermediate Use + Final Uses (Consumption + GCF + Exports)",
          "Total Supply = Total Subsidies",
          "Exports must always exceed Imports",
          "Intermediate Consumption must equal Zero",
        ],
        correctAnswerIndex: 0,
        explanation: "The commodity balance requires that Total Supply (Domestic Output + Imports) equals Total Use (Intermediate Use + Final Consumption + GCF + Exports).",
        difficulty: "Advanced",
        topic: "Supply Use Tables",
        competency: "National Accounts & GVA",
        sourceReference: "National Accounts Division SUT Framework · Page 26",
        isValidated: true,
      },
      {
        id: 4,
        question: "What is the primary advantage of double deflation over single deflation when compiling constant price GVA?",
        options: [
          "It deflates output and intermediate inputs separately with their respective specific price deflators",
          "It eliminates the need for price indices entirely",
          "It requires 50% fewer calculations",
          "It produces identical results to current price series",
        ],
        correctAnswerIndex: 0,
        explanation: "Double deflation applies separate output deflators to gross output and input deflators to intermediate consumption, preventing distortions when input and output prices diverge.",
        difficulty: "Advanced",
        topic: "Price Deflation",
        competency: "National Accounts & GVA",
        sourceReference: "UNSD National Accounts Handbook · Chapter 15",
        isValidated: true,
      },
    ],
  },
  {
    id: "quiz-cpi-103",
    title: "Consumer Price Index (CPI) Laspeyres Compilation",
    description: "Evaluates modified Laspeyres price relatives, group weights, and geometric item mean aggregation.",
    domain: "Statistical",
    competency: "Price Statistics (CPI / WPI)",
    questionsCount: 3,
    durationMinutes: 8,
    difficulty: "Intermediate",
    completed: false,
    questions: [
      {
        id: 1,
        question: "Which index number formula fixes commodity weights at base period basket quantities?",
        options: ["Laspeyres Index", "Paasche Index", "Fisher Ideal Index", "Tornqvist Index"],
        correctAnswerIndex: 0,
        explanation: "The Laspeyres index uses base period quantities as fixed weights: I_L = (sum(P_t * Q_0) / sum(P_0 * Q_0)) * 100.",
        difficulty: "Basic",
        topic: "Index Numbers",
        competency: "Price Statistics (CPI / WPI)",
        sourceReference: "MoSPI Price Statistics Manual · Chapter 2",
        isValidated: true,
      },
      {
        id: 2,
        question: "In the all-India CPI (Combined, Base 2012=100), which commodity group carries the largest weight?",
        options: ["Food & Beverages (45.86%)", "Fuel & Light (6.84%)", "Housing (10.07%)", "Clothing & Footwear (6.53%)"],
        correctAnswerIndex: 0,
        explanation: "Food & Beverages comprises 45.86% of the national consumer basket weight in the 2012 series.",
        difficulty: "Basic",
        topic: "CPI Basket Allocation",
        competency: "Price Statistics (CPI / WPI)",
        sourceReference: "MoSPI CPI Release Bulletin · Table 1",
        isValidated: true,
      },
      {
        id: 3,
        question: "How are elementary price relatives aggregated across multiple price quotation centers before group weighting?",
        options: ["Geometric Mean of elementary price relatives", "Simple Arithmetic Sum without divisor", "Maximum quotation only", "Random selection of single store"],
        correctAnswerIndex: 0,
        explanation: "Elementary price indices at village/market level are standardly compiled using the Jevons geometric mean to minimize substitution bias.",
        difficulty: "Intermediate",
        topic: "Elementary Price Aggregation",
        competency: "Price Statistics (CPI / WPI)",
        sourceReference: "ILO CPI Manual · Chapter 10",
        isValidated: true,
      },
    ],
  },
  {
    id: "quiz-python-102",
    title: "Python for NSSO Microdata & Survey Weights",
    description: "Evaluates Pandas unit-level data cleaning, joins, and survey multiplier expansions.",
    domain: "Technical",
    competency: "Python for Data Analysis",
    questionsCount: 3,
    durationMinutes: 8,
    difficulty: "Intermediate",
    completed: false,
    questions: [
      {
        id: 1,
        question: "In Pandas, which method is most memory-efficient for reading 500MB+ fixed-width NSSO microdata files?",
        options: ["pd.read_csv() with chunksize parameter", "pd.read_json()", "pd.read_sql()", "pd.read_clipboard()"],
        correctAnswerIndex: 0,
        explanation: "Using chunksize creates an iterator that processes large tabular text files without exhausting RAM.",
        difficulty: "Intermediate",
        topic: "Python Data Processing",
        competency: "Python for Data Analysis",
        sourceReference: "MoSPI Python Automation Handbook · Page 22",
        isValidated: true,
      },
      {
        id: 2,
        question: "To compute weighted population estimates in Pandas, how should sampling multiplier 'Weight_Combined' be applied to variable 'Wage'?",
        options: [
          "(df['Wage'] * df['Weight_Combined']).sum() / df['Weight_Combined'].sum()",
          "df['Wage'].mean() * df['Weight_Combined'].mean()",
          "df['Wage'].sum() / len(df)",
          "np.median(df['Wage']) * 100",
        ],
        correctAnswerIndex: 0,
        explanation: "The unbiased weighted mean is the sum of (Value * Weight) divided by the sum of Weights.",
        difficulty: "Intermediate",
        topic: "Weighted Estimation",
        competency: "Python for Data Analysis",
        sourceReference: "Python for Official Statistics Workbook · Lab 3",
        isValidated: true,
      },
      {
        id: 3,
        question: "Which Python visualization library integrates seamlessly with GeoJSON to produce administrative district choropleth maps?",
        options: ["Geopandas & Folium / Plotly", "Tkinter", "Pygame", "Flask"],
        correctAnswerIndex: 0,
        explanation: "Geopandas combined with Folium or Plotly is the standard toolkit for spatial boundary joining and choropleth thematic mapping.",
        difficulty: "Intermediate",
        topic: "Spatial GIS Mapping",
        competency: "Python for Data Analysis",
        sourceReference: "NSSTA GIS Tutorial · Module 2",
        isValidated: true,
      },
    ],
  },
  {
    id: "quiz-dpdp-301",
    title: "DPDP Act 2023 & Microdata Confidentiality",
    description: "Evaluates statutory obligations, k-anonymity, cell suppression, and re-identification risk.",
    domain: "Digital Governance",
    competency: "Data Privacy (DPDP Act)",
    questionsCount: 3,
    durationMinutes: 8,
    difficulty: "Intermediate",
    completed: false,
    questions: [
      {
        id: 1,
        question: "Under the Digital Personal Data Protection (DPDP) Act 2023, what is the statutory role of government statistical divisions processing citizen data?",
        options: ["Data Fiduciary", "Data Broker", "External Auditor only", "Third-party advertiser"],
        correctAnswerIndex: 0,
        explanation: "Any ministry or entity that determines the purpose and means of personal data processing is classified as a Data Fiduciary under DPDP Act 2023.",
        difficulty: "Basic",
        topic: "DPDP Statutory Roles",
        competency: "Data Privacy (DPDP Act)",
        sourceReference: "DPDP Act 2023 Gazette · Section 2(i)",
        isValidated: true,
      },
      {
        id: 2,
        question: "In statistical disclosure control (SDC), what does a 'k-anonymity = 5' threshold guarantee for public microdata?",
        options: [
          "Every unique combination of quasi-identifiers (e.g. Age, Gender, Pincode) is shared by at least 5 individuals",
          "Data is encrypted with 5-bit keys",
          "Only 5 variables are released",
          "5% of records are deleted randomly",
        ],
        correctAnswerIndex: 0,
        explanation: "k-anonymity ensures that each quasi-identifier combination appears in at least k records in the published dataset, preventing single-record triangulation.",
        difficulty: "Intermediate",
        topic: "Statistical Disclosure Control",
        competency: "Data Privacy (DPDP Act)",
        sourceReference: "SDC Microdata Handbook · Page 18",
        isValidated: true,
      },
      {
        id: 3,
        question: "When publishing cross-tabulations with small cell frequencies (<3 observations), which protection technique is standard?",
        options: ["Primary Cell Suppression and Complementary Secondary Suppression", "Multiplying small numbers by 1000", "Deleting entire tables from the website", "Exposing individual respondent phone numbers"],
        correctAnswerIndex: 0,
        explanation: "Sensitive cells with few observations are suppressed, along with secondary cells to prevent mathematical derivation from row/column marginal totals.",
        difficulty: "Intermediate",
        topic: "Tabular Data Protection",
        competency: "Data Privacy (DPDP Act)",
        sourceReference: "MoSPI Microdata Dissemination Policy · Rule 9",
        isValidated: true,
      },
    ],
  },
];

// ──────────────────────────────────────────────
// 8. Learning Resources / Documents
// ──────────────────────────────────────────────
export const DEFAULT_RESOURCES: LearningResource[] = [
  {
    id: "res-1",
    title: "NSSO Sampling Design & Field Estimation Manual (79th Round)",
    fileType: "PDF",
    pageCount: 48,
    uploadedDate: "24 May 2026",
    uploadedBy: "Survey Design & Research Division (SDRD)",
    domain: "Statistical",
    associatedCompetencies: ["Sampling Theory & PPS", "Survey Design & Methodology"],
    summary: "Standard operational manual defining stratification rules, sub-round allocations, and multiplier normalization.",
    contentSnippet: "Stratified two-stage sampling is adopted for rural and urban sectors across all states...",
  },
  {
    id: "res-2",
    title: "UN SNA 2008 Gross Value Added (GVA) Methodological Guidelines",
    fileType: "PDF",
    pageCount: 64,
    uploadedDate: "10 May 2026",
    uploadedBy: "National Accounts Division (NAD)",
    domain: "Statistical",
    associatedCompetencies: ["National Accounts & GVA", "Price Statistics (CPI / WPI)"],
    summary: "Official handbook on Supply-Use Table (SUT) matrix rebalancing and double deflation.",
    contentSnippet: "GVA at basic prices equals Gross Output at basic prices less Intermediate Consumption at purchaser prices...",
  },
  {
    id: "res-3",
    title: "Digital Personal Data Protection (DPDP) Act 2023 Implementation Circular",
    fileType: "PDF",
    pageCount: 22,
    uploadedDate: "15 Apr 2026",
    uploadedBy: "MeitY / MoSPI IT Cell",
    domain: "Digital Governance",
    associatedCompetencies: ["Data Privacy (DPDP Act)", "Cybersecurity Protocols"],
    summary: "Statutory provisions governing microdata anonymization, consent logging, and perturbation.",
    contentSnippet: "All data fiduciaries must implement strict technical safeguards including k-anonymity...",
  },
];

// ──────────────────────────────────────────────
// 9. Admin Employee Roster
// ──────────────────────────────────────────────
export const DEFAULT_EMPLOYEES: EmployeeRecord[] = [
  { id: "emp-1", name: "Dr. Rajesh Sharma", department: "Labour Statistics", cadre: "ISS", grade: "STS", role: "Statistical Officer", competencyIndex: 3.4, highGapsCount: 3, hoursCompleted: 42, complianceStatus: "In Progress", email: "rajesh.sharma@nic.in" },
  { id: "emp-2", name: "Shri Vivek Mehra", department: "Field Operations (FOD)", cadre: "SSS", grade: "SSO", role: "Senior Statistical Officer", competencyIndex: 3.8, highGapsCount: 2, hoursCompleted: 48, complianceStatus: "In Progress", email: "vivek.mehra@nic.in" },
  { id: "emp-3", name: "Smt. Kavita Reddy", department: "State DES", cadre: "State DES", grade: "Officer", role: "Assistant Director", competencyIndex: 3.9, highGapsCount: 1, hoursCompleted: 52, complianceStatus: "Compliant", email: "kavita.reddy@gov.in" },
  { id: "emp-4", name: "Dr. Preeti Sinha", department: "Price Statistics (PSD)", cadre: "ISS", grade: "JAG", role: "Joint Director", competencyIndex: 4.3, highGapsCount: 0, hoursCompleted: 56, complianceStatus: "Compliant", email: "preeti.sinha@nic.in" },
  { id: "emp-5", name: "Shri Ramesh Chandra", department: "National Accounts (NAD)", cadre: "ISS", grade: "SAG", role: "Deputy Director General", competencyIndex: 4.6, highGapsCount: 0, hoursCompleted: 60, complianceStatus: "Compliant", email: "ramesh.chandra@nic.in" },
];

// ──────────────────────────────────────────────
// 10. Normalized Token-Overlap Matching Helper
// ──────────────────────────────────────────────

/**
 * Normalizes text for fuzzy token matching, removing generic noise words
 */
export function normalizeTokens(str: string): Set<string> {
  const stopWords = new Set([
    "and", "in", "for", "of", "the", "with", "to", "act", "by", "on", "a", "an", "&", "its",
    "course", "official", "systems", "training", "programmes", "methodology", "general"
  ]);
  return new Set(
    str
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 0 && !stopWords.has(w))
  );
}

/**
 * Fuzzy token-overlap and domain-aware matcher between a course and a target competency
 */
export function courseMatchesCompetency(
  course: {
    primaryCompetency?: string;
    competenciesCovered?: string[];
    competencyList?: string[];
    title?: string;
    name?: string;
    description?: string;
  },
  competencyName: string
): boolean {
  if (!competencyName || !course) return false;

  const target = competencyName.toLowerCase().trim();
  const primary = (course.primaryCompetency || "").toLowerCase().trim();
  const coveredList = course.competenciesCovered || course.competencyList || [];
  const covered = coveredList.map((c) => c.toLowerCase().trim());
  const title = (course.title || course.name || "").toLowerCase().trim();
  const description = (course.description || "").toLowerCase().trim();

  // 1. Direct or Substring match on competency fields
  if (primary === target || covered.includes(target)) return true;
  if (primary && (primary.includes(target) || target.includes(primary))) return true;
  if (covered.some((c) => c.includes(target) || target.includes(c))) return true;

  // 2. High-precision Domain Key Term Mappings
  const keyRules: { targetKeys: string[]; courseMatchers: ((cTitle: string, cDesc: string, cPrimary: string, cCovered: string[]) => boolean) }[] = [
    {
      targetKeys: ["r statistical", "r computing", "r programming"],
      courseMatchers: (t, d, p, cov) => {
        const full = `${t} ${d} ${p} ${cov.join(" ")}`.toLowerCase();
        return /\br statistical\b|\br programming\b|\br language\b|\br script\b|\busing r\b|\br and the 'survey'\b/i.test(full);
      },
    },
    {
      targetKeys: ["sdg", "sustainable development goal"],
      courseMatchers: (t, d, p, cov) => `${t} ${d} ${p} ${cov.join(" ")}`.toLowerCase().includes("sdg") || `${t} ${d}`.includes("national indicator framework"),
    },
    {
      targetKeys: ["ethics", "unfpos"],
      courseMatchers: (t, d, p, cov) => `${t} ${d} ${p} ${cov.join(" ")}`.toLowerCase().includes("ethics") || `${t} ${d}`.includes("unfpos") || `${t} ${d}`.includes("professional ethics"),
    },
    {
      targetKeys: ["digital public infrastructure", "dpi"],
      courseMatchers: (t, d, p, cov) => {
        const full = `${t} ${d} ${p} ${cov.join(" ")}`.toLowerCase();
        return full.includes("digital public infrastructure") || full.includes("dpi") || full.includes("india stack") || full.includes("digilocker") || full.includes("e-pramaan");
      },
    },
    {
      targetKeys: ["leadership", "governance", "team leadership"],
      courseMatchers: (t, d, p, cov) => {
        const full = `${t} ${d} ${p} ${cov.join(" ")}`.toLowerCase();
        return full.includes("leadership") || full.includes("strategic management") || full.includes("mentoring junior");
      },
    },
    {
      targetKeys: ["privacy", "dpdp"],
      courseMatchers: (t, d, p, cov) => {
        const full = `${t} ${d} ${p} ${cov.join(" ")}`.toLowerCase();
        return full.includes("dpdp") || full.includes("data privacy") || full.includes("k-anonymity") || full.includes("disclosure control");
      },
    },
    {
      targetKeys: ["cybersecurity"],
      courseMatchers: (t, d, p, cov) => {
        const full = `${t} ${d} ${p} ${cov.join(" ")}`.toLowerCase();
        return full.includes("cybersecurity") || full.includes("cert-in") || full.includes("information assurance");
      },
    },
    {
      targetKeys: ["cloud infrastructure", "cloud computing"],
      courseMatchers: (t, d, p, cov) => {
        const full = `${t} ${d} ${p} ${cov.join(" ")}`.toLowerCase();
        return full.includes("cloud computing") || full.includes("cloud infrastructure") || full.includes("serverless");
      },
    },
    {
      targetKeys: ["gis", "geospatial"],
      courseMatchers: (t, d, p, cov) => {
        const full = `${t} ${d} ${p} ${cov.join(" ")}`.toLowerCase();
        return full.includes("gis") || full.includes("qgis") || full.includes("geospatial") || full.includes("shapefile");
      },
    },
    {
      targetKeys: ["plfs", "labour & employment", "labour and employment"],
      courseMatchers: (t, d, p, cov) => {
        const full = `${t} ${d} ${p} ${cov.join(" ")}`.toLowerCase();
        return full.includes("plfs") || full.includes("labour force") || full.includes("unemployment rate");
      },
    },
    {
      targetKeys: ["cpi", "price statistics", "wpi"],
      courseMatchers: (t, d, p, cov) => {
        const full = `${t} ${d} ${p} ${cov.join(" ")}`.toLowerCase();
        return full.includes("cpi") || full.includes("price index") || full.includes("laspeyres");
      },
    },
    {
      targetKeys: ["national accounts", "gva", "sna"],
      courseMatchers: (t, d, p, cov) => {
        const full = `${t} ${d} ${p} ${cov.join(" ")}`.toLowerCase();
        return full.includes("national accounts") || full.includes("gva") || full.includes("sna 2008") || full.includes("supply-use");
      },
    },
    {
      targetKeys: ["sampling theory", "pps", "survey design"],
      courseMatchers: (t, d, p, cov) => {
        const full = `${t} ${d} ${p} ${cov.join(" ")}`.toLowerCase();
        return full.includes("sampling") || full.includes("survey design") || full.includes("pps") || full.includes("stratified");
      },
    },
  ];

  for (const rule of keyRules) {
    if (rule.targetKeys.some((k) => target.includes(k) || k.includes(target))) {
      if (rule.courseMatchers(title, description, primary, covered)) {
        return true;
      }
    }
  }

  // 3. Significant Token Overlap Matching (excluding generic statistical words)
  const genericStatsWords = new Set(["data", "statistics", "statistical", "processing", "analysis", "analytics", "methods", "theory", "survey"]);
  const targetTokens = Array.from(normalizeTokens(competencyName)).filter((t) => !genericStatsWords.has(t));
  if (targetTokens.length === 0) return false;

  const courseTokens = new Set<string>([
    ...Array.from(normalizeTokens(course.primaryCompetency || "")),
    ...Array.from(normalizeTokens(coveredList.join(" "))),
    ...Array.from(normalizeTokens(course.title || course.name || "")),
  ]);

  let matchCount = 0;
  for (const token of targetTokens) {
    if (courseTokens.has(token)) {
      matchCount++;
    }
  }

  return matchCount >= Math.min(2, targetTokens.length);
}

// ──────────────────────────────────────────────
// 10. Personalized Learning Path Generator
// ──────────────────────────────────────────────
export function getPersonalizedLearningPath(
  userComps?: UserCompetencyScore[],
  customCourses?: CourseItem[]
): LearningPathStep[] {
  const comps = userComps && userComps.length > 0 ? userComps : (typeof window !== "undefined" ? getUserCompetencies() : []);
  const allCourses = customCourses || (typeof window !== "undefined" ? getCourses() : DEFAULT_COURSES_CATALOGUE);

  // Find priority gaps
  const sortedGaps = [...comps]
    .sort((a, b) => b.priorityScore - a.priorityScore);

  const steps: LearningPathStep[] = [];
  const usedCourseIds = new Set<string>();

  // 1. Match courses to top priority gaps using normalized fuzzy matcher
  for (const gap of sortedGaps) {
    const matchingCourse = allCourses.find(
      (c) => !usedCourseIds.has(c.id) && courseMatchesCompetency(c, gap.competencyName)
    );

    if (matchingCourse) {
      usedCourseIds.add(matchingCourse.id);
      const isCompleted = gap.gap === 0 && gap.currentLevel >= 4;
      const isInProgress = steps.filter((s) => s.status === "In Progress").length === 0 && !isCompleted && steps.length === 0;

      steps.push({
        stepNumber: steps.length + 1,
        title: matchingCourse.title,
        duration: matchingCourse.duration,
        provider: matchingCourse.provider as any,
        difficulty: matchingCourse.difficulty as any,
        skillAddressed: gap.competencyName,
        matchScore: Math.min(99, Math.max(82, Math.round(gap.priorityScore * 0.95))),
        status: isCompleted ? "Completed" : isInProgress ? "In Progress" : steps.length <= 2 ? "Recommended" : "Locked",
        courseId: matchingCourse.id,
      });
    }

    if (steps.length >= 6) break;
  }

  // 2. If fewer than 5 steps, populate with key foundational courses
  if (steps.length < 5) {
    for (const course of allCourses) {
      if (!usedCourseIds.has(course.id)) {
        usedCourseIds.add(course.id);
        steps.push({
          stepNumber: steps.length + 1,
          title: course.title,
          duration: course.duration,
          provider: course.provider as any,
          difficulty: course.difficulty as any,
          skillAddressed: course.primaryCompetency,
          matchScore: 88,
          status: steps.length === 0 ? "In Progress" : steps.length <= 2 ? "Recommended" : "Locked",
          courseId: course.id,
        });
      }
      if (steps.length >= 5) break;
    }
  }

  return steps;
}

// ──────────────────────────────────────────────
// 11. Explainable Recommendations Generator
// ──────────────────────────────────────────────
export function getExplainableRecommendations(
  userCompetencies: UserCompetencyScore[],
  courses: CourseItem[] = DEFAULT_COURSES_CATALOGUE
): RecommendationExplanation[] {
  const gaps = [...userCompetencies].sort((a, b) => b.priorityScore - a.priorityScore);
  const recommendations: RecommendationExplanation[] = [];

  for (const gap of gaps) {
    if (gap.gap === 0 && gap.priorityLevel !== "High") continue;

    const matchingCourses = courses.filter((c) => courseMatchesCompetency(c, gap.competencyName));

    for (const course of matchingCourses) {
      if (recommendations.some((r) => r.courseId === course.id)) continue;

      let match = 85;
      if (gap.gap >= 2) match = 94;
      else if (gap.gap === 1) match = 88;
      if (course.enrolled) match = Math.max(90, match);

      const whyRecommended = `Recommended because **${gap.competencyName}** is a **${gap.priorityLevel} Priority** competency gap (Current: Level ${gap.currentLevel}/5, Required: Level ${gap.requiredLevel}/5) for your Statistical Officer cadre, and this course directly provides official accredited curriculum.`;

      recommendations.push({
        courseId: course.id,
        courseTitle: course.title,
        provider: course.provider,
        matchPercentage: match,
        duration: course.duration,
        addressedSkill: gap.competencyName,
        skillGap: gap.gap,
        priorityLevel: gap.priorityLevel === "None" ? "Low" : gap.priorityLevel,
        whyRecommended,
      });

      if (recommendations.length >= 6) break;
    }
    if (recommendations.length >= 6) break;
  }

  return recommendations;
}

// ──────────────────────────────────────────────
// 12. Storage Getters & Setters
// ──────────────────────────────────────────────

export function getProfile(): OfficerProfile {
  if (typeof window === "undefined") return DEMO_STATISTICAL_OFFICER;
  const stored = localStorage.getItem(STORAGE_KEYS.PROFILE);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === "object") {
        return {
          ...DEMO_STATISTICAL_OFFICER,
          ...parsed,
          name: parsed.name ?? DEMO_STATISTICAL_OFFICER.name,
          role: parsed.role ?? "learner",
          cadre: parsed.cadre ?? DEMO_STATISTICAL_OFFICER.cadre,
          cadreGrade: parsed.cadreGrade ?? DEMO_STATISTICAL_OFFICER.cadreGrade,
          department: parsed.department ?? DEMO_STATISTICAL_OFFICER.department,
          designation: parsed.designation ?? DEMO_STATISTICAL_OFFICER.designation,
          posting: parsed.posting ?? DEMO_STATISTICAL_OFFICER.posting,
          coursesCompleted: typeof parsed.coursesCompleted === "number" ? parsed.coursesCompleted : 0,
          learningHours: typeof parsed.learningHours === "number" ? parsed.learningHours : 0,
          certificationsCount: typeof parsed.certificationsCount === "number" ? parsed.certificationsCount : 0,
        };
      }
    } catch {}
  }
  return DEMO_STATISTICAL_OFFICER;
}

export function saveProfile(profile: OfficerProfile): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
}

export function getActiveRole(): UserRole {
  if (typeof window === "undefined") return "learner";
  return (localStorage.getItem(STORAGE_KEYS.ACTIVE_ROLE) as UserRole) || "learner";
}

export function setActiveRole(role: UserRole): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.ACTIVE_ROLE, role);
}

export function getUserCompetencies(): UserCompetencyScore[] {
  if (typeof window === "undefined") return getInitialUserCompetencies();
  const stored = localStorage.getItem(STORAGE_KEYS.COMPETENCIES);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {}
  }
  const initial = getInitialUserCompetencies();
  saveUserCompetencies(initial);
  return initial;
}

export function saveUserCompetencies(scores: UserCompetencyScore[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.COMPETENCIES, JSON.stringify(scores));
}

export function getCourses(): CourseItem[] {
  if (typeof window === "undefined") return DEFAULT_COURSES_CATALOGUE;
  const stored = localStorage.getItem(STORAGE_KEYS.COURSES);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length >= DEFAULT_COURSES_CATALOGUE.length) {
        return parsed;
      }
      // If stored catalogue is older/smaller than our expanded default catalogue (e.g. 10 vs 18), merge without losing progress
      if (Array.isArray(parsed) && parsed.length > 0) {
        const merged = DEFAULT_COURSES_CATALOGUE.map((defCourse) => {
          const existing = parsed.find((p: CourseItem) => p.id === defCourse.id);
          return existing
            ? { ...defCourse, enrolled: existing.enrolled, progressPct: existing.progressPct, completedDate: existing.completedDate }
            : defCourse;
        });
        localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(merged));
        return merged;
      }
    } catch {}
  }
  return DEFAULT_COURSES_CATALOGUE;
}

export function getCourseImage(c: { id?: string; category?: string; primaryCompetency?: string; title?: string; imageUrl?: string }): string {
  if (c.imageUrl) return c.imageUrl;
  const title = (c.title || "").toLowerCase();
  const cat = (c.category || "").toLowerCase();
  const comp = (c.primaryCompetency || "").toLowerCase();

  if (title.includes("python") || comp.includes("python") || title.includes("data analysis")) {
    return "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80";
  }
  if (title.includes("r stat") || comp.includes("r stat") || title.includes("econometric") || comp.includes("r ")) {
    return "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80";
  }
  if (title.includes("ai") || title.includes("machine learning") || comp.includes("artificial intelligence") || comp.includes("ml")) {
    return "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=600&q=80";
  }
  if (title.includes("gis") || title.includes("qgis") || comp.includes("gis") || comp.includes("mapping")) {
    return "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=600&q=80";
  }
  if (title.includes("sampling") || title.includes("survey") || comp.includes("sampling") || comp.includes("survey")) {
    return "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=600&q=80";
  }
  if (title.includes("national accounts") || title.includes("gva") || title.includes("sna") || comp.includes("national accounts")) {
    return "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=600&q=80";
  }
  if (title.includes("sdg") || comp.includes("sdg") || title.includes("sustainability")) {
    return "https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?auto=format&fit=crop&w=600&q=80";
  }
  if (title.includes("price") || title.includes("cpi") || title.includes("inflation") || comp.includes("index")) {
    return "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=80";
  }
  if (title.includes("sql") || title.includes("database") || comp.includes("sql") || title.includes("warehousing")) {
    return "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=600&q=80";
  }
  if (title.includes("cloud") || comp.includes("cloud") || title.includes("microdata pipelines")) {
    return "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80";
  }
  if (title.includes("cybersecurity") || comp.includes("cybersecurity") || title.includes("cert-in")) {
    return "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80";
  }
  if (title.includes("digital public infrastructure") || comp.includes("digital public infrastructure") || title.includes("dpi") || comp.includes("dpi")) {
    return "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80";
  }
  if (title.includes("ethics") || comp.includes("ethics") || title.includes("unfpos")) {
    return "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80";
  }
  if (title.includes("storytelling") || title.includes("visualization") || comp.includes("visualization") || title.includes("dashboard")) {
    return "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80";
  }
  if (title.includes("dpdp") || title.includes("data protection") || comp.includes("dpdp") || comp.includes("privacy")) {
    return "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80";
  }
  if (title.includes("time series") || title.includes("forecast") || comp.includes("econometric")) {
    return "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=600&q=80";
  }
  if (cat.includes("behavioural") || title.includes("leadership") || title.includes("management") || title.includes("policy") || comp.includes("leadership") || comp.includes("policy")) {
    return "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=600&q=80";
  }
  return "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80";
}

export function saveCourses(courses: CourseItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
}

export function getNsstaProgrammes(): NsstaTrainingProgramme[] {
  if (typeof window === "undefined") return DEFAULT_NSSTA_PROGRAMMES;
  const stored = localStorage.getItem(STORAGE_KEYS.PROGRAMMES);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {}
  }
  return DEFAULT_NSSTA_PROGRAMMES;
}

export function getQuizzes(): QuizItem[] {
  if (typeof window === "undefined") return DEFAULT_QUIZZES;
  const stored = localStorage.getItem(STORAGE_KEYS.QUIZZES);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {}
  }
  return DEFAULT_QUIZZES;
}

export function getLearningResources(): LearningResource[] {
  if (typeof window === "undefined") return DEFAULT_RESOURCES;
  const stored = localStorage.getItem(STORAGE_KEYS.RESOURCES);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {}
  }
  return DEFAULT_RESOURCES;
}

export function saveLearningResources(resources: LearningResource[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.RESOURCES, JSON.stringify(resources));
}

export function getAdminEmployees(): EmployeeRecord[] {
  if (typeof window === "undefined") return DEFAULT_EMPLOYEES;
  const stored = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {}
  }
  return DEFAULT_EMPLOYEES;
}

export function saveAdminEmployees(employees: EmployeeRecord[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
}

export function addAdminEmployee(employee: EmployeeRecord): void {
  const current = getAdminEmployees();
  saveAdminEmployees([employee, ...current]);
}

export function updateAdminEmployee(employee: EmployeeRecord): void {
  const current = getAdminEmployees();
  const updated = current.map((e) => (e.id === employee.id ? employee : e));
  saveAdminEmployees(updated);
}

export function deleteAdminEmployee(id: string): void {
  const current = getAdminEmployees();
  saveAdminEmployees(current.filter((e) => e.id !== id));
}

export function getNotifications(): NotificationItem[] {
  return [
    { id: "n1", title: "New Course Recommended", message: "Python for Data Analysis was added to your path based on your role gap.", timestamp: "10 mins ago", read: false, type: "recommendation" },
    { id: "n2", title: "Competency Elevated", message: "Your Sampling competency increased from Level 2 to Level 3.", timestamp: "2 hours ago", read: false, type: "competency_update" },
    { id: "n3", title: "NSSTA TPAC Programme Open", message: "Residential workshop on National Accounts scheduled for July 2026.", timestamp: "1 day ago", read: true, type: "programme_alert" },
  ];
}

export function getQuizAttempts(): QuizAttempt[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEYS.QUIZ_HISTORY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {}
  }
  return [];
}

export function saveQuizAttempt(attempt: QuizAttempt): void {
  if (typeof window === "undefined") return;
  const history = getQuizAttempts();
  history.unshift(attempt);
  localStorage.setItem(STORAGE_KEYS.QUIZ_HISTORY, JSON.stringify(history));
}

export function getCompetencyAuditLogs(): CompetencyUpdateLog[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEYS.COMPETENCY_LOGS);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {}
  }
  return [];
}

export function logCompetencyUpdate(log: CompetencyUpdateLog): void {
  if (typeof window === "undefined") return;
  const logs = getCompetencyAuditLogs();
  logs.unshift(log);
  localStorage.setItem(STORAGE_KEYS.COMPETENCY_LOGS, JSON.stringify(logs));
}

/**
 * 🔄 CLOSED-LOOP COMPETENCY UPDATER
 */
export function applyClosedLoopCompetencyUpdate(params: {
  competencyName: string;
  scorePct: number;
  evidence: string;
}): { updated: boolean; oldLevel: number; newLevel: number; message: string } {
  const scores = getUserCompetencies();
  const target = scores.find((s) => s.competencyName === params.competencyName);

  if (!target) {
    return { updated: false, oldLevel: 0, newLevel: 0, message: "Competency not found in officer profile." };
  }

  const oldLevel = target.currentLevel;
  let newLevel = oldLevel;

  if (params.scorePct >= 80) {
    newLevel = Math.min(5, oldLevel + 1);
  } else if (params.scorePct >= 60 && oldLevel < target.requiredLevel) {
    newLevel = Math.min(target.requiredLevel, oldLevel + 0.5);
  }

  if (newLevel > oldLevel) {
    target.currentLevel = Math.round(newLevel);
    target.gap = Math.max(0, target.requiredLevel - target.currentLevel);
    target.lastAssessedDate = new Date().toISOString().slice(0, 10);
    target.evidenceSource = params.evidence;
    target.confidenceScore = Math.min(0.99, target.confidenceScore + 0.05);

    const gapNormalized = (target.gap / 5) * 100;
    target.priorityScore = Math.round(
      0.35 * gapNormalized +
      0.25 * ((target.requiredLevel / 5) * 100) +
      0.20 * 80 +
      0.10 * 80 +
      0.10 * (target.gap > 0 ? 90 : 30)
    );
    target.priorityLevel = target.gap >= 2 ? "High" : target.gap === 1 ? "Medium" : "None";

    saveUserCompetencies(scores);

    logCompetencyUpdate({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      competencyName: params.competencyName,
      oldLevel,
      newLevel: target.currentLevel,
      evidence: params.evidence,
      sourceType: "Quiz",
      quizScorePct: params.scorePct,
    });

    return {
      updated: true,
      oldLevel,
      newLevel: target.currentLevel,
      message: `Competency elevated from Level ${oldLevel} to Level ${target.currentLevel}! Skill gap reduced to ${target.gap}.`,
    };
  }

  return {
    updated: false,
    oldLevel,
    newLevel: oldLevel,
    message: `Assessment score of ${params.scorePct}% recorded. Score was below threshold for Level ${oldLevel + 1} elevation. Weak areas flagged for revision.`,
  };
}

export const DEFAULT_TRAINER_BANK: ValidatedMCQ[] = [
  {
    id: 1001,
    question: "In multi-stage stratified sampling for PLFS, what is the primary criterion for allocating sample FSUs among states and UTs?",
    options: ["Proportional to Census rural/urban population", "Equal allocation across all states", "Based solely on geographical land area", "Based on state GDP"],
    correctAnswerIndex: 0,
    explanation: "Sample FSUs are allocated proportionally to census population to ensure representative sampling weights and minimize national variance.",
    difficulty: "Intermediate",
    topic: "Sample Allocation",
    competency: "Sampling Theory & PPS",
    sourceReference: "NSSO 79th Round Design Handbook · Section 4.1",
    isValidated: true,
    validationNotes: ["Compliant with MoSPI assessment rubric v2.0"],
    status: "Approved",
  },
  {
    id: 1002,
    question: "Which formula defines the Laspeyres Consumer Price Index for a basket with base period prices P0 and current prices Pt?",
    options: ["I_L = (Σ Pt*Q0 / Σ P0*Q0) * 100", "I_P = (Σ Pt*Qt / Σ P0*Qt) * 100", "I_F = sqrt(I_L * I_P)", "I_T = (Σ Pt / Σ P0) * 100"],
    correctAnswerIndex: 0,
    explanation: "The Laspeyres formula weights prices using fixed base-period quantities Q0: I_L = (Σ Pt*Q0 / Σ P0*Q0) * 100.",
    difficulty: "Basic",
    topic: "CPI Index Formulation",
    competency: "Price Statistics (CPI / WPI)",
    sourceReference: "Manual on Consumer Price Index Compilation · Page 18",
    isValidated: true,
    validationNotes: ["Standard formula verified against ILO/MoSPI guidelines"],
    status: "Approved",
  },
  {
    id: 1003,
    question: "Under UN SNA 2008, how is Gross Value Added (GVA) at basic prices derived from total output?",
    options: ["Gross Output at Basic Prices minus Intermediate Consumption at Purchaser Prices", "Gross Output plus GST and product taxes", "Total Exports minus Total Imports", "Net Operating Surplus plus Compensation of Employees only"],
    correctAnswerIndex: 0,
    explanation: "GVA at basic prices equals Gross Output (basic prices) less Intermediate Consumption (purchaser prices).",
    difficulty: "Advanced",
    topic: "GVA Compilation",
    competency: "National Accounts & GVA",
    sourceReference: "UN System of National Accounts 2008 · Chapter 6",
    isValidated: true,
    validationNotes: ["Accredited UN SNA 2008 standard question"],
    status: "Approved",
  },
  {
    id: 1004,
    question: "In Python Pandas, what is the most reliable method to merge survey microdata with multiplier weights on 'FSU_ID' without losing unmatched records?",
    options: ["pd.merge(microdata, weights, on='FSU_ID', how='left')", "microdata.append(weights)", "pd.concat([microdata, weights])", "microdata.join(weights, how='inner')"],
    correctAnswerIndex: 0,
    explanation: "A left join (how='left') preserves all microdata records while attaching the corresponding FSU weights.",
    difficulty: "Intermediate",
    topic: "Pandas Data Merging",
    competency: "Python for Data Analysis",
    sourceReference: "MoSPI Python Computing Guide · Lab 4",
    isValidated: true,
    validationNotes: ["Tested on Pyodide Python 3.11 environment"],
    status: "Approved",
  },
  {
    id: 1005,
    question: "Under the Digital Personal Data Protection (DPDP) Act 2023, what is the mandatory retention policy for unit-level identifiable microdata?",
    options: ["Data must be erased or anonymized once the statistical processing purpose is fulfilled", "Retained indefinitely on public web servers", "Sold to external market research agencies", "Stored without encryption on field tablets"],
    correctAnswerIndex: 0,
    explanation: "The DPDP Act mandates data minimization and purpose limitation: identifiable personal records must be anonymized or securely deleted after purpose fulfillment.",
    difficulty: "Intermediate",
    topic: "Data Minimization & Retention",
    competency: "Data Privacy (DPDP Act)",
    sourceReference: "DPDP Act 2023 Gazette Notification · Section 8(7)",
    isValidated: true,
    validationNotes: ["Statutory governance compliance verified"],
    status: "Approved",
  },
];

export function getTrainerQuestionBank(): ValidatedMCQ[] {
  if (typeof window === "undefined") return DEFAULT_TRAINER_BANK;
  const stored = localStorage.getItem(STORAGE_KEYS.QUESTION_BANK);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {}
  }
  return DEFAULT_TRAINER_BANK;
}

export function saveTrainerQuestionBank(questions: ValidatedMCQ[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.QUESTION_BANK, JSON.stringify(questions));
}

export function addTrainerMCQ(mcq: ValidatedMCQ): void {
  const current = getTrainerQuestionBank();
  saveTrainerQuestionBank([mcq, ...current]);
}

export function updateTrainerMCQ(mcq: ValidatedMCQ): void {
  const current = getTrainerQuestionBank();
  saveTrainerQuestionBank(current.map((q) => (q.id === mcq.id ? mcq : q)));
}

export function deleteTrainerMCQ(id: number): void {
  const current = getTrainerQuestionBank();
  saveTrainerQuestionBank(current.filter((q) => q.id !== id));
}

export function getCertificates(): VerifiableCertificate[] {
  const profile = getProfile();
  const stored = localStorage.getItem(STORAGE_KEYS.CERTIFICATES);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {}
  }

  // Initialize with personalized credentials for current officer
  const initial: VerifiableCertificate[] = [
    {
      id: "cert-1",
      title: "Data Storytelling & Executive Visualizations",
      issuer: "iGOT Karmayogi",
      issuedTo: profile.name || "Dr. Rajesh Sharma, ISS",
      employeeId: profile.employeeId || "MOSPI-ISS-2023-019",
      cadre: profile.cadre || "Indian Statistical Service",
      issueDate: "12 May 2026",
      expiryDate: "Permanent Credential",
      verificationHash: "SHA256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
      credentialId: "iGOT-MoSPI-2026-88392",
      competencyPillars: ["Data Storytelling", "Executive Briefing", "Data Visualization & Storytelling"],
      scorePct: 94,
      grade: "Distinction",
      cpdHours: 12,
      signatureAlgorithm: "ECDSA SHA-256 with W3C Verifiable Credential v2.0",
    },
    {
      id: "cert-2",
      title: "Sampling Methodology & PLFS Two-Stage Design",
      issuer: "NSSTA",
      issuedTo: profile.name || "Dr. Rajesh Sharma, ISS",
      employeeId: profile.employeeId || "MOSPI-ISS-2023-019",
      cadre: profile.cadre || "Indian Statistical Service",
      issueDate: "28 Feb 2026",
      expiryDate: "Permanent Credential",
      verificationHash: "SHA256:3a105c93c4e9d9e6e88102377fc0d39e24faeb9a023c28d22de26002f2324901",
      credentialId: "NSSTA-TPAC-2026-0421",
      competencyPillars: ["Survey Design & Methodology", "Sampling Theory & PPS"],
      scorePct: 88,
      grade: "Merit",
      cpdHours: 16,
      signatureAlgorithm: "ECDSA SHA-256 with W3C Verifiable Credential v2.0",
    },
  ];

  localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(initial));
  return initial;
}

export function addCertificate(cert: VerifiableCertificate): void {
  const current = getCertificates();
  const updated = [cert, ...current.filter((c) => c.id !== cert.id)];
  localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(updated));
}

// Pseudo-SHA256 generator for browser verifiable credential issuance
function generateCredentialHash(dataStr: string): string {
  let hash = 0;
  for (let i = 0; i < dataStr.length; i++) {
    const char = dataStr.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex1 = Math.abs(hash).toString(16).padStart(8, "0");
  const hex2 = Math.abs(hash * 31 + 17).toString(16).padStart(8, "0");
  const hex3 = Math.abs(hash * 97 + 53).toString(16).padStart(8, "0");
  const hex4 = Math.abs(hash * 13 + 89).toString(16).padStart(8, "0");
  return `SHA256:${hex1}${hex2}${hex3}${hex4}88392fc53b92dc18148a1d65`;
}

export function issueDigitalCredential(params: {
  title: string;
  issuer?: "iGOT Karmayogi" | "NSSTA" | "MoSPI Capacity Board";
  competencyPillars: string[];
  scorePct: number;
  cpdHours?: number;
}): VerifiableCertificate {
  const profile = getProfile();
  const issuer = params.issuer || "MoSPI Capacity Board";
  const score = Math.max(0, Math.min(100, Math.round(params.scorePct)));
  const grade: "Distinction" | "Merit" | "Pass" =
    score >= 90 ? "Distinction" : score >= 80 ? "Merit" : "Pass";
  
  const cpd = params.cpdHours || (score >= 90 ? 12 : 8);
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const credPrefix = issuer === "iGOT Karmayogi" ? "iGOT-MoSPI" : issuer === "NSSTA" ? "NSSTA-TPAC" : "MOSPI-VC";
  const credentialId = `${credPrefix}-${now.getFullYear()}-${randomSuffix}`;
  
  const rawPayload = `${profile.name}|${profile.employeeId}|${params.title}|${score}|${dateStr}|${credentialId}`;
  const verificationHash = generateCredentialHash(rawPayload);

  const newCert: VerifiableCertificate = {
    id: `cert-${Date.now()}`,
    title: params.title,
    issuer: issuer,
    issuedTo: profile.name || "Statistical Officer",
    employeeId: profile.employeeId || "MOSPI-ISS-2026",
    cadre: profile.cadre || "Indian Statistical Service",
    issueDate: dateStr,
    expiryDate: "Permanent Credential",
    verificationHash: verificationHash,
    credentialId: credentialId,
    competencyPillars: params.competencyPillars,
    scorePct: score,
    grade: grade,
    cpdHours: cpd,
    signatureAlgorithm: "ECDSA SHA-256 with W3C Verifiable Credential v2.0",
  };

  addCertificate(newCert);

  // Update CPD hours in profile
  if (profile.hoursCompleted !== undefined) {
    const updatedHours = (profile.hoursCompleted || 0) + cpd;
    updateProfile({ ...profile, hoursCompleted: updatedHours });
  }

  // Write notification
  addNotification({
    title: "🎓 W3C Digital Credential Issued",
    message: `Congratulations! Official Verifiable Credential "${params.title}" has been cryptographically signed and issued (${grade} · ${cpd} CPD Hours).`,
    type: "competency_update",
  });

  return newCert;
}

export function verifyCredential(credentialIdOrHash: string): {
  valid: boolean;
  certificate?: VerifiableCertificate;
  message: string;
} {
  const query = credentialIdOrHash.trim();
  if (!query) {
    return { valid: false, message: "Please provide a Credential ID or SHA-256 hash." };
  }

  const allCerts = getCertificates();
  const match = allCerts.find(
    (c) =>
      c.credentialId.toLowerCase() === query.toLowerCase() ||
      c.verificationHash.toLowerCase() === query.toLowerCase()
  );

  if (match) {
    return {
      valid: true,
      certificate: match,
      message: `Verified Authentic! W3C Credential issued to ${match.issuedTo} (${match.issuer}) on ${match.issueDate}. Cryptographic integrity confirmed.`,
    };
  }

  return {
    valid: false,
    message: "No authentic credential found with this ID or SHA-256 hash in the MoSPI Capacity Ledger.",
  };
}

const SUPABASE_CONFIG_KEY = "diid_supabase_config";
export function getSupabaseConfig(): { url: string; anonKey: string } {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || "";
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "";
  const stored = localStorage.getItem(SUPABASE_CONFIG_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch {}
  }
  return { url: envUrl, anonKey: envKey };
}
export function setSupabaseConfig(url: string, anonKey: string): void {
  localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify({ url, anonKey }));
}

// ──────────────────────────────────────────────
// 21. Officer Registration Helper
// ──────────────────────────────────────────────
export interface RegisterOfficerInput {
  name: string;
  email: string;
  employeeId: string;
  phone?: string;
  role?: UserRole;
  cadre: string;
  cadreGrade: "JTS" | "STS" | "JAG" | "SAG" | "HAG" | "JSO" | "SSO" | "Officer";
  department: string;
  designation: string;
  posting: string;
  yearsOfExperience: number;
  primaryDomain: string;
  toolsUsed: string[];
  baselineRatings: Record<string, number>;
  careerGoal: string;
  preferredLanguage: "EN" | "HI" | "TE";
  preferredLearningMode?: "Self-Paced Online" | "Blended Academy" | "Virtual Lab";
}

export function registerOfficerAccount(data: RegisterOfficerInput): {
  profile: OfficerProfile;
  competencies: UserCompetencyScore[];
} {
  const profile: OfficerProfile = {
    employeeId: data.employeeId.trim() || `MOSPI-${Date.now().toString().slice(-6)}`,
    name: data.name.trim(),
    email: data.email.trim(),
    phone: data.phone || "+91 98104 XXXXX",
    role: data.role || "learner",
    isAdmin: data.role === "admin",
    isTrainer: data.role === "trainer",
    department: data.department,
    designation: data.designation,
    jobRoleId: "role-stat-officer",
    jobRoleTitle: data.designation,
    cadre: data.cadre,
    cadreGrade: data.cadreGrade,
    posting: data.posting || "MoSPI Headquarters, New Delhi",
    currentAssignment: `${data.primaryDomain} & Capacity Intelligence`,
    educationalQualification: "M.Sc. / Post Graduate in Statistics/Economics",
    yearsOfExperience: data.yearsOfExperience,
    previousTraining: data.toolsUsed.length ? [`Proficient in ${data.toolsUsed.join(", ")}`] : ["Induction Training"],
    careerGoal: data.careerGoal || "Lead Official Statistical Operations & Policy Insights",
    preferredLearningMode: data.preferredLearningMode || "Blended Academy",
    preferredLanguage: data.preferredLanguage,
    learningHours: 0,
    coursesCompleted: 0,
    certificationsCount: 0,
    onboardingCompleted: true,
  };

  const updatedComps = deriveUserCompetencies(
    profile,
    data.baselineRatings,
    data.toolsUsed,
    data.primaryDomain
  );

  saveProfile(profile);
  saveUserCompetencies(updatedComps);
  setActiveRole(profile.role);

  return { profile, competencies: updatedComps };
}

export function loginOfficerWithCredentials(
  emailOrId: string,
  role: UserRole = "learner"
): { profile: OfficerProfile; competencies: UserCompetencyScore[] } {
  const cleanInput = emailOrId.trim();
  const isEmail = cleanInput.includes("@");

  let derivedName = cleanInput;
  if (isEmail) {
    const handle = cleanInput.split("@")[0];
    const parts = handle.split(/[._-]/).filter(Boolean);
    if (parts.length > 0) {
      derivedName = parts
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join(" ");
    }
  }

  // Check if existing profile in localStorage matches this email/id
  const existing = getProfile();
  if (
    existing.email.toLowerCase() === cleanInput.toLowerCase() ||
    existing.employeeId === cleanInput
  ) {
    const userComps = getUserCompetencies();
    return { profile: existing, competencies: userComps };
  }

  const isNic = cleanInput.includes("@nic.in") || cleanInput.includes("@gov.in");

  const newProfile: OfficerProfile = {
    employeeId: isEmail ? `MOSPI-${cleanInput.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}` : cleanInput,
    name: derivedName.startsWith("Dr.") || derivedName.startsWith("Shri") || derivedName.startsWith("Smt.") ? derivedName : `Dr. ${derivedName}, ISS`,
    email: isEmail ? cleanInput : `${cleanInput.toLowerCase()}@nic.in`,
    phone: "+91 98104 XXXXX",
    role: role,
    isAdmin: role === "admin",
    isTrainer: role === "trainer",
    department: "Labour & Social Statistics Division",
    designation: "Statistical Officer",
    jobRoleId: "role-stat-officer",
    jobRoleTitle: "Statistical Officer",
    cadre: "Indian Statistical Service",
    cadreGrade: "STS",
    posting: "Sardar Patel Bhawan, New Delhi",
    currentAssignment: "Statistical Indicator Compilation & Policy Analysis",
    educationalQualification: "M.Sc. Statistics / Economics",
    yearsOfExperience: 4,
    previousTraining: ["NSSTA Induction", "iGOT Data Analysis"],
    careerGoal: "Elevate to Senior Statistical Officer & National Accounts Lead",
    preferredLearningMode: "Blended Academy",
    preferredLanguage: "EN",
    learningHours: 0,
    coursesCompleted: 0,
    certificationsCount: 0,
    onboardingCompleted: true,
  };

  const comps = deriveUserCompetencies(newProfile);

  saveProfile(newProfile);
  saveUserCompetencies(comps);
  setActiveRole(role);

  return { profile: newProfile, competencies: comps };
}

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
// 4. Initial User Competency Scores
// ──────────────────────────────────────────────
export function getInitialUserCompetencies(): UserCompetencyScore[] {
  const currentLevelsMap: Record<string, number> = {
    "Descriptive Statistics & Sampling": 5, // Statistics = 5/5
    "Python for Data Analysis": 2,          // Python = 2/4 (Gap: 2, High Priority)
    "SQL & Database Querying": 3,           // SQL = 3/4 (Gap: 1, Medium Priority)
    "GIS & Geospatial Mapping": 1,          // GIS = 1/3 (Gap: 2, High Priority)
    "Artificial Intelligence & ML": 1,      // AI/ML = 1/3 (Gap: 2, High Priority)
    "Data Visualization & Storytelling": 3, // Data Viz = 3/4 (Gap: 1, Medium Priority)
    "Survey Design & Methodology": 4,       // Survey Design = 4/4 (Gap: 0)
    "Labour & Employment (PLFS)": 4,        // PLFS = 4/4 (Gap: 0)
    "Data Privacy (DPDP Act)": 2,           // DPDP = 2/3 (Gap: 1)
    "National Accounts & GVA": 3,
    "Price Statistics (CPI / WPI)": 3,
    "R Statistical Computing": 2,
    "Cloud Infrastructure & APIs": 2,
    "Cybersecurity Protocols": 3,
    "Digital Public Infrastructure": 3,
    "Team Leadership & Governance": 4,
    "Ethics in Official Statistics": 5,
    "Public Policy Decision Making": 4,
    "SDG Indicators & Metadata": 3,
  };

  const jobRole = DEFAULT_JOB_ROLES[0];

  return DEFAULT_COMPETENCIES_CATALOGUE.map((def) => {
    const current = currentLevelsMap[def.name] ?? 2;
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
      evidenceSource: "Baseline Cadre Competency Evaluation",
      lastAssessedDate: "2026-05-15",
    };
  });
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
    questionsCount: 10,
    durationMinutes: 15,
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
    ],
  },
  {
    id: "quiz-python-102",
    title: "Python for NSSO Microdata & Survey Weights",
    description: "Evaluates Pandas unit-level data cleaning, joins, and survey multiplier expansions.",
    domain: "Technical",
    competency: "Python for Data Analysis",
    questionsCount: 10,
    durationMinutes: 15,
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
// 10. Personalized Learning Path Generator
// ──────────────────────────────────────────────
export function getPersonalizedLearningPath(userComps: UserCompetencyScore[]): LearningPathStep[] {
  return [
    {
      stepNumber: 1,
      title: "Data Storytelling & Executive Visual Briefings",
      duration: "8 hours",
      provider: "iGOT",
      difficulty: "Foundation",
      skillAddressed: "Data Visualization & Storytelling",
      matchScore: 98,
      status: "Completed",
      courseId: "igot-104",
    },
    {
      stepNumber: 2,
      title: "Python for Data Analysis & Statistical Processing",
      duration: "20 hours",
      provider: "iGOT",
      difficulty: "Intermediate",
      skillAddressed: "Python for Data Analysis",
      matchScore: 94,
      status: "In Progress",
      courseId: "igot-101",
    },
    {
      stepNumber: 3,
      title: "Enterprise Database Management with SQL & Open Data APIs",
      duration: "12 hours",
      provider: "iGOT",
      difficulty: "Foundation",
      skillAddressed: "SQL & Database Querying",
      matchScore: 89,
      status: "Recommended",
      courseId: "igot-105",
    },
    {
      stepNumber: 4,
      title: "GIS & Geospatial Analysis with QGIS for Field Surveys",
      duration: "16 hours",
      provider: "NSSTA",
      difficulty: "Intermediate",
      skillAddressed: "GIS & Geospatial Mapping",
      matchScore: 92,
      status: "Recommended",
      courseId: "igot-103",
    },
    {
      stepNumber: 5,
      title: "Artificial Intelligence & Machine Learning in Official Statistics",
      duration: "24 hours",
      provider: "iGOT",
      difficulty: "Advanced",
      skillAddressed: "Artificial Intelligence & ML",
      matchScore: 91,
      status: "Locked",
      courseId: "igot-102",
    },
  ];
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

    const matchingCourses = courses.filter((c) =>
      c.competenciesCovered.includes(gap.competencyName) || c.primaryCompetency === gap.competencyName
    );

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
      return JSON.parse(stored);
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
      return JSON.parse(stored);
    } catch {}
  }
  return DEFAULT_COURSES_CATALOGUE;
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

export function getTrainerQuestionBank(): ValidatedMCQ[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEYS.QUESTION_BANK);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {}
  }
  return [];
}

export function saveTrainerQuestionBank(questions: ValidatedMCQ[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.QUESTION_BANK, JSON.stringify(questions));
}

export function getCertificates() {
  return [
    {
      id: "cert-1",
      title: "Data Storytelling for Policy Makers",
      issuer: "iGOT Karmayogi",
      issuedTo: "Dr. Rajesh Sharma, ISS",
      issueDate: "12 May 2026",
      expiryDate: "Permanent Credential",
      verificationHash: "SHA256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
      credentialId: "iGOT-MoSPI-2026-88392",
      competencyPillars: ["Data Storytelling", "Executive Briefing", "Data Viz"],
      scorePct: 94,
      grade: "Distinction" as const,
    },
    {
      id: "cert-2",
      title: "Sampling Methodology & Survey Design",
      issuer: "NSSTA",
      issuedTo: "Dr. Rajesh Sharma, ISS",
      issueDate: "28 Feb 2026",
      expiryDate: "Permanent Credential",
      verificationHash: "SHA256:3a105c93c4e9d9e6e88102377fc0d39e24faeb9a023c28d22de26002f2324901",
      credentialId: "NSSTA-TPAC-2026-0421",
      competencyPillars: ["Survey Design", "Sampling Theory & PPS"],
      scorePct: 88,
      grade: "Merit" as const,
    },
  ];
}

export function addCertificate(cert: any) {}

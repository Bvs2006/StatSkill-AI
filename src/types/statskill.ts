export type UserRole = "learner" | "admin" | "trainer";

export type CompetencyDomain =
  | "Statistical"
  | "Technical"
  | "Digital Governance"
  | "Behavioural";

export interface CompetencyDefinition {
  id: string;
  name: string;
  domain: CompetencyDomain;
  description: string;
  maxLevel: number; // 5
  departmentPriority: number; // 1 to 5
  futureDemandScore: number; // 1 to 5
}

export interface UserCompetencyScore {
  competencyId: string;
  competencyName: string;
  domain: CompetencyDomain;
  currentLevel: number; // 1 to 5
  requiredLevel: number; // 1 to 5
  gap: number; // max(0, required - current)
  priorityScore: number; // 0 to 100 calculated
  priorityLevel: "High" | "Medium" | "Low" | "None";
  confidenceScore: number; // e.g. 0.85
  evidenceSource: string; // e.g. "AI Assessment - PLFS Round 1"
  lastAssessedDate: string;
}

export interface JobRoleDefinition {
  id: string;
  title: string;
  department: string;
  cadre: string;
  cadreGrade: string;
  requiredCompetencies: Record<string, number>; // competencyName -> level (1-5)
  description: string;
}

export interface OfficerProfile {
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  isAdmin: boolean;
  isTrainer: boolean;
  department: string;
  designation: string;
  jobRoleId: string;
  jobRoleTitle: string;
  cadre: string;
  cadreGrade: "JTS" | "STS" | "JAG" | "SAG" | "HAG" | "JSO" | "SSO" | "Officer";
  posting: string;
  currentAssignment: string;
  educationalQualification: string;
  yearsOfExperience: number;
  previousTraining: string[];
  careerGoal: string;
  preferredLearningMode: "Self-Paced Online" | "Blended Academy" | "Virtual Lab";
  preferredLanguage: "EN" | "HI" | "TE";
  learningHours: number;
  coursesCompleted: number;
  certificationsCount: number;
  onboardingCompleted?: boolean;
}

export interface CourseItem {
  id: string;
  title: string;
  provider: "iGOT" | "NSSTA";
  category: string;
  duration: string;
  durationHours: number;
  rating: number;
  reviewsCount: number;
  enrolledCount: number;
  level: "Foundation" | "Intermediate" | "Advanced";
  competenciesCovered: string[];
  primaryCompetency: string;
  description: string;
  url: string;
  language: string;
  enrolled: boolean;
  progressPct: number;
  completedDate?: string;
  learningOutcomes?: string[];
  syllabusModules?: { id: string; title: string; duration: string }[];
}

export interface NsstaTrainingProgramme {
  id: string;
  programmeName: string;
  description: string;
  targetAudience: string;
  competencies: string[];
  duration: string;
  durationHours: number;
  deliveryMode: "Residential at NSSTA Greater Noida" | "Virtual Interactive" | "Hybrid Fieldwork";
  eligibility: string;
  schedule: string;
  priority: "High" | "Regular";
  registrationUrl: string;
  seatCapacity: number;
  enrolledCount: number;
}

export interface RecommendationExplanation {
  courseId: string;
  courseTitle: string;
  provider: "iGOT" | "NSSTA";
  matchPercentage: number;
  duration: string;
  addressedSkill: string;
  skillGap: number;
  priorityLevel: "High" | "Medium" | "Low";
  whyRecommended: string;
}

export interface ValidatedMCQ {
  id: number | string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  difficulty: "Basic" | "Intermediate" | "Advanced";
  topic: string;
  competency: string;
  sourceReference: string;
  isValidated: boolean;
  validationNotes?: string[];
  status?: "Approved" | "Needs Review" | "Draft";
}

export interface QuizItem {
  id: string;
  title: string;
  description: string;
  domain: CompetencyDomain;
  competency: string;
  questionsCount: number;
  durationMinutes: number;
  difficulty: "Basic" | "Intermediate" | "Advanced";
  questions: ValidatedMCQ[];
  completed?: boolean;
  lastScorePct?: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  quizTitle: string;
  userId: string;
  userName: string;
  date: string;
  scorePct: number;
  totalQuestions: number;
  correctAnswers: number;
  passed: boolean;
  timeSpentSeconds: number;
  competencyBreakdown: { competency: string; scorePct: number; total: number; correct: number }[];
  weakTopics: string[];
}

export interface CompetencyUpdateLog {
  id: string;
  timestamp: string;
  competencyName: string;
  oldLevel: number;
  newLevel: number;
  evidence: string;
  sourceType: "Quiz" | "Course Completion" | "Direct Assessment";
  quizScorePct?: number;
}

export interface LearningResource {
  id: string;
  title: string;
  fileType: "PDF" | "DOCX" | "TXT" | "CSV";
  pageCount: number;
  uploadedDate: string;
  uploadedBy: string;
  domain: CompetencyDomain;
  associatedCompetencies: string[];
  summary: string;
  contentSnippet: string;
}

export interface LearningPathStep {
  stepNumber: number;
  title: string;
  duration: string;
  provider: "iGOT" | "NSSTA";
  difficulty: "Foundation" | "Intermediate" | "Advanced";
  skillAddressed: string;
  matchScore: number;
  status: "Completed" | "In Progress" | "Recommended" | "Locked";
  courseId?: string;
}

export interface EmployeeRecord {
  id: string;
  name: string;
  department: string;
  cadre: string;
  grade: string;
  role: string;
  competencyIndex: number; // e.g. 3.8
  highGapsCount: number;
  hoursCompleted: number;
  complianceStatus: "Compliant" | "In Progress" | "Non-Compliant";
  email: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: "recommendation" | "competency_update" | "quiz_completed" | "programme_alert";
}

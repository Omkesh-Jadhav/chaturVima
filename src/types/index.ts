/**
 * ChaturVima Type Definitions
 * Comprehensive TypeScript types for the mockup application
 */

// ============================================================================
// STAGE TYPES
// ============================================================================

export type StageType =
  | "honeymoon"
  | "self-reflection"
  | "soul-searching"
  | "steady-state";

export interface Stage {
  id: StageType;
  name: string;
  description: string;
  color: {
    main: string;
    light: string;
    dark: string;
  };
  shape: "square" | "triangle" | "circle" | "diamond";
  icon: string; // Unicode symbol
}

export interface StageDistribution {
  honeymoon: number; // percentage (0-100)
  "self-reflection": number;
  "soul-searching": number;
  "steady-state": number;
}

// ============================================================================
// ORGANIZATIONAL LEVEL TYPES
// ============================================================================

export type OrganizationalLevel =
  | "employee"
  | "manager"
  | "department"
  | "company";

export interface LevelData {
  level: OrganizationalLevel;
  name: string;
  stageDistribution: StageDistribution;
  dominantStage: StageType;
  alignmentScore: number; // 0-100
  trend: "improving" | "stable" | "declining";
  lastUpdated: Date;
}

// ============================================================================
// ASSESSMENT TYPES
// ============================================================================

export type QuestionType = "likert" | "multiple-choice" | "scenario";

export interface Question {
  id: string;
  level: OrganizationalLevel;
  stage: StageType; // Which stage this question maps to
  type: QuestionType;
  text: string;
  description?: string;
  options: string[];
  weight: number; // How much this question weighs in scoring
  category?: string;
}

export interface Answer {
  questionId: string;
  selectedOption: number; // Index of selected option
  timestamp: Date;
}

export interface AssessmentProgress {
  currentQuestionIndex: number;
  totalQuestions: number;
  answers: Answer[];
  percentComplete: number;
  timeStarted: Date;
  timeElapsed: number; // seconds
}

export interface AssessmentResult {
  userId: string;
  level: OrganizationalLevel;
  stageDistribution: StageDistribution;
  dominantStage: StageType;
  completedAt: Date;
  score: number; // Overall score 0-100
}

// ============================================================================
// USER TYPES
// ============================================================================

export type UserRole =
  | "employee"
  | "manager"
  | "hr-admin"
  | "department-head"
  | "super-admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatar?: string;
  managerId?: string;
}

export interface UserContext {
  user: User | null;
  isAuthenticated: boolean;
  loginWithOTP: (email: string, mobile: string, name?: string) => Promise<void>;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
  updateProfile: (profileData: Partial<User>) => void;
}

// ============================================================================
// DASHBOARD TYPES
// ============================================================================

export interface DashboardMetrics {
  overallAlignment: number; // 0-100
  engagementScore: number; // 0-100
  participationRate: number; // 0-100 percentage
  averageCompletionTime: number; // minutes
  totalAssessments: number;
  trend: "up" | "down" | "stable";
  trendPercentage: number;
}

export interface EmployeeJourneyPoint {
  date: Date;
  stageDistribution: StageDistribution;
  dominantStage: StageType;
  notes?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  department: string;
  currentStage: StageType;
  stageDistribution: StageDistribution;
  alignmentScore: number;
}

export interface AlignmentData {
  employee: StageDistribution;
  manager: StageDistribution;
  department: StageDistribution;
  company: StageDistribution;
  verticalAlignmentScore: number; // 0-100
  gaps: Array<{
    from: OrganizationalLevel;
    to: OrganizationalLevel;
    severity: "low" | "medium" | "high";
    description: string;
  }>;
}

// ============================================================================
// VISUALIZATION TYPES
// ============================================================================

export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
  stage?: StageType;
}

export interface TimeSeriesDataPoint {
  date: Date | string;
  honeymoon: number;
  selfReflection: number;
  soulSearching: number;
  steadyState: number;
}

export interface HeatmapCell {
  row: string;
  column: string;
  value: number; // 0-100
  color: string;
}

// ============================================================================
// GAMIFICATION TYPES
// ============================================================================

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  progress: number; // 0-100
}

export interface Milestone {
  percentage: number; // 25, 50, 75, 100
  message: string;
  celebration: "confetti" | "sparkles" | "badge";
  achieved: boolean;
}

export interface GamificationState {
  currentStreak: number;
  longestStreak: number;
  totalAssessments: number;
  achievements: Achievement[];
  milestones: Milestone[];
  energyLevel: number; // 0-100
}

// ============================================================================
// THEME TYPES
// ============================================================================

export type ColorVariant = "3a" | "3b" | "3c"; // Warm Pastels, Cool Blues, Earthy Naturals

export interface ThemeConfig {
  variant: ColorVariant;
  stages: Record<StageType, Stage>;
  brandColors: {
    navy: string;
    teal: string;
  };
}

// ============================================================================
// NAVIGATION TYPES
// ============================================================================

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  roles?: UserRole[]; // Restrict to specific roles
  badge?: number;
}

export interface SidebarState {
  isCollapsed: boolean;
  activeItem: string;
  toggle: () => void;
  setActiveItem: (id: string) => void;
}

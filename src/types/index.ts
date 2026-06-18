// ============================================================
// AttendX - TypeScript Type Definitions
// ============================================================

// ---- Enums ----
export type UserRole = 'admin' | 'faculty' | 'student';
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';
export type SessionStatus = 'active' | 'completed' | 'cancelled';
export type AttendanceStatus = 'present' | 'absent' | 'late';
export type SubstitutionStatus = 'pending' | 'approved' | 'rejected' | 'modified';
export type SubjectOption = 'same_subject' | 'different_subject';

// ---- Core Entities ----

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface Semester {
  id: string;
  name: string;
  number: number;
  academicYearId: string;
  startDate?: string;
  endDate?: string;
  isCurrent: boolean;
}

export interface Section {
  id: string;
  name: string;
  departmentId: string;
  semesterId: string;
  maxStudents: number;
  isActive: boolean;
  department?: Department;
  semester?: Semester;
}

// ---- User Entities ----

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  name: string;
  avatarUrl?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface FacultyProfile {
  id: string;
  userId: string;
  facultyCode: string;
  departmentId: string;
  phone?: string;
  designation?: string;
  qualification?: string;
  joiningDate?: string;
  user?: User;
  department?: Department;
}

export interface StudentProfile {
  id: string;
  userId: string;
  rollNumber: string;
  departmentId: string;
  semesterId: string;
  sectionId: string;
  phone?: string;
  guardianName?: string;
  guardianPhone?: string;
  admissionDate?: string;
  user?: User;
  department?: Department;
  semester?: Semester;
  section?: Section;
}

// ---- Academic Entities ----

export interface Subject {
  id: string;
  code: string;
  name: string;
  departmentId: string;
  semesterId: string;
  credits: number;
  type: string;
  isActive: boolean;
  department?: Department;
  semester?: Semester;
}

export interface FacultyAssignment {
  id: string;
  facultyId: string;
  subjectId: string;
  sectionId: string;
  academicYearId?: string;
  isActive: boolean;
  faculty?: FacultyProfile;
  subject?: Subject;
  section?: Section;
}

export interface TimetableEntry {
  id: string;
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  facultyId: string;
  subjectId: string;
  sectionId: string;
  room?: string;
  isActive: boolean;
  faculty?: FacultyProfile;
  subject?: Subject;
  section?: Section;
}

// ---- Attendance Entities ----

export interface AttendanceSession {
  id: string;
  facultyId: string;
  subjectId: string;
  sectionId: string;
  timetableEntryId?: string;
  date: string;
  code?: string;
  codeGeneratedAt?: string;
  codeExpiresAt?: string;
  status: SessionStatus;
  isSubstitute: boolean;
  originalFacultyId?: string;
  originalSubjectId?: string;
  startedAt: string;
  endedAt?: string;
  faculty?: FacultyProfile;
  subject?: Subject;
  section?: Section;
  presentCount?: number;
  absentCount?: number;
  totalStudents?: number;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  status: AttendanceStatus;
  markedAt: string;
  markedBy: string;
  student?: StudentProfile;
  session?: AttendanceSession;
}

// ---- Substitution Entities ----

export interface SubstitutionRequest {
  id: string;
  requestingFacultyId: string;
  substituteFacultyId: string;
  timetableEntryId: string;
  date: string;
  reason?: string;
  subjectOption: SubjectOption;
  substituteSubjectId?: string;
  status: SubstitutionStatus;
  adminRemarks?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  requestingFaculty?: FacultyProfile;
  substituteFaculty?: FacultyProfile;
  timetableEntry?: TimetableEntry;
  substituteSubject?: Subject;
}

// ---- Dashboard Stats ----

export interface AdminDashboardStats {
  totalStudents: number;
  totalFaculty: number;
  totalDepartments: number;
  attendanceToday: number;
  activeSessions: number;
  belowThreshold: number;
  recentAttendance: { date: string; percentage: number }[];
  departmentWise: { name: string; percentage: number }[];
}

export interface FacultyDashboardData {
  todaysClasses: TimetableEntry[];
  recentSessions: AttendanceSession[];
  substituteClasses: AttendanceSession[];
  stats: {
    totalSessions: number;
    avgAttendance: number;
    classesToday: number;
  };
}

export interface StudentDashboardData {
  overallAttendance: number;
  subjectWise: {
    subject: Subject;
    totalClasses: number;
    attended: number;
    percentage: number;
  }[];
  recentHistory: AttendanceRecord[];
  alerts: AttendanceAlert[];
  trend: { month: string; percentage: number }[];
}

export interface AttendanceAlert {
  subjectId: string;
  subjectName: string;
  currentPercentage: number;
  requiredPercentage: number;
  classesNeeded: number;
}

// ---- API Response Types ----

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ---- Auth Types ----

export interface LoginCredentials {
  email: string;
  password: string;
  role: UserRole;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ---- Form Types ----

export interface DepartmentFormData {
  name: string;
  code: string;
  description?: string;
}

export interface SubjectFormData {
  code: string;
  name: string;
  departmentId: string;
  semesterId: string;
  credits: number;
  type: string;
}

export interface FacultyFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  facultyCode: string;
  departmentId: string;
  designation?: string;
  qualification?: string;
}

export interface StudentFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  rollNumber: string;
  departmentId: string;
  semesterId: string;
  sectionId: string;
  guardianName?: string;
  guardianPhone?: string;
}

export interface TimetableFormData {
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  facultyId: string;
  subjectId: string;
  sectionId: string;
  room?: string;
}

export interface SubstitutionFormData {
  timetableEntryId: string;
  date: string;
  substituteFacultyId: string;
  subjectOption: SubjectOption;
  substituteSubjectId?: string;
  reason?: string;
}

// ---- QR/Code Types ----

export interface QRPayload {
  sessionId: string;
  token: string;
  expiresAt: number;
}

export interface CodePayload {
  sessionId: string;
  code: string;
  expiresAt: number;
}

export interface QRScanResult {
  success: boolean;
  message: string;
  attendanceId?: string;
}

// ---- Report Types ----

export interface AttendanceReport {
  title: string;
  generatedAt: string;
  filters: Record<string, string>;
  data: {
    name: string;
    rollNumber?: string;
    totalClasses: number;
    present: number;
    absent: number;
    late: number;
    percentage: number;
  }[];
  summary: {
    totalStudents: number;
    averageAttendance: number;
    belowThreshold: number;
  };
}

// ---- System Settings ----

export interface SystemSettings {
  attendanceThreshold: number;
  qrExpirySeconds?: number;
  codeExpirySeconds: number;
  sessionTimeoutMinutes: number;
  allowLateMarking: boolean;
  lateThresholdMinutes: number;
}

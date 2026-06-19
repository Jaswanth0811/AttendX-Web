// ============================================================
// AttendX - Mock Data for Development
// ============================================================

import {
  Department, AcademicYear, Semester, Section, User, FacultyProfile,
  StudentProfile, Subject, FacultyAssignment, TimetableEntry,
  AttendanceSession, AttendanceRecord, SubstitutionRequest,
  AdminDashboardStats, FacultyDashboardData, StudentDashboardData,
  SystemSettings, AttendanceAlert,
} from '@/types';

// ---- Departments ----
export const mockDepartments: Department[] = [
  { id: 'dept-1', name: 'Computer Science & Engineering', code: 'CSE', description: 'Department of Computer Science and Engineering', isActive: true, createdAt: '2025-07-01', updatedAt: '2025-07-01' },
  { id: 'dept-2', name: 'Mechanical Engineering', code: 'ME', description: 'Department of Mechanical Engineering', isActive: true, createdAt: '2025-07-01', updatedAt: '2025-07-01' },
  { id: 'dept-3', name: 'Electronics & Communication', code: 'ECE', description: 'Department of Electronics and Communication Engineering', isActive: true, createdAt: '2025-07-01', updatedAt: '2025-07-01' },
  { id: 'dept-4', name: 'Electrical & Electronics', code: 'EEE', description: 'Department of Electrical and Electronics Engineering', isActive: true, createdAt: '2025-07-01', updatedAt: '2025-07-01' },
  { id: 'dept-5', name: 'Civil Engineering', code: 'CE', description: 'Department of Civil Engineering', isActive: true, createdAt: '2025-07-01', updatedAt: '2025-07-01' },
];

// ---- Academic Years ----
export const mockAcademicYears: AcademicYear[] = [
  { id: 'ay-1', name: '2025-2026', startDate: '2025-07-01', endDate: '2026-06-30', isCurrent: true },
  { id: 'ay-2', name: '2024-2025', startDate: '2024-07-01', endDate: '2025-06-30', isCurrent: false },
];

// ---- Semesters ----
export const mockSemesters: Semester[] = [
  { id: 'sem-1', name: 'Semester 1', number: 1, academicYearId: 'ay-1', isCurrent: false },
  { id: 'sem-2', name: 'Semester 2', number: 2, academicYearId: 'ay-1', isCurrent: false },
  { id: 'sem-3', name: 'Semester 3', number: 3, academicYearId: 'ay-1', isCurrent: true },
  { id: 'sem-4', name: 'Semester 4', number: 4, academicYearId: 'ay-1', isCurrent: false },
  { id: 'sem-5', name: 'Semester 5', number: 5, academicYearId: 'ay-1', isCurrent: false },
  { id: 'sem-6', name: 'Semester 6', number: 6, academicYearId: 'ay-1', isCurrent: false },
];

// ---- Sections ----
export const mockSections: Section[] = [
  { id: 'sec-1', name: 'CSE-3A', departmentId: 'dept-1', semesterId: 'sem-3', maxStudents: 60, isActive: true },
  { id: 'sec-2', name: 'CSE-3B', departmentId: 'dept-1', semesterId: 'sem-3', maxStudents: 60, isActive: true },
  { id: 'sec-3', name: 'ME-3A', departmentId: 'dept-2', semesterId: 'sem-3', maxStudents: 60, isActive: true },
  { id: 'sec-4', name: 'ME-3B', departmentId: 'dept-2', semesterId: 'sem-3', maxStudents: 60, isActive: true },
  { id: 'sec-5', name: 'ECE-3A', departmentId: 'dept-3', semesterId: 'sem-3', maxStudents: 60, isActive: true },
];

// ---- Users ----
export const mockUsers: User[] = [
  { id: 'user-admin', email: 'admin@attendx.edu', role: 'admin', firstName: 'System', lastName: 'Administrator', name: 'System Administrator', isActive: true, createdAt: '2025-07-01' },
  { id: 'user-admin-personal', email: 'Jaswanthganta2005@outlook.com', role: 'admin', firstName: 'Jaswanth', lastName: 'Ganta', name: 'Jaswanth Ganta', isActive: true, createdAt: '2025-07-01' },
  { id: 'user-fac-1', email: 'dr.kumar@attendx.edu', role: 'faculty', firstName: 'Rajesh', lastName: 'Kumar', name: 'Dr. Rajesh Kumar', isActive: true, createdAt: '2025-07-01' },
  { id: 'user-fac-2', email: 'prof.sharma@attendx.edu', role: 'faculty', firstName: 'Priya', lastName: 'Sharma', name: 'Prof. Priya Sharma', isActive: true, createdAt: '2025-07-01' },
  { id: 'user-fac-3', email: 'dr.patel@attendx.edu', role: 'faculty', firstName: 'Amit', lastName: 'Patel', name: 'Dr. Amit Patel', isActive: true, createdAt: '2025-07-01' },
  { id: 'user-fac-4', email: 'prof.singh@attendx.edu', role: 'faculty', firstName: 'Neha', lastName: 'Singh', name: 'Prof. Neha Singh', isActive: true, createdAt: '2025-07-01' },
  { id: 'user-stu-1', email: 'rahul.me3a@attendx.edu', role: 'student', firstName: 'Rahul', lastName: 'Verma', name: 'Rahul Verma', isActive: true, createdAt: '2025-07-01' },
  { id: 'user-stu-2', email: 'ananya.cse3a@attendx.edu', role: 'student', firstName: 'Ananya', lastName: 'Reddy', name: 'Ananya Reddy', isActive: true, createdAt: '2025-07-01' },
  { id: 'user-stu-3', email: 'vikram.me3a@attendx.edu', role: 'student', firstName: 'Vikram', lastName: 'Desai', name: 'Vikram Desai', isActive: true, createdAt: '2025-07-01' },
  { id: 'user-stu-4', email: 'sneha.cse3b@attendx.edu', role: 'student', firstName: 'Sneha', lastName: 'Iyer', name: 'Sneha Iyer', isActive: true, createdAt: '2025-07-01' },
  { id: 'user-stu-5', email: 'arjun.ece3a@attendx.edu', role: 'student', firstName: 'Arjun', lastName: 'Nair', name: 'Arjun Nair', isActive: true, createdAt: '2025-07-01' },
];

// ---- Faculty Profiles ----
export const mockFacultyProfiles: FacultyProfile[] = [
  { id: 'fac-1', userId: 'user-fac-1', facultyCode: 'FAC001', departmentId: 'dept-1', phone: '9876543210', designation: 'Professor', qualification: 'Ph.D. in CS' },
  { id: 'fac-2', userId: 'user-fac-2', facultyCode: 'FAC002', departmentId: 'dept-1', phone: '9876543211', designation: 'Associate Professor', qualification: 'M.Tech in CS' },
  { id: 'fac-3', userId: 'user-fac-3', facultyCode: 'FAC003', departmentId: 'dept-2', phone: '9876543212', designation: 'Assistant Professor', qualification: 'Ph.D. in ME' },
  { id: 'fac-4', userId: 'user-fac-4', facultyCode: 'FAC004', departmentId: 'dept-3', phone: '9876543213', designation: 'Professor', qualification: 'Ph.D. in ECE' },
];

// ---- Student Profiles ----
export const mockStudentProfiles: StudentProfile[] = [
  { id: 'stu-1', userId: 'user-stu-1', rollNumber: 'ME21001', departmentId: 'dept-2', semesterId: 'sem-3', sectionId: 'sec-3', phone: '9123456780' },
  { id: 'stu-2', userId: 'user-stu-2', rollNumber: 'CSE21001', departmentId: 'dept-1', semesterId: 'sem-3', sectionId: 'sec-1', phone: '9123456781' },
  { id: 'stu-3', userId: 'user-stu-3', rollNumber: 'ME21002', departmentId: 'dept-2', semesterId: 'sem-3', sectionId: 'sec-3', phone: '9123456782' },
  { id: 'stu-4', userId: 'user-stu-4', rollNumber: 'CSE21002', departmentId: 'dept-1', semesterId: 'sem-3', sectionId: 'sec-2', phone: '9123456783' },
  { id: 'stu-5', userId: 'user-stu-5', rollNumber: 'ECE21001', departmentId: 'dept-3', semesterId: 'sem-3', sectionId: 'sec-5', phone: '9123456784' },
];

// ---- Subjects ----
export const mockSubjects: Subject[] = [
  { id: 'sub-1', code: 'CS301', name: 'Data Structures & Algorithms', departmentId: 'dept-1', semesterId: 'sem-3', credits: 4, type: 'theory', isActive: true },
  { id: 'sub-2', code: 'CS302', name: 'Database Management Systems', departmentId: 'dept-1', semesterId: 'sem-3', credits: 4, type: 'theory', isActive: true },
  { id: 'sub-3', code: 'CS303', name: 'Operating Systems', departmentId: 'dept-1', semesterId: 'sem-3', credits: 3, type: 'theory', isActive: true },
  { id: 'sub-4', code: 'CS304', name: 'Computer Networks', departmentId: 'dept-1', semesterId: 'sem-3', credits: 3, type: 'theory', isActive: true },
  { id: 'sub-5', code: 'ME301', name: 'Machine Design', departmentId: 'dept-2', semesterId: 'sem-3', credits: 4, type: 'theory', isActive: true },
  { id: 'sub-6', code: 'ME302', name: 'Heat Transfer', departmentId: 'dept-2', semesterId: 'sem-3', credits: 3, type: 'theory', isActive: true },
  { id: 'sub-7', code: 'ME303', name: 'CAD/CAM', departmentId: 'dept-2', semesterId: 'sem-3', credits: 3, type: 'lab', isActive: true },
  { id: 'sub-8', code: 'EC301', name: 'Digital Signal Processing', departmentId: 'dept-3', semesterId: 'sem-3', credits: 4, type: 'theory', isActive: true },
];

// ---- Faculty Assignments ----
export const mockAssignments: FacultyAssignment[] = [
  { id: 'asgn-1', facultyId: 'fac-1', subjectId: 'sub-1', sectionId: 'sec-1', academicYearId: 'ay-1', isActive: true },
  { id: 'asgn-2', facultyId: 'fac-1', subjectId: 'sub-1', sectionId: 'sec-2', academicYearId: 'ay-1', isActive: true },
  { id: 'asgn-3', facultyId: 'fac-2', subjectId: 'sub-2', sectionId: 'sec-1', academicYearId: 'ay-1', isActive: true },
  { id: 'asgn-4', facultyId: 'fac-2', subjectId: 'sub-3', sectionId: 'sec-2', academicYearId: 'ay-1', isActive: true },
  { id: 'asgn-5', facultyId: 'fac-3', subjectId: 'sub-5', sectionId: 'sec-3', academicYearId: 'ay-1', isActive: true },
  { id: 'asgn-6', facultyId: 'fac-3', subjectId: 'sub-6', sectionId: 'sec-4', academicYearId: 'ay-1', isActive: true },
  { id: 'asgn-7', facultyId: 'fac-4', subjectId: 'sub-8', sectionId: 'sec-5', academicYearId: 'ay-1', isActive: true },
];

// ---- Timetable ----
export const mockTimetable: TimetableEntry[] = [
  { id: 'tt-1', day: 'monday', startTime: '09:00', endTime: '10:00', facultyId: 'fac-1', subjectId: 'sub-1', sectionId: 'sec-1', room: 'CS-101', isActive: true },
  { id: 'tt-2', day: 'monday', startTime: '10:00', endTime: '11:00', facultyId: 'fac-2', subjectId: 'sub-2', sectionId: 'sec-1', room: 'CS-102', isActive: true },
  { id: 'tt-3', day: 'monday', startTime: '11:00', endTime: '12:00', facultyId: 'fac-3', subjectId: 'sub-5', sectionId: 'sec-3', room: 'ME-201', isActive: true },
  { id: 'tt-4', day: 'tuesday', startTime: '09:00', endTime: '10:00', facultyId: 'fac-1', subjectId: 'sub-1', sectionId: 'sec-2', room: 'CS-103', isActive: true },
  { id: 'tt-5', day: 'tuesday', startTime: '10:00', endTime: '11:00', facultyId: 'fac-2', subjectId: 'sub-3', sectionId: 'sec-2', room: 'CS-104', isActive: true },
  { id: 'tt-6', day: 'tuesday', startTime: '11:00', endTime: '12:00', facultyId: 'fac-4', subjectId: 'sub-8', sectionId: 'sec-5', room: 'EC-101', isActive: true },
  { id: 'tt-7', day: 'wednesday', startTime: '09:00', endTime: '10:00', facultyId: 'fac-1', subjectId: 'sub-1', sectionId: 'sec-1', room: 'CS-101', isActive: true },
  { id: 'tt-8', day: 'wednesday', startTime: '10:00', endTime: '12:00', facultyId: 'fac-3', subjectId: 'sub-7', sectionId: 'sec-3', room: 'ME-LAB', isActive: true },
  { id: 'tt-9', day: 'thursday', startTime: '09:00', endTime: '10:00', facultyId: 'fac-2', subjectId: 'sub-2', sectionId: 'sec-1', room: 'CS-102', isActive: true },
  { id: 'tt-10', day: 'thursday', startTime: '10:00', endTime: '11:00', facultyId: 'fac-3', subjectId: 'sub-6', sectionId: 'sec-4', room: 'ME-202', isActive: true },
  { id: 'tt-11', day: 'friday', startTime: '09:00', endTime: '10:00', facultyId: 'fac-4', subjectId: 'sub-8', sectionId: 'sec-5', room: 'EC-101', isActive: true },
  { id: 'tt-12', day: 'friday', startTime: '10:00', endTime: '11:00', facultyId: 'fac-1', subjectId: 'sub-1', sectionId: 'sec-2', room: 'CS-103', isActive: true },
];

// ---- Attendance Sessions ----
export const mockSessions: AttendanceSession[] = [
  { id: 'sess-1', facultyId: 'fac-1', subjectId: 'sub-1', sectionId: 'sec-1', date: '2026-06-18', status: 'completed', isSubstitute: false, startedAt: '2026-06-18T09:00:00', endedAt: '2026-06-18T09:50:00', presentCount: 52, absentCount: 8, totalStudents: 60 },
  { id: 'sess-2', facultyId: 'fac-2', subjectId: 'sub-2', sectionId: 'sec-1', date: '2026-06-18', status: 'completed', isSubstitute: false, startedAt: '2026-06-18T10:00:00', endedAt: '2026-06-18T10:50:00', presentCount: 48, absentCount: 12, totalStudents: 60 },
  { id: 'sess-3', facultyId: 'fac-3', subjectId: 'sub-5', sectionId: 'sec-3', date: '2026-06-18', status: 'active', isSubstitute: false, startedAt: '2026-06-18T11:00:00', presentCount: 35, absentCount: 25, totalStudents: 60 },
];

// ---- Substitution Requests ----
export const mockSubstitutions: SubstitutionRequest[] = [
  { id: 'subst-1', requestingFacultyId: 'fac-3', substituteFacultyId: 'fac-1', timetableEntryId: 'tt-3', date: '2026-06-20', reason: 'Medical leave', subjectOption: 'same_subject', status: 'pending', createdAt: '2026-06-18T08:00:00' },
  { id: 'subst-2', requestingFacultyId: 'fac-4', substituteFacultyId: 'fac-2', timetableEntryId: 'tt-6', date: '2026-06-19', reason: 'Conference attendance', subjectOption: 'different_subject', substituteSubjectId: 'sub-3', status: 'approved', approvedAt: '2026-06-18T10:00:00', createdAt: '2026-06-17T14:00:00' },
];

// ---- Dashboard Stats ----
export const mockAdminStats: AdminDashboardStats = {
  totalStudents: 2847,
  totalFaculty: 156,
  totalDepartments: 5,
  attendanceToday: 87,
  activeSessions: 3,
  belowThreshold: 42,
  recentAttendance: [
    { date: '2026-06-12', percentage: 84 },
    { date: '2026-06-13', percentage: 86 },
    { date: '2026-06-14', percentage: 82 },
    { date: '2026-06-15', percentage: 88 },
    { date: '2026-06-16', percentage: 85 },
    { date: '2026-06-17', percentage: 87 },
    { date: '2026-06-18', percentage: 87 },
  ],
  departmentWise: [
    { name: 'CSE', percentage: 89 },
    { name: 'ME', percentage: 85 },
    { name: 'ECE', percentage: 87 },
    { name: 'EEE', percentage: 83 },
    { name: 'CE', percentage: 86 },
  ],
};

export const mockFacultyDashboard: FacultyDashboardData = {
  todaysClasses: mockTimetable.filter(t => t.day === 'wednesday'),
  recentSessions: mockSessions,
  substituteClasses: [],
  stats: {
    totalSessions: 124,
    avgAttendance: 86,
    classesToday: 2,
  },
};

export const mockStudentDashboard: StudentDashboardData = {
  overallAttendance: 84,
  subjectWise: [
    { subject: mockSubjects[0], totalClasses: 42, attended: 37, percentage: 88 },
    { subject: mockSubjects[1], totalClasses: 38, attended: 31, percentage: 82 },
    { subject: mockSubjects[2], totalClasses: 35, attended: 32, percentage: 91 },
    { subject: mockSubjects[3], totalClasses: 30, attended: 21, percentage: 70 },
  ],
  recentHistory: [],
  alerts: [
    { subjectId: 'sub-4', subjectName: 'Computer Networks', currentPercentage: 70, requiredPercentage: 75, classesNeeded: 3 },
  ],
  trend: [
    { month: 'Jan', percentage: 88 },
    { month: 'Feb', percentage: 85 },
    { month: 'Mar', percentage: 82 },
    { month: 'Apr', percentage: 80 },
    { month: 'May', percentage: 83 },
    { month: 'Jun', percentage: 84 },
  ],
};

// ---- System Settings ----
export const mockSettings: SystemSettings = {
  attendanceThreshold: 75,
  qrExpirySeconds: 30,
  codeExpirySeconds: 30,
  sessionTimeoutMinutes: 120,
  allowLateMarking: true,
  lateThresholdMinutes: 15,
};

// ---- Helper Functions ----
export function getUserByRole(role: string): User | undefined {
  return mockUsers.find(u => u.role === role);
}

export function getFacultyByUserId(userId: string): FacultyProfile | undefined {
  return mockFacultyProfiles.find(f => f.userId === userId);
}

export function getStudentByUserId(userId: string): StudentProfile | undefined {
  return mockStudentProfiles.find(s => s.userId === userId);
}

export function getDepartmentById(id: string): Department | undefined {
  return mockDepartments.find(d => d.id === id);
}

export function getSubjectById(id: string): Subject | undefined {
  return mockSubjects.find(s => s.id === id);
}

export function getSectionById(id: string): Section | undefined {
  return mockSections.find(s => s.id === id);
}

export function getFacultyTimetable(facultyId: string, day?: string): TimetableEntry[] {
  let entries = mockTimetable.filter(t => t.facultyId === facultyId);
  if (day) entries = entries.filter(t => t.day === day);
  return entries;
}

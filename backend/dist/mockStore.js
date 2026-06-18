"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.store = exports.MockStore = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// ---- Seed Data ----
const hashedDefaultPassword = bcryptjs_1.default.hashSync('admin123', 10);
const hashedFacultyPassword = bcryptjs_1.default.hashSync('faculty123', 10);
const hashedStudentPassword = bcryptjs_1.default.hashSync('student123', 10);
class MockStore {
    constructor() {
        this.departments = [
            { id: 'd1000000-0000-0000-0000-000000000001', name: 'Computer Science & Engineering', code: 'CSE', description: 'Department of Computer Science and Engineering', isActive: true, createdAt: '2025-07-01', updatedAt: '2025-07-01' },
            { id: 'd1000000-0000-0000-0000-000000000002', name: 'Mechanical Engineering', code: 'ME', description: 'Department of Mechanical Engineering', isActive: true, createdAt: '2025-07-01', updatedAt: '2025-07-01' },
            { id: 'd1000000-0000-0000-0000-000000000003', name: 'Electronics & Communication', code: 'ECE', description: 'Department of Electronics and Communication Engineering', isActive: true, createdAt: '2025-07-01', updatedAt: '2025-07-01' },
            { id: 'd1000000-0000-0000-0000-000000000004', name: 'Electrical & Electronics', code: 'EEE', description: 'Department of Electrical and Electronics Engineering', isActive: true, createdAt: '2025-07-01', updatedAt: '2025-07-01' },
            { id: 'd1000000-0000-0000-0000-000000000005', name: 'Civil Engineering', code: 'CE', description: 'Department of Civil Engineering', isActive: true, createdAt: '2025-07-01', updatedAt: '2025-07-01' },
        ];
        this.academicYears = [
            { id: 'a1000000-0000-0000-0000-000000000001', name: '2025-2026', startDate: '2025-07-01', endDate: '2026-06-30', isCurrent: true }
        ];
        this.semesters = [
            { id: 'e1000000-0000-0000-0000-000000000001', name: 'Semester 1', number: 1, academicYearId: 'a1000000-0000-0000-0000-000000000001', isCurrent: false },
            { id: 'e1000000-0000-0000-0000-000000000002', name: 'Semester 2', number: 2, academicYearId: 'a1000000-0000-0000-0000-000000000001', isCurrent: false },
            { id: 'e1000000-0000-0000-0000-000000000003', name: 'Semester 3', number: 3, academicYearId: 'a1000000-0000-0000-0000-000000000001', isCurrent: true },
            { id: 'e1000000-0000-0000-0000-000000000004', name: 'Semester 4', number: 4, academicYearId: 'a1000000-0000-0000-0000-000000000001', isCurrent: false },
            { id: 'e1000000-0000-0000-0000-000000000005', name: 'Semester 5', number: 5, academicYearId: 'a1000000-0000-0000-0000-000000000001', isCurrent: false },
            { id: 'e1000000-0000-0000-0000-000000000006', name: 'Semester 6', number: 6, academicYearId: 'a1000000-0000-0000-0000-000000000001', isCurrent: false },
        ];
        this.sections = [
            { id: 'c1000000-0000-0000-0000-000000000001', name: 'CSE-3A', departmentId: 'd1000000-0000-0000-0000-000000000001', semesterId: 'e1000000-0000-0000-0000-000000000003', maxStudents: 60, isActive: true },
            { id: 'c1000000-0000-0000-0000-000000000002', name: 'CSE-3B', departmentId: 'd1000000-0000-0000-0000-000000000001', semesterId: 'e1000000-0000-0000-0000-000000000003', maxStudents: 60, isActive: true },
            { id: 'c1000000-0000-0000-0000-000000000003', name: 'ME-3A', departmentId: 'd1000000-0000-0000-0000-000000000002', semesterId: 'e1000000-0000-0000-0000-000000000003', maxStudents: 60, isActive: true },
            { id: 'c1000000-0000-0000-0000-000000000004', name: 'ME-3B', departmentId: 'd1000000-0000-0000-0000-000000000002', semesterId: 'e1000000-0000-0000-0000-000000000003', maxStudents: 60, isActive: true },
            { id: 'c1000000-0000-0000-0000-000000000005', name: 'ECE-3A', departmentId: 'd1000000-0000-0000-0000-000000000003', semesterId: 'e1000000-0000-0000-0000-000000000003', maxStudents: 60, isActive: true },
        ];
        this.users = [
            { id: 'u1000000-0000-0000-0000-000000000001', email: 'admin@attendx.edu', passwordHash: hashedDefaultPassword, role: 'admin', firstName: 'System', lastName: 'Administrator', isActive: true, createdAt: '2025-07-01', updatedAt: '2025-07-01' },
            { id: 'u1000000-0000-0000-0000-000000000002', email: 'dr.kumar@attendx.edu', passwordHash: hashedFacultyPassword, role: 'faculty', firstName: 'Rajesh', lastName: 'Kumar', isActive: true, createdAt: '2025-07-01', updatedAt: '2025-07-01' },
            { id: 'u1000000-0000-0000-0000-000000000003', email: 'prof.sharma@attendx.edu', passwordHash: hashedFacultyPassword, role: 'faculty', firstName: 'Priya', lastName: 'Sharma', isActive: true, createdAt: '2025-07-01', updatedAt: '2025-07-01' },
            { id: 'u1000000-0000-0000-0000-000000000004', email: 'dr.patel@attendx.edu', passwordHash: hashedFacultyPassword, role: 'faculty', firstName: 'Amit', lastName: 'Patel', isActive: true, createdAt: '2025-07-01', updatedAt: '2025-07-01' },
            { id: 'u1000000-0000-0000-0000-000000000005', email: 'prof.singh@attendx.edu', passwordHash: hashedFacultyPassword, role: 'faculty', firstName: 'Neha', lastName: 'Singh', isActive: true, createdAt: '2025-07-01', updatedAt: '2025-07-01' },
            { id: 'u1000000-0000-0000-0000-000000000006', email: 'rahul.me3a@attendx.edu', passwordHash: hashedStudentPassword, role: 'student', firstName: 'Rahul', lastName: 'Verma', isActive: true, createdAt: '2025-07-01', updatedAt: '2025-07-01' },
            { id: 'u1000000-0000-0000-0000-000000000007', email: 'ananya.cse3a@attendx.edu', passwordHash: hashedStudentPassword, role: 'student', firstName: 'Ananya', lastName: 'Reddy', isActive: true, createdAt: '2025-07-01', updatedAt: '2025-07-01' },
            { id: 'u1000000-0000-0000-0000-000000000008', email: 'vikram.me3a@attendx.edu', passwordHash: hashedStudentPassword, role: 'student', firstName: 'Vikram', lastName: 'Desai', isActive: true, createdAt: '2025-07-01', updatedAt: '2025-07-01' },
            { id: 'u1000000-0000-0000-0000-000000000009', email: 'sneha.cse3b@attendx.edu', passwordHash: hashedStudentPassword, role: 'student', firstName: 'Sneha', lastName: 'Iyer', isActive: true, createdAt: '2025-07-01', updatedAt: '2025-07-01' },
            { id: 'u1000000-0000-0000-0000-000000000010', email: 'arjun.ece3a@attendx.edu', passwordHash: hashedStudentPassword, role: 'student', firstName: 'Arjun', lastName: 'Nair', isActive: true, createdAt: '2025-07-01', updatedAt: '2025-07-01' },
        ];
        this.facultyProfiles = [
            { id: 'fac-1', userId: 'u1000000-0000-0000-0000-000000000002', facultyCode: 'FAC001', departmentId: 'd1000000-0000-0000-0000-000000000001', phone: '9876543210', designation: 'Professor', qualification: 'Ph.D. in CS', joiningDate: '2020-06-01' },
            { id: 'fac-2', userId: 'u1000000-0000-0000-0000-000000000003', facultyCode: 'FAC002', departmentId: 'd1000000-0000-0000-0000-000000000001', phone: '9876543211', designation: 'Associate Professor', qualification: 'M.Tech in CS', joiningDate: '2021-08-15' },
            { id: 'fac-3', userId: 'u1000000-0000-0000-0000-000000000004', facultyCode: 'FAC003', departmentId: 'd1000000-0000-0000-0000-000000000002', phone: '9876543212', designation: 'Assistant Professor', qualification: 'Ph.D. in ME', joiningDate: '2022-01-10' },
            { id: 'fac-4', userId: 'u1000000-0000-0000-0000-000000000005', facultyCode: 'FAC004', departmentId: 'd1000000-0000-0000-0000-000000000003', phone: '9876543213', designation: 'Professor', qualification: 'Ph.D. in ECE', joiningDate: '2019-11-20' },
        ];
        this.studentProfiles = [
            { id: 'stu-1', userId: 'u1000000-0000-0000-0000-000000000006', rollNumber: 'ME21001', departmentId: 'd1000000-0000-0000-0000-000000000002', semesterId: 'e1000000-0000-0000-0000-000000000003', sectionId: 'c1000000-0000-0000-0000-000000000003', phone: '9123456780', guardianName: 'B. R. Verma', guardianPhone: '9123456789', admissionDate: '2024-07-15' },
            { id: 'stu-2', userId: 'u1000000-0000-0000-0000-000000000007', rollNumber: 'CSE21001', departmentId: 'd1000000-0000-0000-0000-000000000001', semesterId: 'e1000000-0000-0000-0000-000000000003', sectionId: 'c1000000-0000-0000-0000-000000000001', phone: '9123456781', guardianName: 'V. Reddy', guardianPhone: '9123456788', admissionDate: '2024-07-15' },
            { id: 'stu-3', userId: 'u1000000-0000-0000-0000-000000000008', rollNumber: 'ME21002', departmentId: 'd1000000-0000-0000-0000-000000000002', semesterId: 'e1000000-0000-0000-0000-000000000003', sectionId: 'c1000000-0000-0000-0000-000000000003', phone: '9123456782', guardianName: 'S. Desai', guardianPhone: '9123456787', admissionDate: '2024-07-15' },
            { id: 'stu-4', userId: 'u1000000-0000-0000-0000-000000000009', rollNumber: 'CSE21002', departmentId: 'd1000000-0000-0000-0000-000000000001', semesterId: 'e1000000-0000-0000-0000-000000000003', sectionId: 'c1000000-0000-0000-0000-000000000002', phone: '9123456783', guardianName: 'K. Iyer', guardianPhone: '9123456786', admissionDate: '2024-07-15' },
            { id: 'stu-5', userId: 'u1000000-0000-0000-0000-000000000010', rollNumber: 'ECE21001', departmentId: 'd1000000-0000-0000-0000-000000000003', semesterId: 'e1000000-0000-0000-0000-000000000003', sectionId: 'c1000000-0000-0000-0000-000000000005', phone: '9123456784', guardianName: 'M. Nair', guardianPhone: '9123456785', admissionDate: '2024-07-15' },
        ];
        this.subjects = [
            { id: 'f1000000-0000-0000-0000-000000000001', code: 'CS301', name: 'Data Structures & Algorithms', departmentId: 'd1000000-0000-0000-0000-000000000001', semesterId: 'e1000000-0000-0000-0000-000000000003', credits: 4, type: 'theory', isActive: true },
            { id: 'f1000000-0000-0000-0000-000000000002', code: 'CS302', name: 'Database Management Systems', departmentId: 'd1000000-0000-0000-0000-000000000001', semesterId: 'e1000000-0000-0000-0000-000000000003', credits: 4, type: 'theory', isActive: true },
            { id: 'f1000000-0000-0000-0000-000000000003', code: 'CS303', name: 'Operating Systems', departmentId: 'd1000000-0000-0000-0000-000000000001', semesterId: 'e1000000-0000-0000-0000-000000000003', credits: 3, type: 'theory', isActive: true },
            { id: 'f1000000-0000-0000-0000-000000000004', code: 'CS304', name: 'Computer Networks', departmentId: 'd1000000-0000-0000-0000-000000000001', semesterId: 'e1000000-0000-0000-0000-000000000003', credits: 3, type: 'theory', isActive: true },
            { id: 'f1000000-0000-0000-0000-000000000005', code: 'ME301', name: 'Machine Design', departmentId: 'd1000000-0000-0000-0000-000000000002', semesterId: 'e1000000-0000-0000-0000-000000000003', credits: 4, type: 'theory', isActive: true },
            { id: 'f1000000-0000-0000-0000-000000000006', code: 'ME302', name: 'Heat Transfer', departmentId: 'd1000000-0000-0000-0000-000000000002', semesterId: 'e1000000-0000-0000-0000-000000000003', credits: 3, type: 'theory', isActive: true },
            { id: 'f1000000-0000-0000-0000-000000000007', code: 'ME303', name: 'CAD/CAM Lab', departmentId: 'd1000000-0000-0000-0000-000000000002', semesterId: 'e1000000-0000-0000-0000-000000000003', credits: 3, type: 'lab', isActive: true },
            { id: 'f1000000-0000-0000-0000-000000000008', code: 'EC301', name: 'Digital Signal Processing', departmentId: 'd1000000-0000-0000-0000-000000000003', semesterId: 'e1000000-0000-0000-0000-000000000003', credits: 4, type: 'theory', isActive: true },
        ];
        this.facultyAssignments = [
            { id: 'asgn-1', facultyId: 'fac-1', subjectId: 'f1000000-0000-0000-0000-000000000001', sectionId: 'c1000000-0000-0000-0000-000000000001', academicYearId: 'a1000000-0000-0000-0000-000000000001', isActive: true },
            { id: 'asgn-2', facultyId: 'fac-1', subjectId: 'f1000000-0000-0000-0000-000000000001', sectionId: 'c1000000-0000-0000-0000-000000000002', academicYearId: 'a1000000-0000-0000-0000-000000000001', isActive: true },
            { id: 'asgn-3', facultyId: 'fac-2', subjectId: 'f1000000-0000-0000-0000-000000000002', sectionId: 'c1000000-0000-0000-0000-000000000001', academicYearId: 'a1000000-0000-0000-0000-000000000001', isActive: true },
            { id: 'asgn-4', facultyId: 'fac-2', subjectId: 'f1000000-0000-0000-0000-000000000003', sectionId: 'c1000000-0000-0000-0000-000000000002', academicYearId: 'a1000000-0000-0000-0000-000000000001', isActive: true },
            { id: 'asgn-5', facultyId: 'fac-3', subjectId: 'f1000000-0000-0000-0000-000000000005', sectionId: 'c1000000-0000-0000-0000-000000000003', academicYearId: 'a1000000-0000-0000-0000-000000000001', isActive: true },
            { id: 'asgn-6', facultyId: 'fac-3', subjectId: 'f1000000-0000-0000-0000-000000000006', sectionId: 'c1000000-0000-0000-0000-000000000004', academicYearId: 'a1000000-0000-0000-0000-000000000001', isActive: true },
            { id: 'asgn-7', facultyId: 'fac-4', subjectId: 'f1000000-0000-0000-0000-000000000008', sectionId: 'c1000000-0000-0000-0000-000000000005', academicYearId: 'a1000000-0000-0000-0000-000000000001', isActive: true },
        ];
        this.timetable = [
            { id: 'tt-1', day: 'monday', startTime: '09:00', endTime: '10:00', facultyId: 'fac-1', subjectId: 'f1000000-0000-0000-0000-000000000001', sectionId: 'c1000000-0000-0000-0000-000000000001', room: 'CS-101', academicYearId: 'a1000000-0000-0000-0000-000000000001', isActive: true },
            { id: 'tt-2', day: 'monday', startTime: '10:00', endTime: '11:00', facultyId: 'fac-2', subjectId: 'f1000000-0000-0000-0000-000000000002', sectionId: 'c1000000-0000-0000-0000-000000000001', room: 'CS-102', academicYearId: 'a1000000-0000-0000-0000-000000000001', isActive: true },
            { id: 'tt-3', day: 'monday', startTime: '11:00', endTime: '12:00', facultyId: 'fac-3', subjectId: 'f1000000-0000-0000-0000-000000000005', sectionId: 'c1000000-0000-0000-0000-000000000003', room: 'ME-201', academicYearId: 'a1000000-0000-0000-0000-000000000001', isActive: true },
            { id: 'tt-4', day: 'tuesday', startTime: '09:00', endTime: '10:00', facultyId: 'fac-1', subjectId: 'f1000000-0000-0000-0000-000000000001', sectionId: 'c1000000-0000-0000-0000-000000000002', room: 'CS-103', academicYearId: 'a1000000-0000-0000-0000-000000000001', isActive: true },
            { id: 'tt-5', day: 'tuesday', startTime: '10:00', endTime: '11:00', facultyId: 'fac-2', subjectId: 'f1000000-0000-0000-0000-000000000003', sectionId: 'c1000000-0000-0000-0000-000000000002', room: 'CS-104', academicYearId: 'a1000000-0000-0000-0000-000000000001', isActive: true },
            { id: 'tt-6', day: 'tuesday', startTime: '11:00', endTime: '12:00', facultyId: 'fac-4', subjectId: 'f1000000-0000-0000-0000-000000000008', sectionId: 'c1000000-0000-0000-0000-000000000005', room: 'EC-101', academicYearId: 'a1000000-0000-0000-0000-000000000001', isActive: true },
            { id: 'tt-7', day: 'wednesday', startTime: '09:00', endTime: '10:00', facultyId: 'fac-1', subjectId: 'f1000000-0000-0000-0000-000000000001', sectionId: 'c1000000-0000-0000-0000-000000000001', room: 'CS-101', academicYearId: 'a1000000-0000-0000-0000-000000000001', isActive: true },
            { id: 'tt-8', day: 'wednesday', startTime: '10:00', endTime: '12:00', facultyId: 'fac-3', subjectId: 'f1000000-0000-0000-0000-000000000007', sectionId: 'c1000000-0000-0000-0000-000000000003', room: 'ME-LAB', academicYearId: 'a1000000-0000-0000-0000-000000000001', isActive: true },
            { id: 'tt-9', day: 'thursday', startTime: '09:00', endTime: '10:00', facultyId: 'fac-2', subjectId: 'f1000000-0000-0000-0000-000000000002', sectionId: 'c1000000-0000-0000-0000-000000000001', room: 'CS-102', academicYearId: 'a1000000-0000-0000-0000-000000000001', isActive: true },
            { id: 'tt-10', day: 'thursday', startTime: '10:00', endTime: '11:00', facultyId: 'fac-3', subjectId: 'f1000000-0000-0000-0000-000000000006', sectionId: 'c1000000-0000-0000-0000-000000000004', room: 'ME-202', academicYearId: 'a1000000-0000-0000-0000-000000000001', isActive: true },
            { id: 'tt-11', day: 'friday', startTime: '09:00', endTime: '10:00', facultyId: 'fac-4', subjectId: 'f1000000-0000-0000-0000-000000000008', sectionId: 'c1000000-0000-0000-0000-000000000005', room: 'EC-101', academicYearId: 'a1000000-0000-0000-0000-000000000001', isActive: true },
            { id: 'tt-12', day: 'friday', startTime: '10:00', endTime: '11:00', facultyId: 'fac-1', subjectId: 'f1000000-0000-0000-0000-000000000001', sectionId: 'c1000000-0000-0000-0000-000000000002', room: 'CS-103', academicYearId: 'a1000000-0000-0000-0000-000000000001', isActive: true },
        ];
        this.attendanceSessions = [
            { id: 'sess-1', facultyId: 'fac-1', subjectId: 'f1000000-0000-0000-0000-000000000001', sectionId: 'c1000000-0000-0000-0000-000000000001', date: '2026-06-18', status: 'completed', isSubstitute: false, startedAt: '2026-06-18T09:00:00Z', endedAt: '2026-06-18T09:50:00Z' },
            { id: 'sess-2', facultyId: 'fac-2', subjectId: 'f1000000-0000-0000-0000-000000000002', sectionId: 'c1000000-0000-0000-0000-000000000001', date: '2026-06-18', status: 'completed', isSubstitute: false, startedAt: '2026-06-18T10:00:00Z', endedAt: '2026-06-18T10:50:00Z' },
            { id: 'sess-3', facultyId: 'fac-3', subjectId: 'f1000000-0000-0000-0000-000000000005', sectionId: 'c1000000-0000-0000-0000-000000000003', date: '2026-06-18', status: 'active', isSubstitute: false, startedAt: '2026-06-18T11:00:00Z' },
        ];
        this.attendanceRecords = [
            { id: 'rec-1', sessionId: 'sess-1', studentId: 'stu-2', status: 'present', markedAt: '2026-06-18T09:05:00Z', markedBy: 'qr' },
            { id: 'rec-2', sessionId: 'sess-2', studentId: 'stu-2', status: 'present', markedAt: '2026-06-18T10:04:00Z', markedBy: 'qr' },
            { id: 'rec-3', sessionId: 'sess-3', studentId: 'stu-1', status: 'present', markedAt: '2026-06-18T11:05:00Z', markedBy: 'qr' },
            { id: 'rec-4', sessionId: 'sess-3', studentId: 'stu-3', status: 'present', markedAt: '2026-06-18T11:10:00Z', markedBy: 'qr' }
        ];
        this.substitutionRequests = [
            { id: 'subst-1', requestingFacultyId: 'fac-3', substituteFacultyId: 'fac-1', timetableEntryId: 'tt-3', date: '2026-06-20', reason: 'Medical leave', subjectOption: 'same_subject', status: 'pending', createdAt: '2026-06-18T08:00:00Z' },
            { id: 'subst-2', requestingFacultyId: 'fac-4', substituteFacultyId: 'fac-2', timetableEntryId: 'tt-6', date: '2026-06-19', reason: 'Conference attendance', subjectOption: 'different_subject', substituteSubjectId: 'f1000000-0000-0000-0000-000000000003', status: 'approved', approvedAt: '2026-06-18T10:00:00Z', createdAt: '2026-06-17T14:00:00Z' },
        ];
        this.systemSettings = {
            attendanceThreshold: 75,
            codeExpirySeconds: 30,
            sessionTimeoutMinutes: 120,
            allowLateMarking: true,
            lateThresholdMinutes: 15,
        };
    }
}
exports.MockStore = MockStore;
exports.store = new MockStore();

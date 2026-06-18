"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uuid_1 = require("uuid");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("../db");
const mockStore_1 = require("../mockStore");
const auth_1 = require("./auth");
const router = (0, express_1.Router)();
// Require admin role middleware
const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Admin access required' });
        return;
    }
    next();
};
router.use(auth_1.authenticateToken);
router.use(requireAdmin);
// ---- 1. Dashboard Stats ----
router.get('/dashboard', async (req, res) => {
    try {
        if ((0, db_1.isFallback)()) {
            const totalStudents = mockStore_1.store.studentProfiles.length;
            const totalFaculty = mockStore_1.store.facultyProfiles.length;
            const totalDepartments = mockStore_1.store.departments.length;
            const activeSessions = mockStore_1.store.attendanceSessions.filter(s => s.status === 'active').length;
            // Mock attendance stats
            res.json({
                success: true,
                data: {
                    totalStudents,
                    totalFaculty,
                    totalDepartments,
                    attendanceToday: 87,
                    activeSessions,
                    belowThreshold: 2,
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
                    ]
                }
            });
        }
        else {
            const studentsRes = await (0, db_1.query)('SELECT COUNT(*) FROM student_profiles');
            const facultyRes = await (0, db_1.query)('SELECT COUNT(*) FROM faculty_profiles');
            const deptRes = await (0, db_1.query)('SELECT COUNT(*) FROM departments');
            const sessionsRes = await (0, db_1.query)("SELECT COUNT(*) FROM attendance_sessions WHERE status = 'active'");
            res.json({
                success: true,
                data: {
                    totalStudents: parseInt(studentsRes.rows[0].count),
                    totalFaculty: parseInt(facultyRes.rows[0].count),
                    totalDepartments: parseInt(deptRes.rows[0].count),
                    attendanceToday: 87,
                    activeSessions: parseInt(sessionsRes.rows[0].count),
                    belowThreshold: 2,
                    recentAttendance: [
                        { date: '2026-06-15', percentage: 88 },
                        { date: '2026-06-16', percentage: 85 },
                        { date: '2026-06-17', percentage: 87 },
                        { date: '2026-06-18', percentage: 87 },
                    ],
                    departmentWise: [
                        { name: 'CSE', percentage: 89 },
                        { name: 'ME', percentage: 85 },
                        { name: 'ECE', percentage: 87 }
                    ]
                }
            });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats', error: error.message });
    }
});
// ---- 2. Departments CRUD ----
router.get('/departments', async (req, res) => {
    try {
        if ((0, db_1.isFallback)()) {
            res.json({ success: true, data: mockStore_1.store.departments });
        }
        else {
            const result = await (0, db_1.query)('SELECT * FROM departments ORDER BY name ASC');
            res.json({ success: true, data: result.rows });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post('/departments', async (req, res) => {
    const { name, code, description } = req.body;
    if (!name || !code) {
        res.status(400).json({ success: false, message: 'Name and code are required' });
        return;
    }
    try {
        const id = (0, uuid_1.v4)();
        const now = new Date().toISOString();
        if ((0, db_1.isFallback)()) {
            const newDept = { id, name, code, description, isActive: true, createdAt: now, updatedAt: now };
            mockStore_1.store.departments.push(newDept);
            res.json({ success: true, data: newDept });
        }
        else {
            const result = await (0, db_1.query)('INSERT INTO departments (id, name, code, description, is_active, created_at, updated_at) VALUES ($1, $2, $3, $4, true, $5, $5) RETURNING *', [id, name, code, description, now]);
            res.json({ success: true, data: result.rows[0] });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.put('/departments/:id', async (req, res) => {
    const { name, code, description, isActive } = req.body;
    const { id } = req.params;
    try {
        const now = new Date().toISOString();
        if ((0, db_1.isFallback)()) {
            const idx = mockStore_1.store.departments.findIndex(d => d.id === id);
            if (idx === -1) {
                res.status(404).json({ success: false, message: 'Department not found' });
                return;
            }
            const updated = { ...mockStore_1.store.departments[idx], name, code, description, isActive: isActive ?? true, updatedAt: now };
            mockStore_1.store.departments[idx] = updated;
            res.json({ success: true, data: updated });
        }
        else {
            const result = await (0, db_1.query)('UPDATE departments SET name = $1, code = $2, description = $3, is_active = $4, updated_at = $5 WHERE id = $6 RETURNING *', [name, code, description, isActive ?? true, now, id]);
            if (result.rows.length === 0) {
                res.status(404).json({ success: false, message: 'Department not found' });
                return;
            }
            res.json({ success: true, data: result.rows[0] });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.delete('/departments/:id', async (req, res) => {
    const { id } = req.params;
    try {
        if ((0, db_1.isFallback)()) {
            const idx = mockStore_1.store.departments.findIndex(d => d.id === id);
            if (idx === -1) {
                res.status(404).json({ success: false, message: 'Department not found' });
                return;
            }
            mockStore_1.store.departments.splice(idx, 1);
            res.json({ success: true, message: 'Department deleted' });
        }
        else {
            const result = await (0, db_1.query)('DELETE FROM departments WHERE id = $1 RETURNING *', [id]);
            if (result.rows.length === 0) {
                res.status(404).json({ success: false, message: 'Department not found' });
                return;
            }
            res.json({ success: true, message: 'Department deleted' });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// ---- 3. Subjects CRUD ----
router.get('/subjects', async (req, res) => {
    try {
        if ((0, db_1.isFallback)()) {
            res.json({ success: true, data: mockStore_1.store.subjects });
        }
        else {
            const result = await (0, db_1.query)('SELECT * FROM subjects ORDER BY code ASC');
            res.json({ success: true, data: result.rows });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post('/subjects', async (req, res) => {
    const { code, name, departmentId, semesterId, credits, type } = req.body;
    try {
        const id = (0, uuid_1.v4)();
        if ((0, db_1.isFallback)()) {
            const newSub = { id, code, name, departmentId, semesterId, credits, type, isActive: true };
            mockStore_1.store.subjects.push(newSub);
            res.json({ success: true, data: newSub });
        }
        else {
            const result = await (0, db_1.query)('INSERT INTO subjects (id, code, name, department_id, semester_id, credits, type, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, true) RETURNING *', [id, code, name, departmentId, semesterId, credits, type]);
            res.json({ success: true, data: result.rows[0] });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.put('/subjects/:id', async (req, res) => {
    const { code, name, departmentId, semesterId, credits, type, isActive } = req.body;
    const { id } = req.params;
    try {
        if ((0, db_1.isFallback)()) {
            const idx = mockStore_1.store.subjects.findIndex(s => s.id === id);
            if (idx === -1) {
                res.status(404).json({ success: false, message: 'Subject not found' });
                return;
            }
            const updated = { ...mockStore_1.store.subjects[idx], code, name, departmentId, semesterId, credits, type, isActive: isActive ?? true };
            mockStore_1.store.subjects[idx] = updated;
            res.json({ success: true, data: updated });
        }
        else {
            const result = await (0, db_1.query)('UPDATE subjects SET code = $1, name = $2, department_id = $3, semester_id = $4, credits = $5, type = $6, is_active = $7 WHERE id = $8 RETURNING *', [code, name, departmentId, semesterId, credits, type, isActive ?? true, id]);
            if (result.rows.length === 0) {
                res.status(404).json({ success: false, message: 'Subject not found' });
                return;
            }
            res.json({ success: true, data: result.rows[0] });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.delete('/subjects/:id', async (req, res) => {
    const { id } = req.params;
    try {
        if ((0, db_1.isFallback)()) {
            const idx = mockStore_1.store.subjects.findIndex(s => s.id === id);
            if (idx === -1) {
                res.status(404).json({ success: false, message: 'Subject not found' });
                return;
            }
            mockStore_1.store.subjects.splice(idx, 1);
            res.json({ success: true, message: 'Subject deleted' });
        }
        else {
            const result = await (0, db_1.query)('DELETE FROM subjects WHERE id = $1 RETURNING *', [id]);
            if (result.rows.length === 0) {
                res.status(404).json({ success: false, message: 'Subject not found' });
                return;
            }
            res.json({ success: true, message: 'Subject deleted' });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// ---- 4. Faculty Profile CRUD ----
router.get('/faculty', async (req, res) => {
    try {
        if ((0, db_1.isFallback)()) {
            // Map profile details with matching user details
            const list = mockStore_1.store.facultyProfiles.map(profile => {
                const user = mockStore_1.store.users.find(u => u.id === profile.userId);
                return { profile, user };
            });
            res.json({ success: true, data: list });
        }
        else {
            const result = await (0, db_1.query)(`
        SELECT fp.*, u.email, u.first_name, u.last_name, u.is_active, u.created_at
        FROM faculty_profiles fp
        JOIN users u ON fp.user_id = u.id
        ORDER BY u.first_name ASC
      `);
            const list = result.rows.map(row => ({
                profile: {
                    id: row.id,
                    userId: row.user_id,
                    facultyCode: row.faculty_code,
                    departmentId: row.department_id,
                    phone: row.phone,
                    designation: row.designation,
                    qualification: row.qualification,
                    joiningDate: row.joining_date,
                },
                user: {
                    id: row.user_id,
                    email: row.email,
                    role: 'faculty',
                    firstName: row.first_name,
                    lastName: row.last_name,
                    name: `${row.first_name} ${row.last_name}`,
                    isActive: row.is_active,
                    createdAt: row.created_at
                }
            }));
            res.json({ success: true, data: list });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post('/faculty', async (req, res) => {
    const { firstName, lastName, email, phone, facultyCode, departmentId, designation, qualification } = req.body;
    try {
        const userId = (0, uuid_1.v4)();
        const profileId = (0, uuid_1.v4)();
        const passwordHash = bcryptjs_1.default.hashSync('faculty123', 10);
        const now = new Date().toISOString();
        if ((0, db_1.isFallback)()) {
            const newUser = {
                id: userId,
                email,
                passwordHash,
                role: 'faculty',
                firstName,
                lastName,
                isActive: true,
                createdAt: now,
                updatedAt: now
            };
            const newProfile = {
                id: profileId,
                userId,
                facultyCode,
                departmentId,
                phone,
                designation,
                qualification,
                joiningDate: now.split('T')[0]
            };
            mockStore_1.store.users.push(newUser);
            mockStore_1.store.facultyProfiles.push(newProfile);
            res.json({
                success: true,
                data: {
                    profile: newProfile,
                    user: { ...newUser, name: `${firstName} ${lastName}` }
                }
            });
        }
        else {
            // Transaction setup
            await (0, db_1.query)('BEGIN');
            const userResult = await (0, db_1.query)('INSERT INTO users (id, email, password_hash, role, first_name, last_name, is_active, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, true, $7, $7) RETURNING *', [userId, email, passwordHash, 'faculty', firstName, lastName, now]);
            const profileResult = await (0, db_1.query)('INSERT INTO faculty_profiles (id, user_id, faculty_code, department_id, phone, designation, qualification, joining_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *', [profileId, userId, facultyCode, departmentId, phone, designation, qualification, now.split('T')[0]]);
            await (0, db_1.query)('COMMIT');
            res.json({
                success: true,
                data: {
                    profile: profileResult.rows[0],
                    user: { ...userResult.rows[0], name: `${firstName} ${lastName}` }
                }
            });
        }
    }
    catch (error) {
        if (!(0, db_1.isFallback)())
            await (0, db_1.query)('ROLLBACK');
        res.status(500).json({ success: false, error: error.message });
    }
});
// ---- 5. Student Profile CRUD ----
router.get('/students', async (req, res) => {
    try {
        if ((0, db_1.isFallback)()) {
            const list = mockStore_1.store.studentProfiles.map(profile => {
                const user = mockStore_1.store.users.find(u => u.id === profile.userId);
                return { profile, user };
            });
            res.json({ success: true, data: list });
        }
        else {
            const result = await (0, db_1.query)(`
        SELECT sp.*, u.email, u.first_name, u.last_name, u.is_active, u.created_at
        FROM student_profiles sp
        JOIN users u ON sp.user_id = u.id
        ORDER BY sp.roll_number ASC
      `);
            const list = result.rows.map(row => ({
                profile: {
                    id: row.id,
                    userId: row.user_id,
                    rollNumber: row.roll_number,
                    departmentId: row.department_id,
                    semesterId: row.semester_id,
                    sectionId: row.section_id,
                    phone: row.phone,
                    guardianName: row.guardian_name,
                    guardianPhone: row.guardian_phone,
                    admissionDate: row.admission_date
                },
                user: {
                    id: row.user_id,
                    email: row.email,
                    role: 'student',
                    firstName: row.first_name,
                    lastName: row.last_name,
                    name: `${row.first_name} ${row.last_name}`,
                    isActive: row.is_active,
                    createdAt: row.created_at
                }
            }));
            res.json({ success: true, data: list });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post('/students', async (req, res) => {
    const { firstName, lastName, email, phone, rollNumber, departmentId, semesterId, sectionId, guardianName, guardianPhone } = req.body;
    try {
        const userId = (0, uuid_1.v4)();
        const profileId = (0, uuid_1.v4)();
        const passwordHash = bcryptjs_1.default.hashSync('student123', 10);
        const now = new Date().toISOString();
        if ((0, db_1.isFallback)()) {
            const newUser = {
                id: userId,
                email,
                passwordHash,
                role: 'student',
                firstName,
                lastName,
                isActive: true,
                createdAt: now,
                updatedAt: now
            };
            const newProfile = {
                id: profileId,
                userId,
                rollNumber,
                departmentId,
                semesterId,
                sectionId,
                phone,
                guardianName,
                guardianPhone,
                admissionDate: now.split('T')[0]
            };
            mockStore_1.store.users.push(newUser);
            mockStore_1.store.studentProfiles.push(newProfile);
            res.json({
                success: true,
                data: {
                    profile: newProfile,
                    user: { ...newUser, name: `${firstName} ${lastName}` }
                }
            });
        }
        else {
            await (0, db_1.query)('BEGIN');
            const userResult = await (0, db_1.query)('INSERT INTO users (id, email, password_hash, role, first_name, last_name, is_active, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, true, $7, $7) RETURNING *', [userId, email, passwordHash, 'student', firstName, lastName, now]);
            const profileResult = await (0, db_1.query)('INSERT INTO student_profiles (id, user_id, roll_number, department_id, semester_id, section_id, phone, guardian_name, guardian_phone, admission_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *', [profileId, userId, rollNumber, departmentId, semesterId, sectionId, phone, guardianName, guardianPhone, now.split('T')[0]]);
            await (0, db_1.query)('COMMIT');
            res.json({
                success: true,
                data: {
                    profile: profileResult.rows[0],
                    user: { ...userResult.rows[0], name: `${firstName} ${lastName}` }
                }
            });
        }
    }
    catch (error) {
        if (!(0, db_1.isFallback)())
            await (0, db_1.query)('ROLLBACK');
        res.status(500).json({ success: false, error: error.message });
    }
});
// Bulk Import
router.post('/students/bulk-import', async (req, res) => {
    const { students } = req.body; // Array of students JSON
    if (!students || !Array.isArray(students)) {
        res.status(400).json({ success: false, message: 'Invalid students list' });
        return;
    }
    try {
        const importedList = [];
        const passwordHash = bcryptjs_1.default.hashSync('student123', 10);
        const now = new Date().toISOString();
        for (const std of students) {
            const userId = (0, uuid_1.v4)();
            const profileId = (0, uuid_1.v4)();
            if ((0, db_1.isFallback)()) {
                const newUser = {
                    id: userId,
                    email: std.email,
                    passwordHash,
                    role: 'student',
                    firstName: std.firstName,
                    lastName: std.lastName,
                    isActive: true,
                    createdAt: now,
                    updatedAt: now
                };
                const newProfile = {
                    id: profileId,
                    userId,
                    rollNumber: std.rollNumber,
                    departmentId: std.departmentId || mockStore_1.store.departments[0].id,
                    semesterId: std.semesterId || mockStore_1.store.semesters[0].id,
                    sectionId: std.sectionId || mockStore_1.store.sections[0].id,
                    phone: std.phone
                };
                mockStore_1.store.users.push(newUser);
                mockStore_1.store.studentProfiles.push(newProfile);
                importedList.push({ profile: newProfile, user: newUser });
            }
            else {
                await (0, db_1.query)('INSERT INTO users (id, email, password_hash, role, first_name, last_name, is_active, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, true, $7, $7)', [userId, std.email, passwordHash, 'student', std.firstName, std.lastName, now]);
                await (0, db_1.query)('INSERT INTO student_profiles (id, user_id, roll_number, department_id, semester_id, section_id, phone) VALUES ($1, $2, $3, $4, $5, $6, $7)', [profileId, userId, std.rollNumber, std.departmentId || 'd1000000-0000-0000-0000-000000000001', std.semesterId || 'e1000000-0000-0000-0000-000000000003', std.sectionId || 'c1000000-0000-0000-0000-000000000001', std.phone]);
            }
        }
        res.json({ success: true, count: students.length, message: `Successfully imported ${students.length} students` });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// ---- 6. Assignments CRUD ----
router.get('/assignments', async (req, res) => {
    try {
        if ((0, db_1.isFallback)()) {
            res.json({ success: true, data: mockStore_1.store.facultyAssignments });
        }
        else {
            const result = await (0, db_1.query)('SELECT * FROM faculty_assignments');
            res.json({ success: true, data: result.rows });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post('/assignments', async (req, res) => {
    const { facultyId, subjectId, sectionId } = req.body;
    try {
        const id = (0, uuid_1.v4)();
        if ((0, db_1.isFallback)()) {
            const newAssign = {
                id, facultyId, subjectId, sectionId, academicYearId: mockStore_1.store.academicYears[0].id, isActive: true
            };
            mockStore_1.store.facultyAssignments.push(newAssign);
            res.json({ success: true, data: newAssign });
        }
        else {
            const result = await (0, db_1.query)('INSERT INTO faculty_assignments (id, faculty_id, subject_id, section_id, academic_year_id, is_active) VALUES ($1, $2, $3, $4, (SELECT id FROM academic_years WHERE is_current = true LIMIT 1), true) RETURNING *', [id, facultyId, subjectId, sectionId]);
            res.json({ success: true, data: result.rows[0] });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.delete('/assignments/:id', async (req, res) => {
    const { id } = req.params;
    try {
        if ((0, db_1.isFallback)()) {
            const idx = mockStore_1.store.facultyAssignments.findIndex(a => a.id === id);
            if (idx === -1) {
                res.status(404).json({ success: false, message: 'Assignment not found' });
                return;
            }
            mockStore_1.store.facultyAssignments.splice(idx, 1);
            res.json({ success: true, message: 'Assignment deleted' });
        }
        else {
            const result = await (0, db_1.query)('DELETE FROM faculty_assignments WHERE id = $1 RETURNING *', [id]);
            if (result.rows.length === 0) {
                res.status(404).json({ success: false, message: 'Assignment not found' });
                return;
            }
            res.json({ success: true, message: 'Assignment deleted' });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// ---- 7. Timetable CRUD ----
router.get('/timetable', async (req, res) => {
    try {
        if ((0, db_1.isFallback)()) {
            res.json({ success: true, data: mockStore_1.store.timetable });
        }
        else {
            const result = await (0, db_1.query)('SELECT * FROM timetable_entries');
            res.json({ success: true, data: result.rows });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post('/timetable', async (req, res) => {
    const { day, startTime, endTime, facultyId, subjectId, sectionId, room } = req.body;
    try {
        const id = (0, uuid_1.v4)();
        if ((0, db_1.isFallback)()) {
            const newEntry = {
                id, day, startTime, endTime, facultyId, subjectId, sectionId, room, academicYearId: mockStore_1.store.academicYears[0].id, isActive: true
            };
            mockStore_1.store.timetable.push(newEntry);
            res.json({ success: true, data: newEntry });
        }
        else {
            const result = await (0, db_1.query)('INSERT INTO timetable_entries (id, day, start_time, end_time, faculty_id, subject_id, section_id, room, academic_year_id, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, (SELECT id FROM academic_years WHERE is_current = true LIMIT 1), true) RETURNING *', [id, day, startTime, endTime, facultyId, subjectId, sectionId, room]);
            res.json({ success: true, data: result.rows[0] });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.delete('/timetable/:id', async (req, res) => {
    const { id } = req.params;
    try {
        if ((0, db_1.isFallback)()) {
            const idx = mockStore_1.store.timetable.findIndex(t => t.id === id);
            if (idx === -1) {
                res.status(404).json({ success: false, message: 'Timetable entry not found' });
                return;
            }
            mockStore_1.store.timetable.splice(idx, 1);
            res.json({ success: true, message: 'Timetable entry deleted' });
        }
        else {
            const result = await (0, db_1.query)('DELETE FROM timetable_entries WHERE id = $1 RETURNING *', [id]);
            if (result.rows.length === 0) {
                res.status(404).json({ success: false, message: 'Timetable entry not found' });
                return;
            }
            res.json({ success: true, message: 'Timetable entry deleted' });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// ---- 8. Substitution Approval ----
router.get('/substitutions', async (req, res) => {
    try {
        if ((0, db_1.isFallback)()) {
            res.json({ success: true, data: mockStore_1.store.substitutionRequests });
        }
        else {
            const result = await (0, db_1.query)('SELECT * FROM substitution_requests ORDER BY created_at DESC');
            res.json({ success: true, data: result.rows });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.patch('/substitutions/:id', async (req, res) => {
    const { status, adminRemarks } = req.body;
    const { id } = req.params;
    try {
        const now = new Date().toISOString();
        if ((0, db_1.isFallback)()) {
            const idx = mockStore_1.store.substitutionRequests.findIndex(s => s.id === id);
            if (idx === -1) {
                res.status(404).json({ success: false, message: 'Substitution request not found' });
                return;
            }
            mockStore_1.store.substitutionRequests[idx].status = status;
            mockStore_1.store.substitutionRequests[idx].adminRemarks = adminRemarks;
            mockStore_1.store.substitutionRequests[idx].approvedBy = req.user?.id;
            mockStore_1.store.substitutionRequests[idx].approvedAt = now;
            // If approved, dynamically create a substitute session or mark timetable entry
            res.json({ success: true, data: mockStore_1.store.substitutionRequests[idx] });
        }
        else {
            const result = await (0, db_1.query)('UPDATE substitution_requests SET status = $1, admin_remarks = $2, approved_by = $3, approved_at = $4 WHERE id = $5 RETURNING *', [status, adminRemarks, req.user?.id, now, id]);
            if (result.rows.length === 0) {
                res.status(404).json({ success: false, message: 'Substitution request not found' });
                return;
            }
            res.json({ success: true, data: result.rows[0] });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// ---- 9. System Settings ----
router.get('/settings', async (req, res) => {
    try {
        if ((0, db_1.isFallback)()) {
            res.json({ success: true, data: mockStore_1.store.systemSettings });
        }
        else {
            const result = await (0, db_1.query)('SELECT * FROM system_settings');
            const settingsMap = {};
            result.rows.forEach(row => {
                const key = row.key.replace(/_([a-z])/g, (g) => g[1].toUpperCase()); // camelCase converter
                settingsMap[key] = row.value === 'true' ? true : (row.value === 'false' ? false : (isNaN(Number(row.value)) ? row.value : Number(row.value)));
            });
            res.json({ success: true, data: settingsMap });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.put('/settings', async (req, res) => {
    const settings = req.body;
    try {
        if ((0, db_1.isFallback)()) {
            mockStore_1.store.systemSettings = { ...mockStore_1.store.systemSettings, ...settings };
            res.json({ success: true, data: mockStore_1.store.systemSettings });
        }
        else {
            for (const [key, value] of Object.entries(settings)) {
                const dbKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`); // snake_case converter
                await (0, db_1.query)('INSERT INTO system_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2', [dbKey, String(value)]);
            }
            res.json({ success: true, data: settings });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.default = router;

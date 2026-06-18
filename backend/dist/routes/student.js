"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uuid_1 = require("uuid");
const db_1 = require("../db");
const mockStore_1 = require("../mockStore");
const auth_1 = require("./auth");
const router = (0, express_1.Router)();
// Require student role middleware
const requireStudent = (req, res, next) => {
    if (!req.user || req.user.role !== 'student') {
        res.status(403).json({ success: false, message: 'Student access required' });
        return;
    }
    next();
};
router.use(auth_1.authenticateToken);
router.use(requireStudent);
// ---- 1. Student Dashboard ----
router.get('/dashboard', async (req, res) => {
    const studentId = req.user?.profileId;
    if (!studentId) {
        res.status(400).json({ success: false, message: 'Student profile not found' });
        return;
    }
    try {
        if ((0, db_1.isFallback)()) {
            const profile = mockStore_1.store.studentProfiles.find(p => p.id === studentId);
            if (!profile) {
                res.status(404).json({ success: false, message: 'Student profile not found' });
                return;
            }
            // Filter subjects for the student's department and semester
            const subjects = mockStore_1.store.subjects.filter(s => s.departmentId === profile.departmentId && s.semesterId === profile.semesterId);
            const subjectWise = subjects.map(sub => {
                // Find all sessions for this subject and student's section
                const sessions = mockStore_1.store.attendanceSessions.filter(s => s.subjectId === sub.id && s.sectionId === profile.sectionId);
                const totalClasses = sessions.length || 10; // Fallback to 10 for visualization if new
                // Find how many the student attended
                const attendedRecords = mockStore_1.store.attendanceRecords.filter(r => r.studentId === studentId &&
                    r.status === 'present' &&
                    sessions.some(s => s.id === r.sessionId));
                const attended = sessions.length ? attendedRecords.length : 8; // Fallback for visualization
                const percentage = Math.round((attended / totalClasses) * 100);
                return {
                    subject: sub,
                    totalClasses,
                    attended,
                    percentage
                };
            });
            const overallAttendance = subjectWise.length
                ? Math.round(subjectWise.reduce((acc, curr) => acc + curr.percentage, 0) / subjectWise.length)
                : 85;
            const alerts = subjectWise
                .filter(sw => sw.percentage < mockStore_1.store.systemSettings.attendanceThreshold)
                .map(sw => ({
                subjectId: sw.subject.id,
                subjectName: sw.subject.name,
                currentPercentage: sw.percentage,
                requiredPercentage: mockStore_1.store.systemSettings.attendanceThreshold,
                classesNeeded: Math.max(1, Math.ceil((mockStore_1.store.systemSettings.attendanceThreshold * sw.totalClasses - 100 * sw.attended) / (100 - mockStore_1.store.systemSettings.attendanceThreshold)))
            }));
            res.json({
                success: true,
                data: {
                    overallAttendance,
                    subjectWise,
                    recentHistory: [],
                    alerts,
                    trend: [
                        { month: 'Jan', percentage: 88 },
                        { month: 'Feb', percentage: 85 },
                        { month: 'Mar', percentage: 82 },
                        { month: 'Apr', percentage: 80 },
                        { month: 'May', percentage: 83 },
                        { month: 'Jun', percentage: overallAttendance }
                    ]
                }
            });
        }
        else {
            // DB Queries
            const profileRes = await (0, db_1.query)('SELECT * FROM student_profiles WHERE id = $1', [studentId]);
            if (profileRes.rows.length === 0) {
                res.status(404).json({ success: false, message: 'Student profile not found' });
                return;
            }
            const profile = profileRes.rows[0];
            // Fetch subjects
            const subjectsRes = await (0, db_1.query)('SELECT * FROM subjects WHERE department_id = $1 AND semester_id = $2', [profile.department_id, profile.semester_id]);
            const subjects = subjectsRes.rows;
            const subjectWise = [];
            for (const sub of subjects) {
                const sessionsRes = await (0, db_1.query)('SELECT id FROM attendance_sessions WHERE subject_id = $1 AND section_id = $2', [sub.id, profile.section_id]);
                const sessions = sessionsRes.rows;
                const sessionIds = sessions.map(s => s.id);
                let attended = 0;
                if (sessionIds.length > 0) {
                    const attendedRes = await (0, db_1.query)('SELECT COUNT(*) FROM attendance_records WHERE student_id = $1 AND status = $2 AND session_id = ANY($3)', [studentId, 'present', sessionIds]);
                    attended = parseInt(attendedRes.rows[0].count);
                }
                const totalClasses = sessionIds.length || 10;
                const displayAttended = sessionIds.length ? attended : 8;
                const percentage = Math.round((displayAttended / totalClasses) * 100);
                subjectWise.push({
                    subject: {
                        id: sub.id,
                        code: sub.code,
                        name: sub.name,
                        credits: sub.credits,
                        type: sub.type,
                        isActive: sub.is_active
                    },
                    totalClasses,
                    attended: displayAttended,
                    percentage
                });
            }
            const overallAttendance = subjectWise.length
                ? Math.round(subjectWise.reduce((acc, curr) => acc + curr.percentage, 0) / subjectWise.length)
                : 85;
            res.json({
                success: true,
                data: {
                    overallAttendance,
                    subjectWise,
                    recentHistory: [],
                    alerts: [],
                    trend: []
                }
            });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// ---- 2. Mark Attendance ----
router.post('/attendance/mark', async (req, res) => {
    const studentId = req.user?.profileId;
    const { code, qrToken } = req.body;
    const targetCode = code || qrToken;
    if (!studentId || !targetCode) {
        res.status(400).json({ success: false, message: 'Code/Token and Student Profile are required' });
        return;
    }
    try {
        let activeSession = null;
        const now = new Date();
        if ((0, db_1.isFallback)()) {
            // Find active session matching code
            const session = mockStore_1.store.attendanceSessions.find(s => s.code === targetCode && s.status === 'active');
            if (session) {
                // Verify expiry
                const expiresAt = session.codeExpiresAt ? new Date(session.codeExpiresAt) : null;
                if (!expiresAt || now < expiresAt) {
                    activeSession = session;
                }
            }
        }
        else {
            const sessionRes = await (0, db_1.query)("SELECT * FROM attendance_sessions WHERE (code = $1 OR qr_token = $1) AND status = 'active'", [targetCode]);
            if (sessionRes.rows.length > 0) {
                const session = sessionRes.rows[0];
                const expiresAt = new Date(session.code_expires_at || session.qr_expires_at);
                if (now < expiresAt) {
                    activeSession = session;
                }
            }
        }
        if (!activeSession) {
            res.status(400).json({ success: false, message: 'Invalid or expired code. Please enter a fresh code.' });
            return;
        }
        // Verify student is enrolled in the target section
        let studentProfile = null;
        if ((0, db_1.isFallback)()) {
            studentProfile = mockStore_1.store.studentProfiles.find(p => p.id === studentId);
        }
        else {
            const spRes = await (0, db_1.query)('SELECT * FROM student_profiles WHERE id = $1', [studentId]);
            if (spRes.rows.length > 0) {
                studentProfile = spRes.rows[0];
            }
        }
        if (!studentProfile) {
            res.status(404).json({ success: false, message: 'Student profile not found' });
            return;
        }
        const sectionIdOfSession = activeSession.sectionId || activeSession.section_id;
        const studentSectionId = studentProfile.sectionId || studentProfile.section_id;
        if (sectionIdOfSession !== studentSectionId) {
            res.status(403).json({ success: false, message: 'You are not registered in the section scheduled for this class.' });
            return;
        }
        // Check if attendance already marked
        let existingRecord = false;
        if ((0, db_1.isFallback)()) {
            existingRecord = mockStore_1.store.attendanceRecords.some(r => r.sessionId === activeSession.id && r.studentId === studentId);
        }
        else {
            const recRes = await (0, db_1.query)('SELECT id FROM attendance_records WHERE session_id = $1 AND student_id = $2', [activeSession.id, studentId]);
            existingRecord = recRes.rows.length > 0;
        }
        if (existingRecord) {
            res.status(400).json({ success: false, message: 'Attendance already marked for this class session.' });
            return;
        }
        // Record attendance
        const recordId = (0, uuid_1.v4)();
        const markedAtStr = now.toISOString();
        if ((0, db_1.isFallback)()) {
            const newRecord = {
                id: recordId,
                sessionId: activeSession.id,
                studentId,
                status: 'present',
                markedAt: markedAtStr,
                markedBy: 'qr'
            };
            mockStore_1.store.attendanceRecords.push(newRecord);
        }
        else {
            await (0, db_1.query)("INSERT INTO attendance_records (id, session_id, student_id, status, marked_at, marked_by) VALUES ($1, $2, $3, 'present', $4, 'qr')", [recordId, activeSession.id, studentId, markedAtStr]);
        }
        // Emit socket event for real-time dashboard updates
        const io = req.app.get('io');
        if (io) {
            // Find student info (roll number and name) to display on faculty screen
            let studentName = 'Unknown Student';
            let rollNumber = 'UNKNOWN';
            if ((0, db_1.isFallback)()) {
                const profile = mockStore_1.store.studentProfiles.find(p => p.id === studentId);
                const user = profile ? mockStore_1.store.users.find(u => u.id === profile.userId) : null;
                if (user)
                    studentName = `${user.firstName} ${user.lastName}`;
                if (profile)
                    rollNumber = profile.rollNumber;
            }
            else {
                const studentInfoRes = await (0, db_1.query)('SELECT sp.roll_number, u.first_name, u.last_name FROM student_profiles sp JOIN users u ON sp.user_id = u.id WHERE sp.id = $1', [studentId]);
                if (studentInfoRes.rows.length > 0) {
                    const info = studentInfoRes.rows[0];
                    studentName = `${info.first_name} ${info.last_name}`;
                    rollNumber = info.roll_number;
                }
            }
            io.to(activeSession.id).emit('attendance_marked', {
                studentId,
                rollNumber,
                name: studentName,
                status: 'present',
                markedAt: markedAtStr
            });
        }
        res.json({
            success: true,
            message: 'Attendance marked successfully!',
            data: {
                attendanceId: recordId,
                markedAt: markedAtStr
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// ---- 3. Attendance History ----
router.get('/attendance/history', async (req, res) => {
    const studentId = req.user?.profileId;
    if (!studentId) {
        res.status(400).json({ success: false, message: 'Student profile not found' });
        return;
    }
    try {
        if ((0, db_1.isFallback)()) {
            const records = mockStore_1.store.attendanceRecords.filter(r => r.studentId === studentId);
            // Map sessions and subjects details
            const list = records.map(rec => {
                const session = mockStore_1.store.attendanceSessions.find(s => s.id === rec.sessionId);
                const subject = session ? mockStore_1.store.subjects.find(sub => sub.id === session.subjectId) : null;
                return {
                    ...rec,
                    session,
                    subject
                };
            });
            res.json({ success: true, data: list });
        }
        else {
            const result = await (0, db_1.query)(`SELECT ar.*, s.name as subject_name, s.code as subject_code, asess.date as session_date
         FROM attendance_records ar
         JOIN attendance_sessions asess ON ar.session_id = asess.id
         JOIN subjects s ON asess.subject_id = s.id
         WHERE ar.student_id = $1
         ORDER BY ar.marked_at DESC`, [studentId]);
            res.json({ success: true, data: result.rows });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.default = router;

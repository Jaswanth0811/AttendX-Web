"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uuid_1 = require("uuid");
const db_1 = require("../db");
const mockStore_1 = require("../mockStore");
const auth_1 = require("./auth");
const router = (0, express_1.Router)();
// Require faculty role middleware
const requireFaculty = (req, res, next) => {
    if (!req.user || req.user.role !== 'faculty') {
        res.status(403).json({ success: false, message: 'Faculty access required' });
        return;
    }
    next();
};
router.use(auth_1.authenticateToken);
router.use(requireFaculty);
// ---- 1. Faculty Dashboard ----
router.get('/dashboard', async (req, res) => {
    const facultyId = req.user?.profileId;
    if (!facultyId) {
        res.status(400).json({ success: false, message: 'Faculty profile not found' });
        return;
    }
    try {
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const currentDayName = days[new Date().getDay()];
        if ((0, db_1.isFallback)()) {
            const todaysClasses = mockStore_1.store.timetable.filter(t => t.facultyId === facultyId && t.day === currentDayName);
            const recentSessions = mockStore_1.store.attendanceSessions.filter(s => s.facultyId === facultyId);
            const stats = {
                totalSessions: recentSessions.length,
                avgAttendance: 85,
                classesToday: todaysClasses.length
            };
            res.json({
                success: true,
                data: {
                    todaysClasses,
                    recentSessions,
                    substituteClasses: [],
                    stats
                }
            });
        }
        else {
            // DB Queries
            const classesRes = await (0, db_1.query)('SELECT * FROM timetable_entries WHERE faculty_id = $1 AND day = $2 AND is_active = true', [facultyId, currentDayName]);
            const sessionsRes = await (0, db_1.query)('SELECT * FROM attendance_sessions WHERE faculty_id = $1 ORDER BY started_at DESC LIMIT 5', [facultyId]);
            const totalSessionsRes = await (0, db_1.query)('SELECT COUNT(*) FROM attendance_sessions WHERE faculty_id = $1', [facultyId]);
            res.json({
                success: true,
                data: {
                    todaysClasses: classesRes.rows,
                    recentSessions: sessionsRes.rows,
                    substituteClasses: [],
                    stats: {
                        totalSessions: parseInt(totalSessionsRes.rows[0].count),
                        avgAttendance: 85,
                        classesToday: classesRes.rows.length
                    }
                }
            });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// Helper to generate a 6-digit random alphanumeric code
function generate6DigitCode() {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}
// ---- 2. Attendance Sessions ----
// Start Session
router.post('/sessions', async (req, res) => {
    const facultyId = req.user?.profileId;
    const { timetableEntryId, subjectId, sectionId, isSubstitute, originalFacultyId } = req.body;
    if (!facultyId || !subjectId || !sectionId) {
        res.status(400).json({ success: false, message: 'Subject, section, and faculty profile are required' });
        return;
    }
    try {
        const id = (0, uuid_1.v4)();
        const codeVal = generate6DigitCode();
        const now = new Date();
        // Get expiry seconds from settings
        let expirySeconds = 30;
        if ((0, db_1.isFallback)()) {
            expirySeconds = mockStore_1.store.systemSettings.codeExpirySeconds || 30;
        }
        else {
            const settingsRes = await (0, db_1.query)("SELECT value FROM system_settings WHERE key = 'code_expiry_seconds'");
            if (settingsRes.rows.length > 0) {
                expirySeconds = parseInt(settingsRes.rows[0].value) || 30;
            }
        }
        const expiresAt = new Date(now.getTime() + expirySeconds * 1000);
        const dateStr = now.toISOString().split('T')[0];
        if ((0, db_1.isFallback)()) {
            const newSession = {
                id,
                facultyId,
                subjectId,
                sectionId,
                timetableEntryId,
                date: dateStr,
                code: codeVal,
                codeGeneratedAt: now.toISOString(),
                codeExpiresAt: expiresAt.toISOString(),
                status: 'active',
                isSubstitute: isSubstitute ?? false,
                originalFacultyId,
                startedAt: now.toISOString()
            };
            mockStore_1.store.attendanceSessions.push(newSession);
            res.json({ success: true, data: newSession });
        }
        else {
            const result = await (0, db_1.query)(`INSERT INTO attendance_sessions 
        (id, faculty_id, subject_id, section_id, timetable_entry_id, date, code, code_generated_at, code_expires_at, status, is_substitute, original_faculty_id, started_at) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'active', $10, $11, $8) RETURNING *`, [id, facultyId, subjectId, sectionId, timetableEntryId, dateStr, codeVal, now.toISOString(), expiresAt.toISOString(), isSubstitute ?? false, originalFacultyId]);
            res.json({ success: true, data: result.rows[0] });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// Regenerate Code (Supports both /qr and /code routes for safety)
router.post(['/sessions/:id/qr', '/sessions/:id/code'], async (req, res) => {
    const { id } = req.params;
    try {
        const codeVal = generate6DigitCode();
        const now = new Date();
        // Get expiry seconds from settings
        let expirySeconds = 30;
        if ((0, db_1.isFallback)()) {
            expirySeconds = mockStore_1.store.systemSettings.codeExpirySeconds || 30;
        }
        else {
            const settingsRes = await (0, db_1.query)("SELECT value FROM system_settings WHERE key = 'code_expiry_seconds'");
            if (settingsRes.rows.length > 0) {
                expirySeconds = parseInt(settingsRes.rows[0].value) || 30;
            }
        }
        const expiresAt = new Date(now.getTime() + expirySeconds * 1000);
        if ((0, db_1.isFallback)()) {
            const idx = mockStore_1.store.attendanceSessions.findIndex(s => s.id === id);
            if (idx === -1) {
                res.status(404).json({ success: false, message: 'Session not found' });
                return;
            }
            mockStore_1.store.attendanceSessions[idx].code = codeVal;
            mockStore_1.store.attendanceSessions[idx].codeGeneratedAt = now.toISOString();
            mockStore_1.store.attendanceSessions[idx].codeExpiresAt = expiresAt.toISOString();
            res.json({
                success: true,
                data: {
                    sessionId: id,
                    token: codeVal, // alias
                    code: codeVal,
                    expiresAt: expiresAt.getTime()
                }
            });
        }
        else {
            const result = await (0, db_1.query)('UPDATE attendance_sessions SET code = $1, code_generated_at = $2, code_expires_at = $3 WHERE id = $4 RETURNING *', [codeVal, now.toISOString(), expiresAt.toISOString(), id]);
            if (result.rows.length === 0) {
                res.status(404).json({ success: false, message: 'Session not found' });
                return;
            }
            res.json({
                success: true,
                data: {
                    sessionId: id,
                    token: codeVal, // alias
                    code: codeVal,
                    expiresAt: expiresAt.getTime()
                }
            });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// End Session / Finalize
router.patch('/sessions/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // usually 'completed' or 'cancelled'
    try {
        const now = new Date().toISOString();
        if ((0, db_1.isFallback)()) {
            const idx = mockStore_1.store.attendanceSessions.findIndex(s => s.id === id);
            if (idx === -1) {
                res.status(404).json({ success: false, message: 'Session not found' });
                return;
            }
            mockStore_1.store.attendanceSessions[idx].status = status || 'completed';
            mockStore_1.store.attendanceSessions[idx].endedAt = now;
            res.json({ success: true, data: mockStore_1.store.attendanceSessions[idx] });
        }
        else {
            const result = await (0, db_1.query)('UPDATE attendance_sessions SET status = $1, ended_at = $2 WHERE id = $3 RETURNING *', [status || 'completed', now, id]);
            if (result.rows.length === 0) {
                res.status(404).json({ success: false, message: 'Session not found' });
                return;
            }
            res.json({ success: true, data: result.rows[0] });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// ---- 3. Substitutions Request ----
// Submit substitution request
router.post('/substitutions', async (req, res) => {
    const facultyId = req.user?.profileId;
    const { substituteFacultyId, timetableEntryId, date, reason, subjectOption, substituteSubjectId } = req.body;
    if (!facultyId || !substituteFacultyId || !timetableEntryId || !date) {
        res.status(400).json({ success: false, message: 'Missing required substitution details' });
        return;
    }
    try {
        const id = (0, uuid_1.v4)();
        const now = new Date().toISOString();
        if ((0, db_1.isFallback)()) {
            const newRequest = {
                id,
                requestingFacultyId: facultyId,
                substituteFacultyId,
                timetableEntryId,
                date,
                reason,
                subjectOption: subjectOption || 'same_subject',
                substituteSubjectId,
                status: 'pending',
                createdAt: now
            };
            mockStore_1.store.substitutionRequests.push(newRequest);
            res.json({ success: true, data: newRequest });
        }
        else {
            const result = await (0, db_1.query)(`INSERT INTO substitution_requests 
        (id, requesting_faculty_id, substitute_faculty_id, timetable_entry_id, date, reason, subject_option, substitute_subject_id, status, created_at) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', $9) RETURNING *`, [id, facultyId, substituteFacultyId, timetableEntryId, date, reason, subjectOption || 'same_subject', substituteSubjectId, now]);
            res.json({ success: true, data: result.rows[0] });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// Get Faculty requests history
router.get('/substitutions', async (req, res) => {
    const facultyId = req.user?.profileId;
    if (!facultyId) {
        res.status(400).json({ success: false, message: 'Faculty profile not found' });
        return;
    }
    try {
        if ((0, db_1.isFallback)()) {
            const list = mockStore_1.store.substitutionRequests.filter(s => s.requestingFacultyId === facultyId || s.substituteFacultyId === facultyId);
            res.json({ success: true, data: list });
        }
        else {
            const result = await (0, db_1.query)('SELECT * FROM substitution_requests WHERE requesting_faculty_id = $1 OR substitute_faculty_id = $1 ORDER BY created_at DESC', [facultyId]);
            res.json({ success: true, data: result.rows });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// ---- 4. Reports ----
router.get('/reports', async (req, res) => {
    const facultyId = req.user?.profileId;
    if (!facultyId) {
        res.status(400).json({ success: false, message: 'Faculty profile not found' });
        return;
    }
    // Simulated report payload
    res.json({
        success: true,
        data: {
            averageAttendance: 85,
            totalClassesConducted: 42,
            belowThresholdStudents: 4,
            attendanceTrend: [
                { date: '2026-06-12', percentage: 80 },
                { date: '2026-06-13', percentage: 85 },
                { date: '2026-06-15', percentage: 89 },
                { date: '2026-06-18', percentage: 87 }
            ]
        }
    });
});
exports.default = router;

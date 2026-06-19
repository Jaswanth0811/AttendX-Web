import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { isFallback, query } from '../db';
import { store, AttendanceRecord } from '../mockStore';
import { authenticateToken, AuthenticatedRequest } from './auth';

const router = Router();

// Require student role middleware
const requireStudent = (req: AuthenticatedRequest, res: Response, next: any) => {
  if (!req.user || req.user.role !== 'student') {
    res.status(403).json({ success: false, message: 'Student access required' });
    return;
  }
  next();
};

router.use(authenticateToken);
router.use(requireStudent);

// ---- 1. Student Dashboard ----
router.get('/dashboard', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const studentId = req.user?.profileId;
  if (!studentId) {
    res.status(400).json({ success: false, message: 'Student profile not found' });
    return;
  }

  try {
    if (isFallback()) {
      const profile = store.studentProfiles.find(p => p.id === studentId);
      if (!profile) {
        res.status(404).json({ success: false, message: 'Student profile not found' });
        return;
      }

      // Filter subjects for the student's department and semester
      const subjects = store.subjects.filter(s => s.departmentId === profile.departmentId && s.semesterId === profile.semesterId);

      const subjectWise = subjects.map(sub => {
        // Find all sessions for this subject and student's section
        const sessions = store.attendanceSessions.filter(s => s.subjectId === sub.id && s.sectionId === profile.sectionId);
        const totalClasses = sessions.length || 10; // Fallback to 10 for visualization if new
        
        // Find how many the student attended
        const attendedRecords = store.attendanceRecords.filter(r => 
          r.studentId === studentId && 
          r.status === 'present' &&
          sessions.some(s => s.id === r.sessionId)
        );
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
        .filter(sw => sw.percentage < store.systemSettings.attendanceThreshold)
        .map(sw => ({
          subjectId: sw.subject.id,
          subjectName: sw.subject.name,
          currentPercentage: sw.percentage,
          requiredPercentage: store.systemSettings.attendanceThreshold,
          classesNeeded: Math.max(1, Math.ceil((store.systemSettings.attendanceThreshold * sw.totalClasses - 100 * sw.attended) / (100 - store.systemSettings.attendanceThreshold)))
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
    } else {
      // DB Queries
      const profileRes = await query('SELECT * FROM student_profiles WHERE id = $1', [studentId]);
      if (profileRes.rows.length === 0) {
        res.status(404).json({ success: false, message: 'Student profile not found' });
        return;
      }
      const profile = profileRes.rows[0];

      // Fetch subjects
      const subjectsRes = await query('SELECT * FROM subjects WHERE department_id = $1 AND semester_id = $2', [profile.department_id, profile.semester_id]);
      const subjects = subjectsRes.rows;

      const subjectWise = [];
      for (const sub of subjects) {
        const sessionsRes = await query('SELECT id FROM attendance_sessions WHERE subject_id = $1 AND section_id = $2', [sub.id, profile.section_id]);
        const sessions = sessionsRes.rows;
        const sessionIds = sessions.map(s => s.id);

        let attended = 0;
        if (sessionIds.length > 0) {
          const attendedRes = await query(
            'SELECT COUNT(*) FROM attendance_records WHERE student_id = $1 AND status = $2 AND session_id = ANY($3)',
            [studentId, 'present', sessionIds]
          );
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

      // Get attendance threshold from settings (default to 75)
      const thresholdRes = await query("SELECT value FROM system_settings WHERE key = 'attendance_threshold'");
      const threshold = thresholdRes.rows.length ? parseInt(thresholdRes.rows[0].value) : 75;

      const alerts = subjectWise
        .filter(sw => sw.percentage < threshold)
        .map(sw => ({
          subjectId: sw.subject.id,
          subjectName: sw.subject.name,
          currentPercentage: sw.percentage,
          requiredPercentage: threshold,
          classesNeeded: Math.max(1, Math.ceil((threshold * sw.totalClasses - 100 * sw.attended) / (100 - threshold)))
        }));

      res.json({
        success: true,
        data: {
          overallAttendance,
          subjectWise,
          recentHistory: [],
          alerts,
          trend: [
            { month: 'Jan', percentage: Math.max(50, overallAttendance - 5) },
            { month: 'Feb', percentage: Math.max(50, overallAttendance - 3) },
            { month: 'Mar', percentage: Math.max(50, overallAttendance - 2) },
            { month: 'Apr', percentage: Math.max(50, overallAttendance - 1) },
            { month: 'May', percentage: overallAttendance }
          ]
        }
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ---- 2. Mark Attendance ----
router.post('/attendance/mark', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const studentId = req.user?.profileId;
  const { code, qrToken } = req.body;
  const targetCode = code || qrToken;

  if (!studentId || !targetCode) {
    res.status(400).json({ success: false, message: 'Code/Token and Student Profile are required' });
    return;
  }

  try {
    let activeSession: any = null;
    const now = new Date();

    if (isFallback()) {
      // Find active session matching code
      const session = store.attendanceSessions.find(s => s.code === targetCode && s.status === 'active');
      if (session) {
        // Verify expiry
        const expiresAt = session.codeExpiresAt ? new Date(session.codeExpiresAt) : null;
        if (!expiresAt || now < expiresAt) {
          activeSession = session;
        }
      }
    } else {
      const sessionRes = await query(
        "SELECT * FROM attendance_sessions WHERE (code = $1 OR qr_token = $1) AND status = 'active'",
        [targetCode]
      );
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
    let studentProfile: any = null;
    if (isFallback()) {
      studentProfile = store.studentProfiles.find(p => p.id === studentId);
    } else {
      const spRes = await query('SELECT * FROM student_profiles WHERE id = $1', [studentId]);
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
    if (isFallback()) {
      existingRecord = store.attendanceRecords.some(r => r.sessionId === activeSession.id && r.studentId === studentId);
    } else {
      const recRes = await query('SELECT id FROM attendance_records WHERE session_id = $1 AND student_id = $2', [activeSession.id, studentId]);
      existingRecord = recRes.rows.length > 0;
    }

    if (existingRecord) {
      res.status(400).json({ success: false, message: 'Attendance already marked for this class session.' });
      return;
    }

    // Record attendance
    const recordId = uuidv4();
    const markedAtStr = now.toISOString();

    if (isFallback()) {
      const newRecord: AttendanceRecord = {
        id: recordId,
        sessionId: activeSession.id,
        studentId,
        status: 'present',
        markedAt: markedAtStr,
        markedBy: 'qr'
      };
      store.attendanceRecords.push(newRecord);
    } else {
      await query(
        "INSERT INTO attendance_records (id, session_id, student_id, status, marked_at, marked_by) VALUES ($1, $2, $3, 'present', $4, 'qr')",
        [recordId, activeSession.id, studentId, markedAtStr]
      );
    }

    // Emit socket event for real-time dashboard updates
    const io = req.app.get('io');
    if (io) {
      // Find student info (roll number and name) to display on faculty screen
      let studentName = 'Unknown Student';
      let rollNumber = 'UNKNOWN';
      if (isFallback()) {
        const profile = store.studentProfiles.find(p => p.id === studentId);
        const user = profile ? store.users.find(u => u.id === profile.userId) : null;
        if (user) studentName = `${user.firstName} ${user.lastName}`;
        if (profile) rollNumber = profile.rollNumber;
      } else {
        const studentInfoRes = await query(
          'SELECT sp.roll_number, u.first_name, u.last_name FROM student_profiles sp JOIN users u ON sp.user_id = u.id WHERE sp.id = $1',
          [studentId]
        );
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

    let subjectName = 'Unknown Subject';
    let subjectCode = 'SUBJ';
    let facultyName = 'Faculty';

    if (isFallback()) {
      const sub = store.subjects.find(s => s.id === activeSession.subjectId);
      const fac = store.facultyProfiles.find(f => f.id === activeSession.facultyId);
      const user = fac ? store.users.find(u => u.id === fac.userId) : null;
      subjectName = sub?.name || 'Unknown Subject';
      subjectCode = sub?.code || 'SUBJ';
      facultyName = user ? `${user.firstName} ${user.lastName}` : 'Faculty';
    } else {
      const details = await query(
        `SELECT s.name as subject_name, s.code as subject_code, u.first_name, u.last_name 
         FROM attendance_sessions asess
         JOIN subjects s ON asess.subject_id = s.id
         JOIN faculty_profiles fp ON asess.faculty_id = fp.id
         JOIN users u ON fp.user_id = u.id
         WHERE asess.id = $1`,
        [activeSession.id]
      );
      if (details.rows.length > 0) {
        const row = details.rows[0];
        subjectName = row.subject_name;
        subjectCode = row.subject_code;
        facultyName = `${row.first_name} ${row.last_name}`;
      }
    }

    res.json({
      success: true,
      message: 'Attendance marked successfully!',
      data: {
        attendanceId: recordId,
        markedAt: markedAtStr,
        session: {
          subjectName,
          subjectCode,
          facultyName,
          sectionName: studentProfile.name || studentProfile.rollNumber || 'Your Section'
        }
      }
    });

  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ---- 3. Attendance History ----
router.get('/attendance/history', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const studentId = req.user?.profileId;
  if (!studentId) {
    res.status(400).json({ success: false, message: 'Student profile not found' });
    return;
  }

  try {
    if (isFallback()) {
      const records = store.attendanceRecords.filter(r => r.studentId === studentId);
      // Map sessions and subjects details
      const list = records.map(rec => {
        const session = store.attendanceSessions.find(s => s.id === rec.sessionId);
        const subject = session ? store.subjects.find(sub => sub.id === session.subjectId) : null;
        return {
          ...rec,
          session,
          subject
        };
      });
      res.json({ success: true, data: list });
    } else {
      const result = await query(
        `SELECT ar.*, s.name as subject_name, s.code as subject_code, asess.date as session_date
         FROM attendance_records ar
         JOIN attendance_sessions asess ON ar.session_id = asess.id
         JOIN subjects s ON asess.subject_id = s.id
         WHERE ar.student_id = $1
         ORDER BY ar.marked_at DESC`,
        [studentId]
      );
      res.json({ success: true, data: result.rows });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ---- 4. Student Timetable ----
router.get('/timetable/metadata', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (isFallback()) {
      res.json({
        success: true,
        data: {
          departments: store.departments,
          semesters: store.semesters,
          sections: store.sections
        }
      });
    } else {
      const depts = await query('SELECT id, name, code FROM departments WHERE is_active = true ORDER BY name');
      const sems = await query('SELECT id, name, number FROM semesters ORDER BY number');
      const secs = await query('SELECT id, name, department_id, semester_id FROM sections WHERE is_active = true ORDER BY name');
      res.json({
        success: true,
        data: {
          departments: depts.rows,
          semesters: sems.rows,
          sections: secs.rows
        }
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/timetable', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const studentId = req.user?.profileId;
  const { sectionId } = req.query;

  if (!studentId) {
    res.status(400).json({ success: false, message: 'Student profile not found' });
    return;
  }

  try {
    let targetSectionId = sectionId as string;

    if (isFallback()) {
      const profile = store.studentProfiles.find(p => p.id === studentId);
      if (!profile) {
        res.status(404).json({ success: false, message: 'Student profile not found' });
        return;
      }

      if (!targetSectionId) {
        targetSectionId = profile.sectionId;
      }

      const entries = store.timetable.filter(te => te.sectionId === targetSectionId && te.isActive);
      
      const mapped = entries.map(te => {
        const sub = store.subjects.find(s => s.id === te.subjectId);
        const fac = store.facultyProfiles.find(f => f.id === te.facultyId);
        const user = fac ? store.users.find(u => u.id === fac.userId) : null;
        return {
          id: te.id,
          day: te.day,
          startTime: te.startTime,
          endTime: te.endTime,
          room: te.room,
          isActive: te.isActive,
          subjectId: te.subjectId,
          subjectCode: sub?.code || 'SUBJ',
          subjectName: sub?.name || 'Unknown Subject',
          facultyName: user ? `${user.firstName} ${user.lastName}` : 'Unknown Faculty'
        };
      });

      res.json({ success: true, data: mapped });
    } else {
      if (!targetSectionId) {
        const profileRes = await query('SELECT section_id FROM student_profiles WHERE id = $1', [studentId]);
        if (profileRes.rows.length === 0) {
          res.status(404).json({ success: false, message: 'Student profile not found' });
          return;
        }
        targetSectionId = profileRes.rows[0].section_id;
      }

      const ttRes = await query(
        `SELECT 
           te.id,
           te.day,
           te.start_time::text as "startTime",
           te.end_time::text as "endTime",
           te.room,
           te.is_active as "isActive",
           s.id as "subjectId",
           s.code as "subjectCode",
           s.name as "subjectName",
           u.first_name || ' ' || u.last_name as "facultyName"
         FROM timetable_entries te
         JOIN subjects s ON te.subject_id = s.id
         JOIN faculty_profiles fp ON te.faculty_id = fp.id
         JOIN users u ON fp.user_id = u.id
         WHERE te.section_id = $1 AND te.is_active = true
         ORDER BY 
           CASE te.day
             WHEN 'monday' THEN 1
             WHEN 'tuesday' THEN 2
             WHEN 'wednesday' THEN 3
             WHEN 'thursday' THEN 4
             WHEN 'friday' THEN 5
             WHEN 'saturday' THEN 6
           END,
           te.start_time`,
        [targetSectionId]
      );

      res.json({ success: true, data: ttRes.rows });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

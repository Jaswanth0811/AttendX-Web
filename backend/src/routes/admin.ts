import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { isFallback, query } from '../db';
import { store, Department, Subject, FacultyProfile, StudentProfile, User, TimetableEntry, SubstitutionRequest, FacultyAssignment } from '../mockStore';
import { authenticateToken, AuthenticatedRequest } from './auth';

const router = Router();

// Require admin role middleware
const requireAdmin = (req: AuthenticatedRequest, res: Response, next: any) => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ success: false, message: 'Admin access required' });
    return;
  }
  next();
};

router.use(authenticateToken);
router.use(requireAdmin);

// ---- 1. Dashboard Stats ----
router.get('/dashboard', async (req: Request, res: Response): Promise<void> => {
  try {
    if (isFallback()) {
      const totalStudents = store.studentProfiles.length;
      const totalFaculty = store.facultyProfiles.length;
      const totalDepartments = store.departments.length;
      const activeSessions = store.attendanceSessions.filter(s => s.status === 'active').length;

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
    } else {
      const studentsRes = await query('SELECT COUNT(*) FROM student_profiles');
      const facultyRes = await query('SELECT COUNT(*) FROM faculty_profiles');
      const deptRes = await query('SELECT COUNT(*) FROM departments');
      const sessionsRes = await query("SELECT COUNT(*) FROM attendance_sessions WHERE status = 'active'");

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
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats', error: error.message });
  }
});

// ---- 2. Departments CRUD ----
router.get('/departments', async (req: Request, res: Response): Promise<void> => {
  try {
    if (isFallback()) {
      res.json({ success: true, data: store.departments });
    } else {
      const result = await query('SELECT * FROM departments ORDER BY name ASC');
      res.json({ success: true, data: result.rows });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/departments', async (req: Request, res: Response): Promise<void> => {
  const { name, code, description } = req.body;
  if (!name || !code) {
    res.status(400).json({ success: false, message: 'Name and code are required' });
    return;
  }
  try {
    const id = uuidv4();
    const now = new Date().toISOString();
    if (isFallback()) {
      const newDept: Department = { id, name, code, description, isActive: true, createdAt: now, updatedAt: now };
      store.departments.push(newDept);
      res.json({ success: true, data: newDept });
    } else {
      const result = await query(
        'INSERT INTO departments (id, name, code, description, is_active, created_at, updated_at) VALUES ($1, $2, $3, $4, true, $5, $5) RETURNING *',
        [id, name, code, description, now]
      );
      res.json({ success: true, data: result.rows[0] });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/departments/:id', async (req: Request, res: Response): Promise<void> => {
  const { name, code, description, isActive } = req.body;
  const { id } = req.params;
  try {
    const now = new Date().toISOString();
    if (isFallback()) {
      const idx = store.departments.findIndex(d => d.id === id);
      if (idx === -1) {
        res.status(404).json({ success: false, message: 'Department not found' });
        return;
      }
      const updated = { ...store.departments[idx], name, code, description, isActive: isActive ?? true, updatedAt: now };
      store.departments[idx] = updated;
      res.json({ success: true, data: updated });
    } else {
      const result = await query(
        'UPDATE departments SET name = $1, code = $2, description = $3, is_active = $4, updated_at = $5 WHERE id = $6 RETURNING *',
        [name, code, description, isActive ?? true, now, id]
      );
      if (result.rows.length === 0) {
        res.status(404).json({ success: false, message: 'Department not found' });
        return;
      }
      res.json({ success: true, data: result.rows[0] });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/departments/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    if (isFallback()) {
      const idx = store.departments.findIndex(d => d.id === id);
      if (idx === -1) {
        res.status(404).json({ success: false, message: 'Department not found' });
        return;
      }
      store.departments.splice(idx, 1);
      res.json({ success: true, message: 'Department deleted' });
    } else {
      const result = await query('DELETE FROM departments WHERE id = $1 RETURNING *', [id]);
      if (result.rows.length === 0) {
        res.status(404).json({ success: false, message: 'Department not found' });
        return;
      }
      res.json({ success: true, message: 'Department deleted' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ---- 3. Subjects CRUD ----
router.get('/subjects', async (req: Request, res: Response): Promise<void> => {
  try {
    if (isFallback()) {
      res.json({ success: true, data: store.subjects });
    } else {
      const result = await query('SELECT * FROM subjects ORDER BY code ASC');
      res.json({ success: true, data: result.rows });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/subjects', async (req: Request, res: Response): Promise<void> => {
  const { code, name, departmentId, semesterId, credits, type } = req.body;
  try {
    const id = uuidv4();
    if (isFallback()) {
      const newSub: Subject = { id, code, name, departmentId, semesterId, credits, type, isActive: true };
      store.subjects.push(newSub);
      res.json({ success: true, data: newSub });
    } else {
      const result = await query(
        'INSERT INTO subjects (id, code, name, department_id, semester_id, credits, type, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, true) RETURNING *',
        [id, code, name, departmentId, semesterId, credits, type]
      );
      res.json({ success: true, data: result.rows[0] });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/subjects/:id', async (req: Request, res: Response): Promise<void> => {
  const { code, name, departmentId, semesterId, credits, type, isActive } = req.body;
  const { id } = req.params;
  try {
    if (isFallback()) {
      const idx = store.subjects.findIndex(s => s.id === id);
      if (idx === -1) {
        res.status(404).json({ success: false, message: 'Subject not found' });
        return;
      }
      const updated = { ...store.subjects[idx], code, name, departmentId, semesterId, credits, type, isActive: isActive ?? true };
      store.subjects[idx] = updated;
      res.json({ success: true, data: updated });
    } else {
      const result = await query(
        'UPDATE subjects SET code = $1, name = $2, department_id = $3, semester_id = $4, credits = $5, type = $6, is_active = $7 WHERE id = $8 RETURNING *',
        [code, name, departmentId, semesterId, credits, type, isActive ?? true, id]
      );
      if (result.rows.length === 0) {
        res.status(404).json({ success: false, message: 'Subject not found' });
        return;
      }
      res.json({ success: true, data: result.rows[0] });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/subjects/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    if (isFallback()) {
      const idx = store.subjects.findIndex(s => s.id === id);
      if (idx === -1) {
        res.status(404).json({ success: false, message: 'Subject not found' });
        return;
      }
      store.subjects.splice(idx, 1);
      res.json({ success: true, message: 'Subject deleted' });
    } else {
      const result = await query('DELETE FROM subjects WHERE id = $1 RETURNING *', [id]);
      if (result.rows.length === 0) {
        res.status(404).json({ success: false, message: 'Subject not found' });
        return;
      }
      res.json({ success: true, message: 'Subject deleted' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ---- 4. Faculty Profile CRUD ----
router.get('/faculty', async (req: Request, res: Response): Promise<void> => {
  try {
    if (isFallback()) {
      // Map profile details with matching user details
      const list = store.facultyProfiles.map(profile => {
        const user = store.users.find(u => u.id === profile.userId);
        return { profile, user };
      });
      res.json({ success: true, data: list });
    } else {
      const result = await query(`
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
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/faculty', async (req: Request, res: Response): Promise<void> => {
  const { firstName, lastName, email, phone, facultyCode, departmentId, designation, qualification } = req.body;
  try {
    const userId = uuidv4();
    const profileId = uuidv4();
    const passwordHash = bcrypt.hashSync('faculty123', 10);
    const now = new Date().toISOString();

    if (isFallback()) {
      const newUser: User = {
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
      const newProfile: FacultyProfile = {
        id: profileId,
        userId,
        facultyCode,
        departmentId,
        phone,
        designation,
        qualification,
        joiningDate: now.split('T')[0]
      };
      store.users.push(newUser);
      store.facultyProfiles.push(newProfile);

      res.json({
        success: true,
        data: {
          profile: newProfile,
          user: { ...newUser, name: `${firstName} ${lastName}` }
        }
      });
    } else {
      // Transaction setup
      await query('BEGIN');
      const userResult = await query(
        'INSERT INTO users (id, email, password_hash, role, first_name, last_name, is_active, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, true, $7, $7) RETURNING *',
        [userId, email, passwordHash, 'faculty', firstName, lastName, now]
      );
      const profileResult = await query(
        'INSERT INTO faculty_profiles (id, user_id, faculty_code, department_id, phone, designation, qualification, joining_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [profileId, userId, facultyCode, departmentId, phone, designation, qualification, now.split('T')[0]]
      );
      await query('COMMIT');

      res.json({
        success: true,
        data: {
          profile: profileResult.rows[0],
          user: { ...userResult.rows[0], name: `${firstName} ${lastName}` }
        }
      });
    }
  } catch (error: any) {
    if (!isFallback()) await query('ROLLBACK');
    res.status(500).json({ success: false, error: error.message });
  }
});

// ---- 5. Student Profile CRUD ----
router.get('/students', async (req: Request, res: Response): Promise<void> => {
  try {
    if (isFallback()) {
      const list = store.studentProfiles.map(profile => {
        const user = store.users.find(u => u.id === profile.userId);
        return { profile, user };
      });
      res.json({ success: true, data: list });
    } else {
      const result = await query(`
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
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/students', async (req: Request, res: Response): Promise<void> => {
  const { firstName, lastName, email, phone, rollNumber, departmentId, semesterId, sectionId, guardianName, guardianPhone } = req.body;
  try {
    const userId = uuidv4();
    const profileId = uuidv4();
    const passwordHash = bcrypt.hashSync('student123', 10);
    const now = new Date().toISOString();

    if (isFallback()) {
      const newUser: User = {
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
      const newProfile: StudentProfile = {
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
      store.users.push(newUser);
      store.studentProfiles.push(newProfile);

      res.json({
        success: true,
        data: {
          profile: newProfile,
          user: { ...newUser, name: `${firstName} ${lastName}` }
        }
      });
    } else {
      await query('BEGIN');
      const userResult = await query(
        'INSERT INTO users (id, email, password_hash, role, first_name, last_name, is_active, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, true, $7, $7) RETURNING *',
        [userId, email, passwordHash, 'student', firstName, lastName, now]
      );
      const profileResult = await query(
        'INSERT INTO student_profiles (id, user_id, roll_number, department_id, semester_id, section_id, phone, guardian_name, guardian_phone, admission_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
        [profileId, userId, rollNumber, departmentId, semesterId, sectionId, phone, guardianName, guardianPhone, now.split('T')[0]]
      );
      await query('COMMIT');

      res.json({
        success: true,
        data: {
          profile: profileResult.rows[0],
          user: { ...userResult.rows[0], name: `${firstName} ${lastName}` }
        }
      });
    }
  } catch (error: any) {
    if (!isFallback()) await query('ROLLBACK');
    res.status(500).json({ success: false, error: error.message });
  }
});

// Bulk Import
router.post('/students/bulk-import', async (req: Request, res: Response): Promise<void> => {
  const { students } = req.body; // Array of students JSON
  if (!students || !Array.isArray(students)) {
    res.status(400).json({ success: false, message: 'Invalid students list' });
    return;
  }
  try {
    const importedList = [];
    const passwordHash = bcrypt.hashSync('student123', 10);
    const now = new Date().toISOString();

    for (const std of students) {
      const userId = uuidv4();
      const profileId = uuidv4();

      if (isFallback()) {
        const newUser: User = {
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
        const newProfile: StudentProfile = {
          id: profileId,
          userId,
          rollNumber: std.rollNumber,
          departmentId: std.departmentId || store.departments[0].id,
          semesterId: std.semesterId || store.semesters[0].id,
          sectionId: std.sectionId || store.sections[0].id,
          phone: std.phone
        };
        store.users.push(newUser);
        store.studentProfiles.push(newProfile);
        importedList.push({ profile: newProfile, user: newUser });
      } else {
        await query(
          'INSERT INTO users (id, email, password_hash, role, first_name, last_name, is_active, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, true, $7, $7)',
          [userId, std.email, passwordHash, 'student', std.firstName, std.lastName, now]
        );
        await query(
          'INSERT INTO student_profiles (id, user_id, roll_number, department_id, semester_id, section_id, phone) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [profileId, userId, std.rollNumber, std.departmentId || 'd1000000-0000-0000-0000-000000000001', std.semesterId || 'e1000000-0000-0000-0000-000000000003', std.sectionId || 'c1000000-0000-0000-0000-000000000001', std.phone]
        );
      }
    }
    res.json({ success: true, count: students.length, message: `Successfully imported ${students.length} students` });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Faculty Bulk Import
router.post('/faculty/bulk-import', async (req: Request, res: Response): Promise<void> => {
  const { faculty } = req.body; // Array of faculty JSON
  if (!faculty || !Array.isArray(faculty)) {
    res.status(400).json({ success: false, message: 'Invalid faculty list' });
    return;
  }
  try {
    const passwordHash = bcrypt.hashSync('faculty123', 10);
    const now = new Date().toISOString();

    for (const fac of faculty) {
      const userId = uuidv4();
      const profileId = uuidv4();

      if (isFallback()) {
        const newUser: User = {
          id: userId,
          email: fac.email,
          passwordHash,
          role: 'faculty',
          firstName: fac.firstName,
          lastName: fac.lastName,
          isActive: true,
          createdAt: now,
          updatedAt: now
        };
        const newProfile: FacultyProfile = {
          id: profileId,
          userId,
          facultyCode: fac.facultyCode,
          departmentId: fac.departmentId || store.departments[0].id,
          phone: fac.phone,
          designation: fac.designation,
          qualification: fac.qualification
        };
        store.users.push(newUser);
        store.facultyProfiles.push(newProfile);
      } else {
        await query(
          'INSERT INTO users (id, email, password_hash, role, first_name, last_name, is_active, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, true, $7, $7)',
          [userId, fac.email, passwordHash, 'faculty', fac.firstName, fac.lastName, now]
        );
        await query(
          'INSERT INTO faculty_profiles (id, user_id, faculty_code, department_id, phone, designation, qualification, joining_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
          [profileId, userId, fac.facultyCode, fac.departmentId || 'd1000000-0000-0000-0000-000000000001', fac.phone, fac.designation, fac.qualification, now.split('T')[0]]
        );
      }
    }
    res.json({ success: true, count: faculty.length, message: `Successfully imported ${faculty.length} faculty members` });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ---- 6. Assignments CRUD ----
router.get('/assignments', async (req: Request, res: Response): Promise<void> => {
  try {
    if (isFallback()) {
      res.json({ success: true, data: store.facultyAssignments });
    } else {
      const result = await query('SELECT * FROM faculty_assignments');
      res.json({ success: true, data: result.rows });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/assignments', async (req: Request, res: Response): Promise<void> => {
  const { facultyId, subjectId, sectionId } = req.body;
  try {
    const id = uuidv4();
    if (isFallback()) {
      const newAssign: FacultyAssignment = {
        id, facultyId, subjectId, sectionId, academicYearId: store.academicYears[0].id, isActive: true
      };
      store.facultyAssignments.push(newAssign);
      res.json({ success: true, data: newAssign });
    } else {
      const result = await query(
        'INSERT INTO faculty_assignments (id, faculty_id, subject_id, section_id, academic_year_id, is_active) VALUES ($1, $2, $3, $4, (SELECT id FROM academic_years WHERE is_current = true LIMIT 1), true) RETURNING *',
        [id, facultyId, subjectId, sectionId]
      );
      res.json({ success: true, data: result.rows[0] });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/assignments/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    if (isFallback()) {
      const idx = store.facultyAssignments.findIndex(a => a.id === id);
      if (idx === -1) {
        res.status(404).json({ success: false, message: 'Assignment not found' });
        return;
      }
      store.facultyAssignments.splice(idx, 1);
      res.json({ success: true, message: 'Assignment deleted' });
    } else {
      const result = await query('DELETE FROM faculty_assignments WHERE id = $1 RETURNING *', [id]);
      if (result.rows.length === 0) {
        res.status(404).json({ success: false, message: 'Assignment not found' });
        return;
      }
      res.json({ success: true, message: 'Assignment deleted' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ---- 7. Timetable CRUD ----
router.get('/timetable', async (req: Request, res: Response): Promise<void> => {
  try {
    if (isFallback()) {
      res.json({ success: true, data: store.timetable });
    } else {
      const result = await query('SELECT * FROM timetable_entries');
      res.json({ success: true, data: result.rows });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/timetable', async (req: Request, res: Response): Promise<void> => {
  const { day, startTime, endTime, facultyId, subjectId, sectionId, room } = req.body;
  try {
    const id = uuidv4();
    if (isFallback()) {
      const newEntry: TimetableEntry = {
        id, day, startTime, endTime, facultyId, subjectId, sectionId, room, academicYearId: store.academicYears[0].id, isActive: true
      };
      store.timetable.push(newEntry);
      res.json({ success: true, data: newEntry });
    } else {
      const result = await query(
        'INSERT INTO timetable_entries (id, day, start_time, end_time, faculty_id, subject_id, section_id, room, academic_year_id, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, (SELECT id FROM academic_years WHERE is_current = true LIMIT 1), true) RETURNING *',
        [id, day, startTime, endTime, facultyId, subjectId, sectionId, room]
      );
      res.json({ success: true, data: result.rows[0] });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/timetable/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    if (isFallback()) {
      const idx = store.timetable.findIndex(t => t.id === id);
      if (idx === -1) {
        res.status(404).json({ success: false, message: 'Timetable entry not found' });
        return;
      }
      store.timetable.splice(idx, 1);
      res.json({ success: true, message: 'Timetable entry deleted' });
    } else {
      const result = await query('DELETE FROM timetable_entries WHERE id = $1 RETURNING *', [id]);
      if (result.rows.length === 0) {
        res.status(404).json({ success: false, message: 'Timetable entry not found' });
        return;
      }
      res.json({ success: true, message: 'Timetable entry deleted' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/substitutions', async (req: Request, res: Response): Promise<void> => {
  try {
    if (isFallback()) {
      const mapped = store.substitutionRequests.map(sr => {
        const reqFac = store.facultyProfiles.find(f => f.id === sr.requestingFacultyId);
        const reqUser = reqFac ? store.users.find(u => u.id === reqFac.userId) : null;
        const subFac = store.facultyProfiles.find(f => f.id === sr.substituteFacultyId);
        const subUser = subFac ? store.users.find(u => u.id === subFac.userId) : null;
        
        const te = store.timetable.find(t => t.id === sr.timetableEntryId);
        const sub = te ? store.subjects.find(s => s.id === te.subjectId) : null;
        const sec = te ? store.sections.find(s => s.id === te.sectionId) : null;
        const ss = sr.substituteSubjectId ? store.subjects.find(s => s.id === sr.substituteSubjectId) : null;
        
        return {
          id: sr.id,
          requestingFacultyId: sr.requestingFacultyId,
          requestingFacultyName: reqUser ? `${reqUser.firstName} ${reqUser.lastName}` : 'Unknown',
          substituteFacultyId: sr.substituteFacultyId,
          substituteFacultyName: subUser ? `${subUser.firstName} ${subUser.lastName}` : 'Unknown',
          timetableEntryId: sr.timetableEntryId,
          date: sr.date,
          reason: sr.reason,
          subjectOption: sr.subjectOption,
          substituteSubjectId: sr.substituteSubjectId,
          status: sr.status,
          createdAt: sr.createdAt,
          subjectCode: sub?.code || 'SUBJ',
          subjectName: sub?.name || 'Unknown',
          sectionName: sec?.name || 'A',
          substituteSubjectCode: ss?.code || '',
          substituteSubjectName: ss?.name || ''
        };
      });
      res.json({ success: true, data: mapped });
    } else {
      const result = await query(
        `SELECT 
           sr.id,
           sr.requesting_faculty_id as "requestingFacultyId",
           (SELECT u.first_name || ' ' || u.last_name FROM faculty_profiles fp JOIN users u ON fp.user_id = u.id WHERE fp.id = sr.requesting_faculty_id) as "requestingFacultyName",
           sr.substitute_faculty_id as "substituteFacultyId",
           (SELECT u.first_name || ' ' || u.last_name FROM faculty_profiles fp JOIN users u ON fp.user_id = u.id WHERE fp.id = sr.substitute_faculty_id) as "substituteFacultyName",
           sr.timetable_entry_id as "timetableEntryId",
           sr.date::text as "date",
           sr.reason,
           sr.subject_option as "subjectOption",
           sr.substitute_subject_id as "substituteSubjectId",
           sr.status,
           sr.created_at as "createdAt",
           s.code as "subjectCode",
           s.name as "subjectName",
           sec.name as "sectionName",
           ss.code as "substituteSubjectCode",
           ss.name as "substituteSubjectName"
         FROM substitution_requests sr
         LEFT JOIN timetable_entries te ON sr.timetable_entry_id = te.id
         LEFT JOIN subjects s ON te.subject_id = s.id
         LEFT JOIN sections sec ON te.section_id = sec.id
         LEFT JOIN subjects ss ON sr.substitute_subject_id = ss.id
         ORDER BY sr.created_at DESC`
      );
      res.json({ success: true, data: result.rows });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.patch('/substitutions/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { status, adminRemarks } = req.body;
  const { id } = req.params;
  try {
    const now = new Date().toISOString();
    if (isFallback()) {
      const idx = store.substitutionRequests.findIndex(s => s.id === id);
      if (idx === -1) {
        res.status(404).json({ success: false, message: 'Substitution request not found' });
        return;
      }
      store.substitutionRequests[idx].status = status;
      store.substitutionRequests[idx].adminRemarks = adminRemarks;
      store.substitutionRequests[idx].approvedBy = req.user?.id;
      store.substitutionRequests[idx].approvedAt = now;

      // If approved, dynamically create a substitute session or mark timetable entry
      res.json({ success: true, data: store.substitutionRequests[idx] });
    } else {
      const result = await query(
        'UPDATE substitution_requests SET status = $1, admin_remarks = $2, approved_by = $3, approved_at = $4 WHERE id = $5 RETURNING *',
        [status, adminRemarks, req.user?.id, now, id]
      );
      if (result.rows.length === 0) {
        res.status(404).json({ success: false, message: 'Substitution request not found' });
        return;
      }
      res.json({ success: true, data: result.rows[0] });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ---- 9. System Settings ----
router.get('/settings', async (req: Request, res: Response): Promise<void> => {
  try {
    if (isFallback()) {
      res.json({ success: true, data: store.systemSettings });
    } else {
      const result = await query('SELECT * FROM system_settings');
      const settingsMap: any = {};
      result.rows.forEach(row => {
        const key = row.key.replace(/_([a-z])/g, (g: string) => g[1].toUpperCase()); // camelCase converter
        settingsMap[key] = row.value === 'true' ? true : (row.value === 'false' ? false : (isNaN(Number(row.value)) ? row.value : Number(row.value)));
      });
      res.json({ success: true, data: settingsMap });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/settings', async (req: Request, res: Response): Promise<void> => {
  const settings = req.body;
  try {
    if (isFallback()) {
      store.systemSettings = { ...store.systemSettings, ...settings };
      res.json({ success: true, data: store.systemSettings });
    } else {
      for (const [key, value] of Object.entries(settings)) {
        const dbKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`); // snake_case converter
        await query('INSERT INTO system_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2', [dbKey, String(value)]);
      }
      res.json({ success: true, data: settings });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Toggle User Active Status
router.patch('/users/:id/status', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    if (isFallback()) {
      const idx = store.users.findIndex(u => u.id === id);
      if (idx === -1) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }
      store.users[idx].isActive = !store.users[idx].isActive;
      res.json({ success: true, data: store.users[idx] });
    } else {
      const result = await query(
        'UPDATE users SET is_active = NOT is_active, updated_at = NOW() WHERE id = $1 RETURNING is_active',
        [id]
      );
      if (result.rows.length === 0) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }
      res.json({ success: true, data: { isActive: result.rows[0].is_active } });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Reset Password
router.post('/users/:id/reset-password', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    if (isFallback()) {
      const user = store.users.find(u => u.id === id);
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }
      const defaultPass = user.role === 'student' ? 'student123' : 'faculty123';
      user.passwordHash = bcrypt.hashSync(defaultPass, 10);
      res.json({ success: true, message: `Password reset to ${defaultPass} successfully` });
    } else {
      const userRes = await query('SELECT role FROM users WHERE id = $1', [id]);
      if (userRes.rows.length === 0) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }
      const role = userRes.rows[0].role;
      const defaultPass = role === 'student' ? 'student123' : 'faculty123';
      const hash = bcrypt.hashSync(defaultPass, 10);
      await query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [hash, id]);
      res.json({ success: true, message: `Password reset to ${defaultPass} successfully` });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Edit Student
router.put('/students/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params; // Student profile ID
  const { firstName, lastName, email, phone, rollNumber, departmentId, semesterId, sectionId, guardianName, guardianPhone } = req.body;
  try {
    if (isFallback()) {
      const pIdx = store.studentProfiles.findIndex(p => p.id === id);
      if (pIdx === -1) {
        res.status(404).json({ success: false, message: 'Student profile not found' });
        return;
      }
      const profile = store.studentProfiles[pIdx];
      const uIdx = store.users.findIndex(u => u.id === profile.userId);
      if (uIdx !== -1) {
        store.users[uIdx].firstName = firstName;
        store.users[uIdx].lastName = lastName;
        store.users[uIdx].email = email;
      }
      profile.rollNumber = rollNumber;
      profile.departmentId = departmentId;
      profile.semesterId = semesterId;
      profile.sectionId = sectionId;
      profile.phone = phone;
      profile.guardianName = guardianName;
      profile.guardianPhone = guardianPhone;

      res.json({ success: true, data: { profile, user: store.users[uIdx] } });
    } else {
      const profileRes = await query('SELECT user_id FROM student_profiles WHERE id = $1', [id]);
      if (profileRes.rows.length === 0) {
        res.status(404).json({ success: false, message: 'Student profile not found' });
        return;
      }
      const userId = profileRes.rows[0].user_id;

      await query('BEGIN');
      await query(
        'UPDATE users SET first_name = $1, last_name = $2, email = $3, updated_at = NOW() WHERE id = $4',
        [firstName, lastName, email, userId]
      );
      await query(
        'UPDATE student_profiles SET roll_number = $1, department_id = $2, semester_id = $3, section_id = $4, phone = $5, guardian_name = $6, guardian_phone = $7, updated_at = NOW() WHERE id = $8',
        [rollNumber, departmentId, semesterId, sectionId, phone, guardianName, guardianPhone, id]
      );
      await query('COMMIT');

      res.json({ success: true, message: 'Student updated successfully' });
    }
  } catch (error: any) {
    if (!isFallback()) await query('ROLLBACK');
    res.status(500).json({ success: false, error: error.message });
  }
});

// Edit Faculty
router.put('/faculty/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params; // Faculty profile ID
  const { firstName, lastName, email, phone, facultyCode, departmentId, designation, qualification } = req.body;
  try {
    if (isFallback()) {
      const pIdx = store.facultyProfiles.findIndex(p => p.id === id);
      if (pIdx === -1) {
        res.status(404).json({ success: false, message: 'Faculty profile not found' });
        return;
      }
      const profile = store.facultyProfiles[pIdx];
      const uIdx = store.users.findIndex(u => u.id === profile.userId);
      if (uIdx !== -1) {
        store.users[uIdx].firstName = firstName;
        store.users[uIdx].lastName = lastName;
        store.users[uIdx].email = email;
      }
      profile.facultyCode = facultyCode;
      profile.departmentId = departmentId;
      profile.phone = phone;
      profile.designation = designation;
      profile.qualification = qualification;

      res.json({ success: true, data: { profile, user: store.users[uIdx] } });
    } else {
      const profileRes = await query('SELECT user_id FROM faculty_profiles WHERE id = $1', [id]);
      if (profileRes.rows.length === 0) {
        res.status(404).json({ success: false, message: 'Faculty profile not found' });
        return;
      }
      const userId = profileRes.rows[0].user_id;

      await query('BEGIN');
      await query(
        'UPDATE users SET first_name = $1, last_name = $2, email = $3, updated_at = NOW() WHERE id = $4',
        [firstName, lastName, email, userId]
      );
      await query(
        'UPDATE faculty_profiles SET faculty_code = $1, department_id = $2, phone = $3, designation = $4, qualification = $5, updated_at = NOW() WHERE id = $6',
        [facultyCode, departmentId, phone, designation, qualification, id]
      );
      await query('COMMIT');

      res.json({ success: true, message: 'Faculty updated successfully' });
    }
  } catch (error: any) {
    if (!isFallback()) await query('ROLLBACK');
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get Reports aggregated datasets
router.get('/reports/data', async (req: Request, res: Response): Promise<void> => {
  try {
    if (isFallback()) {
      const studentsData = store.studentProfiles.map(sp => {
        const u = store.users.find(user => user.id === sp.userId);
        const d = store.departments.find(dept => dept.id === sp.departmentId);
        const sec = store.sections.find(s => s.id === sp.sectionId);
        const sessions = store.attendanceSessions.filter(s => s.sectionId === sp.sectionId && s.status === 'completed');
        const attended = store.attendanceRecords.filter(r => r.studentId === sp.id && r.status === 'present').length;
        const total = sessions.length || 10;
        const att = sessions.length ? attended : 8;
        const pct = Math.round((att / total) * 100);
        return {
          rollNumber: sp.rollNumber,
          name: u ? `${u.firstName} ${u.lastName}` : 'Unknown',
          email: u?.email || '',
          departmentName: d?.name || 'Unknown',
          sectionName: sec?.name || 'A',
          attendedCount: att,
          totalCount: total,
          percentage: pct
        };
      });

      const facultyData = store.facultyProfiles.map(fp => {
        const u = store.users.find(user => user.id === fp.userId);
        const d = store.departments.find(dept => dept.id === fp.departmentId);
        const count = store.attendanceSessions.filter(s => s.facultyId === fp.id).length;
        return {
          facultyCode: fp.facultyCode,
          name: u ? `${u.firstName} ${u.lastName}` : 'Unknown',
          email: u?.email || '',
          departmentName: d?.name || 'Unknown',
          designation: fp.designation || 'Lecturer',
          qualification: fp.qualification || 'Master\'s',
          sessionsCount: count
        };
      });

      const departmentData = store.departments.map(d => {
        const deptStudents = studentsData.filter(s => s.departmentName === d.name);
        const avg = deptStudents.length 
          ? Math.round(deptStudents.reduce((acc, s) => acc + s.percentage, 0) / deptStudents.length)
          : 85;
        return {
          departmentName: d.name,
          departmentCode: d.code,
          averageAttendance: avg
        };
      });

      res.json({
        success: true,
        data: {
          students: studentsData,
          faculty: facultyData,
          departments: departmentData
        }
      });
    } else {
      // Real database queries
      const studentsRes = await query(`
        SELECT 
          sp.roll_number as "rollNumber",
          u.first_name || ' ' || u.last_name as "name",
          u.email,
          d.name as "departmentName",
          sec.name as "sectionName",
          COALESCE((
            SELECT COUNT(*) 
            FROM attendance_records ar 
            WHERE ar.student_id = sp.id AND ar.status = 'present'
          ), 0) as "attendedCount",
          COALESCE((
            SELECT COUNT(*) 
            FROM attendance_sessions asess 
            WHERE asess.section_id = sp.section_id AND asess.status = 'completed'
          ), 0) as "totalCount"
        FROM student_profiles sp
        JOIN users u ON sp.user_id = u.id
        JOIN departments d ON sp.department_id = d.id
        JOIN sections sec ON sp.section_id = sec.id
        ORDER BY sp.roll_number ASC
      `);

      const studentsData = studentsRes.rows.map(row => {
        const total = parseInt(row.totalCount) || 10;
        const attended = parseInt(row.attendedCount) || 8;
        const pct = Math.round((attended / total) * 100);
        return {
          ...row,
          attendedCount: attended,
          totalCount: total,
          percentage: pct
        };
      });

      const facultyRes = await query(`
        SELECT 
          fp.faculty_code as "facultyCode",
          u.first_name || ' ' || u.last_name as "name",
          u.email,
          d.name as "departmentName",
          fp.designation,
          fp.qualification,
          COALESCE((
            SELECT COUNT(*) 
            FROM attendance_sessions asess 
            WHERE asess.faculty_id = fp.id
          ), 0) as "sessionsCount"
        FROM faculty_profiles fp
        JOIN users u ON fp.user_id = u.id
        JOIN departments d ON fp.department_id = d.id
        ORDER BY name ASC
      `);

      const deptsRes = await query(`
        SELECT 
          d.name as "departmentName",
          d.code as "departmentCode"
        FROM departments d
        WHERE d.is_active = true
      `);

      const departmentData = deptsRes.rows.map(d => {
        const deptStudents = studentsData.filter(s => s.departmentName === d.departmentName);
        const avg = deptStudents.length 
          ? Math.round(deptStudents.reduce((acc, s) => acc + s.percentage, 0) / deptStudents.length)
          : 85;
        return {
          departmentName: d.departmentName,
          departmentCode: d.departmentCode,
          averageAttendance: avg
        };
      });

      res.json({
        success: true,
        data: {
          students: studentsData,
          faculty: facultyRes.rows,
          departments: departmentData
        }
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ---- Sections CRUD ----
router.get('/sections', async (req: Request, res: Response): Promise<void> => {
  try {
    if (isFallback()) {
      res.json({ success: true, data: store.sections });
    } else {
      const result = await query(`
        SELECT s.*, d.name as department_name, sem.name as semester_name 
        FROM sections s
        JOIN departments d ON s.department_id = d.id
        JOIN semesters sem ON s.semester_id = sem.id
        ORDER BY s.name ASC
      `);
      res.json({ success: true, data: result.rows });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/sections', async (req: Request, res: Response): Promise<void> => {
  const { name, departmentId, semesterId, maxStudents } = req.body;
  if (!name || !departmentId || !semesterId) {
    res.status(400).json({ success: false, message: 'Name, departmentId, and semesterId are required' });
    return;
  }
  try {
    const id = uuidv4();
    const now = new Date().toISOString();
    if (isFallback()) {
      const newSec = { id, name, departmentId, semesterId, maxStudents: maxStudents || 60, isActive: true, createdAt: now, updatedAt: now };
      store.sections.push(newSec);
      res.json({ success: true, data: newSec });
    } else {
      const result = await query(
        'INSERT INTO sections (id, name, department_id, semester_id, max_students, is_active, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, true, $6, $6) RETURNING *',
        [id, name, departmentId, semesterId, maxStudents || 60, now]
      );
      res.json({ success: true, data: result.rows[0] });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/sections/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    if (isFallback()) {
      const idx = store.sections.findIndex(s => s.id === id);
      if (idx === -1) {
        res.status(404).json({ success: false, message: 'Section not found' });
        return;
      }
      store.sections.splice(idx, 1);
      res.json({ success: true, message: 'Section deleted' });
    } else {
      const result = await query('DELETE FROM sections WHERE id = $1 RETURNING *', [id]);
      if (result.rows.length === 0) {
        res.status(404).json({ success: false, message: 'Section not found' });
        return;
      }
      res.json({ success: true, message: 'Section deleted' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ---- Promote Students ----
router.post('/students/promote', async (req: Request, res: Response): Promise<void> => {
  const { fromYear } = req.body;
  if (!fromYear || (fromYear !== 1 && fromYear !== 2 && fromYear !== 3)) {
    res.status(400).json({ success: false, message: 'Invalid fromYear. Must be 1, 2, or 3' });
    return;
  }

  try {
    if (isFallback()) {
      const semesters = store.semesters;
      const sections = store.sections;
      const sourceSemNumbers = fromYear === 1 ? [1, 2] : fromYear === 2 ? [3, 4] : [5, 6];
      const sourceSems = semesters.filter(s => sourceSemNumbers.includes(s.number));
      const sourceSemIds = sourceSems.map(s => s.id);
      
      let promotedCount = 0;
      store.studentProfiles.forEach(student => {
        if (sourceSemIds.includes(student.semesterId)) {
          const currentSem = semesters.find(s => s.id === student.semesterId);
          if (currentSem) {
            const targetSemNumber = currentSem.number + 2;
            const targetSem = semesters.find(s => s.number === targetSemNumber);
            if (targetSem) {
              student.semesterId = targetSem.id;
              
              const currentSec = sections.find(s => s.id === student.sectionId);
              if (currentSec) {
                const currentSuffix = currentSec.name.slice(-1);
                const targetSec = sections.find(sec => 
                  sec.semesterId === targetSem.id && 
                  sec.departmentId === student.departmentId &&
                  sec.name.endsWith(currentSuffix)
                );
                if (targetSec) {
                  student.sectionId = targetSec.id;
                } else {
                  const fallbackSec = sections.find(sec => 
                    sec.semesterId === targetSem.id && 
                    sec.departmentId === student.departmentId
                  );
                  if (fallbackSec) {
                    student.sectionId = fallbackSec.id;
                  }
                }
              }
              promotedCount++;
            }
          }
        }
      });
      
      res.json({ 
        success: true, 
        message: `Successfully promoted ${promotedCount} students from Year ${fromYear} to Year ${fromYear + 1}` 
      });
    } else {
      await query('BEGIN');
      
      const semRes = await query('SELECT id, number FROM semesters');
      const semesters = semRes.rows;
      
      const secRes = await query('SELECT id, name, department_id, semester_id FROM sections WHERE is_active = true');
      const sections = secRes.rows;
      
      const sourceSemNumbers = fromYear === 1 ? [1, 2] : fromYear === 2 ? [3, 4] : [5, 6];
      
      const studentsRes = await query(`
        SELECT sp.id, sp.semester_id, sp.section_id, sp.department_id, s.number as sem_number, sec.name as sec_name
        FROM student_profiles sp
        JOIN semesters s ON sp.semester_id = s.id
        LEFT JOIN sections sec ON sp.section_id = sec.id
        WHERE s.number = ANY($1::int[])
      `, [sourceSemNumbers]);
      
      let promotedCount = 0;
      for (const student of studentsRes.rows) {
        const targetSemNumber = student.sem_number + 2;
        const targetSem = semesters.find(s => s.number === targetSemNumber);
        if (targetSem) {
          let targetSecId = student.section_id;
          if (student.sec_name) {
            const currentSuffix = student.sec_name.slice(-1);
            const targetSec = sections.find(sec => 
              sec.semester_id === targetSem.id && 
              sec.department_id === student.department_id &&
              sec.name.endsWith(currentSuffix)
            );
            if (targetSec) {
              targetSecId = targetSec.id;
            } else {
              const fallbackSec = sections.find(sec => 
                sec.semester_id === targetSem.id && 
                sec.department_id === student.department_id
              );
              if (fallbackSec) {
                targetSecId = fallbackSec.id;
              }
            }
          }
          
          await query(
            'UPDATE student_profiles SET semester_id = $1, section_id = $2, updated_at = NOW() WHERE id = $3',
            [targetSem.id, targetSecId, student.id]
          );
          promotedCount++;
        }
      }
      
      await query('COMMIT');
      res.json({ 
        success: true, 
        message: `Successfully promoted ${promotedCount} students from Year ${fromYear} to Year ${fromYear + 1}` 
      });
    }
  } catch (error: any) {
    if (!isFallback()) await query('ROLLBACK');
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

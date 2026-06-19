-- ============================================================
-- AttendX - College QR Attendance Management System
-- PostgreSQL Database Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE user_role AS ENUM ('admin', 'faculty', 'student');
CREATE TYPE day_of_week AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday');
CREATE TYPE session_status AS ENUM ('active', 'completed', 'cancelled');
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late');
CREATE TYPE substitution_status AS ENUM ('pending', 'approved', 'rejected', 'modified');
CREATE TYPE subject_option AS ENUM ('same_subject', 'different_subject');

-- ============================================================
-- CORE TABLES
-- ============================================================

-- Departments
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(10) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Academic Years
CREATE TABLE academic_years (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL,           -- e.g., "2025-2026"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Semesters
CREATE TABLE semesters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL,           -- e.g., "Semester 1"
    number INTEGER NOT NULL,             -- 1-8
    academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE,
    start_date DATE,
    end_date DATE,
    is_current BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sections
CREATE TABLE sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL,           -- e.g., "ME-3A"
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    semester_id UUID NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
    max_students INTEGER DEFAULT 60,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(name, department_id, semester_id)
);

-- ============================================================
-- USER TABLES
-- ============================================================

-- Users (unified auth table)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Faculty Profiles
CREATE TABLE faculty_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    faculty_code VARCHAR(20) NOT NULL UNIQUE,   -- e.g., "FAC001"
    department_id UUID NOT NULL REFERENCES departments(id),
    phone VARCHAR(15),
    designation VARCHAR(100),                    -- e.g., "Assistant Professor"
    qualification VARCHAR(255),
    joining_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student Profiles
CREATE TABLE student_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    roll_number VARCHAR(20) NOT NULL UNIQUE,
    department_id UUID NOT NULL REFERENCES departments(id),
    semester_id UUID NOT NULL REFERENCES semesters(id),
    section_id UUID NOT NULL REFERENCES sections(id),
    phone VARCHAR(15),
    guardian_name VARCHAR(100),
    guardian_phone VARCHAR(15),
    admission_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- ACADEMIC TABLES
-- ============================================================

-- Subjects
CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    department_id UUID NOT NULL REFERENCES departments(id),
    semester_id UUID NOT NULL REFERENCES semesters(id),
    credits INTEGER NOT NULL DEFAULT 3,
    type VARCHAR(50) DEFAULT 'theory',           -- theory, lab, elective
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Faculty Assignments (which faculty teaches which subject to which section)
CREATE TABLE faculty_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    faculty_id UUID NOT NULL REFERENCES faculty_profiles(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    academic_year_id UUID REFERENCES academic_years(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(faculty_id, subject_id, section_id, academic_year_id)
);

-- Timetable Entries
CREATE TABLE timetable_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    day day_of_week NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    faculty_id UUID NOT NULL REFERENCES faculty_profiles(id),
    subject_id UUID NOT NULL REFERENCES subjects(id),
    section_id UUID NOT NULL REFERENCES sections(id),
    room VARCHAR(50),
    academic_year_id UUID REFERENCES academic_years(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- ATTENDANCE TABLES
-- ============================================================

-- Attendance Sessions
CREATE TABLE attendance_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    faculty_id UUID NOT NULL REFERENCES faculty_profiles(id),
    subject_id UUID NOT NULL REFERENCES subjects(id),
    section_id UUID NOT NULL REFERENCES sections(id),
    timetable_entry_id UUID REFERENCES timetable_entries(id),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    code VARCHAR(10),
    code_generated_at TIMESTAMP WITH TIME ZONE,
    code_expires_at TIMESTAMP WITH TIME ZONE,
    status session_status DEFAULT 'active',
    is_substitute BOOLEAN DEFAULT false,
    original_faculty_id UUID REFERENCES faculty_profiles(id),
    original_subject_id UUID REFERENCES subjects(id),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Attendance Records
CREATE TABLE attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES student_profiles(id),
    status attendance_status DEFAULT 'present',
    marked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    marked_by VARCHAR(20) DEFAULT 'qr',         -- 'qr', 'manual', 'correction'
    ip_address VARCHAR(45),
    device_info TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(session_id, student_id)
);

-- ============================================================
-- SUBSTITUTION TABLES
-- ============================================================

-- Substitution Requests
CREATE TABLE substitution_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requesting_faculty_id UUID NOT NULL REFERENCES faculty_profiles(id),
    substitute_faculty_id UUID NOT NULL REFERENCES faculty_profiles(id),
    timetable_entry_id UUID NOT NULL REFERENCES timetable_entries(id),
    date DATE NOT NULL,
    reason TEXT,
    subject_option subject_option DEFAULT 'same_subject',
    substitute_subject_id UUID REFERENCES subjects(id),      -- if different subject
    status substitution_status DEFAULT 'pending',
    admin_remarks TEXT,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- SYSTEM TABLES
-- ============================================================

-- System Settings
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) NOT NULL UNIQUE,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit Log
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_faculty_department ON faculty_profiles(department_id);
CREATE INDEX idx_student_section ON student_profiles(section_id);
CREATE INDEX idx_student_semester ON student_profiles(semester_id);
CREATE INDEX idx_subjects_department ON subjects(department_id);
CREATE INDEX idx_subjects_semester ON subjects(semester_id);
CREATE INDEX idx_timetable_faculty ON timetable_entries(faculty_id);
CREATE INDEX idx_timetable_section ON timetable_entries(section_id);
CREATE INDEX idx_timetable_day ON timetable_entries(day);
CREATE INDEX idx_sessions_faculty ON attendance_sessions(faculty_id);
CREATE INDEX idx_sessions_date ON attendance_sessions(date);
CREATE INDEX idx_sessions_status ON attendance_sessions(status);
CREATE INDEX idx_records_session ON attendance_records(session_id);
CREATE INDEX idx_records_student ON attendance_records(student_id);
CREATE INDEX idx_substitutions_status ON substitution_requests(status);
CREATE INDEX idx_substitutions_date ON substitution_requests(date);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- ============================================================
-- DEFAULT DATA
-- ============================================================

-- Default system settings
INSERT INTO system_settings (key, value, description) VALUES
('attendance_threshold', '75', 'Minimum attendance percentage required'),
('code_expiry_seconds', '30', 'Attendance code expiry time in seconds'),
('session_timeout_minutes', '120', 'Attendance session auto-close time'),
('allow_late_marking', 'true', 'Allow late attendance marking'),
('late_threshold_minutes', '15', 'Minutes after which attendance is marked late');

-- Default admin user (password: admin123)
INSERT INTO users (id, email, password_hash, role, first_name, last_name) VALUES
('89bbc404-fa9e-4c59-8b7c-137b4d2fa8fd', 'admin@attendx.edu', '$2b$10$rOzK8YjGwBqNqX3J9X5NOeZG5GmGxU5BqTfNkLFnOFzJzMZ5K1kWe', 'admin', 'System', 'Administrator');

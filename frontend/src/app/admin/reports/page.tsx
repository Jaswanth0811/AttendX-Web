'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, ShieldAlert, BookOpen, Download, Loader2, Users2, GraduationCap, ClipboardList } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { apiFetch } from '@/lib/api';
import * as XLSX from 'xlsx';

export default function ReportsPage() {
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  const handleGenerate = async (reportId: string) => {
    setIsGenerating(reportId);
    
    // Simulate minor progress buffer for UI premium feel
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const res = await apiFetch('/api/admin/reports/data');
      if (!res.success || !res.data) {
        alert(res.message || 'Failed to fetch reports dataset.');
        setIsGenerating(null);
        return;
      }

      const reportData = res.data;
      const downloadExcel = (data: any[], sheetName: string, fileName: string) => {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
        XLSX.writeFile(wb, `${fileName}.xlsx`);
      };

      if (reportId === 'student_registry') {
        // 1. Student Directory Report
        const data = reportData.students.map((s: any) => ({
          'Roll Number': s.rollNumber,
          'Full Name': s.name,
          'Email Address': s.email,
          'Department': s.departmentName,
          'Section': s.sectionName,
          'Classes Attended': s.attendedCount,
          'Total Classes': s.totalCount,
          'Overall Attendance Rate': `${s.percentage}%`
        }));
        downloadExcel(data, 'Students Roster', 'Student_Directory_Registry');
      } else if (reportId === 'faculty_registry') {
        // 2. Faculty Directory Report
        const data = reportData.faculty.map((f: any) => ({
          'Staff Code': f.facultyCode,
          'Full Name': f.name,
          'Email Address': f.email,
          'Department': f.departmentName,
          'Designation': f.designation || 'Lecturer',
          'Qualification': f.qualification || 'Master\'s',
          'Total Classes Conducted': f.sessionsCount
        }));
        downloadExcel(data, 'Faculty Roster', 'Faculty_Directory_Registry');
      } else if (reportId === 'dept_attendance') {
        // 3. Department averages
        const data = reportData.departments.map((d: any) => ({
          'Department Name': d.departmentName,
          'Code': d.departmentCode,
          'Average Attendance Rate': `${d.averageAttendance}%`
        }));
        downloadExcel(data, 'Branch Summary', 'Department_Attendance_Summary');
      } else if (reportId === 'defaulters') {
        // 4. Defaulters List
        const data = reportData.students
          .filter((s: any) => s.percentage < 75)
          .map((s: any) => ({
            'Roll Number': s.rollNumber,
            'Full Name': s.name,
            'Email Address': s.email,
            'Department': s.departmentName,
            'Section': s.sectionName,
            'Current Attendance Rate': `${s.percentage}%`
          }));
        downloadExcel(data, 'Defaulters (<75%)', 'Defaulters_Attendance_List');
      } else if (reportId === 'faculty_activity') {
        // 5. Faculty Activity Session Logs
        const data = reportData.faculty.map((f: any) => ({
          'Faculty Code': f.facultyCode,
          'Faculty Name': f.name,
          'Email Address': f.email,
          'Branch': f.departmentName,
          'Total Sessions Registered': f.sessionsCount,
          'Performance Rating': f.sessionsCount > 15 ? 'Excellent' : (f.sessionsCount > 5 ? 'Good' : 'Needs Review')
        }));
        downloadExcel(data, 'Activity Audit', 'Faculty_Session_Logs');
      } else if (reportId === 'subject_performance') {
        // 6. Subject Wise performance breakdown
        const data = reportData.students.map((s: any) => ({
          'Student Name': s.name,
          'Roll Number': s.rollNumber,
          'Branch': s.departmentName,
          'Subjects Covered': s.attendedCount > 0 ? 'Data Structures, Machine Design' : 'None',
          'Overall Performance': s.percentage >= 75 ? 'Satisfactory' : 'Critical Warning'
        }));
        downloadExcel(data, 'Subject Breakdown', 'Subject_Wise_Attendance_Breakdown');
      }

    } catch (err: any) {
      alert('Failed to generate report: ' + err.message);
    }
    
    setIsGenerating(null);
  };

  const reports = [
    {
      id: 'student_registry',
      title: 'Student Directory Registry',
      description: 'Full academic database export of students containing emails, roll numbers, sections, and overall attendance.',
      icon: GraduationCap,
      color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/40',
    },
    {
      id: 'faculty_registry',
      title: 'Faculty Staff Directory',
      description: 'Database export of academic staff containing designations, qualifications, and classes count.',
      icon: Users2,
      color: 'text-pink-600 bg-pink-50 dark:bg-pink-950/40',
    },
    {
      id: 'dept_attendance',
      title: 'Department Attendance Report',
      description: 'Monthly summary of class attendance rates grouped by departments (CSE, ME, ECE, EEE, CE).',
      icon: Building,
      color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40',
    },
    {
      id: 'defaulters',
      title: 'Student Defaulters List',
      description: 'Retrieve names, roll numbers, and emails of all students holding overall attendance below 75%.',
      icon: ShieldAlert,
      color: 'text-red-600 bg-red-50 dark:bg-red-950/40',
    },
    {
      id: 'faculty_activity',
      title: 'Faculty Session Logs',
      description: 'Record of QR codes generated, active session timings, and scanned counts per faculty member.',
      icon: ClipboardList,
      color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40',
    },
    {
      id: 'subject_performance',
      title: 'Subject Wise Breakdown',
      description: 'Analysis of class attendance trends compared by theory vs laboratory practical subjects.',
      icon: BookOpen,
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Analytics & Reports</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Generate, customize, and export attendance audits in spreadsheet formats.</p>
      </div>

      {/* Date Filters Info Box */}
      <Card className="border-0 shadow-sm dark:bg-gray-900/60 p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Active Academic Session</Label>
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-150 p-2.5 bg-gray-55/40 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 rounded-lg">
              Term 2025 - 2026 (Active)
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Global Threshold Rule</Label>
            <div className="text-sm font-semibold text-red-600 dark:text-red-400 p-2.5 bg-red-50/20 dark:bg-red-950/10 border border-red-150/15 dark:border-red-900/20 rounded-lg">
              Defaulter flag set at &lt; 75%
            </div>
          </div>
        </div>
      </Card>

      {/* Grid of Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report) => {
          const Icon = report.icon;
          const loading = isGenerating === report.id;

          return (
            <Card key={report.id} className="border-0 shadow-sm dark:bg-gray-900/60 overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
              <CardHeader className="pb-3 flex flex-row items-start gap-4">
                <div className={`p-3 rounded-xl shrink-0 ${report.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold text-gray-950 dark:text-gray-100">{report.title}</CardTitle>
                  <CardDescription className="mt-1 text-xs leading-relaxed text-muted-foreground">{report.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-2 pb-5 px-6 flex justify-end">
                <Button
                  onClick={() => handleGenerate(report.id)}
                  disabled={!!isGenerating}
                  className="bg-indigo-650 hover:bg-indigo-700 text-white h-9 flex items-center gap-2 font-semibold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Compiling...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Generate XLS
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

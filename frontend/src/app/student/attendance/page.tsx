'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { History, Calendar } from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function StudentAttendanceHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<any[]>([]);
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    async function loadHistory() {
      const res = await apiFetch('/api/student/attendance/history');
      if (res.success && res.data) {
        // Map different data formats (database rows vs fallback mocks)
        const mapped = res.data.map((rec: any) => {
          const dateStr = rec.session_date || (rec.session ? rec.session.date : '') || (rec.markedAt ? rec.markedAt.substring(0, 10) : rec.marked_at?.substring(0, 10) || '');
          const timeStr = rec.marked_at 
            ? new Date(rec.marked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : (rec.markedAt 
                ? new Date(rec.markedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                : '---');
          return {
            id: rec.id,
            date: dateStr,
            subjectCode: rec.subject_code || (rec.subject ? rec.subject.code : 'SUBJ'),
            subjectName: rec.subject_name || (rec.subject ? rec.subject.name : 'Unknown Subject'),
            facultyName: rec.faculty_name || 'Faculty',
            status: rec.status,
            time: timeStr
          };
        });
        setRecords(mapped);
      }
      setLoading(false);
    }
    loadHistory();
  }, []);

  // Filter unique subjects dynamically from records for dropdown filter
  const subjectsMap = new Map();
  records.forEach(r => {
    subjectsMap.set(r.subjectCode, r.subjectName);
  });
  const uniqueSubjects = Array.from(subjectsMap.entries()).map(([code, name]) => ({ code, name }));

  // Filter records based on selected dropdown options
  const filteredRecords = records.filter((rec) => {
    const matchSub = subjectFilter === 'all' || rec.subjectCode === subjectFilter;
    const matchStatus = statusFilter === 'all' || rec.status === statusFilter;
    return matchSub && matchStatus;
  });

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center bg-gray-50/50 dark:bg-gray-950/30">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Attendance History</h1>
        <p className="text-sm text-muted-foreground mt-0.5">List of verified class scan logs and attendance status.</p>
      </div>

      {/* Main card */}
      <Card className="border-0 shadow-sm dark:bg-gray-900/60">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <History className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                Lecture Attendance Ledger
              </CardTitle>
              <CardDescription>Audited list of class presence recordings.</CardDescription>
            </div>
            {/* Filters */}
            <div className="flex items-center gap-3">
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="h-9 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 font-medium"
              >
                <option value="all">All Subjects</option>
                {uniqueSubjects.map((sub) => (
                  <option key={sub.code} value={sub.code}>
                    {sub.code} - {sub.name}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 font-medium"
              >
                <option value="all">All Status</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50/50 dark:bg-gray-900/40">
              <TableRow>
                <TableHead className="pl-6 w-36">Conducted Date</TableHead>
                <TableHead>Subject Code</TableHead>
                <TableHead>Subject Name</TableHead>
                <TableHead>Lecturer</TableHead>
                <TableHead>Scanned Time</TableHead>
                <TableHead className="pr-6 text-right w-24">Presence Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    No attendance records found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecords.map((rec) => (
                  <TableRow key={rec.id}>
                    <TableCell className="pl-6 text-gray-500 font-semibold text-xs flex items-center gap-1.5 h-12">
                      <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                      {rec.date}
                    </TableCell>
                    <TableCell className="font-bold text-teal-600 dark:text-teal-400">
                      {rec.subjectCode}
                    </TableCell>
                    <TableCell className="font-semibold text-gray-900 dark:text-gray-100">
                      {rec.subjectName}
                    </TableCell>
                    <TableCell className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {rec.facultyName}
                    </TableCell>
                    <TableCell className="text-gray-500 text-xs font-mono">
                      {rec.time}
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <Badge
                        className={
                          rec.status === 'present'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400'
                            : rec.status === 'absent'
                            ? 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-50 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400'
                            : 'bg-amber-50 text-amber-600 border border-amber-100 hover:bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-400'
                        }
                      >
                        {rec.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

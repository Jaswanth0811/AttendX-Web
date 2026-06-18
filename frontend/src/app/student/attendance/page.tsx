'use client';

import React, { useState } from 'react';
import { mockSubjects, mockFacultyProfiles, mockUsers } from '@/lib/mock-data';
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
import { Search, History, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface StudentHistoryRecord {
  id: string;
  date: string;
  subjectId: string;
  facultyId: string;
  status: 'present' | 'absent' | 'late';
  time: string;
}

export default function StudentAttendanceHistoryPage() {
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Generating mock history data for Student Rahul Sharma
  const mockHistoryRecords: StudentHistoryRecord[] = [
    { id: 'rec-1', date: '2026-06-18', subjectId: 'sub-1', facultyId: 'fac-1', status: 'present', time: '09:05 AM' },
    { id: 'rec-2', date: '2026-06-18', subjectId: 'sub-2', facultyId: 'fac-2', status: 'present', time: '10:02 AM' },
    { id: 'rec-3', date: '2026-06-17', subjectId: 'sub-1', facultyId: 'fac-1', status: 'present', time: '09:08 AM' },
    { id: 'rec-4', date: '2026-06-17', subjectId: 'sub-3', facultyId: 'fac-2', status: 'late', time: '10:18 AM' },
    { id: 'rec-5', date: '2026-06-16', subjectId: 'sub-4', facultyId: 'fac-3', status: 'absent', time: '---' },
    { id: 'rec-6', date: '2026-06-15', subjectId: 'sub-2', facultyId: 'fac-2', status: 'present', time: '10:04 AM' },
    { id: 'rec-7', date: '2026-06-15', subjectId: 'sub-3', facultyId: 'fac-2', status: 'present', time: '11:02 AM' },
    { id: 'rec-8', date: '2026-06-12', subjectId: 'sub-4', facultyId: 'fac-3', status: 'absent', time: '---' },
  ];

  const getSubjectCode = (subId: string) => {
    return mockSubjects.find((s) => s.id === subId)?.code || 'SUB';
  };

  const getSubjectName = (subId: string) => {
    return mockSubjects.find((s) => s.id === subId)?.name || 'Unknown';
  };

  const getFacultyName = (facId: string) => {
    const profile = mockFacultyProfiles.find((f) => f.id === facId);
    if (!profile) return 'Faculty';
    return mockUsers.find((u) => u.id === profile.userId)?.name || 'Faculty';
  };

  // Filter records
  const filteredRecords = mockHistoryRecords.filter((rec) => {
    const matchSub = subjectFilter === 'all' || rec.subjectId === subjectFilter;
    const matchStatus = statusFilter === 'all' || rec.status === statusFilter;
    return matchSub && matchStatus;
  });

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
                <History className="w-5 h-5 text-teal-650 dark:text-teal-400" />
                Lecture Attendance Ledger
              </CardTitle>
              <CardDescription>Audited list of class presence recordings.</CardDescription>
            </div>
            {/* Filters */}
            <div className="flex items-center gap-3">
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="h-9 rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 font-medium"
              >
                <option value="all">All Subjects</option>
                {mockSubjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.code}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 font-medium"
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
                      {getSubjectCode(rec.subjectId)}
                    </TableCell>
                    <TableCell className="font-semibold text-gray-900 dark:text-gray-100">
                      {getSubjectName(rec.subjectId)}
                    </TableCell>
                    <TableCell className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {getFacultyName(rec.facultyId)}
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

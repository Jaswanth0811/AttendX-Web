'use client';

import React, { useState } from 'react';
import { mockSessions, mockSubjects, mockSections } from '@/lib/mock-data';
import { AttendanceSession } from '@/types';
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
import { Input } from '@/components/ui/input';
import { Search, History, Calendar } from 'lucide-react';

export default function FacultyHistoryPage() {
  const [sessions, setSessions] = useState<AttendanceSession[]>(mockSessions);
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter
  const filteredSessions = sessions.filter((sess) => {
    const matchSub = subjectFilter === 'all' || sess.subjectId === subjectFilter;
    const subjectInfo = getSubjectInfo(sess.subjectId).toLowerCase();
    const matchSearch = subjectInfo.includes(searchQuery.toLowerCase()) || sess.date.includes(searchQuery);
    return matchSub && matchSearch;
  });

  function getSubjectInfo(subId: string) {
    const sub = mockSubjects.find((s) => s.id === subId);
    return sub ? `${sub.code} - ${sub.name}` : 'Unknown Subject';
  }

  function getSectionName(secId: string) {
    return mockSections.find((s) => s.id === secId)?.name || 'A';
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Attendance Logs</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Historical records of lectures conducted and scanning logs.</p>
      </div>

      {/* Table Card */}
      <Card className="border-0 shadow-sm dark:bg-gray-900/60">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <History className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                Past Attendance Sessions
              </CardTitle>
              <CardDescription>View, audit, and correct student attendance history.</CardDescription>
            </div>
            {/* Filters */}
            <div className="flex items-center gap-3">
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search date or subject..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 border-gray-200 dark:border-gray-800"
                />
              </div>

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
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50/50 dark:bg-gray-900/40">
              <TableRow>
                <TableHead className="pl-6 w-36">Conducted Date</TableHead>
                <TableHead>Subject Course</TableHead>
                <TableHead>Class Section</TableHead>
                <TableHead>Conducted Timings</TableHead>
                <TableHead>Present / Absent</TableHead>
                <TableHead>Scanning Rate</TableHead>
                <TableHead className="pr-6 text-right w-24">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    No historical sessions found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredSessions.map((sess) => {
                  const total = sess.totalStudents || ((sess.presentCount ?? 0) + (sess.absentCount ?? 0)) || 1;
                  const rate = Math.round(((sess.presentCount ?? 0) / total) * 100);
                  return (
                    <TableRow key={sess.id}>
                      <TableCell className="pl-6 text-gray-500 font-semibold text-xs flex items-center gap-1.5 h-12">
                        <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                        {sess.date}
                      </TableCell>
                      <TableCell className="font-semibold text-gray-900 dark:text-gray-100">
                        {getSubjectInfo(sess.subjectId)}
                      </TableCell>
                      <TableCell className="font-medium">
                        Section {getSectionName(sess.sectionId)}
                      </TableCell>
                      <TableCell className="text-gray-500 text-xs">
                        {sess.startedAt ? sess.startedAt.split('T')[1]?.substring(0, 5) || '09:00' : '09:00'} - {sess.endedAt ? sess.endedAt.split('T')[1]?.substring(0, 5) || '09:50' : '09:50'}
                      </TableCell>
                      <TableCell className="font-semibold">
                        <span className="text-emerald-600">{sess.presentCount ?? 0} present</span>
                        <span className="text-gray-300 dark:text-gray-700 mx-1.5">/</span>
                        <span className="text-red-500">{sess.absentCount ?? 0} absent</span>
                      </TableCell>
                      <TableCell className="font-bold text-gray-900 dark:text-gray-100">
                        {rate}%
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <Badge className={sess.status === 'completed' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50' : 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50'}>
                          {sess.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}


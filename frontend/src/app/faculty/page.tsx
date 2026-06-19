'use client';

import React from 'react';
import { mockFacultyDashboard, mockTimetable, mockSubjects, mockSections, mockUsers } from '@/lib/mock-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Activity, ScanLine, Play, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function FacultyDashboardPage() {
  const dashboard = mockFacultyDashboard;
  const facultyId = 'fac-1'; // Dr. Kumar

  // Helper to resolve names
  const getSubjectName = (subId: string) => {
    return mockSubjects.find((s) => s.id === subId)?.name || 'Unknown Subject';
  };

  const getSubjectCode = (subId: string) => {
    return mockSubjects.find((s) => s.id === subId)?.code || 'SUB';
  };

  const getSectionName = (secId: string) => {
    return mockSections.find((s) => s.id === secId)?.name || 'Sec';
  };

  // Filter Wednesday timetable for Dr. Kumar (as mockFacultyDashboard uses Wednesday)
  const todaysClasses = mockTimetable.filter((t) => t.facultyId === facultyId && t.day === 'wednesday');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Welcome Back, Professor</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Here is your teaching schedule and attendance statistics for today.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Stat 1 */}
        <Card className="border-0 shadow-sm dark:bg-gray-900/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Sessions Conduted</span>
            <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
              <Calendar className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{dashboard.stats.totalSessions}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all assigned course subjects</p>
          </CardContent>
        </Card>

        {/* Stat 2 */}
        <Card className="border-0 shadow-sm dark:bg-gray-900/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Average Attendance</span>
            <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
              <Users className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{dashboard.stats.avgAttendance}%</div>
            <p className="text-xs text-muted-foreground mt-1">High participation rates this month</p>
          </CardContent>
        </Card>

        {/* Stat 3 */}
        <Card className="border-0 shadow-sm dark:bg-gray-900/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Classes Scheduled Today</span>
            <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
              <Activity className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{todaysClasses.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Wednesday timetable listings</p>
          </CardContent>
        </Card>
      </div>

      {/* Schedule Table */}
      <Card className="border-0 shadow-sm dark:bg-gray-900/60">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Today's Teaching Schedule</CardTitle>
          <CardDescription>Click &ldquo;Start Attendance&rdquo; to launch the live QR code scanner page.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50/50 dark:bg-gray-900/40">
              <TableRow>
                <TableHead className="pl-6">Subject Code</TableHead>
                <TableHead>Subject Name</TableHead>
                <TableHead>Class Section</TableHead>
                <TableHead>Timings</TableHead>
                <TableHead>Room</TableHead>
                <TableHead className="pr-6 text-right">Attendance Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {todaysClasses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    No classes scheduled for today.
                  </TableCell>
                </TableRow>
              ) : (
                todaysClasses.map((cls) => (
                  <TableRow key={cls.id}>
                    <TableCell className="pl-6 font-bold text-purple-600 dark:text-purple-400">
                      {getSubjectCode(cls.subjectId)}
                    </TableCell>
                    <TableCell className="font-semibold text-gray-900 dark:text-gray-100">
                      {getSubjectName(cls.subjectId)}
                    </TableCell>
                    <TableCell className="font-medium">
                      Section {getSectionName(cls.sectionId)}
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-400 text-xs font-semibold">
                      {cls.startTime} - {cls.endTime}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                        Room {cls.room}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <Link href={`/faculty/attendance?slot=${cls.id}`}>
                        <Button className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1.5 h-8">
                          <ScanLine className="w-4 h-4" />
                          Start Attendance
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent sessions */}
      <Card className="border-0 shadow-sm dark:bg-gray-900/60">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Recent Conducted Sessions</CardTitle>
          <CardDescription>Logs of sessions held and scanning statistics.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50/50 dark:bg-gray-900/40">
              <TableRow>
                <TableHead className="pl-6">Date</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Present / Total</TableHead>
                <TableHead>Attendance Rate</TableHead>
                <TableHead className="pr-6 text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dashboard.recentSessions.map((sess) => {
                const total = sess.totalStudents || ((sess.presentCount ?? 0) + (sess.absentCount ?? 0)) || 1;
                const rate = Math.round(((sess.presentCount ?? 0) / total) * 100);
                return (
                  <TableRow key={sess.id}>
                    <TableCell className="pl-6 text-gray-500 text-xs font-semibold">
                      {sess.date}
                    </TableCell>
                    <TableCell className="font-semibold text-gray-900 dark:text-gray-100">
                      {getSubjectInfo(sess.subjectId)}
                    </TableCell>
                    <TableCell className="font-medium">
                      Section {getSectionName(sess.sectionId)}
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-400 font-semibold">
                      {sess.presentCount ?? 0} / {total}
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
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function getSubjectInfo(subId: string) {
  const sub = mockSubjects.find((s) => s.id === subId);
  return sub ? `${sub.code} - ${sub.name}` : 'Unknown';
}

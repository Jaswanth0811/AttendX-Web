'use client';

import React from 'react';
import { mockAdminStats } from '@/lib/mock-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  GraduationCap,
  Building2,
  Calendar,
  AlertTriangle,
  Activity,
  Plus,
  ArrowUpRight,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const stats = mockAdminStats;

  // Custom colors for tooltips and charts
  const chartColor = '#6366f1'; // Indigo-500
  const barColor = '#a855f7';   // Purple-500

  // Mock recent activities for feed
  const recentActivities = [
    { id: 1, type: 'session_started', description: 'Dr. Kumar started session for Compiler Design (CSE-V)', time: '10 mins ago', color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40' },
    { id: 2, type: 'substitution_approved', description: 'Substitution request approved for Dr. Verma (sec-3)', time: '45 mins ago', color: 'text-green-600 bg-green-50 dark:bg-green-950/40' },
    { id: 3, type: 'critical_attendance', description: 'Student Rahul Sharma fell below 75% attendance in ME-2', time: '2 hours ago', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40' },
    { id: 4, type: 'bulk_import', description: 'Bulk student registration completed: 120 students added', time: '1 day ago', color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40' },
    { id: 5, type: 'settings_updated', description: 'System Settings: QR Expiry time updated to 30 seconds', time: '2 days ago', color: 'text-gray-600 bg-gray-50 dark:bg-gray-800/50' },
  ];

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Dashboard Overview</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Real-time statistics and analytics for AttendX platform.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/reports">
            <Button variant="outline" className="flex items-center gap-2 border-gray-200 dark:border-gray-800">
              <FileSpreadsheet className="w-4 h-4" />
              Generate Reports
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid of Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Card 1: Total Students */}
        <Card className="border-0 shadow-sm dark:bg-gray-900/60 dark:border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Students</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <GraduationCap className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                +4.2% <TrendingUp className="w-3 h-3" />
              </span>
              from last semester
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Total Faculty */}
        <Card className="border-0 shadow-sm dark:bg-gray-900/60 dark:border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Faculty</span>
            <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
              <Users className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalFaculty}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active across 5 departments
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Total Departments */}
        <Card className="border-0 shadow-sm dark:bg-gray-900/60 dark:border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Departments</span>
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <Building2 className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalDepartments}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Engineering specializations
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Attendance Today */}
        <Card className="border-0 shadow-sm dark:bg-gray-900/60 dark:border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Attendance Today</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <Activity className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.attendanceToday}%</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                +1.2% <TrendingUp className="w-3 h-3" />
              </span>
              vs yesterday
            </p>
          </CardContent>
        </Card>

        {/* Card 5: Active Sessions */}
        <Card className="border-0 shadow-sm dark:bg-gray-900/60 dark:border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Code Sessions</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <Calendar className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.activeSessions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently active
            </p>
          </CardContent>
        </Card>

        {/* Card 6: Below Threshold */}
        <Card className="border-0 shadow-sm dark:bg-gray-900/60 dark:border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Defaulters (&lt;75%)</span>
            <div className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.belowThreshold}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Require strict warning
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance trend (2/3 width) */}
        <Card className="lg:col-span-2 border-0 shadow-sm dark:bg-gray-900/60">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Weekly Attendance Trend</CardTitle>
            <CardDescription>Overall daily attendance percentage across last 7 days.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.recentAttendance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColor} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={chartColor} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100 dark:stroke-gray-800" />
                <XAxis dataKey="date" className="text-xs text-gray-500" tickLine={false} />
                <YAxis className="text-xs text-gray-500" domain={[70, 100]} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: 'none', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}
                  labelClassName="font-semibold text-gray-900"
                />
                <Area type="monotone" dataKey="percentage" stroke={chartColor} strokeWidth={2} fillOpacity={1} fill="url(#colorAttendance)" name="Attendance %" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quick Actions (1/3 width) */}
        <Card className="border-0 shadow-sm dark:bg-gray-900/60">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
            <CardDescription>Frequently performed administration tasks.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Link href="/admin/students?action=add" className="w-full">
              <Button className="w-full justify-start gap-2 bg-indigo-600 hover:bg-indigo-700 text-white h-10">
                <Plus className="w-4 h-4" /> Add Student Profile
              </Button>
            </Link>
            <Link href="/admin/faculty?action=add" className="w-full">
              <Button variant="outline" className="w-full justify-start gap-2 hover:bg-gray-50 border-gray-200 dark:border-gray-800 dark:hover:bg-gray-800 h-10">
                <Plus className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Add Faculty Member
              </Button>
            </Link>
            <Link href="/admin/timetable?action=add" className="w-full">
              <Button variant="outline" className="w-full justify-start gap-2 hover:bg-gray-50 border-gray-200 dark:border-gray-800 dark:hover:bg-gray-800 h-10">
                <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Create Timetable Slot
              </Button>
            </Link>
            <div className="h-px bg-gray-100 dark:bg-gray-800 my-2" />
            <Link href="/admin/substitutions" className="w-full">
              <Button variant="ghost" className="w-full justify-between hover:bg-gray-50 dark:hover:bg-gray-800 text-sm h-10 font-normal">
                <span>View Substitution Queue</span>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
              </Button>
            </Link>
            <Link href="/admin/settings" className="w-full">
              <Button variant="ghost" className="w-full justify-between hover:bg-gray-50 dark:hover:bg-gray-800 text-sm h-10 font-normal">
                <span>Configure System Settings</span>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Second Row: Department Wise + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department-wise attendance */}
        <Card className="lg:col-span-2 border-0 shadow-sm dark:bg-gray-900/60">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Department Wise Attendance</CardTitle>
            <CardDescription>Average attendance percentage compared across departments.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.departmentWise} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100 dark:stroke-gray-800" />
                <XAxis dataKey="name" className="text-xs text-gray-500" tickLine={false} />
                <YAxis className="text-xs text-gray-500" domain={[50, 100]} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: 'none', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}
                  labelClassName="font-semibold text-gray-900"
                />
                <Bar dataKey="percentage" fill={barColor} radius={[4, 4, 0, 0]} barSize={40} name="Average Attendance %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card className="border-0 shadow-sm dark:bg-gray-900/60">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Recent Platform Activity</CardTitle>
            <CardDescription>Live logs and system operations feed.</CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="flow-root">
              <ul className="-mb-8">
                {recentActivities.map((activity, idx) => (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {idx !== recentActivities.length - 1 && (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-100 dark:bg-gray-800" aria-hidden="true" />
                      )}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-gray-900 ${activity.color}`}>
                            <Activity className="w-4 h-4" />
                          </span>
                        </div>
                        <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                              {activity.description}
                            </p>
                          </div>
                          <div className="text-right text-[10px] whitespace-nowrap text-gray-500">
                            {activity.time}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart3, Download, Calendar, ArrowUpRight } from 'lucide-react';
import { Label } from '@/components/ui/label';

export default function FacultyReportsPage() {
  const [isExporting, setIsExporting] = useState(false);

  // Mock charts data
  const subjectAttendanceData = [
    { name: 'Compiler Design', attendance: 88 },
    { name: 'Theory of Computation', attendance: 82 },
    { name: 'Data Structures', attendance: 91 },
    { name: 'Computer Networks', attendance: 70 },
  ];

  const sectionAttendanceData = [
    { name: 'CSE - Sec A', attendance: 89 },
    { name: 'CSE - Sec B', attendance: 84 },
    { name: 'ME - Sec A', attendance: 86 },
  ];

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert('Attendance Excel sheet download triggered!');
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Attendance Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Visualize participation rates across courses and sections.</p>
        </div>
        <Button onClick={handleExport} disabled={isExporting} className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2 h-9">
          <Download className="w-4 h-4" />
          {isExporting ? 'Exporting...' : 'Export Attendance Report'}
        </Button>
      </div>

      {/* Date controls */}
      <Card className="border-0 shadow-sm dark:bg-gray-900/60 p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="flex-1 space-y-1">
            <Label className="text-xs font-semibold text-gray-500 uppercase">Analysis Period</Label>
            <select className="w-full h-9 rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent px-3 text-sm outline-none">
              <option value="current_month">Current Month (June 2026)</option>
              <option value="last_30">Last 30 Days</option>
              <option value="semester">Academic Term 2026</option>
            </select>
          </div>
          <div className="flex-1 space-y-1">
            <Label className="text-xs font-semibold text-gray-500 uppercase">Audit Course</Label>
            <select className="w-full h-9 rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent px-3 text-sm outline-none">
              <option value="all">All Assigned Courses</option>
              <option value="sub-1">Compiler Design (CS301)</option>
              <option value="sub-2">Computer Networks (CS304)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject wise chart */}
        <Card className="border-0 shadow-sm dark:bg-gray-900/60">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Course Wise Attendance Rate</CardTitle>
            <CardDescription>Average attendance percentage compared by subjects.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectAttendanceData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100 dark:stroke-gray-800" />
                <XAxis dataKey="name" className="text-[10px] text-gray-500" tickLine={false} />
                <YAxis className="text-xs text-gray-500" domain={[50, 100]} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: 'none', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}
                />
                <Bar dataKey="attendance" fill="#9333ea" radius={[4, 4, 0, 0]} barSize={35} name="Attendance Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Section wise chart */}
        <Card className="border-0 shadow-sm dark:bg-gray-900/60">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Section Wise Average</CardTitle>
            <CardDescription>Average attendance percentages compared by class sections.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectionAttendanceData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100 dark:stroke-gray-800" />
                <XAxis dataKey="name" className="text-[10px] text-gray-500" tickLine={false} />
                <YAxis className="text-xs text-gray-500" domain={[50, 100]} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: 'none', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}
                />
                <Bar dataKey="attendance" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={35} name="Attendance Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

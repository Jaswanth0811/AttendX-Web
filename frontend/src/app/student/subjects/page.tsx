'use client';

import React from 'react';
import { mockStudentDashboard } from '@/lib/mock-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BookOpen } from 'lucide-react';

export default function StudentSubjectsPage() {
  const dashboard = mockStudentDashboard;

  const getStatusBadge = (pct: number) => {
    if (pct >= 85) {
      return (
        <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-450 hover:bg-emerald-50">
          Safe
        </Badge>
      );
    }
    if (pct >= 75) {
      return (
        <Badge className="bg-indigo-50 text-indigo-600 border border-indigo-100 dark:bg-indigo-950/20 dark:border-indigo-900/30 dark:text-indigo-400 hover:bg-indigo-50">
          Adequate
        </Badge>
      );
    }
    if (pct >= 65) {
      return (
        <Badge className="bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-950/20 dark:border-emerald-900/30 dark:text-amber-400 hover:bg-amber-50">
          Warning
        </Badge>
      );
    }
    return (
      <Badge className="bg-red-50 text-red-600 border border-red-100 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400 hover:bg-red-50">
        Critical
      </Badge>
    );
  };

  const getProgressColor = (pct: number) => {
    if (pct >= 85) return 'bg-emerald-550';
    if (pct >= 75) return 'bg-indigo-550';
    if (pct >= 65) return 'bg-amber-550';
    return 'bg-red-550';
  };

  // Format Recharts data
  const chartData = dashboard.subjectWise.map((sub) => ({
    code: sub.subject.code,
    name: sub.subject.name,
    percentage: sub.percentage,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Course Ledger</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Subject-wise class attendance tracking and threshold statuses.</p>
      </div>

      {/* Grid of Subject Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {dashboard.subjectWise.map((sub, idx) => (
          <Card key={idx} className="border-0 shadow-sm dark:bg-gray-900/60 overflow-hidden flex flex-col justify-between">
            <CardHeader className="pb-3 bg-teal-50/10 dark:bg-teal-950/5 border-b border-gray-50 dark:border-gray-850 flex flex-row items-center justify-between">
              <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400">{sub.subject.code}</span>
              {getStatusBadge(sub.percentage)}
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div>
                <h3 className="font-bold text-base text-gray-900 dark:text-gray-100 truncate">{sub.subject.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Semester 3 Syllabus Course</p>
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Class Attendance Rate</span>
                  <span className="font-extrabold text-gray-900 dark:text-gray-100">{sub.percentage}%</span>
                </div>
                <Progress value={sub.percentage} className={`h-2 ${getProgressColor(sub.percentage)} bg-gray-100 dark:bg-gray-800`} />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-50 dark:border-gray-850 text-xs">
                <div>
                  <span className="text-muted-foreground block">Classes Attended</span>
                  <span className="font-bold text-gray-900 dark:text-gray-100 mt-0.5 block">{sub.attended} Sessions</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Total Conducted</span>
                  <span className="font-bold text-gray-900 dark:text-gray-100 mt-0.5 block">{sub.totalClasses} Sessions</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Comparison chart card */}
      <Card className="border-0 shadow-sm dark:bg-gray-900/60">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Course Performance Chart</CardTitle>
          <CardDescription>Visual comparison of attendance percentages across enrolled syllabus modules.</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100 dark:stroke-gray-800" />
              <XAxis type="number" domain={[50, 100]} className="text-xs text-gray-500" tickLine={false} />
              <YAxis type="category" dataKey="code" className="text-xs text-gray-500" tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: 'none', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}
              />
              <Bar dataKey="percentage" fill="#0d9488" radius={[0, 4, 4, 0]} barSize={25} name="Attendance Rate %" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}


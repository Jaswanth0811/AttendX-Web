'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Users, Building, ShieldAlert, BookOpen, Download, Calendar, Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';

export default function ReportsPage() {
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  const handleGenerate = (reportId: string) => {
    setIsGenerating(reportId);
    setTimeout(() => {
      setIsGenerating(null);
      alert(`${reportId.toUpperCase()} report generated! Excel download triggered successfully.`);
    }, 1500);
  };

  const reports = [
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
      icon: Users,
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

      {/* Audit filter configurations */}
      <Card className="border-0 shadow-sm dark:bg-gray-900/60 p-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Date Range</Label>
            <select className="w-full h-10 rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50">
              <option value="today">Today (June 18, 2026)</option>
              <option value="week">Current Week</option>
              <option value="month">Current Month (June 2026)</option>
              <option value="semester">Semester Term 2026</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Academic Semester</Label>
            <select className="w-full h-10 rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50">
              <option value="all">All Semesters</option>
              <option value="sem-1">1st Semester</option>
              <option value="sem-3">3rd Semester</option>
              <option value="sem-5">5th Semester</option>
            </select>
          </div>
          <div className="space-y-2 flex items-end">
            <Button variant="outline" className="w-full h-10 flex items-center justify-center gap-2 border-gray-200 dark:border-gray-800">
              <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Custom Range Picker
            </Button>
          </div>
        </div>
      </Card>

      {/* Grid of Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report) => {
          const Icon = report.icon;
          const loading = isGenerating === report.id;

          return (
            <Card key={report.id} className="border-0 shadow-sm dark:bg-gray-900/60 overflow-hidden flex flex-col justify-between">
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
                  className="bg-indigo-600 hover:bg-indigo-700 text-white h-9 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
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

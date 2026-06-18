'use client';

import React from 'react';
import { mockStudentDashboard } from '@/lib/mock-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, ShieldCheck, HelpCircle, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function StudentAlertsPage() {
  const dashboard = mockStudentDashboard;

  // Let's filter critical vs warning
  // In our mock-data, there is one alert in mockStudentDashboard.alerts:
  // subjectId: 'sub-4', subjectName: 'Computer Networks', currentPercentage: 70, requiredPercentage: 75, classesNeeded: 3
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Attendance Alerts</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Critical notifications, warning flags, and rules compliance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Warnings (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-sm dark:bg-gray-900/60">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Active Warnings
              </CardTitle>
              <CardDescription>Courses requiring immediate attention to avoid exam hall ticket blocks.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboard.alerts.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Curriculum Standings Perfect</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Your attendance is above the 75% threshold in all course modules.</p>
                  </div>
                </div>
              ) : (
                dashboard.alerts.map((alert, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-red-150 bg-red-50/25 dark:border-red-950/30 dark:bg-red-950/10 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-sm text-gray-905 dark:text-gray-100">{alert.subjectName}</h4>
                        <p className="text-[10px] text-red-655 dark:text-red-400 font-semibold uppercase tracking-wider mt-0.5">Status: Critical Warning</p>
                      </div>
                      <Badge className="bg-red-500 text-white hover:bg-red-650 font-bold">
                        {alert.currentPercentage}% / {alert.requiredPercentage}% Target
                      </Badge>
                    </div>
                    <div className="p-3 rounded-lg bg-white dark:bg-gray-900 border border-red-100/40 dark:border-red-900/10 text-xs text-gray-700 dark:text-gray-300">
                      <span className="font-bold text-red-650 dark:text-red-400 block mb-1">Actions Required</span>
                      To restore adequate status, you must attend the next <span className="font-extrabold text-red-650 dark:text-red-400">{alert.classesNeeded} lectures</span> of this subject consecutively. Do not mark absent or miss scans.
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Advice card */}
          <Card className="border-0 shadow-sm dark:bg-gray-900/60 p-5 space-y-4">
            <h3 className="font-bold text-sm flex items-center gap-1.5">
              <HelpCircle className="w-4.5 h-4.5 text-teal-600 dark:text-teal-400" />
              Attendance Advice & Best Practices
            </h3>
            <ul className="space-y-3 text-xs text-gray-650 dark:text-gray-400 pl-4 list-disc leading-relaxed">
              <li>Keep the AttendX app updated. Outdated scanning engines might cause token validation delays.</li>
              <li>Arrive in class on time. Scans marking student presence post 15-minute delay will tag your attendance as &ldquo;late&rdquo; or fail entirely if grace period settings have closed.</li>
              <li>In case of camera hardware damage, request your lecturer to confirm your presence manually or enter the verbal backup passcode.</li>
            </ul>
          </Card>
        </div>

        {/* Right column: overall summary card (1/3 width) */}
        <Card className="border-0 shadow-sm dark:bg-gray-900/60 h-fit">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Eligibility Audit</CardTitle>
            <CardDescription>Audited status of your semester eligibility.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-gray-50/50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Threshold Target</span>
                <span className="font-bold">75.00%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Current Standing</span>
                <span className="font-bold text-teal-650 dark:text-teal-400">{dashboard.overallAttendance}.00%</span>
              </div>
              <div className="flex justify-between text-xs border-t border-dashed border-gray-200 dark:border-gray-800 pt-2.5">
                <span className="text-muted-foreground">Exam Eligibility</span>
                <Badge className="bg-emerald-50 text-emerald-650 dark:bg-emerald-950/20 dark:text-emerald-400 hover:bg-emerald-50">
                  Eligible
                </Badge>
              </div>
            </div>

            <Link href="/student/scan" className="w-full block">
              <Button className="w-full bg-teal-605 hover:bg-teal-705 text-white h-10 font-bold flex items-center justify-center gap-1.5">
                <UserCheck className="w-4.5 h-4.5" />
                Scan Now
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

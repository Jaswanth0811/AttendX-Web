'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog';
import { TrendingUp, Users, AlertTriangle, ShieldCheck, GraduationCap } from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function PromotionsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Promotion Dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<{
    fromYear: number;
    title: string;
    studentCount: number;
  } | null>(null);
  const [promoting, setPromoting] = useState(false);

  // Load current students and metadata
  async function loadData() {
    setLoading(true);
    const [studentsRes, metaRes] = await Promise.all([
      apiFetch('/api/admin/students'),
      apiFetch('/api/student/timetable/metadata')
    ]);

    if (studentsRes.success && studentsRes.data) {
      setStudents(studentsRes.data);
    }
    if (metaRes.success && metaRes.data) {
      setSemesters(metaRes.data.semesters || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  // Helpers to get student count for Year 1 & Year 2
  const getStudentsByYear = (year: number) => {
    const semNumbers = year === 1 ? [1, 2] : year === 2 ? [3, 4] : [5, 6];
    const semIds = semesters.filter(s => semNumbers.includes(s.number)).map(s => s.id);
    
    return students.filter(student => {
      const sId = student.profile?.semesterId || student.profile?.semester_id;
      return semIds.includes(sId);
    }).length;
  };

  const firstYearCount = getStudentsByYear(1);
  const secondYearCount = getStudentsByYear(2);

  const handleOpenConfirm = (fromYear: number, title: string, count: number) => {
    setSelectedPromotion({ fromYear, title, studentCount: count });
    setConfirmOpen(true);
  };

  const handleExecutePromotion = async () => {
    if (!selectedPromotion) return;
    setPromoting(true);

    const res = await apiFetch('/api/admin/students/promote', {
      method: 'POST',
      body: JSON.stringify({ fromYear: selectedPromotion.fromYear })
    });

    setPromoting(false);
    setConfirmOpen(false);

    if (res.success) {
      alert(res.message || 'Promotion executed successfully.');
      loadData();
    } else {
      alert(res.message || 'Failed to execute promotion.');
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          Academic Batch Promotions
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Transition students from their current academic year to the next year.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Promotion 1st Year to 2nd Year */}
        <Card className="border-0 shadow-sm dark:bg-gray-900/60 overflow-hidden relative">
          <CardHeader className="pb-4">
            <Badge className="w-fit bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 font-semibold mb-2 border-0">
              Year-over-Year Transition
            </Badge>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              1st Year ➔ 2nd Year
            </CardTitle>
            <CardDescription>
              Moves all students in Semester 1 & 2 to Semester 3 & 4. Updates student profile semesters and matches sections.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-950 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Eligible Students</p>
                <p className="text-2xl font-extrabold text-gray-950 dark:text-gray-55">{firstYearCount} Enrolled</p>
              </div>
              <GraduationCap className="w-10 h-10 text-gray-300 dark:text-gray-700" />
            </div>

            <Button
              onClick={() => handleOpenConfirm(1, '1st Year ➔ 2nd Year', firstYearCount)}
              disabled={firstYearCount === 0}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 shadow-lg shadow-indigo-500/10"
            >
              Promote to 2nd Year
            </Button>
          </CardContent>
        </Card>

        {/* Promotion 2nd Year to 3rd Year */}
        <Card className="border-0 shadow-sm dark:bg-gray-900/60 overflow-hidden relative">
          <CardHeader className="pb-4">
            <Badge className="w-fit bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 font-semibold mb-2 border-0">
              Year-over-Year Transition
            </Badge>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              2nd Year ➔ 3rd Year
            </CardTitle>
            <CardDescription>
              Moves all students in Semester 3 & 4 to Semester 5 & 6. Updates student profile semesters and matches sections.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-950 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Eligible Students</p>
                <p className="text-2xl font-extrabold text-gray-950 dark:text-gray-55">{secondYearCount} Enrolled</p>
              </div>
              <GraduationCap className="w-10 h-10 text-gray-300 dark:text-gray-700" />
            </div>

            <Button
              onClick={() => handleOpenConfirm(2, '2nd Year ➔ 3rd Year', secondYearCount)}
              disabled={secondYearCount === 0}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold h-11 shadow-lg shadow-purple-500/10"
            >
              Promote to 3rd Year
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Info Warning card */}
      <Card className="border border-amber-500/20 bg-amber-500/5 dark:bg-amber-950/10">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-amber-800 dark:text-amber-400">Important Administrative Warning</h4>
            <p className="text-xs text-amber-700/80 dark:text-amber-400/70 leading-relaxed">
              Batch promotion performs updates on all student profiles that match the selected source academic year.
              Please ensure that sections for the destination semesters are already created in the Departments Directory
              before executing the promotions so students can be mapped to classrooms successfully.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-5 h-5" />
              Confirm Academic Transition
            </DialogTitle>
            <DialogDescription>
              You are about to promote students of the selected batch.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-950 rounded-xl border border-gray-100 dark:border-gray-800">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Transition: <span className="font-bold text-gray-900 dark:text-white">{selectedPromotion?.title}</span>
            </p>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Students Affected: <span className="font-bold text-indigo-600 dark:text-indigo-400">{selectedPromotion?.studentCount} students</span>
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              This will update their semesters and match them to sections. This action is direct and will update both database profiles and in-memory caches.
            </p>
          </div>

          <DialogFooter className="mt-4 flex gap-2 justify-end">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="border-gray-200 dark:border-gray-800">
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={handleExecutePromotion}
              disabled={promoting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 px-4"
            >
              {promoting ? 'Promoting...' : 'Confirm Promotion'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

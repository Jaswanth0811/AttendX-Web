'use client';

import React, { useState } from 'react';
import { mockSubstitutions, mockFacultyProfiles, mockSubjects, mockUsers, mockTimetable, mockSections } from '@/lib/mock-data';
import { SubstitutionRequest } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shuffle, Check, X, Calendar, User, BookOpen } from 'lucide-react';

export default function SubstitutionsPage() {
  const [substitutions, setSubstitutions] = useState<SubstitutionRequest[]>(mockSubstitutions);

  const getFacultyName = (facId: string) => {
    const profile = mockFacultyProfiles.find((f) => f.id === facId);
    if (!profile) return 'Unknown';
    return mockUsers.find((u) => u.id === profile.userId)?.name || 'Unknown';
  };

  const getSubjectCode = (subId: string) => {
    return mockSubjects.find((s) => s.id === subId)?.code || 'SUB';
  };

  const getClassDetails = (timetableEntryId: string) => {
    const entry = mockTimetable.find((t) => t.id === timetableEntryId);
    if (!entry) return 'Class Details Unknown';
    const sub = mockSubjects.find((s) => s.id === entry.subjectId);
    const sec = mockSections.find((s) => s.id === entry.sectionId);
    return `${sub ? sub.code : 'SUB'} for Section ${sec ? sec.name : 'Sec'} (${entry.startTime} - {entry.endTime})`;
  };

  const handleApprove = (id: string) => {
    if (confirm('Are you sure you want to APPROVE this substitution?')) {
      setSubstitutions(
        substitutions.map((sub) =>
          sub.id === id ? { ...sub, status: 'approved', approvedAt: new Date().toISOString() } : sub
        )
      );
    }
  };

  const handleReject = (id: string) => {
    if (confirm('Are you sure you want to REJECT this substitution request?')) {
      setSubstitutions(
        substitutions.map((sub) =>
          sub.id === id ? { ...sub, status: 'rejected' } : sub
        )
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Substitution Approvals</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Approve or reject temporary class substitution requests from faculty.</p>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {substitutions.map((sub) => {
          const isPending = sub.status === 'pending';
          const isApproved = sub.status === 'approved';
          const isRejected = sub.status === 'rejected';

          return (
            <Card key={sub.id} className="border-0 shadow-sm dark:bg-gray-900/60 overflow-hidden flex flex-col justify-between">
              <div>
                <CardHeader className="pb-3 border-b border-gray-50 dark:border-gray-800 bg-gray-50/20 dark:bg-gray-900/10 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shuffle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="font-semibold text-xs text-gray-500 uppercase tracking-wider">Request ID: {sub.id}</span>
                  </div>
                  <Badge
                    className={
                      isApproved
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400'
                        : isRejected
                        ? 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-50 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400'
                        : 'bg-amber-50 text-amber-600 border border-amber-100 hover:bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-400'
                    }
                  >
                    {sub.status}
                  </Badge>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  {/* Class Info */}
                  <div className="flex gap-3">
                    <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 shrink-0 h-10 w-10 flex items-center justify-center">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Affected Class Details</p>
                      <p className="text-sm font-semibold text-gray-950 dark:text-gray-100 mt-0.5">
                        {getClassDetails(sub.timetableEntryId)}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Calendar className="w-3.5 h-3.5" /> Date: {sub.date}
                      </p>
                    </div>
                  </div>

                  {/* Staff Info */}
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <div>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Requesting Faculty</p>
                      <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1 mt-1">
                        <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        {getFacultyName(sub.requestingFacultyId)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Proposed Substitute</p>
                      <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1 mt-1">
                        <User className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        {getFacultyName(sub.substituteFacultyId)}
                      </p>
                    </div>
                  </div>

                  {/* Reason */}
                  <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Reason for absence</p>
                    <p className="text-xs text-gray-700 dark:text-gray-300 mt-1 italic leading-relaxed">
                      &ldquo;{sub.reason || 'No reason specified.'}&rdquo;
                    </p>
                  </div>
                </CardContent>
              </div>

              {/* Actions Footer */}
              {isPending && (
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/10 flex gap-2 justify-end">
                  <Button variant="outline" size="sm" onClick={() => handleReject(sub.id)} className="text-red-600 hover:text-red-700 dark:hover:bg-red-950/20 border-red-200 hover:bg-red-50 h-9">
                    <X className="w-4 h-4 mr-1.5" /> Reject Request
                  </Button>
                  <Button size="sm" onClick={() => handleApprove(sub.id)} className="bg-indigo-600 hover:bg-indigo-700 text-white h-9">
                    <Check className="w-4 h-4 mr-1.5" /> Approve Substitution
                  </Button>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

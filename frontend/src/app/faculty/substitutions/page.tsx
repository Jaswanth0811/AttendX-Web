'use client';

import React, { useState } from 'react';
import { mockSubstitutions, mockTimetable, mockFacultyProfiles, mockSubjects, mockUsers, mockSections } from '@/lib/mock-data';
import { SubstitutionRequest, SubjectOption, DayOfWeek } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shuffle, Calendar, Plus, User, Info } from 'lucide-react';

export default function FacultySubstitutionsPage() {
  const [substitutions, setSubstitutions] = useState<SubstitutionRequest[]>(
    mockSubstitutions.filter((s) => s.requestingFacultyId === 'fac-1')
  );

  // Form states
  const [timetableEntryId, setTimetableEntryId] = useState(mockTimetable[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [substituteFacultyId, setSubstituteFacultyId] = useState(mockFacultyProfiles[1]?.id || '');
  const [subjectOption, setSubjectOption] = useState<SubjectOption>('same_subject');
  const [substituteSubjectId, setSubstituteSubjectId] = useState(mockSubjects[0]?.id || '');
  const [reason, setReason] = useState('');

  const myClasses = mockTimetable.filter((t) => t.facultyId === 'fac-1');

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
    if (!entry) return 'Class Unknown';
    const sub = mockSubjects.find((s) => s.id === entry.subjectId);
    const sec = mockSections.find((s) => s.id === entry.sectionId);
    return `${sub ? sub.code : 'SUB'} - Section ${sec ? sec.name : 'Sec'} (${entry.day} ${entry.startTime})`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newRequest: SubstitutionRequest = {
      id: `subst-${Date.now()}`,
      requestingFacultyId: 'fac-1',
      substituteFacultyId,
      timetableEntryId,
      date,
      reason,
      subjectOption,
      substituteSubjectId: subjectOption === 'different_subject' ? substituteSubjectId : undefined,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setSubstitutions([newRequest, ...substitutions]);
    setReason('');
    alert('Substitution request submitted! Awaiting administrator approval.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Substitution Requests</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Arrange alternative teaching cover for your scheduled lectures during absence.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Create Request Form (1/3 width) */}
        <Card className="border-0 shadow-sm dark:bg-gray-900/60 lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Shuffle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Request Substitution
            </CardTitle>
            <CardDescription>File a cover form for administrator auditing.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Select Lecture */}
              <div className="space-y-2">
                <Label htmlFor="class">Select Lecture Slot</Label>
                <select
                  id="class"
                  value={timetableEntryId}
                  onChange={(e) => setTimetableEntryId(e.target.value)}
                  className="w-full h-10 rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 font-medium"
                >
                  {myClasses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {getClassDetails(c.id)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="date">Absence Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-10 border-gray-200 dark:border-gray-800 font-semibold"
                  required
                />
              </div>

              {/* Cover Teacher */}
              <div className="space-y-2">
                <Label htmlFor="substitute">Substitute Faculty</Label>
                <select
                  id="substitute"
                  value={substituteFacultyId}
                  onChange={(e) => setSubstituteFacultyId(e.target.value)}
                  className="w-full h-10 rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {mockFacultyProfiles
                    .filter((f) => f.id !== 'fac-1')
                    .map((fac) => (
                      <option key={fac.id} value={fac.id}>
                        {getFacultyName(fac.id)}
                      </option>
                    ))}
                </select>
              </div>

              {/* Syllabus cover type */}
              <div className="space-y-2">
                <Label>Syllabus Option</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={subjectOption === 'same_subject' ? 'default' : 'outline'}
                    onClick={() => setSubjectOption('same_subject')}
                    className={subjectOption === 'same_subject' ? 'bg-purple-650 hover:bg-purple-750 text-white h-9' : 'border-gray-200 dark:border-gray-800 h-9'}
                  >
                    Same Course
                  </Button>
                  <Button
                    type="button"
                    variant={subjectOption === 'different_subject' ? 'default' : 'outline'}
                    onClick={() => setSubjectOption('different_subject')}
                    className={subjectOption === 'different_subject' ? 'bg-purple-650 hover:bg-purple-750 text-white h-9' : 'border-gray-200 dark:border-gray-800 h-9'}
                  >
                    Different Course
                  </Button>
                </div>
              </div>

              {subjectOption === 'different_subject' && (
                <div className="space-y-2">
                  <Label htmlFor="subject">Substitute Subject</Label>
                  <select
                    id="subject"
                    value={substituteSubjectId}
                    onChange={(e) => setSubstituteSubjectId(e.target.value)}
                    className="w-full h-10 rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    {mockSubjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.code} - {sub.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Reason */}
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Absence</Label>
                <textarea
                  id="reason"
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Medical leave, external exam duty, etc."
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent p-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-none"
                  required
                />
              </div>

              <Button type="submit" className="w-full bg-purple-650 hover:bg-purple-750 text-white h-10 font-bold">
                Submit Cover Request
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Right Side: Requests History (2/3 width) */}
        <Card className="border-0 shadow-sm dark:bg-gray-900/60 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Absence Cover History</CardTitle>
            <CardDescription>Status history of cover requests submitted by you.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {substitutions.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-muted-foreground text-sm">
                No substitution requests found.
              </div>
            ) : (
              substitutions.map((sub) => {
                const isPending = sub.status === 'pending';
                const isApproved = sub.status === 'approved';
                const isRejected = sub.status === 'rejected';

                return (
                  <div
                    key={sub.id}
                    className="p-4 rounded-xl border border-gray-100 dark:border-gray-850 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span className="text-xs font-semibold text-gray-500">Scheduled: {sub.date}</span>
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
                      </div>
                      <p className="text-sm font-bold text-gray-950 dark:text-gray-100">
                        {getClassDetails(sub.timetableEntryId)}
                      </p>
                      <p className="text-xs text-gray-650 dark:text-gray-400 flex items-center gap-1.5 font-medium">
                        <User className="w-3.5 h-3.5 text-gray-400" /> Substitute: {getFacultyName(sub.substituteFacultyId)}
                        {sub.subjectOption === 'different_subject' && (
                          <span className="text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded font-bold dark:bg-purple-950/20 dark:text-purple-400">
                            Covering: {getSubjectCode(sub.substituteSubjectId!)}
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="text-right sm:max-w-xs">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">Absence Reason</span>
                      <p className="text-xs text-gray-600 dark:text-gray-400 italic leading-relaxed">
                        &ldquo;{sub.reason || 'No description'}&rdquo;
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shuffle, Calendar, User, Info } from 'lucide-react';
import { useAuth } from '@/store/auth-context';
import { apiFetch } from '@/lib/api';

export default function FacultySubstitutionsPage() {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [substitutions, setSubstitutions] = useState<any[]>([]);
  const [myClasses, setMyClasses] = useState<any[]>([]);
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [subjectsList, setSubjectsList] = useState<any[]>([]);

  // Form states
  const [timetableEntryId, setTimetableEntryId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [substituteFacultyId, setSubstituteFacultyId] = useState('');
  const [subjectOption, setSubjectOption] = useState<'same_subject' | 'different_subject'>('same_subject');
  const [substituteSubjectId, setSubstituteSubjectId] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      // 1. Fetch cover request history
      const historyRes = await apiFetch('/api/faculty/substitutions');
      if (historyRes.success && historyRes.data) {
        setSubstitutions(historyRes.data);
      }

      // 2. Fetch my timetable classes
      const timetableRes = await apiFetch('/api/faculty/timetable');
      if (timetableRes.success && timetableRes.data) {
        setMyClasses(timetableRes.data);
        if (timetableRes.data.length > 0) {
          setTimetableEntryId(timetableRes.data[0].id);
        }
      }

      // 3. Fetch colleague faculty list
      const facultyRes = await apiFetch('/api/faculty/faculty-list');
      if (facultyRes.success && facultyRes.data) {
        setFacultyList(facultyRes.data);
        const firstColleague = facultyRes.data.find((f: any) => f.id !== user?.profileId);
        if (firstColleague) {
          setSubstituteFacultyId(firstColleague.id);
        }
      }

      // 4. Fetch subjects list
      const subjectsRes = await apiFetch('/api/faculty/subjects');
      if (subjectsRes.success && subjectsRes.data) {
        setSubjectsList(subjectsRes.data);
        if (subjectsRes.data.length > 0) {
          setSubstituteSubjectId(subjectsRes.data[0].id);
        }
      }

      setLoading(false);
    }
    loadData();
  }, [user?.profileId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!timetableEntryId || !substituteFacultyId || !date) {
      alert('Please fill out all required cover request details.');
      return;
    }

    setSubmitting(true);
    const body = {
      timetableEntryId,
      date,
      substituteFacultyId,
      subjectOption,
      substituteSubjectId: subjectOption === 'different_subject' ? substituteSubjectId : undefined,
      reason
    };

    const res = await apiFetch('/api/faculty/substitutions', {
      method: 'POST',
      body: JSON.stringify(body)
    });

    if (res.success && res.data) {
      // Refresh Cover request list
      const historyRes = await apiFetch('/api/faculty/substitutions');
      if (historyRes.success && historyRes.data) {
        setSubstitutions(historyRes.data);
      }
      setReason('');
      alert('Substitution request submitted! Awaiting administrator approval.');
    } else {
      alert(res.message || 'Failed to submit cover request.');
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

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
                {myClasses.length === 0 ? (
                  <p className="text-xs text-red-500 py-1 font-semibold">You have no scheduled slots to request substitution for.</p>
                ) : (
                  <select
                    id="class"
                    value={timetableEntryId}
                    onChange={(e) => setTimetableEntryId(e.target.value)}
                    className="w-full h-10 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 text-sm outline-none focus-visible:border-ring font-medium"
                    required
                  >
                    {myClasses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.subjectCode} - {c.sectionName} ({c.day} {c.startTime.substring(0, 5)})
                      </option>
                    ))}
                  </select>
                )}
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
                  className="w-full h-10 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 text-sm outline-none focus-visible:border-ring font-medium"
                  required
                >
                  {facultyList
                    .filter((f) => f.id !== user?.profileId)
                    .map((fac) => (
                      <option key={fac.id} value={fac.id}>
                        {fac.name} ({fac.departmentName})
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
                    className={subjectOption === 'same_subject' ? 'bg-purple-600 hover:bg-purple-700 text-white h-9 font-semibold' : 'border-gray-200 dark:border-gray-800 h-9 font-semibold'}
                  >
                    Same Course
                  </Button>
                  <Button
                    type="button"
                    variant={subjectOption === 'different_subject' ? 'default' : 'outline'}
                    onClick={() => setSubjectOption('different_subject')}
                    className={subjectOption === 'different_subject' ? 'bg-purple-600 hover:bg-purple-700 text-white h-9 font-semibold' : 'border-gray-200 dark:border-gray-800 h-9 font-semibold'}
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
                    className="w-full h-10 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 text-sm outline-none focus-visible:border-ring font-medium"
                    required
                  >
                    {subjectsList.map((sub) => (
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
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-3 text-sm outline-none focus-visible:border-ring resize-none font-medium"
                  required
                />
              </div>

              <Button 
                type="submit" 
                disabled={submitting || myClasses.length === 0}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white h-10 font-bold disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Cover Request'}
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

                const formattedCoverDate = new Date(sub.date).toLocaleDateString([], { dateStyle: 'medium' });

                return (
                  <div
                    key={sub.id}
                    className="p-4 rounded-xl border border-gray-100 dark:border-gray-850 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span className="text-xs font-semibold text-gray-500">Scheduled: {formattedCoverDate}</span>
                        <Badge
                          className={
                            isApproved
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400 font-bold text-[10px]'
                              : isRejected
                              ? 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-50 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400 font-bold text-[10px]'
                              : 'bg-amber-50 text-amber-600 border border-amber-100 hover:bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-400 font-bold text-[10px]'
                          }
                        >
                          {sub.status}
                        </Badge>
                      </div>
                      <p className="text-sm font-bold text-gray-950 dark:text-gray-100">
                        {sub.subjectCode} - Section {sub.sectionName}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1.5 font-medium">
                        <User className="w-3.5 h-3.5 text-gray-400" /> 
                        {sub.requestingFacultyId === user?.profileId ? (
                          <>Substitute: {sub.substituteFacultyName}</>
                        ) : (
                          <>Substitute For: {sub.requestingFacultyName}</>
                        )}
                        {sub.subjectOption === 'different_subject' && (
                          <span className="text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded font-bold dark:bg-purple-950/20 dark:text-purple-400">
                            Covering: {sub.substituteSubjectCode}
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="text-right sm:max-w-xs">
                      <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Cover Reason</span>
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


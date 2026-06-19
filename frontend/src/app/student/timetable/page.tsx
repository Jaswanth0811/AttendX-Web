'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Clock, User, Filter } from 'lucide-react';
import { apiFetch } from '@/lib/api';

const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export default function StudentTimetablePage() {
  const [loading, setLoading] = useState(true);
  const [fetchingTimetable, setFetchingTimetable] = useState(false);
  const [metadata, setMetadata] = useState<{ departments: any[]; semesters: any[]; sections: any[] }>({
    departments: [],
    semesters: [],
    sections: []
  });

  const [selectedDept, setSelectedDept] = useState('');
  const [selectedSem, setSelectedSem] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [timetable, setTimetable] = useState<any[]>([]);

  // On mount: Fetch dropdown metadata and default student timetable
  useEffect(() => {
    async function init() {
      // 1. Fetch metadata
      const metaRes = await apiFetch('/api/student/timetable/metadata');
      if (metaRes.success && metaRes.data) {
        setMetadata(metaRes.data);
      }

      // 2. Fetch default student timetable
      const ttRes = await apiFetch('/api/student/timetable');
      if (ttRes.success && ttRes.data) {
        setTimetable(ttRes.data);
      }
      setLoading(false);
    }
    init();
  }, []);

  // Filter sections list based on selected department and semester
  const availableSections = metadata.sections.filter(sec => {
    const matchDept = !selectedDept || sec.department_id === selectedDept || sec.departmentId === selectedDept;
    const matchSem = !selectedSem || sec.semester_id === selectedSem || sec.semesterId === selectedSem;
    return matchDept && matchSem;
  });

  // Handle Search submit
  const handleFilterSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSection) return;
    setFetchingTimetable(true);
    const res = await apiFetch(`/api/student/timetable?sectionId=${selectedSection}`);
    if (res.success && res.data) {
      setTimetable(res.data);
    }
    setFetchingTimetable(false);
  };

  // Group timetable entries by day of the week
  const groupedTimetable: Record<string, any[]> = DAYS_OF_WEEK.reduce((acc, day) => {
    acc[day] = [];
    return acc;
  }, {} as Record<string, any[]>);

  timetable.forEach(entry => {
    const dayKey = entry.day.toLowerCase();
    if (groupedTimetable[dayKey]) {
      groupedTimetable[dayKey].push(entry);
    }
  });

  // Sort daily entries by start_time
  DAYS_OF_WEEK.forEach(day => {
    groupedTimetable[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
  });

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center bg-gray-50/50 dark:bg-gray-950/30">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  // Get current day of the week to highlight
  const currentDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Class Timetable</h1>
        <p className="text-sm text-muted-foreground mt-0.5">View your weekly class schedule or search other branches/sections.</p>
      </div>

      {/* Filter Card */}
      <Card className="border-0 shadow-sm dark:bg-gray-900/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Filter className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            Timetable Search Filter
          </CardTitle>
          <CardDescription>Select branch, semester, and section to view alternate timetables.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFilterSearch} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
            {/* Department */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase">Branch / Department</label>
              <select
                value={selectedDept}
                onChange={(e) => {
                  setSelectedDept(e.target.value);
                  setSelectedSection('');
                }}
                className="w-full h-10 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 text-sm outline-none focus-visible:border-ring font-medium"
              >
                <option value="">Select Department</option>
                {metadata.departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>

            {/* Semester */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase">Semester</label>
              <select
                value={selectedSem}
                onChange={(e) => {
                  setSelectedSem(e.target.value);
                  setSelectedSection('');
                }}
                className="w-full h-10 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 text-sm outline-none focus-visible:border-ring font-medium"
              >
                <option value="">Select Semester</option>
                {metadata.semesters.map(s => (
                  <option key={s.id} value={s.id}>{s.name || `Semester ${s.number}`}</option>
                ))}
              </select>
            </div>

            {/* Section */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase">Section</label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                disabled={availableSections.length === 0}
                className="w-full h-10 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 text-sm outline-none focus-visible:border-ring font-medium disabled:opacity-50"
              >
                <option value="">Select Section</option>
                {availableSections.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!selectedSection || fetchingTimetable}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold h-10 shadow-md shadow-teal-500/10 disabled:opacity-50"
            >
              {fetchingTimetable ? 'Loading...' : 'Search Timetable'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Timetable Weekly View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {DAYS_OF_WEEK.map(day => {
          const isToday = day === currentDayName;
          const entries = groupedTimetable[day];

          return (
            <Card
              key={day}
              className={`border-0 shadow-sm dark:bg-gray-900/60 overflow-hidden transition-all ${
                isToday 
                  ? 'ring-2 ring-teal-500/50 shadow-lg scale-[1.01]' 
                  : ''
              }`}
            >
              <CardHeader className={`pb-3 ${isToday ? 'bg-teal-50/50 dark:bg-teal-950/20' : 'bg-gray-50/40 dark:bg-gray-900/20'}`}>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <Calendar className={`w-4 h-4 ${isToday ? 'text-teal-600 dark:text-teal-400' : 'text-gray-400'}`} />
                    {day}
                  </CardTitle>
                  {isToday && (
                    <span className="text-[10px] font-bold text-white bg-teal-600 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Today
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-4 px-5 pb-5">
                {entries.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6">No lectures scheduled.</p>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-gray-800 space-y-3.5">
                    {entries.map((entry, idx) => (
                      <div key={entry.id} className={`flex items-start gap-4 pt-3.5 first:pt-0`}>
                        {/* Time block */}
                        <div className="flex items-center gap-1.5 text-gray-500 font-mono text-xs w-28 shrink-0">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span>{entry.startTime.substring(0, 5)} - {entry.endTime.substring(0, 5)}</span>
                        </div>

                        {/* Details */}
                        <div className="flex-1 space-y-1 min-w-0">
                          <p className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wide">
                            {entry.subjectCode}
                          </p>
                          <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-snug truncate">
                            {entry.subjectName}
                          </h4>
                          <div className="flex flex-wrap gap-x-3.5 gap-y-1 text-xs text-gray-400 mt-1">
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5" />
                              {entry.facultyName}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {entry.room || 'TBA'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}


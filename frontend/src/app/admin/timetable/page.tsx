'use client';

import React, { useState } from 'react';
import { mockTimetable, mockFacultyProfiles, mockSubjects, mockSections, mockUsers, mockDepartments } from '@/lib/mock-data';
import { TimetableEntry, DayOfWeek } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, Calendar, Search, Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';

const DAYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const TIME_SLOTS = [
  { start: '09:00', end: '10:00', label: '09:00 AM - 10:00 AM' },
  { start: '10:00', end: '11:00', label: '10:00 AM - 11:00 AM' },
  { start: '11:00', end: '12:00', label: '11:00 AM - 12:00 PM' },
  { start: '13:00', end: '14:00', label: '01:00 PM - 02:00 PM' },
  { start: '14:00', end: '15:00', label: '02:00 PM - 03:00 PM' },
  { start: '15:00', end: '16:00', label: '03:00 PM - 04:00 PM' },
];

export default function TimetablePage() {
  const [timetable, setTimetable] = useState<TimetableEntry[]>(mockTimetable);
  const [sectionFilter, setSectionFilter] = useState(mockSections[0]?.id || 'sec-1');
  const [isOpen, setIsOpen] = useState(false);

  // Form states
  const [day, setDay] = useState<DayOfWeek>('monday');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [facultyId, setFacultyId] = useState(mockFacultyProfiles[0]?.id || '');
  const [subjectId, setSubjectId] = useState(mockSubjects[0]?.id || '');
  const [room, setRoom] = useState('CS-101');

  const getFacultyName = (facId: string) => {
    const profile = mockFacultyProfiles.find((f) => f.id === facId);
    if (!profile) return 'Unknown';
    return mockUsers.find((u) => u.id === profile.userId)?.name || 'Unknown';
  };

  const getSubjectCode = (subId: string) => {
    return mockSubjects.find((s) => s.id === subId)?.code || 'SUB';
  };

  const getDeptColor = (subId: string) => {
    const sub = mockSubjects.find((s) => s.id === subId);
    if (!sub) return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700';
    const dept = mockDepartments.find((d) => d.id === sub.departmentId);
    if (!dept) return 'bg-gray-100 text-gray-800 border-gray-200';

    switch (dept.code) {
      case 'CSE':
        return 'bg-indigo-50 border-indigo-100 text-indigo-700 dark:bg-indigo-950/35 dark:border-indigo-900/30 dark:text-indigo-400';
      case 'ME':
        return 'bg-amber-50 border-amber-100 text-amber-700 dark:bg-amber-950/35 dark:border-amber-900/30 dark:text-amber-400';
      case 'ECE':
        return 'bg-purple-50 border-purple-100 text-purple-700 dark:bg-purple-950/35 dark:border-purple-900/30 dark:text-purple-400';
      case 'EEE':
        return 'bg-blue-50 border-blue-100 text-blue-700 dark:bg-blue-950/35 dark:border-blue-900/30 dark:text-blue-400';
      case 'CE':
        return 'bg-teal-50 border-teal-100 text-teal-700 dark:bg-teal-950/35 dark:border-teal-900/30 dark:text-teal-400';
      default:
        return 'bg-gray-50 border-gray-100 text-gray-700 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-300';
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this timetable entry?')) {
      setTimetable(timetable.filter((t) => t.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: TimetableEntry = {
      id: `tt-${Date.now()}`,
      day,
      startTime,
      endTime,
      facultyId,
      subjectId,
      sectionId: sectionFilter,
      room,
      isActive: true,
    };
    setTimetable([...timetable, newEntry]);
    setIsOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Timetable Scheduler</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage weekly lecture slot grid for college sections.</p>
        </div>
        <Button onClick={() => setIsOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Timetable Entry
        </Button>
      </div>

      {/* Grid Controller */}
      <Card className="border-0 shadow-sm dark:bg-gray-900/60 p-4">
        <div className="flex items-center gap-3">
          <Label className="text-sm font-semibold">Select Section Schedule:</Label>
          <select
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            className="h-9 rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 font-medium text-indigo-600 dark:text-indigo-400"
          >
            {mockSections.map((sec) => (
              <option key={sec.id} value={sec.id}>
                Class Section: {sec.name}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Weekly Grid */}
      <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-850 shadow-sm bg-white dark:bg-gray-900">
        <div className="min-w-[800px]">
          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40 text-center h-12 items-center">
            <div className="font-semibold text-xs uppercase tracking-wider text-gray-500 border-r border-gray-100 dark:border-gray-850">Time Slot</div>
            {DAYS.map((day) => (
              <div key={day} className="font-semibold text-xs uppercase tracking-wider text-gray-500 capitalize">
                {day}
              </div>
            ))}
          </div>

          {/* Time Rows */}
          {TIME_SLOTS.map((slot, sIdx) => (
            <div key={sIdx} className="grid grid-cols-7 border-b border-gray-100 dark:border-gray-800 min-h-[100px] items-stretch">
              {/* Slot Header */}
              <div className="flex flex-col justify-center items-center text-center p-3 border-r border-gray-100 dark:border-gray-850 bg-gray-50/10 dark:bg-gray-900/10">
                <span className="text-xs font-bold text-gray-900 dark:text-gray-100">{slot.start} - {slot.end}</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">Lecture Slot</span>
              </div>

              {/* Day slots */}
              {DAYS.map((day) => {
                // Find entry that starts at this slot
                const entry = timetable.find(
                  (t) =>
                    t.day === day &&
                    t.startTime === slot.start &&
                    t.sectionId === sectionFilter
                );

                return (
                  <div key={day} className="p-2 flex flex-col justify-between items-stretch relative group border-r border-gray-100 dark:border-gray-850/40">
                    {entry ? (
                      <div className={`p-2.5 rounded-lg border flex flex-col h-full justify-between transition-shadow hover:shadow-sm ${getDeptColor(entry.subjectId)}`}>
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-sm tracking-tight">{getSubjectCode(entry.subjectId)}</span>
                            <button
                              onClick={() => handleDelete(entry.id)}
                              className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity p-0.5 rounded hover:bg-red-50 dark:hover:bg-red-950/20"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-[10px] opacity-80 mt-1 font-medium leading-normal truncate">{getFacultyName(entry.facultyId)}</p>
                        </div>
                        <div className="flex items-center justify-between text-[9px] mt-2 font-bold opacity-75">
                          <span>Room {entry.room || 'TBD'}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center border border-dashed border-gray-100 dark:border-gray-800 rounded-lg text-[10px] text-gray-300 dark:text-gray-700 font-medium">
                        Free Slot
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Add Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Add Class slot
            </DialogTitle>
            <DialogDescription>
              Schedule a weekly slot for this section.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="day">Weekly Day</Label>
                <select
                  id="day"
                  value={day}
                  onChange={(e) => setDay(e.target.value as DayOfWeek)}
                  className="w-full h-10 rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {DAYS.map((d) => (
                    <option key={d} value={d} className="capitalize">
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Time Slot</Label>
                <select
                  id="time"
                  value={startTime}
                  onChange={(e) => {
                    setStartTime(e.target.value);
                    // Set end time automatically
                    const slot = TIME_SLOTS.find((s) => s.start === e.target.value);
                    if (slot) setEndTime(slot.end);
                  }}
                  className="w-full h-10 rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot.start} value={slot.start}>
                      {slot.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <select
                id="subject"
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full h-10 rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {mockSubjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.code} - {sub.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="faculty">Faculty Member</Label>
                <select
                  id="faculty"
                  value={facultyId}
                  onChange={(e) => setFacultyId(e.target.value)}
                  className="w-full h-10 rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {mockFacultyProfiles.map((fac) => (
                    <option key={fac.id} value={fac.id}>
                      {getFacultyName(fac.id)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="room">Room Number</Label>
                <Input
                  id="room"
                  placeholder="CS-101"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  className="h-10 border-gray-200 dark:border-gray-800 font-semibold"
                  required
                />
              </div>
            </div>

            <DialogFooter className="mt-6 flex gap-2">
              <DialogClose asChild>
                <Button type="button" variant="outline" className="border-gray-200 dark:border-gray-800">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Schedule Slot
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

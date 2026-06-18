'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { mockTimetable, mockSubjects, mockSections, mockStudentProfiles, mockUsers } from '@/lib/mock-data';
import { TimetableEntry } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Hash, ArrowLeft, Users, Play, CheckCircle2, UserCheck, AlertCircle, RefreshCw } from 'lucide-react';

interface ScannedStudent {
  rollNumber: string;
  name: string;
  time: string;
  status: 'present' | 'late';
}

export default function FacultyAttendanceQRPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const slotId = searchParams.get('slot');

  const facultyId = 'fac-1'; // Dr. Kumar
  const todaysClasses = mockTimetable.filter((t) => t.facultyId === facultyId && t.day === 'wednesday');

  // Active slot
  const [selectedSlot, setSelectedSlot] = useState<TimetableEntry | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [activeCode, setActiveCode] = useState<string>('');
  const [countdown, setCountdown] = useState(30);
  const [totalStudentsCount, setTotalStudentsCount] = useState(60);
  const [presentStudents, setPresentStudents] = useState<ScannedStudent[]>([]);

  // Timer reference
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const simulationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (slotId) {
      const slot = todaysClasses.find((t) => t.id === slotId);
      if (slot) setSelectedSlot(slot);
    }
  }, [slotId, todaysClasses]);

  // Helper to generate a 6-digit random alphanumeric code
  const generate6DigitCode = (): string => {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  };

  // Handle code generation
  const generateNewCode = (slot: TimetableEntry) => {
    const code = generate6DigitCode();
    setActiveCode(code);
    setCountdown(30);
  };

  // Start Session
  const handleStartSession = () => {
    if (!selectedSlot) return;
    setIsSessionActive(true);
    generateNewCode(selectedSlot);

    // Countdown interval
    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          return 30; // reset
        }
        return prev - 1;
      });
    }, 1000);

    // Refresh interval
    refreshIntervalRef.current = setInterval(() => {
      generateNewCode(selectedSlot);
    }, 30000);

    // Simulate real-time student scans
    let scanCount = 0;
    const allStudents = mockStudentProfiles.map((profile) => {
      const user = mockUsers.find((u) => u.id === profile.userId);
      return { rollNumber: profile.rollNumber, name: user?.name || 'Student' };
    });

    const simulateScan = () => {
      if (scanCount < 8 && isSessionActive) {
        const studentIndex = Math.floor(Math.random() * allStudents.length);
        const selected = allStudents[studentIndex];

        // check if already added
        setPresentStudents((prev) => {
          const exists = prev.some((s) => s.rollNumber === selected.rollNumber);
          if (!exists) {
            const isLate = Math.random() > 0.8;
            const now = new Date();
            const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
            return [
              {
                rollNumber: selected.rollNumber,
                name: selected.name,
                time: timeStr,
                status: isLate ? 'late' : 'present',
              },
              ...prev,
            ];
          }
          return prev;
        });

        scanCount++;
        simulationTimeoutRef.current = setTimeout(simulateScan, Math.random() * 4000 + 1000);
      }
    };

    simulationTimeoutRef.current = setTimeout(simulateScan, 2000);
  };

  // End Session
  const handleEndSession = () => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
    if (simulationTimeoutRef.current) clearTimeout(simulationTimeoutRef.current);

    setIsSessionActive(false);
    alert(`Attendance Session Closed! total students present: ${presentStudents.length}. Saving records to history.`);
    router.push('/faculty');
  };

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
      if (simulationTimeoutRef.current) clearTimeout(simulationTimeoutRef.current);
    };
  }, []);

  const getSubjectName = (subId: string) => {
    return mockSubjects.find((s) => s.id === subId)?.name || 'Unknown';
  };

  const getSubjectCode = (subId: string) => {
    return mockSubjects.find((s) => s.id === subId)?.code || 'SUB';
  };

  const getSectionName = (secId: string) => {
    return mockSections.find((s) => s.id === secId)?.name || 'A';
  };

  // Step 1: Select Class
  if (!isSessionActive) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Conduct Attendance</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Choose one of your scheduled lectures to begin the QR code session.</p>
        </div>

        {selectedSlot ? (
          <div className="max-w-2xl mx-auto">
            <Card className="border-0 shadow-lg dark:bg-gray-900/60 p-6 space-y-6">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => setSelectedSlot(null)} className="h-8 w-8 text-gray-500">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                  <h3 className="font-bold text-lg">Confirm Lecture Selection</h3>
                  <p className="text-xs text-muted-foreground">Double check details before starting class attendance.</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 space-y-3">
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Subject</span>
                  <span className="text-sm font-semibold text-gray-950 dark:text-gray-100">{getSubjectCode(selectedSlot.subjectId)} - {getSubjectName(selectedSlot.subjectId)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Class Section</span>
                  <span className="text-sm font-semibold text-gray-950 dark:text-gray-100">Section {getSectionName(selectedSlot.sectionId)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Room</span>
                  <span className="text-sm font-semibold text-gray-950 dark:text-gray-100">Room {selectedSlot.room}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Scheduled Timings</span>
                  <span className="text-sm font-semibold text-gray-950 dark:text-gray-100">{selectedSlot.startTime} - {selectedSlot.endTime}</span>
                </div>
              </div>

              <Button onClick={handleStartSession} className="w-full bg-purple-600 hover:bg-purple-700 text-white h-11 flex items-center justify-center gap-2 text-sm font-bold shadow-lg shadow-purple-500/20">
                <Play className="w-4 h-4" />
                Start Live QR Session
              </Button>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {todaysClasses.map((cls) => (
              <Card key={cls.id} className="border-0 shadow-sm hover:shadow-md transition-shadow dark:bg-gray-900/60 overflow-hidden flex flex-col justify-between">
                <CardHeader className="pb-3 bg-purple-50/20 dark:bg-purple-950/10 border-b border-gray-100 dark:border-gray-800">
                  <Badge className="w-fit bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 hover:bg-purple-100 mb-1">
                    Room {cls.room}
                  </Badge>
                  <CardTitle className="text-base font-bold text-gray-950 dark:text-gray-100">{getSubjectCode(cls.subjectId)}</CardTitle>
                  <CardDescription className="text-xs truncate">{getSubjectName(cls.subjectId)}</CardDescription>
                </CardHeader>
                <CardContent className="pt-4 pb-5 space-y-4">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Section</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">Section {getSectionName(cls.sectionId)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Timing Slot</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{cls.startTime} - {cls.endTime}</span>
                  </div>
                  <Button onClick={() => setSelectedSlot(cls)} className="w-full bg-purple-600 hover:bg-purple-700 text-white h-9">
                    Select Class
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Step 2 & 3: Active Session Live QR + Live Monitoring Dashboard
  const attendanceRate = Math.round((presentStudents.length / totalStudentsCount) * 100);

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
        <div>
          <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Live Attendance Session Active
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mt-1">
            {getSubjectCode(selectedSlot!.subjectId)} — Section {getSectionName(selectedSlot!.sectionId)}
          </h1>
        </div>
        <Button onClick={handleEndSession} className="bg-red-600 hover:bg-red-700 text-white font-bold h-10 px-6">
          End Session
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Giant Code Refresher (2/3 width) */}
        <Card className="lg:col-span-2 border-0 shadow-lg dark:bg-gray-900/60 flex flex-col items-center justify-center p-6 text-center">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2 justify-center">
              <Hash className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Student Attendance Code Panel
            </CardTitle>
            <CardDescription>Instruct students to open their AttendX app and input this active 6-digit code.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 flex flex-col items-center w-full">
            {/* 6-Digit Code Box */}
            <div className="flex justify-center items-center py-8 px-6 sm:px-12 bg-purple-50/20 dark:bg-purple-950/10 border border-purple-100 dark:border-purple-900/30 rounded-2xl shadow-inner mt-4 w-full max-w-md">
              {activeCode ? (
                <div className="flex gap-2 sm:gap-3 text-3xl sm:text-5xl font-extrabold tracking-widest font-mono text-purple-600 dark:text-purple-400 select-all">
                  {activeCode.toUpperCase().split('').map((char, idx) => (
                    <span key={idx} className="bg-white dark:bg-gray-850 px-3 py-2 sm:px-4 sm:py-3 rounded-xl border border-purple-500/25 shadow-md flex items-center justify-center min-w-[2.5rem] sm:min-w-[3.5rem]">
                      {char}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="h-16 flex items-center justify-center text-muted-foreground">
                  <RefreshCw className="w-8 h-8 animate-spin" />
                </div>
              )}
            </div>

            {/* Countdown timer */}
            <div className="w-full max-w-sm space-y-2">
              <div className="flex justify-between text-xs text-gray-500 font-medium">
                <span>Code refreshes in</span>
                <span className="font-bold text-purple-700 dark:text-purple-400">{countdown}s remaining</span>
              </div>
              <Progress value={(countdown / 30) * 100} className="h-2 bg-gray-100 dark:bg-gray-800" />
            </div>

            {/* Hint */}
            <div className="p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 flex items-start gap-2 max-w-md">
              <AlertCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
              <p className="text-[11px] text-indigo-800 dark:text-indigo-300 text-left">
                Security Warning: Codes rotate every 30 seconds to block proxy attendance. Sharing codes after their validity window will fail.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Right Side: Live Scanning Monitoring Feed (1/3 width) */}
        <Card className="border-0 shadow-lg dark:bg-gray-900/60 flex flex-col justify-between h-[550px]">
          <div>
            <CardHeader className="pb-3 border-b border-gray-50 dark:border-gray-850">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                Live Monitor Panel
              </CardTitle>
              <CardDescription>Students currently registered present.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {/* Stats Counters */}
              <div className="grid grid-cols-3 gap-1 p-4 border-b border-gray-50 dark:border-gray-850 text-center">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Present</p>
                  <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">{presentStudents.length}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Absent</p>
                  <p className="text-lg font-extrabold text-red-600 dark:text-red-400 mt-0.5">{totalStudentsCount - presentStudents.length}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Rate</p>
                  <p className="text-lg font-extrabold text-purple-600 dark:text-purple-400 mt-0.5">{attendanceRate}%</p>
                </div>
              </div>

              {/* Scanned Student List */}
              <div className="divide-y divide-gray-50 dark:divide-gray-850 max-h-[290px] overflow-y-auto">
                {presentStudents.length === 0 ? (
                  <div className="h-48 flex flex-col items-center justify-center text-muted-foreground gap-2">
                    <UserCheck className="w-8 h-8 opacity-25 animate-pulse text-purple-500" />
                    <span className="text-xs">Waiting for scans...</span>
                  </div>
                ) : (
                  presentStudents.map((s, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3.5 hover:bg-gray-50/50 dark:hover:bg-gray-800/20">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">{s.name}</p>
                          <p className="text-[10px] text-gray-500 uppercase font-mono">{s.rollNumber}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-[9px] text-gray-400">{s.time}</span>
                        {s.status === 'late' && (
                          <Badge variant="outline" className="h-4 text-[8px] border-amber-200 text-amber-600 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900/35 dark:text-amber-400 px-1 hover:bg-amber-50">
                            Late
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </div>
          <div className="p-4 border-t border-gray-50 dark:border-gray-850 text-center">
            <span className="text-[10px] text-gray-400 block font-medium">Automatic monitoring active</span>
          </div>
        </Card>
      </div>
    </div>
  );
}

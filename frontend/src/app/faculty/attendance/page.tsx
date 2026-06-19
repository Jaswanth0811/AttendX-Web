'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Hash, ArrowLeft, Users, Play, CheckCircle2, UserCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { apiFetch } from '@/lib/api';

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

  const [loading, setLoading] = useState(true);
  const [todaysClasses, setTodaysClasses] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null);
  
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [activeSession, setActiveSession] = useState<any | null>(null);
  const [activeCode, setActiveCode] = useState<string>('');
  const [countdown, setCountdown] = useState(30);
  const [codeMaxDuration, setCodeMaxDuration] = useState(30);
  const [totalStudentsCount, setTotalStudentsCount] = useState(60);
  const [presentStudents, setPresentStudents] = useState<ScannedStudent[]>([]);

  // Timers
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch Dashboard Classes
  useEffect(() => {
    async function loadDashboard() {
      const res = await apiFetch('/api/faculty/dashboard');
      if (res.success && res.data) {
        setTodaysClasses(res.data.todaysClasses || []);
        
        // If slot is in URL, auto select it
        if (slotId) {
          const slot = res.data.todaysClasses.find((t: any) => t.id === slotId);
          if (slot) setSelectedSlot(slot);
        }
      }
      setLoading(false);
    }
    loadDashboard();
  }, [slotId]);

  // Clean up intervals on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);

  // Update Countdown and auto-rotate
  useEffect(() => {
    if (!isSessionActive || !activeSession) return;

    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    const expiresAtTime = new Date(activeSession.code_expires_at || activeSession.codeExpiresAt).getTime();
    const generatedAtTime = new Date(activeSession.code_generated_at || activeSession.codeGeneratedAt).getTime();
    const totalDuration = Math.max(30, Math.round((expiresAtTime - generatedAtTime) / 1000));
    setCodeMaxDuration(totalDuration);

    const updateTimer = () => {
      const timeRemaining = Math.max(0, Math.round((expiresAtTime - Date.now()) / 1000));
      setCountdown(timeRemaining);

      if (timeRemaining <= 0) {
        // Automatically rotate code when code expires
        rotateCode();
      }
    };

    updateTimer();
    countdownIntervalRef.current = setInterval(updateTimer, 1000);

    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [isSessionActive, activeSession]);

  // Rotate / Regenerate Code
  const rotateCode = async () => {
    if (!activeSession) return;
    const res = await apiFetch(`/api/faculty/sessions/${activeSession.id}/code`, {
      method: 'POST'
    });

    if (res.success && res.data) {
      // Update session code details
      setActiveCode(res.data.code);
      setActiveSession((prev: any) => ({
        ...prev,
        code: res.data.code,
        code_expires_at: res.data.expiresAt || new Date(Date.now() + 30000).toISOString(),
        code_generated_at: new Date().toISOString()
      }));
    }
  };

  // Start Session API
  const handleStartSession = async () => {
    if (!selectedSlot) return;

    setLoading(true);
    const res = await apiFetch('/api/faculty/sessions', {
      method: 'POST',
      body: JSON.stringify({
        timetableEntryId: selectedSlot.id,
        subjectId: selectedSlot.subjectId,
        sectionId: selectedSlot.sectionId,
        isSubstitute: false
      })
    });

    if (res.success && res.data) {
      const session = res.data;
      setActiveSession(session);
      setActiveCode(session.code);
      setIsSessionActive(true);

      // Start Polling checked-in students list every 3 seconds
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      
      const pollAttendance = async () => {
        const attendRes = await apiFetch(`/api/faculty/sessions/${session.id}/attendance`);
        if (attendRes.success && attendRes.data) {
          setPresentStudents(attendRes.data);
        }
      };

      pollAttendance(); // initial fetch
      pollingIntervalRef.current = setInterval(pollAttendance, 3000);
    } else {
      alert(res.message || 'Failed to start attendance session.');
    }
    setLoading(false);
  };

  // End Session API
  const handleEndSession = async () => {
    if (!activeSession) return;

    // Clear timers immediately
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    setLoading(true);
    const res = await apiFetch(`/api/faculty/sessions/${activeSession.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'completed' })
    });

    if (res.success) {
      alert(`Attendance Session Closed! Total students marked: ${presentStudents.length}. All other section students recorded as Absent.`);
      router.push('/faculty');
    } else {
      alert(res.message || 'Failed to end session properly.');
      // Re-enable polling as safety fallback
      pollingIntervalRef.current = setInterval(async () => {
        const attendRes = await apiFetch(`/api/faculty/sessions/${activeSession.id}/attendance`);
        if (attendRes.success && attendRes.data) {
          setPresentStudents(attendRes.data);
        }
      }, 3000);
    }
    setLoading(false);
  };

  if (loading && todaysClasses.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Step 1: Select Class slot
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
                <Button variant="ghost" size="icon" onClick={() => setSelectedSlot(null)} className="h-8 w-8 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
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
                  <span className="text-sm font-semibold text-gray-950 dark:text-gray-100">{selectedSlot.subjectCode} - {selectedSlot.subjectName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Class Section</span>
                  <span className="text-sm font-semibold text-gray-950 dark:text-gray-100">Section {selectedSlot.sectionName}</span>
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
            {todaysClasses.length === 0 ? (
              <div className="col-span-full py-16 text-center text-muted-foreground">
                <Users className="w-12 h-12 mx-auto opacity-20 mb-3" />
                <p className="text-sm font-medium">No scheduled classes found for today.</p>
              </div>
            ) : (
              todaysClasses.map((cls) => (
                <Card key={cls.id} className="border-0 shadow-sm hover:shadow-md transition-shadow dark:bg-gray-900/60 overflow-hidden flex flex-col justify-between">
                  <CardHeader className="pb-3 bg-purple-50/20 dark:bg-purple-950/10 border-b border-gray-100 dark:border-gray-800">
                    <Badge className="w-fit bg-purple-100 dark:bg-purple-900/50 text-purple-755 dark:text-purple-300 hover:bg-purple-100 mb-1">
                      Room {cls.room}
                    </Badge>
                    <CardTitle className="text-base font-bold text-gray-950 dark:text-gray-100">{cls.subjectCode}</CardTitle>
                    <CardDescription className="text-xs truncate">{cls.subjectName}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4 pb-5 space-y-4">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Section</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">Section {cls.sectionName}</span>
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
              ))
            )}
          </div>
        )}
      </div>
    );
  }

  // Step 2 & 3: Active Session Live Code + Monitor Feed
  const attendanceRate = totalStudentsCount > 0 ? Math.round((presentStudents.length / totalStudentsCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
        <div>
          <span className="text-xs font-semibold text-purple-655 dark:text-purple-400 uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block animate-ping" /> Live Attendance Session Active
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mt-1">
            {selectedSlot.subjectCode} — Section {selectedSlot.sectionName}
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
                <span>Code rotates in</span>
                <span className="font-bold text-purple-700 dark:text-purple-400">{countdown}s remaining</span>
              </div>
              <Progress value={(countdown / codeMaxDuration) * 100} className="h-2 bg-gray-100 dark:bg-gray-800" />
            </div>

            {/* Hint */}
            <div className="p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 flex items-start gap-2 max-w-md">
              <AlertCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
              <p className="text-[11px] text-indigo-800 dark:text-indigo-300 text-left">
                Security Warning: Codes rotate dynamically to block proxy attendance. Sharing codes after their validity window will fail.
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
                  <p className="text-lg font-extrabold text-red-600 dark:text-red-400 mt-0.5">{Math.max(0, totalStudentsCount - presentStudents.length)}</p>
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


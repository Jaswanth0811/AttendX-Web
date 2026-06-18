'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Hash, ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';

export default function StudentQRScannerPage() {
  const [scanStatus, setScanStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [scannedDetails, setScannedDetails] = useState<{
    subject: string;
    section: string;
    time: string;
    faculty: string;
  } | null>(null);

  // Mark attendance logic using code
  const handleMarkAttendance = async (code: string) => {
    setScanStatus('submitting');
    
    // Simulate API request to backend (1.5 seconds latency for realism)
    setTimeout(() => {
      const normalizedCode = code.trim().toLowerCase();
      if (normalizedCode.length === 6) {
        setScannedDetails({
          subject: 'CS301 - Data Structures & Algorithms',
          section: 'CSE - Section 3A',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          faculty: 'Dr. Rajesh Kumar',
        });
        setScanStatus('success');
      } else {
        setErrorMessage('Invalid or expired code. Please check with your lecturer.');
        setScanStatus('error');
      }
    }, 1500);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim() || manualCode.trim().length !== 6) {
      setErrorMessage('Please enter a valid 6-digit code.');
      setScanStatus('error');
      return;
    }
    handleMarkAttendance(manualCode);
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Title */}
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center justify-center gap-2">
          <Hash className="w-6 h-6 text-teal-600 dark:text-teal-400" />
          Mark Attendance
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">Enter the active 6-digit attendance code shown by your lecturer.</p>
      </div>

      {/* Main card */}
      <Card className="border-0 shadow-lg dark:bg-gray-900/60 overflow-hidden transition-all duration-300">
        {scanStatus === 'idle' && (
          <CardContent className="pt-8 pb-8 space-y-6">
            <form onSubmit={handleManualSubmit} className="space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center shadow-inner">
                  <Hash className="w-8 h-8" />
                </div>
                <div className="text-center space-y-1">
                  <h3 className="font-bold text-lg">Enter Code</h3>
                  <p className="text-xs text-muted-foreground">The 6-digit alphanumeric code rotates every 30 seconds.</p>
                </div>
              </div>

              <div className="flex justify-center">
                <Input
                  maxLength={6}
                  placeholder="e.g. 5e22fe"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                  className="h-16 text-center text-3xl font-extrabold tracking-widest font-mono border-2 border-teal-500/30 focus:border-teal-500 rounded-xl max-w-[240px] uppercase bg-teal-50/10 dark:bg-teal-950/5"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-teal-600 hover:bg-teal-700 text-white h-12 flex items-center justify-center gap-2 text-sm font-bold shadow-lg shadow-teal-500/20"
              >
                Submit Attendance Code
              </Button>
            </form>
          </CardContent>
        )}

        {scanStatus === 'submitting' && (
          <CardContent className="pt-12 pb-12 text-center space-y-4 flex flex-col items-center">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-teal-200 border-t-teal-600 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Hash className="w-5 h-5 text-teal-605" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base text-gray-900 dark:text-gray-100">Verifying Code...</h3>
              <p className="text-xs text-gray-500">Checking timestamp & section authorization</p>
            </div>
          </CardContent>
        )}

        {scanStatus === 'success' && scannedDetails && (
          <CardContent className="pt-8 pb-8 text-center space-y-6 flex flex-col items-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <ShieldCheck className="w-9 h-9" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-xl text-emerald-600 dark:text-emerald-400">Attendance Logged!</h3>
              <p className="text-xs text-muted-foreground">Class presence verified by session code match.</p>
            </div>

            <div className="w-full p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 text-left space-y-2.5 max-w-sm">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Subject</span>
                <span className="font-bold text-gray-900 dark:text-gray-100 text-right">{scannedDetails.subject}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Lecturer</span>
                <span className="font-bold text-gray-900 dark:text-gray-100 text-right">{scannedDetails.faculty}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Section</span>
                <span className="font-bold text-gray-900 dark:text-gray-100 text-right">{scannedDetails.section}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Confirmed Time</span>
                <span className="font-bold text-gray-900 dark:text-gray-100 text-right">{scannedDetails.time}</span>
              </div>
            </div>

            <Button onClick={() => { setScanStatus('idle'); setManualCode(''); }} className="bg-teal-600 hover:bg-teal-700 text-white h-10 w-full max-w-sm">
              Mark Another Code
            </Button>
          </CardContent>
        )}

        {scanStatus === 'error' && (
          <CardContent className="pt-8 pb-8 text-center space-y-4 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 flex items-center justify-center">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div className="space-y-1 max-w-sm">
              <h3 className="font-bold text-lg text-red-650 dark:text-red-400">Submission Failed</h3>
              <p className="text-xs text-muted-foreground">{errorMessage || 'Invalid code. Please check with your lecturer.'}</p>
            </div>
            <Button onClick={() => setScanStatus('idle')} className="w-full max-w-sm bg-gray-950 dark:bg-gray-800 hover:bg-gray-900 text-white h-10">
              Try Again
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Save, ShieldAlert, Timer, RefreshCw } from 'lucide-react';
import { apiFetch } from '@/lib/api';

// Reusable Numeric Input with Plus and Minus Buttons
interface NumberInputWithControlsProps {
  id?: string;
  min: number;
  max: number;
  value: number;
  onChange: (val: number) => void;
}

const NumberInputWithControls: React.FC<NumberInputWithControlsProps> = ({ min, max, value, onChange }) => {
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  return (
    <div className="flex items-center border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden h-10 w-32 bg-white dark:bg-gray-850">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleDecrement}
        disabled={value <= min}
        className="h-full w-10 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-none shrink-0"
      >
        -
      </Button>
      <Input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => {
          const val = parseInt(e.target.value);
          if (!isNaN(val)) {
            onChange(Math.max(min, Math.min(max, val)));
          }
        }}
        className="h-full border-0 focus-visible:ring-0 text-center font-bold px-1 rounded-none flex-1 bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleIncrement}
        disabled={value >= max}
        className="h-full w-10 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-none shrink-0"
      >
        +
      </Button>
    </div>
  );
};

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [attendanceThreshold, setAttendanceThreshold] = useState(75);
  const [codeExpirySeconds, setCodeExpirySeconds] = useState(30);
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState(120);
  const [allowLateMarking, setAllowLateMarking] = useState(true);
  const [lateThresholdMinutes, setLateThresholdMinutes] = useState(15);

  useEffect(() => {
    async function loadSettings() {
      const res = await apiFetch('/api/admin/settings');
      if (res.success && res.data) {
        const s = res.data;
        if (s.attendanceThreshold !== undefined) setAttendanceThreshold(s.attendanceThreshold);
        if (s.codeExpirySeconds !== undefined) setCodeExpirySeconds(s.codeExpirySeconds);
        if (s.sessionTimeoutMinutes !== undefined) setSessionTimeoutMinutes(s.sessionTimeoutMinutes);
        if (s.allowLateMarking !== undefined) setAllowLateMarking(s.allowLateMarking);
        if (s.lateThresholdMinutes !== undefined) setLateThresholdMinutes(s.lateThresholdMinutes);
      }
      setLoading(false);
    }
    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const body = {
      attendanceThreshold,
      codeExpirySeconds,
      sessionTimeoutMinutes,
      allowLateMarking,
      lateThresholdMinutes,
    };

    const res = await apiFetch('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(body),
    });

    if (res.success) {
      alert('System configurations saved successfully!');
    } else {
      alert(res.message || 'Failed to save system configurations.');
    }
    setIsSaving(false);
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">System Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Configure institutional defaults, code verification, and thresholds.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border-0 shadow-sm dark:bg-gray-900/60">
          <CardHeader>
            <CardTitle className="text-base font-semibold">AttendX Core Parameters</CardTitle>
            <CardDescription>Adjust rules that govern 6-digit codes, active timers, and warning states.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Setting 1: Attendance Threshold */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-gray-50/50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800">
              <div className="space-y-1">
                <Label className="text-sm font-bold flex items-center gap-2">
                  <ShieldAlert className="w-4.5 h-4.5 text-indigo-500" />
                  Attendance Defaulter Threshold (%)
                </Label>
                <p className="text-xs text-muted-foreground max-w-md">
                  Minimum attendance rate students must maintain. Defaulters will trigger alerts on dashboards.
                </p>
              </div>
              <div className="shrink-0">
                <NumberInputWithControls
                  min={50}
                  max={100}
                  value={attendanceThreshold}
                  onChange={setAttendanceThreshold}
                />
              </div>
            </div>

            {/* Setting 2: Code Refresh Timer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-gray-50/50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800">
              <div className="space-y-1">
                <Label className="text-sm font-bold flex items-center gap-2">
                  <RefreshCw className="w-4.5 h-4.5 text-indigo-500" />
                  Attendance Code Expiry (Seconds)
                </Label>
                <p className="text-xs text-muted-foreground max-w-md">
                  Seconds before active 6-digit code expires and refreshes. Prevents proxy attendance sharing.
                </p>
              </div>
              <div className="shrink-0">
                <NumberInputWithControls
                  min={10}
                  max={300}
                  value={codeExpirySeconds}
                  onChange={setCodeExpirySeconds}
                />
              </div>
            </div>

            {/* Setting 3: Session Timeout */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-gray-50/50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800">
              <div className="space-y-1">
                <Label className="text-sm font-bold flex items-center gap-2">
                  <Timer className="w-4.5 h-4.5 text-indigo-500" />
                  Session Invalidation Timeout (Minutes)
                </Label>
                <p className="text-xs text-muted-foreground max-w-md">
                  Active lecture code session will automatically close after this time period.
                </p>
              </div>
              <div className="shrink-0">
                <NumberInputWithControls
                  min={30}
                  max={480}
                  value={sessionTimeoutMinutes}
                  onChange={setSessionTimeoutMinutes}
                />
              </div>
            </div>

            {/* Setting 4: Allow Late Marking Switch */}
            <div className="p-4 rounded-xl bg-gray-50/50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="lateToggle" className="text-sm font-bold flex items-center gap-2 cursor-pointer">
                    Enable Late Student Markings
                  </Label>
                  <p className="text-xs text-muted-foreground max-w-md">
                    Allow students to register attendance after lecture begins, with a &ldquo;late&rdquo; flag.
                  </p>
                </div>
                <Switch
                  id="lateToggle"
                  checked={allowLateMarking}
                  onCheckedChange={setAllowLateMarking}
                />
              </div>

              {allowLateMarking && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-dashed border-gray-200 dark:border-gray-800">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Late Grace Period Threshold (Minutes)</Label>
                    <p className="text-[11px] text-muted-foreground max-w-md">
                      Grace period during which checked-in students are marked &ldquo;late&rdquo;. Past this, submissions are blocked.
                    </p>
                  </div>
                  <div className="shrink-0">
                    <NumberInputWithControls
                      min={5}
                      max={60}
                      value={lateThresholdMinutes}
                      onChange={setLateThresholdMinutes}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Save Buttons */}
            <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={isSaving} className="bg-indigo-650 hover:bg-indigo-700 text-white h-10 px-6 flex items-center gap-2">
                <Save className="w-4.5 h-4.5" />
                {isSaving ? 'Saving parameters...' : 'Save Configuration'}
              </Button>
            </div>

          </CardContent>
        </Card>
      </form>
    </div>
  );
}

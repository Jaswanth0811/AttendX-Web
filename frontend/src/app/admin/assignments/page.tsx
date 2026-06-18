'use client';

import React, { useState } from 'react';
import { mockAssignments, mockFacultyProfiles, mockSubjects, mockSections, mockUsers, mockDepartments } from '@/lib/mock-data';
import { FacultyAssignment } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
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
import { UserCheck, Plus, Trash2, Search } from 'lucide-react';
import { Label } from '@/components/ui/label';

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<FacultyAssignment[]>(mockAssignments);
  const [facultyFilter, setFacultyFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [isOpen, setIsOpen] = useState(false);

  // Form states
  const [facultyId, setFacultyId] = useState(mockFacultyProfiles[0]?.id || '');
  const [subjectId, setSubjectId] = useState(mockSubjects[0]?.id || '');
  const [sectionId, setSectionId] = useState(mockSections[0]?.id || '');

  // Helpers to get names
  const getFacultyName = (facId: string) => {
    const profile = mockFacultyProfiles.find((f) => f.id === facId);
    if (!profile) return 'Unknown Faculty';
    const user = mockUsers.find((u) => u.id === profile.userId);
    return user ? user.name : 'Unknown Faculty';
  };

  const getSubjectInfo = (subId: string) => {
    const sub = mockSubjects.find((s) => s.id === subId);
    return sub ? `${sub.code} - ${sub.name}` : 'Unknown Subject';
  };

  const getSectionName = (secId: string) => {
    return mockSections.find((s) => s.id === secId)?.name || 'Unknown Section';
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this teaching assignment?')) {
      setAssignments(assignments.filter((a) => a.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newAsgn: FacultyAssignment = {
      id: `asgn-${Date.now()}`,
      facultyId,
      subjectId,
      sectionId,
      academicYearId: 'ay-1',
      isActive: true,
    };
    setAssignments([...assignments, newAsgn]);
    setIsOpen(false);
  };

  const filteredAssignments = assignments.filter((asgn) => {
    const matchFac = facultyFilter === 'all' || asgn.facultyId === facultyFilter;
    const matchSub = subjectFilter === 'all' || asgn.subjectId === subjectFilter;
    return matchFac && matchSub;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Teaching Assignments</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Assign subjects and classes to faculty members.</p>
        </div>
        <Button onClick={() => setIsOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Assign Class
        </Button>
      </div>

      {/* Main card */}
      <Card className="border-0 shadow-sm dark:bg-gray-900/60">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base font-semibold">Faculty Loading</CardTitle>
              <CardDescription>View which faculty is assigned to which classes.</CardDescription>
            </div>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <select
                value={facultyFilter}
                onChange={(e) => setFacultyFilter(e.target.value)}
                className="h-9 rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="all">All Faculty</option>
                {mockFacultyProfiles.map((fac) => (
                  <option key={fac.id} value={fac.id}>
                    {getFacultyName(fac.id)}
                  </option>
                ))}
              </select>

              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="h-9 rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="all">All Subjects</option>
                {mockSubjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.code}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50/50 dark:bg-gray-900/40">
              <TableRow>
                <TableHead className="pl-6">Faculty Member</TableHead>
                <TableHead>Assigned Subject</TableHead>
                <TableHead>Class Section</TableHead>
                <TableHead>Academic Year</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-6 text-right w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssignments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    No teaching assignments found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAssignments.map((asgn) => (
                  <TableRow key={asgn.id}>
                    <TableCell className="pl-6 font-semibold text-gray-900 dark:text-gray-100">
                      {getFacultyName(asgn.facultyId)}
                    </TableCell>
                    <TableCell className="font-medium text-gray-700 dark:text-gray-300">
                      {getSubjectInfo(asgn.subjectId)}
                    </TableCell>
                    <TableCell className="font-semibold text-indigo-600 dark:text-indigo-400">
                      {getSectionName(asgn.sectionId)}
                    </TableCell>
                    <TableCell className="text-gray-500 text-xs">
                      2025 - 2026 (AY-1)
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50">
                        Active
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(asgn.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 h-8 w-8"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Assign Faculty to Class
            </DialogTitle>
            <DialogDescription>
              Set up a teaching link between a faculty member, a subject, and a section.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                    {getFacultyName(fac.id)} ({getDeptCode(fac.departmentId)})
                  </option>
                ))}
              </select>
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

            <div className="space-y-2">
              <Label htmlFor="section">Class Section</Label>
              <select
                id="section"
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
                className="w-full h-10 rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {mockSections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.name}
                  </option>
                ))}
              </select>
            </div>

            <DialogFooter className="mt-6 flex gap-2">
              <DialogClose asChild>
                <Button type="button" variant="outline" className="border-gray-200 dark:border-gray-800">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Create Assignment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Small helper
function getDeptCode(deptId: string) {
  return mockDepartments.find((d) => d.id === deptId)?.code || 'UNKNOWN';
}

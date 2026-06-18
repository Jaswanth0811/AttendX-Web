'use client';

import React, { useState } from 'react';
import { mockSubjects, mockDepartments, mockSemesters } from '@/lib/mock-data';
import { Subject } from '@/types';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup
} from '@/components/ui/select';
import { BookOpen, Plus, Search, MoreVertical, Edit2, Trash2 } from 'lucide-react';

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>(mockSubjects);
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [semesterFilter, setSemesterFilter] = useState('all');

  const getSemesterNumber = (semId: string) => {
    const sem = mockSemesters.find((s) => s.id === semId);
    return sem ? sem.number : 1;
  };

  // Modal Form States
  const [isOpen, setIsOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [departmentId, setDepartmentId] = useState(mockDepartments[0]?.id || '');
  const [semester, setSemester] = useState('1');
  const [credits, setCredits] = useState('4');
  const [type, setType] = useState<string>('theory');

  // Filter subjects
  const filteredSubjects = subjects.filter((subject) => {
    const matchesSearch =
      subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = deptFilter === 'all' || subject.departmentId === deptFilter;
    const matchesSem = semesterFilter === 'all' || String(getSemesterNumber(subject.semesterId)) === semesterFilter;
    return matchesSearch && matchesDept && matchesSem;
  });

  const handleOpenAdd = () => {
    setEditingSubject(null);
    setName('');
    setCode('');
    setDepartmentId(mockDepartments[0]?.id || '');
    setSemester('1');
    setCredits('4');
    setType('theory');
    setIsOpen(true);
  };

  const handleOpenEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setName(subject.name);
    setCode(subject.code);
    setDepartmentId(subject.departmentId);
    setSemester(String(getSemesterNumber(subject.semesterId)));
    setCredits(String(subject.credits));
    setType(subject.type);
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;

    if (editingSubject) {
      setSubjects(
        subjects.map((s) =>
          s.id === editingSubject.id
            ? {
                ...s,
                name,
                code: code.toUpperCase(),
                departmentId,
                semesterId: `sem-${semester}`,
                credits: parseInt(credits),
                type,
              }
            : s
        )
      );
    } else {
      const newSubject: Subject = {
        id: `sub-${Date.now()}`,
        name,
        code: code.toUpperCase(),
        departmentId,
        semesterId: `sem-${semester}`,
        credits: parseInt(credits),
        type,
        isActive: true,
      };
      setSubjects([...subjects, newSubject]);
    }
    setIsOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this subject?')) {
      setSubjects(subjects.filter((s) => s.id !== id));
    }
  };

  const getDeptCode = (deptId: string) => {
    const dept = mockDepartments.find((d) => d.id === deptId);
    return dept ? dept.code : 'UNKNOWN';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Subjects</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage academic syllabus, subjects, and credits.</p>
        </div>
        <Button onClick={handleOpenAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Subject
        </Button>
      </div>

      {/* Filters & Table Card */}
      <Card className="border-0 shadow-sm dark:bg-gray-900/60">
        <CardHeader className="pb-4">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base font-semibold">Academic Curriculum</CardTitle>
              <CardDescription>Curriculum list of theories and practicals.</CardDescription>
            </div>
            {/* Filter controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search */}
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search subject..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 border-gray-200 dark:border-gray-800"
                />
              </div>

              {/* Dept Filter */}
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="h-9 rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="all">All Departments</option>
                {mockDepartments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.code} Department
                  </option>
                ))}
              </select>

              {/* Sem Filter */}
              <select
                value={semesterFilter}
                onChange={(e) => setSemesterFilter(e.target.value)}
                className="h-9 rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="all">All Semesters</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <option key={sem} value={sem}>
                    Semester {sem}
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
                <TableHead className="pl-6 w-28">Code</TableHead>
                <TableHead>Subject Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="pr-6 text-right w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    No subjects found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubjects.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="pl-6 font-semibold text-indigo-600 dark:text-indigo-400">
                      {sub.code}
                    </TableCell>
                    <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                      {sub.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 text-gray-600 dark:text-gray-400">
                        {getDeptCode(sub.departmentId)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-300">
                      Semester {getSemesterNumber(sub.semesterId)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {sub.credits} Credits
                    </TableCell>
                    <TableCell className="capitalize">
                      <Badge variant={sub.type === 'theory' ? 'default' : 'secondary'} className={sub.type === 'theory' ? 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50' : 'bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 hover:bg-purple-50'}>
                        {sub.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600">
                            <MoreVertical className="w-4.5 h-4.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                          <DropdownMenuItem onClick={() => handleOpenEdit(sub)} className="flex items-center gap-2 cursor-pointer">
                            <Edit2 className="w-4 h-4" /> Edit Subject
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(sub.id)} className="flex items-center gap-2 cursor-pointer text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">
                            <Trash2 className="w-4 h-4" /> Delete Subject
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              {editingSubject ? 'Edit Subject' : 'Add New Subject'}
            </DialogTitle>
            <DialogDescription>
              Enter curriculum details to register the course.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1 space-y-2">
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  placeholder="CS302"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="h-10 border-gray-200 dark:border-gray-800 font-semibold"
                  required
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="name">Subject Name</Label>
                <Input
                  id="name"
                  placeholder="Database Systems"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-10 border-gray-200 dark:border-gray-800"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dept">Department</Label>
                <select
                  id="dept"
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full h-10 rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {mockDepartments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="semester">Semester</Label>
                <select
                  id="semester"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full h-10 rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <option key={sem} value={sem}>
                      Semester {sem}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="credits">Credits</Label>
                <select
                  id="credits"
                  value={credits}
                  onChange={(e) => setCredits(e.target.value)}
                  className="w-full h-10 rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {[1, 2, 3, 4, 5].map((credit) => (
                    <option key={credit} value={credit}>
                      {credit} Credits
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Subject Type</Label>
                <select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full h-10 rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="theory">Theory</option>
                  <option value="practical">Practical / Lab</option>
                </select>
              </div>
            </div>

            <DialogFooter className="mt-6 flex gap-2">
              <DialogClose asChild>
                <Button type="button" variant="outline" className="border-gray-200 dark:border-gray-800">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {editingSubject ? 'Save Changes' : 'Create Subject'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

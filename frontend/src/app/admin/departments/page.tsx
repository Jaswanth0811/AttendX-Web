'use client';

import React, { useState, useEffect } from 'react';
import { Department } from '@/types';
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
import { Building2, Plus, Search, MoreVertical, Edit2, Trash2, Layers, Users } from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [deptSearchQuery, setDeptSearchQuery] = useState('');
  const [secSearchQuery, setSecSearchQuery] = useState('');
  
  // Department Form States
  const [isDeptOpen, setIsDeptOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<any | null>(null);
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [deptDesc, setDeptDesc] = useState('');
  const [deptIsActive, setDeptIsActive] = useState(true);
  const [deptSubmitting, setDeptSubmitting] = useState(false);

  // Section Form States
  const [isSecOpen, setIsSecOpen] = useState(false);
  const [secName, setSecName] = useState('');
  const [secDeptId, setSecDeptId] = useState('');
  const [secSemId, setSecSemId] = useState('');
  const [secMaxStudents, setSecMaxStudents] = useState<number>(60);
  const [secSubmitting, setSecSubmitting] = useState(false);

  // Load Data
  async function loadData() {
    setLoading(true);
    const [deptRes, secRes, metaRes] = await Promise.all([
      apiFetch('/api/admin/departments'),
      apiFetch('/api/admin/sections'),
      apiFetch('/api/student/timetable/metadata')
    ]);

    if (deptRes.success && deptRes.data) {
      setDepartments(deptRes.data);
    }
    if (secRes.success && secRes.data) {
      setSections(secRes.data);
    }
    if (metaRes.success && metaRes.data) {
      setSemesters(metaRes.data.semesters || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  // Filter departments based on search
  const filteredDepartments = departments.filter(
    (dept) =>
      dept.name.toLowerCase().includes(deptSearchQuery.toLowerCase()) ||
      dept.code.toLowerCase().includes(deptSearchQuery.toLowerCase())
  );

  // Filter sections based on search
  const filteredSections = sections.filter((sec) => {
    const deptNameVal = sec.department_name || departments.find(d => d.id === (sec.departmentId || sec.department_id))?.name || '';
    const semNameVal = sec.semester_name || semesters.find(s => s.id === (sec.semesterId || sec.semester_id))?.name || '';
    return (
      sec.name.toLowerCase().includes(secSearchQuery.toLowerCase()) ||
      deptNameVal.toLowerCase().includes(secSearchQuery.toLowerCase()) ||
      semNameVal.toLowerCase().includes(secSearchQuery.toLowerCase())
    );
  });

  const handleOpenAddDept = () => {
    setEditingDept(null);
    setDeptName('');
    setDeptCode('');
    setDeptDesc('');
    setDeptIsActive(true);
    setIsDeptOpen(true);
  };

  const handleOpenEditDept = (dept: any) => {
    setEditingDept(dept);
    setDeptName(dept.name);
    setDeptCode(dept.code);
    setDeptDesc(dept.description || '');
    setDeptIsActive(dept.isActive ?? dept.is_active ?? true);
    setIsDeptOpen(true);
  };

  const handleDeptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName || !deptCode) return;
    setDeptSubmitting(true);

    const payload = {
      name: deptName,
      code: deptCode.toUpperCase(),
      description: deptDesc,
      isActive: deptIsActive
    };

    let res;
    if (editingDept) {
      res = await apiFetch(`/api/admin/departments/${editingDept.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
    } else {
      res = await apiFetch('/api/admin/departments', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    }

    setDeptSubmitting(false);
    if (res.success) {
      setIsDeptOpen(false);
      loadData();
    } else {
      alert(res.message || 'Failed to save department details.');
    }
  };

  const handleDeptDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this department? This will affect associated subjects, sections, and users.')) {
      const res = await apiFetch(`/api/admin/departments/${id}`, {
        method: 'DELETE'
      });
      if (res.success) {
        loadData();
      } else {
        alert(res.message || 'Failed to delete department.');
      }
    }
  };

  const handleOpenAddSec = () => {
    setSecName('');
    if (departments.length > 0) setSecDeptId(departments[0].id);
    if (semesters.length > 0) setSecSemId(semesters[0].id);
    setSecMaxStudents(60);
    setIsSecOpen(true);
  };

  const handleSecSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secName || !secDeptId || !secSemId) return;
    setSecSubmitting(true);

    const payload = {
      name: secName,
      departmentId: secDeptId,
      semesterId: secSemId,
      maxStudents: Number(secMaxStudents)
    };

    const res = await apiFetch('/api/admin/sections', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    setSecSubmitting(false);
    if (res.success) {
      setIsSecOpen(false);
      loadData();
    } else {
      alert(res.message || 'Failed to create section.');
    }
  };

  const handleSecDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this section? This will affect student enrollments and timetables.')) {
      const res = await apiFetch(`/api/admin/sections/${id}`, {
        method: 'DELETE'
      });
      if (res.success) {
        loadData();
      } else {
        alert(res.message || 'Failed to delete section.');
      }
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Departments Section */}
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Departments Directory</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Manage college departments and academic fields.</p>
          </div>
          <Button onClick={handleOpenAddDept} className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 h-9 font-semibold shadow-md shadow-indigo-500/10">
            <Plus className="w-4 h-4" />
            Add Department
          </Button>
        </div>

        {/* Main Table Card */}
        <Card className="border-0 shadow-sm dark:bg-gray-900/60">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-semibold">All Departments</CardTitle>
                <CardDescription>A list of departments offering courses.</CardDescription>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search department..."
                  value={deptSearchQuery}
                  onChange={(e) => setDeptSearchQuery(e.target.value)}
                  className="pl-9 h-9 border-gray-200 dark:border-gray-800"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-gray-50/50 dark:bg-gray-900/40">
                <TableRow>
                  <TableHead className="pl-6 w-24">Code</TableHead>
                  <TableHead>Department Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-32">Status</TableHead>
                  <TableHead className="pr-6 text-right w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDepartments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      No departments found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDepartments.map((dept) => {
                    const active = dept.isActive ?? dept.is_active ?? true;
                    return (
                      <TableRow key={dept.id}>
                        <TableCell className="pl-6 font-semibold text-indigo-650 dark:text-indigo-400">
                          {dept.code}
                        </TableCell>
                        <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                          {dept.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground max-w-md truncate">
                          {dept.description || 'No description provided.'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={active ? 'default' : 'destructive'} className={active ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 border-0 font-semibold' : 'destructive'}>
                            {active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="pr-6 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                              <DropdownMenuItem onClick={() => handleOpenEditDept(dept)} className="flex items-center gap-2 cursor-pointer">
                                <Edit2 className="w-4 h-4" /> Edit Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeptDelete(dept.id)} className="flex items-center gap-2 cursor-pointer text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">
                                <Trash2 className="w-4 h-4" /> Delete Department
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Sections Section */}
      <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Sections Directory</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Manage branch class sections and student intake capacity.</p>
          </div>
          <Button onClick={handleOpenAddSec} className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 h-9 font-semibold shadow-md shadow-indigo-500/10">
            <Plus className="w-4 h-4" />
            Add Section
          </Button>
        </div>

        {/* Sections Card */}
        <Card className="border-0 shadow-sm dark:bg-gray-900/60">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-semibold">Active Class Sections</CardTitle>
                <CardDescription>Intake batches configured for classrooms and attendance tracking.</CardDescription>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search sections (e.g. ME-3A)..."
                  value={secSearchQuery}
                  onChange={(e) => setSecSearchQuery(e.target.value)}
                  className="pl-9 h-9 border-gray-200 dark:border-gray-800"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-gray-50/50 dark:bg-gray-900/40">
                <TableRow>
                  <TableHead className="pl-6">Section Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Semester / Year</TableHead>
                  <TableHead className="w-36">Max Intake Capacity</TableHead>
                  <TableHead className="pr-6 text-right w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSections.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      No sections found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSections.map((sec) => {
                    const deptNameVal = sec.department_name || departments.find(d => d.id === (sec.departmentId || sec.department_id))?.name || 'Unknown';
                    const semNameVal = sec.semester_name || semesters.find(s => s.id === (sec.semesterId || sec.semester_id))?.name || 'Unknown';
                    const maxStudentsVal = sec.max_students ?? sec.maxStudents ?? 60;
                    return (
                      <TableRow key={sec.id}>
                        <TableCell className="pl-6 font-bold text-gray-900 dark:text-gray-100">
                          {sec.name}
                        </TableCell>
                        <TableCell className="font-medium text-gray-700 dark:text-gray-300">
                          {deptNameVal}
                        </TableCell>
                        <TableCell className="text-gray-500 font-semibold text-xs">
                          {semNameVal}
                        </TableCell>
                        <TableCell className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          {maxStudentsVal} Students
                        </TableCell>
                        <TableCell className="pr-6 text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleSecDelete(sec.id)} 
                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Dept Modal */}
      <Dialog open={isDeptOpen} onOpenChange={setIsDeptOpen}>
        <DialogContent className="sm:max-w-md dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              {editingDept ? 'Edit Department' : 'Add New Department'}
            </DialogTitle>
            <DialogDescription>
              Provide the details below to {editingDept ? 'update' : 'create'} the department profile.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleDeptSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1 space-y-2">
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  placeholder="CSE"
                  value={deptCode}
                  onChange={(e) => setDeptCode(e.target.value)}
                  disabled={!!editingDept}
                  className="h-10 border-gray-200 dark:border-gray-800 font-semibold uppercase"
                  required
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="name">Department Name</Label>
                <Input
                  id="name"
                  placeholder="Computer Science & Engineering"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  className="h-10 border-gray-200 dark:border-gray-800"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                placeholder="Department outline, offices, etc."
                value={deptDesc}
                onChange={(e) => setDeptDesc(e.target.value)}
                className="h-10 border-gray-200 dark:border-gray-800"
              />
            </div>

            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="isActive"
                checked={deptIsActive}
                onChange={(e) => setDeptIsActive(e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <Label htmlFor="isActive" className="cursor-pointer">Active and enrolling students</Label>
            </div>

            <DialogFooter className="mt-6 flex gap-2 justify-end">
              <DialogClose asChild>
                <Button type="button" variant="outline" className="border-gray-200 dark:border-gray-800">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={deptSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 px-4">
                {deptSubmitting ? 'Saving...' : editingDept ? 'Save Changes' : 'Create Department'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Section Modal */}
      <Dialog open={isSecOpen} onOpenChange={setIsSecOpen}>
        <DialogContent className="sm:max-w-md dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Add Class Section
            </DialogTitle>
            <DialogDescription>
              Configure a classroom section for department enrollments.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSecSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="secName">Section Name</Label>
              <Input
                id="secName"
                placeholder="e.g. CSE-3A or ME-1B"
                value={secName}
                onChange={(e) => setSecName(e.target.value)}
                className="h-10 border-gray-200 dark:border-gray-800 font-semibold"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="secDept">Department</Label>
                <select
                  id="secDept"
                  value={secDeptId}
                  onChange={(e) => setSecDeptId(e.target.value)}
                  className="w-full h-10 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 text-sm outline-none font-medium"
                  required
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secSem">Semester</Label>
                <select
                  id="secSem"
                  value={secSemId}
                  onChange={(e) => setSecSemId(e.target.value)}
                  className="w-full h-10 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 text-sm outline-none font-medium"
                  required
                >
                  {semesters.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secCap">Intake Capacity (Max Students)</Label>
              <Input
                id="secCap"
                type="number"
                min={1}
                value={secMaxStudents}
                onChange={(e) => setSecMaxStudents(Number(e.target.value))}
                className="h-10 border-gray-200 dark:border-gray-800"
                required
              />
            </div>

            <DialogFooter className="mt-6 flex gap-2 justify-end">
              <DialogClose asChild>
                <Button type="button" variant="outline" className="border-gray-200 dark:border-gray-800">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={secSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 px-4">
                {secSubmitting ? 'Creating...' : 'Create Section'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

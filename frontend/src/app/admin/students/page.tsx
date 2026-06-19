'use client';

import React, { useEffect, useState, useRef } from 'react';
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
import { GraduationCap, Plus, Search, MoreVertical, Edit2, Key, ToggleLeft, ToggleRight, FileUp } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import * as XLSX from 'xlsx';

export default function StudentsPage() {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [secFilter, setSecFilter] = useState('all');

  // Form States
  const [isOpen, setIsOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [semesterId, setSemesterId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [phone, setPhone] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load Data
  async function loadData() {
    // 1. Fetch departments
    const deptRes = await apiFetch('/api/student/timetable/metadata');
    if (deptRes.success && deptRes.data) {
      setDepartments(deptRes.data.departments || []);
      setSections(deptRes.data.sections || []);
      setSemesters(deptRes.data.semesters || []);
      if (deptRes.data.departments.length > 0 && !departmentId) {
        setDepartmentId(deptRes.data.departments[0].id);
      }
      if (deptRes.data.semesters.length > 0 && !semesterId) {
        setSemesterId(deptRes.data.semesters[0].id);
      }
      if (deptRes.data.sections.length > 0 && !sectionId) {
        setSectionId(deptRes.data.sections[0].id);
      }
    }

    // 2. Fetch students
    const studentsRes = await apiFetch('/api/admin/students');
    if (studentsRes.success && studentsRes.data) {
      setStudents(studentsRes.data);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFirstName('');
    setLastName('');
    setEmail('');
    setRollNumber('');
    setPhone('');
    setGuardianName('');
    setGuardianPhone('');
    if (departments.length > 0) setDepartmentId(departments[0].id);
    if (semesters.length > 0) setSemesterId(semesters[0].id);
    if (sections.length > 0) setSectionId(sections[0].id);
    setIsOpen(true);
  };

  const handleOpenEdit = (student: any) => {
    setEditingStudent(student);
    setFirstName(student.user.firstName || student.user.name?.split(' ')[0] || '');
    setLastName(student.user.lastName || student.user.name?.split(' ')[1] || '');
    setEmail(student.user.email);
    setRollNumber(student.profile.rollNumber);
    setPhone(student.profile.phone || '');
    setGuardianName(student.profile.guardianName || '');
    setGuardianPhone(student.profile.guardianPhone || '');
    setDepartmentId(student.profile.departmentId);
    setSemesterId(student.profile.semesterId || (semesters.length > 0 ? semesters[0].id : ''));
    setSectionId(student.profile.sectionId);
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      firstName,
      lastName,
      email,
      phone,
      rollNumber: rollNumber.toUpperCase(),
      departmentId,
      semesterId,
      sectionId,
      guardianName,
      guardianPhone
    };

    let res;
    if (editingStudent) {
      res = await apiFetch(`/api/admin/students/${editingStudent.profile.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
    } else {
      res = await apiFetch('/api/admin/students', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    }

    if (res.success) {
      alert(editingStudent ? 'Student updated successfully!' : 'Student created successfully!');
      await loadData();
      setIsOpen(false);
    } else {
      alert(res.message || 'Action failed.');
    }
    setSubmitting(false);
  };

  const handleToggleStatus = async (userId: string) => {
    const res = await apiFetch(`/api/admin/users/${userId}/status`, {
      method: 'PATCH'
    });
    if (res.success) {
      setStudents(prev => 
        prev.map(item => 
          item.user.id === userId 
            ? { ...item, user: { ...item.user, isActive: res.data.isActive } } 
            : item
        )
      );
    } else {
      alert('Failed to update status.');
    }
  };

  const handleResetPassword = async (userId: string, email: string) => {
    if (confirm(`Are you sure you want to reset password for ${email}?`)) {
      const res = await apiFetch(`/api/admin/users/${userId}/reset-password`, {
        method: 'POST'
      });
      if (res.success) {
        alert(res.message);
      } else {
        alert('Failed to reset password.');
      }
    }
  };

  // Excel Bulk Import handler
  const handleBulkImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawJson = XLSX.utils.sheet_to_json(ws) as any[];

        if (rawJson.length === 0) {
          alert('Excel file is empty.');
          return;
        }

        // Map column headers
        const parsedStudents = rawJson.map((row: any) => {
          return {
            email: row.Email || row.email || '',
            firstName: row.FirstName || row.firstName || row['First Name'] || '',
            lastName: row.LastName || row.lastName || row['Last Name'] || '',
            rollNumber: String(row.RollNumber || row.rollNumber || row['Roll Number'] || '').toUpperCase(),
            phone: String(row.Phone || row.phone || ''),
            departmentId: row.DepartmentId || row.departmentId || departmentId,
            semesterId: row.SemesterId || row.semesterId || semesterId,
            sectionId: row.SectionId || row.sectionId || sectionId
          };
        });

        const invalid = parsedStudents.some(s => !s.email || !s.rollNumber || !s.firstName);
        if (invalid) {
          alert('Failed to parse roster. Roster columns must contain: Email, FirstName, RollNumber.');
          return;
        }

        setLoading(true);
        const importRes = await apiFetch('/api/admin/students/bulk-import', {
          method: 'POST',
          body: JSON.stringify({ students: parsedStudents })
        });

        if (importRes.success) {
          alert(importRes.message || `Imported ${parsedStudents.length} students successfully.`);
          await loadData();
        } else {
          alert(importRes.message || 'Bulk import failed.');
          setLoading(false);
        }
      } catch (err: any) {
        alert('File parsing failed: ' + err.message);
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = ''; // clear input
  };

  // Filter lists
  const filteredStudents = students.filter((item) => {
    const matchesSearch =
      item.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.profile.rollNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = deptFilter === 'all' || item.profile.departmentId === deptFilter;
    const matchesSec = secFilter === 'all' || item.profile.sectionId === secFilter;
    return matchesSearch && matchesDept && matchesSec;
  });

  const getDeptCode = (deptId: string) => {
    return departments.find((d) => d.id === deptId)?.code || 'DEPT';
  };

  const getSectionName = (secId: string) => {
    return sections.find((s) => s.id === secId)?.name || 'SEC';
  };

  if (loading && students.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-605"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".xlsx,.xls,.csv"
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Students Registry</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage college students catalog, sections, and enrolments.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleBulkImport} className="border-gray-200 dark:border-gray-800 flex items-center gap-2 h-9 font-semibold">
            <FileUp className="w-4 h-4 text-gray-500" />
            Bulk Import Excel
          </Button>
          <Button onClick={handleOpenAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 h-9 font-semibold shadow-md shadow-indigo-500/10">
            <Plus className="w-4 h-4" />
            Add Student
          </Button>
        </div>
      </div>

      {/* Main Table */}
      <Card className="border-0 shadow-sm dark:bg-gray-900/60">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base font-semibold">Registered Students</CardTitle>
              <CardDescription>Academic database of enrolled students.</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search name, roll no, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 border-gray-200 dark:border-gray-800 w-full bg-white dark:bg-gray-950 font-medium"
                />
              </div>

              {/* Department Filter */}
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="h-9 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 text-xs outline-none font-bold text-gray-700 dark:text-gray-300"
              >
                <option value="all">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.code}
                  </option>
                ))}
              </select>

              {/* Section Filter */}
              <select
                value={secFilter}
                onChange={(e) => setSecFilter(e.target.value)}
                className="h-9 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 text-xs outline-none font-bold text-gray-700 dark:text-gray-300"
              >
                <option value="all">All Sections</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
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
                <TableHead className="pl-6 w-36">Roll Number</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Email Address</TableHead>
                <TableHead>Branch & Section</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead>Account Status</TableHead>
                <TableHead className="pr-6 text-right w-16">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    No students registered matching filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map(({ profile, user }) => (
                  <TableRow key={profile.id}>
                    <TableCell className="pl-6 font-bold text-gray-900 dark:text-gray-100 font-mono text-xs">
                      {profile.rollNumber}
                    </TableCell>
                    <TableCell className="font-bold text-gray-900 dark:text-gray-100">
                      {user.name}
                    </TableCell>
                    <TableCell className="text-gray-500 font-medium text-xs">
                      {user.email}
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-gray-750 dark:text-gray-300">
                      <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded mr-1.5 dark:bg-indigo-950/20 dark:text-indigo-400">
                        {getDeptCode(profile.departmentId)}
                      </span>
                      Section {getSectionName(profile.sectionId)}
                    </TableCell>
                    <TableCell className="text-gray-500 text-xs font-medium">
                      {profile.phone || '---'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          user.isActive
                            ? 'bg-emerald-50 text-emerald-605 border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400 font-bold text-[10px]'
                            : 'bg-red-50 text-red-605 border border-red-100 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400 font-bold text-[10px]'
                        }
                      >
                        {user.isActive ? 'active' : 'suspended'}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500">
                            <MoreVertical className="w-4.5 h-4.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="dark:bg-gray-900">
                          <DropdownMenuItem onClick={() => handleOpenEdit({ profile, user })} className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                            <Edit2 className="w-4 h-4 text-gray-400" />
                            Edit Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(user.id)} className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                            {user.isActive ? (
                              <>
                                <ToggleLeft className="w-4 h-4 text-red-500" />
                                Suspend Account
                              </>
                            ) : (
                              <>
                                <ToggleRight className="w-4 h-4 text-emerald-500" />
                                Activate Account
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleResetPassword(user.id, user.email)} className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-amber-600">
                            <Key className="w-4 h-4" />
                            Reset Password
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

      {/* Add / Edit Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg dark:bg-gray-950 border border-gray-100 dark:border-gray-800">
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">
                {editingStudent ? 'Edit Student Profile' : 'Add New Student'}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {editingStudent
                  ? 'Update student academic details and profile details.'
                  : 'Enroll a new student in the portal. Default credentials will be generated.'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4">
              {/* First Name */}
              <div className="space-y-1.5">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="bg-transparent border-gray-200 dark:border-gray-800"
                  required
                />
              </div>

              {/* Last Name */}
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="bg-transparent border-gray-200 dark:border-gray-800"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent border-gray-200 dark:border-gray-800"
                  required
                />
              </div>

              {/* Roll Number */}
              <div className="space-y-1.5">
                <Label htmlFor="rollNumber">Roll Number</Label>
                <Input
                  id="rollNumber"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  placeholder="e.g. ME21001"
                  className="bg-transparent border-gray-200 dark:border-gray-800 font-mono uppercase"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* Department */}
              <div className="space-y-1.5">
                <Label htmlFor="dept">Department</Label>
                <select
                  id="dept"
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
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

              {/* Year / Semester */}
              <div className="space-y-1.5">
                <Label htmlFor="sem">Year / Semester</Label>
                <select
                  id="sem"
                  value={semesterId}
                  onChange={(e) => setSemesterId(e.target.value)}
                  className="w-full h-10 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 text-sm outline-none font-medium"
                  required
                >
                  {semesters.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Year {Math.ceil(s.number / 2)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Section */}
              <div className="space-y-1.5">
                <Label htmlFor="sec">Section</Label>
                <select
                  id="sec"
                  value={sectionId}
                  onChange={(e) => setSectionId(e.target.value)}
                  className="w-full h-10 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 text-sm outline-none font-medium"
                  required
                >
                  {sections
                    .filter((s) => 
                      (s.department_id === departmentId || s.departmentId === departmentId) &&
                      (s.semester_id === semesterId || s.semesterId === semesterId)
                    )
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Phone */}
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-transparent border-gray-200 dark:border-gray-800"
                />
              </div>

              {/* Guardian Name */}
              <div className="space-y-1.5">
                <Label htmlFor="gName">Guardian Name</Label>
                <Input
                  id="gName"
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  className="bg-transparent border-gray-200 dark:border-gray-800"
                />
              </div>
            </div>

            {/* Guardian Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="gPhone">Guardian Phone</Label>
              <Input
                id="gPhone"
                value={guardianPhone}
                onChange={(e) => setGuardianPhone(e.target.value)}
                className="bg-transparent border-gray-200 dark:border-gray-800"
              />
            </div>

            <DialogFooter className="pt-4 flex gap-2 justify-end">
              <DialogClose asChild>
                <Button type="button" variant="outline" className="border-gray-200 dark:border-gray-800 h-9 font-semibold">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700 text-white h-9 font-bold shadow-md shadow-indigo-500/10">
                {submitting ? 'Saving...' : editingStudent ? 'Update Details' : 'Add Student'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

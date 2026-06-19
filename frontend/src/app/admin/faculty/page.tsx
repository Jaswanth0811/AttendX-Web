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
import { Users, Plus, Search, MoreVertical, Edit2, Key, ToggleLeft, ToggleRight, FileUp } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import * as XLSX from 'xlsx';

export default function FacultyPage() {
  const [loading, setLoading] = useState(true);
  const [faculty, setFaculty] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');

  // Form States
  const [isOpen, setIsOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<any | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [facultyCode, setFacultyCode] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [designation, setDesignation] = useState('Assistant Professor');
  const [qualification, setQualification] = useState('Ph.D.');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load Data
  async function loadData() {
    // 1. Fetch departments
    const metadataRes = await apiFetch('/api/student/timetable/metadata');
    if (metadataRes.success && metadataRes.data) {
      setDepartments(metadataRes.data.departments || []);
      if (metadataRes.data.departments.length > 0 && !departmentId) {
        setDepartmentId(metadataRes.data.departments[0].id);
      }
    }

    // 2. Fetch faculty list
    const facultyRes = await apiFetch('/api/admin/faculty');
    if (facultyRes.success && facultyRes.data) {
      setFaculty(facultyRes.data);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingFaculty(null);
    setFirstName('');
    setLastName('');
    setEmail('');
    setFacultyCode('');
    setPhone('');
    setDesignation('Assistant Professor');
    setQualification('Ph.D.');
    if (departments.length > 0) setDepartmentId(departments[0].id);
    setIsOpen(true);
  };

  const handleOpenEdit = (fac: any) => {
    setEditingFaculty(fac);
    setFirstName(fac.user.firstName || fac.user.name?.split(' ')[0] || '');
    setLastName(fac.user.lastName || fac.user.name?.split(' ')[1] || '');
    setEmail(fac.user.email);
    setFacultyCode(fac.profile.facultyCode);
    setPhone(fac.profile.phone || '');
    setDesignation(fac.profile.designation || 'Assistant Professor');
    setQualification(fac.profile.qualification || 'Ph.D.');
    setDepartmentId(fac.profile.departmentId);
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
      facultyCode: facultyCode.toUpperCase(),
      departmentId,
      designation,
      qualification
    };

    let res;
    if (editingFaculty) {
      res = await apiFetch(`/api/admin/faculty/${editingFaculty.profile.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
    } else {
      res = await apiFetch('/api/admin/faculty', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    }

    if (res.success) {
      alert(editingFaculty ? 'Faculty updated successfully!' : 'Faculty registered successfully!');
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
      setFaculty(prev => 
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
        const parsedFaculty = rawJson.map((row: any) => {
          return {
            email: row.Email || row.email || '',
            firstName: row.FirstName || row.firstName || row['First Name'] || '',
            lastName: row.LastName || row.lastName || row['Last Name'] || '',
            facultyCode: String(row.FacultyCode || row.facultyCode || row['Faculty Code'] || row.EmployeeId || row.employeeId || '').toUpperCase(),
            phone: String(row.Phone || row.phone || ''),
            departmentId: row.DepartmentId || row.departmentId || departmentId,
            designation: row.Designation || row.designation || designation,
            qualification: row.Qualification || row.qualification || qualification
          };
        });

        const invalid = parsedFaculty.some(f => !f.email || !f.facultyCode || !f.firstName);
        if (invalid) {
          alert('Failed to parse roster. Roster columns must contain: Email, FirstName, FacultyCode.');
          return;
        }

        setLoading(true);
        const importRes = await apiFetch('/api/admin/faculty/bulk-import', {
          method: 'POST',
          body: JSON.stringify({ faculty: parsedFaculty })
        });

        if (importRes.success) {
          alert(importRes.message || `Imported ${parsedFaculty.length} faculty members successfully.`);
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

  // Filter list
  const filteredFaculty = faculty.filter((item) => {
    const matchesSearch =
      item.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.profile.facultyCode?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = deptFilter === 'all' || item.profile.departmentId === deptFilter;
    return matchesSearch && matchesDept;
  });

  const getDeptCode = (deptId: string) => {
    return departments.find((d) => d.id === deptId)?.code || 'DEPT';
  };

  if (loading && faculty.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-650"></div>
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
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Faculty Directory</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage college faculty database, qualifications, and accounts.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleBulkImport} className="border-gray-200 dark:border-gray-800 flex items-center gap-2 h-9 font-semibold">
            <FileUp className="w-4 h-4 text-gray-500" />
            Bulk Import Excel
          </Button>
          <Button onClick={handleOpenAdd} className="bg-indigo-650 hover:bg-indigo-700 text-white flex items-center gap-2 h-9 font-semibold shadow-md shadow-indigo-500/10">
            <Plus className="w-4 h-4" />
            Add Faculty Member
          </Button>
        </div>
      </div>

      {/* Main Table */}
      <Card className="border-0 shadow-sm dark:bg-gray-900/60">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base font-semibold">Faculty Staff</CardTitle>
              <CardDescription>Academic database of lecturing staff.</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search name, staff code, email..."
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
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50/50 dark:bg-gray-900/40">
              <TableRow>
                <TableHead className="pl-6 w-36">Staff Code</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Email Address</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Qualification</TableHead>
                <TableHead>Account Status</TableHead>
                <TableHead className="pr-6 text-right w-16">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFaculty.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                    No faculty staff registered matching filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredFaculty.map(({ profile, user }) => (
                  <TableRow key={profile.id}>
                    <TableCell className="pl-6 font-bold text-gray-900 dark:text-gray-100 font-mono text-xs">
                      {profile.facultyCode}
                    </TableCell>
                    <TableCell className="font-bold text-gray-900 dark:text-gray-100">
                      {user.name}
                    </TableCell>
                    <TableCell className="text-gray-500 font-medium text-xs">
                      {user.email}
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded dark:bg-indigo-950/20 dark:text-indigo-400">
                        {getDeptCode(profile.departmentId)}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-500 text-xs font-medium">
                      {profile.designation || '---'}
                    </TableCell>
                    <TableCell className="text-gray-500 text-xs font-medium">
                      {profile.qualification || '---'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          user.isActive
                            ? 'bg-emerald-50 text-emerald-655 border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400 font-bold text-[10px]'
                            : 'bg-red-50 text-red-655 border border-red-100 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400 font-bold text-[10px]'
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
                {editingFaculty ? 'Edit Faculty Profile' : 'Add New Faculty Member'}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {editingFaculty
                  ? 'Update faculty profile qualifications and designation.'
                  : 'Register a new lecturer in the database. Default credentials will be generated.'}
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

              {/* Staff Code */}
              <div className="space-y-1.5">
                <Label htmlFor="facCode">Staff Code</Label>
                <Input
                  id="facCode"
                  value={facultyCode}
                  onChange={(e) => setFacultyCode(e.target.value)}
                  placeholder="e.g. FAC001"
                  className="bg-transparent border-gray-200 dark:border-gray-800 font-mono uppercase"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Designation */}
              <div className="space-y-1.5">
                <Label htmlFor="designation">Designation</Label>
                <Input
                  id="designation"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. Assistant Professor"
                  className="bg-transparent border-gray-200 dark:border-gray-800"
                />
              </div>

              {/* Qualification */}
              <div className="space-y-1.5">
                <Label htmlFor="qualification">Qualification</Label>
                <Input
                  id="qualification"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  placeholder="e.g. Ph.D. in CSE"
                  className="bg-transparent border-gray-200 dark:border-gray-800"
                />
              </div>
            </div>

            <DialogFooter className="pt-4 flex gap-2 justify-end">
              <DialogClose asChild>
                <Button type="button" variant="outline" className="border-gray-200 dark:border-gray-800 h-9 font-semibold">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={submitting} className="bg-indigo-650 hover:bg-indigo-700 text-white h-9 font-bold shadow-md shadow-indigo-500/10">
                {submitting ? 'Saving...' : editingFaculty ? 'Update Profile' : 'Add Faculty'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

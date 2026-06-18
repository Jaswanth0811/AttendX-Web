'use client';

import React, { useState } from 'react';
import { mockStudentProfiles, mockUsers, mockDepartments, mockSections } from '@/lib/mock-data';
import { StudentProfile, User } from '@/types';
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

export default function StudentsPage() {
  const [studentProfiles, setStudentProfiles] = useState<StudentProfile[]>(mockStudentProfiles);
  const [users, setUsers] = useState<User[]>(mockUsers.filter((u) => u.role === 'student'));
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [secFilter, setSecFilter] = useState('all');

  // Form States
  const [isOpen, setIsOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<{ profile: StudentProfile; user: User } | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [departmentId, setDepartmentId] = useState(mockDepartments[0]?.id || '');
  const [semesterId, setSemesterId] = useState('sem-1');
  const [sectionId, setSectionId] = useState(mockSections[0]?.id || '');

  // Combined Listing
  const combinedStudents = studentProfiles.map((profile) => {
    const user = users.find((u) => u.id === profile.userId) || {
      id: profile.userId,
      name: 'Unknown Student',
      email: 'unknown@attendx.edu',
      role: 'student' as const,
      isActive: false,
      createdAt: '',
      updatedAt: ''
    };
    return { profile, user };
  });

  // Filters
  const filteredStudents = combinedStudents.filter(({ profile, user }) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.rollNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = deptFilter === 'all' || profile.departmentId === deptFilter;
    const matchesSec = secFilter === 'all' || profile.sectionId === secFilter;
    return matchesSearch && matchesDept && matchesSec;
  });

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setName('');
    setEmail('');
    setRollNumber('');
    setDepartmentId(mockDepartments[0]?.id || '');
    setSemesterId('sem-1');
    setSectionId(mockSections[0]?.id || '');
    setIsOpen(true);
  };

  const handleOpenEdit = (student: { profile: StudentProfile; user: User }) => {
    setEditingStudent(student);
    setName(student.user.name);
    setEmail(student.user.email);
    setRollNumber(student.profile.rollNumber);
    setDepartmentId(student.profile.departmentId);
    setSemesterId(student.profile.semesterId);
    setSectionId(student.profile.sectionId);
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !rollNumber) return;

    if (editingStudent) {
      setUsers(
        users.map((u) =>
          u.id === editingStudent.user.id
            ? { ...u, name, email, updatedAt: new Date().toISOString().split('T')[0] }
            : u
        )
      );
      setStudentProfiles(
        studentProfiles.map((p) =>
          p.id === editingStudent.profile.id
            ? { ...p, rollNumber: rollNumber.toUpperCase(), departmentId, semesterId, sectionId }
            : p
        )
      );
    } else {
      const newUserId = `user-std-${Date.now()}`;
      const newUser: User = {
        id: newUserId,
        name,
        email,
        role: 'student',
        isActive: true,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };

      const newProfile: StudentProfile = {
        id: `std-profile-${Date.now()}`,
        userId: newUserId,
        rollNumber: rollNumber.toUpperCase(),
        departmentId,
        semesterId,
        sectionId,
      };

      setUsers([...users, newUser]);
      setStudentProfiles([...studentProfiles, newProfile]);
    }
    setIsOpen(false);
  };

  const handleToggleStatus = (userId: string) => {
    setUsers(
      users.map((u) => (u.id === userId ? { ...u, isActive: !u.isActive } : u))
    );
  };

  const handleResetPassword = (email: string) => {
    alert(`Reset password email dispatched to ${email}.`);
  };

  const handleBulkImport = () => {
    alert('Bulk Import CSV option triggered! Upload your Excel/CSV format student catalog.');
  };

  const getDeptCode = (deptId: string) => {
    return mockDepartments.find((d) => d.id === deptId)?.code || 'UNKNOWN';
  };

  const getSectionName = (secId: string) => {
    return mockSections.find((s) => s.id === secId)?.name || 'UNKNOWN';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Students Registry</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage college students catalog, sections, and enrolments.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleBulkImport} className="border-gray-200 dark:border-gray-800 flex items-center gap-2 h-9">
            <FileUp className="w-4 h-4 text-gray-500" />
            Bulk Import CSV
          </Button>
          <Button onClick={handleOpenAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 h-9">
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
                  placeholder="Search name, roll number..."
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
                <option value="all">All Depts</option>
                {mockDepartments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.code}
                  </option>
                ))}
              </select>

              {/* Section Filter */}
              <select
                value={secFilter}
                onChange={(e) => setSecFilter(e.target.value)}
                className="h-9 rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="all">All Sections</option>
                {mockSections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.name}
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
                <TableHead className="pl-6 w-32">Roll Number</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-6 text-right w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    No student profiles found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map(({ profile, user }) => (
                  <TableRow key={profile.id}>
                    <TableCell className="pl-6 font-semibold text-indigo-600 dark:text-indigo-400">
                      {profile.rollNumber}
                    </TableCell>
                    <TableCell className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2.5 h-12">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-100 to-emerald-100 dark:from-teal-950 dark:to-emerald-950 flex items-center justify-center text-teal-700 dark:text-teal-300 font-bold text-xs shrink-0">
                        {user.name.split(' ').map((n) => n[0]).join('').substring(0, 2)}
                      </div>
                      <span>{user.name}</span>
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-400">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 text-gray-600 dark:text-gray-400">
                        {getDeptCode(profile.departmentId)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-300 text-xs font-semibold">
                      {getSectionName(profile.sectionId)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? 'default' : 'destructive'} className={user.isActive ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50' : 'destructive'}>
                        {user.isActive ? 'Active' : 'Suspended'}
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
                          <DropdownMenuItem onClick={() => handleOpenEdit({ profile, user })} className="flex items-center gap-2 cursor-pointer">
                            <Edit2 className="w-4 h-4" /> Edit Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleResetPassword(user.email)} className="flex items-center gap-2 cursor-pointer">
                            <Key className="w-4 h-4" /> Reset Password
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(user.id)} className="flex items-center gap-2 cursor-pointer">
                            {user.isActive ? (
                              <>
                                <ToggleRight className="w-4 h-4 text-red-500" /> Suspend Student
                              </>
                            ) : (
                              <>
                                <ToggleLeft className="w-4 h-4 text-emerald-500" /> Activate Student
                              </>
                            )}
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
              <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              {editingStudent ? 'Edit Student Details' : 'Add New Student'}
            </DialogTitle>
            <DialogDescription>
              Register academic student profiles and class assignments.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1 space-y-2">
                <Label htmlFor="rollNo">Roll Number</Label>
                <Input
                  id="rollNo"
                  placeholder="CS023"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  className="h-10 border-gray-200 dark:border-gray-800 font-semibold"
                  required
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-10 border-gray-200 dark:border-gray-800"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="rahul.sharma@attendx.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 border-gray-200 dark:border-gray-800"
                required
              />
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="semester">Academic Semester</Label>
              <select
                id="semester"
                value={semesterId}
                onChange={(e) => setSemesterId(e.target.value)}
                className="w-full h-10 rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="sem-1">1st Semester</option>
                <option value="sem-2">2nd Semester</option>
                <option value="sem-3">3rd Semester</option>
                <option value="sem-4">4th Semester</option>
                <option value="sem-5">5th Semester</option>
                <option value="sem-6">6th Semester</option>
              </select>
            </div>

            <DialogFooter className="mt-6 flex gap-2">
              <DialogClose asChild>
                <Button type="button" variant="outline" className="border-gray-200 dark:border-gray-800">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {editingStudent ? 'Save Changes' : 'Register Student'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

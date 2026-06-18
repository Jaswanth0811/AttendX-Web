'use client';

import React, { useState } from 'react';
import { mockFacultyProfiles, mockUsers, mockDepartments } from '@/lib/mock-data';
import { FacultyProfile, User } from '@/types';
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
import { Users, Plus, Search, MoreVertical, Edit2, Key, ToggleLeft, ToggleRight } from 'lucide-react';

export default function FacultyPage() {
  const [facultyProfiles, setFacultyProfiles] = useState<FacultyProfile[]>(mockFacultyProfiles);
  const [users, setUsers] = useState<User[]>(mockUsers.filter((u) => u.role === 'faculty'));
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');

  // Form States
  const [isOpen, setIsOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<{ profile: FacultyProfile; user: User } | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [departmentId, setDepartmentId] = useState(mockDepartments[0]?.id || '');
  const [designation, setDesignation] = useState('Assistant Professor');
  const [qualification, setQualification] = useState('Ph.D.');

  // Combined Faculty Listing
  const combinedFaculty = facultyProfiles.map((profile) => {
    const user = users.find((u) => u.id === profile.userId) || {
      id: profile.userId,
      name: 'Unknown Faculty',
      email: 'unknown@attendx.edu',
      role: 'faculty' as const,
      isActive: false,
      createdAt: '',
      updatedAt: ''
    };
    return { profile, user };
  });

  // Filter combined listing
  const filteredFaculty = combinedFaculty.filter(({ profile, user }) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.facultyCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = deptFilter === 'all' || profile.departmentId === deptFilter;
    return matchesSearch && matchesDept;
  });

  const handleOpenAdd = () => {
    setEditingFaculty(null);
    setName('');
    setEmail('');
    setEmployeeId('');
    setDepartmentId(mockDepartments[0]?.id || '');
    setDesignation('Assistant Professor');
    setQualification('Ph.D.');
    setIsOpen(true);
  };

  const handleOpenEdit = (faculty: { profile: FacultyProfile; user: User }) => {
    setEditingFaculty(faculty);
    setName(faculty.user.name);
    setEmail(faculty.user.email);
    setEmployeeId(faculty.profile.facultyCode);
    setDepartmentId(faculty.profile.departmentId);
    setDesignation(faculty.profile.designation || '');
    setQualification(faculty.profile.qualification || '');
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !employeeId) return;

    if (editingFaculty) {
      // Edit User
      setUsers(
        users.map((u) =>
          u.id === editingFaculty.user.id
            ? { ...u, name, email, updatedAt: new Date().toISOString().split('T')[0] }
            : u
        )
      );
      // Edit Profile
      setFacultyProfiles(
        facultyProfiles.map((p) =>
          p.id === editingFaculty.profile.id
            ? { ...p, facultyCode: employeeId.toUpperCase(), departmentId, designation, qualification }
            : p
        )
      );
    } else {
      // Add User
      const newUserId = `user-fac-${Date.now()}`;
      const newUser: User = {
        id: newUserId,
        name,
        email,
        role: 'faculty',
        isActive: true,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };

      // Add Profile
      const newProfile: FacultyProfile = {
        id: `fac-profile-${Date.now()}`,
        userId: newUserId,
        facultyCode: employeeId.toUpperCase(),
        departmentId,
        designation,
        qualification,
      };

      setUsers([...users, newUser]);
      setFacultyProfiles([...facultyProfiles, newProfile]);
    }
    setIsOpen(false);
  };

  const handleToggleStatus = (userId: string) => {
    setUsers(
      users.map((u) => (u.id === userId ? { ...u, isActive: !u.isActive } : u))
    );
  };

  const handleResetPassword = (email: string) => {
    alert(`A password reset link has been dispatched to ${email}.`);
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
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Faculty Registry</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage details, active profiles, and roles of lecturers.</p>
        </div>
        <Button onClick={handleOpenAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Faculty
        </Button>
      </div>

      {/* Main Listing Card */}
      <Card className="border-0 shadow-sm dark:bg-gray-900/60">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base font-semibold">Faculty Members</CardTitle>
              <CardDescription>Comprehensive registry of professors and teaching staff.</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search name, code, email..."
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
                    {dept.code}
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
                <TableHead className="pl-6 w-28">Emp ID</TableHead>
                <TableHead>Professor</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-6 text-right w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFaculty.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    No faculty profiles found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredFaculty.map(({ profile, user }) => (
                  <TableRow key={profile.id}>
                    <TableCell className="pl-6 font-semibold text-indigo-600 dark:text-indigo-400">
                      {profile.facultyCode}
                    </TableCell>
                    <TableCell className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2.5 h-12">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-100 to-indigo-100 dark:from-purple-950 dark:to-indigo-950 flex items-center justify-center text-purple-700 dark:text-purple-300 font-bold text-xs shrink-0">
                        {user.name.split(' ').map((n) => n[0]).join('').substring(0, 2)}
                      </div>
                      <div className="flex flex-col">
                        <span>{user.name}</span>
                        <span className="text-[10px] text-muted-foreground font-normal">{profile.qualification}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-400">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 text-gray-600 dark:text-gray-400">
                        {getDeptCode(profile.departmentId)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-300 text-xs font-medium">
                      {profile.designation || 'Lecturer'}
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
                                <ToggleRight className="w-4 h-4 text-red-500" /> Suspend Faculty
                              </>
                            ) : (
                              <>
                                <ToggleLeft className="w-4 h-4 text-emerald-500" /> Activate Faculty
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
              <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              {editingFaculty ? 'Edit Faculty Details' : 'Add New Faculty Member'}
            </DialogTitle>
            <DialogDescription>
              Register academic faculty profiles and assignments.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1 space-y-2">
                <Label htmlFor="empId">Employee ID</Label>
                <Input
                  id="empId"
                  placeholder="FAC-102"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="h-10 border-gray-200 dark:border-gray-800 font-semibold"
                  required
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Dr. Rajesh Verma"
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
                placeholder="rajesh.verma@attendx.edu"
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
                <Label htmlFor="qualification">Qualification</Label>
                <Input
                  id="qualification"
                  placeholder="Ph.D., M.Tech"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  className="h-10 border-gray-200 dark:border-gray-800"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="designation">Designation</Label>
              <select
                id="designation"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full h-10 rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="Professor & Head">Professor & Head</option>
                <option value="Professor">Professor</option>
                <option value="Associate Professor">Associate Professor</option>
                <option value="Assistant Professor">Assistant Professor</option>
                <option value="Guest Lecturer">Guest Lecturer</option>
              </select>
            </div>

            <DialogFooter className="mt-6 flex gap-2">
              <DialogClose asChild>
                <Button type="button" variant="outline" className="border-gray-200 dark:border-gray-800">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {editingFaculty ? 'Save Changes' : 'Register Faculty'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

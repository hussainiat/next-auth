'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'user';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
}

export default function AdminDashboardPage() {
  const { user, canAccessDashboard } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!canAccessDashboard) {
      router.push('/login');
      return;
    }

    if (user?.role !== 'admin' && user?.role !== 'super_admin') {
      router.push('/dashboard');
      return;
    }

    fetchUsers();
  }, [user, canAccessDashboard, router]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { authAPI } = await import('@/lib/auth/api');
      
      // Fetch all users
      const allUsersResponse = await authAPI.getAllUsers();
      setUsers(allUsersResponse.users);
      
      // Fetch pending users
      const pendingUsersResponse = await authAPI.getPendingUsers();
      setPendingUsers(pendingUsersResponse.users);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId: string) => {
    try {
      const { authAPI } = await import('@/lib/auth/api');
      await authAPI.approveUser(userId);
      toast.success('User approved successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error approving user:', error);
      toast.error('Failed to approve user');
    }
  };

  const handleRejectUser = async (userId: string) => {
    try {
      const { authAPI } = await import('@/lib/auth/api');
      await authAPI.rejectUser(userId);
      toast.success('User rejected successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error rejecting user:', error);
      toast.error('Failed to reject user');
    }
  };

  const handleAssignRole = async (userId: string, newRole: 'admin' | 'user') => {
    try {
      const { authAPI } = await import('@/lib/auth/api');
      await authAPI.assignRole(userId, newRole);
      toast.success(`User role updated to ${newRole}`);
      fetchUsers();
    } catch (error) {
      console.error('Error assigning role:', error);
      toast.error('Failed to assign role');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage users and system settings
          </p>
        </div>

        {/* Pending Users Section */}
        {pendingUsers.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Pending Approvals ({pendingUsers.length})
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pendingUsers.map((pendingUser) => (
                <Card key={pendingUser.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{pendingUser.name}</CardTitle>
                    <CardDescription>{pendingUser.email}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Role:</span>
                        <Badge variant="secondary">{pendingUser.role}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Status:</span>
                        <Badge variant="outline">{pendingUser.approvalStatus}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Registered:</span>
                        <span className="text-sm">
                          {format(new Date(pendingUser.createdAt), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApproveUser(pendingUser.id)}
                        className="flex-1"
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRejectUser(pendingUser.id)}
                        className="flex-1"
                      >
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Users Section */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            All Users ({users.length})
          </h2>
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Registered
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={user.role === 'super_admin' ? 'default' : user.role === 'admin' ? 'secondary' : 'outline'}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge 
                        variant={
                          user.approvalStatus === 'approved' ? 'default' :
                          user.approvalStatus === 'pending' ? 'secondary' : 'destructive'
                        }
                      >
                        {user.approvalStatus}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        {user.approvalStatus === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApproveUser(user.id)}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRejectUser(user.id)}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {user.role !== 'super_admin' && user.role !== 'admin' && user.approvalStatus === 'approved' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAssignRole(user.id, 'admin')}
                          >
                            Make Admin
                          </Button>
                        )}
                        {user.role === 'admin' && user.approvalStatus === 'approved' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAssignRole(user.id, 'user')}
                          >
                            Remove Admin
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
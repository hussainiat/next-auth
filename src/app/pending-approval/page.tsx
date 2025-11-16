'use client';

import { useAuth } from '@/lib/auth/context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, UserCheck } from 'lucide-react';

export default function PendingApprovalPage() {
  const { user, isAuthenticated, isApproved, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is not authenticated, redirect to login
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // If user is approved, redirect to dashboard
    if (isApproved) {
      router.push('/dashboard');
      return;
    }
  }, [isAuthenticated, isApproved, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // Show loading state while checking auth status
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
            <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
          </div>
          <CardTitle className="text-2xl">Account Pending Approval</CardTitle>
          <CardDescription>
            Your account is currently being reviewed by our administrators
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <UserCheck className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-yellow-800 dark:text-yellow-400">
                  What's happening?
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Your account registration has been received and is currently under review. 
                  An administrator will review your account and approve it shortly.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p><strong>Account Details:</strong></p>
            <p>Name: {user?.name}</p>
            <p>Email: {user?.email}</p>
            <p>Status: <span className="capitalize text-yellow-600 dark:text-yellow-400">{user?.approvalStatus}</span></p>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              You'll receive an email notification once your account has been approved. 
              This usually takes less than 24 hours.
            </p>
            <Button 
              onClick={handleLogout} 
              variant="outline" 
              className="w-full"
            >
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
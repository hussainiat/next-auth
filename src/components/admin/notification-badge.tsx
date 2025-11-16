'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: 'user_registered' | 'user_approved' | 'user_rejected';
  message: string;
  userId: string;
  userName: string;
  userEmail: string;
  createdAt: Date;
  read: boolean;
}

export function AdminNotificationBadge() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // Simulate fetching notifications (in a real app, this would be an API call)
  useEffect(() => {
    // This would typically fetch from an API endpoint
    // For now, we'll create a simple polling mechanism
    const checkForNewUsers = async () => {
      try {
        const { authAPI } = await import('@/lib/auth/api');
        const response = await authAPI.getPendingUsers();
        
        // Convert pending users to notifications
        const newNotifications: Notification[] = response.users.map(user => ({
          id: `pending-${user.id}-${Date.now()}`,
          type: 'user_registered' as const,
          message: `New user registration: ${user.name}`,
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          createdAt: new Date(user.createdAt),
          read: false,
        }));

        setNotifications(newNotifications);
        setUnreadCount(newNotifications.length);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    // Check immediately and then every 30 seconds
    checkForNewUsers();
    const interval = setInterval(checkForNewUsers, 30000);

    return () => clearInterval(interval);
  }, []);

  const markAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleNotificationClick = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      markAsRead();
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'user_registered':
        return '👤';
      case 'user_approved':
        return '✅';
      case 'user_rejected':
        return '❌';
      default:
        return '📢';
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Notifications</h4>
            {unreadCount > 0 && (
              <Badge variant="secondary">{unreadCount} new</Badge>
            )}
          </div>
          
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No new notifications
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border ${
                    notification.read ? 'bg-muted/50' : 'bg-accent'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{notification.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {notification.userEmail}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="pt-2 border-t">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full"
              onClick={() => window.location.href = '/admin'}
            >
              View Admin Panel
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Briefcase, 
  Shield, 
  Settings, 
  BarChart3, 
  FileText, 
  TrendingUp, 
  Activity,
  Home,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface AdminNavigationProps {
  isOpen: boolean;
  onToggle: () => void;
  stats?: {
    totalUsers: number;
    totalLawyers: number;
    pendingApplications: number;
    totalIssues: number;
  };
}

const AdminNavigation = ({ isOpen, onToggle, stats }: AdminNavigationProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: Home,
      description: 'System overview and quick actions'
    },
    {
      name: 'User Management',
      href: '/admin/user-management',
      icon: Users,
      description: 'Manage all users and accounts',
      badge: stats?.totalUsers
    },
    {
      name: 'Lawyer Verification',
      href: '/admin/lawyer-verification',
      icon: FileText,
      description: 'Review lawyer applications',
      badge: stats?.pendingApplications
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: TrendingUp,
      description: 'System analytics and reports'
    },
    {
      name: 'System Settings',
      href: '/admin/system-settings',
      icon: Settings,
      description: 'Platform configuration'
    }
  ];

  const isActive = (href: string) => {
    if (href === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.includes(href.split('/')[2]);
  };

  const handleNavigation = (href: string) => {
    navigate(href);
    if (window.innerWidth < 1024) {
      onToggle();
    }
  };

  const handleSignOut = () => {
    // Handle sign out logic
    navigate('/signOut');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-lg font-bold">Admin Panel</h1>
                <p className="text-xs text-muted-foreground">Platform Management</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Button
                  key={item.name}
                  variant={active ? "default" : "ghost"}
                  className={`w-full justify-start h-auto p-3 ${
                    active ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  }`}
                  onClick={() => handleNavigation(item.href)}
                >
                  <div className="flex items-center gap-3 w-full">
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.name}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-2">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      <p className={`text-xs mt-1 ${
                        active ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}>
                        {item.description}
                      </p>
                    </div>
                  </div>
                </Button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t">
            <div className="space-y-3">
              {/* Quick Stats */}
              {stats && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-center p-2 bg-muted rounded">
                    <div className="font-semibold">{stats.totalUsers}</div>
                    <div className="text-muted-foreground">Users</div>
                  </div>
                  <div className="text-center p-2 bg-muted rounded">
                    <div className="font-semibold">{stats.totalLawyers}</div>
                    <div className="text-muted-foreground">Lawyers</div>
                  </div>
                </div>
              )}
              
              {/* Sign Out */}
              <Button
                variant="outline"
                className="w-full"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className="lg:hidden fixed top-4 left-4 z-50"
      >
        <Menu className="h-5 w-5" />
      </Button>
    </>
  );
};

export default AdminNavigation;

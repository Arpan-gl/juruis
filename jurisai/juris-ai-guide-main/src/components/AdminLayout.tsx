import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminNavigation from './AdminNavigation';
import { useToast } from '@/components/ui/use-toast';
import axios from '../axios';

interface SystemStats {
  totalUsers: number;
  totalLawyers: number;
  verifiedLawyers: number;
  pendingApplications: number;
  totalIssues: number;
  totalResponses: number;
  totalHires: number;
  activeUsers: number;
}

const AdminLayout = () => {
  const { toast } = useToast();
  const location = useLocation();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);

  console.log('AdminLayout: Component rendered, location:', location.pathname);

  useEffect(() => {
    console.log('AdminLayout: useEffect triggered');
    fetchSystemStats();
  }, []);

  const fetchSystemStats = async () => {
    try {
      console.log('AdminLayout: Fetching system stats...');
      setLoading(true);
      const response = await axios.get('/admin/stats');
      if (response.data.success) {
        console.log('AdminLayout: Stats fetched successfully:', response.data.data);
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('AdminLayout: Error fetching system stats:', error);
      toast({
        title: "Error",
        description: "Failed to fetch system statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  // Close mobile nav when route changes
  useEffect(() => {
    if (isNavOpen && window.innerWidth < 1024) {
      setIsNavOpen(false);
    }
  }, [location.pathname]);

  if (loading) {
    console.log('AdminLayout: Showing loading state');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  console.log('AdminLayout: Rendering main layout');
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Navigation Sidebar */}
      <AdminNavigation 
        isOpen={isNavOpen} 
        onToggle={toggleNav}
        stats={stats ? {
          totalUsers: stats.totalUsers,
          totalLawyers: stats.totalLawyers,
          pendingApplications: stats.pendingApplications,
          totalIssues: stats.totalIssues
        } : undefined}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {getPageTitle(location.pathname)}
              </h1>
              <p className="text-sm text-gray-600">
                {getPageDescription(location.pathname)}
              </p>
            </div>
            
            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              {stats && (
                <div className="hidden md:flex items-center gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">{stats.totalUsers}</div>
                    <div className="text-gray-500">Total Users</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">{stats.totalLawyers}</div>
                    <div className="text-gray-500">Lawyers</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">{stats.pendingApplications}</div>
                    <div className="text-gray-500">Pending</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const getPageTitle = (pathname: string): string => {
  if (pathname === '/admin') return 'Admin Dashboard';
  if (pathname.includes('/users')) return 'User Management';
  if (pathname.includes('/lawyers')) return 'Lawyer Management';
  if (pathname.includes('/applications')) return 'Lawyer Applications';
  if (pathname.includes('/analytics')) return 'Analytics & Reports';
  if (pathname.includes('/settings')) return 'System Settings';
  return 'Admin Panel';
};

const getPageDescription = (pathname: string): string => {
  if (pathname === '/admin') return 'System overview and quick actions';
  if (pathname.includes('/users')) return 'Manage all users and accounts in the system';
  if (pathname.includes('/lawyers')) return 'Manage verified lawyers and their profiles';
  if (pathname.includes('/applications')) return 'Review and manage lawyer verification applications';
  if (pathname.includes('/analytics')) return 'Comprehensive system analytics and reporting';
  if (pathname.includes('/settings')) return 'Configure platform settings and security';
  return 'Platform administration and management';
};

export default AdminLayout;

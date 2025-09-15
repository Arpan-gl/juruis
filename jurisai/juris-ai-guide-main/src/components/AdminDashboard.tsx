import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Briefcase, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  ArrowRight,
  FileText,
  TrendingUp,
  UserCheck,
  UserX
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import axios from '../axios';
import { Link } from 'react-router-dom';

interface DashboardStats {
  pendingApplications: number;
  totalUsers: number;
  totalLawyers: number;
  verifiedLawyers: number;
}

interface PendingApplication {
  _id: string;
  applicant: {
    _id: string;
    username: string;
    email: string;
  };
  applicationDate: string;
  practiceAreas: string[];
  lawSchool: string;
  yearsOfExperience: number;
}

const AdminDashboard = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingApplications, setPendingApplications] = useState<PendingApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, pendingResponse] = await Promise.all([
        axios.get('/admin/dashboard-stats'),
        axios.get('/admin/pending-applications?limit=3')
      ]);

      if (statsResponse.data.success) {
        setStats(statsResponse.data.data);
      }

      if (pendingResponse.data.success) {
        setPendingApplications(pendingResponse.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of system statistics and pending actions
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          Admin Access
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Registered clients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lawyers</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalLawyers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Registered lawyers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Lawyers</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.verifiedLawyers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active professionals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingApplications || 0}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting review
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Applications Section */}
      {stats?.pendingApplications > 0 && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <CardTitle className="text-orange-800">Pending Lawyer Applications</CardTitle>
              </div>
              <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                {stats.pendingApplications} pending
              </Badge>
            </div>
            <CardDescription className="text-orange-700">
              Review and verify lawyer applications to maintain platform quality
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingApplications.map((application) => (
                <div
                  key={application._id}
                  className="flex items-center justify-between p-4 bg-white rounded-lg border border-orange-200"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{application.applicant.username}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {application.yearsOfExperience} years exp.
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="h-3 w-3" />
                        <span>{application.lawSchool}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {application.practiceAreas.slice(0, 3).map((area, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {area}
                          </Badge>
                        ))}
                        {application.practiceAreas.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{application.practiceAreas.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      Applied: {new Date(application.applicationDate).toLocaleDateString()}
                    </span>
                    <Button size="sm" asChild>
                      <Link to="/admin/lawyer-verification">
                        Review
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
              
              {stats.pendingApplications > 3 && (
                <div className="text-center pt-2">
                  <Button variant="outline" asChild>
                    <Link to="/admin/lawyer-verification">
                      View All Pending Applications ({stats.pendingApplications})
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common administrative tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2" asChild>
              <Link to="/admin/lawyer-verification">
                <FileText className="h-6 w-6" />
                <span>Review Applications</span>
              </Link>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2" asChild>
              <Link to="/admin/user-management">
                <Users className="h-6 w-6" />
                <span>Manage Users</span>
              </Link>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2" asChild>
              <Link to="/admin/analytics">
                <TrendingUp className="h-6 w-6" />
                <span>View Analytics</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>
            Current platform health and metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold">User Distribution</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Regular Users</span>
                  <Badge variant="secondary">{stats?.totalUsers || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Lawyers</span>
                  <Badge variant="secondary">{stats?.totalLawyers || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Verified Lawyers</span>
                  <Badge variant="outline">{stats?.verifiedLawyers || 0}</Badge>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold">Verification Status</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Pending Review</span>
                  <Badge variant="destructive">{stats?.pendingApplications || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Verification Rate</span>
                  <Badge variant="outline">
                    {stats?.totalLawyers && stats?.verifiedLawyers 
                      ? Math.round((stats.verifiedLawyers / stats.totalLawyers) * 100)
                      : 0}%
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;

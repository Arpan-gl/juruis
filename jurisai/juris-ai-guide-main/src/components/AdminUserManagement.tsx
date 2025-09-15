import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  Briefcase, 
  Shield, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock,
  UserPlus,
  UserMinus,
  Activity,
  FileText,
  MessageSquare,
  Calendar,
  MapPin,
  Phone,
  Globe,
  Award,
  Building,
  Star,
  Download,
  Upload,
  Database,
  MoreHorizontal,
  Settings,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import axios from '../axios';

interface User {
  _id: string;
  username: string;
  email: string;
  role: 'user' | 'lawyer' | 'admin';
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
  lawyerProfile?: {
    isVerified: boolean;
    verificationStatus: 'pending' | 'approved' | 'rejected';
    applicationDate?: string;
    verificationDate?: string;
    barNumber?: string;
    practiceAreas?: string[];
    yearsOfExperience?: number;
    lawSchool?: string;
  };
}

interface UserActivity {
  type: string;
  date: string;
  description: string;
  details?: any;
}

const AdminUserManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
  
  // Filters and search
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    search: '',
    dateRange: '',
    verificationStatus: ''
  });
  
  // Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  });
  
  const [userModal, setUserModal] = useState({
    action: 'edit' as 'edit' | 'create',
    formData: {
      username: '',
      email: '',
      role: 'user' as 'user' | 'lawyer' | 'admin',
      isActive: true,
      password: ''
    }
  });

  useEffect(() => {
    fetchUsers();
  }, [filters, pagination.currentPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: pagination.itemsPerPage.toString()
      });
      
      if (filters.role) params.append('role', filters.role);
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      if (filters.verificationStatus) params.append('verificationStatus', filters.verificationStatus);

      const response = await axios.get(`/admin/users?${params}`);
      if (response.data.success) {
        setUsers(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserActivity = async (userId: string) => {
    try {
      const response = await axios.get(`/admin/users/${userId}/activity`);
      if (response.data.success) {
        setUserActivity(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching user activity:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user activity",
        variant: "destructive",
      });
    }
  };

  const handleUserAction = async (action: string, userId?: string) => {
    try {
      if (action === 'create') {
        const response = await axios.post('/admin/users', userModal.formData);
        if (response.data.success) {
          toast({
            title: "Success",
            description: "User created successfully",
            variant: "default",
          });
          setShowUserModal(false);
          fetchUsers();
        }
      } else if (action === 'update' && userId) {
        const response = await axios.put(`/admin/users/${userId}`, userModal.formData);
        if (response.data.success) {
          toast({
            title: "Success",
            description: "User updated successfully",
            variant: "default",
          });
          setShowUserModal(false);
          fetchUsers();
        }
      } else if (action === 'delete' && userId) {
        const response = await axios.delete(`/admin/users/${userId}`);
        if (response.data.success) {
          toast({
            title: "Success",
            description: "User deleted successfully",
            variant: "default",
          });
          setShowDeleteModal(false);
          fetchUsers();
        }
      }
    } catch (error: any) {
      console.error('Error performing user action:', error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to perform action",
        variant: "destructive",
      });
    }
  };

  const handleBulkAction = async (action: string, userIds: string[]) => {
    try {
      const response = await axios.post('/admin/users/bulk-action', {
        action,
        userIds,
        data: action === 'change-role' ? { role: filters.role } : {}
      });
      
      if (response.data.success) {
        toast({
          title: "Success",
          description: response.data.message,
          variant: "default",
        });
        fetchUsers();
      }
    } catch (error: any) {
      console.error('Error performing bulk action:', error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to perform bulk action",
        variant: "destructive",
      });
    }
  };

  const openUserModal = (action: 'create' | 'edit', user?: User) => {
    if (action === 'create') {
      setUserModal({
        action: 'create',
        formData: {
          username: '',
          email: '',
          role: 'user',
          isActive: true,
          password: ''
        }
      });
    } else if (action === 'edit' && user) {
      setUserModal({
        action: 'edit',
        formData: {
          username: user.username,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          password: ''
        }
      });
      setSelectedUser(user);
    }
    setShowUserModal(true);
  };

  const openActivityModal = (user: User) => {
    setSelectedUser(user);
    fetchUserActivity(user._id);
    setShowActivityModal(true);
  };

  const filteredUsers = users.filter(user => {
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return (
        user.username.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        (user.lawyerProfile?.barNumber && user.lawyerProfile.barNumber.toLowerCase().includes(searchTerm))
      );
    }
    return true;
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4 text-red-500" />;
      case 'lawyer':
        return <Briefcase className="h-4 w-4 text-blue-500" />;
      case 'user':
        return <Users className="h-4 w-4 text-green-500" />;
      default:
        return <Users className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'lawyer':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'user':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const exportUsers = async () => {
    try {
      const response = await axios.get('/admin/export/users', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'users.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast({
        title: "Success",
        description: "Users exported successfully",
        variant: "default",
      });
    } catch (error) {
      console.error('Error exporting users:', error);
      toast({
        title: "Error",
        description: "Failed to export users",
        variant: "destructive",
      });
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
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage all users, lawyers, and administrators in the system
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={exportUsers}>
            <Download className="h-4 w-4 mr-2" />
            Export Users
          </Button>
          <Button onClick={() => openUserModal('create')}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={filters.role} onValueChange={(value) => setFilters({ ...filters, role: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Roles</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="lawyer">Lawyer</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Verification</Label>
              <Select value={filters.verificationStatus} onValueChange={(value) => setFilters({ ...filters, verificationStatus: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select value={filters.dateRange} onValueChange={(value) => setFilters({ ...filters, dateRange: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="All Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Bulk Actions</CardTitle>
          <CardDescription>
            Perform actions on multiple selected users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => handleBulkAction('activate', [])}
              disabled={true}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Activate Selected
            </Button>
            <Button
              variant="outline"
              onClick={() => handleBulkAction('deactivate', [])}
              disabled={true}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Deactivate Selected
            </Button>
            <Button
              variant="outline"
              onClick={() => handleBulkAction('change-role', [])}
              disabled={true}
            >
              <Users className="h-4 w-4 mr-2" />
              Change Role
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({pagination.totalItems})</CardTitle>
          <CardDescription>
            Showing {filteredUsers.length} of {pagination.totalItems} users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div
                key={user._id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {getRoleIcon(user.role)}
                    <div>
                      <h3 className="font-medium">{user.username}</h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          Joined: {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                        {user.lastLogin && (
                          <span className="text-xs text-muted-foreground">
                            Last login: {new Date(user.lastLogin).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Badge className={getRoleColor(user.role)}>
                    {user.role}
                  </Badge>
                  
                  {user.lawyerProfile && (
                    <Badge variant="outline">
                      {user.lawyerProfile.verificationStatus}
                    </Badge>
                  )}
                  
                  <Badge variant={user.isActive ? "default" : "secondary"}>
                    {user.isActive ? "Active" : "Inactive"}
                  </Badge>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openActivityModal(user)}
                    >
                      <Activity className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openUserModal('edit', user)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowDeleteModal(true);
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Page {pagination.currentPage} of {pagination.totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.currentPage === 1}
                  onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage - 1 })}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.currentPage === pagination.totalPages}
                  onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage + 1 })}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>
                {userModal.action === 'create' ? 'Create New User' : 'Edit User'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Username</Label>
                <Input
                  value={userModal.formData.username}
                  onChange={(e) => setUserModal({
                    ...userModal,
                    formData: { ...userModal.formData, username: e.target.value }
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={userModal.formData.email}
                  onChange={(e) => setUserModal({
                    ...userModal,
                    formData: { ...userModal.formData, email: e.target.value }
                  })}
                />
              </div>
              
              {userModal.action === 'create' && (
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={userModal.formData.password}
                    onChange={(e) => setUserModal({
                      ...userModal,
                      formData: { ...userModal.formData, password: e.target.value }
                    })}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={userModal.formData.role}
                  onValueChange={(value: 'user' | 'lawyer' | 'admin') => setUserModal({
                    ...userModal,
                    formData: { ...userModal.formData, role: value }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="lawyer">Lawyer</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={userModal.formData.isActive}
                  onChange={(e) => setUserModal({
                    ...userModal,
                    formData: { ...userModal.formData, isActive: e.target.checked }
                  })}
                />
                <Label htmlFor="isActive">Active Account</Label>
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => handleUserAction(userModal.action, selectedUser?._id)}
                  className="flex-1"
                  disabled={userModal.action === 'create' && !userModal.formData.password}
                >
                  {userModal.action === 'create' ? 'Create' : 'Update'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowUserModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-red-600">Confirm Deletion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Are you sure you want to delete user <strong>{selectedUser.username}</strong>? 
                This action cannot be undone.
              </p>
              
              <div className="flex gap-3">
                <Button
                  variant="destructive"
                  onClick={() => handleUserAction('delete', selectedUser._id)}
                  className="flex-1"
                >
                  Delete User
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* User Activity Modal */}
      {showActivityModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    User Activity - {selectedUser.username}
                  </CardTitle>
                  <CardDescription>
                    Recent activity and system interactions
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowActivityModal(false)}
                >
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {userActivity.length > 0 ? (
                userActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(activity.date).toLocaleString()}
                      </p>
                      {activity.details && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          <pre className="whitespace-pre-wrap">{JSON.stringify(activity.details, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No activity found for this user
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;

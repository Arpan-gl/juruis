import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  Settings, 
  Shield, 
  Users, 
  Briefcase, 
  FileText, 
  Database, 
  Download, 
  Upload, 
  Trash2, 
  BarChart3, 
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Globe,
  Mail,
  Bell,
  Lock,
  Key,
  Server,
  Activity,
  Save,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import axios from '../axios';

interface SystemConfig {
  // User Management
  userManagement: {
    autoApproveLawyers: boolean;
    requireEmailVerification: boolean;
    allowMultipleAccounts: boolean;
    maxLoginAttempts: number;
    sessionTimeout: number;
    passwordMinLength: number;
    requireStrongPassword: boolean;
  };
  
  // Lawyer Verification
  lawyerVerification: {
    autoApprove: boolean;
    minVerificationScore: number;
    reviewDeadline: number;
    requireDocuments: boolean;
    requireReferences: boolean;
    requireBackgroundCheck: boolean;
  };
  
  // System Security
  security: {
    enable2FA: boolean;
    requireAdminApproval: boolean;
    logAllActions: boolean;
    encryptSensitiveData: boolean;
    maxFileSize: number;
    allowedFileTypes: string[];
  };
  
  // Notifications
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    adminAlerts: boolean;
    userWelcomeEmail: boolean;
    lawyerApprovalEmail: boolean;
  };
  
  // Platform Settings
  platform: {
    maintenanceMode: boolean;
    allowRegistrations: boolean;
    maxUsers: number;
    maxLawyers: number;
    enableAnalytics: boolean;
    enableLogs: boolean;
  };
}

const AdminSystemSettings = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState<SystemConfig>({
    userManagement: {
      autoApproveLawyers: false,
      requireEmailVerification: true,
      allowMultipleAccounts: false,
      maxLoginAttempts: 5,
      sessionTimeout: 24,
      passwordMinLength: 8,
      requireStrongPassword: true
    },
    lawyerVerification: {
      autoApprove: false,
      minVerificationScore: 70,
      reviewDeadline: 7,
      requireDocuments: true,
      requireReferences: true,
      requireBackgroundCheck: false
    },
    security: {
      enable2FA: true,
      requireAdminApproval: true,
      logAllActions: true,
      encryptSensitiveData: true,
      maxFileSize: 10,
      allowedFileTypes: ['pdf', 'doc', 'docx', 'jpg', 'png']
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      adminAlerts: true,
      userWelcomeEmail: true,
      lawyerApprovalEmail: true
    },
    platform: {
      maintenanceMode: false,
      allowRegistrations: true,
      maxUsers: 10000,
      maxLawyers: 1000,
      enableAnalytics: true,
      enableLogs: true
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    fetchSystemConfig();
  }, []);

  const fetchSystemConfig = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/admin/system/config');
      if (response.data.success) {
        setConfig(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching system config:', error);
      toast({
        title: "Error",
        description: "Failed to fetch system configuration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSystemConfig = async () => {
    try {
      setSaving(true);
      const response = await axios.put('/admin/system/config', config);
      if (response.data.success) {
        toast({
          title: "Success",
          description: "System configuration saved successfully",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error saving system config:', error);
      toast({
        title: "Error",
        description: "Failed to save system configuration",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = async () => {
    try {
      const response = await axios.post('/admin/system/config/reset');
      if (response.data.success) {
        toast({
          title: "Success",
          description: "System configuration reset to defaults",
          variant: "default",
        });
        fetchSystemConfig();
      }
    } catch (error) {
      console.error('Error resetting system config:', error);
      toast({
        title: "Error",
        description: "Failed to reset system configuration",
        variant: "destructive",
      });
    }
  };

  const exportConfig = async () => {
    try {
      const response = await axios.get('/admin/system/config/export', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'system-config.json');
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast({
        title: "Success",
        description: "Configuration exported successfully",
        variant: "default",
      });
    } catch (error) {
      console.error('Error exporting config:', error);
      toast({
        title: "Error",
        description: "Failed to export configuration",
        variant: "destructive",
      });
    }
  };

  const updateConfig = (section: keyof SystemConfig, key: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
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
          <h1 className="text-3xl font-bold">System Settings</h1>
          <p className="text-muted-foreground">
            Configure platform settings, security, and system behavior
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={exportConfig}>
            <Download className="h-4 w-4 mr-2" />
            Export Config
          </Button>
          <Button variant="outline" onClick={resetToDefaults}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button onClick={saveSystemConfig} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="lawyers" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Lawyers
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Platform Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Platform Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Temporarily disable platform access
                    </p>
                  </div>
                  <Switch
                    checked={config.platform.maintenanceMode}
                    onCheckedChange={(checked) => updateConfig('platform', 'maintenanceMode', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow Registrations</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable new user registrations
                    </p>
                  </div>
                  <Switch
                    checked={config.platform.allowRegistrations}
                    onCheckedChange={(checked) => updateConfig('platform', 'allowRegistrations', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Analytics</Label>
                    <p className="text-sm text-muted-foreground">
                      Collect system usage analytics
                    </p>
                  </div>
                  <Switch
                    checked={config.platform.enableAnalytics}
                    onCheckedChange={(checked) => updateConfig('platform', 'enableAnalytics', checked)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Maximum Users</Label>
                  <Input
                    type="number"
                    value={config.platform.maxUsers}
                    onChange={(e) => updateConfig('platform', 'maxUsers', parseInt(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Maximum Lawyers</Label>
                  <Input
                    type="number"
                    value={config.platform.maxLawyers}
                    onChange={(e) => updateConfig('platform', 'maxLawyers', parseInt(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* System Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  System Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Platform Version</Label>
                  <p className="text-sm text-muted-foreground">v1.0.0</p>
                </div>
                
                <div className="space-y-2">
                  <Label>Last Updated</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date().toLocaleDateString()}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>System Status</Label>
                  <Badge variant="default" className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Operational
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <Label>Database Status</Label>
                  <Badge variant="default" className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Connected
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Require Email Verification</Label>
                      <p className="text-sm text-muted-foreground">
                        Users must verify email before access
                      </p>
                    </div>
                    <Switch
                      checked={config.userManagement.requireEmailVerification}
                      onCheckedChange={(checked) => updateConfig('userManagement', 'requireEmailVerification', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Allow Multiple Accounts</Label>
                      <p className="text-sm text-muted-foreground">
                        Users can create multiple accounts
                      </p>
                    </div>
                    <Switch
                      checked={config.userManagement.allowMultipleAccounts}
                      onCheckedChange={(checked) => updateConfig('userManagement', 'allowMultipleAccounts', checked)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Maximum Login Attempts</Label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={config.userManagement.maxLoginAttempts}
                      onChange={(e) => updateConfig('userManagement', 'maxLoginAttempts', parseInt(e.target.value))}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Session Timeout (hours)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="168"
                      value={config.userManagement.sessionTimeout}
                      onChange={(e) => updateConfig('userManagement', 'sessionTimeout', parseInt(e.target.value))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Password Minimum Length</Label>
                    <Input
                      type="number"
                      min="6"
                      max="20"
                      value={config.userManagement.passwordMinLength}
                      onChange={(e) => updateConfig('userManagement', 'passwordMinLength', parseInt(e.target.value))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Require Strong Password</Label>
                      <p className="text-sm text-muted-foreground">
                        Enforce complex password requirements
                      </p>
                    </div>
                    <Switch
                      checked={config.userManagement.requireStrongPassword}
                      onCheckedChange={(checked) => updateConfig('userManagement', 'requireStrongPassword', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lawyers Tab */}
        <TabsContent value="lawyers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Lawyer Verification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto-approve Lawyers</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically approve lawyer applications
                      </p>
                    </div>
                    <Switch
                      checked={config.lawyerVerification.autoApprove}
                      onCheckedChange={(checked) => updateConfig('lawyerVerification', 'autoApprove', checked)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Minimum Verification Score</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={config.lawyerVerification.minVerificationScore}
                      onChange={(e) => updateConfig('lawyerVerification', 'minVerificationScore', parseInt(e.target.value))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Review Deadline (days)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="30"
                      value={config.lawyerVerification.reviewDeadline}
                      onChange={(e) => updateConfig('lawyerVerification', 'reviewDeadline', parseInt(e.target.value))}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Require Documents</Label>
                      <p className="text-sm text-muted-foreground">
                        Lawyers must upload required documents
                      </p>
                    </div>
                    <Switch
                      checked={config.lawyerVerification.requireDocuments}
                      onCheckedChange={(checked) => updateConfig('lawyerVerification', 'requireDocuments', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Require References</Label>
                      <p className="text-sm text-muted-foreground">
                        Lawyers must provide professional references
                      </p>
                    </div>
                    <Switch
                      checked={config.lawyerVerification.requireReferences}
                      onCheckedChange={(checked) => updateConfig('lawyerVerification', 'requireReferences', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Background Check</Label>
                      <p className="text-sm text-muted-foreground">
                        Require background check verification
                      </p>
                    </div>
                    <Switch
                      checked={config.lawyerVerification.requireBackgroundCheck}
                      onCheckedChange={(checked) => updateConfig('lawyerVerification', 'requireBackgroundCheck', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable 2FA</Label>
                    <p className="text-sm text-muted-foreground">
                      Require two-factor authentication
                    </p>
                  </div>
                  <Switch
                    checked={config.security.enable2FA}
                    onCheckedChange={(checked) => updateConfig('security', 'enable2FA', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Admin Approval Required</Label>
                    <p className="text-sm text-muted-foreground">
                      Require admin approval for sensitive actions
                    </p>
                  </div>
                  <Switch
                    checked={config.security.requireAdminApproval}
                    onCheckedChange={(checked) => updateConfig('security', 'requireAdminApproval', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Log All Actions</Label>
                    <p className="text-sm text-muted-foreground">
                      Log all user and system actions
                    </p>
                  </div>
                  <Switch
                    checked={config.security.logAllActions}
                    onCheckedChange={(checked) => updateConfig('security', 'logAllActions', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Encrypt Sensitive Data</Label>
                    <p className="text-sm text-muted-foreground">
                      Encrypt sensitive user data
                    </p>
                  </div>
                  <Switch
                    checked={config.security.encryptSensitiveData}
                    onCheckedChange={(checked) => updateConfig('security', 'encryptSensitiveData', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* File Upload Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  File Upload Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Maximum File Size (MB)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={config.security.maxFileSize}
                    onChange={(e) => updateConfig('security', 'maxFileSize', parseInt(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Allowed File Types</Label>
                  <Input
                    value={config.security.allowedFileTypes.join(', ')}
                    onChange={(e) => updateConfig('security', 'allowedFileTypes', e.target.value.split(',').map(t => t.trim()))}
                    placeholder="pdf, doc, docx, jpg, png"
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate file types with commas
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Send email notifications to users
                      </p>
                    </div>
                    <Switch
                      checked={config.notifications.emailNotifications}
                      onCheckedChange={(checked) => updateConfig('notifications', 'emailNotifications', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Send push notifications to mobile apps
                      </p>
                    </div>
                    <Switch
                      checked={config.notifications.pushNotifications}
                      onCheckedChange={(checked) => updateConfig('notifications', 'pushNotifications', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Admin Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Send alerts to administrators
                      </p>
                    </div>
                    <Switch
                      checked={config.notifications.adminAlerts}
                      onCheckedChange={(checked) => updateConfig('notifications', 'adminAlerts', checked)}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Welcome Email</Label>
                      <p className="text-sm text-muted-foreground">
                        Send welcome email to new users
                      </p>
                    </div>
                    <Switch
                      checked={config.notifications.userWelcomeEmail}
                      onCheckedChange={(checked) => updateConfig('notifications', 'userWelcomeEmail', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Lawyer Approval Email</Label>
                      <p className="text-sm text-muted-foreground">
                        Send approval emails to lawyers
                      </p>
                    </div>
                    <Switch
                      checked={config.notifications.lawyerApprovalEmail}
                      onCheckedChange={(checked) => updateConfig('notifications', 'lawyerApprovalEmail', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSystemSettings;

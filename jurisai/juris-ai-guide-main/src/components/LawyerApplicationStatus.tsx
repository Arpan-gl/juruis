import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  FileText,
  MapPin,
  Phone,
  Globe,
  Award,
  Users,
  Calendar,
  Building
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import axios from '../axios';

interface LawyerApplication {
  _id: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  applicationDate: string;
  reviewDate?: string;
  reviewedBy?: string;
  
  // Professional Information
  barNumber: string;
  barAssociation: string;
  practiceAreas: string[];
  yearsOfExperience: number;
  lawSchool: string;
  graduationYear: number;
  
  // Contact Information
  phone: string;
  officeAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  website: string;
  
  // Specializations
  specializations: string[];
  languages: string[];
  
  // Professional Summary
  bio: string;
  achievements: string[];
  
  // References
  references: Array<{
    name: string;
    title: string;
    organization: string;
    email: string;
    phone: string;
    relationship: string;
  }>;
  
  // Review Process
  adminNotes?: string;
  rejectionReason?: string;
  verificationScore?: number;
  
  // Application History
  history: Array<{
    action: string;
    date: string;
    admin?: string;
    notes?: string;
  }>;
}

const LawyerApplicationStatus = () => {
  const { toast } = useToast();
  const [application, setApplication] = useState<LawyerApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchApplication();
  }, []);

  const fetchApplication = async () => {
    try {
      const response = await axios.get('/lawyer-applications/my-application');
      if (response.data.success) {
        setApplication(response.data.data);
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        setError('No lawyer application found');
      } else {
        setError('Failed to fetch application');
        toast({
          title: "Error",
          description: "Failed to fetch application status",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'under_review':
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'under_review':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Your application is pending review. We will notify you once it has been reviewed.';
      case 'under_review':
        return 'Your application is currently under review by our team. This process typically takes 3-5 business days.';
      case 'approved':
        return 'Congratulations! Your application has been approved. You can now respond to legal issues on our platform.';
      case 'rejected':
        return 'Your application was not approved. Please review the feedback below and consider reapplying.';
      default:
        return 'Application status unknown.';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-red-600">Application Not Found</CardTitle>
          <CardDescription className="text-center">
            {error}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-4">
            It looks like you haven't submitted a lawyer application yet.
          </p>
          <Button onClick={() => window.location.href = '/signUp'}>
            Apply Now
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!application) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Application Status Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            {getStatusIcon(application.status)}
            <div>
              <CardTitle>Lawyer Application Status</CardTitle>
              <CardDescription>
                Application submitted on {new Date(application.applicationDate).toLocaleDateString()}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 mb-4">
            <Badge className={`${getStatusColor(application.status)}`}>
              {application.status.replace('_', ' ').toUpperCase()}
            </Badge>
            {application.verificationScore && (
              <Badge variant="outline">
                Score: {application.verificationScore}/100
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            {getStatusMessage(application.status)}
          </p>
        </CardContent>
      </Card>

      {/* Application Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Application Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Professional Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Professional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Bar Number</label>
                <p className="text-sm">{application.barNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Bar Association</label>
                <p className="text-sm">{application.barAssociation}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Law School</label>
                <p className="text-sm">{application.lawSchool}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Graduation Year</label>
                <p className="text-sm">{application.graduationYear}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Years of Experience</label>
                <p className="text-sm">{application.yearsOfExperience} years</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Practice Areas */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Practice Areas</h3>
            <div className="flex flex-wrap gap-2">
              {application.practiceAreas.map((area, index) => (
                <Badge key={index} variant="secondary">
                  {area}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{application.phone}</span>
              </div>
              {application.website && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={application.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    {application.website}
                  </a>
                </div>
              )}
            </div>
            
            <div className="mt-3">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Office Address</span>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                {application.officeAddress.street}<br />
                {application.officeAddress.city}, {application.officeAddress.state} {application.officeAddress.zipCode}<br />
                {application.officeAddress.country}
              </p>
            </div>
          </div>

          <Separator />

          {/* Professional Summary */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Professional Summary</h3>
            <p className="text-sm text-muted-foreground mb-4">{application.bio}</p>
            
            {application.specializations.length > 0 && (
              <div className="mb-4">
                <label className="text-sm font-medium text-muted-foreground">Specializations</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {application.specializations.map((spec, index) => (
                    <Badge key={index} variant="outline">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {application.languages.length > 0 && (
              <div className="mb-4">
                <label className="text-sm font-medium text-muted-foreground">Languages</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {application.languages.map((lang, index) => (
                    <Badge key={index} variant="outline">
                      {lang}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {application.achievements.length > 0 && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Achievements</label>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  {application.achievements.map((achievement, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      {achievement}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <Separator />

          {/* References */}
          {application.references.length > 0 && (
            <>
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Professional References
                </h3>
                <div className="space-y-4">
                  {application.references.map((reference, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Name</label>
                          <p className="text-sm">{reference.name}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Title</label>
                          <p className="text-sm">{reference.title}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Organization</label>
                          <p className="text-sm">{reference.organization}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Relationship</label>
                          <p className="text-sm">{reference.relationship}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Email</label>
                          <p className="text-sm">{reference.email}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Phone</label>
                          <p className="text-sm">{reference.phone}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Admin Notes */}
          {application.adminNotes && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Review Notes</h3>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm">{application.adminNotes}</p>
              </div>
            </div>
          )}

          {/* Rejection Reason */}
          {application.rejectionReason && (
            <div>
              <h3 className="text-lg font-semibold mb-3 text-red-600">Rejection Reason</h3>
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <p className="text-sm text-red-800">{application.rejectionReason}</p>
              </div>
            </div>
          )}

          {/* Application History */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Application History
            </h3>
            <div className="space-y-3">
              {application.history.map((entry, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium capitalize">
                        {entry.action.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(entry.date).toLocaleDateString()}
                      </span>
                    </div>
                    {entry.notes && (
                      <p className="text-sm text-muted-foreground">{entry.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {application.status === 'rejected' && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                Your application was not approved. You can review the feedback above and reapply.
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => window.location.href = '/signUp'}>
                  Reapply
                </Button>
                <Button variant="outline" onClick={() => window.location.href = '/legal-community'}>
                  Back to Legal Community
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {application.status === 'approved' && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Application Approved!</span>
              </div>
              <p className="text-muted-foreground">
                You can now respond to legal issues and help clients on our platform.
              </p>
              <Button onClick={() => window.location.href = '/legal-community'}>
                Go to Legal Community
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LawyerApplicationStatus;

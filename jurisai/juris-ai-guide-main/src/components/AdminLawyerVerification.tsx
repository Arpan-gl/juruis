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
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertCircle,
  Building,
  MapPin,
  Phone,
  Globe,
  FileText,
  Users,
  Award,
  Calendar,
  Star
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import axios from '../axios';

interface LawyerApplication {
  _id: string;
  applicant: {
    _id: string;
    username: string;
    email: string;
  };
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

const AdminLawyerVerification = () => {
  const { toast } = useToast();
  const [applications, setApplications] = useState<LawyerApplication[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<LawyerApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(false);
  
  // Filters and pagination
  const [filters, setFilters] = useState({
    status: 'all',
    practiceArea: '',
    state: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  // Review form
  const [reviewForm, setReviewForm] = useState({
    action: 'start_review',
    notes: '',
    verificationScore: 100,
    rejectionReason: ''
  });

  
  const fetchApplications = async () => {
    try {
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: pagination.itemsPerPage.toString()
      });
      
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters.practiceArea) params.append('practiceArea', filters.practiceArea);
      if (filters.state) params.append('state', filters.state);
      
      const response = await axios.get(`/lawyer-applications/admin?${params}`);
      if (response.data.success) {
        setApplications(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: "Error",
        description: "Failed to fetch applications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [filters.status, filters.practiceArea, filters.state, pagination.currentPage]);
  
  const handleReview = async () => {
    if (!selectedApplication || !reviewForm.action) return;
    
    setReviewLoading(true);
    try {
      const response = await axios.put(`/lawyer-applications/admin/${selectedApplication._id}/review`, {
        action: reviewForm.action,
        notes: reviewForm.notes,
        verificationScore: reviewForm.verificationScore,
        rejectionReason: reviewForm.rejectionReason
      });

      if (response.data.success) {
        toast({
          title: "Success",
          description: `Application ${reviewForm.action}d successfully`,
          variant: "default",
        });
        
        // Reset form and refresh
        setReviewForm({
          action: 'start_review',
          notes: '',
          verificationScore: 100,
          rejectionReason: ''
        });
        setSelectedApplication(null);
        fetchApplications();
      }
    } catch (error: unknown) {
      console.error('Error reviewing application:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to review application';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setReviewLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'under_review':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
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

  const filteredApplications = applications.filter(app => {
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return (
        app.applicant.username.toLowerCase().includes(searchTerm) ||
        app.applicant.email.toLowerCase().includes(searchTerm) ||
        app.barNumber.toLowerCase().includes(searchTerm) ||
        app.lawSchool.toLowerCase().includes(searchTerm)
      );
    }
    return true;
  });

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
          <h1 className="text-3xl font-bold">Lawyer Verification Panel</h1>
          <p className="text-muted-foreground">
            Review and manage lawyer applications
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          Admin Access
        </Badge>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search applications..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Practice Area</Label>
              <Input
                placeholder="Practice area"
                value={filters.practiceArea}
                onChange={(e) => setFilters({ ...filters, practiceArea: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label>State</Label>
              <Input
                placeholder="State"
                value={filters.state}
                onChange={(e) => setFilters({ ...filters, state: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <Card>
        <CardHeader>
          <CardTitle>Applications ({pagination.totalItems})</CardTitle>
          <CardDescription>
            Showing {filteredApplications.length} of {pagination.totalItems} applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredApplications.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Applications Found</h3>
                <p className="text-muted-foreground">
                  {filters.search || filters.status !== 'all' || filters.practiceArea || filters.state
                    ? 'No applications match your current filters. Try adjusting your search criteria.'
                    : 'There are currently no lawyer applications to review.'}
                </p>
              </div>
            ) : (
              filteredApplications.map((application) => (
              <div
                key={application._id}
                className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => setSelectedApplication(application)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(application.status)}
                      <h3 className="font-semibold">{application.applicant.username}</h3>
                      <Badge className={getStatusColor(application.status)}>
                        {application.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                      {application.verificationScore && (
                        <Badge variant="outline">
                          Score: {application.verificationScore}/100
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        <span>{application.lawSchool}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        <span>{application.yearsOfExperience} years experience</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{application.officeAddress.state}</span>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <div className="flex flex-wrap gap-1">
                        {application.practiceAreas.slice(0, 3).map((area, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
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
                  
                  <div className="text-right text-sm text-muted-foreground">
                    <div>Applied: {new Date(application.applicationDate).toLocaleDateString()}</div>
                    {application.reviewDate && (
                      <div>Reviewed: {new Date(application.reviewDate).toLocaleDateString()}</div>
                    )}
                  </div>
                </div>
              </div>
            ))
            )}
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

      {/* Application Detail Modal */}
      {selectedApplication && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Application Details - {selectedApplication.applicant.username}
                </CardTitle>
                <CardDescription>
                  Review application details and make a decision
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedApplication(null)}
              >
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Application Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Professional Information</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Bar Number:</span> {selectedApplication.barNumber}</div>
                  <div><span className="font-medium">Bar Association:</span> {selectedApplication.barAssociation}</div>
                  <div><span className="font-medium">Law School:</span> {selectedApplication.lawSchool}</div>
                  <div><span className="font-medium">Graduation Year:</span> {selectedApplication.graduationYear}</div>
                  <div><span className="font-medium">Experience:</span> {selectedApplication.yearsOfExperience} years</div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3">Contact Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{selectedApplication.phone}</span>
                  </div>
                  {selectedApplication.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <a href={selectedApplication.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {selectedApplication.website}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {selectedApplication.officeAddress.street}, {selectedApplication.officeAddress.city}, {selectedApplication.officeAddress.state} {selectedApplication.officeAddress.zipCode}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Practice Areas & Specializations */}
            <div>
              <h3 className="font-semibold mb-3">Practice Areas & Specializations</h3>
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-sm">Practice Areas:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedApplication.practiceAreas.map((area, index) => (
                      <Badge key={index} variant="secondary">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {selectedApplication.specializations && selectedApplication.specializations.length > 0 && (
                  <div>
                    <span className="font-medium text-sm">Specializations:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedApplication.specializations.map((spec, index) => (
                        <Badge key={index} variant="outline">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Bio */}
            <div>
              <h3 className="font-semibold mb-3">Professional Summary</h3>
              <p className="text-sm text-muted-foreground">{selectedApplication.bio}</p>
            </div>

            <Separator />

            {/* References */}
            {selectedApplication.references && selectedApplication.references.length > 0 && (
              <>
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Professional References ({selectedApplication.references.length})
                  </h3>
                  <div className="space-y-3">
                    {selectedApplication.references.map((reference, index) => (
                      <div key={index} className="border rounded-lg p-3 text-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div><span className="font-medium">Name:</span> {reference.name}</div>
                          <div><span className="font-medium">Title:</span> {reference.title}</div>
                          <div><span className="font-medium">Organization:</span> {reference.organization}</div>
                          <div><span className="font-medium">Relationship:</span> {reference.relationship}</div>
                          <div><span className="font-medium">Email:</span> {reference.email}</div>
                          <div><span className="font-medium">Phone:</span> {reference.phone}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Review Form */}
            <div>
              <h3 className="font-semibold mb-3">Review Decision</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Action</Label>
                  <Select value={reviewForm.action} onValueChange={(value) => setReviewForm({ ...reviewForm, action: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="start_review">Start Review</SelectItem>
                      <SelectItem value="approve">Approve</SelectItem>
                      <SelectItem value="reject">Reject</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Verification Score (0-100)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={reviewForm.verificationScore}
                    onChange={(e) => setReviewForm({ ...reviewForm, verificationScore: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              
              <div className="space-y-2 mt-4">
                <Label>Review Notes</Label>
                <Textarea
                  placeholder="Add your review notes..."
                  value={reviewForm.notes}
                  onChange={(e) => setReviewForm({ ...reviewForm, notes: e.target.value })}
                  rows={3}
                />
              </div>
              
              {reviewForm.action === 'reject' && (
                <div className="space-y-2 mt-4">
                  <Label>Rejection Reason *</Label>
                  <Textarea
                    placeholder="Provide specific reason for rejection..."
                    value={reviewForm.rejectionReason}
                    onChange={(e) => setReviewForm({ ...reviewForm, rejectionReason: e.target.value })}
                    rows={3}
                    required
                  />
                </div>
              )}
              
              <div className="flex gap-3 mt-6">
                <Button
                  onClick={handleReview}
                  disabled={reviewLoading || reviewForm.action === 'start_review' || (reviewForm.action === 'reject' && !reviewForm.rejectionReason)}
                  className="flex-1"
                >
                  {reviewLoading ? "Processing..." : `Submit ${reviewForm.action}`}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedApplication(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminLawyerVerification;

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  FileText, 
  Users, 
  Briefcase,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle
} from 'lucide-react';
import PostIssue from '@/components/PostIssue';
import LegalIssues from '@/components/LegalIssues';
import LawyerResponse from '@/components/LawyerResponse';
import HireLawyer from '@/components/HireLawyer';
import LawyerApplicationStatus from '@/components/LawyerApplicationStatus';
import { useToast } from '@/components/ui/use-toast';
import axios from '../axios';

interface User {
  _id: string;
  username: string;
  email: string;
  role: 'user' | 'lawyer' | 'admin';
  lawyerProfile?: {
    isVerified: boolean;
    verificationStatus: 'pending' | 'approved' | 'rejected';
    applicationDate?: string;
  };
}

const LegalCommunity = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('browse');
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [selectedResponse, setSelectedResponse] = useState<any>(null);
  const [showPostIssue, setShowPostIssue] = useState(false);
  const [issues, setIssues] = useState<any[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get('/getUserDetail');
      if (response.data.success) {
        setUser(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostIssue = () => {
    setShowPostIssue(true);
    setActiveTab('post');
  };

  const handleIssuePosted = () => {
    setShowPostIssue(false);
    setActiveTab('browse');
    setIssues([]); // Clear issues to trigger refresh in LegalIssues
  };

  const handleViewIssue = (issue: any) => {
    setSelectedIssue(issue);
    setActiveTab('respond');
  };

  const handleResponseSelected = (response: any) => {
    setSelectedResponse(response);
    setActiveTab('hire');
  };

  const getLawyerStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getLawyerStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is a lawyer but not verified, show application status
  if (user?.role === 'lawyer' && !user.lawyerProfile?.isVerified) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center mb-4">Legal Community</h1>
          <p className="text-center text-muted-foreground">
            Complete your verification to start helping clients
          </p>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <Card className="border-orange-200 bg-orange-50/50">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
              <CardTitle className="text-orange-800">Verification Pending</CardTitle>
              <CardDescription className="text-orange-700">
                Your lawyer application is currently under review by our admin team.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Badge className={getLawyerStatusColor(user.lawyerProfile?.verificationStatus || 'pending')}>
                    {getLawyerStatusIcon(user.lawyerProfile?.verificationStatus || 'pending')}
                    {user.lawyerProfile?.verificationStatus?.toUpperCase() || 'PENDING'}
                  </Badge>
                </div>
                {user.lawyerProfile?.applicationDate && (
                  <p className="text-sm text-orange-600">
                    Applied on: {new Date(user.lawyerProfile.applicationDate).toLocaleDateString()}
                  </p>
                )}
              </div>
              
              <div className="text-sm text-orange-700 bg-orange-100 p-4 rounded-lg">
                <p className="font-medium mb-2">What happens next?</p>
                <ul className="text-left space-y-1">
                  <li>• Our admin team will review your application</li>
                  <li>• We'll verify your credentials and documents</li>
                  <li>• You'll receive an email notification once verified</li>
                  <li>• After verification, you can start helping clients</li>
                </ul>
              </div>
              
              <p className="text-xs text-orange-600">
                This process typically takes 2-3 business days. Thank you for your patience!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-4">Legal Community</h1>
        <p className="text-center text-muted-foreground">
          Connect with legal professionals and get answers to your legal questions
        </p>
        
        {/* User Role Badge */}
        <div className="flex justify-center mt-4">
          <Badge variant="outline" className="flex items-center gap-2">
            {user?.role === 'lawyer' ? (
              <>
                <Briefcase className="h-4 w-4" />
                Verified Lawyer
              </>
            ) : (
              <>
                <Users className="h-4 w-4" />
                Legal Client
              </>
            )}
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="browse" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Browse Issues
          </TabsTrigger>
          <TabsTrigger value="post" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Post Issue
          </TabsTrigger>
          {user?.role === 'lawyer' && user.lawyerProfile?.isVerified && (
            <TabsTrigger value="respond" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Respond
            </TabsTrigger>
          )}
          <TabsTrigger value="hire" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Hire
          </TabsTrigger>
        </TabsList>

        {/* Browse Issues Tab */}
        <TabsContent value="browse">
          <LegalIssues onPostIssue={handlePostIssue} onViewIssue={handleViewIssue} />
        </TabsContent>

        {/* Post Issue Tab */}
        <TabsContent value="post">
          <PostIssue onIssuePosted={handleIssuePosted} />
        </TabsContent>

        {/* Respond Tab (Lawyers Only) */}
        {user?.role === 'lawyer' && user.lawyerProfile?.isVerified && (
          <TabsContent value="respond">
            {selectedIssue ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Responding to Issue
                    </CardTitle>
                    <CardDescription>
                      Provide your legal expertise and approach to this issue
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <h3 className="font-semibold text-lg mb-2">{selectedIssue.title}</h3>
                      <p className="text-muted-foreground mb-3">{selectedIssue.description}</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{selectedIssue.category}</Badge>
                        <Badge variant="outline">{selectedIssue.urgency}</Badge>
                        {selectedIssue.budget && (
                          <Badge variant="outline">Budget: ${selectedIssue.budget}</Badge>
                        )}
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedIssue(null)}
                      className="mb-4"
                    >
                      ← Back to Issues
                    </Button>
                  </CardContent>
                </Card>
                
                <LawyerResponse 
                  issueId={selectedIssue._id}
                  issueTitle={selectedIssue.title}
                  onResponseSubmitted={() => {
                    setSelectedIssue(null);
                    setActiveTab('browse');
                  }}
                  onCancel={() => {
                    setSelectedIssue(null);
                    setActiveTab('browse');
                  }}
                />
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Select an Issue to Respond</h3>
                  <p className="text-muted-foreground mb-4">
                    Browse through legal issues and click on one to provide your professional response.
                  </p>
                  <Button onClick={() => setActiveTab('browse')}>
                    Browse Issues
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}

        {/* Hire Tab */}
        <TabsContent value="hire">
          {selectedResponse ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Hiring Process
                  </CardTitle>
                  <CardDescription>
                    Review the lawyer's response and proceed with hiring
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <h3 className="font-semibold text-lg mb-2">Lawyer Response</h3>
                    <div className="bg-muted p-4 rounded-lg mb-3">
                      <p className="text-sm">{selectedResponse.content}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Approach:</span> {selectedResponse.approach}
                      </div>
                      <div>
                        <span className="font-medium">Estimated Time:</span> {selectedResponse.estimatedTime}
                      </div>
                      <div>
                        <span className="font-medium">Estimated Cost:</span> ${selectedResponse.estimatedCost}
                      </div>
                      <div>
                        <span className="font-medium">Experience:</span> {selectedResponse.experience} years
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedResponse(null)}
                    className="mb-4"
                  >
                    ← Back to Responses
                  </Button>
                </CardContent>
              </Card>
              
              <HireLawyer 
                response={selectedResponse}
                issue={selectedIssue}
                onHireCompleted={() => {
                  setSelectedResponse(null);
                  setActiveTab('browse');
                }}
                onCancel={() => {
                  setSelectedResponse(null);
                  setActiveTab('browse');
                }}
              />
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a Response to Hire</h3>
                <p className="text-muted-foreground mb-4">
                  Browse through lawyer responses to legal issues and select one to proceed with hiring.
                </p>
                <Button onClick={() => setActiveTab('browse')}>
                  Browse Issues
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LegalCommunity;

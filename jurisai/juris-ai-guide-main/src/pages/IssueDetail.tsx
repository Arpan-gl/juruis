import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ArrowLeft,
  Clock,
  MapPin,
  DollarSign,
  Eye,
  MessageSquare,
  Briefcase
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import axios from '../axios';
import LawyerResponse from '@/components/LawyerResponse';

interface Issue {
  _id: string;
  title: string;
  description: string;
  category: string;
  urgency: string;
  author: {
    _id: string;
    username: string;
    email: string;
  };
  budget?: {
    min: number;
    max: number;
    currency: string;
  };
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  tags: string[];
  upvotes: string[];
  downvotes: string[];
  views: number;
  isAnonymous: boolean;
  createdAt: string;
}

interface User {
  _id: string;
  username: string;
  role: 'user' | 'lawyer' | 'admin';
  lawyerProfile?: {
    isVerified: boolean;
  };
}

interface ResponseItem {
  _id: string;
  issue: string;
  lawyer: {
    _id: string;
    username: string;
    email: string;
    lawyerProfile?: { isVerified: boolean };
  };
  content: string;
  approach: string;
  estimatedTime?: string;
  estimatedCost?: any;
  qualifications?: string[];
  experience?: any;
  createdAt: string;
}

const IssueDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [issue, setIssue] = useState<Issue | null>(null);
  const [responses, setResponses] = useState<ResponseItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingResponses, setLoadingResponses] = useState(true);
  const [showResponseForm, setShowResponseForm] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (!id) return;
    fetchIssue(id);
    fetchResponses(id);
  }, [id]);

  const fetchUser = async () => {
    try {
      const res = await axios.get('/getUserDetail');
      if (res.data?.success) setUser(res.data.data);
    } catch (_) {}
  };

  const fetchIssue = async (issueId: string) => {
    try {
      setLoading(true);
      const res = await axios.get(`/issues/${issueId}`);
      if (res.data?.success) setIssue(res.data.data);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load issue', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const fetchResponses = async (issueId: string) => {
    try {
      setLoadingResponses(true);
      const res = await axios.get(`/responses/issue/${issueId}`);
      if (res.data?.success) setResponses(res.data.data);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load responses', variant: 'destructive' });
    } finally {
      setLoadingResponses(false);
    }
  };

  const isVerifiedLawyer = !!(user && user.role === 'lawyer' && user.lawyerProfile?.isVerified);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Badge variant="secondary" className="flex items-center gap-1">
          <MessageSquare className="h-3 w-3" /> Issue Details
        </Badge>
      </div>

      {/* Issue Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{loading ? 'Loading...' : issue?.title}</CardTitle>
          {!loading && issue && (
            <CardDescription>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <Badge>{issue.category}</Badge>
                <Badge variant="outline">{issue.urgency} Priority</Badge>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {formatDate(issue.createdAt)}
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" /> {issue.views} views
                </div>
              </div>
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {!loading && issue && (
            <>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Avatar className="h-6 w-6">
                  <AvatarImage src="" />
                  <AvatarFallback>
                    {issue.isAnonymous ? 'A' : issue.author.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span>{issue.isAnonymous ? 'Anonymous' : issue.author.username}</span>
              </div>

              <p className="text-base leading-7">{issue.description}</p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {issue.budget && issue.budget.min > 0 && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    {issue.budget.currency} {issue.budget.min} - {issue.budget.max}
                  </div>
                )}
                {issue.location?.city && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {issue.location.city}, {issue.location.state}
                  </div>
                )}
              </div>

              {issue.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {issue.tags.map((t, i) => (
                    <Badge key={i} variant="outline">{t}</Badge>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Responses */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Lawyer Responses</span>
                <Badge variant="outline">{loadingResponses ? 0 : responses.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingResponses ? (
                <div className="py-8 text-center text-muted-foreground">Loading responses...</div>
              ) : responses.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">No responses yet.</div>
              ) : (
                <div className="space-y-4">
                  {responses.map((r) => (
                    <Card key={r._id} className="border">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src="" />
                              <AvatarFallback>
                                {r.lawyer.username.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="text-sm">
                              <div className="font-medium flex items-center gap-2">
                                {r.lawyer.username}
                                <Badge variant="secondary" className="flex items-center gap-1">
                                  <Briefcase className="h-3 w-3" /> Verified Lawyer
                                </Badge>
                              </div>
                              <div className="text-muted-foreground text-xs">{formatDate(r.createdAt)}</div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <div className="text-sm font-semibold">Legal Analysis</div>
                          <p className="text-sm text-muted-foreground whitespace-pre-line">{r.content}</p>
                        </div>
                        <Separator />
                        <div>
                          <div className="text-sm font-semibold">Approach</div>
                          <p className="text-sm text-muted-foreground whitespace-pre-line">{r.approach}</p>
                        </div>
                        {r.estimatedTime && (
                          <div className="text-sm text-muted-foreground">Estimated time: {r.estimatedTime}</div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Response form (verified lawyers only) */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Respond to this issue</CardTitle>
              <CardDescription>Only verified lawyers can post a response</CardDescription>
            </CardHeader>
            <CardContent>
              {isVerifiedLawyer ? (
                <>
                  {!issue ? (
                    <div className="text-sm text-muted-foreground">Loading issue...</div>
                  ) : (
                    <>
                      {showResponseForm ? (
                        <LawyerResponse
                          issueId={issue._id}
                          issueTitle={issue.title}
                          onResponseSubmitted={() => {
                            setShowResponseForm(false);
                            fetchResponses(issue._id);
                          }}
                          onCancel={() => setShowResponseForm(false)}
                        />
                      ) : (
                        <Button className="w-full" onClick={() => setShowResponseForm(true)}>
                          Write a Response
                        </Button>
                      )}
                    </>
                  )}
                </>
              ) : (
                <div className="text-sm text-muted-foreground">
                  You must be a verified lawyer to respond. Complete verification to participate.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default IssueDetail;

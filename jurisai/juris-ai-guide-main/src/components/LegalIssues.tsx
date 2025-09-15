import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ThumbsUp, 
  ThumbsDown, 
  MessageCircle, 
  Eye, 
  Clock, 
  MapPin, 
  DollarSign,
  Filter,
  Search,
  Plus,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import axios from '../axios';

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
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  location: {
    city: string;
    state: string;
    country: string;
  };
  tags: string[];
  upvotes: string[];
  downvotes: string[];
  views: number;
  isAnonymous: boolean;
  createdAt: string;
  status: string;
}

interface LegalIssuesProps {
  onPostIssue?: () => void;
  onViewIssue?: (issue: Issue) => void;
}

const LegalIssues: React.FC<LegalIssuesProps> = ({ onPostIssue, onViewIssue }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [userVotes, setUserVotes] = useState<Record<string, 'upvote' | 'downvote' | null>>({});

  const categories = [
    'All',
    'Criminal Law',
    'Civil Law',
    'Family Law',
    'Corporate Law',
    'Property Law',
    'Employment Law',
    'Other'
  ];

  const statuses = ['All', 'Open', 'In Progress', 'Resolved', 'Closed'];
  const sortOptions = [
    { value: 'createdAt', label: 'Newest First' },
    { value: 'upvotes', label: 'Most Upvoted' },
    { value: 'views', label: 'Most Viewed' },
    { value: 'urgency', label: 'Urgency Level' }
  ];

  useEffect(() => {
    fetchIssues();
  }, [searchTerm, selectedCategory, selectedStatus, sortBy, sortOrder, currentPage]);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        sortBy,
        sortOrder
      });

      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory && selectedCategory !== 'All') params.append('category', selectedCategory);
      if (selectedStatus && selectedStatus !== 'All') params.append('status', selectedStatus);

      const response = await axios.get(`/issues?${params}`);
      
      if (response.data.success) {
        setIssues(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error: any) {
      console.error('Error fetching issues:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch legal issues. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (issueId: string, voteType: 'upvote' | 'downvote') => {
    try {
      const response = await axios.post(`/issues/${issueId}/vote`, { voteType });
      
      if (response.data.success) {
        // Update local state
        setIssues(prev => prev.map(issue => {
          if (issue._id === issueId) {
            const currentVote = userVotes[issueId];
            let newUpvotes = [...issue.upvotes];
            let newDownvotes = [...issue.downvotes];

            if (currentVote === voteType) {
              // Remove vote
              if (voteType === 'upvote') {
                newUpvotes = newUpvotes.filter(id => id !== 'currentUser');
              } else {
                newDownvotes = newDownvotes.filter(id => id !== 'currentUser');
              }
              setUserVotes(prev => ({ ...prev, [issueId]: null }));
            } else {
              // Add vote and remove opposite
              if (voteType === 'upvote') {
                newUpvotes.push('currentUser');
                newDownvotes = newDownvotes.filter(id => id !== 'currentUser');
              } else {
                newDownvotes.push('currentUser');
                newUpvotes = newUpvotes.filter(id => id !== 'currentUser');
              }
              setUserVotes(prev => ({ ...prev, [issueId]: voteType }));
            }

            return {
              ...issue,
              upvotes: newUpvotes,
              downvotes: newDownvotes
            };
          }
          return issue;
        }));
      }
    } catch (error: any) {
      console.error('Error voting:', error);
      toast({
        title: 'Error',
        description: 'Failed to vote. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Criminal Law': 'bg-red-100 text-red-800 border-red-200',
      'Civil Law': 'bg-blue-100 text-blue-800 border-blue-200',
      'Family Law': 'bg-pink-100 text-pink-800 border-pink-200',
      'Corporate Law': 'bg-purple-100 text-purple-800 border-purple-200',
      'Property Law': 'bg-green-100 text-green-800 border-green-200',
      'Employment Law': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Other': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[category as keyof typeof colors] || colors.Other;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return '1 day ago';
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading && issues.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Legal Issues</h1>
          <p className="text-muted-foreground">Browse and discuss legal problems with the community</p>
        </div>
        <Button onClick={onPostIssue || (() => navigate('/post-issue'))} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Post New Issue
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Filters & Search</h3>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search legal issues..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Sort By</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Order</Label>
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Descending</SelectItem>
                  <SelectItem value="asc">Ascending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Issues List */}
      <div className="space-y-4">
        {issues.map((issue) => (
          <Card key={issue._id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex gap-4">
                {/* Voting Section */}
                <div className="flex flex-col items-center gap-2 min-w-[60px]">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVote(issue._id, 'upvote')}
                    className={`h-8 w-8 p-0 ${
                      userVotes[issue._id] === 'upvote' ? 'text-green-600' : 'text-muted-foreground'
                    }`}
                  >
                    <ThumbsUp className="h-4 w-4" />
                  </Button>
                  <span className="font-semibold text-lg">
                    {issue.upvotes.length - issue.downvotes.length}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVote(issue._id, 'downvote')}
                    className={`h-8 w-8 p-0 ${
                      userVotes[issue._id] === 'downvote' ? 'text-red-600' : 'text-muted-foreground'
                    }`}
                  >
                    <ThumbsDown className="h-4 w-4" />
                  </Button>
                </div>

                {/* Content Section */}
                <div className="flex-1 space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 
                        className="text-xl font-semibold hover:text-primary cursor-pointer"
                        onClick={() => navigate(`/legal-community/${issue._id}`)}
                      >
                        {issue.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src="" />
                            <AvatarFallback>
                              {issue.isAnonymous ? 'A' : issue.author.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span>
                            {issue.isAnonymous ? 'Anonymous' : issue.author.username}
                          </span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(issue.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-muted-foreground">
                    {truncateText(issue.description, 200)}
                  </p>

                  {/* Tags and Categories */}
                  <div className="flex flex-wrap gap-2">
                    <Badge className={getCategoryColor(issue.category)}>
                      {issue.category}
                    </Badge>
                    <Badge className={getUrgencyColor(issue.urgency)}>
                      {issue.urgency} Priority
                    </Badge>
                    {issue.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Additional Info */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {issue.budget.min > 0 && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        <span>
                          {issue.budget.currency} {issue.budget.min} - {issue.budget.max}
                        </span>
                      </div>
                    )}
                    {issue.location.city && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{issue.location.city}, {issue.location.state}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      <span>{issue.views} views</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-4 pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/legal-community/${issue._id}`)}
                      className="flex items-center gap-2"
                    >
                      <MessageCircle className="h-4 w-4" />
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                  className="w-10 h-10"
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!loading && issues.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground text-lg mb-4">
            No legal issues found matching your criteria.
          </div>
          <Button onClick={onPostIssue || (() => navigate('/post-issue'))}>
            Post the First Issue
          </Button>
        </div>
      )}
    </div>
  );
};

export default LegalIssues;

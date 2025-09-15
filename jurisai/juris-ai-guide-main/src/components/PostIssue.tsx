import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Plus, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import axios from '../axios';

interface IssueFormData {
  title: string;
  description: string;
  category: string;
  urgency: string;
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
  isAnonymous: boolean;
}

interface PostIssueProps {
  onIssuePosted?: () => void;
}

const PostIssue: React.FC<PostIssueProps> = ({ onIssuePosted }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [formData, setFormData] = useState<IssueFormData>({
    title: '',
    description: '',
    category: '',
    urgency: '',
    budget: {
      min: 0,
      max: 0,
      currency: 'USD'
    },
    location: {
      city: '',
      state: '',
      country: ''
    },
    tags: [],
    isAnonymous: false
  });

  const categories = [
    'Criminal Law',
    'Civil Law',
    'Family Law',
    'Corporate Law',
    'Property Law',
    'Employment Law',
    'Other'
  ];

  const urgencyLevels = ['Low', 'Medium', 'High', 'Critical'];
  const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('/issues', formData);
      
      if (response.data.success) {
        toast({
          title: 'Success',
          description: 'Legal issue posted successfully!',
          variant: 'default',
        });
        
        // Reset form
        setFormData({
          title: '',
          description: '',
          category: '',
          urgency: '',
          budget: { min: 0, max: 0, currency: 'USD' },
          location: { city: '', state: '', country: '' },
          tags: [],
          isAnonymous: false
        });

        // Call the callback to notify parent component
        if (onIssuePosted) {
          onIssuePosted();
        }
      }
    } catch (error: any) {
      console.error('Error posting issue:', error);
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to post issue. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">
            Post Your Legal Issue
          </CardTitle>
          <CardDescription className="text-lg">
            Share your legal problem and get expert advice from qualified lawyers
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Issue Title *</Label>
              <Input
                id="title"
                placeholder="Brief description of your legal issue"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
                className="text-lg"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Detailed Description *</Label>
              <Textarea
                id="description"
                placeholder="Provide a detailed explanation of your legal situation, including relevant facts, timeline, and any documents you have..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
                rows={6}
                className="text-base"
              />
            </div>

            {/* Category and Urgency */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Legal Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select legal category" />
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

              <div className="space-y-2">
                <Label htmlFor="urgency">Urgency Level *</Label>
                <Select
                  value={formData.urgency}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, urgency: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select urgency level" />
                  </SelectTrigger>
                  <SelectContent>
                    {urgencyLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Budget */}
            <div className="space-y-2">
              <Label>Budget Range (Optional)</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="minBudget">Minimum</Label>
                  <Input
                    id="minBudget"
                    type="number"
                    placeholder="0"
                    value={formData.budget.min || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      budget: { ...prev.budget, min: parseFloat(e.target.value) || 0 }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="maxBudget">Maximum</Label>
                  <Input
                    id="maxBudget"
                    type="number"
                    placeholder="10000"
                    value={formData.budget.max || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      budget: { ...prev.budget, max: parseFloat(e.target.value) || 0 }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={formData.budget.currency}
                    onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      budget: { ...prev.budget, currency: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency} value={currency}>
                          {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label>Location (Optional)</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="City"
                    value={formData.location.city}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      location: { ...prev.location, city: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    placeholder="State/Province"
                    value={formData.location.state}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      location: { ...prev.location, state: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    placeholder="Country"
                    value={formData.location.country}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      location: { ...prev.location, country: e.target.value }
                    }))}
                  />
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag and press Enter"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button type="button" onClick={addTag} variant="outline" size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Anonymous Option */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="anonymous"
                checked={formData.isAnonymous}
                onChange={(e) => setFormData(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="anonymous">Post anonymously</Label>
            </div>

            {/* Info Alert */}
            <div className="flex items-start space-x-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Tips for better responses:</p>
                <ul className="mt-1 list-disc list-inside space-y-1">
                  <li>Be specific about your legal situation</li>
                  <li>Include relevant dates and facts</li>
                  <li>Mention any documents or evidence you have</li>
                  <li>Set a realistic budget range</li>
                </ul>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-center">
            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="w-full md:w-auto px-8"
            >
              {loading ? 'Posting Issue...' : 'Post Legal Issue'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default PostIssue;

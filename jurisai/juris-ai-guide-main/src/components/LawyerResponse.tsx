import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Briefcase, 
  Clock, 
  DollarSign, 
  Award, 
  Star,
  Plus,
  X,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import axios from '../axios';

interface LawyerResponseProps {
  issueId: string;
  issueTitle: string;
  onResponseSubmitted: () => void;
  onCancel: () => void;
}

interface ResponseFormData {
  content: string;
  approach: string;
  estimatedTime: string;
  estimatedCost: {
    amount: number;
    currency: string;
    description: string;
  };
  qualifications: string[];
  experience: {
    years: number;
    description: string;
  };
}

const LawyerResponse: React.FC<LawyerResponseProps> = ({
  issueId,
  issueTitle,
  onResponseSubmitted,
  onCancel
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [newQualification, setNewQualification] = useState('');
  const [formData, setFormData] = useState<ResponseFormData>({
    content: '',
    approach: '',
    estimatedTime: '',
    estimatedCost: {
      amount: 0,
      currency: 'USD',
      description: ''
    },
    qualifications: [],
    experience: {
      years: 0,
      description: ''
    }
  });

  const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('/responses', {
        issueId,
        ...formData
      });
      
      if (response.data.success) {
        toast({
          title: 'Success',
          description: 'Your response has been posted successfully!',
          variant: 'default',
        });
        onResponseSubmitted();
      }
    } catch (error: any) {
      console.error('Error posting response:', error);
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to post response. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addQualification = () => {
    if (newQualification.trim() && !formData.qualifications.includes(newQualification.trim())) {
      setFormData(prev => ({
        ...prev,
        qualifications: [...prev.qualifications, newQualification.trim()]
      }));
      setNewQualification('');
    }
  };

  const removeQualification = (qualificationToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      qualifications: prev.qualifications.filter(qual => qual !== qualificationToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addQualification();
    }
  };

  return (
    <Card className="max-w-4xl mx-auto shadow-xl">
      <CardHeader className="text-center border-b">
        <CardTitle className="text-2xl font-bold text-primary">
          Provide Legal Response
        </CardTitle>
        <CardDescription className="text-lg">
          Share your legal approach and expertise for this issue
        </CardDescription>
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <p className="font-medium text-sm">Responding to:</p>
          <p className="text-sm text-muted-foreground">{issueTitle}</p>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 p-6">
          {/* Legal Analysis */}
          <div className="space-y-2">
            <Label htmlFor="content" className="text-base font-semibold">
              Legal Analysis & Response *
            </Label>
            <Textarea
              id="content"
              placeholder="Provide a comprehensive legal analysis of the issue, including relevant laws, precedents, and your professional opinion..."
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              required
              rows={6}
              className="text-base"
            />
          </div>

          {/* Legal Approach */}
          <div className="space-y-2">
            <Label htmlFor="approach" className="text-base font-semibold">
              Legal Approach *
            </Label>
            <Textarea
              id="approach"
              placeholder="Briefly describe your recommended legal strategy and approach to resolve this issue..."
              value={formData.approach}
              onChange={(e) => setFormData(prev => ({ ...prev, approach: e.target.value }))}
              required
              rows={3}
              className="text-base"
            />
          </div>

          {/* Estimated Time and Cost */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="estimatedTime" className="text-base font-semibold">
                Estimated Time to Resolution
              </Label>
              <Input
                id="estimatedTime"
                placeholder="e.g., 2-3 weeks, 1-2 months"
                value={formData.estimatedTime}
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedTime: e.target.value }))}
                className="text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="costAmount" className="text-base font-semibold">
                Estimated Cost
              </Label>
              <div className="flex gap-2">
                <Input
                  id="costAmount"
                  type="number"
                  placeholder="Amount"
                  value={formData.estimatedCost.amount || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    estimatedCost: { ...prev.estimatedCost, amount: parseFloat(e.target.value) || 0 }
                  }))}
                  className="flex-1"
                />
                <select
                  value={formData.estimatedCost.currency}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    estimatedCost: { ...prev.estimatedCost, currency: e.target.value }
                  }))}
                  className="px-3 py-2 border border-input rounded-md bg-background"
                >
                  {currencies.map((currency) => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Cost Description */}
          <div className="space-y-2">
            <Label htmlFor="costDescription" className="text-base font-semibold">
              Cost Breakdown & Description
            </Label>
            <Textarea
              id="costDescription"
              placeholder="Explain what the estimated cost covers (e.g., consultation fees, court filing fees, document preparation, etc.)..."
              value={formData.estimatedCost.description}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                estimatedCost: { ...prev.estimatedCost, description: e.target.value }
              }))}
              rows={3}
              className="text-base"
            />
          </div>

          {/* Experience */}
          <div className="space-y-2">
            <Label htmlFor="experienceYears" className="text-base font-semibold">
              Years of Legal Experience
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  id="experienceYears"
                  type="number"
                  placeholder="Number of years"
                  value={formData.experience.years || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    experience: { ...prev.experience, years: parseInt(e.target.value) || 0 }
                  }))}
                  className="text-base"
                />
              </div>
              <div>
                <Input
                  id="experienceDescription"
                  placeholder="Brief description of your experience"
                  value={formData.experience.description}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    experience: { ...prev.experience, description: e.target.value }
                  }))}
                  className="text-base"
                />
              </div>
            </div>
          </div>

          {/* Qualifications */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Professional Qualifications</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a qualification and press Enter"
                value={newQualification}
                onChange={(e) => setNewQualification(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button type="button" onClick={addQualification} variant="outline" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.qualifications.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.qualifications.map((qualification, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {qualification}
                    <button
                      type="button"
                      onClick={() => removeQualification(qualification)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Info Alert */}
          <div className="flex items-start space-x-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Tips for better responses:</p>
              <ul className="mt-1 list-disc list-inside space-y-1">
                <li>Be specific about your legal approach and strategy</li>
                <li>Provide realistic time and cost estimates</li>
                <li>Highlight relevant experience and qualifications</li>
                <li>Explain the cost breakdown clearly</li>
                <li>Show confidence in your ability to handle the case</li>
              </ul>
            </div>
          </div>
        </CardContent>

        <Separator />

        <CardFooter className="flex justify-between p-6">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="lg"
            disabled={loading}
            className="px-8"
          >
            {loading ? 'Posting Response...' : 'Post Legal Response'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default LawyerResponse;

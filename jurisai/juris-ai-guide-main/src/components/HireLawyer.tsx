import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Briefcase, 
  Clock, 
  DollarSign, 
  Award, 
  Star,
  CheckCircle,
  AlertCircle,
  Calendar,
  User,
  FileText
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import axios from '../axios';

interface HireLawyerProps {
  response: any;
  issue: any;
  onHireCompleted: () => void;
  onCancel: () => void;
}

interface ContractFormData {
  amount: number;
  currency: string;
  paymentSchedule: string;
  milestones: Array<{
    description: string;
    amount: number;
    dueDate: string;
  }>;
  startDate: string;
  endDate: string;
}

const HireLawyer: React.FC<HireLawyerProps> = ({
  response,
  issue,
  onHireCompleted,
  onCancel
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showMilestones, setShowMilestones] = useState(false);
  const [newMilestone, setNewMilestone] = useState({
    description: '',
    amount: 0,
    dueDate: ''
  });
  const [formData, setFormData] = useState<ContractFormData>({
    amount: response.estimatedCost?.amount || 0,
    currency: response.estimatedCost?.currency || 'USD',
    paymentSchedule: 'Upfront',
    milestones: [],
    startDate: '',
    endDate: ''
  });

  const paymentSchedules = [
    { value: 'Upfront', label: 'Upfront Payment' },
    { value: 'Milestone', label: 'Milestone-based' },
    { value: 'Upon Completion', label: 'Upon Completion' }
  ];

  const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const contractTerms = {
        amount: formData.amount,
        currency: formData.currency,
        paymentSchedule: formData.paymentSchedule,
        milestones: formData.paymentSchedule === 'Milestone' ? formData.milestones : [],
        startDate: formData.startDate ? new Date(formData.startDate) : new Date(),
        endDate: formData.endDate ? new Date(formData.endDate) : undefined
      };

      const hireResponse = await axios.post('/hire', {
        responseId: response._id,
        contractTerms
      });
      
      if (hireResponse.data.success) {
        toast({
          title: 'Success',
          description: 'Lawyer hired successfully! You can now communicate and track your case.',
          variant: 'default',
        });
        onHireCompleted();
      }
    } catch (error: any) {
      console.error('Error hiring lawyer:', error);
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to hire lawyer. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addMilestone = () => {
    if (newMilestone.description && newMilestone.amount > 0 && newMilestone.dueDate) {
      setFormData(prev => ({
        ...prev,
        milestones: [...prev.milestones, { ...newMilestone }]
      }));
      setNewMilestone({ description: '', amount: 0, dueDate: '' });
    }
  };

  const removeMilestone = (index: number) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index)
    }));
  };

  const calculateTotalMilestones = () => {
    return formData.milestones.reduce((total, milestone) => total + milestone.amount, 0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card className="max-w-4xl mx-auto shadow-xl">
      <CardHeader className="text-center border-b">
        <CardTitle className="text-2xl font-bold text-primary">
          Hire Lawyer
        </CardTitle>
        <CardDescription className="text-lg">
          Complete the hiring process and start working with your chosen lawyer
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 p-6">
          {/* Lawyer Response Summary */}
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              Lawyer Response Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Lawyer:</span> {response.lawyer.username}
              </div>
              <div>
                <span className="font-medium">Experience:</span> {response.experience?.years || 'N/A'} years
              </div>
              <div>
                <span className="font-medium">Approach:</span> {response.approach}
              </div>
              <div>
                <span className="font-medium">Estimated Time:</span> {response.estimatedTime || 'N/A'}
              </div>
            </div>
          </div>

          {/* Issue Summary */}
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Legal Issue Summary
            </h3>
            <div className="text-sm">
              <div className="font-medium mb-2">{issue.title}</div>
              <div className="text-muted-foreground">
                {issue.description.length > 150 
                  ? `${issue.description.substring(0, 150)}...` 
                  : issue.description
                }
              </div>
            </div>
          </div>

          <Separator />

          {/* Contract Terms */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contract Terms</h3>
            
            {/* Payment Amount */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-base font-semibold">
                  Contract Amount *
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Amount"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      amount: parseFloat(e.target.value) || 0 
                    }))}
                    required
                    className="flex-1"
                  />
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      currency: e.target.value
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

              <div className="space-y-2">
                <Label htmlFor="paymentSchedule" className="text-base font-semibold">
                  Payment Schedule *
                </Label>
                <Select
                  value={formData.paymentSchedule}
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    paymentSchedule: value 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentSchedules.map((schedule) => (
                      <SelectItem key={schedule.value} value={schedule.value}>
                        {schedule.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Milestones */}
            {formData.paymentSchedule === 'Milestone' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Payment Milestones</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMilestones(!showMilestones)}
                  >
                    {showMilestones ? 'Hide' : 'Add Milestone'}
                  </Button>
                </div>

                {showMilestones && (
                  <div className="border rounded-lg p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Description</Label>
                        <Input
                          placeholder="Milestone description"
                          value={newMilestone.description}
                          onChange={(e) => setNewMilestone(prev => ({
                            ...prev,
                            description: e.target.value
                          }))}
                        />
                      </div>
                      <div>
                        <Label>Amount</Label>
                        <Input
                          type="number"
                          placeholder="Amount"
                          value={newMilestone.amount || ''}
                          onChange={(e) => setNewMilestone(prev => ({
                            ...prev,
                            amount: parseFloat(e.target.value) || 0
                          }))}
                        />
                      </div>
                      <div>
                        <Label>Due Date</Label>
                        <Input
                          type="date"
                          value={newMilestone.dueDate}
                          onChange={(e) => setNewMilestone(prev => ({
                            ...prev,
                            dueDate: e.target.value
                          }))}
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={addMilestone}
                      variant="outline"
                      size="sm"
                      disabled={!newMilestone.description || !newMilestone.amount || !newMilestone.dueDate}
                    >
                      Add Milestone
                    </Button>
                  </div>
                )}

                {formData.milestones.length > 0 && (
                  <div className="space-y-2">
                    {formData.milestones.map((milestone, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{milestone.description}</div>
                          <div className="text-sm text-muted-foreground">
                            {formData.currency} {milestone.amount} - Due: {formatDate(milestone.dueDate)}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMilestone(index)}
                          className="text-destructive"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <div className="text-right font-medium">
                      Total Milestones: {formData.currency} {calculateTotalMilestones()}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-base font-semibold">
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    startDate: e.target.value 
                  }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-base font-semibold">
                  Expected End Date (Optional)
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    endDate: e.target.value 
                  }))}
                />
              </div>
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Important Information:</p>
                <ul className="mt-1 list-disc list-inside space-y-1">
                  <li>Review all terms carefully before hiring</li>
                  <li>Ensure payment schedule aligns with your budget</li>
                  <li>Communicate clearly with your lawyer about expectations</li>
                  <li>Keep records of all payments and communications</li>
                </ul>
              </div>
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
            {loading ? 'Processing...' : 'Hire Lawyer'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default HireLawyer;
